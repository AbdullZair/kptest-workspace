import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '@app/theme';
import { useOffline } from '@shared/hooks/useOffline';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';

export function OfflineBanner(): JSX.Element | null {
  const { isOnline, queue } = useOffline();

  if (isOnline && queue.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={
        isOnline
          ? `Synchronizacja: ${queue.length} oczekujących akcji`
          : ACCESSIBILITY_LABELS.OFFLINE_MODE_BUTTON
      }
    >
      <Text style={styles.icon}>{isOnline ? '🔄' : '📡'}</Text>
      <Text style={styles.text}>
        {isOnline
          ? `Synchronizacja... (${queue.length} oczekujących)`
          : 'Brak połączenia z internetem'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  icon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
});

export default OfflineBanner;
