/**
 * Message Types
 * TypeScript types for message and conversation management
 */

/**
 * Thread type for conversations
 */
export type ThreadType = 'INDIVIDUAL' | 'GROUP'

/**
 * Message priority levels
 */
export type MessagePriority = 'INFO' | 'QUESTION' | 'URGENT'

/**
 * MessageThread entity
 */
export interface MessageThread {
  id: string
  project_id: string
  title: string
  type: ThreadType
  created_by: string
  created_at: string
  last_message_at: string
  message_count?: number
  unread_count?: number
}

/**
 * MessageAttachment entity
 */
export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  uploaded_at: string
}

/**
 * Message entity
 */
export interface Message {
  id: string
  thread_id: string
  sender_id: string
  content: string
  priority: MessagePriority
  sent_at: string
  read_at?: string
  read_by: string[]
  parent_message_id?: string
  internal_note?: string
  attachments: MessageAttachment[]
}

/**
 * Message form data for creating/sending
 */
export interface MessageFormData {
  content: string
  priority: MessagePriority
  parent_message_id?: string
  internal_note?: string
}

/**
 * Thread form data for creating
 */
export interface ThreadFormData {
  project_id: string
  title: string
  type: ThreadType
}

/**
 * Thread filters for searching
 */
export interface ThreadFilters {
  project_id?: string
  type?: ThreadType
  page?: number
  size?: number
}

/**
 * Unread messages response
 */
export interface UnreadMessagesResponse {
  data: Message[]
  total: number
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number
}
