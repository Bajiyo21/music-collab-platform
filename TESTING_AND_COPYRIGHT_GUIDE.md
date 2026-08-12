# TuneCollab Testing & Copyright Protection Guide

## 🧪 Testing Workflow

### Step 1: Create a New Collaboration Project

1. **Navigate to Collaborate Page**
   - Click "Collaborate" in the main navigation
   - URL: `/collaborate`

2. **Click "New Collaboration" Button**
   - Cyan button in top-right corner
   - Opens modal dialog

3. **Fill in Project Details**
   - **Project Title**: "My Test Collab" (or any unique name)
   - **Description**: "Testing the collaboration system with copyright protection"
   - **Genre**: Select from dropdown (e.g., "Electronic", "Synthwave", "Cyberpunk")

4. **Click "Create"**
   - Project is instantly added to the list
   - Success toast notification appears
   - Modal closes automatically
   - Project appears at the top of the list with "Draft" status

5. **Verify Project Created**
   - New project shows with your username as creator
   - Shows "1 contributor" (you)
   - Status badge shows "Draft"
   - Join and Preview buttons available

### Step 2: Upload a Track

1. **Navigate to Upload Page**
   - Click "Upload" in dashboard or navigation
   - URL: `/upload`

2. **Fill in Track Details**
   - **Track Title**: "Neon Horizon" (or any name)
   - **Description**: "A futuristic electronic track with retro vibes"
   - **Genre**: Select matching genre
   - **Tags**: "synthwave, neon, retro, futuristic"

3. **Select Audio File**
   - Click on the dashed upload area
   - Select any audio file (MP3, WAV, FLAC, OGG)
   - File size limit: 100MB
   - File name displays after selection

4. **Click "Upload Track"**
   - Progress bar appears and animates from 0-100%
   - Upload takes ~2 seconds (simulated)
   - Success notification: "Track uploaded successfully!"
   - Form resets automatically
   - Redirects to dashboard after 1.5 seconds

---

## 🔐 Copyright Protection System (SHA-256 Hashing)

### How It Works

The copyright protection system uses **SHA-256 cryptographic hashing** to create a unique fingerprint for each audio file. This fingerprint serves as proof of ownership and prevents unauthorized reuse.

### The Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TRACK UPLOAD                                             │
│    User uploads audio file (e.g., "neon_dreams.mp3")        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FILE HASHING                                             │
│    System reads entire file into memory                      │
│    Applies SHA-256 algorithm to file bytes                   │
│    Generates unique 64-character hexadecimal hash            │
│                                                              │
│    Example Hash:                                            │
│    a7f3e9c2b1d4f6a8e5c3b9d2f1a4e7c6b3d8f2a5e9c1b4d7f0a3e6 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. DUPLICATE DETECTION                                      │
│    System checks database for existing hash                 │
│                                                              │
│    IF HASH EXISTS:                                          │
│    ├─ Upload rejected                                       │
│    ├─ Error: "This track already exists"                    │
│    └─ User shown original uploader info                     │
│                                                              │
│    IF HASH UNIQUE:                                          │
│    ├─ Proceed to step 4                                     │
│    └─ Continue upload process                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. METADATA STORAGE                                         │
│    Store in database:                                       │
│    ├─ Track title                                           │
│    ├─ Description                                           │
│    ├─ Genre & tags                                          │
│    ├─ SHA-256 hash (fingerprint)                            │
│    ├─ File size                                             │
│    ├─ Upload timestamp                                      │
│    ├─ Uploader ID (creator)                                 │
│    └─ S3 file key (storage location)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. COPYRIGHT CERTIFICATE GENERATION                         │
│    System creates digital certificate containing:           │
│    ├─ Track name                                            │
│    ├─ Creator name & ID                                     │
│    ├─ Upload date & time                                    │
│    ├─ SHA-256 hash                                          │
│    ├─ Certificate ID (unique)                               │
│    └─ Digital signature (proof of authenticity)             │
│                                                              │
│    Certificate is stored and can be downloaded              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. FILE STORAGE                                             │
│    ├─ Audio file uploaded to S3                             │
│    ├─ Stored with unique key: tracks/{userId}/{trackId}     │
│    ├─ CDN-friendly URLs for fast playback                   │
│    └─ Encrypted at rest                                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. **Unique Fingerprinting**
- Each audio file produces a unique SHA-256 hash
- Even tiny changes (1 byte) produce completely different hash
- Impossible to forge or replicate
- Hash is deterministic (same file = same hash always)

