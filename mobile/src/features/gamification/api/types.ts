/**
 * Gamification types for mobile
 */

export type BadgeCategory = 'ENGAGEMENT' | 'COMPLIANCE' | 'EDUCATION' | 'MILESTONE' | 'STREAK';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  color?: string;
  category: BadgeCategory;
  is_active: boolean;
  is_hidden: boolean;
}

export interface PatientBadge {
  id: string;
  patient_id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon_url?: string;
  badge_color?: string;
  badge_category: string;
  earned_at: string;
  notified: boolean;
}

export interface BadgeStats {
  totalBadges: number;
  engagementBadges: number;
  complianceBadges: number;
  educationBadges: number;
  milestoneBadges: number;
}
