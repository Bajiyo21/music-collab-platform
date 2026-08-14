export const notificationUnreadOnlyKey = "tunecollab:notifications:unread-only";

export type ReadableNotification = { isRead: boolean | null };

export function filterNotificationsByPreference<T extends ReadableNotification>(notifications: T[], unreadOnly: boolean) {
  return unreadOnly ? notifications.filter((notification) => !notification.isRead) : notifications;
}
