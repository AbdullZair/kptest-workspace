import { useState } from 'react'
import { useGetAuditLogsQuery, useExportAuditLogsMutation } from '../api/adminApi'
import { AuditLogTable, LogViewer } from '../components'
import type { AuditLog, AuditLogFilters, AuditAction } from '../types'
import { clsx } from 'clsx'

/**
 * AdminAuditLogsPage Component
 *
 * Main page for viewing audit logs in the admin panel
 */
export function AdminAuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 0,
    size: 20,
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showLogViewer, setShowLogViewer] = useState(false)

  const { data, isLoading, error, refetch } = useGetAuditLogsQuery(filters)
  const [exportAuditLogs] = useExportAuditLogsMutation()

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, page: 0 }))
  }

  const handleActionFilter = (action: AuditAction | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      action: action === 'ALL' ? undefined : action,
      page: 0,
    }))
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowLogViewer(true)
  }

  const handleExport = async (format: 'CSV' | 'JSON') => {
    try {
      const blob = await exportAuditLogs({ format }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export audit logs:', error)
    }
  }

  const actions: (AuditAction | 'ALL')[] = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Logi audytu</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Przeglądaj historię akcji użytkowników w systemie
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
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Akcja:</span>
          <div className="flex flex-wrap gap-1">
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => handleActionFilter(action)}
                className={clsx(
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  filters.action === action || (action === 'ALL' && !filters.action)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                {action === 'ALL' ? 'Wszystkie' : action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Wystąpił błąd podczas ładowania logów audytu</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <>
          <AuditLogTable
            logs={data?.content || []}
            isLoading={isLoading}
            onLogClick={setSelectedLog}
            onViewDetails={handleViewDetails}
            sortField="created_at"
            sortOrder="desc"
            onSortChange={handleSortChange}
          />

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

export default AdminAuditLogsPage
