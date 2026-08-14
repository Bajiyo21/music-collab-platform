import { describe, expect, it } from "vitest";
import { getInvitationResolution } from "./collaboration-flow";

describe("getInvitationResolution", () => {
  it("adds a new contributor and activates the project when an invitation is accepted", () => {
    expect(getInvitationResolution("accepted", false)).toEqual({
      shouldAddContributor: true,
      shouldActivateCollaboration: true,
    });
  });

  it("keeps an existing contributor unique while activating an accepted collaboration", () => {
    expect(getInvitationResolution("accepted", true)).toEqual({
      shouldAddContributor: false,
      shouldActivateCollaboration: true,
    });
  });

  it("does not add a contributor or alter the project state when an invitation is declined", () => {
    expect(getInvitationResolution("declined", false)).toEqual({
      shouldAddContributor: false,
      shouldActivateCollaboration: false,
    });
  });
});
