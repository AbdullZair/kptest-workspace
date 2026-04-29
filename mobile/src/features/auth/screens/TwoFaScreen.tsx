import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useVerify2FAMutation } from '@features/auth/api/authApi';
import { setCredentials } from '@features/auth/slices/authSlice';
import { useAppDispatch } from '@app/store';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';
import { AccessibleButton } from '@shared/components/AccessibleButton';

interface TwoFaRouteParams {
  email: string;
  tempToken: string;
}

interface TwoFaScreenNavigationProps {
  goBack: () => void;
}

export function TwoFaScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<TwoFaScreenNavigationProps>();
  const dispatch = useAppDispatch();
  const [verify2FA, { isLoading }] = useVerify2FAMutation();

  const { email, tempToken } = route.params as TwoFaRouteParams;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) value = value[value.length - 1];

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');

    if (codeString.length !== 6) {
      Alert.alert('Błąd', 'Wprowadź 6-cyfrowy kod');
      return;
    }

    try {
      const result = await verify2FA({ tempToken, code: codeString }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        })
      );
    } catch (error: any) {
      Alert.alert(
        'Błąd weryfikacji',
        error?.data?.message || 'Nieprawidłowy kod 2FA'
      );
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend logic
    Alert.alert('Info', 'Kod został wysłany ponownie');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Weryfikacja dwuetapowa</Text>
          <Text style={styles.subtitle}>
            Wprowadź kod wysłany na adres{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`Cyfra ${index + 1} z 6`}
              accessibilityRole="text"
            />
          ))}
        </View>

        <AccessibleButton
          onPress={handleVerify}
          label={isLoading ? 'Weryfikacja...' : 'Zweryfikuj'}
          variant="primary"
          size="large"
          style={styles.verifyButton}
          disabled={isLoading || code.join('').length !== 6}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Nie otrzymałeś kodu?</Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendButton}>Wyślij ponownie</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={ACCESSIBILITY_LABELS.BACK_BUTTON}
        >
          <Text style={styles.backButtonText}>Wróć do logowania</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  resendButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default TwoFaScreen;
