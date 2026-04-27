import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useBiometricAuth } from '../useBiometricAuth';
import { BiometricService } from '@services/BiometricService';
import * as LocalAuthentication from 'expo-local-authentication';

// Mock BiometricService
jest.mock('@services/BiometricService');

describe('useBiometricAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockBiometricState = {
    isAvailable: true,
    isEnrolled: true,
    biometricType: LocalAuthentication.AuthenticationType.FACE,
    isEnabled: false,
  };

  describe('initialization', () => {
    it('should load biometric state on mount', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);

      const { result } = renderHook(() => useBiometricAuth());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricState).toEqual(mockBiometricState);
    });

    it('should handle initialization error', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockRejectedValue(new Error('Init error'));

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Init error');
    });
  });

  describe('enableBiometric', () => {
    it('should enable biometric authentication', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.enableBiometric as jest.Mock).mockResolvedValue(true);
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValueOnce({
        ...mockBiometricState,
        isEnabled: true,
      });

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let enableResult: boolean | undefined;
      await act(async () => {
        enableResult = await result.current.enableBiometric();
      });

      expect(enableResult).toBe(true);
      expect(BiometricService.enableBiometric).toHaveBeenCalled();
    });

    it('should return false when enabling fails', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.enableBiometric as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let enableResult: boolean | undefined;
      await act(async () => {
        enableResult = await result.current.enableBiometric();
      });

      expect(enableResult).toBe(false);
      expect(result.current.error).toBe('Failed to enable biometric authentication');
    });
  });

  describe('disableBiometric', () => {
    it('should disable biometric authentication', async () => {
      const enabledState = { ...mockBiometricState, isEnabled: true };
      (BiometricService.checkBiometricAvailability as jest.Mock)
        .mockResolvedValueOnce(enabledState)
        .mockResolvedValueOnce(mockBiometricState);
      (BiometricService.disableBiometric as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.disableBiometric();
      });

      expect(BiometricService.disableBiometric).toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
        biometricType: LocalAuthentication.AuthenticationType.FACE,
      });

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult: boolean | undefined;
      await act(async () => {
        authResult = await result.current.authenticate('Test prompt');
      });

      expect(authResult).toBe(true);
      expect(BiometricService.authenticate).toHaveBeenCalledWith('Test prompt');
    });

    it('should handle authentication failure', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'User cancelled',
      });

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult: boolean | undefined;
      await act(async () => {
        authResult = await result.current.authenticate();
      });

      expect(authResult).toBe(false);
      expect(result.current.error).toBe('User cancelled');
    });
  });

  describe('quickLogin', () => {
    it('should perform quick login successfully', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.quickLogin as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean | undefined;
      await act(async () => {
        loginResult = await result.current.quickLogin();
      });

      expect(loginResult).toBe(true);
    });

    it('should handle quick login failure', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.quickLogin as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean | undefined;
      await act(async () => {
        loginResult = await result.current.quickLogin();
      });

      expect(loginResult).toBe(false);
    });
  });

  describe('refreshState', () => {
    it('should refresh biometric state', async () => {
      const initialState = { ...mockBiometricState, isEnabled: false };
      const updatedState = { ...mockBiometricState, isEnabled: true };

      (BiometricService.checkBiometricAvailability as jest.Mock)
        .mockResolvedValueOnce(initialState)
        .mockResolvedValueOnce(updatedState);

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricState.isEnabled).toBe(false);

      await act(async () => {
        await result.current.refreshState();
      });

      expect(result.current.biometricState.isEnabled).toBe(true);
    });
  });

  describe('getBiometricTypeName', () => {
    it('should return biometric type name', async () => {
      (BiometricService.checkBiometricAvailability as jest.Mock).mockResolvedValue(mockBiometricState);
      (BiometricService.getBiometricTypeName as jest.Mock).mockReturnValue('Face ID');

      const { result } = renderHook(() => useBiometricAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const typeName = result.current.getBiometricTypeName();

      expect(typeName).toBe('Face ID');
      expect(BiometricService.getBiometricTypeName).toHaveBeenCalledWith(
        LocalAuthentication.AuthenticationType.FACE
      );
    });
  });
});
