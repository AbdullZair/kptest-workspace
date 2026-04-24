import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useGetPatientQuery, useCreatePatientMutation, useUpdatePatientMutation } from '../api/patientApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';

interface PatientFormRouteParams {
  patientId?: string;
}

interface PatientFormNavigationProps {
  goBack: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  pesel: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export function PatientFormScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<PatientFormNavigationProps>();
  const { patientId } = (route.params as PatientFormRouteParams) || {};
  const isEditMode = !!patientId;

  const { data: existingPatient, isLoading: isLoadingPatient } = useGetPatientQuery(
    patientId!,
    { skip: !patientId }
  );
  const [createPatient] = useCreatePatientMutation();
  const [updatePatient] = useUpdatePatientMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      pesel: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    },
  });

  useEffect(() => {
    if (existingPatient) {
      reset({
        firstName: existingPatient.firstName,
        lastName: existingPatient.lastName,
        pesel: existingPatient.pesel,
        dateOfBirth: existingPatient.dateOfBirth,
        email: existingPatient.email,
        phone: existingPatient.phone,
        street: existingPatient.address.street,
        city: existingPatient.address.city,
        postalCode: existingPatient.address.postalCode,
        country: existingPatient.address.country,
        emergencyContactName: existingPatient.emergencyContact?.name || '',
        emergencyContactPhone: existingPatient.emergencyContact?.phone || '',
        emergencyContactRelationship:
          existingPatient.emergencyContact?.relationship || '',
      });
    }
  }, [existingPatient, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const patientData = {
        firstName: data.firstName,
        lastName: data.lastName,
        pesel: data.pesel,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
        },
        emergencyContact:
          data.emergencyContactName &&
          data.emergencyContactPhone &&
          data.emergencyContactRelationship
            ? {
                name: data.emergencyContactName,
                phone: data.emergencyContactPhone,
                relationship: data.emergencyContactRelationship,
              }
            : undefined,
      };

      if (isEditMode && patientId) {
        await updatePatient({ id: patientId, data: patientData }).unwrap();
      } else {
        await createPatient(patientData).unwrap();
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save patient:', error);
    }
  };

  if (isLoadingPatient) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie danych pacjenta...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dane osobowe</Text>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.label}>Imię</Text>
              <Controller
                control={control}
                name="firstName"
                rules={{ required: 'Imię jest wymagane' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Wprowadź imię"
                    placeholderTextColor={colors.textLight}
                  />
                )}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Nazwisko</Text>
              <Controller
                control={control}
                name="lastName"
                rules={{ required: 'Nazwisko jest wymagane' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Wprowadź nazwisko"
                    placeholderTextColor={colors.textLight}
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.label}>PESEL</Text>
              <Controller
                control={control}
                name="pesel"
                rules={{
                  required: 'PESEL jest wymagany',
                  pattern: {
                    value: /^\d{11}$/,
                    message: 'PESEL musi zawierać 11 cyfr',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.pesel && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Wprowadź PESEL"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    maxLength={11}
                  />
                )}
              />
              {errors.pesel && (
                <Text style={styles.errorText}>{errors.pesel.message}</Text>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Data urodzenia</Text>
              <Controller
                control={control}
                name="dateOfBirth"
                rules={{ required: 'Data urodzenia jest wymagana' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.dateOfBirth && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="RRRR-MM-DD"
                    placeholderTextColor={colors.textLight}
                  />
                )}
              />
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>
                  {errors.dateOfBirth.message}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dane kontaktowe</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email jest wymagany',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Nieprawidłowy format email',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Wprowadź email"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Telefon</Text>
            <Controller
              control={control}
              name="phone"
              rules={{ required: 'Telefon jest wymagany' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Wprowadź numer telefonu"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adres</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Ulica</Text>
            <Controller
              control={control}
              name="street"
              rules={{ required: 'Ulica jest wymagana' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.street && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Wprowadź ulicę"
                  placeholderTextColor={colors.textLight}
                />
              )}
            />
            {errors.street && (
              <Text style={styles.errorText}>{errors.street.message}</Text>
            )}
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.label}>Kod pocztowy</Text>
              <Controller
                control={control}
                name="postalCode"
                rules={{ required: 'Kod pocztowy jest wymagany' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.postalCode && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="XX-XXX"
                    placeholderTextColor={colors.textLight}
                  />
                )}
              />
              {errors.postalCode && (
                <Text style={styles.errorText}>{errors.postalCode.message}</Text>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Miasto</Text>
              <Controller
                control={control}
                name="city"
                rules={{ required: 'Miasto jest wymagane' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Wprowadź miasto"
                    placeholderTextColor={colors.textLight}
                  />
                )}
              />
              {errors.city && (
                <Text style={styles.errorText}>{errors.city.message}</Text>
              )}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Kraj</Text>
            <Controller
              control={control}
              name="country"
              rules={{ required: 'Kraj jest wymagany' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.country && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Wprowadź kraj"
                  placeholderTextColor={colors.textLight}
                />
              )}
            />
            {errors.country && (
              <Text style={styles.errorText}>{errors.country.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontakt awaryjny (opcjonalne)</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Imię i nazwisko</Text>
            <Controller
              control={control}
              name="emergencyContactName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Wprowadź imię i nazwisko"
                  placeholderTextColor={colors.textLight}
                />
              )}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Telefon</Text>
            <Controller
              control={control}
              name="emergencyContactPhone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Wprowadź numer telefonu"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Relacja</Text>
            <Controller
              control={control}
              name="emergencyContactRelationship"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="np. małżonek, rodzic, dziecko"
                  placeholderTextColor={colors.textLight}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Anuluj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Zapisz zmiany' : 'Dodaj pacjenta'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formField: {
    flex: 1,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  footer: {
    height: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default PatientFormScreen;
