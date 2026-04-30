import { useState } from 'react'
import { useGetSystemLogsQuery, useExportSystemLogsMutation } from '../api/adminApi'
import { LogViewer } from '../components'
import type { SystemLog, SystemLogFilters, LogLevel } from '../types'
import { clsx } from 'clsx'

/**
 * AdminSystemLogsPage Component
 *
 * Main page for viewing system logs in the admin panel
 */
export function AdminSystemLogsPage() {
  const [filters, setFilters] = useState<SystemLogFilters>({
    page: 0,
    size: 20,
  })
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)
  const [showLogViewer, setShowLogViewer] = useState(false)

  const { data, isLoading, error, refetch } = useGetSystemLogsQuery(filters)
  const [exportSystemLogs] = useExportSystemLogsMutation()

  // Reserved for sortable column headers; currently resets pagination only.
  const _handleSortChange = () => {
    setFilters((prev) => ({ ...prev, page: 0 }))
  }
  void _handleSortChange

  const handleLevelFilter = (level: LogLevel | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      level: level === 'ALL' ? undefined : level,
      page: 0,
    }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 0,
    }))
  }

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log)
    setShowLogViewer(true)
  }

  const handleExport = async (format: 'CSV' | 'JSON') => {
    try {
      const blob = await exportSystemLogs({ format }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system_logs_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export system logs:', error)
    }
  }

  const levels: (LogLevel | 'ALL')[] = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR']

  const getLevelColor = (level: LogLevel): string => {
    const colors: Record<LogLevel, string> = {
      DEBUG: 'bg-gray-100 text-gray-800',
      INFO: 'bg-blue-100 text-blue-800',
      WARN: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
    }
    return colors[level] || colors.INFO
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Logi systemowe</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Przeglądaj logi zdarzeń i błędów systemowych
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => handleExport('CSV')}
          >
            Eksport CSV
          </button>
          <button
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => handleExport('JSON')}
          >
            Eksport JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Poziom:</span>
          <div className="flex flex-wrap gap-1">
            {levels.map((level) => (
              <button
                key={level}
                className={clsx(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  filters.level === level || (level === 'ALL' && !filters.level)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
                onClick={() => handleLevelFilter(level)}
              >
                {level === 'ALL' ? 'Wszystkie' : level}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-64 flex-1">
          <div className="relative">
            <input
              className="w-full rounded-md border border-neutral-300 px-4 py-2 pl-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              placeholder="Szukaj w wiadomościach..."
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* System Log Table */}
      {error ? (
        <div className="py-12 text-center">
          <p className="text-red-600">Wystąpił błąd podczas ładowania logów systemowych</p>
          <button
            className="mt-4 font-medium text-primary-600 hover:text-primary-700"
            onClick={() => refetch()}
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Poziom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Wiadomość
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 md:table-cell">
                      Źródło
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Data i czas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-6 w-20 rounded bg-neutral-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-64 rounded bg-neutral-200" />
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <div className="h-4 w-32 rounded bg-neutral-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-32 rounded bg-neutral-200" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="ml-auto h-6 w-16 rounded bg-neutral-200" />
                        </td>
                      </tr>
                    ))
                  ) : data?.content.length === 0 ? (
                    <tr>
                      <td className="py-12 text-center" colSpan={5}>
                        <svg
                          className="mx-auto mb-4 h-16 w-16 text-neutral-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                          />
                        </svg>
                        <p className="text-neutral-500">Brak logów systemowych do wyświetlenia</p>
                      </td>
                    </tr>
                  ) : (
                    data?.content.map((log) => (
                      <tr
                        key={log.log_id}
                        className="cursor-pointer transition-colors hover:bg-neutral-50"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={clsx(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              getLevelColor(log.level)
                            )}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-md truncate text-sm text-neutral-900">
                            {log.message}
                          </div>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                          <code className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                            {log.source_class || '-'}
                          </code>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                          {new Date(log.created_at).toLocaleString('pl-PL')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(log)
                            }}
                          >
                            Szczegóły
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
              <div className="text-sm text-neutral-700">
                Strona {data.pageNumber + 1} z {data.totalPages} ({data.totalElements} logów)
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={data.isFirst}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.max(0, prev.page! - 1) }))
                  }
                >
                  Poprzednia
                </button>
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={data.isLast}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                >
                  Następna
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Log Viewer Modal */}
      {showLogViewer && selectedLog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto">
            <LogViewer log={selectedLog} onClose={() => setShowLogViewer(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminSystemLogsPage
