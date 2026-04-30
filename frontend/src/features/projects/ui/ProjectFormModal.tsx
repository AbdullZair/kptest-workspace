import { useState, useEffect, useMemo } from 'react'
import { Button, Card } from '@shared/components'
import { useGetAdminUsersQuery } from '@features/admin/api/adminApi'
import { useGetPatientsQuery } from '@features/patients/api/patientApi'
import type { ProjectFormModalProps, ProjectFormData } from '../types'
import type { UserAdmin } from '@features/admin/types'
import { clsx } from 'clsx'

/**
 * ProjectFormModal Component
 *
 * Modal for creating and editing projects. In create mode the form also
 * exposes team-member and patient pickers so that the backend
 * `POST /api/v1/projects` request is fully populated (team_member_ids,
 * patient_ids). In edit mode these pickers are hidden because
 * `PUT /api/v1/projects/{id}` doesn't accept them — managing team and
 * patient enrolment lives in the project detail view (PatientAssignmentModal
 * + dedicated team endpoints).
 *
 * @example
 * ```tsx
 * <ProjectFormModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   project={editingProject}
 *   isLoading={isSaving}
 * />
 * ```
 */
export const ProjectFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading = false,
}: ProjectFormModalProps) => {
  const isEditMode = Boolean(project)

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0] ?? '',
    end_date: '',
    status: 'PLANNED',
    compliance_threshold: 80,
    team_member_ids: [],
    patient_ids: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [staffSearch, setStaffSearch] = useState('')
  const [patientSearch, setPatientSearch] = useState('')

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        start_date: project.start_date ? (project.start_date.split('T')[0] ?? '') : '',
        end_date: project.end_date ? (project.end_date.split('T')[0] ?? '') : '',
        status: project.status || 'PLANNED',
        compliance_threshold: project.compliance_threshold || 80,
        team_member_ids: [],
        patient_ids: [],
      })
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0] ?? '',
        end_date: '',
        status: 'PLANNED',
        compliance_threshold: 80,
        team_member_ids: [],
        patient_ids: [],
      })
    }
    setErrors({})
    setStaffSearch('')
    setPatientSearch('')
  }, [project, isOpen])

  // ============== Staff (team members) data ==============
  // Fetch a generous page of users; filter out PATIENT role client-side.
  const { data: usersPage, isFetching: isFetchingStaff } = useGetAdminUsersQuery(
    { page: 0, size: 100 },
    { skip: !isOpen || isEditMode }
  )

  const staffUsers = useMemo<UserAdmin[]>(() => {
    const all = usersPage?.content ?? []
    const staff = all.filter((u) => u.role !== 'PATIENT')
    if (!staffSearch.trim()) return staff
    const q = staffSearch.trim().toLowerCase()
    return staff.filter(
      (u) => u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    )
  }, [usersPage, staffSearch])

  // ============== Patients data ==============
  const { data: patientsPage, isFetching: isFetchingPatients } = useGetPatientsQuery(
    {
      page: 0,
      size: 100,
      ...(patientSearch.trim().length >= 2 ? { name: patientSearch.trim() } : {}),
    },
    { skip: !isOpen || isEditMode }
  )
  const patients = patientsPage?.data ?? []

  // ============== Selection helpers ==============
  const toggleTeamMember = (userId: string) => {
    setFormData((prev) => {
      const current = prev.team_member_ids ?? []
      const next = current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
      return { ...prev, team_member_ids: next }
    })
  }

  const togglePatient = (patientId: string) => {
    setFormData((prev) => {
      const current = prev.patient_ids ?? []
      const next = current.includes(patientId)
        ? current.filter((id) => id !== patientId)
        : [...current, patientId]
      return { ...prev, patient_ids: next }
    })
  }

  // Validate form
  const validate = useMemo(
    () => () => {
      const newErrors: Record<string, string> = {}

      if (!formData.name?.trim()) {
        newErrors.name = 'Nazwa projektu jest wymagana'
      } else if (formData.name.length > 200) {
        newErrors.name = 'Nazwa projektu nie może przekraczać 200 znaków'
      }

      if (formData.description && formData.description.length > 5000) {
        newErrors.description = 'Opis nie może przekraczać 5000 znaków'
      }

      if (!formData.start_date) {
        newErrors.start_date = 'Data rozpoczęcia jest wymagana'
      }

      if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
        newErrors.end_date = 'Data zakończenia musi być późniejsza niż data rozpoczęcia'
      }

      if (formData.compliance_threshold !== undefined) {
        if (formData.compliance_threshold < 0 || formData.compliance_threshold > 100) {
          newErrors.compliance_threshold = 'Próg compliance musi być między 0 a 100'
        }
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [formData]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // Backend wymaga Instant (ISO-8601) dla start_date / end_date.
    // <input type="date"> daje 'YYYY-MM-DD' — dolepiamy T00:00:00Z.
    const toInstant = (d: string | undefined): string | undefined =>
      d ? (d.includes('T') ? d : `${d}T00:00:00Z`) : undefined

    // In edit mode we strip team_member_ids / patient_ids from the payload —
    // backend PUT /projects/{id} ignores them and there is no UI for editing
    // those collections through this modal.
    const basePayload: ProjectFormData = {
      ...formData,
      start_date: toInstant(formData.start_date) ?? '',
      end_date: toInstant(formData.end_date),
    }

    const payload: ProjectFormData = isEditMode
      ? {
          ...basePayload,
          team_member_ids: undefined,
          patient_ids: undefined,
        }
      : {
          ...basePayload,
          team_member_ids: formData.team_member_ids ?? [],
          patient_ids: formData.patient_ids ?? [],
        }

    try {
      await onSubmit(payload)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseInt(value, 10)) : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  const selectedTeam = formData.team_member_ids ?? []
  const selectedPatients = formData.patient_ids ?? []

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform transition-all">
          <Card className="overflow-hidden" variant="elevated">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900" id="modal-title">
                {project ? 'Edytuj projekt' : 'Nowy projekt'}
              </h2>
              <button
                aria-label="Zamknij"
                className="text-neutral-400 transition-colors hover:text-neutral-600"
                onClick={onClose}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form data-testid="project-form" onSubmit={handleSubmit}>
              <Card.Body className="space-y-5">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="name">
                    Nazwa projektu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className={clsx(
                      'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.name
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-neutral-300 focus:border-primary-500'
                    )}
                    data-testid="project-name"
                    disabled={isLoading}
                    id="name"
                    name="name"
                    placeholder="Wprowadź nazwę projektu"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
                </div>

                {/* Description */}
                <div>
                  <label
                    className="mb-1 block text-sm font-medium text-neutral-700"
                    htmlFor="description"
                  >
                    Opis
                  </label>
                  <textarea
                    className={clsx(
                      'w-full resize-none rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.description
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-neutral-300 focus:border-primary-500'
                    )}
                    data-testid="project-description"
                    disabled={isLoading}
                    id="description"
                    name="description"
                    placeholder="Opis projektu (opcjonalny)"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description ? (
                    <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-neutral-500">
                    {formData.description?.length || 0}/5000 znaków
                  </p>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-neutral-700"
                      htmlFor="start_date"
                    >
                      Data rozpoczęcia <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.start_date
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      )}
                      data-testid="project-start-date"
                      disabled={isLoading}
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                    {errors.start_date ? (
                      <p className="mt-1 text-sm text-rose-600">{errors.start_date}</p>
                    ) : null}
                  </div>

                  {/* End Date */}
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-neutral-700"
                      htmlFor="end_date"
                    >
                      Data zakończenia
                    </label>
                    <input
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.end_date
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      )}
                      data-testid="project-end-date"
                      disabled={isLoading}
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                    {errors.end_date ? (
                      <p className="mt-1 text-sm text-rose-600">{errors.end_date}</p>
                    ) : null}
                  </div>
                </div>

                {/* Status and Compliance Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-neutral-700"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      data-testid="project-status"
                      disabled={isLoading}
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="PLANNED">Planowany</option>
                      <option value="ACTIVE">Aktywny</option>
                      <option value="COMPLETED">Zakończony</option>
                      <option value="ARCHIVED">Zarchiwizowany</option>
                      <option value="CANCELLED">Anulowany</option>
                    </select>
                  </div>

                  {/* Compliance Threshold */}
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-neutral-700"
                      htmlFor="compliance_threshold"
                    >
                      Próg compliance (%)
                    </label>
                    <input
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.compliance_threshold
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      )}
                      data-testid="project-compliance-threshold"
                      disabled={isLoading}
                      id="compliance_threshold"
                      max={100}
                      min={0}
                      name="compliance_threshold"
                      type="number"
                      value={formData.compliance_threshold}
                      onChange={handleChange}
                    />
                    {errors.compliance_threshold ? (
                      <p className="mt-1 text-sm text-rose-600">{errors.compliance_threshold}</p>
                    ) : null}
                  </div>
                </div>

                {/* Team & Patients (create mode only) */}
                {isEditMode ? (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                    Edycja zespołu i pacjentów dostępna jest w widoku szczegółów projektu.
                  </div>
                ) : (
                  <>
                    {/* Team members */}
                    <div data-testid="project-team-section">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-700">
                          Zespół projektu
                        </label>
                        <span className="text-xs text-neutral-500">
                          Wybrano: {selectedTeam.length}
                        </span>
                      </div>
                      <input
                        className="mb-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        data-testid="project-team-search"
                        disabled={isLoading || isFetchingStaff}
                        placeholder="Szukaj po e-mailu lub roli..."
                        type="search"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200">
                        {isFetchingStaff ? (
                          <p className="px-3 py-2 text-sm text-neutral-500">
                            Ładowanie użytkowników...
                          </p>
                        ) : staffUsers.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-neutral-500">
                            Brak użytkowników do wyświetlenia.
                          </p>
                        ) : (
                          <ul className="divide-y divide-neutral-100">
                            {staffUsers.map((user) => {
                              const checked = selectedTeam.includes(user.user_id)
                              return (
                                <li key={user.user_id}>
                                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-neutral-50">
                                    <input
                                      checked={checked}
                                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                      data-testid={`team-checkbox-${user.user_id}`}
                                      disabled={isLoading}
                                      type="checkbox"
                                      onChange={() => toggleTeamMember(user.user_id)}
                                    />
                                    <span className="flex-1 text-sm text-neutral-800">
                                      {user.email}
                                    </span>
                                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                                      {user.role}
                                    </span>
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Patients */}
                    <div data-testid="project-patients-section">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-700">
                          Pacjenci
                        </label>
                        <span className="text-xs text-neutral-500">
                          Wybrano: {selectedPatients.length}
                        </span>
                      </div>
                      <input
                        className="mb-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        data-testid="project-patients-search"
                        disabled={isLoading || isFetchingPatients}
                        placeholder="Szukaj po imieniu lub nazwisku (min. 2 znaki)..."
                        type="search"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200">
                        {isFetchingPatients ? (
                          <p className="px-3 py-2 text-sm text-neutral-500">
                            Ładowanie pacjentów...
                          </p>
                        ) : patients.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-neutral-500">
                            Brak pacjentów do wyświetlenia.
                          </p>
                        ) : (
                          <ul className="divide-y divide-neutral-100">
                            {patients.map((p) => {
                              const checked = selectedPatients.includes(p.id)
                              return (
                                <li key={p.id}>
                                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-neutral-50">
                                    <input
                                      checked={checked}
                                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                      data-testid={`patient-checkbox-${p.id}`}
                                      disabled={isLoading}
                                      type="checkbox"
                                      onChange={() => togglePatient(p.id)}
                                    />
                                    <span className="flex-1 text-sm text-neutral-800">
                                      {p.first_name} {p.last_name}
                                    </span>
                                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                                      {p.verification_status}
                                    </span>
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Card.Body>

              {/* Footer */}
              <Card.Footer className="flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                <Button
                  data-testid="project-cancel"
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Anuluj
                </Button>
                <Button
                  className="min-w-[120px]"
                  data-testid="project-save"
                  disabled={isLoading}
                  type="submit"
                  variant="primary"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                        />
                      </svg>
                      Zapisywanie...
                    </span>
                  ) : project ? (
                    'Zapisz zmiany'
                  ) : (
                    'Utwórz projekt'
                  )}
                </Button>
              </Card.Footer>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProjectFormModal
