import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@app/theme';

interface CalendarDayProps {
  date: Date;
  eventCount: number;
  isToday: boolean;
  isSelected: boolean;
  onPress: () => void;
}

export function CalendarDay({
  date,
  eventCount,
  isToday,
  isSelected,
  onPress,
}: CalendarDayProps) {
  const dayNumber = date.getDate();
  const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isToday && styles.todayContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dayName,
          isSelected && styles.selectedDayName,
          isToday && styles.todayDayName,
        ]}
      >
        {dayName}
      </Text>

      <View
        style={[
          styles.dayNumberContainer,
          isSelected && styles.selectedDayNumberContainer,
          isToday && styles.todayDayNumberContainer,
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.selectedDayNumber,
            isToday && styles.todayDayNumber,
          ]}
        >
          {dayNumber}
        </Text>
      </View>

      {eventCount > 0 && (
        <View style={styles.eventsIndicator}>
          {eventCount > 3 ? (
            <View style={styles.eventsCountBadge}>
              <Text style={styles.eventsCountText}>{eventCount}</Text>
            </View>
          ) : (
            <View style={styles.eventsDots}>
              {[...Array(Math.min(eventCount, 3))].map((_, i) => (
                <View key={i} style={styles.eventDot} />
              ))}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
  },
  todayContainer: {
    backgroundColor: colors.primaryLight + '30',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  selectedDayName: {
    color: colors.primaryLight,
  },
  todayDayName: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  selectedDayNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  todayDayNumberContainer: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  selectedDayNumber: {
    color: colors.textInverse,
  },
  todayDayNumber: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.bold,
  },
  eventsIndicator: {
    marginTop: spacing.xs,
  },
  eventsDots: {
    flexDirection: 'row',
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  eventsCountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  eventsCountText: {
    fontSize: typography.fontSize.xxs,
    color: colors.textInverse,
    fontWeight: typography.fontWeight.bold,
  },
});

export default CalendarDay;
