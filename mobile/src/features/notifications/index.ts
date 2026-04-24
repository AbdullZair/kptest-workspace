export { notificationApi } from './api/notificationApi';
export {
  useGetNotificationSettingsQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateQuietHoursMutation,
  useRegisterPushTokenMutation,
  useUnregisterPushTokenMutation,
  useMarkAllAsReadMutation,
  useGetBadgeCountQuery,
  useUpdateBadgeCountMutation,
} from './api/notificationApi';
export type {
  NotificationPreferences,
  NotificationCategoryPreferences,
  QuietHours,
  NotificationSettings,
  PushNotificationPayload,
  NotificationType,
  NotificationChannel,
  NotificationPermission,
} from './api/types';
