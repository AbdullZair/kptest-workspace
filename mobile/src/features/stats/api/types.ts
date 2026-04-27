export interface ComplianceStats {
  overallCompliance: number;
  eventsCompliance: number;
  materialsCompliance: number;
  completedEvents: number;
  totalEvents: number;
  readMaterials: number;
  totalMaterials: number;
  streak: number;
  lastUpdated: string;
}

export interface StatsTimeRange {
  startDate?: string;
  endDate?: string;
  range?: '7d' | '14d' | '30d' | '90d' | 'all';
}

export interface ComplianceChartData {
  date: string;
  value: number;
  label: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}
