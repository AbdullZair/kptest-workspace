import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetMaterialQuery } from '../api/materialApi';
import { colors, spacing, typography, borderRadius } from '@app/theme';

interface MaterialViewerRouteParams {
  materialId: string;
  url?: string;
}

interface MaterialViewerNavigationProps {
  goBack: () => void;
}

// Mock PDF Viewer - in production, use react-native-pdf
export function MaterialViewerScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<MaterialViewerNavigationProps>();
  const { materialId, url } = route.params as MaterialViewerRouteParams;
  const { data: material, isLoading, isError } = useGetMaterialQuery(materialId);
  const [loading, setLoading] = useState(true);

  const materialUrl = url || material?.url;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie materiału...</Text>
      </View>
    );
  }

  if (isError || !materialUrl) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Wystąpił błąd podczas ładowania</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Wróć</Text>
        </TouchableOpacity>
      </View>
    );
    }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingOverlayText}>Ładowanie...</Text>
        </View>
      )}

      {/* 
        In production, integrate with actual PDF viewer:
        - react-native-pdf for PDF files
        - react-native-webview for web content
        - expo-av for video/audio
      */}
      <View style={styles.viewerContainer}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>📄</Text>
          <Text style={styles.placeholderTitle}>Podgląd materiału</Text>
          <Text style={styles.placeholderText}>
            W wersji produkcyjnej użyj:
          </Text>
          <Text style={styles.placeholderSubtext}>
            • react-native-pdf dla plików PDF
          </Text>
          <Text style={styles.placeholderSubtext}>
            • expo-av dla wideo/audio
          </Text>
          <Text style={styles.placeholderSubtext}>
            • react-native-webview dla stron www
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Zamknij</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark + '80',
    zIndex: 1,
  },
  loadingOverlayText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textInverse,
  },
  viewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    margin: spacing.lg,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  placeholderTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  closeButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default MaterialViewerScreen;
