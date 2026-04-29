import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '@app/theme';
import { useAccessibility } from '@shared/hooks/useAccessibility';

interface AccessibleTextProps {
  children: string;
  label?: string;
  hint?: string;
  variant?: 'body' | 'heading' | 'caption' | 'title' | 'subtitle';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  style?: TextStyle;
  testID?: string;
}

export function AccessibleText({
  children,
  label,
  hint,
  variant = 'body',
  size = 'medium',
  weight = 'regular',
  color,
  style,
  testID,
}: AccessibleTextProps): JSX.Element {
  const { fontSizeMultiplier } = useAccessibility();

  const sizeStyle = sizeStyles[size];
  const weightStyle = weightStyles[weight];

  const baseStyle = [
    styles.base,
    styles[variant],
    sizeStyle,
    weightStyle,
    {
      fontSize: sizeStyle.fontSize * fontSizeMultiplier,
      color: color || styles.base.color,
    },
    style,
  ];

  return (
    <Text
      style={baseStyle}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessible={!!label || !!hint}
      testID={testID}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  body: {
    lineHeight: 24,
  },
  heading: {
    fontWeight: typography.fontWeight.bold,
    lineHeight: 32,
  },
  caption: {
    color: colors.textSecondary,
  },
  title: {
    fontWeight: typography.fontWeight.bold,
    lineHeight: 28,
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

const sizeStyles = StyleSheet.create({
  small: { fontSize: typography.fontSize.sm },
  medium: { fontSize: typography.fontSize.md },
  large: { fontSize: typography.fontSize.lg },
  xlarge: { fontSize: typography.fontSize.xl },
});

const weightStyles = StyleSheet.create({
  regular: { fontWeight: typography.fontWeight.regular },
  medium: { fontWeight: typography.fontWeight.medium },
  semibold: { fontWeight: typography.fontWeight.semibold },
  bold: { fontWeight: typography.fontWeight.bold },
});

export default AccessibleText;
