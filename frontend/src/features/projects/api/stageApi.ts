import { api } from '@shared/api'
import type { TherapyStage, PatientStageProgress, TherapyStageFormData } from '../types/stage.types'

export const stagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Get all stages for a project
    getStagesByProject: build.query<TherapyStage[], { projectId: string }>({
      query: ({ projectId }) => `/api/v1/therapy-stages?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TherapyStages' as const, id })),
              { type: 'TherapyStages' as const, id: 'LIST' },
            ]
          : [{ type: 'TherapyStages' as const, id: 'LIST' }],
    }),

    // Get stage by ID
    getStageById: build.query<TherapyStage, { id: string }>({
      query: ({ id }) => `/api/v1/therapy-stages/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: 'TherapyStages', id }],
    }),

    // Create stage
    createStage: build.mutation<TherapyStage, TherapyStageFormData>({
      query: (stage) => ({
        url: '/api/v1/therapy-stages',
        method: 'POST',
        body: stage,
      }),
      invalidatesTags: [{ type: 'TherapyStages', id: 'LIST' }],
    }),

    // Update stage
    updateStage: build.mutation<TherapyStage, { id: string; stage: TherapyStageFormData }>({
      query: ({ id, stage }) => ({
        url: `/api/v1/therapy-stages/${id}`,
        method: 'PUT',
        body: stage,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'TherapyStages', id }],
    }),

    // Delete stage
    deleteStage: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/therapy-stages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'TherapyStages', id: 'LIST' }],
    }),

    // Reorder stages (drag & drop)
    reorderStages: build.mutation<TherapyStage[], { projectId: string; stageIds: string[] }>({
      query: ({ projectId, stageIds }) => ({
        url: `/api/v1/therapy-stages/reorder?projectId=${projectId}`,
        method: 'POST',
        body: stageIds,
      }),
      invalidatesTags: [{ type: 'TherapyStages', id: 'LIST' }],
    }),

    // Get patient stage progress
    getPatientStageProgress: build.query<PatientStageProgress[], { patientProjectId: string }>({
      query: ({ patientProjectId }) =>
        `/api/v1/therapy-stages/progress?patientProjectId=${patientProjectId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'StageProgress' as const, id })),
              { type: 'StageProgress' as const, id: 'LIST' },
            ]
          : [{ type: 'StageProgress' as const, id: 'LIST' }],
    }),

    // Unlock stage
    unlockStage: build.mutation<
      PatientStageProgress,
      { patientProjectId: string; stageId: string }
    >({
      query: ({ patientProjectId, stageId }) => ({
        url: `/api/v1/therapy-stages/progress/unlock?patientProjectId=${patientProjectId}&stageId=${stageId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'StageProgress', id: 'LIST' }],
    }),

    // Complete stage
    completeStage: build.mutation<
      PatientStageProgress,
      { patientProjectId: string; stageId: string; reason?: string }
    >({
      query: ({ patientProjectId, stageId, reason }) => ({
        url: `/api/v1/therapy-stages/progress/complete?patientProjectId=${patientProjectId}&stageId=${stageId}${
          reason ? `&reason=${reason}` : ''
        }`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'StageProgress', id: 'LIST' }],
    }),

    // Get current stage
    getCurrentStage: build.query<PatientStageProgress | null, { patientProjectId: string }>({
      query: ({ patientProjectId }) =>
        `/api/v1/therapy-stages/progress/current?patientProjectId=${patientProjectId}`,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetStagesByProjectQuery,
  useGetStageByIdQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
  useReorderStagesMutation,
  useGetPatientStageProgressQuery,
  useUnlockStageMutation,
  useCompleteStageMutation,
  useGetCurrentStageQuery,
} = stagesApi
