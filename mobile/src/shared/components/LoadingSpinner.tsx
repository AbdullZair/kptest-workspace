import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  text,
  fullScreen = false,
}: LoadingSpinnerProps): JSX.Element {
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View
      style={containerStyle}
      accessibilityRole="progressbar"
      accessibilityLabel={ACCESSIBILITY_LABELS.LOADING}
      accessibilityValue={{ text: text || 'Ładowanie...' }}
    >
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default LoadingSpinner;
