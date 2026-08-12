export const TRACK_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

export type UploadFileLike = {
  mimetype: string;
  size: number;
};

export function validateTrackUpload(file: UploadFileLike | undefined, title: string): string | null {
  if (!file) return "Audio file is required";
  if (!title.trim()) return "Track title is required";
  if (!file.mimetype.startsWith("audio/")) return "Only audio files are supported";
  if (file.size > TRACK_UPLOAD_MAX_BYTES) return "Audio file exceeds the 100MB limit";
  return null;
}

