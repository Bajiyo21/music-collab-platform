export function canManageTrackComment(commentAuthorId: number, requestingUserId: number) {
  return commentAuthorId === requestingUserId;
}
