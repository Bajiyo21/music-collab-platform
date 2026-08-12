export const AVATAR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type AvatarFile = { mimetype?: string; size?: number } | undefined;

export function validateAvatarUpload(file: AvatarFile) {
  if (!file) return "Profile image is required";
  if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype ?? "")) {
    return "Only JPG, PNG, and WebP images are supported";
  }
  if ((file.size ?? 0) > AVATAR_UPLOAD_MAX_BYTES) {
    return "Profile image exceeds the 5MB limit";
  }
  return null;
}
