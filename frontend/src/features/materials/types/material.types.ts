/**
 * Educational Material Types
 * TypeScript types for educational material management
 */

/**
 * Material type enum
 */
export type MaterialType = 'ARTICLE' | 'PDF' | 'IMAGE' | 'VIDEO' | 'LINK' | 'AUDIO'

/**
 * Difficulty level enum
 */
export type DifficultyLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'

/**
 * Material status enum
 */
export type MaterialStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

/**
 * EducationalMaterial entity
 */
export interface EducationalMaterial {
  id: string
  project_id: string
  title: string
  content: string
  type: MaterialType
  file_url?: string
  external_url?: string
  category?: string
  difficulty: DifficultyLevel
  assigned_to_patients?: string[]
  assigned_to_stages?: string[]
  view_count: number
  completion_count: number
  published: boolean
  created_by: string
  published_at?: string
  created_at: string
  updated_at: string
}

/**
 * MaterialProgress entity
 */
export interface MaterialProgress {
  id: string
  material_id: string
  patient_id: string
  status: MaterialStatus
  started_at?: string
  completed_at?: string
  time_spent_seconds: number
  quiz_score?: number
  created_at: string
  updated_at: string
}

/**
 * Material DTO for creating and updating
 */
export interface MaterialDto {
  id?: string
  project_id: string
  title: string
  content: string
  type: MaterialType
  file_url?: string
  external_url?: string
  category?: string
  difficulty: DifficultyLevel
  assigned_to_patients?: string[]
  assigned_to_stages?: string[]
  published?: boolean
  created_by?: string
}

/**
 * Material filters for searching
 */
export interface MaterialFilters {
  project_id?: string
  category?: string
  difficulty?: DifficultyLevel
  type?: MaterialType
  published?: boolean
  patient_id?: string
  stage_id?: string
  query?: string
}

/**
 * Material form data for create/edit
 */
export interface MaterialFormData {
  title: string
  content: string
  type: MaterialType
  file_url?: string
  external_url?: string
  category?: string
  difficulty: DifficultyLevel
  assigned_to_patients?: string[]
  assigned_to_stages?: string[]
  published?: boolean
  /** Project the material is being uploaded to (admin flow). */
  project_id?: string
  /** ID of the user creating the material (admin flow). */
  created_by?: string
}

/**
 * Patient material progress summary
 */
export interface PatientMaterialProgress {
  material_id: string
  material_title: string
  material_type: MaterialType
  status: MaterialStatus
  completed_at?: string
  time_spent_seconds: number
  quiz_score?: number
}

/**
 * Material statistics
 */
export interface MaterialStatistics {
  total_materials: number
  completed_materials: number
  in_progress_materials: number
  pending_materials: number
  total_time_spent_seconds: number
  completion_percentage: number
}
