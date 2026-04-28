/**
 * Therapy stages types for the projects feature
 */

export type UnlockMode = 'MANUAL' | 'AUTO_QUIZ'

export interface TherapyStage {
  id: string
  name: string
  description?: string
  project_id: string
  order_index: number
  unlock_mode: UnlockMode
  required_quiz_id?: string
  required_quiz_title?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface PatientStageProgress {
  id: string
  patient_project_id: string
  stage_id: string
  stage_name: string
  started_at?: string
  completed_at?: string
  unlocked_at?: string
  status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED'
  completed_by?: string
  completion_reason?: string
  created_at: string
  updated_at: string
}

export interface TherapyStageFormData {
  name: string
  description?: string
  project_id: string
  order_index?: number
  unlock_mode: UnlockMode
  required_quiz_id?: string
  is_active?: boolean
}
