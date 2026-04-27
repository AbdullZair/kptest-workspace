import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '@app/theme';

interface ListEmptyComponentProps {
  message?: string;
  icon?: string;
}

export function ListEmptyComponent({
  message = 'Brak danych',
  icon = '📭',
}: ListEmptyComponentProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

interface ListLoadingComponentProps {
  message?: string;
}

export function ListLoadingComponent({
  message = 'Ładowanie...',
}: ListLoadingComponentProps): JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

interface ListErrorComponentProps {
  message?: string;
  onRetry?: () => void;
}

export function ListErrorComponent({
  message = 'Wystąpił błąd',
  onRetry,
}: ListErrorComponentProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryButton} onPress={onRetry}>
          Spróbuj ponownie
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ListEmptyComponent;
