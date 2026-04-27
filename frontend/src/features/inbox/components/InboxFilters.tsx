import React from 'react'
import type { ThreadStatus, MessagePriority } from '../types'

interface InboxFiltersProps {
  projectId?: string
  status?: ThreadStatus
  assignedTo?: string
  isUnread?: boolean
  priority?: MessagePriority
  onFilterChange: (filters: Partial<InboxFiltersProps>) => void
  onReset: () => void
}

interface Project {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
  role: string
}

// Mock data - in real app, fetch from API
const PROJECTS: Project[] = [
  { id: '1', name: 'Projekt A - Kardiologia' },
  { id: '2', name: 'Projekt B - Ortopedia' },
  { id: '3', name: 'Projekt C - Neurologia' },
]

const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Dr. Anna Kowalska', role: 'DOCTOR' },
  { id: '2', name: 'Piotr Nowak', role: 'NURSE' },
  { id: '3', name: 'Maria Wiśniewska', role: 'THERAPIST' },
  { id: '4', name: 'Jan Zieliński', role: 'COORDINATOR' },
]

const STATUS_OPTIONS: { value: ThreadStatus; label: string }[] = [
  { value: 'NEW', label: 'Nowy' },
  { value: 'IN_PROGRESS', label: 'W trakcie' },
  { value: 'RESOLVED', label: 'Rozwiązany' },
  { value: 'CLOSED', label: 'Zamknięty' },
]

const PRIORITY_OPTIONS: { value: MessagePriority; label: string }[] = [
  { value: 'LOW', label: 'Niski' },
  { value: 'MEDIUM', label: 'Średni' },
  { value: 'HIGH', label: 'Wysoki' },
  { value: 'URGENT', label: 'Pilny' },
]

export const InboxFilters: React.FC<InboxFiltersProps> = ({
  projectId,
  status,
  assignedTo,
  isUnread,
  priority,
  onFilterChange,
  onReset,
}) => {
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ projectId: e.target.value || undefined })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ status: (e.target.value as ThreadStatus) || undefined })
  }

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ assignedTo: e.target.value || undefined })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ priority: (e.target.value as MessagePriority) || undefined })
  }

  const handleUnreadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ isUnread: e.target.checked || undefined })
  }

  const hasActiveFilters = projectId || status || assignedTo || isUnread || priority

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filtry</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Resetuj filtry
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Project filter */}
        <div>
          <label htmlFor="project-filter" className="block text-xs font-medium text-gray-500 mb-1">
            Projekt
          </label>
          <select
            id="project-filter"
            value={projectId || ''}
            onChange={handleProjectChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie projekty</option>
            {PROJECTS.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-xs font-medium text-gray-500 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={status || ''}
            onChange={handleStatusChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie statusy</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee filter */}
        <div>
          <label htmlFor="assignee-filter" className="block text-xs font-medium text-gray-500 mb-1">
            Przypisany do
          </label>
          <select
            id="assignee-filter"
            value={assignedTo || ''}
            onChange={handleAssigneeChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszyscy</option>
            {TEAM_MEMBERS.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority filter */}
        <div>
          <label htmlFor="priority-filter" className="block text-xs font-medium text-gray-500 mb-1">
            Priorytet
          </label>
          <select
            id="priority-filter"
            value={priority || ''}
            onChange={handlePriorityChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie priorytety</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Unread filter */}
        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isUnread || false}
              onChange={handleUnreadChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Tylko nieprzeczytane</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default InboxFilters
