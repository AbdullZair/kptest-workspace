import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimpleCard } from '@shared/components/SimpleCard';
import { SimpleButton } from '@shared/components/SimpleButton';
import { simpleColors, simpleSpacing, simpleTypography, simpleBorderRadius } from '@app/theme/SimpleTheme';

const SIMPLE_MODE_KEY = '@kptest:simple_mode_enabled';

interface SimpleUIModeScreenNavigationProps {
  goBack: () => void;
}

export function SimpleUIModeScreen(): JSX.Element {
  const navigation = useNavigation<SimpleUIModeScreenNavigationProps>();
  const [isSimpleModeEnabled, setIsSimpleModeEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSimpleMode = async (value: boolean) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await AsyncStorage.setItem(SIMPLE_MODE_KEY, value.toString());
      setIsSimpleModeEnabled(value);

      Alert.alert(
        value ? 'Włączono tryb uproszczony' : 'Wyłączono tryb uproszczony',
        value
          ? 'Interfejs został dostosowany dla lepszej dostępności.'
          : 'Przywrócono standardowy interfejs.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać ustawień.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>👁️</Text>
        <Text style={styles.title}>Tryb Uproszczony</Text>
        <Text style={styles.subtitle}>
          Dostosuj interfejs dla lepszej dostępności
        </Text>
      </View>

      {/* Main Toggle Card */}
      <SimpleCard
        title="Włącz tryb uproszczony"
        description="Zwiększone elementy, wyższy kontrast i prostszy interfejs"
        icon="📱"
        variant="highlight"
        style={styles.mainCard}
      >
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {isSimpleModeEnabled ? 'WŁĄCZONE' : 'WYŁĄCZONE'}
          </Text>
          <Switch
            value={isSimpleModeEnabled}
            onValueChange={handleToggleSimpleMode}
            disabled={isSaving}
            trackColor={{ false: simpleColors.border, true: simpleColors.primary }}
            thumbColor={isSimpleModeEnabled ? simpleColors.primary : simpleColors.textLight}
            accessibilityLabel="Przełącz tryb uproszczony"
            accessibilityHint="Włącz lub wyłącz tryb uproszczony"
            style={styles.switch}
          />
        </View>
      </SimpleCard>

      {/* Features Card */}
      <SimpleCard
        title="Co zmienia tryb uproszczony?"
        icon="✨"
        variant="info"
      >
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>📏</Text>
            <Text style={styles.featureText}>
              Większe czcionki (125% większe)
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>👆</Text>
            <Text style={styles.featureText}>
              Większe przyciski (min. 48x48 pikseli)
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>🎨</Text>
            <Text style={styles.featureText}>
              Wysoki kontrast kolorów
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>🏠</Text>
            <Text style={styles.featureText}>
              Uproszczona nawigacja (3 główne kafelki)
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>💬</Text>
            <Text style={styles.featureText}>
              Prostszy język interfejsu
            </Text>
          </View>
        </View>
      </SimpleCard>

      {/* Who Should Use Card */}
      <SimpleCard
        title="Dla kogo jest ten tryb?"
        icon="👥"
        variant="default"
      >
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>✓</Text>
            <Text style={styles.featureText}>
              Osoby ze słabszym wzrokiem
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>✓</Text>
            <Text style={styles.featureText}>
              Osoby starsze
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>✓</Text>
            <Text style={styles.featureText}>
              Osoby z trudnościami motorycznymi
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>✓</Text>
            <Text style={styles.featureText}>
              Każdy, kto preferuje większe elementy UI
            </Text>
          </View>
        </View>
      </SimpleCard>

      {/* Preview Card */}
      <SimpleCard
        title="Przykład"
        icon="👀"
        variant="default"
      >
        <View style={styles.previewContainer}>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Standardowy:</Text>
            <View style={styles.previewButtonStandard}>
              <Text style={styles.previewButtonTextStandard}>Przycisk</Text>
            </View>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Uproszczony:</Text>
            <View style={styles.previewButtonSimple}>
              <Text style={styles.previewButtonTextSimple}>Przycisk</Text>
            </View>
          </View>
        </View>
      </SimpleCard>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Tryb uproszczony można włączyć lub wyłączyć w dowolnym momencie.
          Zmiany zostaną zastosowane natychmiast po przełączeniu.
        </Text>
      </View>

      {/* Back Button */}
      <View style={styles.footer}>
        <SimpleButton
          onPress={handleBack}
          label="Wróć"
          variant="outline"
          size="large"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: simpleColors.background,
  },
  scrollContent: {
    padding: simpleSpacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: simpleSpacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: simpleSpacing.md,
  },
  title: {
    fontSize: simpleTypography.fontSize.xxxl,
    fontWeight: simpleTypography.fontWeight.bold,
    color: simpleColors.text,
    marginBottom: simpleSpacing.sm,
  },
  subtitle: {
    fontSize: simpleTypography.fontSize.lg,
    color: simpleColors.textSecondary,
    textAlign: 'center',
  },
  mainCard: {
    marginBottom: simpleSpacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: simpleSpacing.md,
    paddingTop: simpleSpacing.md,
    borderTopWidth: 2,
    borderTopColor: simpleColors.border,
  },
  toggleLabel: {
    fontSize: simpleTypography.fontSize.lg,
    fontWeight: simpleTypography.fontWeight.bold,
    color: simpleColors.text,
  },
  switch: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
  featureList: {
    marginTop: simpleSpacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: simpleSpacing.md,
  },
  featureBullet: {
    fontSize: simpleTypography.fontSize.xl,
    marginRight: simpleSpacing.md,
    width: 32,
  },
  featureText: {
    flex: 1,
    fontSize: simpleTypography.fontSize.md,
    color: simpleColors.text,
    lineHeight: 28,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: simpleColors.infoLight + '30',
    borderRadius: simpleBorderRadius.lg,
    padding: simpleSpacing.lg,
    marginBottom: simpleSpacing.lg,
    borderWidth: 2,
    borderColor: simpleColors.info,
  },
  infoIcon: {
    fontSize: simpleTypography.fontSize.xxl,
    marginRight: simpleSpacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: simpleTypography.fontSize.md,
    color: simpleColors.text,
    lineHeight: 28,
  },
  previewContainer: {
    marginTop: simpleSpacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: simpleSpacing.md,
  },
  previewLabel: {
    fontSize: simpleTypography.fontSize.md,
    color: simpleColors.textSecondary,
    width: 120,
  },
  previewButtonStandard: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  previewButtonTextStandard: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewButtonSimple: {
    backgroundColor: simpleColors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: simpleBorderRadius.lg,
    borderWidth: 2,
    borderColor: simpleColors.primary,
    minWidth: 140,
    alignItems: 'center',
  },
  previewButtonTextSimple: {
    color: simpleColors.textInverse,
    fontSize: simpleTypography.fontSize.xl,
    fontWeight: simpleTypography.fontWeight.bold,
  },
  footer: {
    marginTop: simpleSpacing.md,
  },
});

export default SimpleUIModeScreen;
