import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BiometricSetupScreen } from '../BiometricSetupScreen';
import { useBiometricAuth } from '@features/auth/hooks/useBiometricAuth';
import * as LocalAuthentication from 'expo-local-authentication';

// Mock the hook
jest.mock('@features/auth/hooks/useBiometricAuth');

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: mockAlert,
    },
  };
});

describe('BiometricSetupScreen', () => {
  const mockHookReturn = {
    biometricState: {
      isAvailable: true,
      isEnrolled: true,
      biometricType: LocalAuthentication.AuthenticationType.FACE,
      isEnabled: false,
    },
    isLoading: false,
    error: null,
    enableBiometric: jest.fn(),
    disableBiometric: jest.fn(),
    authenticate: jest.fn(),
    quickLogin: jest.fn(),
    refreshState: jest.fn(),
    getBiometricTypeName: jest.fn().mockReturnValue('Face ID'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBiometricAuth as jest.Mock).mockReturnValue(mockHookReturn);
  });

  it('should render loading state', () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      isLoading: true,
    });

    const { getByText } = render(<BiometricSetupScreen />);

    expect(getByText('Sprawdzanie dostępności...')).toBeTruthy();
  });

  it('should render biometric setup screen with correct content', () => {
    const { getByText } = render(<BiometricSetupScreen />);

    expect(getByText('Logowanie Biometryczne')).toBeTruthy();
    expect(getByText('Szybkie i bezpieczne logowanie za pomocą Face ID')).toBeTruthy();
  });

  it('should show warning when biometric not available', () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      biometricState: {
        ...mockHookReturn.biometricState,
        isAvailable: false,
      },
    });

    const { getByText } = render(<BiometricSetupScreen />);

    expect(getByText('Biometria niedostępna')).toBeTruthy();
  });

  it('should show info when no biometrics enrolled', () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      biometricState: {
        ...mockHookReturn.biometricState,
        isAvailable: true,
        isEnrolled: false,
      },
    });

    const { getByText } = render(<BiometricSetupScreen />);

    expect(getByText('Brak zapisanych danych biometrycznych')).toBeTruthy();
  });

  it('should enable biometric when toggle is switched on', async () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      enableBiometric: jest.fn().mockResolvedValue(true),
    });

    const { getByLabelText } = render(<BiometricSetupScreen />);
    const toggle = getByLabelText('Przełącz logowanie biometryczne');

    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      expect(mockHookReturn.enableBiometric).toHaveBeenCalled();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Włączono logowanie biometryczne',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('should disable biometric when toggle is switched off', async () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      biometricState: {
        ...mockHookReturn.biometricState,
        isEnabled: true,
      },
      disableBiometric: jest.fn().mockResolvedValue(undefined),
    });

    const { getByLabelText } = render(<BiometricSetupScreen />);
    const toggle = getByLabelText('Przełącz logowanie biometryczne');

    fireEvent(toggle, 'valueChange', false);

    await waitFor(() => {
      expect(mockHookReturn.disableBiometric).toHaveBeenCalled();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Wyłączono logowanie biometryczne',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('should test biometric authentication when button pressed', async () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      biometricState: {
        ...mockHookReturn.biometricState,
        isEnabled: true,
      },
      authenticate: jest.fn().mockResolvedValue(true),
    });

    const { getByText } = render(<BiometricSetupScreen />);
    const testButton = getByText('Przetestuj logowanie');

    fireEvent.press(testButton);

    await waitFor(() => {
      expect(mockHookReturn.authenticate).toHaveBeenCalled();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Sukces!',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('should show error when test authentication fails', async () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      biometricState: {
        ...mockHookReturn.biometricState,
        isEnabled: true,
      },
      authenticate: jest.fn().mockResolvedValue(false),
      error: 'Authentication failed',
    });

    const { getByText } = render(<BiometricSetupScreen />);
    const testButton = getByText('Przetestuj logowanie');

    fireEvent.press(testButton);

    await waitFor(() => {
      expect(mockHookReturn.authenticate).toHaveBeenCalled();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Niepowodzenie',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('should navigate back when back button pressed', () => {
    const { getByText } = render(<BiometricSetupScreen />);
    const backButton = getByText('Wróć');

    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should display security information', () => {
    const { getByText } = render(<BiometricSetupScreen />);

    expect(getByText('🔒 Bezpieczeństwo')).toBeTruthy();
    expect(getByText(/Twoje dane biometryczne są przechowywane/)).toBeTruthy();
  });

  it('should show error card when error exists', () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      error: 'Test error message',
    });

    const { getByText } = render(<BiometricSetupScreen />);

    expect(getByText('Test error message')).toBeTruthy();
  });

  it('should prevent toggle when already toggling', async () => {
    let resolveToggle: () => void;
    const togglePromise = new Promise<void>((resolve) => {
      resolveToggle = resolve;
    });

    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      enableBiometric: jest.fn().mockImplementation(() => togglePromise),
      isLoading: false,
    });

    const { getByLabelText } = render(<BiometricSetupScreen />);
    const toggle = getByLabelText('Przełącz logowanie biometryczne');

    fireEvent(toggle, 'valueChange', true);
    fireEvent(toggle, 'valueChange', false); // Try to toggle again quickly

    await waitFor(() => {
      expect(mockHookReturn.enableBiometric).toHaveBeenCalledTimes(1);
    });

    resolveToggle!();
  });

  it('should call onEnable callback when enabling', async () => {
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({
        goBack: mockGoBack,
        navigate: mockNavigate,
      }),
      useRoute: () => ({
        params: {
          onEnable: jest.fn(),
        },
      }),
    }));

    // Re-import to get the mocked version
    const { useRoute } = require('@react-navigation/native');
    useRoute.mockReturnValue({
      params: {
        onEnable: jest.fn(),
      },
    });

    (useBiometricAuth as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      enableBiometric: jest.fn().mockResolvedValue(true),
    });

    const { getByLabelText } = render(<BiometricSetupScreen />);
    const toggle = getByLabelText('Przełącz logowanie biometryczne');

    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      const { useRoute: currentUseRoute } = require('@react-navigation/native');
      expect(currentUseRoute().params.onEnable).toHaveBeenCalledWith(true);
    });
  });
});
