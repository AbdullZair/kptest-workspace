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
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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
export const ThreadList = memo(function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  onCreateThread,
  isLoading = false,
}: ThreadListProps) {
  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      const dateA = new Date(a.last_message_at).getTime()
      const dateB = new Date(b.last_message_at).getTime()
      return dateB - dateA
    })
  }, [threads])

  if (isLoading) {
    return (
      <Card variant="default" size="md" className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </Card>
    )
  }

  if (threads.length === 0) {
    return (
      <Card variant="default" size="md" className="p-6">
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <svg className="w-12 h-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-neutral-600 font-medium">Brak wątków</p>
          <p className="text-sm text-neutral-500 mt-1">Rozpocznij nową konwersację</p>
          {onCreateThread && (
            <Button variant="primary" size="sm" onClick={onCreateThread} className="mt-4">
              Nowy wątek
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold text-neutral-900">Wątki</h2>
        {onCreateThread && (
          <Button variant="outline" size="sm" onClick={onCreateThread}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nowy
          </Button>
        )}
      </div>

      {/* Thread list */}
      <div className="flex flex-col gap-1">
        {sortedThreads.map((thread) => {
          const isSelected = selectedThreadId === thread.id
          const isGroup = thread.type === 'GROUP'

          return (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-2 border-blue-300'
                  : 'bg-white border-2 border-transparent hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Thread type icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {getTypeIcon(thread.type)}
                </div>

                {/* Thread info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-neutral-900'}`}>
                      {thread.title}
                    </h3>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {formatRelativeTime(thread.last_message_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isGroup
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isGroup ? 'Grupowy' : 'Indywidualny'}
                    </span>
                    {thread.unread_count !== undefined && thread.unread_count > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
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
})

export default ThreadList
