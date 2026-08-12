export type CollaborationNotificationType = "collab_invite" | "collab_comment" | "collab_new_layer";

type CollaborationNotificationInput = {
  actorId: number;
  creatorId?: number | null;
  memberIds: number[];
  type: CollaborationNotificationType;
  relatedCollabId: number;
  relatedTrackId?: number;
  title: string;
  message: string;
  actionUrl: string;
};

export function buildCollaborationNotificationRows(input: CollaborationNotificationInput) {
  const recipientIds = Array.from(new Set([input.creatorId, ...input.memberIds]))
    .filter((recipientId): recipientId is number => Boolean(recipientId && recipientId !== input.actorId));

  return recipientIds.map((recipientId) => ({
    recipientId,
    type: input.type,
    relatedUserId: input.actorId,
    relatedTrackId: input.relatedTrackId,
    relatedCollabId: input.relatedCollabId,
    title: input.title,
    message: input.message,
    actionUrl: input.actionUrl,
  }));
}
