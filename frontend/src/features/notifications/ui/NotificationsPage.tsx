import { useState, useMemo } from 'react'
import { useGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation, useMarkAllAsReadMutation } from '../api/notificationApi'
import { NotificationItem } from '../components'
import type { NotificationType, NotificationFilters } from '@entities/notification'
import { Button } from '@shared/components/Button'

/**
 * NotificationsPage Component
 *
 * Main page displaying list of all notifications with filtering
 *
 * @route /notifications
 */
export const NotificationsPage = function NotificationsPage() {
  const [selectedType, setSelectedType] = useState<NotificationType | 'ALL'>('ALL')
  const [showRead, setShowRead] = useState(true)

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    refetch,
  } = useGetNotificationsQuery({
    type: selectedType === 'ALL' ? undefined : selectedType,
    read: showRead ? undefined : false,
    page: 0,
    size: 50,
  })

  // Mutations
  const [markAsRead] = useMarkAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()
  const [markAllAsRead] = useMarkAllAsReadMutation()

  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-neutral-900">Powiadomienia</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {unreadCount} nieprzeczytanych
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Oznacz wszystkie jako przeczytane
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-4">
            {/* Type filter */}
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
              {(['ALL', 'MESSAGE', 'EVENT', 'MATERIAL', 'SCHEDULE_CHANGE', 'REMINDER'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {type === 'ALL' ? 'Wszystkie' : type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Read filter */}
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setShowRead(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !showRead
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Nieprzeczytane
              </button>
              <button
                onClick={() => setShowRead(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  showRead
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Wszystkie
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoadingNotifications ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
              <p className="mt-4 text-sm text-neutral-500">Ładowanie powiadomień...</p>
            </div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">Brak powiadomień</h3>
            <p className="mt-2 text-sm text-neutral-500">
              {showRead
                ? 'Nie masz żadnych powiadomień'
                : 'Wszystkie powiadomienia są przeczytane'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationsPage
