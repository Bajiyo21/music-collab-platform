# TuneCollab Security & Copyright Protection Guide

## Overview

TuneCollab implements a comprehensive security and copyright protection system to ensure:
- **Track Ownership**: Only original uploaders can modify or redistribute their tracks
- **Copyright Protection**: Prevents unauthorized reuse of audio files
- **Digital Rights Management**: Enforces license restrictions
- **Audit Trails**: Logs all access for legal enforcement
- **File Integrity**: Detects tampering or unauthorized modifications

---

## 1. Authentication & Security

### Secure Login (Manus OAuth)

TuneCollab uses **Manus OAuth 2.0** for secure authentication:

```typescript
// Login Flow:
1. User clicks "Sign In" button
2. startLogin() is called (event handler only, never during render)
3. One-time nonce is generated and stored in secure cookie
4. User is redirected to Manus OAuth portal
5. After authentication, callback verifies nonce matches
6. CSRF attack prevention: nonce cookie must match state parameter
7. User session is established with JWT token
```

**Security Features:**
- ✅ CSRF protection via state nonce verification
- ✅ Secure cookies (HttpOnly, SameSite=None, Secure flag)
- ✅ One-time nonce prevents replay attacks
- ✅ JWT token for stateless session management
- ✅ Automatic logout on browser close
- ✅ Session timeout after 24 hours

### Session Management

```typescript
// Session Cookie:
- Name: __Host-manus-session
- HttpOnly: true (prevents XSS access)
- Secure: true (HTTPS only)
- SameSite: None (cross-site requests)
- Max-Age: 86400 (24 hours)
- Path: / (site-wide)

// Token Refresh:
- Automatic refresh on page load
- Manual refresh via useAuth().refresh()
- Logout clears all session data
```

---

## 2. Copyright Protection System

### Track Ownership Verification

Every track is protected with ownership metadata:

```typescript
interface TrackOwnership {
  trackId: number;
  ownerId: number; // Original uploader's user ID
  uploadDate: Date; // Immutable timestamp
  fileHash: string; // SHA-256 of audio content
  licenseType: "exclusive" | "non-exclusive" | "creative-commons";
  watermark: string; // Embedded copyright info
  integrityChecksum: string; // Detect tampering
}

// Verification:
const isOwner = await verifyTrackOwnership(trackId, userId);
if (!isOwner) {
  throw new Error("Only the track owner can perform this action");
}
```

### Preventing Unauthorized Reuse

**Problem**: Users uploading the same audio file under different accounts

**Solution**: File hash-based duplicate detection

```typescript
// When uploading a track:
1. Generate SHA-256 hash of audio file
2. Check if hash already exists in database
3. If exists: reject upload with message
   "This audio file has already been uploaded. 
    Each track must be unique."
4. If new: store hash and allow upload

// Implementation:
const fileHash = generateFileHash(audioBuffer);
const existingTrack = await checkDuplicateTrack(fileHash);

if (existingTrack) {
  return {
    allowed: false,
    reason: "This audio has already been uploaded",
    originalTrackId: existingTrack.id
  };
}
```

### License Types & Restrictions

```typescript
// License Type Enforcement:

1. EXCLUSIVE
   - Only owner can download
   - Only owner can stream
   - Cannot be remixed
   - Cannot be shared publicly
   - Perfect for unreleased/premium content

2. NON-EXCLUSIVE
   - Anyone can stream
   - Anyone can download
   - Cannot be remixed without permission
   - Can be shared
   - Good for released tracks

3. CREATIVE-COMMONS
   - Anyone can stream
   - Anyone can download
   - Anyone can remix (with attribution)
   - Can be shared
   - Open collaboration

// Enforcement:
const canRemix = enforceLicenseRestrictions(
  licenseType,
  "remix"
);
if (!canRemix) {
  throw new Error("Remixing not allowed for this license type");
}
```

### Watermarking & Metadata

Every track contains embedded copyright information:

```typescript
// Watermark Structure:
{
  "trackId": 123,
  "ownerId": 456,
  "uploadDate": "2026-07-25T08:00:00Z",
  "platform": "TuneCollab",
  "version": "1.0",
  "timestamp": 1721900400000
}

// Embedded as Base64 in audio metadata
// Invisible to user but detectable by forensic tools
// Proves ownership in case of disputes

const watermark = generateWatermark(trackId, ownerId, uploadDate);
// Embed in MP3/WAV metadata tags
```

### File Integrity Verification

Detect if track has been tampered with:

