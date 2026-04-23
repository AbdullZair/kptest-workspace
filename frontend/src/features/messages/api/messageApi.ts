import { api } from '@shared/api'
import type {
  MessageThread,
  Message,
  MessageAttachment,
  ThreadFormData,
  MessageFormData,
  ThreadFilters,
  UnreadMessagesResponse,
  UnreadCountResponse,
} from '../types'

/**
 * Message API slice using RTK Query
 * Handles all message and conversation-related endpoints
 */
export const messageApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all message threads with filtering and pagination
     * @query
     */
    getThreads: builder.query<MessageThread[], ThreadFilters>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters.project_id) params.append('projectId', filters.project_id)
        if (filters.type) params.append('type', filters.type)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return {
          url: '/messages/threads',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MessageThread' as const, id })),
              { type: 'MessageThread', id: 'LIST' },
            ]
          : [{ type: 'MessageThread', id: 'LIST' }],
    }),

    /**
     * Get thread by ID
     * @query
     */
    getThreadById: builder.query<MessageThread, string>({
      query: (id) => ({
        url: `/messages/threads/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'MessageThread', id }],
    }),

    /**
     * Create a new thread
     * @mutation
     */
    createThread: builder.mutation<MessageThread, ThreadFormData>({
      query: (thread) => ({
        url: '/messages/threads',
        method: 'POST',
        body: thread,
      }),
      invalidatesTags: [{ type: 'MessageThread', id: 'LIST' }],
    }),

    /**
     * Get messages in a thread
     * @query
     */
    getThreadMessages: builder.query<Message[], { threadId: string; page?: number; size?: number }>({
      query: ({ threadId, page = 0, size = 50 }) => {
        const params = new URLSearchParams()
        if (page !== undefined) params.append('page', page.toString())
        if (size !== undefined) params.append('size', size.toString())

        return {
          url: `/messages/threads/${threadId}/messages`,
          method: 'GET',
          params,
        }
      },
      providesTags: (result, _error, { threadId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Message' as const, id })),
              { type: 'Message', id: `THREAD_${threadId}` },
            ]
          : [{ type: 'Message', id: `THREAD_${threadId}` }],
    }),

    /**
     * Send a message
     * @mutation
     */
    sendMessage: builder.mutation<Message, { threadId: string; message: MessageFormData }>({
      query: ({ threadId, message }) => ({
        url: `/messages/threads/${threadId}/messages`,
        method: 'POST',
        body: message,
      }),
      invalidatesTags: (_result, _error, { threadId }) => [
        { type: 'Message', id: `THREAD_${threadId}` },
        { type: 'MessageThread', id: 'LIST' },
      ],
    }),

    /**
     * Mark a message as read
     * @mutation
     */
    markAsRead: builder.mutation<Message, string>({
      query: (id) => ({
        url: `/messages/messages/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Message', id },
        { type: 'Message', id: 'LIST' },
        { type: 'MessageThread', id: 'LIST' },
      ],
    }),

    /**
     * Upload an attachment
     * @mutation
     */
    uploadAttachment: builder.mutation<MessageAttachment, { messageId: string; file: File }>({
      query: ({ messageId, file }) => {
        const formData = new FormData()
        formData.append('file', file)

        return {
          url: `/messages/messages/${messageId}/attachments`,
          method: 'POST',
          body: formData,
          // Don't set content-type header, browser will set it with boundary
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      },
      invalidatesTags: (_result, _error, { messageId }) => [
        { type: 'Message', id: `THREAD_${messageId}` },
      ],
    }),

    /**
     * Get unread messages
     * @query
     */
    getUnreadMessages: builder.query<UnreadMessagesResponse, { project_id?: string; page?: number; size?: number }>({
      query: ({ project_id, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (project_id) params.append('projectId', project_id)
        if (page !== undefined) params.append('page', page.toString())
        if (size !== undefined) params.append('size', size.toString())

        return {
          url: '/messages/unread',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Message' as const, id })),
              { type: 'Message', id: 'UNREAD' },
            ]
          : [{ type: 'Message', id: 'UNREAD' }],
    }),

    /**
     * Get unread count
     * @query
     */
    getUnreadCount: builder.query<UnreadCountResponse, { project_id?: string }>({
      query: ({ project_id }) => {
        const params = new URLSearchParams()
        if (project_id) params.append('projectId', project_id)

        return {
          url: '/messages/unread/count',
          method: 'GET',
          params,
        }
      },
      providesTags: ['Message', 'MessageThread'],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetThreadsQuery,
  useGetThreadByIdQuery,
  useCreateThreadMutation,
  useGetThreadMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useUploadAttachmentMutation,
  useGetUnreadMessagesQuery,
  useGetUnreadCountQuery,
  useLazyGetUnreadCountQuery,
} = messageApiSlice

export default messageApiSlice