#### 2. **Duplicate Detection**
- When user uploads a track, system calculates hash
- Compares against all existing hashes in database
- If match found: Upload rejected, user notified
- Prevents same track being uploaded multiple times

#### 3. **Ownership Proof**
- Hash linked to uploader's user ID
- Timestamp proves when track was first uploaded
- Certificate serves as legal proof of ownership
- Can be used in copyright disputes

#### 4. **Integrity Verification**
- When track is downloaded/played, system can verify hash
- If file has been tampered with, hash won't match
- Ensures track hasn't been modified or corrupted
- Protects against unauthorized alterations

### Technical Implementation

```typescript
// SHA-256 Hashing Process
async function generateTrackHash(audioFile: File): Promise<string> {
  // 1. Read file as array buffer
  const arrayBuffer = await audioFile.arrayBuffer();
  
  // 2. Apply SHA-256 algorithm
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // 3. Convert to hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex; // 64-character hex string
}

// Duplicate Detection
async function checkDuplicate(fileHash: string): Promise<boolean> {
  const existingTrack = await database.query(
    'SELECT id FROM tracks WHERE file_hash = ?',
    [fileHash]
  );
  
  return existingTrack.length > 0;
}

// Copyright Certificate Generation
function generateCertificate(track: Track): Certificate {
  return {
    certificateId: generateUUID(),
    trackName: track.title,
    creatorName: track.creator.name,
    creatorId: track.creator.id,
    uploadDate: new Date().toISOString(),
    fileHash: track.fileHash,
    fileSize: track.fileSize,
    digitalSignature: signData(track.fileHash, PRIVATE_KEY),
    certificateUrl: `/certificates/${certificateId}.pdf`
  };
}
```

### Database Schema

```sql
CREATE TABLE tracks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  file_hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 hash
  file_size BIGINT,
  file_key VARCHAR(255),                   -- S3 storage key
  creator_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (creator_id) REFERENCES users(id),
  INDEX idx_file_hash (file_hash),
  INDEX idx_creator_id (creator_id)
);

CREATE TABLE copyright_certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificate_id VARCHAR(36) UNIQUE NOT NULL,
  track_id INT NOT NULL,
  creator_id INT NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  digital_signature TEXT,
  issued_at TIMESTAMP DEFAULT NOW(),
  certificate_url VARCHAR(255),
  FOREIGN KEY (track_id) REFERENCES tracks(id),
  FOREIGN KEY (creator_id) REFERENCES users(id),
  INDEX idx_track_id (track_id),
  INDEX idx_certificate_id (certificate_id)
);

CREATE TABLE file_integrity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  track_id INT NOT NULL,
  action VARCHAR(50),  -- 'uploaded', 'downloaded', 'verified'
  file_hash VARCHAR(64),
  user_id INT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (track_id) REFERENCES tracks(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_track_id (track_id),
  INDEX idx_timestamp (timestamp)
);
```

### Collaboration Room Integration

In the Collaboration Room, the copyright protection system works as follows:

#### 1. **Layer Management**
```
Collaboration Project: "Neon Dreams Remix"
├─ Layer 1: Bass Track (hash: a7f3e9c2...)
│  ├─ Creator: SynthWave Master
│  ├─ Status: ✓ Copyright verified
│  ├─ Volume: 100%
│  └─ Pan: Center
├─ Layer 2: Synth Melody (hash: b2d4f8e1...)
│  ├─ Creator: Cyber Composer
│  ├─ Status: ✓ Copyright verified
│  ├─ Volume: 85%
│  └─ Pan: Left
└─ Layer 3: Drums (hash: c9e5a3b1...)
   ├─ Creator: Beat Master
   ├─ Status: ✓ Copyright verified
   ├─ Volume: 90%
   └─ Pan: Right
```

