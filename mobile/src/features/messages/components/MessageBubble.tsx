import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { Message } from '../api/types';
import { AttachmentView } from './AttachmentView';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOwnMessage = message.senderRole === 'patient'; // Adjust based on current user

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {!isOwnMessage && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {message.senderName[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        <Text
          style={[
            styles.content,
            isOwnMessage ? styles.ownContent : styles.otherContent,
          ]}
        >
          {message.content}
        </Text>

        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment) => (
              <AttachmentView
                key={attachment.id}
                attachment={attachment}
                isOwn={isOwnMessage}
              />
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text
            style={[
              styles.time,
              isOwnMessage ? styles.ownTime : styles.otherTime,
            ]}
          >
            {new Date(message.createdAt).toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isOwnMessage && (
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  message.deliveryStatus === 'read' && styles.statusRead,
                ]}
              >
                {message.deliveryStatus === 'sent' && '✓'}
                {message.deliveryStatus === 'delivered' && '✓✓'}
                {message.deliveryStatus === 'read' && '✓✓'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  content: {
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
  ownContent: {
    color: colors.textInverse,
  },
  otherContent: {
    color: colors.text,
  },
  attachmentsContainer: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  time: {
    fontSize: typography.fontSize.xs,
  },
  ownTime: {
    color: colors.primaryLight,
  },
  otherTime: {
    color: colors.textLight,
  },
  statusContainer: {
    marginLeft: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  statusRead: {
    color: colors.primaryLight,
  },
});

export default MessageBubble;
