/**
 * Inbox module exports
 */

// API
export * from './api/inboxApi'

// Components
export { InboxPage } from './ui/InboxPage'
export { InboxFilters as InboxFiltersComponent } from './components/InboxFilters'
export { MessageDelegateModal } from './components/MessageDelegateModal'

// Types
export type {
  InboxThread,
  InboxMessage,
  InboxFilters,
  DelegateMessageRequest,
  ThreadStatus,
  MessagePriority,
  ThreadType,
  UnreadCountResponse,
  PageResponse,
} from './types'
