import React from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePasswordMutation } from '@features/auth/api/authApi';
import { logout } from '@features/auth/slices/authSlice';
import { useAppDispatch } from '@app/store';
import { colors, spacing, typography, borderRadius } from '@app/theme';

// Zod schema for password validation (12 chars, uppercase, lowercase, number, special char)
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Wymagane pole'),
    newPassword: z
      .string()
      .min(12, 'Hasło musi mieć co najmniej 12 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
      .regex(/[^A-Za-z0-9]/, 'Hasło musi zawierać znak specjalny'),
    confirmNewPassword: z.string().min(1, 'Wymagane pole'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordScreenNavigationProps {
  goBack: () => void;
}

export function ChangePasswordScreen(): JSX.Element {
  const navigation = useNavigation<ChangePasswordScreenNavigationProps>();
  const dispatch = useAppDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      Alert.alert(
        'Sukces',
        'Hasło zostało zmienione. Zaloguj się ponownie.',
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(logout());
              reset();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Nie udało się zmienić hasła';
      Alert.alert('Błąd', errorMessage);
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
          <Text style={styles.title}>Zmień hasło</Text>
          <Text style={styles.subtitle}>
            Wprowadź obecne hasło i nowe hasło
          </Text>
        </View>

        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Obecne hasło</Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.currentPassword && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Wprowadź obecne hasło"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry
                    accessibilityLabel="Obecne hasło"
                    accessibilityHint="Wprowadź swoje obecne hasło"
                  />
                  {errors.currentPassword && (
                    <Text style={styles.errorText}>
                      {errors.currentPassword.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nowe hasło</Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.newPassword && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Wprowadź nowe hasło"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry
                    accessibilityLabel="Nowe hasło"
                    accessibilityHint="Wprowadź nowe hasło (min. 12 znaków)"
                  />
                  {errors.newPassword && (
                    <Text style={styles.errorText}>
                      {errors.newPassword.message}
                    </Text>
                  )}
                </>
              )}
            />
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Wymagania:</Text>
              <Text style={styles.requirementItem}>• Min. 12 znaków</Text>
              <Text style={styles.requirementItem}>• Wielka litera (A-Z)</Text>
              <Text style={styles.requirementItem}>• Mała litera (a-z)</Text>
              <Text style={styles.requirementItem}>• Cyfra (0-9)</Text>
              <Text style={styles.requirementItem}>• Znak specjalny (!@#$%)</Text>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Potwierdź nowe hasło</Text>
            <Controller
              control={control}
              name="confirmNewPassword"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmNewPassword && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Potwierdź nowe hasło"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry
                    accessibilityLabel="Potwierdzenie nowego hasła"
                    accessibilityHint="Wprowadź ponownie nowe hasło"
                  />
                  {errors.confirmNewPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmNewPassword.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Zmień hasło"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.submitButtonText}>Zmień hasło</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Anuluj"
          >
            <Text style={styles.cancelButtonText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
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
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
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
  passwordRequirements: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requirementItem: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: 52,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});

export default ChangePasswordScreen;
