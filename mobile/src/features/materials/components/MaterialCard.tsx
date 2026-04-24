import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { Material } from '../api/types';

interface MaterialCardProps {
  material: Material;
  onPress: () => void;
}

export function MaterialCard({ material, onPress }: MaterialCardProps) {
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

  const getMaterialIcon = () => {
    switch (material.type) {
      case 'article':
        return '📝';
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'link':
        return '🔗';
      default:
        return '📎';
    }
  };

  const getTypeColor = () => {
    switch (material.type) {
      case 'article':
        return colors.info;
      case 'pdf':
        return colors.error;
      case 'image':
        return colors.secondary;
      case 'video':
        return colors.primary;
      case 'audio':
        return colors.warning;
      case 'link':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const typeColor = getTypeColor();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
        <Text style={styles.icon}>{getMaterialIcon()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {material.title}
          </Text>
          {material.isRead && (
            <View style={styles.readBadge}>
              <Text style={styles.readText}>✓</Text>
            </View>
          )}
        </View>

        {material.projectName && (
          <View style={styles.projectRow}>
            <View style={styles.projectTag}>
              <Text style={styles.projectText}>{material.projectName}</Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            {material.fileSize && (
              <Text style={styles.metaText}>{formatFileSize(material.fileSize)}</Text>
            )}
            {material.duration && (
              <Text style={styles.metaText}>{formatDuration(material.duration)}</Text>
            )}
            <Text style={styles.metaText}>
              {new Date(material.createdAt).toLocaleDateString('pl-PL', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>

          {material.isDownloaded && (
            <View style={styles.downloadedBadge}>
              <Text style={styles.downloadedText}>⬇</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  readBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  readText: {
    fontSize: typography.fontSize.xxs,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  projectRow: {
    marginBottom: spacing.xs,
  },
  projectTag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  projectText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  downloadedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});

export default MaterialCard;
