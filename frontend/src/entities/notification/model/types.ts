/**
 * Notification Types
 * TypeScript types for notification management
 */

/**
 * Notification type enumeration
 */
export type NotificationType =
  | 'MESSAGE'
  | 'EVENT'
  | 'MATERIAL'
  | 'SCHEDULE_CHANGE'
  | 'REMINDER'

/**
 * Notification entity
 */
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  content: string
  action_url?: string | null
  read: boolean
  sent_push: boolean
  sent_email: boolean
  sent_sms: boolean
  scheduled_for?: string | null
  sent_at?: string | null
  created_at: string
}

/**
 * Notification preferences entity
 */
export interface NotificationPreferences {
  id: string
  user_id: string
  message_notifications: boolean
  event_notifications: boolean
  material_notifications: boolean
  reminder_notifications: boolean
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

/**
 * Notification filters for querying
 */
export interface NotificationFilters {
  type?: NotificationType
  read?: boolean
  page?: number
  size?: number
}

/**
 * Notification preferences form data
 */
export interface NotificationPreferencesFormData {
  message_notifications?: boolean
  event_notifications?: boolean
  material_notifications?: boolean
  reminder_notifications?: boolean
  email_enabled?: boolean
  sms_enabled?: boolean
  push_enabled?: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
}

/**
 * Unread notifications response
 */
export interface UnreadNotificationsResponse {
  data: Notification[]
  total: number
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number
}

/**
 * Send notification request
 */
export interface SendNotificationRequest {
  user_id: string
  type: NotificationType
  title: string
  content: string
  action_url?: string | null
  send_push?: boolean
  send_email?: boolean
  send_sms?: boolean
  scheduled_for?: string | null
}
