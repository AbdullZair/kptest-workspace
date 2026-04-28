import { useState, useMemo } from 'react'
import { Card, Button } from '@shared/components'
import { clsx } from 'clsx'

/**
 * Mock data for compliance dashboard
 * In production, this would come from API
 */
const mockComplianceData = {
  overall: 78.5,
  trend: '+5.2%',
  patients: [
    { id: '1', name: 'Jan Kowalski', compliance: 92, projects: 2, lastActive: '2h temu' },
    { id: '2', name: 'Anna Nowak', compliance: 85, projects: 1, lastActive: '1d temu' },
    { id: '3', name: 'Piotr Wiśniewski', compliance: 67, projects: 2, lastActive: '3d temu' },
    { id: '4', name: 'Maria Wójcik', compliance: 45, projects: 1, lastActive: '7d temu' },
    { id: '5', name: 'Krzysztof Kowalczyk', compliance: 88, projects: 3, lastActive: '30min temu' },
  ],
  distribution: {
    excellent: 12,
    good: 28,
    average: 35,
    low: 18,
    critical: 7,
  },
  weeklyTrend: [
    { day: 'Pon', value: 72 },
    { day: 'Wt', value: 75 },
    { day: 'Śr', value: 74 },
    { day: 'Czw', value: 78 },
    { day: 'Pt', value: 80 },
    { day: 'Sob', value: 76 },
    { day: 'Ndz', value: 79 },
  ],
}

/**
 * ComplianceGauge Component
 */
