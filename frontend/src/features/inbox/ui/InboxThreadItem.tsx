import React from 'react'
import type { InboxThread, ThreadStatus } from '../types'
import InboxThreadActions from './InboxThreadActions'
import ExportConversationButton from './ExportConversationButton'

interface InboxThreadItemProps {
  thread: InboxThread
  onDelegateClick?: (threadId: string) => void
  onActionComplete?: () => void
}

/**
 * Get status badge CSS classes
 */
const getStatusBadgeClass = (status: ThreadStatus): string => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800'
    case 'RESOLVED':
      return 'bg-green-100 text-green-800'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get status label in Polish
 */
const getStatusLabel = (status: ThreadStatus): string => {
  switch (status) {
    case 'NEW':
      return 'Nowy'
    case 'IN_PROGRESS':
      return 'W trakcie'
    case 'RESOLVED':
      return 'Rozwiązany'
    case 'CLOSED':
      return 'Zamknięty'
  }
}

/**
 * Get user initials for avatar
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Avatar component for assignee
 */
const AssigneeAvatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'sm' }) => {
  const initials = getInitials(name)
  const sizeClasses = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-blue-500 font-medium text-white`}
      title={name}
    >
      {initials}
    </div>
  )
}

/**
 * InboxThreadItem Component
 *
 * Table row component for displaying inbox thread with:
 * - Status badge (NEW | IN_PROGRESS | RESOLVED | CLOSED)
 * - Assignee avatar
 * - Action buttons
 */
export const InboxThreadItem: React.FC<InboxThreadItemProps> = ({
  thread,
  onDelegateClick,
  onActionComplete,
}) => {
  const isNew = thread.status === 'NEW'

  return (
    <tr className={`hover:bg-gray-50 ${isNew ? 'bg-blue-50' : ''}`}>
      {/* Status with badge */}
      <td className="whitespace-nowrap px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
            thread.status
          )}`}
        >
          {isNew ? <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-600" /> : null}
          {getStatusLabel(thread.status)}
        </span>
      </td>

      {/* Thread title */}
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{thread.title}</div>
        <div className="mt-0.5 text-xs text-gray-500">
          {thread.participants.slice(0, 3).join(', ')}
          {thread.participants.length > 3 && '...'}
        </div>
      </td>

      {/* Project name */}
      <td className="whitespace-nowrap px-4 py-3">
        <div className="text-sm text-gray-900">{thread.project_name}</div>
      </td>

      {/* Assignee with avatar */}
      <td className="whitespace-nowrap px-4 py-3">
        {thread.assigned_to && thread.assigned_to_name ? (
          <div className="flex items-center space-x-2">
            <AssigneeAvatar name={thread.assigned_to_name} />
            <span className="text-sm text-gray-900">{thread.assigned_to_name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Nieprzypisany</span>
        )}
      </td>

      {/* Last message timestamp */}
      <td className="whitespace-nowrap px-4 py-3">
        <div className="text-sm text-gray-900">
          {new Date(thread.last_message_at).toLocaleDateString('pl-PL')}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(thread.last_message_at).toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </td>

      {/* Message count */}
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{thread.message_count}</span>
          {thread.unread_count > 0 && (
            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {thread.unread_count} nowych
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex items-center justify-end space-x-2">
          {onDelegateClick ? (
            <button
              onClick={() => onDelegateClick(thread.id)}
              className="text-sm font-medium text-blue-600 hover:text-blue-900"
            >
              Deleguj
            </button>
          ) : null}
          <InboxThreadActions thread={thread} onActionComplete={() => onActionComplete?.()} />
          <ExportConversationButton threadId={thread.id} threadTitle={thread.title} />
        </div>
      </td>
    </tr>
  )
}

export default InboxThreadItem
