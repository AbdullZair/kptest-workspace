import { api } from '@shared/api'
import type {
  InboxThread,
  InboxMessage,
  InboxFilters,
  DelegateMessageRequest,
  UnreadCountResponse,
  PageResponse,
} from '../types'

/**
 * Inbox API slice using RTK Query
 */
export const inboxApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get inbox threads with filters
     */
    getInboxThreads: builder.query<PageResponse<InboxThread>, InboxFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        if (filters.project_id) params.append('projectId', filters.project_id)
        if (filters.status) params.append('status', filters.status)
        if (filters.assigned_to) params.append('assignedTo', filters.assigned_to)
        if (filters.is_unread !== undefined) params.append('isUnread', filters.is_unread.toString())
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return `/inbox/threads?${params.toString()}`
      },
      providesTags: ['InboxThread'],
    }),

    /**
     * Get inbox messages with filters
     */
    getInboxMessages: builder.query<PageResponse<InboxMessage>, InboxFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        if (filters.project_id) params.append('threadId', filters.project_id)
        if (filters.priority) params.append('priority', filters.priority)
        if (filters.status) params.append('status', filters.status)
        if (filters.assigned_to) params.append('assignedTo', filters.assigned_to)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return `/inbox/messages?${params.toString()}`
      },
      providesTags: ['InboxMessage'],
    }),

    /**
     * Delegate thread to team member
     */
    delegateThread: builder.mutation<InboxThread, { threadId: string; body: DelegateMessageRequest }>({
      query: ({ threadId, body }) => ({
        url: `/inbox/threads/${threadId}/delegate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InboxThread'],
    }),

    /**
     * Update thread status
     */
    updateThreadStatus: builder.mutation<InboxThread, { threadId: string; status: string }>({
      query: ({ threadId, status }) => ({
        url: `/inbox/threads/${threadId}/status?status=${status}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['InboxThread'],
    }),

    /**
     * Mark thread as read
     */
    markThreadAsRead: builder.mutation<void, string>({
      query: (threadId) => ({
        url: `/inbox/threads/${threadId}/mark-as-read`,
        method: 'POST',
      }),
      invalidatesTags: ['InboxThread', 'InboxMessage'],
    }),

    /**
     * Get unread count
     */
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/inbox/unread-count',
      providesTags: ['InboxThread'],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks
 */
export const {
  useGetInboxThreadsQuery,
  useGetInboxMessagesQuery,
  useDelegateThreadMutation,
  useUpdateThreadStatusMutation,
  useMarkThreadAsReadMutation,
  useGetUnreadCountQuery,
} = inboxApiSlice

export default inboxApiSlice
