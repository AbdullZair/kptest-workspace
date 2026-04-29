import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useGetMyBadgesQuery, useGetBadgeStatsQuery } from '../api/badgeApi'
import type { PatientBadge } from '../api/types'
import { colors, spacing, typography, borderRadius } from '@app/theme'

type TabType = 'earned' | 'catalog'

export function MyBadgesScreen(): JSX.Element {
  // Mock patient ID - in real app, get from auth context
  const patientId = '00000000-0000-0000-0000-000000000000'

  const [activeTab, setActiveTab] = useState<TabType>('earned')

  const { data: myBadges = [], isLoading: isLoadingMy } = useGetMyBadgesQuery({ patientId })
  const { data: stats } = useGetBadgeStatsQuery({ patientId })

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      ENGAGEMENT: colors.primary,
      COMPLIANCE: colors.success,
      EDUCATION: colors.secondary,
      MILESTONE: colors.warning,
      STREAK: colors.accent,
    }
    return categoryColors[category] || colors.textLight
  }

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      ENGAGEMENT: 'Zaangażowanie',
      COMPLIANCE: 'Regularność',
      EDUCATION: 'Edukacja',
      MILESTONE: 'Kamień milowy',
      STREAK: 'Seria',
    }
    return labels[category] || category
  }

  const getBadgeIcon = (badge: PatientBadge): string => {
    if (badge.badge_icon_url) {
      return badge.badge_icon_url
    }

    const icons: Record<string, string> = {
      ENGAGEMENT: '🎯',
      COMPLIANCE: '✓',
      EDUCATION: '📚',
      MILESTONE: '🏆',
      STREAK: '🔥',
    }
    return icons[badge.badge_category] || '🏅'
  }

  const renderBadge = ({ item }: { item: PatientBadge }) => (
    <View
      style={[
        styles.badgeCard,
        { borderColor: getCategoryColor(item.badge_category) },
      ]}
    >
      <View
        style={[
          styles.badgeIconContainer,
          { backgroundColor: item.badge_color || colors.background },
        ]}
      >
        <Text style={styles.badgeIcon}>{getBadgeIcon(item)}</Text>
      </View>
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{item.badge_name}</Text>
        <Text style={styles.badgeDescription} numberOfLines={2}>
          {item.badge_description}
        </Text>
        <View style={styles.badgeMeta}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.badge_category) + '20' },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(item.badge_category) },
              ]}
            >
              {getCategoryLabel(item.badge_category)}
            </Text>
          </View>
          <Text style={styles.earnedDate}>
            {new Date(item.earned_at).toLocaleDateString('pl-PL')}
          </Text>
        </View>
      </View>
    </View>
  )

  if (isLoadingMy) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie odznak...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Stats */}
      {stats && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalBadges}</Text>
            <Text style={styles.statLabel}>Wszystkie</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.engagementBadges}</Text>
            <Text style={styles.statLabel}>Zaangażowanie</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.complianceBadges}</Text>
            <Text style={styles.statLabel}>Regularność</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.educationBadges}</Text>
            <Text style={styles.statLabel}>Edukacja</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.milestoneBadges}</Text>
            <Text style={styles.statLabel}>Kamienie</Text>
          </View>
        </ScrollView>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earned' && styles.tabActive]}
          onPress={() => setActiveTab('earned')}
        >
          <Text
            style={[styles.tabText, activeTab === 'earned' && styles.tabTextActive]}
          >
            Moje ({myBadges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'catalog' && styles.tabActive]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text
            style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}
          >
            Katalog
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'earned' ? (
        myBadges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏅</Text>
            <Text style={styles.emptyTitle}>Brak odznak</Text>
            <Text style={styles.emptyText}>
              Rozwiązuj quizy i realizuj cele, aby zdobywać odznaki!
            </Text>
          </View>
        ) : (
          <FlatList
            data={myBadges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Katalog odznak dostępny w wersji rozszerzonej
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  statsScroll: {
    maxHeight: 100,
    paddingVertical: spacing.md,
  },
  statBox: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: colors.textLight,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  badgeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    ...typography.small,
    fontWeight: '600',
  },
  earnedDate: {
    ...typography.small,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
  },
})
