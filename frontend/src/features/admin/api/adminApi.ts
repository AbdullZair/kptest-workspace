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
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
  useExportAuditLogsMutation,
  useGetSystemLogsQuery,
  useExportSystemLogsMutation,
  useGetSystemHealthQuery,
  useGetSystemMetricsQuery,
  useClearCacheMutation,
  useCreateBackupMutation,
} = adminApiSlice

export default adminApiSlice