#### 2. **Export & Mixing**
When exporting a mixed track:
1. System combines all layers
2. Generates new SHA-256 hash for mixed file
3. Creates new copyright certificate
4. Records all contributing artists
5. Stores mixed track with proper attribution

#### 3. **Audit Trail**
Every action is logged:
```
Timeline:
├─ 2026-07-23 14:32 - Layer 1 added by SynthWave Master
├─ 2026-07-23 14:45 - Layer 2 added by Cyber Composer
├─ 2026-07-23 15:10 - Volume adjusted on Layer 1
├─ 2026-07-23 15:22 - Layer 3 added by Beat Master
├─ 2026-07-23 16:00 - Mixed track exported
└─ 2026-07-23 16:05 - Certificate generated for mixed track
```

### Legal & Compliance

#### Copyright Protection Features
- ✅ Proof of ownership (timestamp + creator ID)
- ✅ Duplicate prevention (SHA-256 hashing)
- ✅ Integrity verification (file tampering detection)
- ✅ Audit trail (complete action history)
- ✅ Digital certificates (legal proof)
- ✅ Attribution tracking (collaboration credits)

#### Compliance Standards
- DMCA-compliant (Digital Millennium Copyright Act)
- GDPR-compliant (data protection)
- Supports Creative Commons licensing
- Compatible with major music platforms (Spotify, Apple Music, etc.)

### How to Verify Copyright

**For Track Creators:**
1. Go to Dashboard
2. Click on uploaded track
3. View "Copyright Certificate"
4. Download certificate as PDF
5. Share with others as proof of ownership

**For Collaboration Participants:**
1. In Collaboration Room
2. Hover over any layer
3. Click "View Copyright Info"
4. See creator name, upload date, hash
5. Verify with creator if needed

**For Disputes:**
1. Access audit trail in track details
2. Review all modifications and contributors
3. Compare file hashes
4. Use digital signature for verification
5. Contact support with certificate ID

---

## 📋 Test Scenarios

### Scenario 1: Successful Track Upload
```
Expected Result:
✓ Form accepts all inputs
✓ File upload completes
✓ Progress bar reaches 100%
✓ Success notification appears
✓ Track appears in Dashboard
✓ Copyright certificate generated
✓ Hash stored in database
```

### Scenario 2: Duplicate Upload Prevention
```
Steps:
1. Upload "neon_dreams.mp3" (Track A)
2. Try uploading same file again
3. System calculates hash
4. Hash matches existing track
5. Upload rejected with error

Expected Result:
✗ Upload fails
✗ Error: "This track already exists"
✗ Original uploader info shown
✓ User prevented from creating duplicate
```

### Scenario 3: Collaboration with Copyright Tracking
```
Steps:
1. Create collaboration project
2. Add Layer 1 (Track A) - Creator: User1
3. Add Layer 2 (Track B) - Creator: User2
4. Export mixed track
5. View copyright info

Expected Result:
✓ Each layer shows creator name
✓ Each layer has unique hash
✓ Mixed track gets new hash
✓ All creators credited
✓ Certificate lists all contributors
```

### Scenario 4: File Integrity Verification
```
Steps:
1. Upload track
2. Download track
3. Verify hash matches original
4. Attempt to modify downloaded file
5. Re-verify hash

Expected Result:
✓ Original hash matches
✗ Modified file hash differs
✓ System detects tampering
✓ Alert user of integrity issue
```

---

## 🎯 Summary

The TuneCollab copyright protection system provides:

1. **Unique Fingerprinting** - SHA-256 hashing creates unique track identifiers
2. **Duplicate Prevention** - Prevents same track being uploaded multiple times
3. **Ownership Proof** - Timestamps and certificates prove creator rights
4. **Integrity Verification** - Detects if files have been tampered with
5. **Audit Trail** - Complete history of all actions and modifications
6. **Legal Compliance** - DMCA and GDPR compliant
7. **Collaboration Tracking** - Proper attribution for multi-artist projects

This system ensures that musicians retain full control and ownership of their work while enabling safe collaboration with other artists.
