import { memo } from 'react'
import { Card, Button } from '@shared/components'
import type { Message } from '../types'

/**
 * MessageBubble component props
 */
export interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onReply?: (message: Message) => void
  onMarkRead?: (messageId: string) => void
  showSender?: boolean
}

/**
 * Format date for display
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}


/**
 * Get priority badge color
 */
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    INFO: 'bg-blue-100 text-blue-800',
    QUESTION: 'bg-yellow-100 text-yellow-800',
    URGENT: 'bg-red-100 text-red-800',
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Get priority label
 */
const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    INFO: 'Informacja',
    QUESTION: 'Pytanie',
    URGENT: 'Pilne',
  }
  return labels[priority] || priority
}

/**
 * Format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

/**
 * MessageBubble Component
 *
 * Displays a single message in a conversation
 *
 * @example
 * ```tsx
 * <MessageBubble
 *   message={message}
 *   isOwn={true}
 *   onReply={handleReply}
 * />
 * ```
 */
export const MessageBubble = memo(
  ({ message, isOwn, onReply, onMarkRead, showSender = false }: MessageBubbleProps) => {
    const isRead = message.read_by?.length > 0
    const hasAttachments = message.attachments?.length > 0

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
          {/* Sender name for group chats */}
          {showSender && !isOwn ? (
            <div className="mb-1 ml-2 text-xs text-neutral-500">
              {/* Sender name would be displayed here if available */}
            </div>
          ) : null}

          <Card
            variant={isOwn ? 'elevated' : 'default'}
            size="md"
            className={`${isOwn ? 'border-blue-200 bg-blue-50' : 'bg-white'}`}
          >
            <div className="flex flex-col gap-2">
              {/* Priority badge */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getPriorityColor(message.priority)}`}
                >
                  {getPriorityLabel(message.priority)}
                </span>
                <span className="text-xs text-neutral-500">{formatTime(message.sent_at)}</span>
              </div>

              {/* Message content */}
              <div className="whitespace-pre-wrap break-words text-neutral-900">
                {message.content}
              </div>

              {/* Attachments */}
              {hasAttachments ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={`/api/v1/messages/messages/${attachment.message_id}/attachments/${attachment.id}`}
                      className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm transition-colors hover:bg-neutral-200"
                      download={attachment.file_name}
                    >
                      <svg
                        className="h-4 w-4 text-neutral-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <span className="max-w-[150px] truncate font-medium text-neutral-700">
                          {attachment.file_name}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {formatFileSize(attachment.file_size)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : null}

              {/* Internal note */}
              {message.internal_note ? (
                <div className="mt-2 border-t border-neutral-200 pt-2">
                  <div className="text-xs italic text-neutral-500">
                    <span className="font-medium">Notatka wewnętrzna:</span> {message.internal_note}
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!isOwn && !isRead && onMarkRead ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkRead(message.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Oznacz jako przeczytane
                    </Button>
                  ) : null}
                  {isRead ? (
                    <span className="text-xs text-neutral-400">
                      Przeczytane przez: {message.read_by.length} os.
                    </span>
                  ) : null}
                </div>

                {!isOwn && onReply ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(message)}
                    className="text-xs text-neutral-600 hover:text-neutral-800"
                  >
                    Odpowiedz
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }
)

export default MessageBubble