interface ComplianceGaugeProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({
  value,
  size = 'md',
  showLabel = true,
}) => {
  const sizes = {
    sm: { width: 80, strokeWidth: 8 },
    md: { width: 120, strokeWidth: 10 },
    lg: { width: 180, strokeWidth: 12 },
  }

  const { width, strokeWidth } = sizes[size]
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 80) return 'text-success-500'
    if (val >= 60) return 'text-amber-500'
    return 'text-error-500'
  }

  const getLabel = (val: number) => {
    if (val >= 80) return 'Doskonały'
    if (val >= 60) return 'Dobry'
    if (val >= 40) return 'Średni'
    return 'Niski'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={width} className="-rotate-90 transform">
        <circle
          className="text-neutral-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={width / 2}
          cy={width / 2}
        />
        <circle
          className={clsx(getColor(value), 'transition-all duration-500 ease-in-out')}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={width / 2}
          cy={width / 2}
        />
      </svg>
      {showLabel ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span
              className={clsx('font-bold', getColor(value), size === 'lg' ? 'text-3xl' : 'text-xl')}
            >
              {Math.round(value)}%
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/**
 * BarChart Component (simple SVG implementation)
 */
interface BarChartProps {
  data: { day: string; value: number }[]
  height?: number
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map((d) => d.value))
  const barWidth = 40
  const gap = 20

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${data.length * (barWidth + gap)} ${height}`} className="h-full w-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <g key={y}>
            <line
              x1="0"
              y1={height - (y / 100) * height}
              x2={data.length * (barWidth + gap)}
              y2={height - (y / 100) * height}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x="-5"
              y={height - (y / 100) * height + 4}
              textAnchor="end"
              className="fill-neutral-500 text-xs"
            >
              {y}%
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 30)
          const x = i * (barWidth + gap) + gap / 2
          const y = height - barHeight - 20

          const color = d.value >= 80 ? '#10b981' : d.value >= 60 ? '#f59e0b' : '#ef4444'

          return (
            <g key={d.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                className="transition-all duration-300 hover:opacity-80"
              />
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="fill-neutral-600 text-xs"
              >
                {d.day}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-neutral-700 text-xs font-medium"
              >
                {d.value}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * DistributionBar Component
 */
interface DistributionBarProps {
  label: string
  value: number
  total: number
  color: string
}

const DistributionBar: React.FC<DistributionBarProps> = ({ label, value, total, color }) => {
  const percentage = (value / total) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <span className="font-medium text-neutral-900">
          {value} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-neutral-100">
        <div
          className={clsx('h-2.5 rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * ComplianceDashboard Component
 *
 * Dashboard showing patient compliance statistics across all projects
 */
export const ComplianceDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedProject, setSelectedProject] = useState<string>('all')

  const totalPatients = useMemo(
    () => Object.values(mockComplianceData.distribution).reduce((a, b) => a + b, 0),
    []
  )

  const atRiskPatients = useMemo(
    () => mockComplianceData.distribution.low + mockComplianceData.distribution.critical,
    []
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard Compliance</h1>
          <p className="mt-1 text-neutral-600">
            Monitoruj poziom adherencji terapeutycznej pacjentów
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Eksportuj
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined">
        <Card.Body>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Okres</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Ostatnie 7 dni</option>
                <option value="30d">Ostatnie 30 dni</option>
                <option value="90d">Ostatnie 90 dni</option>
                <option value="1y">Ostatni rok</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Projekt</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Wszystkie projekty</option>
                <option value="1">Projekt A</option>
                <option value="2">Projekt B</option>
                <option value="3">Projekt C</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Średni compliance</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                {mockComplianceData.overall}%
              </p>
              <p className="mt-1 flex items-center text-sm text-success-600">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {mockComplianceData.trend} vs ostatni okres
              </p>
            </div>
            <ComplianceGauge value={mockComplianceData.overall} size="md" showLabel={false} />
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div>
            <p className="text-sm font-medium text-neutral-600">Pacjenci z wysokim compliance</p>
            <p className="mt-2 text-3xl font-bold text-success-600">
              {mockComplianceData.distribution.excellent + mockComplianceData.distribution.good}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {Math.round(
                ((mockComplianceData.distribution.excellent +
                  mockComplianceData.distribution.good) /
                  totalPatients) *
                  100
              )}
              % wszystkich pacjentów
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div>
            <p className="text-sm font-medium text-neutral-600">Pacjenci zagrożeni</p>
            <p className="mt-2 text-3xl font-bold text-error-600">{atRiskPatients}</p>
            <p className="mt-1 text-sm text-neutral-500">Wymagają interwencji terapeutycznej</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div>
            <p className="text-sm font-medium text-neutral-600">Aktywnych pacjentów</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">{totalPatients}</p>
            <p className="mt-1 text-sm text-neutral-500">Wszyscy pacjenci w projektach</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Trend tygodniowy</h2>
          </Card.Header>
          <Card.Body>
            <BarChart data={mockComplianceData.weeklyTrend} height={250} />
          </Card.Body>
        </Card>

        {/* Distribution */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Rozkład compliance</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <DistributionBar
                label="Doskonały (&gt;90%)"
                value={mockComplianceData.distribution.excellent}
                total={totalPatients}
                color="bg-success-500"
              />
              <DistributionBar
                label="Dobry (70-90%)"
                value={mockComplianceData.distribution.good}
                total={totalPatients}
                color="bg-emerald-500"
              />
              <DistributionBar
                label="Średni (50-70%)"
                value={mockComplianceData.distribution.average}
                total={totalPatients}
                color="bg-amber-500"
              />
              <DistributionBar
                label="Niski (30-50%)"
                value={mockComplianceData.distribution.low}
                total={totalPatients}
                color="bg-orange-500"
              />
              <DistributionBar
                label="Krytyczny (&lt;30%)"
                value={mockComplianceData.distribution.critical}
                total={totalPatients}
                color="bg-error-500"
              />
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Patients Table */}
      <Card variant="elevated">
        <Card.Header>
          <h2 className="text-lg font-semibold text-neutral-900">Pacjenci wymagający uwagi</h2>
          <Button variant="outline" size="sm">
            Zobacz wszystkich
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Pacjent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Projekty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Ostatnia aktywność
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {mockComplianceData.patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{patient.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full bg-neutral-100">
                          <div
                            className={clsx(
                              'h-2 rounded-full',
                              patient.compliance >= 80
                                ? 'bg-success-500'
                                : patient.compliance >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-error-500'
                            )}
                            style={{ width: `${patient.compliance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          {patient.compliance}%
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-neutral-600">{patient.projects}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-neutral-600">{patient.lastActive}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button className="mr-3 text-primary-600 hover:text-primary-900">
                        Zobacz
                      </button>
                      <button className="text-secondary-600 hover:text-secondary-900">
                        Wiadomość
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ComplianceDashboard
