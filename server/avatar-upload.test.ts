import { describe, expect, it } from "vitest";
import { AVATAR_UPLOAD_MAX_BYTES, validateAvatarUpload } from "./avatar-upload";

describe("avatar upload validation", () => {
  it("accepts JPG, PNG, and WebP files within the size limit", () => {
    expect(validateAvatarUpload({ mimetype: "image/jpeg", size: 1024 })).toBeNull();
    expect(validateAvatarUpload({ mimetype: "image/png", size: 1024 })).toBeNull();
    expect(validateAvatarUpload({ mimetype: "image/webp", size: AVATAR_UPLOAD_MAX_BYTES })).toBeNull();
  });

  it("rejects missing and unsupported files", () => {
    expect(validateAvatarUpload(undefined)).toBe("Profile image is required");
    expect(validateAvatarUpload({ mimetype: "image/gif", size: 1024 })).toBe("Only JPG, PNG, and WebP images are supported");
  });

  it("rejects images above the 5MB limit", () => {
    expect(validateAvatarUpload({ mimetype: "image/png", size: AVATAR_UPLOAD_MAX_BYTES + 1 })).toBe("Profile image exceeds the 5MB limit");
  });
});
