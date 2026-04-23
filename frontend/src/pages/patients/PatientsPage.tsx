import { useState, useMemo } from 'react'
import { Card, Button, PageLoader } from '@shared/components'
import {
  PatientTable,
  PatientSearch,
  PatientFormModal,
  VerificationStatus,
} from '../ui'
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useVerifyPatientMutation,
  openCreateModal,
  openEditModal,
  closeFormModal,
  selectIsFormModalOpen,
  selectEditingPatientId,
  selectFilters,
  updateFilter,
} from '../../index'
import { useDispatch, useSelector } from 'react-redux'
import type { Patient, PatientFormData, PatientSearchRequest, VerificationStatusType } from '../../types'
import type { SortField, SortOrder } from '../ui/PatientTable'
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
  const [pageSize, setPageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')

  // RTK Query hooks
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation()
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation()
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation()
  const [verifyPatient] = useVerifyPatientMutation()

  // Build query params
  const queryParams: PatientSearchRequest = useMemo(() => ({
    page,
    size: pageSize,
    sort: sortField,
    sort_order: sortOrder,
    ...filters,
  }), [page, pageSize, sortField, sortOrder, filters])

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
    if (window.confirm(`Czy na pewno chcesz usunąć pacjenta ${patient.first_name} ${patient.last_name}?`)) {
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

  const handleVerifyPatient = async (pesel: string, cartNumber: string) => {
    try {
      const result = await verifyPatient({ pesel, cart_number: cartNumber }).unwrap()
      return result
    } catch (err) {
      console.error('Failed to verify patient:', err)
      throw err
    }
  }

  const handleFilterByStatus = (status: VerificationStatusType) => {
    const currentStatuses = filters.verificationStatus || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]

    dispatch(updateFilter({ key: 'verificationStatus', value: newStatuses.length > 0 ? newStatuses : undefined }))
  }

  const clearFilters = () => {
    setSearchQuery('')
    dispatch(updateFilter({ key: 'name', value: undefined }))
    dispatch(updateFilter({ key: 'verificationStatus', value: undefined }))
    dispatch(updateFilter({ key: 'status', value: undefined }))
  }

  const hasActiveFilters = searchQuery || (filters.verificationStatus && filters.verificationStatus.length > 0)

  if (isLoading && !patientsData) {
    return <PageLoader size="lg" text="Ładowanie pacjentów..." />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Wystąpił błąd podczas ładowania pacjentów</p>
        <Button variant="primary" onClick={() => refetch()} className="mt-4">
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
          <p className="text-neutral-600 mt-1">Zarządzaj bazą pacjentów</p>
        </div>
        <Button
          variant="primary"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
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
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Szukaj po PESEL, imieniu, nazwisku lub HIS ID..."
            />

            {/* Status filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-neutral-600">Status:</span>
              <button
                onClick={() => handleFilterByStatus('PENDING')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.verificationStatus?.includes('PENDING')
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                } border`}
              >
                Oczekujący
              </button>
              <button
                onClick={() => handleFilterByStatus('APPROVED')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.verificationStatus?.includes('APPROVED')
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                } border`}
              >
                Zweryfikowany
              </button>
              <button
                onClick={() => handleFilterByStatus('REJECTED')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.verificationStatus?.includes('REJECTED')
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                } border`}
              >
                Odrzucony
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Wyczyść filtry
                </button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Patient Table */}
      <Card variant="elevated">
        <Card.Body noPadding>
          <PatientTable
            patients={patientsData?.data || []}
            onPatientClick={handlePatientClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            isLoading={isLoading}
          />
        </Card.Body>

        {/* Pagination */}
        {patientsData && patientsData.total > 0 && (
          <Card.Footer>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-neutral-600">
                Wyświetlanie <span className="font-medium">{patientsData.data.length}</span> z{' '}
                <span className="font-medium">{patientsData.total}</span> pacjentów
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!patientsData.has_previous}
                >
                  Poprzednia
                </Button>

                <span className="text-sm text-neutral-600">
                  Strona {patientsData.page + 1} z {patientsData.total_pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(patientsData.total_pages - 1, p + 1))}
                  disabled={!patientsData.has_next}
                >
                  Następna
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Form Modal */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        patient={editingPatient}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default PatientsPage
