import { api } from '@shared/api'
import type {
  Project,
  ProjectFormData,
  ProjectStatistics,
  ProjectFilters,
  AssignPatientsRequest,
  RemovePatientsRequest,
  PatientProject,
  ProjectPatientSummary,
  ProjectTeam,
} from '../types'
// Sample: types generated from backend OpenAPI spec via `npm run generate:api`
// (B3/US-S-06). Available for incremental adoption — see docs/architecture/adr/ADR-005.md
// Example shape (kept as type-only import to avoid runtime impact and any clashes
// with the existing local Project type used across this slice):
//   import type { components, operations } from '@shared/api/generated/types'
//   type ProjectResponse = components['schemas']['ProjectResponse']
//   type GetProjectByIdResponse =
//     operations['getProjectById']['responses']['200']['content']['application/json']
import type { components } from '@shared/api/generated/types'
/**
 * Generated DTO from backend OpenAPI spec. Use this instead of local `Project`
 * type when refactoring incrementally — keeps portal/mobile/backend in sync.
 * @see docs/architecture/adr/ADR-005.md
 */
export type GeneratedProjectResponse = components['schemas']['ProjectResponse']

/**
 * Project API slice using RTK Query
 * Handles all project-related endpoints
 */
export const projectApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all projects with filtering
     * @query
     */
    getProjects: builder.query<Project[], ProjectFilters>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters?.status) params.append('status', filters.status)
        if (filters?.name) params.append('name', filters.name)

        return {
          url: '/projects',
          method: 'GET',
          params,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    /**
     * Get project by ID
     * @query
     */
    getProjectById: builder.query<Project, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),

    /**
     * Create a new project
     * @mutation
     */
    createProject: builder.mutation<Project, ProjectFormData>({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    /**
     * Update an existing project
     * @mutation
     */
    updateProject: builder.mutation<Project, { id: string; project: ProjectFormData }>({
      query: ({ id, project }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: project,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    /**
     * Delete a project
     * @mutation
     */
    deleteProject: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    /**
     * Assign patients to a project
     * @mutation
     */
    assignPatients: builder.mutation<
      { message: string; assigned_count: number; patient_ids: string[] },
      { projectId: string; request: AssignPatientsRequest }
    >({
      query: ({ projectId, request }) => ({
        url: `/projects/${projectId}/patients`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    /**
     * Remove patients from a project
     * @mutation
     */
    removePatients: builder.mutation<
      { message: string; removed_count: number; patient_ids: string[] },
      { projectId: string; request: RemovePatientsRequest }
    >({
      query: ({ projectId, request }) => ({
        url: `/projects/${projectId}/patients`,
        method: 'DELETE',
        body: request,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    /**
     * Transfer a patient between projects (US-K-06).
     * Removes the patient from the source project (with audit reason) and
     * re-enrolls them into the target project in a single transaction.
     * @mutation
     */
    transferPatient: builder.mutation<
      {
        message: string
        patient_id: string
        from_project_id: string
        to_project_id: string
        audit_log_id?: string
      },
      { fromProjectId: string; patientId: string; toProjectId: string; reason: string }
    >({
      query: ({ fromProjectId, patientId, toProjectId, reason }) => ({
        url: `/projects/${fromProjectId}/patients/${patientId}/transfer/${toProjectId}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { fromProjectId, toProjectId }) => [
        { type: 'Project', id: fromProjectId },
        { type: 'Project', id: toProjectId },
        { type: 'Project', id: 'LIST' },
        { type: 'PatientProject', projectId: fromProjectId },
        { type: 'PatientProject', projectId: toProjectId },
        { type: 'ProjectStatistics', id: fromProjectId },
        { type: 'ProjectStatistics', id: toProjectId },
      ],
    }),

    /**
     * Get project statistics
     * @query
     */
    getProjectStatistics: builder.query<ProjectStatistics, string>({
      query: (id) => ({
        url: `/projects/${id}/statistics`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'ProjectStatistics', id }],
    }),

    /**
     * Get patients in a project
     * @query
     */
    getProjectPatients: builder.query<
      PatientProject[],
      { projectId: string; activeOnly?: boolean }
    >({
      query: ({ projectId, activeOnly = true }) => ({
        url: `/projects/${projectId}/patients`,
        method: 'GET',
        params: { activeOnly },
      }),
      providesTags: (_result, _error, { projectId }) => [{ type: 'PatientProject', projectId }],
    }),

    /**
     * Get patient summaries for a project (flat DTO with first/last name).
     * Mirrors backend ProjectPatientSummaryDto.
     * @query
     */
    getProjectPatientSummaries: builder.query<
      ProjectPatientSummary[],
      { projectId: string; activeOnly?: boolean }
    >({
      query: ({ projectId, activeOnly = true }) => ({
        url: `/projects/${projectId}/patients`,
        method: 'GET',
        params: { activeOnly },
      }),
      providesTags: (_result, _error, { projectId }) => [{ type: 'PatientProject', projectId }],
    }),

    /**
     * Get project team members
     * @query
     */
    getProjectTeam: builder.query<ProjectTeam[], string>({
      query: (id) => ({
        url: `/projects/${id}/team`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'ProjectTeam', id }],
    }),

    /**
     * Get my active projects
     * @query
     */
    getMyActiveProjects: builder.query<Project[], void>({
      query: () => ({
        url: '/projects/my/active',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project' as const, id: 'MY_ACTIVE' },
            ]
          : [{ type: 'Project' as const, id: 'MY_ACTIVE' }],
    }),
  }),
  overrideExisting: false,
})

/**
 * Add custom tag types for project-related entities (no-op currently).
 */
api.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
})

// Add tag types manually
declare module '@reduxjs/toolkit/query/react' {
  interface ApiEndpointDefinitions {
    ProjectStatistics: {
      id: string
    }
    PatientProject: {
      projectId: string
    }
    ProjectTeam: {
      id: string
    }
  }
}

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAssignPatientsMutation,
  useRemovePatientsMutation,
  useTransferPatientMutation,
  useGetProjectStatisticsQuery,
  useGetProjectPatientsQuery,
  useGetProjectPatientSummariesQuery,
  useGetProjectTeamQuery,
  useGetMyActiveProjectsQuery,
} = projectApiSlice

export default projectApiSlice
