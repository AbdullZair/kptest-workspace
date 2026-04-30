import { memo, useMemo } from 'react'
import { Card, Button } from '@shared/components'
import type { MessageThread } from '../types'

/**
 * ThreadList component props
 */
export interface ThreadListProps {
  threads: MessageThread[]
  selectedThreadId?: string
  onSelectThread: (thread: MessageThread) => void
  onCreateThread?: () => void
  isLoading?: boolean
}

/**
 * Format date for display
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Teraz'
  if (diffMins < 60) return `${diffMins} min temu`
  if (diffHours < 24) return `${diffHours} h temu`
  if (diffDays < 7) return `${diffDays} dni temu`

  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Get thread type icon
 */
const getTypeIcon = (type: string) => {
  if (type === 'GROUP') {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}

/**
 * ThreadList Component
 *
 * Displays a list of conversation threads
 *
 * @example
 * ```tsx
 * <ThreadList
 *   threads={threads}
 *   selectedThreadId={selectedThreadId}
 *   onSelectThread={handleSelectThread}
 * />
 * ```
 */
export const ThreadList = memo(
  ({
    threads,
    selectedThreadId,
    onSelectThread,
    onCreateThread,
    isLoading = false,
  }: ThreadListProps) => {
    const sortedThreads = useMemo(() => {
      return [...threads].sort((a, b) => {
        const dateA = new Date(a.last_message_at).getTime()
        const dateB = new Date(b.last_message_at).getTime()
        return dateB - dateA
      })
    }, [threads])

    if (isLoading) {
      return (
        <Card className="p-6" size="md" variant="default">
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        </Card>
      )
    }

    if (threads.length === 0) {
      return (
        <Card className="p-6" size="md" variant="default">
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <svg
              className="mb-4 h-12 w-12 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <p className="font-medium text-neutral-600">Brak wątków</p>
            <p className="mt-1 text-sm text-neutral-500">Rozpocznij nową konwersację</p>
            {onCreateThread ? (
              <Button className="mt-4" size="sm" variant="primary" onClick={onCreateThread}>
                Nowy wątek
              </Button>
            ) : null}
          </div>
        </Card>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-lg font-semibold text-neutral-900">Wątki</h2>
          {onCreateThread ? (
            <Button size="sm" variant="outline" onClick={onCreateThread}>
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 4v16m8-8H4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Nowy
            </Button>
          ) : null}
        </div>

        {/* Thread list */}
        <div className="flex flex-col gap-1">
          {sortedThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id
            const isGroup = thread.type === 'GROUP'

            return (
              <button
                key={thread.id}
                className={`w-full rounded-lg p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-2 border-blue-300 bg-blue-50'
                    : 'border-2 border-transparent bg-white hover:bg-neutral-50'
                }`}
                onClick={() => onSelectThread(thread)}
              >
                <div className="flex items-start gap-3">
                  {/* Thread type icon */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      isSelected ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {getTypeIcon(thread.type)}
                  </div>

                  {/* Thread info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <h3
                        className={`truncate font-medium ${isSelected ? 'text-blue-900' : 'text-neutral-900'}`}
                      >
                        {thread.title}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-neutral-500">
                        {formatRelativeTime(thread.last_message_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isGroup ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isGroup ? 'Grupowy' : 'Indywidualny'}
                      </span>
                      {thread.unread_count !== undefined && thread.unread_count > 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {thread.unread_count} nieprzeczytanych
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)

export default ThreadList
