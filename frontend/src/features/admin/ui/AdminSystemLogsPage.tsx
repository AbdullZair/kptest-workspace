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

  const handleSortChange = () => {
    setFilters((prev) => ({ ...prev, page: 0 }))
  }

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
            onClick={() => handleExport('CSV')}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
          >
            Eksport CSV
          </button>
          <button
            onClick={() => handleExport('JSON')}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
          >
            Eksport JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Poziom:</span>
          <div className="flex flex-wrap gap-1">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelFilter(level)}
                className={clsx(
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  filters.level === level || (level === 'ALL' && !filters.level)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                {level === 'ALL' ? 'Wszystkie' : level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-64">
          <div className="relative">
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Szukaj w wiadomościach..."
              className="w-full px-4 py-2 pl-10 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* System Log Table */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Wystąpił błąd podczas ładowania logów systemowych</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Poziom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Wiadomość
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Źródło
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Data i czas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-6 bg-neutral-200 rounded w-20" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-neutral-200 rounded w-64" />
                        </td>
                        <td className="hidden md:table-cell px-4 py-3">
                          <div className="h-4 bg-neutral-200 rounded w-32" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-neutral-200 rounded w-32" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="h-6 bg-neutral-200 rounded w-16 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : data?.content.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 text-neutral-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-neutral-500">Brak logów systemowych do wyświetlenia</p>
                      </td>
                    </tr>
                  ) : (
                    data?.content.map((log) => (
                      <tr
                        key={log.log_id}
                        className="hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getLevelColor(log.level)
                            )}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-neutral-900 truncate max-w-md">
                            {log.message}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                          <code className="text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            {log.source_class || '-'}
                          </code>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                          {new Date(log.created_at).toLocaleString('pl-PL')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(log)
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
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
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-lg">
              <div className="text-sm text-neutral-700">
                Strona {data.pageNumber + 1} z {data.totalPages} ({data.totalElements} logów)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(0, prev.page! - 1) }))}
                  disabled={data.isFirst}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={data.isLast}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Log Viewer Modal */}
      {showLogViewer && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <LogViewer log={selectedLog} onClose={() => setShowLogViewer(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSystemLogsPage
