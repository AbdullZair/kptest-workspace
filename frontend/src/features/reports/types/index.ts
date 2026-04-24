import type { ProjectStatus, TherapyStage } from '@features/projects/types'

/**
 * Report types
 */
export type ReportType = 'COMPLIANCE' | 'PATIENT_STATS' | 'PROJECT_STATS' | 'MATERIAL_STATS'

/**
 * Compliance Report
 */
export interface ComplianceReport {
  project_id: string
  project_name: string
  date_from: string
  date_to: string
  overall_compliance: number
  compliance_threshold: number
  is_compliant: boolean
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  compliance_by_stage: Record<string, number>
  compliance_trend: ComplianceTrendEntry[]
  non_compliant_items: NonCompliantItem[]
}

export interface ComplianceTrendEntry {
  date: string
  compliance_score: number
}

export interface NonCompliantItem {
  item_id: string
  item_type: string
  description: string
  due_date: string
  days_overdue: number
  assigned_to: string
}

/**
 * Patient Statistics
 */
export interface PatientStats {
  patient_id: string
  patient_name: string
  pesel: string
  total_projects: number
  active_projects: number
  completed_projects: number
  overall_compliance: number
  total_sessions: number
  attended_sessions: number
  missed_sessions: number
  session_attendance_rate: number
  materials_completed: number
  materials_in_progress: number
  messages_sent: number
  messages_received: number
  project_stats: ProjectStatEntry[]
  compliance_history: ComplianceHistoryEntry[]
}

export interface ProjectStatEntry {
  project_id: string
  project_name: string
  status: string
  compliance_score: number
  current_stage: string
  enrollment_date: string
}

export interface ComplianceHistoryEntry {
  date: string
  compliance_score: number
}

/**
 * Project Statistics
 */
export interface ProjectStats {
  project_id: string
  project_name: string
  status: ProjectStatus
  start_date: string
  end_date: string | null
  total_patients: number
  active_patients: number
  completed_patients: number
  removed_patients: number
  average_compliance: number
  compliance_threshold: number
  is_compliant: boolean
  team_size: number
  stage_distribution: Record<TherapyStage, number>
  compliance_by_patient: PatientComplianceEntry[]
  recent_events: RecentEventEntry[]
}

export interface PatientComplianceEntry {
  patient_id: string
  patient_name: string
  compliance_score: number
  current_stage: TherapyStage
}

export interface RecentEventEntry {
  event_id: string
  event_type: string
  description: string
  scheduled_date: string
  status: string
}

/**
 * Material Statistics
 */
export interface MaterialStats {
  project_id: string
  project_name: string
  total_materials: number
  materials_assigned: number
  materials_completed: number
  materials_in_progress: number
  materials_not_started: number
  completion_rate: number
  average_completion_time_days: number
  materials_by_category: Record<string, number>
  materials_list: MaterialEntry[]
  patient_progress: PatientMaterialProgress[]
}

export interface MaterialEntry {
  material_id: string
  title: string
  category: string
  assigned_count: number
  completed_count: number
  completion_rate: number
}

export interface PatientMaterialProgress {
  patient_id: string
  patient_name: string
  materials_assigned: number
  materials_completed: number
  progress_percentage: number
}

/**
 * Dashboard KPIs
 */
export interface DashboardKpi {
  total_projects: number
  active_projects: number
  total_patients: number
  active_patients: number
  total_staff: number
  average_compliance: number
  overall_session_attendance: number
  materials_completion_rate: number
  pending_messages: number
  upcoming_sessions: number
  projects_at_risk: number
  compliance_trend: DashboardComplianceTrendEntry[]
  project_status_summary: Record<string, number>
  patient_stage_summary: Record<string, number>
  recent_alerts: AlertEntry[]
}

export interface DashboardComplianceTrendEntry {
  date: string
  compliance_score: number
}

export interface AlertEntry {
  type: string
  severity: string
  message: string
  created_at: string
  entity_id: string
}

/**
 * Export Request
 */
export interface ExportRequest {
  report_type: ReportType
  project_id?: string
  patient_id?: string
  date_from?: string
  date_to?: string
  format?: 'PDF' | 'EXCEL'
  include_charts?: boolean
  sections?: string[]
}

/**
 * Report History
 */
export interface ReportHistory {
  id: string
  type: ReportType
  project_id?: string
  project_name?: string
  patient_id?: string
  patient_name?: string
  date_from: string
  date_to: string
  generated_at: string
  generated_by: string
  generated_by_name?: string
}

/**
 * Report filters
 */
export interface ReportFilters {
  projectId?: string
  patientId?: string
  dateFrom?: string
  dateTo?: string
  type?: ReportType
}
