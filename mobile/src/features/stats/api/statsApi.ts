import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ComplianceStats, StatsTimeRange } from './types';

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: ['ComplianceStats'],
  endpoints: (builder) => ({
    // Get compliance statistics
    getComplianceStats: builder.query<ComplianceStats, StatsTimeRange | void>({
      query: (params) => ({
        url: '/stats/compliance',
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['ComplianceStats'],
    }),

    // Get events statistics
    getEventsStats: builder.query<
      { completed: number; total: number; percentage: number },
      StatsTimeRange | void
    >({
      query: (params) => ({
        url: '/stats/events',
        method: 'GET',
        params: params || {},
      }),
    }),

    // Get materials statistics
    getMaterialsStats: builder.query<
      { read: number; total: number; percentage: number },
      StatsTimeRange | void
    >({
      query: (params) => ({
        url: '/stats/materials',
        method: 'GET',
        params: params || {},
      }),
    }),

    // Get compliance chart data
    getComplianceChartData: builder.query<
      { date: string; value: number }[],
      StatsTimeRange & { granularity: 'day' | 'week' | 'month' }
    >({
      query: (params) => ({
        url: '/stats/compliance/chart',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetComplianceStatsQuery,
  useGetEventsStatsQuery,
  useGetMaterialsStatsQuery,
  useGetComplianceChartDataQuery,
} = statsApi;

export default statsApi;
