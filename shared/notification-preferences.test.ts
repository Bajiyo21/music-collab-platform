import { describe, expect, it } from "vitest";
import { filterNotificationsByPreference } from "./notification-preferences";

describe("filterNotificationsByPreference", () => {
  const notifications = [{ id: 1, isRead: false }, { id: 2, isRead: true }, { id: 3, isRead: false }];

  it("retains the complete feed when the all-activity preference is selected", () => {
    expect(filterNotificationsByPreference(notifications, false)).toEqual(notifications);
  });

  it("returns only unread activity when the inbox preference is enabled", () => {
    expect(filterNotificationsByPreference(notifications, true)).toEqual([{ id: 1, isRead: false }, { id: 3, isRead: false }]);
  });
});
