import { describe, expect, it } from "vitest";
import {
  generateFileHash,
  verifyTrackIntegrity,
  createIntegrityChecksum,
  verifyIntegrityChecksum,
} from "./security";

describe("copyright integrity helpers", () => {
  it("generates a deterministic SHA-256 hash for the same audio bytes", () => {
    const audio = Buffer.from("sample-audio-bytes");
    const hash = generateFileHash(audio);

    expect(hash).toHaveLength(64);
    expect(hash).toBe(generateFileHash(audio));
    expect(generateFileHash(Buffer.from("different-audio"))).not.toBe(hash);
  });

  it("detects modified content", () => {
    const original = Buffer.from("original-audio");
    const hash = generateFileHash(original);

    expect(verifyTrackIntegrity(original, hash)).toBe(true);
    expect(verifyTrackIntegrity(Buffer.from("modified-audio"), hash)).toBe(false);
  });

  it("validates ownership-bound integrity checksums", () => {
    const checksum = createIntegrityChecksum(12, "a".repeat(64), 7);

    expect(verifyIntegrityChecksum(12, "a".repeat(64), 7, checksum)).toBe(true);
    expect(verifyIntegrityChecksum(12, "b".repeat(64), 7, checksum)).toBe(false);
    expect(verifyIntegrityChecksum(12, "a".repeat(64), 8, checksum)).toBe(false);
  });
});

