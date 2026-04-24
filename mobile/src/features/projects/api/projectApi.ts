import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Project,
  ProjectListParams,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectPatient,
  ProjectPatientsResponse,
} from './types';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: ['Project', 'ProjectList', 'ProjectPatients'],
  endpoints: (builder) => ({
    // Get all projects
    getProjects: builder.query<ProjectListResponse, ProjectListParams | void>({
      query: (params) => ({
        url: '/projects',
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.projects.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'ProjectList' as const, id: 'LIST' },
            ]
          : [{ type: 'ProjectList' as const, id: 'LIST' }],
    }),

    // Get single project
    getProject: builder.query<Project, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    // Create project
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ProjectList', id: 'LIST' }],
    }),

    // Update project
    updateProject: builder.mutation<Project, { id: string; data: UpdateProjectRequest }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'ProjectList', id: 'LIST' },
      ],
    }),

    // Delete project
    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ProjectList', id: 'LIST' }],
    }),

    // Get project patients
    getProjectPatients: builder.query<ProjectPatientsResponse, string>({
      query: (id) => ({
        url: `/projects/${id}/patients`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'ProjectPatients', id }],
    }),

    // Add patient to project
    addPatientToProject: builder.mutation<
      { success: boolean },
      { projectId: string; patientId: string }
    >({
      query: ({ projectId, patientId }) => ({
        url: `/projects/${projectId}/patients/${patientId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ProjectPatients', id: projectId },
      ],
    }),

    // Remove patient from project
    removePatientFromProject: builder.mutation<
      { success: boolean },
      { projectId: string; patientId: string }
    >({
      query: ({ projectId, patientId }) => ({
        url: `/projects/${projectId}/patients/${patientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'ProjectPatients', id: projectId },
      ],
    }),

    // Search projects
    searchProjects: builder.query<Project[], string>({
      query: (query) => ({
        url: '/projects/search',
        method: 'GET',
        params: { q: query },
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectPatientsQuery,
  useAddPatientToProjectMutation,
  useRemovePatientFromProjectMutation,
  useSearchProjectsQuery,
} = projectApi;

export default projectApi;
