import { memo } from 'react'
import type { SystemHealth } from '../types'
import { clsx } from 'clsx'

/**
 * SystemHealthCard component props
 */
export interface SystemHealthCardProps {
  health: SystemHealth
  className?: string
}

/**
 * Get status color
 */
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    UP: 'bg-green-500',
    DOWN: 'bg-red-500',
    DEGRADED: 'bg-yellow-500',
  }
  return colors[status] || colors.DEGRADED || ''
}

/**
 * Get status label in Polish
 */
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    UP: 'Działa',
    DOWN: 'Niedostępny',
    DEGRADED: 'Ograniczona wydajność',
  }
  return labels[status] || status
}

/**
 * Format uptime
 */
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(' ') || '< 1m'
}

/**
 * SystemHealthCard Component
 *
 * Displays system health status
 *
 * @example
 * ```tsx
 * <SystemHealthCard health={health} />
 * ```
 */
export const SystemHealthCard = memo(({ health, className = '' }: SystemHealthCardProps) => {
  const statusColor = getStatusColor(health.status)
  const statusLabel = getStatusLabel(health.status)

  return (
    <div
      className={clsx('overflow-hidden rounded-lg border border-neutral-200 bg-white', className)}
    >
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Status systemu</h3>
          <div className="flex items-center gap-2">
            <span className={clsx('h-3 w-3 animate-pulse rounded-full', statusColor)} />
            <span className="text-sm font-medium text-neutral-700">{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        {/* Uptime */}
        <dl className="flex items-center justify-between rounded-lg bg-neutral-50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Czas działania</dt>
              <dd className="text-lg font-semibold text-neutral-900">
                {formatUptime(health.uptime_seconds)}
              </dd>
            </div>
          </div>
          <div className="text-right">
            <dt className="text-sm font-medium text-neutral-500">Wersja</dt>
            <dd className="font-mono text-sm text-neutral-700">{health.version}</dd>
          </div>
        </dl>

        {/* Component Status */}
        <div className="space-y-3">
          {Object.entries(health.details).map(([component, detail]) => (
            <div
              key={component}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
            >
              <div className="flex items-center gap-3">
                <span className={clsx('h-2.5 w-2.5 rounded-full', getStatusColor(detail.status))} />
                <span className="text-sm font-medium capitalize text-neutral-700">
                  {component === 'database' ? 'Baza danych' : component}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {detail.response_time_ms ? (
                  <span className="text-sm text-neutral-500">{detail.response_time_ms}ms</span>
                ) : null}
                <span
                  className={clsx(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    detail.status === 'UP'
                      ? 'bg-green-100 text-green-800'
                      : detail.status === 'DOWN'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {getStatusLabel(detail.status)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Timestamp */}
        <div className="border-t border-neutral-200 pt-4">
          <p className="text-center text-xs text-neutral-500">
            Ostatnia aktualizacja: {new Date(health.timestamp).toLocaleString('pl-PL')}
          </p>
        </div>
      </div>
    </div>
  )
})

export default SystemHealthCard
