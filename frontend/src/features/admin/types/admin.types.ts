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
export type AccountStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'REJECTED'
  | 'DEACTIVATED'

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
 * Create staff request (US-A-01)
 * Server-side schema constrains role to staff-only roles.
 */
export type CreateStaffRole = Exclude<UserRole, 'PATIENT'>

export interface CreateStaffRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: CreateStaffRole
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
 * System configuration map (US-A-05).
 * Flat key/value map of admin-tunable settings. The backend currently treats
 * this as a placeholder backed by hardcoded defaults; all values are strings.
 */
export type SystemConfig = Record<string, string>

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

// ==================== RODO / PATIENT DATA ====================

/**
 * Patient data for admin view
 */
export interface PatientDataAdmin {
  patient_id: string
  user_id?: string
  pesel: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  created_at: string
  updated_at: string
  deleted_at?: string
  anonymized_at?: string
  projects: PatientProjectData[]
}

/**
 * Patient project association
 */
export interface PatientProjectData {
  project_id: string
  project_name: string
  role: 'PATIENT' | 'GUARDIAN'
  enrolled_at: string
  active: boolean
}

/**
 * Anonymization reason enum
 *
 * Lowercase values are kept for backwards compatibility with the legacy
 * `components/AnonymizePatientDialog`. Uppercase values are the canonical
 * RODO codes used by `ui/AnonymizePatientDialog` (US-A-10).
 */
export type AnonymizationReason =
  | 'treatment'
  | 'patient_request'
  | 'other'
  | 'RODO_REQUEST'
  | 'PATIENT_REQUEST'
  | 'STATISTICAL_REPORT'
  | 'OTHER'

/**
 * Anonymization request
 */
export interface AnonymizePatientRequest {
  reason: AnonymizationReason
  additional_notes?: string
}

/**
 * Anonymization response
 */
export interface AnonymizationResponse {
  patient_id: string
  anonymized_at: string
  audit_log_id: string
  message: string
}

/**
 * Export format enum
 */
export type ExportFormat = 'json' | 'pdf'

/**
 * Patient data export DTO
 */
export interface PatientDataExport {
  patient: PatientDataAdmin
  projects: PatientProjectData[]
  messages: ExportedMessage[]
  materials: ExportedMaterialProgress[]
  events: ExportedCalendarEvent[]
  quiz_attempts: ExportedQuizAttempt[]
  badges: ExportedPatientBadge[]
  audit_logs: AuditLog[]
}

/**
 * Exported message for data export
 */
export interface ExportedMessage {
  message_id: string
  thread_id: string
  sender_id?: string
  content: string
  created_at: string
}

/**
 * Exported material progress
 */
export interface ExportedMaterialProgress {
  progress_id: string
  material_id: string
  material_name: string
  completed: boolean
  completed_at?: string
}

/**
 * Exported calendar event
 */
export interface ExportedCalendarEvent {
  event_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
}

/**
 * Exported quiz attempt
 */
export interface ExportedQuizAttempt {
  attempt_id: string
  quiz_id: string
  quiz_name: string
  score: number
  completed_at: string
}

/**
 * Exported patient badge
 */
export interface ExportedPatientBadge {
  badge_id: string
  badge_name: string
  badge_description: string
  earned_at: string
}

/**
 * Erasure request
 */
export interface ErasePatientRequest {
  reason: string
  confirm: boolean
  force?: boolean
}

/**
 * Erasure response
 */
export interface ErasureResponse {
  patient_id: string
  erased_at: string
  records_deleted: number
  audit_log_id: string
  message: string
}

// ==================== DATA PROCESSING ACTIVITIES ====================

/**
 * Legal basis for data processing
 */
export type LegalBasis =
  | 'CONSENT'
  | 'CONTRACT'
  | 'LEGAL_OBLIGATION'
  | 'VITAL_INTEREST'
  | 'PUBLIC_TASK'
  | 'LEGITIMATE_INTEREST'

// ==================== US-NH-01: Patient verification by staff ====================

/**
 * Patient verification status returned by /admin/patients/pending and approve/reject endpoints.
 */
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * Single entry in the pending-verifications list (US-NH-01).
 *
 * The PESEL is masked (last 4 digits only) for privacy.
 */
export interface PendingVerification {
  patient_id: string
  first_name: string
  last_name: string
  pesel_masked: string
  email?: string
  phone?: string
  verification_status: VerificationStatus
  his_patient_id?: string
  created_at: string
}

/**
 * Request body for POST /admin/patients/{id}/approve.
 *
 * - method = 'HIS': triggers HIS lookup; `his_cart_number` is required.
 * - method = 'MANUAL': manual override; `reason` (min 10 chars) is required.
 */
export interface ApproveVerificationRequest {
  method: 'HIS' | 'MANUAL'
  reason?: string
  his_cart_number?: string
}

/**
 * Request body for POST /admin/patients/{id}/reject.
 *
 * Reason must be at least 10 characters; rejection is irreversible.
 */
export interface RejectVerificationRequest {
  reason: string
}

/**
 * Response returned by approve/reject endpoints.
 */
export interface VerificationDecisionResponse {
  patient_id: string
  verification_status: VerificationStatus
  verification_method?: string
  verified_at?: string
  verified_by?: string
  audit_log_id?: string
  message: string
}

/**
 * Pagination filters for the pending-verifications list endpoint.
 */
export interface PendingVerificationFilters {
  page?: number
  size?: number
}

/**
 * Data Processing Activity DTO
 */
export interface DataProcessingActivity {
  id: string
  name: string
  purpose: string
  legal_basis: LegalBasis
  categories: string[]
  recipients: string[]
  retention_period: string
  security_measures: string
  data_controller: string
  data_processor?: string
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Data Processing Activity filters
 */
export interface DataProcessingActivityFilters {
  legal_basis?: LegalBasis
  date_from?: string
  date_to?: string
  page?: number
  size?: number
}

/**
 * Create/Update Data Processing Activity
 */
export interface DataProcessingActivityInput {
  name: string
  purpose: string
  legal_basis: LegalBasis
  categories: string[]
  recipients: string[]
  retention_period: string
  security_measures: string
  data_controller: string
  data_processor?: string
}
