import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { simpleColors, simpleSpacing, simpleTypography, simpleBorderRadius, simpleShadows } from './SimpleTheme';

interface SimpleCardProps {
  title?: string;
  description?: string;
  icon?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'highlight' | 'info' | 'warning';
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * SimpleCard - Accessibility-optimized card component
 * - High contrast borders
 * - Clear visual hierarchy
 * - Large touch targets when pressable
 * - Simplified layout
 */
export function SimpleCard({
  title,
  description,
  icon,
  children,
  onPress,
  variant = 'default',
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: SimpleCardProps): JSX.Element {
  const cardStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  const CardContent = (
    <>
      {icon && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      )}
      {(title || description) && (
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
      {children && <View style={styles.children}>{children}</View>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={cardStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint || 'Dotknij aby otworzyć'}
        activeOpacity={0.7}
        testID={testID}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={cardStyle}
      accessibilityRole="region"
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      {CardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: simpleColors.surface,
    borderRadius: simpleBorderRadius.lg,
    padding: simpleSpacing.lg,
    marginBottom: simpleSpacing.md,
    borderWidth: 2,
    borderColor: simpleColors.border,
    ...simpleShadows.md,
  },
  default: {
    borderColor: simpleColors.border,
  },
  highlight: {
    borderColor: simpleColors.primary,
    backgroundColor: simpleColors.infoLight + '30',
  },
  info: {
    borderColor: simpleColors.info,
    backgroundColor: simpleColors.infoLight + '30',
  },
  warning: {
    borderColor: simpleColors.warning,
    backgroundColor: simpleColors.warningLight + '30',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: simpleBorderRadius.full,
    backgroundColor: simpleColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: simpleSpacing.md,
    borderWidth: 2,
    borderColor: simpleColors.border,
  },
  icon: {
    fontSize: simpleTypography.fontSize.xxxl,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: simpleTypography.fontSize.xl,
    fontWeight: simpleTypography.fontWeight.bold,
    color: simpleColors.text,
    marginBottom: simpleSpacing.sm,
  },
  description: {
    fontSize: simpleTypography.fontSize.md,
    color: simpleColors.textSecondary,
    lineHeight: 28,
  },
  children: {
    marginTop: simpleSpacing.md,
  },
});

export default SimpleCard;
