import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, PageLoader } from '@shared/components'
import { ProjectStatus, ProjectStatistics, ProjectFormModal, PatientAssignmentModal } from '.'
import {
  useGetProjectByIdQuery,
  useGetProjectStatisticsQuery,
  useGetProjectPatientsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAssignPatientsMutation,
} from '../api/projectApi'
import type { ProjectFormData } from '../types'

/**
 * ProjectDetailPage Component
 *
 * Displays detailed information about a specific project
 */
export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const safeId = id ?? ''

  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'statistics'>('overview')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)

  // RTK Query hooks
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
    refetch,
  } = useGetProjectByIdQuery(safeId, { skip: !id })
  const { data: statistics } = useGetProjectStatisticsQuery(safeId, { skip: !id })
  const { data: patients } = useGetProjectPatientsQuery(
    { projectId: safeId, activeOnly: true },
    { skip: !id }
  )
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()
  const [assignPatients] = useAssignPatientsMutation()

  if (!id) {
    navigate('/projects')
    return null
  }

  // Handlers
  const handleEditClick = () => {
    setIsFormModalOpen(true)
  }

  const handleDeleteClick = async () => {
    if (window.confirm(`Czy na pewno chcesz usunąć projekt "${project?.name}"?`)) {
      try {
        await deleteProject(id).unwrap()
        navigate('/projects')
      } catch (err) {
        console.error('Failed to delete project:', err)
      }
    }
  }

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      await updateProject({ id, project: data }).unwrap()
      setIsFormModalOpen(false)
      refetch()
    } catch (err) {
      console.error('Failed to update project:', err)
    }
  }

  const handleModalClose = () => {
    setIsFormModalOpen(false)
  }

  const handleAssignPatients = async (patientIds: string[]) => {
    try {
      await assignPatients({ projectId: id, request: { patient_ids: patientIds } }).unwrap()
      setIsAssignmentModalOpen(false)
    } catch (err) {
      console.error('Failed to assign patients:', err)
    }
  }

  const handleBackClick = () => {
    navigate('/projects')
  }

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoadingProject) {
    return <PageLoader size="lg" text="Ładowanie projektu..." />
  }

  if (projectError || !project) {
    return (
      <div className="py-12 text-center">
        <p className="text-error-600">Nie znaleziono projektu</p>
        <Button className="mt-4" variant="primary" onClick={handleBackClick}>
          Powrót do listy projektów
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" onClick={handleBackClick}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{project.name}</h1>
              <ProjectStatus showLabel={true} size="md" status={project.status} />
            </div>
            <p className="mt-1 text-neutral-600">
              Utworzony: {formatDate(project.created_at)}{' '}
              {project.created_by_name ? `przez ${project.created_by_name}` : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Edytuj
          </Button>
          <Button
            className="border-rose-200 text-rose-600"
            variant="outline"
            onClick={handleDeleteClick}
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Usuń
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-8">
          <button
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Przegląd
          </button>
          <button
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'patients'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('patients')}
          >
            Pacjenci ({patients?.length || 0})
          </button>
          <button
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'statistics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('statistics')}
          >
            Statystyki
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Project Info */}
          <Card variant="outlined">
            <Card.Body>
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Informacje o projekcie
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm text-neutral-600">Nazwa</label>
                  <p className="mt-1 font-medium text-neutral-900">{project.name}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Status</label>
                  <p className="mt-1">
                    <ProjectStatus showLabel={true} size="sm" status={project.status} />
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Data rozpoczęcia</label>
                  <p className="mt-1 font-medium text-neutral-900">
                    {formatDate(project.start_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Data zakończenia</label>
                  <p className="mt-1 font-medium text-neutral-900">
                    {formatDate(project.end_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Próg compliance</label>
                  <p className="mt-1 font-medium text-neutral-900">
                    {project.compliance_threshold ? `${project.compliance_threshold}%` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-600">Liczba pacjentów</label>
                  <p className="mt-1 font-medium text-neutral-900">
                    {project.active_patient_count || 0}
                  </p>
                </div>
              </div>
              {project.description ? (
                <div className="mt-6 border-t border-neutral-100 pt-6">
                  <label className="text-sm text-neutral-600">Opis</label>
                  <p className="mt-2 whitespace-pre-wrap text-neutral-900">{project.description}</p>
                </div>
              ) : null}
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <QuickStatCard
              color="primary"
              icon={
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              }
              title="Pacjenci w projekcie"
              value={project.active_patient_count || 0}
              onClick={() => setActiveTab('patients')}
            />
            <QuickStatCard
              color="emerald"
              icon={
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              }
              title="Średni compliance"
              value={
                project.average_compliance_score != null
                  ? `${Math.round(project.average_compliance_score)}%`
                  : '-'
              }
              onClick={() => setActiveTab('statistics')}
            />
            <QuickStatCard
              color="secondary"
              icon={
                <path
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              }
              title="Członkowie zespołu"
              value={project.team_member_count || 0}
            />
          </div>

          {/* Actions */}
          <Card variant="outlined">
            <Card.Body>
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Szybkie akcje</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={project.status !== 'ACTIVE'}
                  variant="primary"
                  onClick={() => setIsAssignmentModalOpen(true)}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  Dodaj pacjenta
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('statistics')}>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  Zobacz statystyki
                </Button>
                <Link to={`/projects/${id}/patients`}>
                  <Button variant="outline">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    Zarządzaj pacjentami
                  </Button>
                </Link>
              </div>
              {project.status !== 'ACTIVE' && (
                <p className="mt-2 text-sm text-neutral-500">
                  * Dodawanie pacjentów jest dostępne tylko dla aktywnych projektów
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Pacjenci w projekcie ({patients?.length || 0})
            </h2>
            <Button
              disabled={project.status !== 'ACTIVE'}
              size="sm"
              variant="primary"
              onClick={() => setIsAssignmentModalOpen(true)}
            >
              Dodaj pacjenta
            </Button>
          </div>
          {patients && patients.length > 0 ? (
            <Card variant="outlined">
              <Card.Body noPadding>
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                        Pacjent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                        PESEL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                        Data dołączenia
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                        Etap terapii
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {patients.map((pp) => (
                      <tr key={pp.id} className="hover:bg-neutral-50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link
                            className="font-medium text-primary-600 hover:text-primary-700"
                            to={`/patients/${pp.patient_id}`}
                          >
                            {pp.patient_name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-600">
                            {pp.patient_id}
                          </code>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                          {formatDate(pp.enrolled_at)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="text-sm text-neutral-700">
                            {getTherapyStageLabel(pp.current_stage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          ) : (
            <Card variant="outlined">
              <Card.Body>
                <div className="py-8 text-center">
                  <p className="text-neutral-500">Brak pacjentów w tym projekcie</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'statistics' && statistics ? (
        <ProjectStatistics statistics={statistics} />
      ) : null}

      {/* Modals */}
      <ProjectFormModal
        isLoading={isUpdating}
        isOpen={isFormModalOpen}
        project={project}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
      />

      <PatientAssignmentModal
        existingPatientIds={patients?.map((p) => p.patient_id)}
        isOpen={isAssignmentModalOpen}
        projectId={id}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSubmit={handleAssignPatients}
      />
    </div>
  )
}

/**
 * QuickStatCard sub-component
 */
const QuickStatCard = ({
  title,
  value,
  icon,
  color,
  onClick,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'emerald' | 'blue' | 'violet'
  onClick?: () => void
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <Card
      className={`p-4 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      variant="outlined"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <div>
          <p className="text-xl font-bold text-neutral-900">{value}</p>
          <p className="text-xs text-neutral-600">{title}</p>
        </div>
      </div>
    </Card>
  )
}

/**
 * Get therapy stage label
 */
const getTherapyStageLabel = (stage: string): string => {
  const labels: Record<string, string> = {
    NOT_STARTED: 'Nierozpoczęta',
    IN_PROGRESS: 'W trakcie',
    COMPLETED: 'Zakończona',
    REMOVED: 'Usunięta',
  }
  return labels[stage] || stage
}

export default ProjectDetailPage
