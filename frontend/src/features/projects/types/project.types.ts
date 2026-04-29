/**
 * Project Types
 * TypeScript types for therapeutic project management
 */

/**
 * Project status enum
 */
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED'

/**
 * Therapy stage enum
 */
export type TherapyStage = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REMOVED'

/**
 * Project entity
 */
export interface Project {
  id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  status: ProjectStatus
  created_by: string
  created_by_name?: string
  compliance_threshold?: number
  config?: string
  active_patient_count?: number
  team_member_count?: number
  average_compliance_score?: number
  created_at: string
  updated_at: string
}

/**
 * Project form data for create/edit
 */
export interface ProjectFormData {
  name: string
  description?: string
  start_date: string
  end_date?: string
  status?: ProjectStatus
  compliance_threshold?: number
  config?: string
  team_member_ids?: string[]
  patient_ids?: string[]
}

/**
 * Project statistics response
 */
export interface ProjectStatistics {
  project_id: string
  project_name: string
  status: ProjectStatus
  total_patients: number
  active_patients: number
  completed_patients: number
  removed_patients: number
  team_members: number
  average_compliance_score?: number
  compliance_distribution: Record<string, number>
  stage_distribution: Record<TherapyStage, number>
  recent_activity: ActivityEntry[]
}

/**
 * Activity entry for statistics
 */
export interface ActivityEntry {
  type: string
  description: string
  timestamp: string
  user_name: string
}

/**
 * Assign patients request
 */
export interface AssignPatientsRequest {
  patient_ids: string[]
}

/**
 * Remove patients request
 */
export interface RemovePatientsRequest {
  patient_ids: string[]
  reason: string
}

/**
 * Patient project enrollment
 */
export interface PatientProject {
  id: string
  patient_id: string
  patient_name: string
  project_id: string
  enrolled_at: string
  left_at?: string
  removal_reason?: string
  current_stage: TherapyStage
  compliance_score?: number
  created_at: string
  updated_at: string
}

/**
 * Project patient summary returned by GET /projects/{id}/patients.
 * Flat, safe DTO that mirrors the backend ProjectPatientSummaryDto.
 */
export interface ProjectPatientSummary {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  current_stage: TherapyStage
  compliance_score?: number
  enrolled_at: string
  active: boolean
}

/**
 * Project team member
 */
export interface ProjectTeam {
  id: string
  project_id: string
  user_id: string
  user_name?: string
  role: ProjectRole
  assigned_at: string
  created_at: string
}

/**
 * Project role enum
 */
export type ProjectRole = 'COORDINATOR' | 'DOCTOR' | 'THERAPIST' | 'NURSE' | 'CONSULTANT'

/**
 * Project filters for list query
 */
export interface ProjectFilters {
  status?: ProjectStatus
  name?: string
}

/**
 * Project card props
 */
export interface ProjectCardProps {
  project: Project
  onProjectClick?: (project: Project) => void
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  className?: string
}

/**
 * Project statistics component props
 */
export interface ProjectStatisticsProps {
  statistics: ProjectStatistics
  className?: string
}

/**
 * Patient assignment modal props
 */
export interface PatientAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (patientIds: string[]) => Promise<void>
  projectId: string
  existingPatientIds?: string[]
  isLoading?: boolean
}

/**
 * Project form modal props
 */
export interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => Promise<void>
  project?: Project
  isLoading?: boolean
}
