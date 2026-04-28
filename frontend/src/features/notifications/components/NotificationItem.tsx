import { memo, type ReactNode } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Notification, NotificationType } from '@entities/notification'
import { Button } from '@shared/components/Button'

/**
 * Notification type configuration
 */
const typeConfig: Record<
  NotificationType,
  {
    icon: ReactNode
    bgColor: string
    textColor: string
    label: string
  }
> = {
  MESSAGE: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    label: 'Wiadomość',
  },
  EVENT: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    label: 'Wydarzenie',
  },
  MATERIAL: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    label: 'Materiał',
  },
  SCHEDULE_CHANGE: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    label: 'Zmiana w harmonogramie',
  },
  REMINDER: {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    label: 'Przypomnienie',
  },
}

/**
 * NotificationItem props
 */
export interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  onAction?: (notification: Notification) => void
  compact?: boolean
}

/**
 * NotificationItem Component
 *
 * Displays a single notification item with type-specific styling
 * and actions for marking as read and deleting
 *
 * @example
 * ```tsx
 * <NotificationItem
 *   notification={notification}
 *   onMarkAsRead={handleMarkAsRead}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const NotificationItem = memo(
  ({ notification, onMarkAsRead, onDelete, onAction, compact = false }: NotificationItemProps) => {
    const { id, type, title, content, action_url, read, created_at } = notification

    const config = typeConfig[type]
    const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: pl })

    const handleClick = () => {
      if (!read && onMarkAsRead) {
        onMarkAsRead(id)
      }
      if (action_url && onAction) {
        onAction(notification)
      }
    }

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(id)
    }

    const handleMarkAsRead = (e: React.MouseEvent) => {
      e.stopPropagation()
      onMarkAsRead?.(id)
    }

    const baseStyles = clsx(
      'flex gap-3 p-4 rounded-lg border transition-all duration-200',
      'hover:shadow-md',
      read ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300',
      !read && 'border-l-4 border-l-primary-500',
      compact ? 'items-center' : 'items-start'
    )

    return (
      <div
        className={twMerge(baseStyles)}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick()
          }
        }}
        aria-label={`Notification: ${title}`}
        aria-read={read}
      >
        {/* Icon */}
        <div className={clsx('flex-shrink-0 rounded-lg p-2', config.bgColor, config.textColor)}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4
                  className={clsx(
                    'truncate text-sm font-medium',
                    read ? 'text-gray-700' : 'text-gray-900'
                  )}
                >
                  {title}
                </h4>
                <span
                  className={clsx(
                    'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                    config.bgColor,
                    config.textColor
                  )}
                >
                  {config.label}
                </span>
                {!read && (
                  <span className="inline-flex items-center rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    Nieprzeczytane
                  </span>
                )}
              </div>
              {!compact && (
                <p className={clsx('mt-1 text-sm', read ? 'text-gray-500' : 'text-gray-600')}>
                  {content}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">{timeAgo}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {!read && onMarkAsRead ? (
                <button
                  onClick={handleMarkAsRead}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  title="Oznacz jako przeczytane"
                  aria-label="Oznacz jako przeczytane"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              ) : null}
              {onDelete ? (
                <button
                  onClick={handleDelete}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600"
                  title="Usuń"
                  aria-label="Usuń powiadomienie"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {/* Action URL */}
          {action_url ? (
            <div className="mt-2">
              <Button variant="outline" size="xs" onClick={handleClick}>
                Przejdź
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }
)

export default NotificationItem
