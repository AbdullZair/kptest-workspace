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
export const NotificationBell = memo(function NotificationBell({
  className,
  size = 'md',
  showTooltip = false,
}: NotificationBellProps) {
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
        onClick={handleOpen}
        className={twMerge(
          'relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors',
          className
        )}
        aria-label="Powiadomienia"
        aria-busy={isLoading}
        {...(showTooltip && { title: 'Powiadomienia' })}
      >
        <svg
          className={twMerge(sizeStyles[size])}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {hasUnread && (
          <span
            className={clsx(
              'absolute -top-1 -right-1 flex items-center justify-center',
              'bg-error-600 text-white font-bold rounded-full',
              'shadow-sm',
              badgeSizeStyles[size]
            )}
            aria-label={`${unreadCount} nieprzeczytanych powiadomień`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={handleClose} />
    </div>
  )
})

export default NotificationBell
