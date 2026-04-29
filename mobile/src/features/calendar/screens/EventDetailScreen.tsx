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
  useGetCalendarEventQuery,
  useCompleteCalendarEventMutation,
  useDeleteCalendarEventMutation,
} from '../api/calendarApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';

interface EventDetailRouteParams {
  eventId: string;
}

interface EventDetailNavigationProps {
  goBack: () => void;
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

export function EventDetailScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<EventDetailNavigationProps>();
  const { eventId } = route.params as EventDetailRouteParams;
  const { data: event, isLoading, isError } = useGetCalendarEventQuery(eventId);
  const [completeEvent] = useCompleteCalendarEventMutation();
  const [deleteEvent] = useDeleteCalendarEventMutation();

  const handleEditPress = () => {
    navigation.navigate('EventForm', { eventId });
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Usuń wydarzenie',
      'Czy na pewno chcesz usunąć to wydarzenie?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(eventId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCompletePress = async () => {
    try {
      await completeEvent({ id: eventId }).unwrap();
    } catch (error) {
      console.error('Failed to complete event:', error);
    }
  };

  const handleLocationPress = () => {
    if (event?.location) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(event.location)}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie wydarzenia...</Text>
      </View>
    );
  }

  if (isError || !event) {
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appointment: 'Wizyta kontrolna',
      therapy_session: 'Sesja terapeutyczna',
      medication_reminder: 'Przypomnienie o leku',
      exercise: 'Ćwiczenie',
      measurement: 'Pomiar parametrów',
      other: 'Inne',
    };
    return labels[type] || type;
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getEventTypeColor(event.type) + '20' },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              { color: getEventTypeColor(event.type) },
            ]}
          >
            {getEventTypeLabel(event.type)}
          </Text>
        </View>

        {event.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Wykonane</Text>
          </View>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{event.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kiedy</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
          </View>
          {!event.allDay && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Godzina:</Text>
                <Text style={styles.infoValue}>
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Czas trwania:</Text>
                <Text style={styles.infoValue}>
                  {Math.round(
                    (new Date(event.endDate).getTime() -
                      new Date(event.startDate).getTime()) /
                      (1000 * 60)
                  )}{' '}
                  min
                </Text>
              </View>
            </>
          )}
          {event.allDay && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Całodniowe:</Text>
              <Text style={styles.infoValue}>Tak</Text>
            </View>
          )}
        </View>
      </View>

      {event.location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lokalizacja</Text>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{event.location}</Text>
            </View>
            <Text style={styles.openMapsText}>Otwórz w mapach</Text>
          </TouchableOpacity>
        </View>
      )}

      {event.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opis</Text>
          <View style={styles.infoCard}>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      )}

      {event.projectName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projekt</Text>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() =>
              navigation.navigate('ProjectDetail', { projectId: event.projectId })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.projectName}>{event.projectName}</Text>
          </TouchableOpacity>
        </View>
      )}

      {event.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notatki</Text>
          <View style={styles.infoCard}>
            <Text style={styles.notes}>{event.notes}</Text>
          </View>
        </View>
      )}

      {event.reminders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Przypomnienia</Text>
          <View style={styles.infoCard}>
            {event.reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <Text style={styles.reminderIcon}>🔔</Text>
                <Text style={styles.reminderText}>
                  {new Date(reminder.time).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {reminder.isTriggered && (
                  <Text style={styles.reminderTriggered}>✓</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {!event.isCompleted && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompletePress}
          >
            <Text style={styles.completeButtonText}>Oznacz jako wykonane</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[styles.footerButton, styles.editButton]}
          onPress={handleEditPress}
        >
          <Text style={styles.editButtonText}>Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.deleteButton]}
          onPress={handleDeletePress}
        >
          <Text style={styles.deleteButtonText}>Usuń</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  completedBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  completedText: {
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
    fontSize: typography.fontSize.xxl,
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
  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    width: 120,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.sm,
  },
  locationText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  openMapsText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  projectName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  notes: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reminderIcon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  reminderText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
    textTransform: 'capitalize',
  },
  reminderTriggered: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  actions: {
    padding: spacing.lg,
  },
  actionButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  footerActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  editButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
  },
  deleteButtonText: {
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

export default EventDetailScreen;
