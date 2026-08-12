import { describe, expect, it } from "vitest";
import { buildCollaborationNotificationRows } from "./notification-utils";

describe("collaboration notification payloads", () => {
  it("builds an invitation for the invited musician", () => {
    const rows = buildCollaborationNotificationRows({
      actorId: 10,
      memberIds: [22],
      type: "collab_invite",
      relatedCollabId: 7,
      title: "Collaboration invitation",
      message: "Join the session",
      actionUrl: "/collaboration/7",
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ recipientId: 22, type: "collab_invite", relatedUserId: 10, relatedCollabId: 7 });
  });

  it("notifies project members about a collaboration comment without notifying the author", () => {
    const rows = buildCollaborationNotificationRows({
      actorId: 10,
      creatorId: 10,
      memberIds: [10, 22, 31],
      type: "collab_comment",
      relatedCollabId: 7,
      title: "New collaboration comment",
      message: "Try a brighter snare",
      actionUrl: "/collaboration/7",
    });

    expect(rows.map((row) => row.recipientId)).toEqual([22, 31]);
    expect(rows.every((row) => row.type === "collab_comment")).toBe(true);
  });

  it("notifies the owner and members about a newly added layer exactly once", () => {
    const rows = buildCollaborationNotificationRows({
      actorId: 31,
      creatorId: 10,
      memberIds: [10, 22, 31],
      type: "collab_new_layer",
      relatedCollabId: 7,
      relatedTrackId: 88,
      title: "New collaboration layer",
      message: "A new stem was added",
      actionUrl: "/collaboration/7",
    });

    expect(rows.map((row) => row.recipientId)).toEqual([10, 22]);
    expect(rows[0]).toMatchObject({ type: "collab_new_layer", relatedTrackId: 88 });
  });
});
