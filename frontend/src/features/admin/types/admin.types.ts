/**
 * Admin module type definitions
 */

/**
 * User role enumeration
 */
export type UserRole = 'ADMIN' | 'COORDINATOR' | 'DOCTOR' | 'NURSE' | 'THERAPIST' | 'PATIENT'

/**
 * Account status enumeration
 */
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'BLOCKED' | 'REJECTED' | 'DEACTIVATED'

/**
 * User admin DTO
 */
export interface UserAdmin {
  user_id: string
  email: string
  phone?: string
  role: UserRole
  status: AccountStatus
  created_at: string
  updated_at: string
  last_login_at?: string
  two_factor_enabled: boolean
  failed_login_attempts: number
}

/**
 * Audit log action enumeration
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT'

/**
 * Audit log response DTO
 */
export interface AuditLog {
  log_id: string
  user_id: string
  action: AuditAction
  entity_type: string
  entity_id?: string
  old_value?: string
  new_value?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

/**
 * System log level enumeration
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

/**
 * System log response DTO
 */
export interface SystemLog {
  log_id: string
  level: LogLevel
  message: string
  stack_trace?: string
  source_class?: string
  source_method?: string
  created_at: string
}

/**
 * System health response DTO
 */
export interface SystemHealth {
  status: 'UP' | 'DOWN' | 'DEGRADED'
  database_status: string
  cache_status: string
  timestamp: string
  uptime_seconds: number
  version: string
  details: Record<string, HealthCheckDetail>
}

/**
 * Health check detail
 */
export interface HealthCheckDetail {
  status: string
  response_time_ms?: number
  message: string
}

/**
 * System metrics response DTO
 */
export interface SystemMetrics {
  memory_usage: MemoryMetrics
  cpu_usage: CpuMetrics
  database_metrics: DatabaseMetrics
  cache_metrics: CacheMetrics
  user_metrics: UserMetrics
  timestamp: string
}

/**
 * Memory metrics
 */
export interface MemoryMetrics {
  total_mb: number
  used_mb: number
  free_mb: number
  usage_percent: number
}

/**
 * CPU metrics
 */
export interface CpuMetrics {
  available_processors: number
  system_load_percent: number
}

/**
 * Database metrics
 */
export interface DatabaseMetrics {
  active_connections: number
  max_connections: number
  total_records: number
}

/**
 * Cache metrics
 */
export interface CacheMetrics {
  connected: boolean
  keys_count: number
  memory_usage_mb: number
}

/**
 * User metrics
 */
export interface UserMetrics {
  total_users: number
  active_users: number
  online_users: number
}

/**
 * Backup response DTO
 */
export interface BackupResponse {
  backup_id: string
  status: string
  file_name: string
  file_size_mb: number
  created_at: string
  message: string
}

/**
 * Reset password response DTO
 */
export interface ResetPasswordResponse {
  user_id: string
  message: string
  temporary_password: string
}

/**
 * Pagination response
 */
export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  isFirst: boolean
  isLast: boolean
}

/**
 * User filters
 */
export interface UserFilters {
  role?: UserRole
  status?: AccountStatus
  search?: string
  page?: number
  size?: number
}

/**
 * Audit log filters
 */
export interface AuditLogFilters {
  user_id?: string
  action?: AuditAction
  entity_type?: string
  date_from?: string
  date_to?: string
  page?: number
  size?: number
}

/**
 * System log filters
 */
export interface SystemLogFilters {
  level?: LogLevel
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  size?: number
}

/**
 * Update user role request
 */
export interface UpdateUserRoleRequest {
  new_role: UserRole
}

/**
 * Update user status request
 */
export interface UpdateUserStatusRequest {
  new_status: AccountStatus
}

/**
 * Export logs request
 */
export interface ExportLogsRequest {
  format: 'CSV' | 'JSON'
}

/**
 * Force password reset request
 */
export interface ForcePasswordResetRequest {
  reason: string
}

/**
 * Force password reset response
 */
export interface ForcePasswordResetResponse {
  user_id: string
  message: string
  temporary_password: string
}

/**
 * Clear 2FA request
 */
export interface Clear2faRequest {
  reason: string
}

/**
 * Clear 2FA response
 */
export interface Clear2faResponse {
  user_id: string
  message: string
}

/**
 * Generate activation code response
 */
export interface ActivationCodeResponse {
  patient_id: string
  activation_code: string
  expires_at: string
  pdf_url?: string
  message: string
}
