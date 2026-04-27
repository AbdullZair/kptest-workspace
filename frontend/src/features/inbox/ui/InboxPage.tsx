import React, { useState } from 'react'
import { useGetInboxThreadsQuery, useMarkThreadAsReadMutation } from '../api/inboxApi'
import { InboxFilters } from '../components/InboxFilters'
import { MessageDelegateModal } from '../components/MessageDelegateModal'
import type { InboxThread, ThreadStatus } from '../types'

export const InboxPage: React.FC = () => {
  const [filters, setFilters] = useState<Partial<InboxFilters>>({
    page: 0,
    size: 20,
  })
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null)
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false)

  const { data, isLoading, error, refetch } = useGetInboxThreadsQuery(filters)
  const [markAsRead] = useMarkThreadAsReadMutation()

  const handleFilterChange = (newFilters: Partial<InboxFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleResetFilters = () => {
    setFilters({ page: 0, size: 20 })
  }

  const handleDelegateClick = (thread: InboxThread) => {
    setSelectedThread(thread)
    setIsDelegateModalOpen(true)
  }

  const handleMarkAsRead = async (threadId: string) => {
    try {
      await markAsRead(threadId).unwrap()
      refetch()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

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

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Błąd ładowania inboxa: {String(error)}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Centralny Inbox</h1>
        <p className="text-gray-600 mt-1">
          Zarządzaj wiadomościami ze wszystkich projektów
        </p>
      </div>

      {/* Unread badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Nieprzeczytane: {data?.content.filter((t) => t.status === 'NEW').length || 0}
        </span>
      </div>

      {/* Filters */}
      <InboxFilters
        {...filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Thread list */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wątek
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projekt
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Przypisany do
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ostatnia wiadomość
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wiadomości
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.content.map((thread) => (
              <tr
                key={thread.id}
                className={`hover:bg-gray-50 ${thread.status === 'NEW' ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      thread.status
                    )}`}
                  >
                    {thread.status === 'NEW' && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-1.5"></span>
                    )}
                    {thread.status === 'NEW'
                      ? 'Nowy'
                      : thread.status === 'IN_PROGRESS'
                      ? 'W trakcie'
                      : thread.status === 'RESOLVED'
                      ? 'Rozwiązany'
                      : 'Zamknięty'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{thread.title}</div>
                  <div className="text-xs text-gray-500">
                    {thread.participants.slice(0, 3).join(', ')}
                    {thread.participants.length > 3 && '...'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{thread.project_name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {thread.assigned_to_name ? (
                    <div className="text-sm text-gray-900">{thread.assigned_to_name}</div>
                  ) : (
                    <span className="text-sm text-gray-400">Nieprzypisany</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
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
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{thread.message_count}</span>
                  {thread.unread_count > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {thread.unread_count} nowych
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelegateClick(thread)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Deleguj
                  </button>
                  {thread.status === 'NEW' && (
                    <button
                      onClick={() => handleMarkAsRead(thread.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Oznacz jako przeczytane
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.content.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Brak wątków do wyświetlenia</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Strona {data.pageNumber + 1} z {data.totalPages} ({data.totalElements} wątków)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange({ page: Math.max(0, (filters.page || 0) - 1) })}
              disabled={data.isFirst}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Poprzednia
            </button>
            <button
              onClick={() =>
                handleFilterChange({ page: Math.min(data.totalPages - 1, (filters.page || 0) + 1) })
              }
              disabled={data.isLast}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Następna
            </button>
          </div>
        </div>
      )}

      {/* Delegate Modal */}
      {selectedThread && (
        <MessageDelegateModal
          isOpen={isDelegateModalOpen}
          onClose={() => {
            setIsDelegateModalOpen(false)
            setSelectedThread(null)
          }}
          threadId={selectedThread.id}
          threadTitle={selectedThread.title}
        />
      )}
    </div>
  )
}

export default InboxPage