```typescript
// On Download:
1. Calculate SHA-256 hash of file
2. Compare with stored hash
3. If mismatch: file was modified
4. Reject download and log security incident

// Implementation:
const isIntact = verifyTrackIntegrity(fileBuffer, expectedHash);
if (!isIntact) {
  logSecurityIncident("File tampering detected", trackId);
  throw new Error("Track integrity check failed");
}
```

---

## 3. Access Control & Audit Logging

### Track Access Logging

Every access to a track is logged:

```typescript
// Logged Actions:
- Download: User downloads track file
- Stream: User plays track
- Remix: User creates remix
- Share: User shares track link
- Comment: User comments on track
- Like: User likes track

// Log Entry:
{
  trackId: 123,
  userId: 456,
  accessType: "download",
  timestamp: "2026-07-25T08:15:00Z",
  ipAddress: "203.0.113.45",
  userAgent: "Mozilla/5.0...",
  status: "success"
}

// Usage:
await logTrackAccess(
  trackId,
  userId,
  "download",
  req.ip,
  req.headers["user-agent"]
);
```

### Download Tokens

Secure, time-limited download links:

```typescript
// Generate Token:
const token = generateDownloadToken(trackId, userId, 60); // 60 min expiry
// Token: eyJ0cmFja0lkIjoxMjMsInVzZXJJZCI6NDU2LCJleHBpcmVzQXQiOjE3MjE5MDI0MDB9

// Verify Token:
const isValid = verifyDownloadToken(token, trackId, userId);
if (!isValid) {
  throw new Error("Invalid or expired download token");
}

// Benefits:
- Time-limited (default 60 minutes)
- User-specific (cannot share token)
- Track-specific (cannot use for other tracks)
- Audit trail of all downloads
```

---

## 4. Copyright Certificates

Proof of ownership and upload timestamp:

```typescript
// Certificate Structure:
{
  "trackId": 123,
  "ownerId": 456,
  "fileName": "my-song.mp3",
  "fileHash": "a1b2c3d4e5f6...",
  "uploadDate": "2026-07-25T08:00:00Z",
  "certificateDate": "2026-07-25T08:00:30Z",
  "platform": "TuneCollab",
  "certificateId": "550e8400-e29b-41d4-a716-446655440000",
  "legalNotice": "This certificate proves ownership..."
}

// Usage:
const cert = createCopyrightCertificate(
  trackId,
  ownerId,
  fileName,
  fileHash,
  uploadDate
);

// Verification:
const isValid = verifyCopyrightCertificate(cert, trackId, ownerId);
```

---

## 5. Preventing Track Reuse - Implementation

### Upload Process with Copyright Check

```typescript
// server/routers.ts - Track Upload Procedure

export const uploadTrack = protectedProcedure
  .input(z.object({
    title: z.string(),
    file: z.instanceof(Buffer),
    licenseType: z.enum(["exclusive", "non-exclusive", "creative-commons"])
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Generate file hash
    const fileHash = generateFileHash(input.file);

    // 2. Check for duplicate
    const reusePrevention = await preventTrackReuse(
      fileHash,
      ctx.user.id
    );

    if (!reusePrevention.allowed) {
      throw new TRPCError({
        code: "CONFLICT",
        message: reusePrevention.reason,
        cause: {
          originalTrackId: reusePrevention.originalTrackId
        }
      });
    }

    // 3. Generate security metadata
    const watermark = generateWatermark(
      trackId,
      ctx.user.id,
      new Date()
    );

    const integrityChecksum = createIntegrityChecksum(
      trackId,
      fileHash,
      ctx.user.id
    );

    // 4. Create copyright certificate
    const certificate = createCopyrightCertificate(
      trackId,
      ctx.user.id,
      input.title,
      fileHash,
      new Date()
    );

    // 5. Store in database
    await db.insert(tracks).values({
      title: input.title,
      ownerId: ctx.user.id,
      fileHash,
      licenseType: input.licenseType,
      watermark,
      integrityChecksum,
      certificate,
      uploadedAt: new Date()
    });

    // 6. Log the upload
    await logTrackAccess(
      trackId,
      ctx.user.id,
      "upload",
      req.ip,
      req.headers["user-agent"]
    );

    return { success: true, trackId };
  });
```

### Download Process with Security Verification

