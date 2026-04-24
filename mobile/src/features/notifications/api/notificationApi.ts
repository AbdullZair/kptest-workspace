import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { NotificationPreferences, NotificationSettings } from './types';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: ['NotificationSettings', 'NotificationBadge'],
  endpoints: (builder) => ({
    // Get notification settings
    getNotificationSettings: builder.query<NotificationSettings, void>({
      query: () => ({
        url: '/notifications/settings',
        method: 'GET',
      }),
      providesTags: ['NotificationSettings', 'NotificationBadge'],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<
      NotificationSettings,
      NotificationPreferences
    >({
      query: (preferences) => ({
        url: '/notifications/settings/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    // Update quiet hours
    updateQuietHours: builder.mutation<NotificationSettings, { enabled: boolean; startTime: string; endTime: string }>({
      query: (quietHours) => ({
        url: '/notifications/settings/quiet-hours',
        method: 'PUT',
        body: quietHours,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    // Register push token
    registerPushToken: builder.mutation<{ success: boolean }, { token: string; platform: 'ios' | 'android' }>({
      query: (data) => ({
        url: '/notifications/register-token',
        method: 'POST',
        body: data,
      }),
    }),

    // Unregister push token
    unregisterPushToken: builder.mutation<{ success: boolean }, string>({
      query: (token) => ({
        url: '/notifications/unregister-token',
        method: 'POST',
        body: { token },
      }),
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['NotificationBadge'],
    }),

    // Get badge count
    getBadgeCount: builder.query<number, void>({
      query: () => ({
        url: '/notifications/badge',
        method: 'GET',
      }),
      providesTags: ['NotificationBadge'],
    }),

    // Update badge count
    updateBadgeCount: builder.mutation<{ count: number }, number>({
      query: (count) => ({
        url: '/notifications/badge',
        method: 'PUT',
        body: { count },
      }),
      invalidatesTags: ['NotificationBadge'],
    }),
  }),
});

export const {
  useGetNotificationSettingsQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateQuietHoursMutation,
  useRegisterPushTokenMutation,
  useUnregisterPushTokenMutation,
  useMarkAllAsReadMutation,
  useGetBadgeCountQuery,
  useUpdateBadgeCountMutation,
} = notificationApi;

export default notificationApi;
