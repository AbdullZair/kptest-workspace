import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@app/theme';
import type { EventReminder } from '../api/types';

interface ReminderPickerProps {
  reminder: EventReminder;
  onUpdate: (updates: Partial<EventReminder>) => void;
  onRemove: () => void;
}

const REMINDER_TYPES = [
  { value: 'push' as const, label: 'Push', icon: '📱' },
  { value: 'email' as const, label: 'Email', icon: '📧' },
  { value: 'sms' as const, label: 'SMS', icon: '💬' },
];

const TIME_OFFSETS = [
  { value: 0, label: 'W momencie' },
  { value: 30, label: '30 min przed' },
  { value: 60, label: '1 godz. przed' },
  { value: 120, label: '2 godz. przed' },
  { value: 1440, label: '1 dzień przed' },
  { value: 2880, label: '2 dni przed' },
];

export function ReminderPicker({
  reminder,
  onUpdate,
  onRemove,
}: ReminderPickerProps) {
  const handleTypeChange = (type: EventReminder['type']) => {
    onUpdate({ type });
  };

  const handleToggle = (enabled: boolean) => {
    // For future use if we want to enable/disable reminders
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {REMINDER_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                reminder.type === type.value && styles.typeButtonActive,
              ]}
              onPress={() => handleTypeChange(type.value)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  reminder.type === type.value && styles.typeLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeIcon}>🔔</Text>
        <Text style={styles.timeText}>{formatTime(reminder.time)}</Text>
        {reminder.isTriggered && (
          <View style={styles.triggeredBadge}>
            <Text style={styles.triggeredText}>Wysłano</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  typeIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  typeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  typeLabelActive: {
    color: colors.primary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    lineHeight: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeIcon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  triggeredBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  triggeredText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
});

export default ReminderPicker;
