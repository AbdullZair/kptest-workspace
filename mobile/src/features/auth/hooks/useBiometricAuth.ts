import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricService, BiometricState } from '@services/BiometricService';

interface UseBiometricAuthReturn {
  biometricState: BiometricState;
  isLoading: boolean;
  error: string | null;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticate: (promptMessage?: string) => Promise<boolean>;
  quickLogin: () => Promise<boolean>;
  refreshState: () => Promise<void>;
  getBiometricTypeName: () => string;
}

export function useBiometricAuth(): UseBiometricAuthReturn {
  const [biometricState, setBiometricState] = useState<BiometricState>({
    isAvailable: false,
    isEnrolled: false,
    biometricType: null,
    isEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const state = await BiometricService.checkBiometricAvailability();
      setBiometricState(state);
    } catch (err: any) {
      setError(err.message || 'Failed to check biometric availability');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await BiometricService.enableBiometric();
      if (success) {
        await refreshState();
        return true;
      } else {
        setError('Failed to enable biometric authentication');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enable biometric');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const disableBiometric = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await BiometricService.disableBiometric();
      await refreshState();
    } catch (err: any) {
      setError(err.message || 'Failed to disable biometric');
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const authenticate = useCallback(async (promptMessage?: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await BiometricService.authenticate(promptMessage);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      return false;
    }
  }, []);

  const quickLogin = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await BiometricService.quickLogin();
      if (!success) {
        setError('Biometric login not enabled or failed');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
      return false;
    }
  }, []);

  const getBiometricTypeName = useCallback((): string => {
    if (biometricState.biometricType) {
      return BiometricService.getBiometricTypeName(biometricState.biometricType);
    }
    return 'Biometric';
  }, [biometricState.biometricType]);

  return {
    biometricState,
    isLoading,
    error,
    enableBiometric,
    disableBiometric,
    authenticate,
    quickLogin,
    refreshState,
    getBiometricTypeName,
  };
}

export default useBiometricAuth;
