import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  useGetMaterialQuery,
  useMarkMaterialAsReadMutation,
  useDownloadMaterialMutation,
  useDeleteDownloadedMaterialMutation,
} from '../api/materialApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';

interface MaterialDetailRouteParams {
  materialId: string;
}

interface MaterialDetailNavigationProps {
  goBack: () => void;
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

export function MaterialDetailScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<MaterialDetailNavigationProps>();
  const { materialId } = route.params as MaterialDetailRouteParams;
  const { data: material, isLoading, isError } = useGetMaterialQuery(materialId);
  const [markAsRead] = useMarkMaterialAsReadMutation();
  const [downloadMaterial] = useDownloadMaterialMutation();
  const [deleteDownloaded] = useDeleteDownloadedMaterialMutation();

  const handleOpenMaterial = () => {
    if (material?.url) {
      Linking.openURL(material.url);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(materialId).unwrap();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadMaterial(materialId).unwrap();
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  const handleDeleteDownload = () => {
    Alert.alert(
      'Usuń pobrany materiał',
      'Czy na pewno chcesz usunąć pobrany materiał z urządzenia?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deleteDownloaded(materialId).unwrap();
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaterialTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      article: 'Artykuł',
      pdf: 'PDF',
      image: 'Obraz',
      video: 'Video',
      audio: 'Audio',
      link: 'Link',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie materiału...</Text>
      </View>
    );
  }

  if (isError || !material) {
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {material.thumbnailUrl && (
        <View style={styles.thumbnailContainer}>
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>
              {material.type === 'video' && '🎥'}
              {material.type === 'audio' && '🎵'}
              {material.type === 'pdf' && '📄'}
              {material.type === 'image' && '🖼️'}
              {material.type === 'article' && '📝'}
              {material.type === 'link' && '🔗'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{getMaterialTypeLabel(material.type)}</Text>
        </View>
        {material.isRead && (
          <View style={styles.readBadge}>
            <Text style={styles.readText}>Przeczytane</Text>
          </View>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{material.title}</Text>
      </View>

      {material.projectName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projekt</Text>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() =>
              navigation.navigate('ProjectDetail', { projectId: material.projectId })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.projectName}>{material.projectName}</Text>
          </TouchableOpacity>
        </View>
      )}

      {material.category && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoria</Text>
          <View style={styles.infoCard}>
            <Text style={styles.categoryText}>{material.category}</Text>
          </View>
        </View>
      )}

      {material.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opis</Text>
          <View style={styles.infoCard}>
            <Text style={styles.description}>{material.description}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Szczegóły</Text>
        <View style={styles.infoCard}>
          {(material.fileSize || material.duration) && (
            <View style={styles.infoRow}>
              {material.fileSize && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Rozmiar:</Text>
                  <Text style={styles.detailValue}>
                    {formatFileSize(material.fileSize)}
                  </Text>
                </View>
              )}
              {material.duration && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Czas trwania:</Text>
                  <Text style={styles.detailValue}>
                    {formatDuration(material.duration)}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>Dodano:</Text>
            <Text style={styles.detailValue}>
              {new Date(material.createdAt).toLocaleDateString('pl-PL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          {material.isDownloaded && (
            <View style={styles.infoRow}>
              <Text style={styles.detailLabel}>Status pobrania:</Text>
              <Text style={[styles.detailValue, styles.downloadedValue]}>
                ✓ Pobrano
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {!material.isRead && (
          <TouchableOpacity
            style={[styles.actionButton, styles.markReadButton]}
            onPress={handleMarkAsRead}
          >
            <Text style={styles.markReadButtonText}>Oznacz jako przeczytane</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.openButton]}
          onPress={handleOpenMaterial}
        >
          <Text style={styles.openButtonText}>Otwórz materiał</Text>
        </TouchableOpacity>

        {!material.isDownloaded ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownload}
          >
            <Text style={styles.downloadButtonText}>Pobierz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteDownloadButton]}
            onPress={handleDeleteDownload}
          >
            <Text style={styles.deleteDownloadButtonText}>Usuń pobrany</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnailContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  readBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  readText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  titleContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  projectName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  downloadedValue: {
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  markReadButton: {
    backgroundColor: colors.success,
  },
  markReadButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  openButton: {
    backgroundColor: colors.primary,
  },
  openButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  downloadButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  downloadButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  deleteDownloadButton: {
    backgroundColor: colors.errorLight,
  },
  deleteDownloadButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  footer: {
    height: spacing.xxl,
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

export default MaterialDetailScreen;
