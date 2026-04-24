export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'staff';
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  readAt?: string;
  deliveryStatus: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface MessageThread {
  id: string;
  projectId?: string;
  projectName?: string;
  participants: ThreadParticipant[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  id: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'staff';
  avatar?: string;
}

export interface MessageListParams {
  threadId: string;
  page?: number;
  limit?: number;
  before?: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface ThreadListParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
}

export interface ThreadListResponse {
  threads: MessageThread[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendMessageRequest {
  threadId: string;
  content: string;
  attachments?: string[];
}

export interface CreateThreadRequest {
  participantIds: string[];
  projectId?: string;
  subject?: string;
}
