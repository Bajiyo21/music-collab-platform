import { describe, expect, it } from "vitest";
import { canRemoveCollaborationLayer } from "./collaboration-permissions";

describe("canRemoveCollaborationLayer", () => {
  it("allows a project owner to remove a contributor layer", () => {
    expect(canRemoveCollaborationLayer({ projectOwnerId: 10, layerUploaderId: 22, requestingUserId: 10 })).toBe(true);
  });

  it("allows the musician who added a layer to remove it", () => {
    expect(canRemoveCollaborationLayer({ projectOwnerId: 10, layerUploaderId: 22, requestingUserId: 22 })).toBe(true);
  });

  it("rejects an unrelated contributor from deleting another musician’s layer", () => {
    expect(canRemoveCollaborationLayer({ projectOwnerId: 10, layerUploaderId: 22, requestingUserId: 31 })).toBe(false);
  });
});
