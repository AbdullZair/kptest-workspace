import { memo, useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useGetUnreadCountQuery } from '../api/notificationApi'
import { NotificationDropdown } from './NotificationDropdown'

/**
 * NotificationBell props
 */
export interface NotificationBellProps {
  /** Custom className */
  className?: string
  /** Icon size */
  size?: 'sm' | 'md' | 'lg'
  /** Show tooltip */
  showTooltip?: boolean
}

/**
 * NotificationBell Component
 *
 * Bell icon with unread count badge that opens notification dropdown
 *
 * @example
 * ```tsx
 * <NotificationBell />
 *
 * <NotificationBell size="lg" showTooltip />
 * ```
 */
export const NotificationBell = memo(
  ({ className, size = 'md', showTooltip = false }: NotificationBellProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const { data: unreadCountData, isLoading } = useGetUnreadCountQuery()

    const unreadCount = unreadCountData?.count ?? 0
    const hasUnread = unreadCount > 0

    const sizeStyles = {
      sm: 'h-5 w-5',
      md: 'h-6 w-6',
      lg: 'h-7 w-7',
    }

    const badgeSizeStyles = {
      sm: 'h-4 min-w-[1rem] px-1 text-[10px]',
      md: 'h-5 min-w-[1.25rem] px-1.5 text-xs',
      lg: 'h-6 min-w-[1.5rem] px-2 text-sm',
    }

    const handleOpen = () => {
      setIsOpen(true)
    }

    const handleClose = () => {
      setIsOpen(false)
    }

    return (
      <div className="relative">
        <button
          aria-busy={isLoading}
          aria-label="Powiadomienia"
          className={twMerge(
            'relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700',
            className
          )}
          onClick={handleOpen}
          {...(showTooltip && { title: 'Powiadomienia' })}
        >
          <svg
            aria-hidden="true"
            className={twMerge(sizeStyles[size])}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>

          {hasUnread ? (
            <span
              aria-label={`${unreadCount} nieprzeczytanych powiadomień`}
              className={clsx(
                'absolute -right-1 -top-1 flex items-center justify-center',
                'rounded-full bg-error-600 font-bold text-white',
                'shadow-sm',
                badgeSizeStyles[size]
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </button>

        <NotificationDropdown isOpen={isOpen} onClose={handleClose} />
      </div>
    )
  }
)

export default NotificationBell
