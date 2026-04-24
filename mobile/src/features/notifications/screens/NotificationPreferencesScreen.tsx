import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateQuietHoursMutation,
} from '../api/notificationApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { NotificationCategoryPreferences, QuietHours } from '../api/types';

interface NotificationPreferencesScreenNavigationProps {
  goBack: () => void;
}

export function NotificationPreferencesScreen(): JSX.Element {
  const navigation = useNavigation<NotificationPreferencesScreenNavigationProps>();
  const { data: settings, isLoading, isError } = useGetNotificationSettingsQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();
  const [updateQuietHours] = useUpdateQuietHoursMutation();

  const [localPreferences, setLocalPreferences] = useState<NotificationCategoryPreferences>(
    settings?.preferences.categories || {
      messages: true,
      calendarEvents: true,
      newMaterials: true,
      projectUpdates: true,
      reminders: true,
      systemAnnouncements: true,
    }
  );

  const [localQuietHours, setLocalQuietHours] = useState<QuietHours>(
    settings?.preferences.quietHours || {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
    }
  );

  const handleToggleCategory = async (
    category: keyof NotificationCategoryPreferences
  ) => {
    const newPreferences = {
      ...localPreferences,
      [category]: !localPreferences[category],
    };
    setLocalPreferences(newPreferences);

    try {
      await updatePreferences({
        ...settings?.preferences,
        categories: newPreferences,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleToggleQuietHours = async () => {
    const newQuietHours = {
      ...localQuietHours,
      enabled: !localQuietHours.enabled,
    };
    setLocalQuietHours(newQuietHours);

    try {
      await updateQuietHours({
        enabled: newQuietHours.enabled,
        startTime: newQuietHours.startTime,
        endTime: newQuietHours.endTime,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update quiet hours:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie ustawień...</Text>
      </View>
    );
  }

  if (isError) {
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Główne</Text>
        <View style={styles.infoCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Powiadomienia</Text>
              <Text style={styles.settingDescription}>
                Włącz lub wyłącz wszystkie powiadomienia
              </Text>
            </View>
            <Switch
              value={settings?.preferences.enabled}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.primary}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategorie powiadomień</Text>
        <View style={styles.infoCard}>
          <SettingToggle
            label="Wiadomości"
            description="Nowe wiadomości od zespołu medycznego"
            icon="💬"
            value={localPreferences.messages}
            onToggle={() => handleToggleCategory('messages')}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Wydarzenia z kalendarza"
            description="Przypomnienia o wizytach i sesjach"
            icon="📅"
            value={localPreferences.calendarEvents}
            onToggle={() => handleToggleCategory('calendarEvents')}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Nowe materiały"
            description="Nowe materiały edukacyjne"
            icon="📚"
            value={localPreferences.newMaterials}
            onToggle={() => handleToggleCategory('newMaterials')}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Aktualizacje projektu"
            description="Zmiany w projektach terapeutycznych"
            icon="📋"
            value={localPreferences.projectUpdates}
            onToggle={() => handleToggleCategory('projectUpdates')}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Przypomnienia"
            description="Przypomnienia o lekach i ćwiczeniach"
            icon="⏰"
            value={localPreferences.reminders}
            onToggle={() => handleToggleCategory('reminders')}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Ogłoszenia systemowe"
            description="Ważne informacje od administratorów"
            icon="📢"
            value={localPreferences.systemAnnouncements}
            onToggle={() => handleToggleCategory('systemAnnouncements')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Godziny ciszy</Text>
        <View style={styles.infoCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Włącz godziny ciszy</Text>
              <Text style={styles.settingDescription}>
                Wycisz powiadomienia w nocy
              </Text>
            </View>
            <Switch
              value={localQuietHours.enabled}
              onValueChange={handleToggleQuietHours}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.primary}
            />
          </View>

          {localQuietHours.enabled && (
            <View style={styles.quietHoursContainer}>
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>Od:</Text>
                  <Text style={styles.timeValue}>{localQuietHours.startTime}</Text>
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>Do:</Text>
                  <Text style={styles.timeValue}>{localQuietHours.endTime}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Licznik powiadomień</Text>
        <View style={styles.infoCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>🔔</Text>
            </View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeLabel}>Nieprzeczytane powiadomienia</Text>
              <Text style={styles.badgeCount}>{settings?.badgeCount || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
}

function SettingToggle({ label, description, icon, value, onToggle }: SettingToggleProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={colors.primary}
      />
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
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  quietHoursContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  timeField: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  badgeIconText: {
    fontSize: 24,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badgeCount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
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

export default NotificationPreferencesScreen;
