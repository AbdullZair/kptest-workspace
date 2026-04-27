import { api } from '@shared/api'
import type {
  UserAdmin,
  AuditLog,
  SystemLog,
  SystemHealth,
  SystemMetrics,
  BackupResponse,
  ResetPasswordResponse,
  PageResponse,
  UserFilters,
  AuditLogFilters,
  SystemLogFilters,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  ExportLogsRequest,
  PatientDataAdmin,
  AnonymizePatientRequest,
  AnonymizationResponse,
  ExportFormat,
  ErasePatientRequest,
  ErasureResponse,
  DataProcessingActivity,
  DataProcessingActivityFilters,
  DataProcessingActivityInput,
} from '../types'

/**
 * Admin API slice using RTK Query
 * Handles all admin panel operations
 */
export const adminApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with filters
     */
    getAdminUsers: builder.query<PageResponse<UserAdmin>, UserFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        if (filters.role) params.append('role', filters.role)
        if (filters.status) params.append('status', filters.status)
        if (filters.search) params.append('search', filters.search)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return `/admin/users?${params.toString()}`
      },
      providesTags: ['AdminUser'],
    }),

    /**
     * Get user by ID
     */
    getAdminUserById: builder.query<UserAdmin, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: ['AdminUser'],
    }),

    /**
     * Update user role
     */
    updateUserRole: builder.mutation<UserAdmin, { userId: string; body: UpdateUserRoleRequest }>({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),

    /**
     * Update user status
     */
    updateUserStatus: builder.mutation<UserAdmin, { userId: string; body: UpdateUserStatusRequest }>({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),

    /**
     * Reset user password
     */
    resetUserPassword: builder.mutation<ResetPasswordResponse, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/reset-password`,
        method: 'PUT',
      }),
      invalidatesTags: ['AdminUser'],
    }),

    /**
     * Delete user
     */
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUser'],
    }),

    /**
     * Force password reset
     */
    forcePasswordReset: builder.mutation<
      ResetPasswordResponse,
      { userId: string; body: ForcePasswordResetRequest }
    >({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/force-password-reset`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),

    /**
     * Clear 2FA
     */
    clear2fa: builder.mutation<Clear2faResponse, { userId: string; body: Clear2faRequest }>({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/clear-2fa`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),

    /**
     * Generate activation code
     */
    generateActivationCode: builder.mutation<ActivationCodeResponse, string>({
      query: (patientId) => ({
        url: `/admin/patients/${patientId}/generate-activation-code`,
        method: 'POST',
      }),
    }),

    // ==================== AUDIT LOGS ====================

    /**
     * Get audit logs with filters
     */
    getAuditLogs: builder.query<PageResponse<AuditLog>, AuditLogFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        if (filters.user_id) params.append('userId', filters.user_id)
        if (filters.action) params.append('action', filters.action)
        if (filters.entity_type) params.append('entityType', filters.entity_type)
        if (filters.date_from) params.append('dateFrom', filters.date_from)
        if (filters.date_to) params.append('dateTo', filters.date_to)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return `/admin/audit-logs?${params.toString()}`
      },
      providesTags: ['AuditLog'],
    }),

    /**
     * Get audit log by ID
     */
    getAuditLogById: builder.query<AuditLog, string>({
      query: (logId) => `/admin/audit-logs/${logId}`,
      providesTags: ['AuditLog'],
    }),

    /**
     * Export audit logs
     */
    exportAuditLogs: builder.mutation<Blob, ExportLogsRequest>({
      query: (body) => ({
        url: '/admin/audit-logs/export',
        method: 'POST',
        body,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // ==================== SYSTEM LOGS ====================

    /**
     * Get system logs with filters
     */
    getSystemLogs: builder.query<PageResponse<SystemLog>, SystemLogFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        if (filters.level) params.append('level', filters.level)
        if (filters.date_from) params.append('dateFrom', filters.date_from)
        if (filters.date_to) params.append('dateTo', filters.date_to)
        if (filters.search) params.append('search', filters.search)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return `/admin/system-logs?${params.toString()}`
      },
      providesTags: ['SystemLog'],
    }),

    /**
     * Export system logs
     */
    exportSystemLogs: builder.mutation<Blob, ExportLogsRequest>({
      query: (body) => ({
        url: '/admin/system-logs/export',
        method: 'POST',
        body,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // ==================== SYSTEM OPERATIONS ====================

    /**
     * Get system health
     */
    getSystemHealth: builder.query<SystemHealth, void>({
      query: () => '/admin/system/health',
      providesTags: ['SystemHealth'],
    }),

    /**
     * Get system metrics
     */
    getSystemMetrics: builder.query<SystemMetrics, void>({
      query: () => '/admin/system/metrics',
      providesTags: ['SystemMetrics'],
    }),

    /**
     * Clear cache
     */
    clearCache: builder.mutation<{ status: string; message: string }, void>({
      query: () => ({
        url: '/admin/system/cache/clear',
        method: 'POST',
      }),
      invalidatesTags: ['SystemMetrics'],
    }),

    /**
     * Create backup
     */
    createBackup: builder.mutation<BackupResponse, void>({
      query: () => ({
        url: '/admin/system/backup',
        method: 'POST',
      }),
    }),

    // ==================== RODO / PATIENT DATA ====================

    /**
     * Get patient data for admin view
     */
    getPatientData: builder.query<PatientDataAdmin, string>({
      query: (patientId) => `/admin/patients/${patientId}/data`,
      providesTags: ['PatientData'],
    }),

    /**
     * Anonymize patient data
     */
    anonymizePatient: builder.mutation<AnonymizationResponse, { patientId: string; body: AnonymizePatientRequest }>({
      query: ({ patientId, body }) => ({
        url: `/admin/patients/${patientId}/anonymize`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PatientData', 'AdminUser', 'AuditLog'],
    }),

    /**
     * Export patient data (RODO Art. 20)
     */
    exportPatientData: builder.mutation<Blob, { patientId: string; format: ExportFormat }>({
      query: ({ patientId, format }) => ({
        url: `/admin/patients/${patientId}/export-data?format=${format}`,
        method: 'GET',
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    /**
     * Erase patient data (RODO Art. 17)
     */
    erasePatient: builder.mutation<ErasureResponse, { patientId: string; body: ErasePatientRequest }>({
      query: ({ patientId, body }) => ({
        url: `/admin/patients/${patientId}/erase`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['PatientData', 'AdminUser', 'AuditLog'],
    }),

    // ==================== DATA PROCESSING ACTIVITIES ====================

    /**
     * Get all data processing activities
     */
    getDataProcessingActivities: builder.query<PageResponse<DataProcessingActivity>, DataProcessingActivityFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        if (filters.legal_basis) params.append('legalBasis', filters.legal_basis)
        if (filters.date_from) params.append('dateFrom', filters.date_from)
        if (filters.date_to) params.append('dateTo', filters.date_to)
        if (filters.page !== undefined) params.append('page', filters.page.toString())
        if (filters.size !== undefined) params.append('size', filters.size.toString())

        return `/admin/data-processing-activities?${params.toString()}`
      },
      providesTags: ['DataProcessingActivity'],
    }),

    /**
     * Get data processing activity by ID
     */
    getDataProcessingActivityById: builder.query<DataProcessingActivity, string>({
      query: (id) => `/admin/data-processing-activities/${id}`,
      providesTags: ['DataProcessingActivity'],
    }),

    /**
     * Create data processing activity
     */
    createDataProcessingActivity: builder.mutation<DataProcessingActivity, DataProcessingActivityInput>({
      query: (body) => ({
        url: '/admin/data-processing-activities',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DataProcessingActivity'],
    }),

    /**
     * Update data processing activity
     */
    updateDataProcessingActivity: builder.mutation<DataProcessingActivity, { id: string; body: DataProcessingActivityInput }>({
      query: ({ id, body }) => ({
        url: `/admin/data-processing-activities/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DataProcessingActivity'],
    }),

    /**
     * Delete data processing activity
     */
    deleteDataProcessingActivity: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/data-processing-activities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DataProcessingActivity'],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
  useForcePasswordResetMutation,
  useClear2faMutation,
  useGenerateActivationCodeMutation,
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
  useExportAuditLogsMutation,
  useGetSystemLogsQuery,
  useExportSystemLogsMutation,
  useGetSystemHealthQuery,
  useGetSystemMetricsQuery,
  useClearCacheMutation,
  useCreateBackupMutation,
  // RODO / Patient Data
  useGetPatientDataQuery,
  useAnonymizePatientMutation,
  useExportPatientDataMutation,
  useErasePatientMutation,
  // Data Processing Activities
  useGetDataProcessingActivitiesQuery,
  useGetDataProcessingActivityByIdQuery,
  useCreateDataProcessingActivityMutation,
  useUpdateDataProcessingActivityMutation,
  useDeleteDataProcessingActivityMutation,
} = adminApiSlice

export default adminApiSlice
