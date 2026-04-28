import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { ConversationView, AttachmentUpload } from '../components'
import {
  useGetThreadByIdQuery,
  useGetThreadMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useUploadAttachmentMutation,
} from '../api/messageApi'
import type { MessageFormData } from '../types'

/**
 * ConversationPage Component
 *
 * Page displaying a single conversation thread
 *
 * @route /messages/:threadId
 */
export const ConversationPage = function ConversationPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!threadId) {
    navigate('/messages')
    return null
  }

  // Fetch thread details
  const {
    data: thread,
    isLoading: isLoadingThread,
    error: threadError,
  } = useGetThreadByIdQuery(threadId)

  // Fetch messages
  const { data: messages = [], isLoading: isLoadingMessages } = useGetThreadMessagesQuery({
    threadId,
    page: 0,
    size: 100,
  })

  // Send message mutation
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()

  // Mark as read mutation
  const [markAsRead] = useMarkAsReadMutation()

  // Upload attachment mutation
  const [uploadAttachment] = useUploadAttachmentMutation()

  // Handle send message
  const handleSendMessage = async (data: MessageFormData) => {
    try {
      await sendMessage({
        threadId,
        message: data,
      }).unwrap()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Nie udało się wysłać wiadomości')
    }
  }

  // Handle mark as read
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsRead(messageId).unwrap()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  // Handle upload attachment
  const handleUploadAttachment = async (messageId: string, file: File) => {
    try {
      await uploadAttachment({ messageId, file }).unwrap()
    } catch (error) {
      console.error('Failed to upload attachment:', error)
      throw error
    }
  }

  // Handle back navigation
  const handleBack = () => {
    navigate('/messages')
  }

  // Loading state
  if (isLoadingThread || isLoadingMessages) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="text-neutral-600">Ładowanie konwersacji...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (threadError || !thread) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">Wątek nie znaleziony</h1>
          <p className="mb-4 text-neutral-600">
            Konwersacja, której szukasz, nie istnieje lub została usunięta.
          </p>
          <button
            onClick={() => navigate('/messages')}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Wróć do wiadomości
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
                aria-label="Wróć"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">{thread.title}</h1>
                <p className="text-sm text-neutral-500">
                  {thread.type === 'GROUP' ? 'Czat grupowy' : 'Czat indywidualny'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/messages')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Wszystkie wiadomości
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {user ? (
          <ConversationView
            thread={thread}
            messages={messages}
            currentUserId={user.id}
            isLoading={isLoadingMessages}
            isSending={isSending}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            onBack={handleBack}
          />
        ) : null}
      </main>
    </div>
  )
}

export default ConversationPage
