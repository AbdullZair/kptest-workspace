import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@shared/components'
import { ProjectStatistics } from './ProjectStatistics'
import type { ProjectStatistics as ProjectStatisticsType } from '../types'

/**
 * Mock data - in production this would come from API
 */
const mockStatistics: ProjectStatisticsType = {
  project_id: '00000000-0000-0000-0000-000000000000',
  project_name: 'Terapia Ślimakowa 2024',
  status: 'ACTIVE',
  total_patients: 156,
  active_patients: 124,
  completed_patients: 28,
  removed_patients: 4,
  team_members: 12,
  average_compliance_score: 78.5,
  compliance_distribution: {
    'HIGH (80-100%)': 45,
    'MEDIUM (50-79%)': 58,
    'LOW (0-49%)': 21,
  },
  stage_distribution: {
    NOT_STARTED: 15,
    IN_PROGRESS: 98,
    COMPLETED: 28,
    REMOVED: 4,
  },
  recent_activity: [],
}

/**
 * ProjectStatisticsPage Component
 *
 * Detailed statistics page for a specific project
 */
export const ProjectStatisticsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(`/projects/${id}`)
  }

  const handleExport = async () => {
    // In production, this would trigger an export
    console.log('Exporting statistics for project:', id)
  }

  if (!id) {
    return (
      <div className="py-12 text-center">
        <p className="text-error-600">Nie znaleziono identyfikatora projektu</p>
        <Button variant="primary" onClick={() => navigate('/projects')} className="mt-4">
          Powrót do projektów
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Powrót
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Statystyki projektu</h1>
            <p className="mt-1 text-neutral-600">Szczegółowe statystyki i metryki projektu</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
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

      {/* Statistics Component */}
      <Card variant="elevated">
        <Card.Body>
          <ProjectStatistics statistics={mockStatistics} />
        </Card.Body>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Activity Timeline */}
        <Card variant="elevated">
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Ostatnia aktywność</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { action: 'Nowy pacjent dołączony', time: '2h temu', user: 'Dr Anna Kowalska' },
                { action: 'Materiał dodany', time: '4h temu', user: 'Terapeuta Jan Nowak' },
                {
                  action: 'Wiadomość wysłana',
                  time: '6h temu',
                  user: 'Koordynator Maria Wiśniewska',
                },
                {
                  action: 'Wydarzenie zakończone',
                  time: '1d temu',
                  user: 'Pacjent Piotr Wiśniewski',
                },
                { action: 'Raport wygenerowany', time: '2d temu', user: 'Dr Anna Kowalska' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-primary-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                    <p className="text-xs text-neutral-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Team Overview */}
        <Card variant="elevated">
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Zespół projektu</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <TeamMemberRow role="Koordynator" count={2} color="bg-primary-500" />
              <TeamMemberRow role="Lekarze" count={4} color="bg-secondary-500" />
              <TeamMemberRow role="Terapeuci" count={5} color="bg-success-500" />
              <TeamMemberRow role="Pielęgniarki" count={1} color="bg-warning-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * TeamMemberRow Component
 */
interface TeamMemberRowProps {
  role: string
  count: number
  color: string
}

const TeamMemberRow: React.FC<TeamMemberRowProps> = ({ role, count, color }) => {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0">
      <div className="flex items-center gap-3">
        <div className={clsx('h-3 w-3 rounded-full', color)} />
        <span className="text-sm text-neutral-700">{role}</span>
      </div>
      <span className="text-sm font-medium text-neutral-900">{count}</span>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export default ProjectStatisticsPage
