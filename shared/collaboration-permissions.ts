export function canRemoveCollaborationLayer(input: {
  projectOwnerId: number | null | undefined;
  layerUploaderId: number;
  requestingUserId: number;
}) {
  return input.projectOwnerId === input.requestingUserId || input.layerUploaderId === input.requestingUserId;
}

export function canManageCollaboration(projectOwnerId: number | null | undefined, requestingUserId: number) {
  return projectOwnerId === requestingUserId;
}
