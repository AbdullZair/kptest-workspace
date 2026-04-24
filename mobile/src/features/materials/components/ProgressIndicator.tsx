import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@app/theme';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
  showLabel?: boolean;
}

export function ProgressIndicator({
  progress,
  status,
  error,
  showLabel = true,
}: ProgressIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { color: colors.textLight, label: 'Oczekiwanie' };
      case 'downloading':
        return { color: colors.primary, label: 'Pobieranie...' };
      case 'completed':
        return { color: colors.success, label: 'Pobrano' };
      case 'failed':
        return { color: colors.error, label: error || 'Błąd' };
      default:
        return { color: colors.textLight, label: 'Nieznany' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: config.color,
            },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: config.color }]}>
            {status === 'downloading' ? `${Math.round(progress)}%` : config.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  labelContainer: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

export default ProgressIndicator;
