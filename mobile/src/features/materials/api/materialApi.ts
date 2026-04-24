import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Material,
  MaterialListParams,
  MaterialListResponse,
  MaterialCategory,
} from './types';

export const materialApi = createApi({
  reducerPath: 'materialApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: ['Material', 'MaterialList', 'MaterialCategory'],
  endpoints: (builder) => ({
    // Get all materials
    getMaterials: builder.query<MaterialListResponse, MaterialListParams | void>({
      query: (params) => ({
        url: '/materials',
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.materials.map(({ id }) => ({ type: 'Material' as const, id })),
              { type: 'MaterialList' as const, id: 'LIST' },
            ]
          : [{ type: 'MaterialList' as const, id: 'LIST' }],
    }),

    // Get single material
    getMaterial: builder.query<Material, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Material', id }],
    }),

    // Get material categories
    getMaterialCategories: builder.query<MaterialCategory[], void>({
      query: () => ({
        url: '/materials/categories',
        method: 'GET',
      }),
      providesTags: ['MaterialCategory'],
    }),

    // Mark material as read
    markMaterialAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/materials/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Material', id },
        { type: 'MaterialList', id: 'LIST' },
      ],
    }),

    // Download material
    downloadMaterial: builder.mutation<
      { success: boolean; localPath: string },
      string
    >({
      query: (id) => ({
        url: `/materials/${id}/download`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Material', id }],
    }),

    // Delete downloaded material
    deleteDownloadedMaterial: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/materials/${id}/download`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Material', id }],
    }),

    // Search materials
    searchMaterials: builder.query<Material[], string>({
      query: (query) => ({
        url: '/materials/search',
        method: 'GET',
        params: { q: query },
      }),
    }),

    // Get materials by project
    getProjectMaterials: builder.query<MaterialListResponse, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/materials`,
        method: 'GET',
      }),
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.materials.map(({ id }) => ({ type: 'Material' as const, id })),
              { type: 'MaterialList', id: `PROJECT_${projectId}` },
            ]
          : [{ type: 'MaterialList', id: `PROJECT_${projectId}` }],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useGetMaterialCategoriesQuery,
  useMarkMaterialAsReadMutation,
  useDownloadMaterialMutation,
  useDeleteDownloadedMaterialMutation,
  useSearchMaterialsQuery,
  useGetProjectMaterialsQuery,
} = materialApi;

export default materialApi;
