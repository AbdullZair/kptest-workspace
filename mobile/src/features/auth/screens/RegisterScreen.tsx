import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRegisterMutation } from '@features/auth/api/authApi';
import { setCredentials } from '@features/auth/slices/authSlice';
import { useAppDispatch } from '@app/store';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';
import { AccessibleButton } from '@shared/components/AccessibleButton';

interface RegisterScreenNavigationProps {
  goBack: () => void;
}

export function RegisterScreen(): JSX.Element {
  const navigation = useNavigation<RegisterScreenNavigationProps>();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    pesel: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 10) {
      newErrors.password = 'Hasło musi mieć min. 10 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać wielkie i małe litery, cyfrę i znak specjalny';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne';
    }

    if (!formData.firstName) newErrors.firstName = 'Imię jest wymagane';
    if (!formData.lastName) newErrors.lastName = 'Nazwisko jest wymagane';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Musisz zaakceptować regulamin';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        pesel: formData.pesel,
        acceptTerms: true,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        })
      );
    } catch (error: any) {
      Alert.alert(
        'Błąd rejestracji',
        error?.data?.message || 'Nie udało się utworzyć konta'
      );
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Utwórz konto</Text>
          <Text style={styles.subtitle}>
            Wypełnij formularz aby się zarejestrować
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Imię *</Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                placeholder="Jan"
                placeholderTextColor={colors.textLight}
                accessibilityLabel="Imię"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nazwisko *</Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                placeholder="Kowalski"
                placeholderTextColor={colors.textLight}
                accessibilityLabel="Nazwisko"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="twoj@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Adres email"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="+48 123 456 789"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              accessibilityLabel="Numer telefonu"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PESEL</Text>
            <TextInput
              style={styles.input}
              value={formData.pesel}
              onChangeText={(text) => updateField('pesel', text)}
              placeholder="90010112345"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={11}
              accessibilityLabel="Numer PESEL"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hasło *</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="••••••••••••"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              accessibilityLabel="Hasło"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <Text style={styles.passwordHint}>
              Min. 10 znaków, wielkie i małe litery, cyfra i znak specjalny
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Potwierdź hasło *</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              placeholder="••••••••••••"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              accessibilityLabel="Potwierdź hasło"
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => updateField('acceptTerms', !formData.acceptTerms)}
              style={styles.termsCheckbox}
              accessibilityRole="checkbox"
              accessibilityLabel="Akceptuję regulamin"
              accessibilityState={{ checked: formData.acceptTerms }}
            >
              <View
                style={[
                  styles.checkbox,
                  formData.acceptTerms && styles.checkboxChecked,
                ]}
              >
                {formData.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                Akceptuję Regulamin i Politykę Prywatności *
              </Text>
            </TouchableOpacity>
            {errors.acceptTerms && (
              <Text style={styles.errorText}>{errors.acceptTerms}</Text>
            )}
          </View>

          <AccessibleButton
            onPress={handleRegister}
            label={isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
            variant="primary"
            size="large"
            style={styles.registerButton}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
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
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  passwordHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  termsContainer: {
    marginBottom: spacing.lg,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  termsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  registerButton: {
    marginTop: spacing.md,
  },
});

export default RegisterScreen;
