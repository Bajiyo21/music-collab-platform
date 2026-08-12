export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ImageUploadFile = { mimetype?: string; size?: number } | undefined;

export function validateImageUpload(file: ImageUploadFile, label: string) {
  if (!file) return `${label} is required`;
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype ?? "")) {
    return `${label} must be a JPG, PNG, or WebP image`;
  }
  if ((file.size ?? 0) > IMAGE_UPLOAD_MAX_BYTES) {
    return `${label} exceeds the 5MB limit`;
  }
  return null;
}
