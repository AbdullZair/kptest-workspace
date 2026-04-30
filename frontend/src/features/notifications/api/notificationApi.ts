import { api } from '@shared/api'
import type {
  Notification,
  NotificationPreferences,
  NotificationFilters,
  NotificationPreferencesFormData,
  UnreadCountResponse,
  SendNotificationRequest,
} from '@entities/notification'

/**
 * Notification API slice using RTK Query
 * Handles all notification-related endpoints
 */
export const notificationApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all notifications with filtering and pagination
     * @query
     */
    getNotifications: builder.query<Notification[], NotificationFilters>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters.type) params.append('type', filters.type)
        if (filters.read !== undefined) params.append('read', filters.read.toString())
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return {
          url: '/notifications',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    /**
     * Get unread notifications
     * @query
     */
    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => ({
        url: '/notifications/unread',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'UNREAD' },
            ]
          : [{ type: 'Notification', id: 'UNREAD' }],
    }),

    /**
     * Get unread count
     * @query
     */
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: '/notifications/count',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    /**
     * Mark notification as read
     * @mutation
     */
    markAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    /**
     * Mark all notifications as read
     * @mutation
     */
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    /**
     * Delete notification
     * @mutation
     */
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    /**
     * Get notification preferences
     * @query
     */
    getPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({
        url: '/me/notification-preferences',
        method: 'GET',
      }),
      providesTags: ['NotificationPreferences'],
    }),

    /**
     * Update notification preferences
     * @mutation
     */
    updatePreferences: builder.mutation<NotificationPreferences, NotificationPreferencesFormData>({
      query: (preferences) => ({
        url: '/me/notification-preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    /**
     * Send test notification
     * @mutation
     */
    sendTestNotification: builder.mutation<Notification, Partial<SendNotificationRequest>>({
      query: (notification) => ({
        url: '/notifications/test',
        method: 'POST',
        body: notification,
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useSendTestNotificationMutation,
  useLazyGetUnreadCountQuery,
} = notificationApiSlice

export default notificationApiSlice
