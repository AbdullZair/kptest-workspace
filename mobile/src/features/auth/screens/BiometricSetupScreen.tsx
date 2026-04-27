import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBiometricAuth } from '@features/auth/hooks/useBiometricAuth';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { AccessibleButton } from '@shared/components/AccessibleButton';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';

interface BiometricSetupScreenNavigationProps {
  goBack: () => void;
}

interface BiometricSetupScreenRouteParams {
  onEnable?: (enabled: boolean) => void;
}

export function BiometricSetupScreen(): JSX.Element {
  const navigation = useNavigation<BiometricSetupScreenNavigationProps>();
  const route = useRoute<any>();
  const onEnableCallback = route.params?.onEnable;

  const {
    biometricState,
    isLoading,
    error,
    enableBiometric,
    disableBiometric,
    authenticate,
    getBiometricTypeName,
    refreshState,
  } = useBiometricAuth();

  const [isToggling, setIsToggling] = useState(false);

  const handleToggleBiometric = async () => {
    if (isToggling || isLoading) return;

    setIsToggling(true);

    try {
      if (biometricState.isEnabled) {
        await disableBiometric();
        Alert.alert(
          'Wyłączono logowanie biometryczne',
          'Logowanie biometryczne zostało wyłączone.'
        );
        onEnableCallback?.(false);
      } else {
        const success = await enableBiometric();
        if (success) {
          Alert.alert(
            'Włączono logowanie biometryczne',
            `Możesz teraz używać ${getBiometricTypeName()} do szybkiego logowania.`,
            [{ text: 'OK' }]
          );
          onEnableCallback?.(true);
        } else {
          Alert.alert(
            'Błąd',
            'Nie udało się włączyć logowania biometrycznego.'
          );
        }
      }
    } catch (err: any) {
      Alert.alert('Błąd', err.message || 'Wystąpił nieoczekiwany błąd');
    } finally {
      setIsToggling(false);
    }
  };

  const handleTestBiometric = async () => {
    if (!biometricState.isEnabled) {
      Alert.alert(
        'Logowanie wyłączone',
        'Najpierw włącz logowanie biometryczne w ustawieniach.'
      );
      return;
    }

    const success = await authenticate('Test logowania biometrycznego');
    if (success) {
      Alert.alert(
        'Sukces!',
        'Logowanie biometryczne działa poprawnie.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Niepowodzenie',
        error || 'Nie udało się zalogować biometrycznie.'
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Sprawdzanie dostępności...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Logowanie Biometryczne</Text>
        <Text style={styles.subtitle}>
          Szybkie i bezpieczne logowanie za pomocą {getBiometricTypeName()}
        </Text>
      </View>

      {/* Availability Info */}
      {!biometricState.isAvailable && (
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Biometria niedostępna</Text>
          <Text style={styles.warningText}>
            Twoje urządzenie nie obsługuje logowania biometrycznego lub nie jest ono skonfigurowane.
          </Text>
        </View>
      )}

      {!biometricState.isEnrolled && biometricState.isAvailable && (
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoTitle}>Brak zapisanych danych biometrycznych</Text>
          <Text style={styles.infoText}>
            Dodaj odcisk palca lub skan twarzy w ustawieniach urządzenia, aby używać tej funkcji.
          </Text>
        </View>
      )}

      {/* Main Card */}
      {biometricState.isAvailable && biometricState.isEnrolled && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>
                {biometricState.biometricType === LocalAuthentication.AuthenticationType.FACE ? '👤' : '👆'}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{getBiometricTypeName()}</Text>
              <Text style={styles.cardDescription}>
                {biometricState.isEnabled ? 'Włączone' : 'Wyłączone'}
              </Text>
            </View>
            <Switch
              value={biometricState.isEnabled}
              onValueChange={handleToggleBiometric}
              disabled={isToggling}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={biometricState.isEnabled ? colors.primary : colors.textLight}
              accessibilityLabel="Przełącz logowanie biometryczne"
              accessibilityHint="Włącz lub wyłącz logowanie biometryczne"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Szybkie logowanie jednym dotknięciem</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Bezpieczne przechowywanie klucza</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Możliwość powrotu do hasła</Text>
            </View>
          </View>
        </View>
      )}

      {/* Test Button */}
      {biometricState.isEnabled && (
        <View style={styles.testSection}>
          <AccessibleButton
            onPress={handleTestBiometric}
            label="Przetestuj logowanie"
            variant="secondary"
            size="medium"
            style={styles.testButton}
          />
        </View>
      )}

      {/* Security Info */}
      <View style={styles.securityCard}>
        <Text style={styles.securityTitle}>🔒 Bezpieczeństwo</Text>
        <Text style={styles.securityText}>
          Twoje dane biometryczne są przechowywane wyłącznie na Twoim urządzeniu.
          Nigdy nie są przesyłane ani zapisywane na serwerach KPTEST.
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Back Button */}
      <View style={styles.footer}>
        <AccessibleButton
          onPress={handleBack}
          label="Wróć"
          variant="outline"
          size="large"
          style={styles.backButton}
          testID={ACCESSIBILITY_LABELS.BACK_BUTTON}
        />
      </View>
    </ScrollView>
  );
}

// Import LocalAuthentication for type checking
import * as LocalAuthentication from 'expo-local-authentication';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: colors.warningLight + '20',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.infoLight + '20',
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.info,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  featureList: {
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureBullet: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
    width: 20,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  testSection: {
    marginBottom: spacing.lg,
  },
  testButton: {
    width: '100%',
  },
  securityCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  securityTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  securityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  footer: {
    marginTop: spacing.md,
  },
  backButton: {
    width: '100%',
  },
});

export default BiometricSetupScreen;
