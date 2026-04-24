import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { colors, spacing, typography } from '@app/theme';

interface PdfViewerProps {
  source?: { uri: string };
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onPageChanged?: (page: number, totalPages: number) => void;
}

/**
 * PdfViewer Component
 * 
 * This is a placeholder component for PDF viewing functionality.
 * In production, install and use react-native-pdf:
 * 
 * npm install react-native-pdf react-native-blob-util
 * 
 * Then replace this component with:
 * 
 * import Pdf from 'react-native-pdf';
 * 
 * export function PdfViewer({ source, onLoad, onError, onPageChanged }: PdfViewerProps) {
 *   return (
 *     <Pdf
 *       source={source}
 *       onLoadComplete={onLoad}
 *       onError={onError}
 *       onPageChanged={onPageChanged}
 *       style={styles.pdf}
 *     />
 *   );
 * }
 */

export function PdfViewer({ source, onLoad, onError, onPageChanged }: PdfViewerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>Podgląd PDF</Text>
        <Text style={styles.subtitle}>
          Wymaga instalacji react-native-pdf
        </Text>
        <Text style={styles.instructions}>
          npm install react-native-pdf react-native-blob-util
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  instructions: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default PdfViewer;
