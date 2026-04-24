import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@app/theme';
import type { Attachment } from '../api/types';

interface AttachmentViewProps {
  attachment: Attachment;
  isOwn: boolean;
}

export function AttachmentView({ attachment, isOwn }: AttachmentViewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (attachment.mimeType.startsWith('image/')) return '🖼️';
    if (attachment.mimeType === 'application/pdf') return '📄';
    if (attachment.mimeType.startsWith('video/')) return '🎥';
    if (attachment.mimeType.startsWith('audio/')) return '🎵';
    return '📎';
  };

  const isImage = attachment.mimeType.startsWith('image/');

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      {isImage && attachment.thumbnailUrl ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: attachment.thumbnailUrl }} style={styles.thumbnail} />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageSize}>{formatFileSize(attachment.size)}</Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.fileContainer,
            isOwn ? styles.ownFileContainer : styles.otherFileContainer,
          ]}
        >
          <Text style={styles.fileIcon}>{getFileIcon()}</Text>
          <View style={styles.fileInfo}>
            <Text
              style={[
                styles.filename,
                isOwn ? styles.ownFilename : styles.otherFilename,
              ]}
              numberOfLines={1}
            >
              {attachment.filename}
            </Text>
            <Text
              style={[
                styles.fileSize,
                isOwn ? styles.ownFileSize : styles.otherFileSize,
              ]}
            >
              {formatFileSize(attachment.size)}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  imageSize: {
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 200,
  },
  ownFileContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherFileContainer: {
    backgroundColor: colors.backgroundSecondary,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  filename: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  ownFilename: {
    color: colors.textInverse,
  },
  otherFilename: {
    color: colors.text,
  },
  fileSize: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  ownFileSize: {
    color: colors.primaryLight,
  },
  otherFileSize: {
    color: colors.textSecondary,
  },
});

export default AttachmentView;
