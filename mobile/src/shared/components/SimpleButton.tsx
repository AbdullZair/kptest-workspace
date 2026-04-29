import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { simpleColors, simpleSpacing, simpleTypography, simpleBorderRadius, simpleShadows, MIN_TOUCH_TARGET_SIMPLE } from '@app/theme/SimpleTheme';

interface SimpleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'medium' | 'large';
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  fullWidth?: boolean;
}

/**
 * SimpleButton - Accessibility-optimized button component
 * - Minimum 48x48 touch target
 * - Larger font sizes (125% larger)
 * - High contrast colors
 * - Clear visual states
 */
export function SimpleButton({
  onPress,
  label,
  hint,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon,
  style,
  textStyle,
  testID,
  fullWidth = false,
}: SimpleButtonProps): JSX.Element {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyleArray = [
    styles.textBase,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={buttonStyle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      accessible={true}
      testID={testID}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={textStyleArray}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: simpleBorderRadius.lg,
    minHeight: MIN_TOUCH_TARGET_SIMPLE,
    borderWidth: 2,
    ...simpleShadows.md,
  },
  primary: {
    backgroundColor: simpleColors.primary,
    borderColor: simpleColors.primary,
  },
  secondary: {
    backgroundColor: simpleColors.success,
    borderColor: simpleColors.success,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: simpleColors.primary,
  },
  danger: {
    backgroundColor: simpleColors.error,
    borderColor: simpleColors.error,
  },
  medium: {
    paddingHorizontal: simpleSpacing.lg,
    paddingVertical: simpleSpacing.md,
    minHeight: MIN_TOUCH_TARGET_SIMPLE,
  },
  large: {
    paddingHorizontal: simpleSpacing.xl,
    paddingVertical: simpleSpacing.lg,
    minHeight: MIN_TOUCH_TARGET_SIMPLE + 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: simpleColors.textLight,
    borderColor: simpleColors.textLight,
    opacity: 0.6,
  },
  textBase: {
    fontWeight: simpleTypography.fontWeight.bold,
    textAlign: 'center',
  },
  primaryText: {
    color: simpleColors.textInverse,
  },
  secondaryText: {
    color: simpleColors.textInverse,
  },
  outlineText: {
    color: simpleColors.primary,
  },
  dangerText: {
    color: simpleColors.textInverse,
  },
  mediumText: {
    fontSize: simpleTypography.fontSize.lg,
  },
  largeText: {
    fontSize: simpleTypography.fontSize.xl,
  },
  disabledText: {
    color: simpleColors.textInverse,
  },
  icon: {
    marginRight: simpleSpacing.sm,
    fontSize: simpleTypography.fontSize.xl,
  },
});

export default SimpleButton;
