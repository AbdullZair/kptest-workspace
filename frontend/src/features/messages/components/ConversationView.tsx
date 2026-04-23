import { memo, useEffect, useRef, useState, useCallback } from 'react'
import { Card, Button } from '@shared/components'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import type { Message, MessageThread, MessageFormData } from '../types'

/**
 * ConversationView component props
 */
export interface ConversationViewProps {
  thread: MessageThread
  messages: Message[]
  currentUserId: string
  isLoading?: boolean
  isSending?: boolean
  onSendMessage: (data: MessageFormData) => void
  onMarkAsRead?: (messageId: string) => void
  onBack?: () => void
}

/**
 * ConversationView Component
 *
 * Displays a conversation thread with messages
 *
 * @example
 * ```tsx
 * <ConversationView
 *   thread={thread}
 *   messages={messages}
 *   currentUserId={userId}
 *   onSendMessage={handleSendMessage}
 * />
 * ```
 */
export const ConversationView = memo(function ConversationView({
  thread,
  messages,
  currentUserId,
  isLoading = false,
  isSending = false,
  onSendMessage,
  onMarkAsRead,
  onBack,
}: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = useCallback(
    (data: MessageFormData) => {
      onSendMessage({
        ...data,
        parent_message_id: replyTo?.id,
      })
      setReplyTo(null)
    },
    [onSendMessage, replyTo]
  )

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message)
  }, [])

  const handleMarkRead = useCallback(
    (messageId: string) => {
      onMarkAsRead?.(messageId)
    },
    [onMarkAsRead]
  )

  const isGroup = thread.type === 'GROUP'

  if (isLoading) {
    return (
      <Card variant="default" size="md" className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p className="text-neutral-600">Ładowanie konwersacji...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="default" size="md" className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-neutral-900 truncate">{thread.title}</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isGroup
                ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {isGroup ? 'Czat grupowy' : 'Czat indywidualny'}
            </span>
            <span>•</span>
            <span>{messages.length} wiadomości</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-neutral-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="font-medium">Brak wiadomości w tym wątku</p>
            <p className="text-sm mt-1">Rozpocznij rozmowę wysyłając pierwszą wiadomość</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                showSender={isGroup}
                onReply={handleReply}
                onMarkRead={handleMarkRead}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600 font-medium">Odpowiedź do:</p>
            <p className="text-sm text-neutral-700 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="px-6 py-4 bg-white">
        <MessageInput
          onSubmit={handleSendMessage}
          isLoading={isSending}
          enableInternalNote
        />
      </div>
    </Card>
  )
})

export default ConversationView
