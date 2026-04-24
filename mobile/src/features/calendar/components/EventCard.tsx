import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { CalendarEvent } from '../api/types';

interface EventCardProps {
  event: CalendarEvent;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors_map: Record<string, string> = {
      appointment: colors.info,
      therapy_session: colors.primary,
      medication_reminder: colors.warning,
      exercise: colors.success,
      measurement: colors.secondary,
      other: colors.textSecondary,
    };
    return colors_map[type] || colors.textSecondary;
  };

  const eventColor = getEventTypeColor(event.type);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.timeIndicator, { backgroundColor: eventColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          {event.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeIcon}>🕐</Text>
          {!event.allDay ? (
            <Text style={styles.timeText}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          ) : (
            <Text style={styles.timeText}>Całodniowe</Text>
          )}
        </View>

        {event.location && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}

        {event.projectName && (
          <View style={styles.projectRow}>
            <View style={styles.projectTag}>
              <Text style={styles.projectText}>{event.projectName}</Text>
            </View>
          </View>
        )}
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
    borderLeftWidth: 4,
  },
  timeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  completedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timeIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  projectRow: {
    marginTop: spacing.xs,
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
});

export default EventCard;
