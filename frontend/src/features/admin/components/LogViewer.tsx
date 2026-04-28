import { memo, useState } from 'react'
import type { AuditLog, SystemLog } from '../types'
import { clsx } from 'clsx'

/**
 * LogViewer component props
 */
export interface LogViewerProps {
  log: AuditLog | SystemLog
  onClose?: () => void
  className?: string
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Get action color for audit logs
 */
const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800 border-green-200',
    UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
    VIEW: 'bg-gray-100 text-gray-800 border-gray-200',
    LOGIN: 'bg-purple-100 text-purple-800 border-purple-200',
    LOGOUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  return colors[action] || colors.VIEW
}

/**
 * Get level color for system logs
 */
const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    DEBUG: 'bg-gray-100 text-gray-800 border-gray-200',
    INFO: 'bg-blue-100 text-blue-800 border-blue-200',
    WARN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ERROR: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[level] || colors.INFO
}

/**
 * Check if log is audit log
 */
const isAuditLog = (log: AuditLog | SystemLog): log is AuditLog => {
  return 'action' in log
}

/**
 * LogViewer Component
 *
 * Displays detailed information about a log entry
 *
 * @example
 * ```tsx
 * <LogViewer log={log} onClose={handleClose} />
 * ```
 */
export const LogViewer = memo(({ log, onClose, className }: LogViewerProps) => {
  const [showOldValue, setShowOldValue] = useState(false)
  const [showNewValue, setShowNewValue] = useState(false)

  const baseStyles = clsx(
    'bg-white rounded-lg border border-neutral-200 overflow-hidden',
    className
  )

  const isAudit = isAuditLog(log)

  return (
    <div className={baseStyles}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">
            {isAudit ? 'Szczegóły logu audytu' : 'Szczegóły logu systemowego'}
          </h3>
          {isAudit ? (
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                getActionColor(log.action)
              )}
            >
              {log.action}
            </span>
          ) : (
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                getLevelColor(log.level)
              )}
            >
              {log.level}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 transition-colors hover:text-neutral-600"
          aria-label="Zamknij"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        {/* Common fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-neutral-500">ID logu</dt>
            <dd className="mt-1 rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
              {log.log_id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-neutral-500">Data i czas</dt>
            <dd className="mt-1 text-sm text-neutral-900">{formatDate(log.created_at)}</dd>
          </div>
        </div>

        {isAudit ? (
          /* Audit log specific fields */
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">ID użytkownika</dt>
                <dd className="mt-1 rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
                  {log.user_id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Adres IP</dt>
                <dd className="mt-1 text-sm text-neutral-900">{log.ip_address || '-'}</dd>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Typ encji</dt>
                <dd className="mt-1 rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
                  {log.entity_type}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">ID encji</dt>
                <dd className="mt-1 rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
                  {log.entity_id || '-'}
                </dd>
              </div>
            </div>

            {log.user_agent ? (
              <div>
                <dt className="text-sm font-medium text-neutral-500">User Agent</dt>
                <dd className="mt-1 break-all rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
                  {log.user_agent}
                </dd>
              </div>
            ) : null}

            {/* Old Value */}
            {log.old_value ? (
              <div>
                <button
                  onClick={() => setShowOldValue(!showOldValue)}
                  className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <span>Stara wartość</span>
                  <svg
                    className={clsx(
                      'ml-1 h-4 w-4 transition-transform',
                      showOldValue && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showOldValue ? (
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-neutral-100 p-3 text-xs text-neutral-700">
                    {log.old_value}
                  </pre>
                ) : null}
              </div>
            ) : null}

            {/* New Value */}
            {log.new_value ? (
              <div>
                <button
                  onClick={() => setShowNewValue(!showNewValue)}
                  className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <span>Nowa wartość</span>
                  <svg
                    className={clsx(
                      'ml-1 h-4 w-4 transition-transform',
                      showNewValue && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showNewValue ? (
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-neutral-100 p-3 text-xs text-neutral-700">
                    {log.new_value}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          /* System log specific fields */
          <>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Wiadomość</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-neutral-900">{log.message}</dd>
            </div>

            {log.source_class ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Klasa źródłowa</dt>
                  <dd className="mt-1 rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
                    {log.source_class}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Metoda źródłowa</dt>
                  <dd className="mt-1 rounded bg-neutral-100 px-2 py-1 font-mono text-sm text-neutral-900">
                    {log.source_method || '-'}
                  </dd>
                </div>
              </div>
            ) : null}

            {log.stack_trace ? (
              <div>
                <dt className="text-sm font-medium text-neutral-500">Stack Trace</dt>
                <pre className="mt-2 max-h-64 overflow-auto rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {log.stack_trace}
                </pre>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
})

export default LogViewer