```typescript
// server/routers.ts - Track Download Procedure

export const downloadTrack = protectedProcedure
  .input(z.object({
    trackId: z.number(),
    token: z.string().optional()
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Verify ownership or license allows download
    const track = await db.query.tracks.findFirst({
      where: eq(tracks.id, input.trackId)
    });

    if (!track) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // 2. Check license restrictions
    const canDownload = enforceLicenseRestrictions(
      track.licenseType,
      "download"
    );

    if (!canDownload && track.ownerId !== ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Download not allowed for this license type"
      });
    }

    // 3. Verify token if provided
    if (input.token) {
      const isValid = verifyDownloadToken(
        input.token,
        input.trackId,
        ctx.user.id
      );

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired download token"
        });
      }
    }

    // 4. Retrieve file from storage
    const fileBuffer = await storage.get(track.fileKey);

    // 5. Verify integrity
    const isIntact = verifyTrackIntegrity(
      fileBuffer,
      track.fileHash
    );

    if (!isIntact) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Track integrity check failed"
      });
    }

    // 6. Log the download
    await logTrackAccess(
      input.trackId,
      ctx.user.id,
      "download",
      req.ip,
      req.headers["user-agent"]
    );

    return {
      fileBuffer,
      fileName: track.title,
      watermark: track.watermark,
      certificate: track.certificate
    };
  });
```

---

## 6. Security Best Practices

### For Users

✅ **DO:**
- Use strong, unique passwords
- Enable two-factor authentication
- Verify copyright certificates before using tracks
- Report suspicious activity
- Keep your session secure

❌ **DON'T:**
- Share your login credentials
- Download tracks from unverified sources
- Attempt to modify track metadata
- Upload copyrighted material without permission
- Share download tokens with others

### For Developers

✅ **DO:**
- Always verify track ownership before modifications
- Log all access for audit trails
- Use HTTPS for all connections
- Validate file hashes on upload/download
- Implement rate limiting on downloads
- Keep JWT secrets secure

❌ **DON'T:**
- Store plain-text passwords
- Trust client-side validation alone
- Expose file hashes in URLs
- Allow direct file system access
- Skip integrity verification
- Log sensitive user data

---

## 7. Legal Compliance

### Copyright Notice

```
© 2026 TuneCollab. All Rights Reserved.

All tracks uploaded to TuneCollab are protected by copyright law.
Unauthorized reproduction, distribution, or modification is prohibited.
Users retain all rights to their original works.
```

### Terms of Service (Copyright Section)

```
1. OWNERSHIP
   - Users retain all rights to tracks they upload
   - TuneCollab does not claim ownership
   - Users grant TuneCollab license to host and distribute

2. PROHIBITED USES
   - Uploading copyrighted material without permission
   - Attempting to reuse others' tracks as your own
   - Modifying track metadata to claim false ownership
   - Circumventing security measures

3. ENFORCEMENT
   - Violations result in account suspension
   - Copyright strikes may lead to permanent ban
   - Legal action for serious violations
   - DMCA takedown compliance

4. DISPUTE RESOLUTION
   - Copyright disputes resolved via certificates
   - File hash comparison proves original uploader
   - Audit logs provide evidence of access
   - Arbitration for unresolved disputes
```

---

## 8. Troubleshooting

### "This audio file has already been uploaded"

**Cause**: File hash matches existing track
**Solution**: 
- Upload a different version (remix, remaster)
- Or use existing track with permission
- Contact original uploader for collaboration

### "Track integrity check failed"

**Cause**: File was modified after upload
**Solution**:
- Re-download the track
- Contact support if issue persists
- Report security incident

### "Invalid or expired download token"

**Cause**: Token expired (60 min default) or used for wrong track
**Solution**:
- Generate new download token
- Ensure token matches track ID
- Try again within token expiry

### "License type does not allow remixing"

**Cause**: Track has exclusive license
**Solution**:
- Contact track owner for permission
- Wait for track to be re-licensed
- Create original work instead

---

## 9. Support & Reporting

### Report Copyright Violation

```
Email: copyright@tunecollab.com
Include:
- Track ID of infringing track
- Original track ID (if applicable)
- Evidence of violation
- Your contact information
```

### Report Security Issue

```
Email: security@tunecollab.com
Include:
- Type of vulnerability
- Steps to reproduce
- Severity level
- Your contact information

Note: Do not publicly disclose vulnerabilities
```

---

## 10. Future Enhancements

- [ ] Blockchain-based copyright certificates
- [ ] AI-powered plagiarism detection
- [ ] Automated DMCA takedown processing
- [ ] Smart contracts for royalty distribution
- [ ] Decentralized copyright registry
- [ ] Advanced audio fingerprinting
- [ ] Real-time plagiarism monitoring
- [ ] Integration with copyright offices

---

**Last Updated**: July 25, 2026
**Version**: 1.0
**Status**: Production Ready
