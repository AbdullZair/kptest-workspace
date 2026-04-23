import { api } from '@shared/api'
import type {
  TherapyEvent,
  CreateTherapyEventRequest,
  UpdateTherapyEventRequest,
  CompleteEventRequest,
  CalendarEventFilters,
} from '@entities/event'

/**
 * Calendar API slice using RTK Query
 * Handles all therapy event calendar-related endpoints
 */
export const calendarApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all calendar events with optional filters
     * @query
     */
    getCalendarEvents: builder.query<TherapyEvent[], CalendarEventFilters>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters?.patientId) params.append('patientId', filters.patientId)
        if (filters?.type) params.append('type', filters.type)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        return {
          url: '/calendar/events',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'CalendarEvent' as const, id })), { type: 'CalendarEvent', id: 'LIST' }]
          : [{ type: 'CalendarEvent', id: 'LIST' }],
    }),

    /**
     * Get event by ID
     * @query
     */
    getEventById: builder.query<TherapyEvent, string>({
      query: (id) => ({
        url: `/calendar/events/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'CalendarEvent', id }],
    }),

    /**
     * Create a new therapy event
     * @mutation
     */
    createEvent: builder.mutation<TherapyEvent, CreateTherapyEventRequest>({
      query: (event) => ({
        url: '/calendar/events',
        method: 'POST',
        body: event,
      }),
      invalidatesTags: [{ type: 'CalendarEvent', id: 'LIST' }],
    }),

    /**
     * Update an existing therapy event
     * @mutation
     */
    updateEvent: builder.mutation<TherapyEvent, { id: string; event: UpdateTherapyEventRequest }>({
      query: ({ id, event }) => ({
        url: `/calendar/events/${id}`,
        method: 'PUT',
        body: event,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CalendarEvent', id },
        { type: 'CalendarEvent', id: 'LIST' },
      ],
    }),

    /**
     * Delete a therapy event
     * @mutation
     */
    deleteEvent: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/calendar/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'CalendarEvent', id },
        { type: 'CalendarEvent', id: 'LIST' },
      ],
    }),

    /**
     * Mark event as completed
     * @mutation
     */
    completeEvent: builder.mutation<TherapyEvent, { id: string; request?: CompleteEventRequest }>({
      query: ({ id, request }) => ({
        url: `/calendar/events/${id}/complete`,
        method: 'POST',
        body: request || {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CalendarEvent', id },
        { type: 'CalendarEvent', id: 'LIST' },
      ],
    }),

    /**
     * Get upcoming events for a patient
     * @query
     */
    getUpcomingEvents: builder.query<TherapyEvent[], { patientId: string }>({
      query: ({ patientId }) => ({
        url: '/calendar/upcoming',
        method: 'GET',
        params: { patientId },
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'CalendarEvent' as const, id })), { type: 'CalendarEvent', id: 'UPCOMING' }]
          : [{ type: 'CalendarEvent', id: 'UPCOMING' }],
    }),

    /**
     * Export event to iCal format
     * @mutation
     */
    exportEvent: builder.mutation<{ blob: Blob; filename: string }, string>({
      queryFn: async (id) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/calendar/events/${id}/ics`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error('Export failed')
          }

          const blob = await response.blob()
          const filename = `event-${id}.ics`

          return { data: { blob, filename } }
        } catch (error) {
          return {
            error: {
              status: 0,
              message: error instanceof Error ? error.message : 'Export failed',
            },
          }
        }
      },
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetCalendarEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useCompleteEventMutation,
  useGetUpcomingEventsQuery,
  useExportEventMutation,
} = calendarApiSlice

export default calendarApiSlice
