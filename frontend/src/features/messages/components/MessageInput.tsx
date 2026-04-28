import { useState, useRef, useCallback } from 'react'
import { Button, Card } from '@shared/components'
import type { MessagePriority, MessageFormData } from '../types'

/**
 * MessageInput component props
 */
export interface MessageInputProps {
  onSubmit: (data: MessageFormData) => void
  isLoading?: boolean
  placeholder?: string
  enableInternalNote?: boolean
}

/**
 * Priority options
 */
const PRIORITY_OPTIONS: { value: MessagePriority; label: string; icon: string }[] = [
  { value: 'INFO', label: 'Informacja', icon: 'ℹ️' },
  { value: 'QUESTION', label: 'Pytanie', icon: '❓' },
  { value: 'URGENT', label: 'Pilne', icon: '⚠️' },
]

/**
 * MessageInput Component
 *
 * Form for composing and sending messages
 *
 * @example
 * ```tsx
 * <MessageInput
 *   onSubmit={handleSendMessage}
 *   isLoading={isSending}
 * />
 * ```
 */
export const MessageInput = function MessageInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Napisz wiadomość...',
  enableInternalNote = false,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<MessagePriority>('INFO')
  const [showInternalNote, setShowInternalNote] = useState(false)
  const [internalNote, setInternalNote] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!content.trim() || isLoading) return

      onSubmit({
        content: content.trim(),
        priority,
        internal_note: internalNote.trim() || undefined,
      })

      setContent('')
      setInternalNote('')
      setShowInternalNote(false)
      setPriority('INFO')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    },
    [content, priority, internalNote, isLoading, onSubmit]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [handleSubmit]
  )

  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target
    setContent(target.value)

    // Auto-resize textarea
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
  }, [])

  return (
    <Card variant="default" size="md" className="rounded-none border-t border-neutral-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Message content */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '44px' }}
          />
          <div className="mt-1 text-xs text-neutral-500">Ctrl/Cmd + Enter aby wysłać</div>
        </div>

        {/* Internal note toggle */}
        {enableInternalNote ? (
          <div>
            <button
              type="button"
              onClick={() => setShowInternalNote(!showInternalNote)}
              className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              {showInternalNote ? 'Ukryj notatkę wewnętrzną' : 'Dodaj notatkę wewnętrzną'}
            </button>

            {showInternalNote ? (
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Notatka widoczna tylko dla personelu"
                className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : null}
          </div>
        ) : null}

        {/* Bottom bar with priority and send button */}
        <div className="flex items-center justify-between gap-4">
          {/* Priority selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Priorytet:</span>
            <div className="flex gap-1">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    priority === option.value
                      ? 'border-2 border-blue-300 bg-blue-100 text-blue-800'
                      : 'border-2 border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  title={option.label}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!content.trim() || isLoading}
            className="flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            {isLoading ? 'Wysyłanie...' : 'Wyślij'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default MessageInput
