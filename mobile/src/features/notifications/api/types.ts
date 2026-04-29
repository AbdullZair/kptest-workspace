export interface NotificationPreferences {
  enabled?: boolean;
  categories: NotificationCategoryPreferences;
  quietHours?: QuietHours;
}

export interface NotificationCategoryPreferences {
  messages: boolean;
  calendarEvents: boolean;
  newMaterials: boolean;
  projectUpdates: boolean;
  reminders: boolean;
  systemAnnouncements: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface NotificationSettings {
  preferences: NotificationPreferences;
  badgeCount: number;
  lastSyncAt: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    type: NotificationType;
    entityId?: string;
    projectId?: string;
    threadId?: string;
    materialId?: string;
    eventId?: string;
  };
  sound?: string;
  badge?: number;
}

export type NotificationType =
  | 'message'
  | 'calendar_reminder'
  | 'calendar_change'
  | 'new_material'
  | 'project_update'
  | 'system_announcement'
  | 'reminder';

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'high' | 'default' | 'low';
  sound?: string;
  vibration?: boolean;
  light?: boolean;
}

export interface NotificationPermission {
  status: 'granted' | 'denied' | 'undetermined';
  canShowBadge: boolean;
  canPlaySound: boolean;
  canAlert: boolean;
  canShowBanner: boolean;
}
