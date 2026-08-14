export type InvitationResponse = "accepted" | "declined";

export function getInvitationResolution(response: InvitationResponse, alreadyMember: boolean) {
  const accepted = response === "accepted";
  return {
    shouldAddContributor: accepted && !alreadyMember,
    shouldActivateCollaboration: accepted,
  };
}
