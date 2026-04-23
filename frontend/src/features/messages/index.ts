// Messages feature barrel export
export { MessagesPage } from './ui/MessagesPage'
export { ConversationPage } from './ui/ConversationPage'

export {
  useGetThreadsQuery,
  useGetThreadByIdQuery,
  useCreateThreadMutation,
  useGetThreadMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useUploadAttachmentMutation,
  useGetUnreadMessagesQuery,
  useGetUnreadCountQuery,
} from './api/messageApi'

export type {
  Message,
  MessageThread,
  MessageAttachment,
  MessageFormData,
  ThreadFormData,
  MessagePriority,
  ThreadType,
} from './types'
