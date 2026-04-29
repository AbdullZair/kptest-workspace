import { api } from '@shared/api'
import type {
  Patient,
  PatientFormData,
  PatientSearchRequest,
  PatientSearchResponse,
  PatientVerifyRequest,
  PatientVerifyResponse,
} from '../types'

/**
 * Patient API slice using RTK Query
 * Handles all patient-related endpoints
 */
export const patientApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all patients with filtering and pagination
     * @query
     */
    getPatients: builder.query<PatientSearchResponse, PatientSearchRequest>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters.pesel) params.append('pesel', filters.pesel)
        if (filters.name) params.append('name', filters.name)
        if (filters.his_patient_id) params.append('hisPatientId', filters.his_patient_id)
        if (filters.status?.length) filters.status.forEach((s) => params.append('status', s))
        if (filters.verification_status?.length)
          filters.verification_status.forEach((s) => params.append('verificationStatus', s))
        if (filters.project) params.append('project', filters.project)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.sort_order) params.append('sortOrder', filters.sort_order)

        return {
          url: '/patients',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Patient' as const, id })),
              { type: 'Patient', id: 'LIST' },
            ]
          : [{ type: 'Patient', id: 'LIST' }],
    }),

    /**
     * Get patient by ID
     * @query
     */
    getPatientById: builder.query<Patient, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Patient', id }],
    }),

    /**
     * Create a new patient
     * @mutation
     */
    createPatient: builder.mutation<Patient, PatientFormData>({
      query: (patient) => ({
        url: '/patients',
        method: 'POST',
        body: patient,
      }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }],
    }),

    /**
     * Update an existing patient
     * @mutation
     */
    updatePatient: builder.mutation<Patient, { id: string; patient: PatientFormData }>({
      query: ({ id, patient }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body: patient,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
      ],
    }),

    /**
     * Delete a patient (soft delete)
     * @mutation
     */
    deletePatient: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
      ],
    }),

    /**
     * Verify patient with HIS
     * @mutation
     */
    verifyPatient: builder.mutation<PatientVerifyResponse, PatientVerifyRequest>({
      query: (request) => ({
        url: '/patients/verify',
        method: 'POST',
        body: request,
      }),
    }),

    /**
     * Search patients by query
     * @query
     */
    searchPatients: builder.query<Patient[], string>({
      query: (query) => ({
        url: '/patients/search',
        method: 'GET',
        params: { query },
      }),
      providesTags: () => [{ type: 'Patient', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useVerifyPatientMutation,
  useSearchPatientsQuery,
  useLazySearchPatientsQuery,
} = patientApiSlice

export default patientApiSlice
