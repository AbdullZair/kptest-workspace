import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  CalendarEvent,
  EventListParams,
  CreateEventRequest,
  UpdateEventRequest,
} from './types';

export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: ['CalendarEvent', 'CalendarList'],
  endpoints: (builder) => ({
    // Get calendar events
    getCalendarEvents: builder.query<CalendarEvent[], EventListParams | void>({
      query: (params) => ({
        url: '/calendar/events',
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CalendarEvent' as const, id })),
              { type: 'CalendarList' as const, id: 'LIST' },
            ]
          : [{ type: 'CalendarList' as const, id: 'LIST' }],
    }),

    // Get single event
    getCalendarEvent: builder.query<CalendarEvent, string>({
      query: (id) => ({
        url: `/calendar/events/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'CalendarEvent', id }],
    }),

    // Create event
    createCalendarEvent: builder.mutation<CalendarEvent, CreateEventRequest>({
      query: (data) => ({
        url: '/calendar/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'CalendarList', id: 'LIST' }],
    }),

    // Update event
    updateCalendarEvent: builder.mutation<
      CalendarEvent,
      { id: string; data: UpdateEventRequest }
    >({
      query: ({ id, data }) => ({
        url: `/calendar/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CalendarEvent', id },
        { type: 'CalendarList', id: 'LIST' },
      ],
    }),

    // Delete event
    deleteCalendarEvent: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/calendar/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'CalendarList', id: 'LIST' }],
    }),

    // Mark event as completed
    completeCalendarEvent: builder.mutation<
      CalendarEvent,
      { id: string; notes?: string }
    >({
      query: ({ id, notes }) => ({
        url: `/calendar/events/${id}/complete`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CalendarEvent', id },
        { type: 'CalendarList', id: 'LIST' },
      ],
    }),

    // Export calendar
    exportCalendar: builder.mutation<
      { url: string },
      { startDate: string; endDate: string }
    >({
      query: (data) => ({
        url: '/calendar/export',
        method: 'POST',
        body: data,
      }),
    }),

    // Sync with device calendar
    syncWithDeviceCalendar: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/calendar/sync',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetCalendarEventsQuery,
  useGetCalendarEventQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useCompleteCalendarEventMutation,
  useExportCalendarMutation,
  useSyncWithDeviceCalendarMutation,
} = calendarApi;

export default calendarApi;
