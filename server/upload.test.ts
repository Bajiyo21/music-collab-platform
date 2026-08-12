import { describe, expect, it } from "vitest";
import { TRACK_UPLOAD_MAX_BYTES, validateTrackUpload } from "./upload";

describe("track upload validation", () => {
  const validFile = { mimetype: "audio/mpeg", size: 1024 };

  it("accepts a valid audio upload", () => {
    expect(validateTrackUpload(validFile, "Midnight Signal")).toBeNull();
  });

  it("rejects an upload without a file", () => {
    expect(validateTrackUpload(undefined, "Midnight Signal")).toBe("Audio file is required");
  });

  it("rejects an upload without a title", () => {
    expect(validateTrackUpload(validFile, "   ")).toBe("Track title is required");
  });

  it("rejects non-audio MIME types", () => {
    expect(validateTrackUpload({ mimetype: "image/png", size: 1024 }, "Cover")).toBe(
      "Only audio files are supported",
    );
  });

  it("rejects audio files over the server limit", () => {
    expect(
      validateTrackUpload(
        { mimetype: "audio/wav", size: TRACK_UPLOAD_MAX_BYTES + 1 },
        "Oversized Take",
      ),
    ).toBe("Audio file exceeds the 100MB limit");
  });

  it("accepts an audio file exactly at the server limit", () => {
    expect(
      validateTrackUpload(
        { mimetype: "audio/flac", size: TRACK_UPLOAD_MAX_BYTES },
        "Limit Take",
      ),
    ).toBeNull();
  });
});
