import React, { useState } from 'react'
import { useGetInboxThreadsQuery } from '../api/inboxApi'
import { InboxFilters as InboxFiltersComponent } from '../components/InboxFilters'
import { MessageDelegateModal } from '../components/MessageDelegateModal'
import InboxThreadActions from './InboxThreadActions'
import ExportConversationButton from './ExportConversationButton'
import type { ThreadStatus, InboxFilters } from '../types'

export const InboxPage: React.FC = () => {
  const [filters, setFilters] = useState<Partial<InboxFilters>>({
    page: 0,
    size: 20,
  })
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false)

  const { data, isLoading, error, refetch } = useGetInboxThreadsQuery(filters)

  const handleFilterChange = (newFilters: Partial<InboxFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleResetFilters = () => {
    setFilters({ page: 0, size: 20 })
  }

  const handleDelegateClick = (threadId: string) => {
    setSelectedThreadId(threadId)
    setIsDelegateModalOpen(true)
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Błąd ładowania inboxa: {String(error)}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Centralny Inbox</h1>
        <p className="mt-1 text-gray-600">Zarządzaj wiadomościami ze wszystkich projektów</p>
      </div>

      {/* Unread badge */}
      <div className="mb-4">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          Nieprzeczytane: {data?.content.filter((t) => t.status === 'NEW').length || 0}
        </span>
      </div>

      {/* Filters */}
      <InboxFiltersComponent {...filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {/* Thread list */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Wątek
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Projekt
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Przypisany do
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ostatnia wiadomość
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Wiadomości
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.content.map((thread) => (
              <tr
                key={thread.id}
                className={`hover:bg-gray-50 ${thread.status === 'NEW' ? 'bg-blue-50' : ''}`}
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                      thread.status
                    )}`}
                  >
                    {thread.status === 'NEW' && (
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-600" />
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
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="text-sm text-gray-900">{thread.project_name}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {thread.assigned_to_name ? (
                    <div className="text-sm text-gray-900">{thread.assigned_to_name}</div>
                  ) : (
                    <span className="text-sm text-gray-400">Nieprzypisany</span>
                  )}
                </td>
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
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="text-sm text-gray-900">{thread.message_count}</span>
                  {thread.unread_count > 0 && (
                    <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {thread.unread_count} nowych
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleDelegateClick(thread.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Deleguj
                    </button>
                    <InboxThreadActions thread={thread} onActionComplete={refetch} />
                    <ExportConversationButton threadId={thread.id} threadTitle={thread.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.content.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">Brak wątków do wyświetlenia</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Strona {data.number + 1} z {data.totalPages} ({data.totalElements} wątków)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange({ page: Math.max(0, (filters.page || 0) - 1) })}
              disabled={data.first}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Poprzednia
            </button>
            <button
              onClick={() =>
                handleFilterChange({ page: Math.min(data.totalPages - 1, (filters.page || 0) + 1) })
              }
              disabled={data.last}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Następna
            </button>
          </div>
        </div>
      ) : null}

      {/* Delegate Modal */}
      {selectedThreadId ? (
        <MessageDelegateModal
          isOpen={isDelegateModalOpen}
          onClose={() => {
            setIsDelegateModalOpen(false)
            setSelectedThreadId(null)
          }}
          threadId={selectedThreadId}
          threadTitle={data?.content.find((t) => t.id === selectedThreadId)?.title || ''}
        />
      ) : null}
    </div>
  )
}

export default InboxPage
