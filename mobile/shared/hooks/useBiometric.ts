import { useState, useCallback } from 'react';

interface UseBiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
}

interface UseBiometricReturn {
  isAvailable: boolean;
  biometryType: 'face' | 'touch' | 'iris' | null;
  isLoading: boolean;
  error: string | null;
  authenticate: () => Promise<{ success: boolean; error?: string }>;
  checkAvailability: () => Promise<void>;
}

export function useBiometric(options: UseBiometricOptions = {}): UseBiometricReturn {
  const {
    promptMessage = 'Authenticate to Continue',
    cancelLabel = 'Cancel',
    fallbackLabel = 'Use Passcode',
  } = options;

  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<'face' | 'touch' | 'iris' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        isAvailable,
        enrolledBiometricTypes,
        getEnrolledLevel,
        AuthenticationType,
      } = await import('expo-local-authentication');

      const available = await isAvailable();
      setIsAvailable(available);

      if (available) {
        const types = await enrolledBiometricTypes();
        const hasFace = types.includes(AuthenticationType.FACE);
        const hasFingerprint = types.includes(AuthenticationType.FINGERPRINT);
        const hasIris = types.includes(AuthenticationType.IRIS);

        if (hasFace) setBiometryType('face');
        else if (hasFingerprint) setBiometryType('touch');
        else if (hasIris) setBiometryType('iris');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check biometric availability');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { authenticateAsync } = await import('expo-local-authentication');

      const result = await authenticateAsync({
        promptMessage,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback: false,
      });

      return { success: result.success };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, error: errorMessage };
    }
  }, [promptMessage, cancelLabel, fallbackLabel]);

  return {
    isAvailable,
    biometryType,
    isLoading,
    error,
    authenticate,
    checkAvailability,
  };
}

export default useBiometric;
