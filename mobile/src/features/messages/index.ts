export { messageApi } from './api/messageApi';
export {
  useGetMessageThreadsQuery,
  useGetMessageThreadQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateThreadMutation,
  useMarkMessageAsReadMutation,
  useMarkThreadAsReadMutation,
  useDeleteMessageMutation,
  useSearchMessagesQuery,
} from './api/messageApi';
export type {
  Message,
  Attachment,
  MessageThread,
  ThreadParticipant,
  MessageListParams,
  MessageListResponse,
  ThreadListParams,
  ThreadListResponse,
  SendMessageRequest,
  CreateThreadRequest,
} from './api/types';
