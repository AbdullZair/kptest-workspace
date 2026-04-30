// Patient API
export {
  patientApiSlice,
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useVerifyPatientMutation,
  useSearchPatientsQuery,
  useLazySearchPatientsQuery,
  useBulkOperationMutation,
} from './api/patientApi'

// Patient slice
export {
  patientReducer,
  setSelectedPatient,
  setFilters,
  updateFilter,
  clearFilters,
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeFormModal,
  selectSelectedPatient,
  selectFilters,
  selectSearchQuery,
  selectIsFormModalOpen,
  selectEditingPatientId,
} from './slices/patientSlice'

// Patient types
export type {
  Patient,
  PatientDto,
  PatientFormData,
  PatientSearchRequest,
  PatientSearchResponse,
  PatientVerifyRequest,
  PatientVerifyResponse,
  PatientTableFilters,
  VerificationStatus,
  BulkPatientRequest,
  BulkItemResult,
  BulkOperationResponse,
  BulkOperationKey,
} from './types'
