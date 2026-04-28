import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, PageLoader } from '@shared/components'
import { PatientAssignmentModal } from '.'
import {
  useGetProjectByIdQuery,
  useGetProjectPatientsQuery,
  useRemovePatientsMutation,
  useAssignPatientsMutation,
} from '../api/projectApi'
import type { PatientProject, TherapyStage } from '../types'

/**
 * ProjectPatientsPage Component
 *
 * Page for managing patients within a project
 */
export const ProjectPatientsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate('/projects')
    return null
  }

  // Local state
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([])
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [removalReason, setRemovalReason] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // RTK Query hooks
  const { data: project, isLoading: isLoadingProject } = useGetProjectByIdQuery(id)
  const {
    data: patients,
    isLoading: isLoadingPatients,
    refetch,
  } = useGetProjectPatientsQuery({ projectId: id, activeOnly: !showInactive })
  const [removePatients, { isLoading: isRemoving }] = useRemovePatientsMutation()
  const [assignPatients] = useAssignPatientsMutation()

  // Handlers
  const handleTogglePatient = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPatientIds.length === (patients?.length || 0)) {
      setSelectedPatientIds([])
    } else {
      setSelectedPatientIds(patients?.map((p) => p.patient_id) || [])
    }
  }

  const handleAddPatients = () => {
    setIsAssignmentModalOpen(true)
  }

  const handleAssignPatients = async (patientIds: string[]) => {
    try {
      await assignPatients({ projectId: id, request: { patient_ids: patientIds } }).unwrap()
      setIsAssignmentModalOpen(false)
      refetch()
    } catch (err) {
      console.error('Failed to assign patients:', err)
    }
  }

  const handleRemoveClick = () => {
    if (selectedPatientIds.length > 0) {
      setIsRemoveModalOpen(true)
    }
  }

  const handleRemoveConfirm = async () => {
    try {
      await removePatients({
        projectId: id,
        request: { patient_ids: selectedPatientIds, reason: removalReason },
      }).unwrap()
      setIsRemoveModalOpen(false)
      setSelectedPatientIds([])
      setRemovalReason('')
      refetch()
    } catch (err) {
      console.error('Failed to remove patients:', err)
    }
  }

  const handleBackClick = () => {
    navigate(`/projects/${id}`)
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

  if (isLoadingProject || isLoadingPatients) {
    return <PageLoader size="lg" text="Ładowanie pacjentów..." />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Nie znaleziono projektu</p>
        <Button variant="primary" onClick={handleBackClick} className="mt-4">
          Powrót
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Pacjenci w projekcie</h1>
            <p className="text-neutral-600 mt-1">{project.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={handleAddPatients} disabled={project.status !== 'ACTIVE'}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Dodaj pacjenta
          </Button>
          {selectedPatientIds.length > 0 && (
            <Button
              variant="outline"
              className="text-rose-600 border-rose-200"
              onClick={handleRemoveClick}
            >
              Usuń zaznaczonych ({selectedPatientIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined">
        <Card.Body>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Pokaż nieaktywnych pacjentów</span>
              </label>
            </div>
            <p className="text-sm text-neutral-600">
              Łącznie: <strong>{patients?.length || 0}</strong> pacjentów
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Patients Table */}
      {patients && patients.length > 0 ? (
        <Card variant="elevated">
          <Card.Body noPadding>
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        patients.length > 0 && selectedPatientIds.length === patients.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Pacjent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    PESEL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Data dołączenia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Etap terapii
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {patients.map((pp) => (
                  <tr
                    key={pp.id}
                    className={`hover:bg-neutral-50 ${
                      selectedPatientIds.includes(pp.patient_id) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPatientIds.includes(pp.patient_id)}
                        onChange={() => handleTogglePatient(pp.patient_id)}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        disabled={pp.left_at != null}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/patients/${pp.patient_id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {pp.patient_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-sm text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        {pp.patient_id}
                      </code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                      {formatDate(pp.enrolled_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TherapyStageBadge stage={pp.current_stage} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {pp.compliance_score != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-neutral-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                pp.compliance_score >= 80
                                  ? 'bg-emerald-500'
                                  : pp.compliance_score >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${pp.compliance_score}%` }}
                            />
                          </div>
                          <span className="text-sm text-neutral-700">
                            {Math.round(pp.compliance_score)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {pp.left_at ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          Nieaktywny
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Aktywny
                        </span>
                      )}
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
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-neutral-500">Brak pacjentów w tym projekcie</p>
              {project.status === 'ACTIVE' && (
                <Button variant="primary" onClick={handleAddPatients} className="mt-4">
                  Dodaj pierwszego pacjenta
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Remove Confirmation Modal */}
      {isRemoveModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsRemoveModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <Card variant="elevated">
                <Card.Body>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Usuń pacjentów z projektu
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Czy na pewno chcesz usunąć {selectedPatientIds.length} pacjentów z projektu?
                  </p>
                  <div className="mb-4">
                    <label
                      htmlFor="removalReason"
                      className="block text-sm font-medium text-neutral-700 mb-1"
                    >
                      Powód usunięcia <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="removalReason"
                      value={removalReason}
                      onChange={(e) => setRemovalReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Wprowadź powód usunięcia pacjentów z projektu..."
                    />
                  </div>
                </Card.Body>
                <Card.Footer className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRemoveModalOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-rose-600 hover:bg-rose-700"
                    onClick={handleRemoveConfirm}
                    disabled={!removalReason.trim() || isRemoving}
                  >
                    {isRemoving ? 'Usuwanie...' : 'Usuń'}
                  </Button>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      <PatientAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSubmit={handleAssignPatients}
        projectId={id}
        existingPatientIds={patients?.map((p) => p.patient_id)}
      />
    </div>
  )
}

/**
 * TherapyStageBadge component
 */
const TherapyStageBadge = ({ stage }: { stage: TherapyStage }) => {
  const config: Record<TherapyStage, { label: string; color: string }> = {
    NOT_STARTED: { label: 'Nierozpoczęta', color: 'bg-neutral-100 text-neutral-700' },
    IN_PROGRESS: { label: 'W trakcie', color: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Zakończona', color: 'bg-emerald-100 text-emerald-800' },
    REMOVED: { label: 'Usunięta', color: 'bg-rose-100 text-rose-800' },
  }

  const { label, color } = config[stage] || config.NOT_STARTED

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export default ProjectPatientsPage
