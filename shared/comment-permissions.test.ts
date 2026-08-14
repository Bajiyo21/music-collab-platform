import { describe, expect, it } from "vitest";
import { canManageTrackComment } from "./comment-permissions";

describe("canManageTrackComment", () => {
  it("allows a comment author to update or delete their own feedback", () => {
    expect(canManageTrackComment(42, 42)).toBe(true);
  });

  it("rejects another user from managing someone else’s comment", () => {
    expect(canManageTrackComment(42, 7)).toBe(false);
  });
});
