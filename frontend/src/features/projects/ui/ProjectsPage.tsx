import { useState } from 'react'
import { Card, Button, PageLoader } from '@shared/components'
import { ProjectCard, ProjectFormModal } from '.'
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../api/projectApi'
import { useNavigate } from 'react-router-dom'
import type { Project, ProjectFormData, ProjectStatus } from '../types'

/**
 * ProjectsPage Component
 *
 * Main page for managing therapeutic projects with list, filter, and CRUD operations
 */
export const ProjectsPage = () => {
  const navigate = useNavigate()

  // Local state
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()

  // RTK Query hooks
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useGetProjectsQuery({
    status: statusFilter,
    name: searchQuery || undefined,
  })
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()

  // Handlers
  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`)
  }

  const handleCreateClick = () => {
    setEditingProject(undefined)
    setIsFormModalOpen(true)
  }

  const handleEditClick = (project: Project) => {
    setEditingProject(project)
    setIsFormModalOpen(true)
  }

  const handleDeleteClick = async (project: Project) => {
    if (window.confirm(`Czy na pewno chcesz usunąć projekt "${project.name}"?`)) {
      try {
        await deleteProject(project.id).unwrap()
      } catch (err) {
        console.error('Failed to delete project:', err)
      }
    }
  }

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await updateProject({ id: editingProject.id, project: data }).unwrap()
      } else {
        await createProject(data).unwrap()
      }
      setIsFormModalOpen(false)
      setEditingProject(undefined)
      refetch()
    } catch (err) {
      console.error('Failed to save project:', err)
    }
  }

  const handleModalClose = () => {
    setIsFormModalOpen(false)
    setEditingProject(undefined)
  }

  const handleFilterByStatus = (status: ProjectStatus | 'ALL') => {
    setStatusFilter(status === 'ALL' ? undefined : status)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter(undefined)
  }

  const hasActiveFilters = searchQuery || statusFilter

  if (isLoading && !projects) {
    return <PageLoader size="lg" text="Ładowanie projektów..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Projekty terapeutyczne</h1>
          <p className="mt-1 text-neutral-600">Zarządzaj projektami terapeutycznymi</p>
        </div>
        <Button
          variant="primary"
          leftIcon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          onClick={handleCreateClick}
        >
          Nowy projekt
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Wszystkie projekty"
          value={projects?.length || 0}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          }
          color="primary"
        />
        <StatCard
          title="Aktywne"
          value={projects?.filter((p) => p.status === 'ACTIVE').length || 0}
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
          title="Planowane"
          value={projects?.filter((p) => p.status === 'PLANNED').length || 0}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
          color="blue"
        />
        <StatCard
          title="Zakończone"
          value={projects?.filter((p) => p.status === 'COMPLETED').length || 0}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          }
          color="violet"
        />
      </div>

      {/* Filters */}
      <Card variant="outlined">
        <Card.Body>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj projektów po nazwie..."
                className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Status filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-600">Status:</span>
              <button
                onClick={() => handleFilterByStatus('ALL')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  !statusFilter
                    ? 'border-primary-300 bg-primary-100 text-primary-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => handleFilterByStatus('PLANNED')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  statusFilter === 'PLANNED'
                    ? 'border-blue-300 bg-blue-100 text-blue-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
              >
                Planowane
              </button>
              <button
                onClick={() => handleFilterByStatus('ACTIVE')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  statusFilter === 'ACTIVE'
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
              >
                Aktywne
              </button>
              <button
                onClick={() => handleFilterByStatus('COMPLETED')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  statusFilter === 'COMPLETED'
                    ? 'border-violet-300 bg-violet-100 text-violet-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
              >
                Zakończone
              </button>
              <button
                onClick={() => handleFilterByStatus('ARCHIVED')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  statusFilter === 'ARCHIVED'
                    ? 'border-neutral-300 bg-neutral-100 text-neutral-700'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
              >
                Zarchiwizowane
              </button>

              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Wyczyść filtry
                </button>
              ) : null}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Projects Grid */}
      {error ? (
        <div className="py-12 text-center">
          <p className="text-error-600">Wystąpił błąd podczas ładowania projektów</p>
          <Button variant="primary" onClick={() => refetch()} className="mt-4">
            Spróbuj ponownie
          </Button>
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card variant="outlined">
          <Card.Body>
            <div className="py-12 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-neutral-500">Brak projektów do wyświetlenia</p>
              <Button variant="primary" onClick={handleCreateClick} className="mt-4">
                Utwórz pierwszy projekt
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectClick={handleProjectClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        project={editingProject}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

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
  color: 'primary' | 'secondary' | 'emerald' | 'blue' | 'violet'
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
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

export default ProjectsPage
