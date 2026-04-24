import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Patient,
  PatientListParams,
  PatientListResponse,
  CreatePatientRequest,
  UpdatePatientRequest,
} from './types';

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      // Token will be added from auth slice state
      return headers;
    },
  }),
  tagTypes: ['Patient', 'PatientList'],
  endpoints: (builder) => ({
    // Get all patients (for staff)
    getPatients: builder.query<PatientListResponse, PatientListParams | void>({
      query: (params) => ({
        url: '/patients',
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.patients.map(({ id }) => ({ type: 'Patient' as const, id })),
              { type: 'PatientList' as const, id: 'LIST' },
            ]
          : [{ type: 'PatientList' as const, id: 'LIST' }],
    }),

    // Get single patient
    getPatient: builder.query<Patient, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    // Create patient
    createPatient: builder.mutation<Patient, CreatePatientRequest>({
      query: (data) => ({
        url: '/patients',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'PatientList', id: 'LIST' }],
    }),

    // Update patient
    updatePatient: builder.mutation<Patient, { id: string; data: UpdatePatientRequest }>({
      query: ({ id, data }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Patient', id },
        { type: 'PatientList', id: 'LIST' },
      ],
    }),

    // Delete patient
    deletePatient: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PatientList', id: 'LIST' }],
    }),

    // Get patient projects
    getPatientProjects: builder.query<Patient['activeProjects'], string>({
      query: (id) => ({
        url: `/patients/${id}/projects`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    // Search patients
    searchPatients: builder.query<Patient[], string>({
      query: (query) => ({
        url: '/patients/search',
        method: 'GET',
        params: { q: query },
      }),
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientProjectsQuery,
  useSearchPatientsQuery,
} = patientApi;

export default patientApi;
