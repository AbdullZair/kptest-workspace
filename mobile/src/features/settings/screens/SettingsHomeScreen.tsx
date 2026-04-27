import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { useLogoutMutation } from '@features/auth/api/authApi';
import { logout } from '@features/auth/slices/authSlice';
import { useAppDispatch } from '@app/store';
import { unregisterPushAsync } from '@features/notifications/services/pushRegistration';

interface SettingsHomeScreenNavigationProps {
  navigate: (screen: string) => void;
}

export function SettingsHomeScreen(): JSX.Element {
  const navigation = useNavigation<SettingsHomeScreenNavigationProps>();
  const dispatch = useAppDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    Alert.alert(
      'Wyloguj się',
      'Czy na pewno chcesz się wylogować?',
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: async () => {
            try {
              // Unregister push notifications
              await unregisterPushAsync();
              // Call logout API
              await logoutApi().unwrap();
              // Clear local state
              dispatch(logout());
            } catch (error) {
              console.error('Logout error:', error);
              // Still clear local state even if API call fails
              dispatch(logout());
            }
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      icon: '🔔',
      title: 'Powiadomienia',
      description: 'Zarządzaj powiadomieniami',
      screen: 'NotificationPreferences',
    },
    {
      icon: '📡',
      title: 'Tryb offline',
      description: 'Zarządzaj danymi offline',
      screen: 'OfflineMode',
    },
    {
      icon: '🔐',
      title: 'Bezpieczeństwo',
      description: 'Hasło, 2FA, biometria',
      screen: 'Security',
    },
    {
      icon: '🔑',
      title: 'Zmień hasło',
      description: 'Zmień swoje hasło',
      screen: 'ChangePassword',
    },
    {
      icon: '🌙',
      title: 'Wygląd',
      description: 'Motyw, rozmiar czcionki',
      screen: 'Appearance',
    },
    {
      icon: '📊',
      title: 'Statystyki compliance',
      description: 'Twoje postępy w terapii',
      screen: 'ComplianceStats',
    },
    {
      icon: '📞',
      title: 'Kontakt awaryjny',
      description: 'Dane kontaktu awaryjnego',
      screen: 'EmergencyContact',
    },
    {
      icon: 'ℹ️',
      title: 'O aplikacji',
      description: 'Wersja, regulaminy',
      screen: 'About',
    },
    {
      icon: '🚪',
      title: 'Wyloguj się',
      description: 'Wyloguj z konta',
      screen: 'Logout',
      isDestructive: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ustawienia</Text>
        <View style={styles.settingsList}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.settingItem,
                item.isDestructive && styles.destructiveItem,
              ]}
              onPress={() => {
                if (item.screen === 'Logout') {
                  handleLogout();
                } else {
                  navigation.navigate(item.screen);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityHint={item.description}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <View style={styles.settingInfo}>
                  <Text
                    style={[
                      styles.settingTitle,
                      item.isDestructive && styles.destructiveText,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Wersja 1.0.0</Text>
        <Text style={styles.copyright}>© 2026 KPTEST</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  settingsList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  destructiveItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },
  destructiveText: {
    color: colors.error,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  version: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  copyright: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});

export default SettingsHomeScreen;
