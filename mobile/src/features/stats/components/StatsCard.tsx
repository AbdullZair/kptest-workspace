import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { StatsCardProps } from '../api/types';

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue,
}: StatsCardProps): JSX.Element {
  return (
    <View
      style={[styles.container, { borderLeftColor: color }]}
      accessibilityRole="text"
      accessibilityLabel={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              trend === 'up' && styles.trendUp,
              trend === 'down' && styles.trendDown,
            ]}
          >
            <Text
              style={[
                styles.trendText,
                trend === 'up' && styles.trendTextUp,
                trend === 'down' && styles.trendTextDown,
              ]}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              {trendValue && ` ${trendValue}%`}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  trendUp: {
    backgroundColor: colors.successLight,
  },
  trendDown: {
    backgroundColor: colors.errorLight,
  },
  trendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  trendTextUp: {
    color: colors.success,
  },
  trendTextDown: {
    color: colors.error,
  },
  value: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});

export default StatsCard;
