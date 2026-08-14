export function canRemoveCollaborationLayer(input: {
  projectOwnerId: number | null | undefined;
  layerUploaderId: number;
  requestingUserId: number;
}) {
  return input.projectOwnerId === input.requestingUserId || input.layerUploaderId === input.requestingUserId;
}
