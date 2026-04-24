import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Message,
  MessageListParams,
  MessageListResponse,
  MessageThread,
  ThreadListParams,
  ThreadListResponse,
  SendMessageRequest,
  CreateThreadRequest,
} from './types';

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: ['Message', 'MessageThread', 'MessageList'],
  endpoints: (builder) => ({
    // Get all message threads
    getMessageThreads: builder.query<ThreadListResponse, ThreadListParams | void>({
      query: (params) => ({
        url: '/messages/threads',
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.threads.map(({ id }) => ({ type: 'MessageThread' as const, id })),
              { type: 'MessageList' as const, id: 'LIST' },
            ]
          : [{ type: 'MessageList' as const, id: 'LIST' }],
    }),

    // Get single thread
    getMessageThread: builder.query<MessageThread, string>({
      query: (id) => ({
        url: `/messages/threads/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'MessageThread', id }],
    }),

    // Get messages in thread
    getMessages: builder.query<MessageListResponse, MessageListParams>({
      query: ({ threadId, ...params }) => ({
        url: `/messages/threads/${threadId}/messages`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { threadId }) =>
        result
          ? [
              ...result.messages.map(({ id }) => ({ type: 'Message' as const, id })),
              { type: 'MessageThread', id: threadId },
            ]
          : [{ type: 'MessageThread', id: threadId }],
    }),

    // Send message
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (data) => ({
        url: '/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: 'Message', id: result?.id },
        { type: 'MessageThread', id: threadId },
        { type: 'MessageList', id: 'LIST' },
      ],
    }),

    // Create new thread
    createThread: builder.mutation<MessageThread, CreateThreadRequest>({
      query: (data) => ({
        url: '/messages/threads',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'MessageList', id: 'LIST' }],
    }),

    // Mark message as read
    markMessageAsRead: builder.mutation<{ success: boolean }, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId },
      ],
    }),

    // Mark thread as read
    markThreadAsRead: builder.mutation<{ success: boolean }, string>({
      query: (threadId) => ({
        url: `/messages/threads/${threadId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, threadId) => [
        { type: 'MessageThread', id: threadId },
        { type: 'MessageList', id: 'LIST' },
      ],
    }),

    // Delete message
    deleteMessage: builder.mutation<{ success: boolean }, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId },
      ],
    }),

    // Search messages
    searchMessages: builder.query<Message[], { q: string; threadId?: string }>({
      query: (params) => ({
        url: '/messages/search',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetMessageThreadsQuery,
  useGetMessageThreadQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateThreadMutation,
  useMarkMessageAsReadMutation,
  useMarkThreadAsReadMutation,
  useDeleteMessageMutation,
  useSearchMessagesQuery,
} = messageApi;

export default messageApi;
