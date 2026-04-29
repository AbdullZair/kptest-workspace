import { memo } from 'react'
import { Card } from '@shared/components'
import { ProjectStatus } from './ProjectStatus'
import type { ProjectStatisticsProps } from '../types'
import { clsx } from 'clsx'

/**
 * ProjectStatistics Component
 *
 * Displays comprehensive statistics for a project
 *
 * @example
 * ```tsx
 * <ProjectStatistics statistics={statistics} />
 * ```
 */
export const ProjectStatistics = memo(({ statistics, className }: ProjectStatisticsProps) => {
  const {
    project_name: _project_name,
    status,
    total_patients,
    active_patients,
    completed_patients,
    removed_patients,
    team_members,
    average_compliance_score,
    compliance_distribution,
    stage_distribution,
  } = statistics

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Statystyki projektu</h2>
        <ProjectStatus status={status} size="md" showLabel={true} />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Łączna liczba pacjentów"
          value={total_patients}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          }
          color="primary"
        />
        <StatCard
          title="Aktywni pacjenci"
          value={active_patients}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
          color="emerald"
        />
        <StatCard
          title="Zakończone terapie"
          value={completed_patients}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          }
          color="violet"
        />
        <StatCard
          title="Członkowie zespołu"
          value={team_members}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          }
          color="secondary"
        />
      </div>

      {/* Compliance Score */}
      {average_compliance_score != null && (
        <Card variant="outlined">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-neutral-600">Średni wynik compliance</h3>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {Math.round(average_compliance_score)}%
                </p>
              </div>
              <div className="relative h-32 w-32">
                <ComplianceGauge value={average_compliance_score} />
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Distribution Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stage Distribution */}
        <Card variant="outlined">
          <Card.Body>
            <h3 className="mb-4 text-sm font-medium text-neutral-600">Etapy terapii</h3>
            <div className="space-y-3">
              {stage_distribution
                ? Object.entries(stage_distribution).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{getStageLabel(stage)}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 rounded-full bg-neutral-100">
                          <div
                            className={`h-2 rounded-full ${getStageColor(stage)}`}
                            style={{
                              width: `${total_patients > 0 ? (count / total_patients) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-medium text-neutral-900">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </Card.Body>
        </Card>

        {/* Compliance Distribution */}
        <Card variant="outlined">
          <Card.Body>
            <h3 className="mb-4 text-sm font-medium text-neutral-600">Rozkład compliance</h3>
            <div className="space-y-3">
              {compliance_distribution
                ? Object.entries(compliance_distribution).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{range}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 rounded-full bg-neutral-100">
                          <div
                            className={`h-2 rounded-full ${getComplianceColor(range)}`}
                            style={{
                              width: `${active_patients > 0 ? (count / active_patients) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-medium text-neutral-900">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Removed Patients */}
      {removed_patients > 0 && (
        <Card variant="outlined">
          <Card.Body>
            <div className="flex items-center gap-2 text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">
                Usunięci pacjenci: <strong>{removed_patients}</strong>
              </span>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
})

/**
 * StatCard sub-component
 */
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'emerald' | 'violet'
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <Card variant="outlined" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          <p className="text-xs text-neutral-600">{title}</p>
        </div>
      </div>
    </Card>
  )
}

/**
 * ComplianceGauge sub-component (simple circular progress)
 */
const ComplianceGauge = ({ value }: { value: number }) => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 80 ? 'text-emerald-500' : value >= 50 ? 'text-amber-500' : 'text-rose-500'

  return (
    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
      <circle
        className="text-neutral-200"
        strokeWidth="12"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="60"
        cy="60"
      />
      <circle
        className={`${color} transition-all duration-500 ease-in-out`}
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="60"
        cy="60"
      />
    </svg>
  )
}

/**
 * Get stage label
 */
const getStageLabel = (stage: string): string => {
  const labels: Record<string, string> = {
    NOT_STARTED: 'Nierozpoczęte',
    IN_PROGRESS: 'W trakcie',
    COMPLETED: 'Zakończone',
    REMOVED: 'Usunięte',
  }
  return labels[stage] || stage
}

/**
 * Get stage color
 */
const getStageColor = (stage: string): string => {
  const colors: Record<string, string> = {
    NOT_STARTED: 'bg-neutral-400',
    IN_PROGRESS: 'bg-blue-500',
    COMPLETED: 'bg-emerald-500',
    REMOVED: 'bg-rose-500',
  }
  return colors[stage] || 'bg-neutral-400'
}

/**
 * Get compliance color
 */
const getComplianceColor = (range: string): string => {
  if (range.includes('HIGH')) return 'bg-emerald-500'
  if (range.includes('MEDIUM')) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default ProjectStatistics
