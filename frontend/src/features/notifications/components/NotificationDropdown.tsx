import { memo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGetUnreadNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation, useMarkAllAsReadMutation } from '../api/notificationApi'
import { NotificationItem } from './NotificationItem'
import { Button } from '@shared/components/Button'
import type { Notification } from '@entities/notification'

/**
 * NotificationDropdown props
 */
export interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * NotificationDropdown Component
 *
 * Dropdown panel showing recent notifications with actions
 *
 * @example
 * ```tsx
 * <NotificationDropdown isOpen={isOpen} onClose={handleClose} />
 * ```
 */
export const NotificationDropdown = memo(function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: notifications, isLoading, refetch } = useGetUnreadNotificationsQuery(undefined, {
    skip: !isOpen,
  })
  const [markAsRead] = useMarkAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()
  const [markAllAsRead] = useMarkAllAsReadMutation()

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      refetch()
      onClose()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleAction = (notification: Notification) => {
    if (notification.action_url) {
      window.location.href = notification.action_url
      onClose()
    }
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-hidden bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      role="dialog"
      aria-label="Powiadomienia"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Powiadomienia</h3>
        {notifications && notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Oznacz wszystkie jako przeczytane
          </button>
        )}
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[60vh]">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
            <p className="mt-2 text-sm text-gray-500">Ładowanie powiadomień...</p>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-2">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onAction={handleAction}
                  compact
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Brak nowych powiadomień</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Zobacz wszystkie powiadomienia
        </Link>
      </div>
    </div>
  )
})

export default NotificationDropdown
