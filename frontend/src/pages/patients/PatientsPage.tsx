import { useState, useMemo } from 'react'
import { Card, Button, PageLoader } from '@shared/components'
import {
  PatientTable,
  PatientSearch,
  PatientFormModal,
  PatientBulkActionBar,
} from '@features/patients/ui'
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useBulkOperationMutation,
  openCreateModal,
  openEditModal,
  closeFormModal,
  selectIsFormModalOpen,
  selectEditingPatientId,
  selectFilters,
  updateFilter,
} from '@features/patients'
import { useDispatch, useSelector } from 'react-redux'
import type {
  BulkOperationKey,
  BulkPatientRequest,
  Patient,
  PatientFormData,
  PatientSearchRequest,
} from '@features/patients/types'
import type { VerificationStatusType } from '@features/patients/ui/VerificationStatus'
import type { SortField, SortOrder } from '@features/patients/ui/PatientTable'
import { useNavigate } from 'react-router-dom'

/**
 * PatientsPage Component
 *
 * Main page for managing patients with list, search, filter, and CRUD operations
 */
export const PatientsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Redux state
  const isFormModalOpen = useSelector(selectIsFormModalOpen)
  const editingPatientId = useSelector(selectEditingPatientId)
  const filters = useSelector(selectFilters)

  // Local state
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([])

  // RTK Query hooks
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation()
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation()
  const [deletePatient] = useDeletePatientMutation()
  const [bulkOperation, { isLoading: isBulkLoading }] = useBulkOperationMutation()

  // Build query params
  const queryParams: PatientSearchRequest = useMemo(
    () => ({
      page,
      size: pageSize,
      sort: sortField,
      sort_order: sortOrder,
      ...filters,
    }),
    [page, pageSize, sortField, sortOrder, filters]
  )

  // Fetch patients
  const { data: patientsData, isLoading, error, refetch } = useGetPatientsQuery(queryParams)

  // Get editing patient
  const editingPatient = useMemo(() => {
    if (!editingPatientId || !patientsData?.data) return null
    return patientsData.data.find((p) => p.id === editingPatientId)
  }, [editingPatientId, patientsData])

  // Handlers
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field)
    setSortOrder(order)
    setPage(0) // Reset to first page on sort change
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    dispatch(updateFilter({ key: 'name', value: query || undefined }))
    setPage(0)
  }

  const handlePatientClick = (patient: Patient) => {
    navigate(`/patients/${patient.id}`)
  }

  const handleCreateClick = () => {
    dispatch(openCreateModal())
  }

  const handleEditClick = (patient: Patient) => {
    dispatch(openEditModal(patient.id))
  }

  const handleDeleteClick = async (patient: Patient) => {
    if (
      window.confirm(
        `Czy na pewno chcesz usunąć pacjenta ${patient.first_name} ${patient.last_name}?`
      )
    ) {
      try {
        await deletePatient(patient.id).unwrap()
      } catch (err) {
        console.error('Failed to delete patient:', err)
      }
    }
  }

  const handleFormSubmit = async (data: PatientFormData) => {
    try {
      if (editingPatientId) {
        await updatePatient({ id: editingPatientId, patient: data }).unwrap()
      } else {
        await createPatient(data).unwrap()
      }
      dispatch(closeFormModal())
      refetch()
    } catch (err) {
      console.error('Failed to save patient:', err)
    }
  }

  const handleModalClose = () => {
    dispatch(closeFormModal())
  }

  const handleFilterByStatus = (status: VerificationStatusType) => {
    const currentStatuses = filters.verificationStatus || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]

    dispatch(
      updateFilter({
        key: 'verificationStatus',
        value: newStatuses.length > 0 ? newStatuses : undefined,
      })
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    dispatch(updateFilter({ key: 'name', value: undefined }))
    dispatch(updateFilter({ key: 'verificationStatus', value: undefined }))
    dispatch(updateFilter({ key: 'status', value: undefined }))
  }

  // Bulk selection handlers (US-K-05)
  const handleToggleSelect = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId]
    )
  }

  const handleToggleSelectAll = () => {
    const visibleIds = (patientsData?.data ?? []).map((p) => p.id)
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedPatientIds.includes(id))
    if (allSelected) {
      setSelectedPatientIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedPatientIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  const handleClearSelection = () => {
    setSelectedPatientIds([])
  }

  const handleBulkSubmit = async (operation: BulkOperationKey, body: BulkPatientRequest) => {
    try {
      const result = await bulkOperation({ operation, body }).unwrap()
      window.alert(`Operacja zakończona: ${result.succeeded} sukcesów, ${result.failed} błędów`)
      setSelectedPatientIds([])
      refetch()
    } catch (err) {
      console.error('Bulk operation failed:', err)
      window.alert('Operacja nie powiodła się')
    }
  }

  const hasActiveFilters =
    searchQuery || (filters.verificationStatus && filters.verificationStatus.length > 0)

  if (isLoading && !patientsData) {
    return <PageLoader size="lg" text="Ładowanie pacjentów..." />
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-error-600">Wystąpił błąd podczas ładowania pacjentów</p>
        <Button className="mt-4" variant="primary" onClick={() => refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pacjenci</h1>
          <p className="mt-1 text-neutral-600">Zarządzaj bazą pacjentów</p>
        </div>
        <Button
          data-testid="patients-add-button"
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 4v16m8-8H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          variant="primary"
          onClick={handleCreateClick}
        >
          Dodaj pacjenta
        </Button>
      </div>

      {/* Search and Filters */}
      <Card variant="outlined">
        <Card.Body>
          <div className="space-y-4">
            <PatientSearch
              placeholder="Szukaj po PESEL, imieniu, nazwisku lub HIS ID..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
            />

            {/* Status filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-600">Status:</span>
              <button
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  filters.verificationStatus?.includes('PENDING')
                    ? 'border-amber-300 bg-amber-100 text-amber-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
                data-testid="patients-filter-status-PENDING"
                onClick={() => handleFilterByStatus('PENDING')}
              >
                Oczekujący
              </button>
              <button
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  filters.verificationStatus?.includes('APPROVED')
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
                data-testid="patients-filter-status-APPROVED"
                onClick={() => handleFilterByStatus('APPROVED')}
              >
                Zweryfikowany
              </button>
              <button
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  filters.verificationStatus?.includes('REJECTED')
                    ? 'border-rose-300 bg-rose-100 text-rose-800'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } border`}
                data-testid="patients-filter-status-REJECTED"
                onClick={() => handleFilterByStatus('REJECTED')}
              >
                Odrzucony
              </button>

              {hasActiveFilters ? (
                <button
                  className="ml-auto text-sm font-medium text-primary-600 hover:text-primary-700"
                  onClick={clearFilters}
                >
                  Wyczyść filtry
                </button>
              ) : null}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Bulk action bar (US-K-05) */}
      <PatientBulkActionBar
        isLoading={isBulkLoading}
        selectedCount={selectedPatientIds.length}
        selectedIds={selectedPatientIds}
        onClear={handleClearSelection}
        onSubmit={handleBulkSubmit}
      />

      {/* Patient Table */}
      <Card variant="elevated">
        <Card.Body noPadding>
          <PatientTable
            selectable
            isLoading={isLoading}
            patients={patientsData?.data || []}
            selectedIds={selectedPatientIds}
            sortField={sortField}
            sortOrder={sortOrder}
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
            onPatientClick={handlePatientClick}
            onSortChange={handleSortChange}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />
        </Card.Body>

        {/* Pagination */}
        {patientsData && patientsData.total > 0 ? (
          <Card.Footer>
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-neutral-600">
                Wyświetlanie <span className="font-medium">{patientsData.data.length}</span> z{' '}
                <span className="font-medium">{patientsData.total}</span> pacjentów
              </p>

              <div className="flex items-center gap-2">
                <Button
                  disabled={!patientsData.has_previous}
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Poprzednia
                </Button>

                <span className="text-sm text-neutral-600">
                  Strona {patientsData.page + 1} z {patientsData.total_pages}
                </span>

                <Button
                  disabled={!patientsData.has_next}
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(patientsData.total_pages - 1, p + 1))}
                >
                  Następna
                </Button>
              </div>
            </div>
          </Card.Footer>
        ) : null}
      </Card>

      {/* Form Modal */}
      <PatientFormModal
        isLoading={isCreating || isUpdating}
        isOpen={isFormModalOpen}
        patient={editingPatient}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default PatientsPage
