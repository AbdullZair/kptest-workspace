import { colors, spacing, typography, borderRadius, shadows } from './theme';

/**
 * Simple Theme - Accessibility-optimized theme with:
 * - 125% larger font sizes
 * - Minimum 48x48 touch targets
 * - High contrast colors
 * - Simplified navigation
 */

// Increased font sizes (125% larger)
export const simpleTypography = {
  fontSize: {
    xs: 15,    // 12 * 1.25
    sm: 17.5,  // 14 * 1.25
    md: 20,    // 16 * 1.25
    lg: 22.5,  // 18 * 1.25
    xl: 25,    // 20 * 1.25
    xxl: 30,   // 24 * 1.25
    xxxl: 40,  // 32 * 1.25
  },
  fontWeight: typography.fontWeight,
  fontFamily: typography.fontFamily,
};

// High contrast colors
export const simpleColors = {
  // Primary - higher contrast
  primary: '#3730A3',  // Darker indigo
  primaryLight: '#4F46E5',
  primaryDark: '#1E1B4B',

  // Background - pure white for maximum contrast
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  backgroundDark: '#000000',
  backgroundDarkSecondary: '#1A1A1A',

  // Surface
  surface: '#FFFFFF',
  surfaceDark: '#000000',

  // Text - maximum contrast
  text: '#000000',
  textSecondary: '#374151',
  textLight: '#6B7280',
  textInverse: '#FFFFFF',

  // Border - high contrast
  border: '#000000',
  borderDark: '#FFFFFF',

  // Status - high contrast variants
  error: '#B91C1C',
  errorLight: '#FEE2E2',
  warning: '#B45309',
  warningLight: '#FEF3C7',
  success: '#047857',
  successLight: '#D1FAE5',
  info: '#1D4ED8',
  infoLight: '#DBEAFE',

  // Focus indicator
  focus: '#2563EB',
};

// Larger spacing for easier touch
export const simpleSpacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  xxl: 56,
};

// Larger border radius for clarity
export const simpleBorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

// Stronger shadows for depth perception
export const simpleShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Minimum touch target size (WCAG 2.1 AAA - 48x48)
export const MIN_TOUCH_TARGET_SIMPLE = 48;

export const simpleLightTheme = {
  dark: false,
  colors: {
    primary: simpleColors.primary,
    background: simpleColors.background,
    card: simpleColors.surface,
    text: simpleColors.text,
    border: simpleColors.border,
    notification: simpleColors.error,
  },
  spacing: simpleSpacing,
  typography: simpleTypography,
  borderRadius: simpleBorderRadius,
  shadows: simpleShadows,
  colors: simpleColors,
  isSimpleMode: true,
};

export const simpleDarkTheme = {
  dark: true,
  colors: {
    primary: simpleColors.primaryLight,
    background: simpleColors.backgroundDark,
    card: simpleColors.surfaceDark,
    text: simpleColors.textInverse,
    border: simpleColors.borderDark,
    notification: simpleColors.errorLight,
  },
  spacing: simpleSpacing,
  typography: simpleTypography,
  borderRadius: simpleBorderRadius,
  shadows: simpleShadows,
  colors: {
    ...simpleColors,
    background: simpleColors.backgroundDark,
    surface: simpleColors.surfaceDark,
    text: simpleColors.textInverse,
  },
  isSimpleMode: true,
};

export type SimpleTheme = typeof simpleLightTheme;
