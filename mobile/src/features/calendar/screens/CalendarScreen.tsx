import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetCalendarEventsQuery } from '../api/calendarApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { CalendarDay } from '../components/CalendarDay';
import { EventCard } from '../components/EventCard';
import type { CalendarEvent } from '../api/types';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarScreenNavigationProps {
  navigate: (screen: string, params?: { eventId: string }) => void;
}

export function CalendarScreen(): JSX.Element {
  const navigation = useNavigation<CalendarScreenNavigationProps>();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: events, isLoading, isError } = useGetCalendarEventsQuery({
    startDate: getStartDate(viewMode, currentMonth).toISOString(),
    endDate: getEndDate(viewMode, currentMonth).toISOString(),
  });

  function getStartDate(viewMode: ViewMode, date: Date): Date {
    const d = new Date(date);
    if (viewMode === 'day') return d;
    if (viewMode === 'week') {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
    }
    if (viewMode === 'month') {
      d.setDate(1);
    }
    return d;
  }

  function getEndDate(viewMode: ViewMode, date: Date): Date {
    const d = new Date(date);
    if (viewMode === 'day') return d;
    if (viewMode === 'week') {
      const day = d.getDay();
      const diff = d.getDate() + (6 - day);
      d.setDate(diff);
    }
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
      d.setDate(0);
    }
    return d;
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    if (!events) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => event.startDate.startsWith(dateStr));
  };

  const selectedDateEvents = useMemo(
    () => getEventsForDate(selectedDate),
    [selectedDate, events]
  );

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendarDay = ({ item: date }: { item: Date }) => {
    const dayEvents = getEventsForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();

    return (
      <CalendarDay
        date={date}
        eventCount={dayEvents.length}
        isToday={isToday}
        isSelected={isSelected}
        onPress={() => handleDatePress(date)}
      />
    );
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie kalendarza...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Wystąpił błąd podczas ładowania</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* View mode selector */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'day' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('day')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'day' && styles.viewModeButtonTextActive,
            ]}
          >
            Dzień
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('week')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'week' && styles.viewModeButtonTextActive,
            ]}
          >
            Tydzień
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('month')}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'month' && styles.viewModeButtonTextActive,
            ]}
          >
            Miesiąc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleDateString('pl-PL', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar grid */}
      <FlatList
        data={getDaysInMonth()}
        renderItem={renderCalendarDay}
        keyExtractor={(item) => item.toISOString()}
        numColumns={7}
        contentContainerStyle={styles.calendarGrid}
      />

      {/* Selected date events */}
      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsDate}>
            {selectedDate.toLocaleDateString('pl-PL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          <Text style={styles.eventsCount}>{selectedDateEvents.length} wydarzeń</Text>
        </View>

        {selectedDateEvents.length > 0 ? (
          <FlatList
            data={selectedDateEvents}
            renderItem={({ item }) => (
              <EventCard event={item} onPress={() => handleEventPress(item.id)} />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>Brak wydarzeń</Text>
          </View>
        )}
      </View>
    </View>
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
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  viewModeButtonTextActive: {
    color: colors.textInverse,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: {
    fontSize: typography.fontSize.xxl,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  monthTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  calendarGrid: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  eventsDate: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  eventsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noEventsText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
  },
});

export default CalendarScreen;
