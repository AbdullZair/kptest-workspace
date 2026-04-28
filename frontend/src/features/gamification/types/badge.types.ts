/**
 * Gamification types for the badges feature
 */

export type BadgeCategory = 'ENGAGEMENT' | 'COMPLIANCE' | 'EDUCATION' | 'MILESTONE' | 'STREAK'

export type RuleType =
  | 'EVENTS_COMPLETED'
  | 'COMPLIANCE_THRESHOLD'
  | 'MATERIALS_READ'
  | 'QUIZ_PASSED'
  | 'DAYS_STREAK'
  | 'STAGE_COMPLETED'

export interface BadgeRule {
  id: string
  badge_id: string
  rule_type: RuleType
  threshold: number
  event_type?: string
  category_filter?: string
  period_days?: number
  quiz_id?: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url?: string
  color?: string
  category: BadgeCategory
  is_active: boolean
  is_hidden: boolean
  rules: BadgeRule[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface PatientBadge {
  id: string
  patient_id: string
  badge_id: string
  badge_name: string
  badge_description: string
  badge_icon_url?: string
  badge_color?: string
  badge_category: string
  earned_at: string
  notified: boolean
  created_at: string
}

export interface BadgeFormData {
  name: string
  description: string
  icon_url?: string
  color?: string
  category: BadgeCategory
  is_active?: boolean
  is_hidden?: boolean
  rules?: BadgeRuleFormData[]
}

export interface BadgeRuleFormData {
  rule_type: RuleType
  threshold: number
  event_type?: string
  category_filter?: string
  period_days?: number
  quiz_id?: string
}

export interface BadgeStats {
  totalBadges: number
  engagementBadges: number
  complianceBadges: number
  educationBadges: number
  milestoneBadges: number
}
