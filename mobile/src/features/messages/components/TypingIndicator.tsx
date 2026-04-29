import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@app/theme';

interface TypingIndicatorProps {
  isTyping?: boolean;
}

export function TypingIndicator({ isTyping = false }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.dot, styles.dot3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
  },
  dot2: {
    // animation delays are handled via Animated API in RN, not CSS strings
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.5,
  },
});

export default TypingIndicator;
