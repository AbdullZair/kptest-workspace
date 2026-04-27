import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useGetComplianceStatsQuery,
  useGetComplianceChartDataQuery,
  useGetEventsStatsQuery,
  useGetMaterialsStatsQuery,
} from '../api/statsApi';
import { CircularProgress } from '../components/CircularProgress';
import { StatsCard } from '../components/StatsCard';
import { BarChart } from '../components/BarChart';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';
import type { StatsTimeRange } from '../api/types';

type TimeRange = '7d' | '14d' | '30d' | '90d' | 'all';

interface ComplianceStatsScreenNavigationProps {
  goBack: () => void;
}

export function ComplianceStatsScreen(): JSX.Element {
  const navigation = useNavigation<ComplianceStatsScreenNavigationProps>();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: complianceStats,
    isLoading: isLoadingCompliance,
    refetch: refetchCompliance,
  } = useGetComplianceStatsQuery({ range: timeRange });

  const { data: eventsStats, isLoading: isLoadingEvents } = useGetEventsStatsQuery({
    range: timeRange,
  });

  const { data: materialsStats, isLoading: isLoadingMaterials } =
    useGetMaterialsStatsQuery({ range: timeRange });

  const { data: chartData } = useGetComplianceChartDataQuery({
    range: timeRange,
    granularity: timeRange === '7d' || timeRange === '14d' ? 'day' : 'week',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchCompliance(),
      // Refetch other queries if needed
    ]);
    setRefreshing(false);
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 dni' },
    { value: '14d', label: '14 dni' },
    { value: '30d', label: '30 dni' },
    { value: '90d', label: '90 dni' },
    { value: 'all', label: 'Wszystko' },
  ];

  if (isLoadingCompliance) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie statystyk...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeRangeScroll}
        >
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                timeRange === range.value && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range.value)}
              accessibilityRole="button"
              accessibilityLabel={range.label}
              accessibilityState={{ selected: timeRange === range.value }}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range.value && styles.timeRangeTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Overall Compliance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ogólny Compliance</Text>
        <View style={styles.complianceCard}>
          <CircularProgress
            percentage={complianceStats?.overallCompliance || 0}
            size={160}
            strokeWidth={14}
            color={colors.primary}
            label="Compliance"
            subtitle={`${complianceStats?.completedEvents || 0}/${complianceStats?.totalEvents || 0} zadań`}
          />
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Szczegóły</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            title="Wykonane wydarzenia"
            value={`${complianceStats?.completedEvents || 0}/${complianceStats?.totalEvents || 0}`}
            subtitle={`${eventsStats?.percentage || 0}%`}
            icon="📅"
            color={colors.primary}
            trend="up"
            trendValue={5}
          />
          <StatsCard
            title="Przeczytane materiały"
            value={`${complianceStats?.readMaterials || 0}/${complianceStats?.totalMaterials || 0}`}
            subtitle={`${materialsStats?.percentage || 0}%`}
            icon="📚"
            color={colors.secondary}
            trend="up"
            trendValue={3}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatsCard
            title="Seria dni"
            value={complianceStats?.streak || 0}
            subtitle="Dni z rzędu"
            icon="🔥"
            color={colors.warning}
          />
          <StatsCard
            title="Ostatnia aktualizacja"
            value={
              complianceStats?.lastUpdated
                ? new Date(complianceStats.lastUpdated).toLocaleDateString('pl-PL')
                : '-'
            }
            icon="🕐"
            color={colors.info}
          />
        </View>
      </View>

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trend w czasie</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={chartData.map((d) => ({
                ...d,
                label: d.label,
              }))}
              height={220}
              barColor={colors.primary}
              showGrid={true}
              showLabels={true}
            />
          </View>
        </View>
      )}

      {/* Additional Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informacje</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Compliance to wskaźnik określający stopień realizacji zaleceń
            terapeutycznych. Im wyższy procent, tym lepiej realizujesz swój plan
            leczenia.
          </Text>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  timeRangeContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeRangeScroll: {
    paddingHorizontal: spacing.md,
  },
  timeRangeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  timeRangeTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  complianceCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    height: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default ComplianceStatsScreen;
