import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '@app/theme';
import { AccessibleButton } from '@shared/components/AccessibleButton';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';

interface ProposeEventChangeScreenNavigationProps {
  goBack: () => void;
}

interface ProposeEventChangeScreenRouteParams {
  eventId: string;
  eventTitle: string;
  eventDate: string;
}

export function ProposeEventChangeScreen(): JSX.Element {
  const navigation = useNavigation<ProposeEventChangeScreenNavigationProps>();
  const route = useRoute<any>();
  const { eventId, eventTitle, eventDate } = route.params || {};

  const [proposedDate, setProposedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setProposedDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!proposedDate) {
      Alert.alert('Błąd', 'Wybierz proponowany termin');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Błąd', 'Podaj powód zmiany terminu');
      return;
    }

    // Validate minimum 24 hours notice
    const now = new Date();
    const hoursUntilProposed = (proposedDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilProposed < 24) {
      Alert.alert(
        'Błąd',
        'Proponowany termin musi być co najmniej 24 godziny od teraz'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call API to submit change request
      // await submitChangeRequest({
      //   eventId,
      //   proposedDate: proposedDate.toISOString(),
      //   reason: reason.trim(),
      // });

      Alert.alert(
        'Wysłano',
        'Twoja prośba o zmianę terminu została wysłana do rozpatrzenia.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Błąd',
        error?.message || 'Nie udało się wysłać prośby. Spróbuj ponownie.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.title}>Zmień Termin</Text>
        <Text style={styles.subtitle}>
          Zaproponuj nowy termin dla wydarzenia
        </Text>
      </View>

      {/* Event Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Wydarzenie</Text>
        <Text style={styles.eventTitle}>{eventTitle || 'Brak tytułu'}</Text>
        
        <Text style={styles.cardLabel}>Obecny termin</Text>
        <Text style={styles.currentDate}>
          {eventDate ? formatDate(new Date(eventDate)) : 'Nieznany'}
        </Text>
      </View>

      {/* Important Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Ważne informacje</Text>
          <Text style={styles.infoText}>
            • Możesz zmienić termin maksymalnie 3 razy{'\n'}
            • Nowy termin musi być co najmniej 24 godziny od teraz{'\n'}
            • Personel rozpatrzy Twoją prośbę najszybciej jak to możliwe
          </Text>
        </View>
      </View>

      {/* Date Picker Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proponowany termin *</Text>
        
        <AccessibleButton
          onPress={() => setShowDatePicker(true)}
          label={proposedDate ? formatDate(proposedDate) : 'Wybierz datę i godzinę'}
          variant={proposedDate ? 'primary' : 'outline'}
          size="large"
          style={styles.dateButton}
          icon="📆"
        />

        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={proposedDate || new Date()}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={minDate}
              textColor={colors.text}
              style={styles.datePicker}
            />
          </View>
        )}

        {proposedDate && (
          <View style={styles.selectedDateCard}>
            <Text style={styles.selectedDateLabel}>Wybrano:</Text>
            <Text style={styles.selectedDateValue}>{formatDate(proposedDate)}</Text>
          </View>
        )}
      </View>

      {/* Reason Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Powód zmiany *</Text>
        <TextInput
          style={styles.reasonInput}
          value={reason}
          onChangeText={setReason}
          placeholder="Opisz dlaczego potrzebujesz zmienić termin..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Powód zmiany terminu"
          accessibilityHint="Wprowadź powód swojej prośby o zmianę terminu"
        />
        <Text style={styles.charCount}>
          {reason.length} znaków
        </Text>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <AccessibleButton
          onPress={handleSubmit}
          label={isSubmitting ? 'Wysyłanie...' : 'Wyślij prośbę'}
          variant="primary"
          size="large"
          fullWidth
          disabled={isSubmitting}
          testID={ACCESSIBILITY_LABELS.CONFIRM_BUTTON}
        />
        
        <AccessibleButton
          onPress={handleBack}
          label="Anuluj"
          variant="outline"
          size="large"
          fullWidth
          disabled={isSubmitting}
          style={styles.cancelButton}
        />
      </View>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  currentDate: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight + '30',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.info,
  },
  infoIcon: {
    fontSize: typography.fontSize.xxl,
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dateButton: {
    marginBottom: spacing.sm,
  },
  datePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePicker: {
    width: '100%',
  },
  selectedDateCard: {
    backgroundColor: colors.successLight + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDateLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  selectedDateValue: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  reasonInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProposeEventChangeScreen;
