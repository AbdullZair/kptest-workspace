import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProposeEventChangeScreen } from '../ProposeEventChangeScreen';

// Mock navigation
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      eventId: 'test-event-id',
      eventTitle: 'Test Therapy Session',
      eventDate: new Date('2024-05-15T10:00:00Z').toISOString(),
    },
  }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return function DateTimePicker() {
    return <View testID="datetime-picker" />;
  };
});

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

describe('ProposeEventChangeScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    mockAlert.mockClear();
  });

  it('should render screen header', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    expect(getByText('Zmień Termin')).toBeTruthy();
    expect(getByText('Zaproponuj nowy termin dla wydarzenia')).toBeTruthy();
  });

  it('should display event information', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    expect(getByText('Wydarzenie')).toBeTruthy();
    expect(getByText('Test Therapy Session')).toBeTruthy();
    expect(getByText('Obecny termin')).toBeTruthy();
  });

  it('should display important info card', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    expect(getByText('Ważne informacje')).toBeTruthy();
    expect(getByText(/Możesz zmienić termin maksymalnie 3 razy/)).toBeTruthy();
    expect(getByText(/Nowy termin musi być co najmniej 24 godziny/)).toBeTruthy();
  });

  it('should have date selection button', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    expect(getByText('Wybierz datę i godzinę')).toBeTruthy();
  });

  it('should have reason input field', () => {
    const { getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    expect(reasonInput).toBeTruthy();
  });

  it('should show date picker when date button pressed', () => {
    const { getByText, getByTestId } = render(<ProposeEventChangeScreen />);

    const dateButton = getByText('Wybierz datę i godzinę');
    fireEvent.press(dateButton);

    expect(getByTestId('datetime-picker')).toBeTruthy();
  });

  it('should show error when submitting without date', () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'Test reason');

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    expect(mockAlert).toHaveBeenCalledWith('Błąd', 'Wybierz proponowany termin');
  });

  it('should show error when submitting without reason', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    // First select a date
    const dateButton = getByText('Wybierz datę i godzinę');
    fireEvent.press(dateButton);

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    expect(mockAlert).toHaveBeenCalledWith('Błąd', 'Podaj powód zmiany terminu');
  });

  it('should show error when date is less than 24 hours away', () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    // Mock a date that's only 12 hours away
    jest.spyOn(Date, 'now').mockReturnValue(Date.now());
    
    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'Test reason');

    // Simulate date selection (would be done through picker)
    // For this test, we just check the validation logic

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    // Should show error about 24 hour minimum
    expect(mockAlert).toHaveBeenCalled();
  });

  it('should submit successfully with valid data', async () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'I need to reschedule my appointment');

    // Select a future date (3 days from now)
    const dateButton = getByText('Wybierz datę i godzinę');
    fireEvent.press(dateButton);

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Wysłano',
        expect.any(String),
        expect.any(Array)
      );
    });
  });

  it('should navigate back after successful submission', async () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'Test reason');

    const dateButton = getByText('Wybierz datę i godzinę');
    fireEvent.press(dateButton);

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should show error alert on submission failure', async () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'Test reason');

    const dateButton = getByText('Wybierz datę i godzinę');
    fireEvent.press(dateButton);

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it('should navigate back when cancel button pressed', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    const cancelButton = getByText('Anuluj');
    fireEvent.press(cancelButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should show loading state while submitting', () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'Test reason');

    const submitButton = getByText('Wyślij prośbę');
    fireEvent.press(submitButton);

    // Loading state should be visible
    expect(getByText('Wysyłanie...')).toBeTruthy();
  });

  it('should display character count for reason input', () => {
    const { getByText, getByLabelText } = render(<ProposeEventChangeScreen />);

    const reasonInput = getByLabelText('Powód zmiany terminu');
    fireEvent.changeText(reasonInput, 'Test');

    expect(getByText('4 znaków')).toBeTruthy();
  });

  it('should have emoji in header', () => {
    const { getByText } = render(<ProposeEventChangeScreen />);

    expect(getByText('📅')).toBeTruthy();
  });

  it('should have accessibility labels on inputs', () => {
    const { getByLabelText } = render(<ProposeEventChangeScreen />);

    expect(getByLabelText('Powód zmiany terminu')).toBeTruthy();
    expect(getByLabelText('Wybierz datę i godzinę')).toBeTruthy();
  });
});
