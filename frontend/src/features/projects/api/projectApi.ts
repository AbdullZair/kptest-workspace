import { api } from '@shared/api'
import type {
  Project,
  ProjectFormData,
  ProjectStatistics,
  ProjectFilters,
  AssignPatientsRequest,
  RemovePatientsRequest,
  PatientProject,
  ProjectTeam,
} from '../types'

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
  useGetProjectStatisticsQuery,
  useGetProjectPatientsQuery,
  useGetProjectTeamQuery,
  useGetMyActiveProjectsQuery,
} = projectApiSlice

export default projectApiSlice
