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

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="-rotate-90 transform" height={width} width={width}>
        <circle
          className="text-neutral-200"
          cx={width / 2}
          cy={width / 2}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          className={clsx(getColor(value), 'transition-all duration-500 ease-in-out')}
          cx={width / 2}
          cy={width / 2}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
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
      <svg className="h-full w-full" viewBox={`0 0 ${data.length * (barWidth + gap)} ${height}`}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <g key={y}>
            <line
              stroke="#e5e7eb"
              strokeWidth="1"
              x1="0"
              x2={data.length * (barWidth + gap)}
              y1={height - (y / 100) * height}
              y2={height - (y / 100) * height}
            />
            <text
              className="fill-neutral-500 text-xs"
              textAnchor="end"
              x="-5"
              y={height - (y / 100) * height + 4}
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
                className="transition-all duration-300 hover:opacity-80"
                fill={color}
                height={barHeight}
                rx="4"
                width={barWidth}
                x={x}
                y={y}
              />
              <text
                className="fill-neutral-600 text-xs"
                textAnchor="middle"
                x={x + barWidth / 2}
                y={height - 5}
              >
                {d.day}
              </text>
              <text
                className="fill-neutral-700 text-xs font-medium"
                textAnchor="middle"
                x={x + barWidth / 2}
                y={y - 5}
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
          <Button size="sm" variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
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
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
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
        <Card className="p-6" variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Średni compliance</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                {mockComplianceData.overall}%
              </p>
              <p className="mt-1 flex items-center text-sm text-success-600">
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                {mockComplianceData.trend} vs ostatni okres
              </p>
            </div>
            <ComplianceGauge showLabel={false} size="md" value={mockComplianceData.overall} />
          </div>
        </Card>

        <Card className="p-6" variant="elevated">
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

        <Card className="p-6" variant="elevated">
          <div>
            <p className="text-sm font-medium text-neutral-600">Pacjenci zagrożeni</p>
            <p className="mt-2 text-3xl font-bold text-error-600">{atRiskPatients}</p>
            <p className="mt-1 text-sm text-neutral-500">Wymagają interwencji terapeutycznej</p>
          </div>
        </Card>

        <Card className="p-6" variant="elevated">
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
                color="bg-success-500"
                label="Doskonały (&gt;90%)"
                total={totalPatients}
                value={mockComplianceData.distribution.excellent}
              />
              <DistributionBar
                color="bg-emerald-500"
                label="Dobry (70-90%)"
                total={totalPatients}
                value={mockComplianceData.distribution.good}
              />
              <DistributionBar
                color="bg-amber-500"
                label="Średni (50-70%)"
                total={totalPatients}
                value={mockComplianceData.distribution.average}
              />
              <DistributionBar
                color="bg-orange-500"
                label="Niski (30-50%)"
                total={totalPatients}
                value={mockComplianceData.distribution.low}
              />
              <DistributionBar
                color="bg-error-500"
                label="Krytyczny (&lt;30%)"
                total={totalPatients}
                value={mockComplianceData.distribution.critical}
              />
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Patients Table */}
      <Card variant="elevated">
        <Card.Header>
          <h2 className="text-lg font-semibold text-neutral-900">Pacjenci wymagający uwagi</h2>
          <Button size="sm" variant="outline">
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
