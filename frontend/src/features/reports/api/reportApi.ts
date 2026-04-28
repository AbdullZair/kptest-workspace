import { api } from '@shared/api'
import type {
  ComplianceReport,
  PatientStats,
  ProjectStats,
  MaterialStats,
  DashboardKpi,
  ExportRequest,
  ReportHistory,
  ReportFilters,
} from '../types'

/**
 * Report API slice using RTK Query
 * Handles all report-related endpoints
 */
export const reportApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get compliance report
     * @query
     */
    getComplianceReport: builder.query<
      ComplianceReport,
      { projectId: string; dateFrom: string; dateTo: string }
    >({
      query: ({ projectId, dateFrom, dateTo }) => ({
        url: '/reports/compliance',
        method: 'GET',
        params: {
          projectId,
          dateFrom,
          dateTo,
        },
      }),
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Report', projectId, reportType: 'COMPLIANCE' },
      ],
    }),

    /**
     * Get patient statistics report
     * @query
     */
    getPatientStats: builder.query<
      PatientStats,
      { patientId: string; dateFrom?: string; dateTo?: string }
    >({
      query: ({ patientId, dateFrom, dateTo }) => ({
        url: '/reports/patients',
        method: 'GET',
        params: {
          patientId,
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      }),
      providesTags: (_result, _error, { patientId }) => [
        { type: 'Report', patientId, reportType: 'PATIENT_STATS' },
      ],
    }),

    /**
     * Get project statistics report
     * @query
     */
    getProjectStats: builder.query<
      ProjectStats,
      { projectId: string; dateFrom?: string; dateTo?: string }
    >({
      query: ({ projectId, dateFrom, dateTo }) => ({
        url: '/reports/projects',
        method: 'GET',
        params: {
          projectId,
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      }),
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Report', projectId, reportType: 'PROJECT_STATS' },
      ],
    }),

    /**
     * Get material statistics report
     * @query
     */
    getMaterialStats: builder.query<
      MaterialStats,
      { projectId: string; dateFrom?: string; dateTo?: string }
    >({
      query: ({ projectId, dateFrom, dateTo }) => ({
        url: '/reports/materials',
        method: 'GET',
        params: {
          projectId,
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      }),
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Report', projectId, reportType: 'MATERIAL_STATS' },
      ],
    }),

    /**
     * Get dashboard KPIs
     * @query
     */
    getDashboardKpis: builder.query<DashboardKpi, void>({
      query: () => ({
        url: '/reports/dashboard',
        method: 'GET',
      }),
      providesTags: ['DashboardKpi'],
    }),

    /**
     * Export report
     * @mutation
     */
    exportReport: builder.mutation<Blob, ExportRequest>({
      query: (request) => ({
        url: '/reports/export',
        method: 'POST',
        body: request,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    /**
     * Get report history
     * @query
     */
    getReportHistory: builder.query<ReportHistory[], ReportFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters && 'type' in filters && filters.type) {
          params.append('type', filters.type)
        }

        return {
          url: '/reports/history',
          method: 'GET',
          params,
        }
      },
      providesTags: ['ReportHistory'],
    }),
  }),
  overrideExisting: false,
})

// Add custom tag types for report-related entities
declare module '@reduxjs/toolkit/query/react' {
  interface ApiEndpointDefinitions {
    Report: {
      id?: string
      projectId?: string
      patientId?: string
      reportType?: string
    }
    DashboardKpi: {
      id: string
    }
    ReportHistory: {
      id: string
    }
  }
}

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetComplianceReportQuery,
  useGetPatientStatsQuery,
  useGetProjectStatsQuery,
  useGetMaterialStatsQuery,
  useGetDashboardKpisQuery,
  useExportReportMutation,
  useGetReportHistoryQuery,
  useLazyGetComplianceReportQuery,
  useLazyGetPatientStatsQuery,
  useLazyGetProjectStatsQuery,
  useLazyGetMaterialStatsQuery,
  useLazyGetReportHistoryQuery,
} = reportApiSlice

export default reportApiSlice
