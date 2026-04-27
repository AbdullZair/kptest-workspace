/**
 * Inbox module type definitions
 */

/**
 * Thread status enumeration
 */
export type ThreadStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

/**
 * Message priority enumeration
 */
export type MessagePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

/**
 * Thread type enumeration
 */
export type ThreadType = 'PATIENT_COMMUNICATION' | 'INTERNAL' | 'CONSULTATION'

/**
 * Inbox thread DTO
 */
export interface InboxThread {
  id: string
  project_id: string
  project_name: string
  title: string
  type: ThreadType
  created_at: string
  last_message_at: string
  message_count: number
  unread_count: number
  status: ThreadStatus
  assigned_to?: string
  assigned_to_name?: string
  created_by: string
  created_by_name: string
  participants: string[]
}

/**
 * Inbox message DTO
 */
export interface InboxMessage {
  id: string
  thread_id: string
  thread_title: string
  project_id: string
  project_name: string
  sender_id: string
  sender_name: string
  content: string
  priority: MessagePriority
  sent_at: string
  read_at?: string
  read_by: string[]
  status: ThreadStatus
  assigned_to?: string
  assigned_to_name?: string
  is_unread: boolean
}

/**
 * Inbox filters
 */
export interface InboxFilters {
  project_id?: string
  status?: ThreadStatus
  assigned_to?: string
  is_unread?: boolean
  priority?: MessagePriority
  page?: number
  size?: number
}

/**
 * Delegate message request
 */
export interface DelegateMessageRequest {
  assignee_id: string
  status: ThreadStatus
  comment?: string
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number
}
