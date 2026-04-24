import { memo } from 'react'
import type { DashboardKpi } from '../../types'
import { clsx } from 'clsx'

export interface DashboardKpiCardProps {
  /**
   * KPI data
   */
  kpi?: DashboardKpi
  /**
   * Additional CSS classes
   */
  className?: string
}

export interface KpiMetricProps {
  /**
   * Metric title
   */
  title: string
  /**
   * Metric value
   */
  value: string | number
  /**
   * Metric change (optional)
   */
  change?: number
  /**
   * Icon (optional)
   */
  icon?: React.ReactNode
  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

/**
 * KpiMetric Component
 *
 * Displays a single KPI metric
 */
const KpiMetric = memo(function KpiMetric({
  title,
  value,
  change,
  icon,
  variant = 'primary',
}: KpiMetricProps) {
  const variantColors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {change !== undefined && (
            <p
              className={clsx(
                'text-sm mt-1',
                change >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx('p-3 rounded-full', variantColors[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
})

/**
 * DashboardKpiCard Component
 *
 * Displays dashboard KPI metrics
 */
export const DashboardKpiCard = memo(function DashboardKpiCard({
  kpi,
  className,
}: DashboardKpiCardProps) {
  if (!kpi) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6', className)}>
        <p className="text-neutral-500">Brak danych KPI</p>
      </div>
    )
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetric
          title="Projekty"
          value={`${kpi.active_projects}/${kpi.total_projects}`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          variant="primary"
        />
        <KpiMetric
          title="Pacjenci"
          value={`${kpi.active_patients}/${kpi.total_patients}`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          variant="secondary"
        />
        <KpiMetric
          title="Personel"
          value={kpi.total_staff}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          variant="success"
        />
        <KpiMetric
          title="Wiadomości"
          value={kpi.pending_messages}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          variant="warning"
        />
      </div>

      {/* Compliance & Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-neutral-600 mb-2">Średni Compliance</h4>
          <p
            className={clsx(
              'text-3xl font-bold',
              kpi.average_compliance >= 80
                ? 'text-emerald-600'
                : kpi.average_compliance >= 50
                  ? 'text-amber-600'
                  : 'text-red-600'
            )}
          >
            {kpi.average_compliance.toFixed(1)}%
          </p>
          <div className="mt-3 w-full bg-neutral-200 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full',
                kpi.average_compliance >= 80
                  ? 'bg-emerald-500'
                  : kpi.average_compliance >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              )}
              style={{ width: `${kpi.average_compliance}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-neutral-600 mb-2">Frekwencja na Sesjach</h4>
          <p className="text-3xl font-bold text-neutral-900">
            {kpi.overall_session_attendance.toFixed(1)}%
          </p>
          <div className="mt-3 w-full bg-neutral-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${kpi.overall_session_attendance}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-neutral-600 mb-2">Ukończenie Materiałów</h4>
          <p className="text-3xl font-bold text-neutral-900">
            {kpi.materials_completion_rate.toFixed(1)}%
          </p>
          <div className="mt-3 w-full bg-neutral-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-purple-500"
              style={{ width: `${kpi.materials_completion_rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Alerts & Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-600">Projekty Zagrożone</h4>
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {kpi.projects_at_risk}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            Projekty z compliance poniżej progu
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-600">Nadchodzące Sesje</h4>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {kpi.upcoming_sessions}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            W ciągu najbliższych 7 dni
          </p>
        </div>
      </div>

      {/* Recent Alerts */}
      {kpi.recent_alerts && kpi.recent_alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-neutral-600 mb-4">Ostatnie Alerty</h4>
          <div className="space-y-2">
            {kpi.recent_alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg',
                  alert.severity === 'HIGH'
                    ? 'bg-red-50 border border-red-200'
                    : alert.severity === 'MEDIUM'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-blue-50 border border-blue-200'
                )}
              >
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    alert.severity === 'HIGH'
                      ? 'bg-red-500'
                      : alert.severity === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                  )}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{alert.message}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Date(alert.created_at).toLocaleString('pl-PL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default DashboardKpiCard
