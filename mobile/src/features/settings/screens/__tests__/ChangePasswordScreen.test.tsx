import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ChangePasswordScreen } from '../ChangePasswordScreen';
import { useChangePasswordMutation } from '@features/auth/api/authApi';
import { useAppDispatch } from '@app/store';

// Mock the RTK hook
jest.mock('@features/auth/api/authApi', () => ({
  useChangePasswordMutation: jest.fn(),
}));

// Mock the dispatch hook
jest.mock('@app/store', () => ({
  useAppDispatch: jest.fn(),
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
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

describe('ChangePasswordScreen', () => {
  const mockChangePassword = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useChangePasswordMutation as jest.Mock).mockReturnValue([
      mockChangePassword,
      { isLoading: false },
    ]);
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('should render change password form with all fields', () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    expect(getByText('Zmień hasło')).toBeTruthy();
    expect(getByText('Wprowadź obecne hasło i nowe hasło')).toBeTruthy();
    expect(getByLabelText('Obecne hasło')).toBeTruthy();
    expect(getByLabelText('Nowe hasło')).toBeTruthy();
    expect(getByLabelText('Potwierdzenie nowego hasła')).toBeTruthy();
    expect(getByText('Zmień hasło')).toBeTruthy();
    expect(getByText('Anuluj')).toBeTruthy();
  });

  it('should display password requirements', () => {
    const { getByText } = render(<ChangePasswordScreen />);

    expect(getByText('Wymagania:')).toBeTruthy();
    expect(getByText('Min. 12 znaków')).toBeTruthy();
    expect(getByText('Wielka litera (A-Z)')).toBeTruthy();
    expect(getByText('Mała litera (a-z)')).toBeTruthy();
    expect(getByText('Cyfra (0-9)')).toBeTruthy();
    expect(getByText('Znak specjalny (!@#$%)')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    const { getByText, getByLabelText } = render(<ChangePasswordScreen />);

    const submitButton = getByText('Zmień hasło');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Wymagane pole')).toBeTruthy();
    });
  });

  it('should show validation error for password too short', async () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const currentPasswordInput = getByLabelText('Obecne hasło');
    const newPasswordInput = getByLabelText('Nowe hasło');
    const confirmNewPasswordInput = getByLabelText('Potwierdzenie nowego hasła');

    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'Short1!');
      fireEvent.changeText(confirmNewPasswordInput, 'Short1!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Hasło musi mieć co najmniej 12 znaków')).toBeTruthy();
    });
  });

  it('should show validation error for missing uppercase letter', async () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const newPasswordInput = getByLabelText('Nowe hasło');

    await act(async () => {
      fireEvent.changeText(newPasswordInput, 'alllowercase1!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Hasło musi zawierać wielką literę')).toBeTruthy();
    });
  });

  it('should show validation error for missing lowercase letter', async () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const newPasswordInput = getByLabelText('Nowe hasło');

    await act(async () => {
      fireEvent.changeText(newPasswordInput, 'ALLUPPERCASE1!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Hasło musi zawierać małą literę')).toBeTruthy();
    });
  });

  it('should show validation error for missing number', async () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const newPasswordInput = getByLabelText('Nowe hasło');

    await act(async () => {
      fireEvent.changeText(newPasswordInput, 'NoNumbersHere!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Hasło musi zawierać cyfrę')).toBeTruthy();
    });
  });

  it('should show validation error for missing special character', async () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const newPasswordInput = getByLabelText('Nowe hasło');

    await act(async () => {
      fireEvent.changeText(newPasswordInput, 'NoSpecialChar1');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Hasło musi zawierać znak specjalny')).toBeTruthy();
    });
  });

  it('should show validation error for passwords not matching', async () => {
    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const currentPasswordInput = getByLabelText('Obecne hasło');
    const newPasswordInput = getByLabelText('Nowe hasło');
    const confirmNewPasswordInput = getByLabelText('Potwierdzenie nowego hasła');

    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPassword123!');
      fireEvent.changeText(confirmNewPasswordInput, 'DifferentPassword123!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByText('Hasła nie są identyczne')).toBeTruthy();
    });
  });

  it('should call changePassword mutation with correct data on valid submit', async () => {
    mockChangePassword.mockResolvedValue({ success: true });

    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const currentPasswordInput = getByLabelText('Obecne hasło');
    const newPasswordInput = getByLabelText('Nowe hasło');
    const confirmNewPasswordInput = getByLabelText('Potwierdzenie nowego hasła');

    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPassword123!');
      fireEvent.changeText(confirmNewPasswordInput, 'NewPassword123!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'CurrentPass123!',
        newPassword: 'NewPassword123!',
      });
    });
  });

  it('should show success alert and dispatch logout on successful password change', async () => {
    mockChangePassword.mockResolvedValue({ success: true });

    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const currentPasswordInput = getByLabelText('Obecne hasło');
    const newPasswordInput = getByLabelText('Nowe hasło');
    const confirmNewPasswordInput = getByLabelText('Potwierdzenie nowego hasła');

    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPassword123!');
      fireEvent.changeText(confirmNewPasswordInput, 'NewPassword123!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Sukces',
        'Hasło zostało zmienione. Zaloguj się ponownie.',
        expect.any(Array)
      );
    });

    // Simulate pressing OK on the alert
    const alertCallback = mockAlert.mock.calls[0][2][0];
    await act(async () => {
      alertCallback.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth/logout' }));
  });

  it('should show error alert on failed password change', async () => {
    mockChangePassword.mockRejectedValue({
      data: { message: 'Invalid current password' },
    });

    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const currentPasswordInput = getByLabelText('Obecne hasło');
    const newPasswordInput = getByLabelText('Nowe hasło');
    const confirmNewPasswordInput = getByLabelText('Potwierdzenie nowego hasła');

    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'WrongPassword123!');
      fireEvent.changeText(newPasswordInput, 'NewPassword123!');
      fireEvent.changeText(confirmNewPasswordInput, 'NewPassword123!');
    });

    const submitButton = getByText('Zmień hasło');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Błąd',
        'Invalid current password'
      );
    });
  });

  it('should call navigation.goBack when cancel button is pressed', async () => {
    const { getByText } = render(<ChangePasswordScreen />);

    const cancelButton = getByText('Anuluj');
    await act(async () => {
      fireEvent.press(cancelButton);
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should disable submit button while loading', async () => {
    (useChangePasswordMutation as jest.Mock).mockReturnValue([
      mockChangePassword,
      { isLoading: true },
    ]);

    const { getByLabelText, getByText } = render(<ChangePasswordScreen />);

    const currentPasswordInput = getByLabelText('Obecne hasło');
    const newPasswordInput = getByLabelText('Nowe hasło');
    const confirmNewPasswordInput = getByLabelText('Potwierdzenie nowego hasła');

    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPassword123!');
      fireEvent.changeText(confirmNewPasswordInput, 'NewPassword123!');
    });

    const submitButton = getByText('Zmień hasło');
    expect(submitButton.props.disabled).toBe(true);
  });
});
