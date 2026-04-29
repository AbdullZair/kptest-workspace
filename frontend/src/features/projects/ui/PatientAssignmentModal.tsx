import { useState, useEffect, useMemo } from 'react'
import { Button, Card } from '@shared/components'
import { useGetPatientsQuery } from '@features/patients/api/patientApi'
import type { PatientAssignmentModalProps } from '../types'
import { clsx } from 'clsx'

/**
 * PatientAssignmentModal Component
 *
 * Modal for assigning patients to a project
 *
 * @example
 * ```tsx
 * <PatientAssignmentModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleAssign}
 *   projectId={projectId}
 *   isLoading={isAssigning}
 * />
 * ```
 */
export const PatientAssignmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  projectId: _projectId,
  existingPatientIds = [],
  isLoading = false,
}: PatientAssignmentModalProps) => {
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)

  // Fetch patients
  const { data: patientsData, isLoading: isLoadingPatients } = useGetPatientsQuery({
    page,
    size: 50,
    sort: 'name',
    sort_order: 'asc',
  })

  const patients = useMemo(() => patientsData?.data || [], [patientsData])

  // Filter out already assigned patients and apply search
  const availablePatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        !existingPatientIds.includes(patient.id) &&
        (searchQuery === '' ||
          patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.pesel.includes(searchQuery))
    )
  }, [patients, existingPatientIds, searchQuery])

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPatientIds([])
      setSearchQuery('')
      setPage(0)
    }
  }, [isOpen])

  const handleTogglePatient = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPatientIds.length === availablePatients.length) {
      setSelectedPatientIds([])
    } else {
      setSelectedPatientIds(availablePatients.map((p) => p.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedPatientIds.length === 0) {
      return
    }

    try {
      await onSubmit(selectedPatientIds)
      onClose()
    } catch (error) {
      console.error('Failed to assign patients:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform transition-all">
          <Card variant="elevated" className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                Przypisz pacjentów do projektu
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-400 transition-colors hover:text-neutral-600"
                aria-label="Zamknij"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <Card.Body className="space-y-4">
                {/* Search */}
                <div>
                  <label
                    htmlFor="search"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    Szukaj pacjenta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="PESEL, imię, nazwisko..."
                      disabled={isLoading || isLoadingPatients}
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
                </div>

                {/* Patient List */}
                <div className="max-h-96 overflow-y-auto rounded-lg border border-neutral-200">
                  {isLoadingPatients ? (
                    <div className="p-8 text-center">
                      <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-12 rounded bg-neutral-100" />
                        ))}
                      </div>
                    </div>
                  ) : availablePatients.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                      <svg
                        className="mx-auto mb-3 h-12 w-12 text-neutral-300"
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
                      <p>Brak dostępnych pacjentów</p>
                      {existingPatientIds.length > 0 && (
                        <p className="mt-1 text-sm">
                          Niektórzy pacjenci są już przypisani do tego projektu
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Select All Header */}
                      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={
                            availablePatients.length > 0 &&
                            selectedPatientIds.length === availablePatients.length
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label
                          htmlFor="select-all"
                          className="cursor-pointer select-none text-sm font-medium text-neutral-700"
                        >
                          Zaznacz wszystkich ({availablePatients.length})
                        </label>
                        {selectedPatientIds.length > 0 && (
                          <span className="ml-auto text-sm font-medium text-primary-600">
                            Wybrano: {selectedPatientIds.length}
                          </span>
                        )}
                      </div>

                      {/* Patient Items */}
                      <div className="divide-y divide-neutral-100">
                        {availablePatients.map((patient) => (
                          <label
                            key={patient.id}
                            className={clsx(
                              'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
                              selectedPatientIds.includes(patient.id)
                                ? 'bg-primary-50'
                                : 'hover:bg-neutral-50'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPatientIds.includes(patient.id)}
                              onChange={() => handleTogglePatient(patient.id)}
                              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-neutral-900">
                                {patient.first_name} {patient.last_name}
                              </p>
                              <p className="text-xs text-neutral-500">PESEL: {patient.pesel}</p>
                            </div>
                            <div className="flex-shrink-0">
                              {patient.verification_status === 'APPROVED' ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                  Zweryfikowany
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                  Oczekujący
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Info */}
                {existingPatientIds.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-blue-700">
                      {existingPatientIds.length} pacjentów jest już przypisanych do tego projektu i
                      nie są wyświetlani na liście.
                    </p>
                  </div>
                )}
              </Card.Body>

              {/* Footer */}
              <Card.Footer className="flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || selectedPatientIds.length === 0}
                  className="min-w-[120px]"
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
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Przypisywanie...
                    </span>
                  ) : (
                    `Przypisz (${selectedPatientIds.length})`
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

export default PatientAssignmentModal
