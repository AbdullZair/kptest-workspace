import { memo } from 'react'
import type { SystemMetrics } from '../types'
import { clsx } from 'clsx'

/**
 * SystemMetricsChart component props
 */
export interface SystemMetricsChartProps {
  metrics: SystemMetrics
  className?: string
}

/**
 * Format bytes to human readable
 */
const formatBytes = (mb: number): string => {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`
  }
  return `${mb.toFixed(0)} MB`
}

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('pl-PL')
}

/**
 * Progress bar component
 */
const ProgressBar = ({
  value,
  max,
  color = 'primary',
  label,
}: {
  value: number
  max: number
  color?: 'primary' | 'success' | 'warning' | 'danger'
  label?: string
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }

  const getColor = () => {
    if (percentage >= 90) return 'danger'
    if (percentage >= 70) return 'warning'
    if (percentage >= 40) return 'success'
    return 'primary'
  }

  const finalColor = color === 'primary' ? getColor() : color

  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700">{label}</span>
          <span className="text-neutral-500">{percentage.toFixed(1)}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={clsx('h-full transition-all duration-500', colorClasses[finalColor])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Metric card component
 */
const MetricCard = ({
  icon,
  iconColor,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  iconColor: string
  title: string
  value: string | number
  subtitle?: string
}) => (
  <div className="rounded-lg bg-neutral-50 p-4">
    <div className="flex items-center gap-3">
      <div className={clsx('rounded-lg p-2', iconColor)}>{icon}</div>
      <div>
        <dt className="text-sm font-medium text-neutral-500">{title}</dt>
        <dd className="text-lg font-semibold text-neutral-900">{value}</dd>
        {subtitle ? <dd className="text-xs text-neutral-500">{subtitle}</dd> : null}
      </div>
    </div>
  </div>
)

/**
 * SystemMetricsChart Component
 *
 * Displays system metrics with visual charts
 *
 * @example
 * ```tsx
 * <SystemMetricsChart metrics={metrics} />
 * ```
 */
export const SystemMetricsChart = memo(({ metrics, className = '' }: SystemMetricsChartProps) => {
  const { memory_usage, cpu_usage, database_metrics, cache_metrics, user_metrics } = metrics

  return (
    <div
      className={clsx('overflow-hidden rounded-lg border border-neutral-200 bg-white', className)}
    >
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-neutral-900">Metryki systemu</h3>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Memory Usage */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-neutral-700">Użycie pamięci</h4>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              }
              iconColor="bg-blue-100 text-blue-600"
              title="Łącznie"
              value={formatBytes(memory_usage.total_mb)}
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              iconColor="bg-green-100 text-green-600"
              title="Wolne"
              value={formatBytes(memory_usage.free_mb)}
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              iconColor="bg-purple-100 text-purple-600"
              title="Użyte"
              value={formatBytes(memory_usage.used_mb)}
            />
          </div>
          <ProgressBar value={memory_usage.usage_percent} max={100} label="Wykorzystanie pamięci" />
        </div>

        {/* CPU Usage */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-neutral-700">Procesor</h4>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              }
              iconColor="bg-orange-100 text-orange-600"
              title="Rdzenie"
              value={cpu_usage.available_processors}
              subtitle="Dostępne procesory"
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              iconColor="bg-red-100 text-red-600"
              title="Obciążenie"
              value={`${cpu_usage.system_load_percent.toFixed(1)}%`}
              subtitle="Systemowe"
            />
          </div>
        </div>

        {/* Database Metrics */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-neutral-700">Baza danych</h4>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              }
              iconColor="bg-cyan-100 text-cyan-600"
              title="Połączenia"
              value={`${database_metrics.active_connections}/${database_metrics.max_connections}`}
              subtitle="Aktywne / Maksymalne"
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              }
              iconColor="bg-indigo-100 text-indigo-600"
              title="Rekordy"
              value={formatNumber(database_metrics.total_records)}
              subtitle="Łącznie w bazie"
            />
          </div>
        </div>

        {/* User Metrics */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-neutral-700">Użytkownicy</h4>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
              iconColor="bg-gray-100 text-gray-600"
              title="Łącznie"
              value={formatNumber(user_metrics.total_users)}
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconColor="bg-green-100 text-green-600"
              title="Aktywni"
              value={formatNumber(user_metrics.active_users)}
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              }
              iconColor="bg-blue-100 text-blue-600"
              title="Online"
              value={formatNumber(user_metrics.online_users)}
            />
          </div>
        </div>

        {/* Cache Metrics */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-neutral-700">Cache</h4>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              }
              iconColor={
                cache_metrics.connected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }
              title="Status"
              value={cache_metrics.connected ? 'Połączony' : 'Rozłączony'}
            />
            <MetricCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              }
              iconColor="bg-yellow-100 text-yellow-600"
              title="Klucze"
              value={formatNumber(cache_metrics.keys_count)}
              subtitle="W cache"
            />
          </div>
        </div>

        {/* Timestamp */}
        <div className="border-t border-neutral-200 pt-4">
          <p className="text-center text-xs text-neutral-500">
            Ostatnia aktualizacja: {new Date(metrics.timestamp).toLocaleString('pl-PL')}
          </p>
        </div>
      </div>
    </div>
  )
})

export default SystemMetricsChart
