import { memo } from 'react'
import type { ProjectStats } from '../../types'
import { clsx } from 'clsx'

export interface ProjectStatsCardProps {
  /**
   * Project statistics data
   */
  stats?: ProjectStats
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Click handler
   */
  onClick?: () => void
}

/**
 * ProjectStatsCard Component
 *
 * Displays project statistics in a card format
 */
export const ProjectStatsCard = memo(function ProjectStatsCard({
  stats,
  className,
  onClick,
}: ProjectStatsCardProps) {
  if (!stats) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6', className)}>
        <p className="text-neutral-500">Brak danych projektu</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PLANNED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    ARCHIVED: 'bg-neutral-100 text-neutral-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div
      className={clsx('bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow', className)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">{stats.project_name}</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Start: {new Date(stats.start_date).toLocaleDateString('pl-PL')}
          </p>
        </div>
        <span
          className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors[stats.status] || 'bg-gray-100 text-gray-800'
          )}
        >
          {stats.status}
        </span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-primary-600">{stats.active_patients}</p>
          <p className="text-sm text-neutral-600 mt-1">Aktywni pacjenci</p>
        </div>
        <div className="bg-secondary-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-secondary-600">{stats.team_size}</p>
          <p className="text-sm text-neutral-600 mt-1">Zespół</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-emerald-600">
            {stats.average_compliance.toFixed(1)}%
          </p>
          <p className="text-sm text-neutral-600 mt-1">Średni compliance</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.completed_patients}</p>
          <p className="text-sm text-neutral-600 mt-1">Ukończone</p>
        </div>
      </div>

      {/* Compliance Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">Compliance</span>
          <span
            className={clsx(
              'text-sm font-semibold',
              stats.is_compliant ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {stats.is_compliant ? 'Zgodny' : 'Niezgodny'} ({stats.average_compliance.toFixed(1)}% / {stats.compliance_threshold}%)
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all',
              stats.is_compliant ? 'bg-emerald-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(stats.average_compliance, 100)}%` }}
          />
        </div>
      </div>

      {/* Stage Distribution */}
      {stats.stage_distribution && Object.keys(stats.stage_distribution).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Etapy terapii</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.stage_distribution).map(([stage, count]) => (
              <span
                key={stage}
                className="px-2 py-1 bg-neutral-100 rounded text-sm text-neutral-700"
              >
                {stage}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default ProjectStatsCard
