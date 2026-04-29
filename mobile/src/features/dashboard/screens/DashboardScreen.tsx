import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetCalendarEventsQuery } from '@features/calendar/api/calendarApi';
import { useGetNotificationSettingsQuery } from '@features/notifications/api/notificationApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';
import { AccessibleButton } from '@shared/components/AccessibleButton';

interface DashboardScreenNavigationProps {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

export function DashboardScreen(): JSX.Element {
  const navigation = useNavigation<DashboardScreenNavigationProps>();
  const { data: events } = useGetCalendarEventsQuery();
  const { data: notifications } = useGetNotificationSettingsQuery();

  const today = new Date();
  const todayEvents = events?.filter((event) => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  const upcomingEvents = todayEvents.slice(0, 3);
  const unreadCount = notifications?.badgeCount || 0;

  const quickActions = [
    { icon: '💬', label: 'Wiadomości', screen: 'MessagesTab', color: colors.primary },
    { icon: '📅', label: 'Kalendarz', screen: 'CalendarTab', color: colors.secondary },
    { icon: '📚', label: 'Materiały', screen: 'MaterialsTab', color: colors.warning },
    { icon: '📊', label: 'Statystyki', screen: 'ComplianceStats', color: colors.info },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {}}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Dzień dobry!</Text>
            <Text style={styles.date}>
              {today.toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel={ACCESSIBILITY_LABELS.NOTIFICATION_SETTINGS_BUTTON}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Szybki dostęp</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickActionCard, { borderLeftColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Today's Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dzisiejsze wydarzenia</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CalendarTab')}>
            <Text style={styles.seeAllText}>Zobacz wszystkie</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() =>
                navigation.navigate('CalendarTab', { screen: 'EventDetail', params: { eventId: event.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={event.title}
              accessibilityHint={`Godzina: ${new Date(event.startDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`}
            >
              <View
                style={[
                  styles.eventTypeIndicator,
                  { backgroundColor: getEventTypeColor(event.type) },
                ]}
              />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>
                  {new Date(event.startDate).toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {event.location && (
                  <Text style={styles.eventLocation}>📍 {event.location}</Text>
                )}
              </View>
              <Text style={styles.eventArrow}>›</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Brak wydarzeń na dziś</Text>
          </View>
        )}
      </View>

      {/* Health Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Porada dnia</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Regularność to klucz</Text>
            <Text style={styles.tipText}>
              Pamiętaj, że regularne przyjmowanie leków i wykonywanie ćwiczeń
              znacząco przyspiesza proces leczenia.
            </Text>
          </View>
        </View>
      </View>

      {/* Emergency Contact Quick Access */}
      <View style={styles.section}>
        <AccessibleButton
          onPress={() => navigation.navigate('EmergencyContact')}
          label="Kontakt awaryjny"
          icon="🚨"
          variant="danger"
          style={styles.emergencyButton}
        />
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

function getEventTypeColor(type: string): string {
  const colors_map: Record<string, string> = {
    appointment: colors.info,
    therapy_session: colors.primary,
    medication_reminder: colors.warning,
    exercise: colors.success,
    measurement: colors.secondary,
    other: colors.textSecondary,
  };
  return colors_map[type] || colors.textSecondary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  eventTypeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: spacing.md,
    minHeight: 50,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  eventLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  eventArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight + '30',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warningLight,
  },
  tipIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  emergencyButton: {
    width: '100%',
  },
  footer: {
    height: spacing.xxl,
  },
});

export default DashboardScreen;
