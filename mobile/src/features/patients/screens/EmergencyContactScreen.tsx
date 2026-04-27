import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetPatientQuery, useUpdatePatientMutation } from '@features/patients/api/patientApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';
import { AccessibleButton } from '@shared/components/AccessibleButton';

interface EmergencyContactScreenNavigationProps {
  goBack: () => void;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export function EmergencyContactScreen(): JSX.Element {
  const navigation = useNavigation<EmergencyContactScreenNavigationProps>();
  const patientId = 'current'; // Would come from auth context
  const { data: patient, isLoading } = useGetPatientQuery(patientId);
  const [updatePatient] = useUpdatePatientMutation();

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: patient?.emergencyContact?.name || '',
    phone: patient?.emergencyContact?.phone || '',
    relationship: patient?.emergencyContact?.relationship || '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    if (!emergencyContact.name || !emergencyContact.phone) {
      Alert.alert('Błąd', 'Wprowadź imię i nazwisko oraz numer telefonu');
      return;
    }

    try {
      await updatePatient({
        id: patientId,
        data: { emergencyContact },
      }).unwrap();
      Alert.alert('Sukces', 'Dane kontaktu awaryjnego zostały zapisane');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać danych');
    }
  };

  const handleCallEmergency = () => {
    if (emergencyContact.phone) {
      Linking.openURL(`tel:${emergencyContact.phone}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Emergency Call Button */}
      {emergencyContact.phone && (
        <View style={styles.emergencySection}>
          <AccessibleButton
            onPress={handleCallEmergency}
            label="Zadzwoń do kontaktu awaryjnego"
            icon="📞"
            variant="danger"
            size="large"
            style={styles.emergencyButton}
          />
        </View>
      )}

      {/* Info Card */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Kontakt awaryjny to osoba, która zostanie powiadomiona w sytuacji
            zagrożenia zdrowia lub życia.
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dane kontaktu awaryjnego</Text>
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Imię i nazwisko *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={emergencyContact.name}
              onChangeText={(text) =>
                setEmergencyContact({ ...emergencyContact, name: text })
              }
              placeholder="np. Jan Kowalski"
              placeholderTextColor={colors.textLight}
              editable={isEditing}
              accessibilityLabel="Imię i nazwisko kontaktu awaryjnego"
              accessibilityHint="Wprowadź imię i nazwisko osoby kontaktowej"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Numer telefonu *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={emergencyContact.phone}
              onChangeText={(text) =>
                setEmergencyContact({ ...emergencyContact, phone: text })
              }
              placeholder="np. +48 123 456 789"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              editable={isEditing}
              accessibilityLabel="Numer telefonu kontaktu awaryjnego"
              accessibilityHint="Wprowadź numer telefonu osoby kontaktowej"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Relacja</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={emergencyContact.relationship}
              onChangeText={(text) =>
                setEmergencyContact({ ...emergencyContact, relationship: text })
              }
              placeholder="np. Małżonek, Rodzic, Przyjaciel"
              placeholderTextColor={colors.textLight}
              editable={isEditing}
              accessibilityLabel="Relacja z kontaktem awaryjnym"
              accessibilityHint="Wprowadź relację z osobą kontaktową"
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <AccessibleButton
              onPress={handleSave}
              label="Zapisz"
              variant="primary"
              style={styles.actionButton}
            />
            <AccessibleButton
              onPress={() => {
                setIsEditing(false);
                // Reset to original values
                setEmergencyContact({
                  name: patient?.emergencyContact?.name || '',
                  phone: patient?.emergencyContact?.phone || '',
                  relationship: patient?.emergencyContact?.relationship || '',
                });
              }}
              label="Anuluj"
              variant="outline"
              style={styles.actionButton}
            />
          </>
        ) : (
          <AccessibleButton
            onPress={() => setIsEditing(true)}
            label={emergencyContact.name ? 'Edytuj' : 'Dodaj kontakt awaryjny'}
            variant="primary"
            style={styles.actionButton}
          />
        )}
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
  emergencySection: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  emergencyButton: {
    width: '100%',
  },
  section: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight + '30',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    minHeight: 50,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  footer: {
    height: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default EmergencyContactScreen;
