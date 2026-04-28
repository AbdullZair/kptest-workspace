import { api } from '@shared/api'
import type {
  EducationalMaterial,
  MaterialDto,
  MaterialFormData,
  MaterialFilters,
  MaterialProgress,
} from '../types/material.types'

/**
 * Material API slice using RTK Query
 * Handles all educational material-related endpoints
 */
export const materialApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all materials with filtering
     * @query
     */
    getMaterials: builder.query<EducationalMaterial[], MaterialFilters>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters.project_id) params.append('projectId', filters.project_id)
        if (filters.category) params.append('category', filters.category)
        if (filters.difficulty) params.append('difficulty', filters.difficulty)
        if (filters.type) params.append('type', filters.type)
        if (filters.published !== undefined)
          params.append('published', filters.published.toString())

        return {
          url: '/materials',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Material' as const, id })),
              { type: 'Material', id: 'LIST' },
            ]
          : [{ type: 'Material', id: 'LIST' }],
    }),

    /**
     * Get material by ID
     * @query
     */
    getMaterialById: builder.query<EducationalMaterial, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Material', id }],
    }),

    /**
     * Create a new material
     * @mutation
     */
    createMaterial: builder.mutation<EducationalMaterial, MaterialFormData>({
      query: (material) => ({
        url: '/materials',
        method: 'POST',
        body: material,
      }),
      invalidatesTags: [{ type: 'Material', id: 'LIST' }],
    }),

    /**
     * Update an existing material
     * @mutation
     */
    updateMaterial: builder.mutation<
      EducationalMaterial,
      { id: string; material: MaterialFormData }
    >({
      query: ({ id, material }) => ({
        url: `/materials/${id}`,
        method: 'PUT',
        body: material,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Material', id },
        { type: 'Material', id: 'LIST' },
      ],
    }),

    /**
     * Delete a material
     * @mutation
     */
    deleteMaterial: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Material', id },
        { type: 'Material', id: 'LIST' },
      ],
    }),

    /**
     * Publish a material
     * @mutation
     */
    publishMaterial: builder.mutation<EducationalMaterial, string>({
      query: (id) => ({
        url: `/materials/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Material', id }],
    }),

    /**
     * Unpublish a material
     * @mutation
     */
    unpublishMaterial: builder.mutation<EducationalMaterial, string>({
      query: (id) => ({
        url: `/materials/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Material', id }],
    }),

    /**
     * Record a view for a material
     * @mutation
     */
    recordView: builder.mutation<EducationalMaterial, { id: string; patientId: string }>({
      query: ({ id, patientId }) => ({
        url: `/materials/${id}/view`,
        method: 'POST',
        params: { patientId },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Material', id }],
    }),

    /**
     * Mark material as complete
     * @mutation
     */
    markAsComplete: builder.mutation<
      EducationalMaterial,
      { id: string; patientId: string; quizScore?: number }
    >({
      query: ({ id, patientId, quizScore }) => ({
        url: `/materials/${id}/complete`,
        method: 'POST',
        params: { patientId, ...(quizScore !== undefined && { quizScore: quizScore.toString() }) },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Material', id }],
    }),

    /**
     * Get materials for patient
     * @query
     */
    getPatientMaterials: builder.query<EducationalMaterial[], string>({
      query: (patientId) => ({
        url: '/materials/my',
        method: 'GET',
        params: { patientId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Material', id })),
              { type: 'Material', id: 'LIST' },
            ]
          : [{ type: 'Material', id: 'LIST' }],
    }),

    /**
     * Get patient progress for all materials
     * @query
     */
    getPatientProgress: builder.query<MaterialProgress[], string>({
      query: (patientId) => ({
        url: '/materials/progress',
        method: 'GET',
        params: { patientId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MaterialProgress', id })),
              { type: 'MaterialProgress', id: 'LIST' },
            ]
          : [{ type: 'MaterialProgress', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetMaterialsQuery,
  useGetMaterialByIdQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  usePublishMaterialMutation,
  useUnpublishMaterialMutation,
  useRecordViewMutation,
  useMarkAsCompleteMutation,
  useGetPatientMaterialsQuery,
  useGetPatientProgressQuery,
} = materialApiSlice

export default materialApiSlice
