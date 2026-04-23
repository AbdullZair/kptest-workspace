import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVerifyTwoFaMutation, useResendTwoFaMutation } from '@features/auth/api/authApi';
import { useAppDispatch } from '@app/store';
import { saveTokens } from '@features/auth/slices/authSlice';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { AuthStackParamList } from '@app/navigation';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type TwoFaRouteProp = RouteProp<AuthStackParamList, 'TwoFa'>;

export function TwoFaScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TwoFaRouteProp>();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { email, tempToken } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [verifyTwoFa, { isLoading: isVerifying }] = useVerifyTwoFaMutation();
  const [resendTwoFa, { isLoading: isResending }] = useResendTwoFaMutation();
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== '') && newCode.length === 6) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyPress = (e: React.NativeKeyEvent, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (verificationCode: string) => {
    try {
      const result = await verifyTwoFa({
        code: verificationCode,
        tempToken,
      }).unwrap();

      await dispatch(saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })).unwrap();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      Alert.alert('Verification Error', errorMessage);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await resendTwoFa({ email }).unwrap();
      Alert.alert('Success', 'New verification code sent to your email');
      setResendTimer(30);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      Alert.alert('Error', errorMessage);
    }
  };

  const themeColors = {
    background: isDark ? colors.backgroundDark : colors.background,
    text: isDark ? colors.textInverse : colors.text,
    textSecondary: isDark ? colors.textLight : colors.textSecondary,
    border: isDark ? colors.borderDark : colors.border,
    surface: isDark ? colors.surfaceDark : colors.surface,
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.icon}>🔐</Text>
          </View>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Two-Factor Authentication
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Enter the 6-digit code sent to
          </Text>
          <Text style={[styles.email, { color: themeColors.text }]}>
            {email}
          </Text>
        </View>

        <View style={[styles.form, styles.shadow]}>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  {
                    backgroundColor: themeColors.surface,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  },
                  digit && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
                accessibilityLabel={`Digit ${index + 1} of 6`}
                accessibilityHint="Enter one digit per field"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (isVerifying || code.some((d) => d === '')) && styles.buttonDisabled,
            ]}
            onPress={() => handleSubmit(code.join(''))}
            disabled={isVerifying || code.some((d) => d === '')}
            accessibilityLabel="Verify code button"
          >
            {isVerifying ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: themeColors.textSecondary }]}>
              Didn't receive the code?{' '}
            </Text>
            {resendTimer > 0 ? (
              <Text style={[styles.resendTimer, { color: themeColors.textSecondary }]}>
                Resend in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                accessibilityLabel="Resend code button"
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.resendLink, { color: colors.primary }]}>
                    Resend Code
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back button"
          >
            <Text style={[styles.backButtonText, { color: themeColors.textSecondary }]}>
              ← Back to Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>
            💡 Tips
          </Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            • Check your spam folder if you don't see the email{'\n'}
            • The code expires after 10 minutes{'\n'}
            • Make sure you're checking the correct email address
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  email: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  shadow: {
    ...shadows.md,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  button: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resendText: {
    fontSize: typography.fontSize.sm,
  },
  resendTimer: {
    fontSize: typography.fontSize.sm,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  backButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.sm,
  },
  infoBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
});

export default TwoFaScreen;
