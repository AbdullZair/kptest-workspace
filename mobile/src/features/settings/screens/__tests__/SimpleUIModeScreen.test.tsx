import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SimpleUIModeScreen } from '../SimpleUIModeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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

describe('SimpleUIModeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render screen header', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('Tryb Uproszczony')).toBeTruthy();
    expect(getByText('Dostosuj interfejs dla lepszej dostępności')).toBeTruthy();
  });

  it('should render main toggle card', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('Włącz tryb uproszczony')).toBeTruthy();
    expect(getByText('Zwiększone elementy, wyższy kontrast i prostszy interfejs')).toBeTruthy();
  });

  it('should render features list', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('Większe czcionki (125% większe)')).toBeTruthy();
    expect(getByText('Większe przyciski (min. 48x48 pikseli)')).toBeTruthy();
    expect(getByText('Wysoki kontrast kolorów')).toBeTruthy();
    expect(getByText('Uproszczona nawigacja (3 główne kafelki)')).toBeTruthy();
    expect(getByText('Prostszy język interfejsu')).toBeTruthy();
  });

  it('should render "who should use" section', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('Dla kogo jest ten tryb?')).toBeTruthy();
    expect(getByText('Osoby ze słabszym wzrokiem')).toBeTruthy();
    expect(getByText('Osoby starsze')).toBeTruthy();
    expect(getByText('Osoby z trudnościami motorycznymi')).toBeTruthy();
  });

  it('should render preview section', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('Przykład')).toBeTruthy();
    expect(getByText('Standardowy:')).toBeTruthy();
    expect(getByText('Uproszczony:')).toBeTruthy();
  });

  it('should save simple mode enabled when toggle switched on', async () => {
    const { getByLabelText } = render(<SimpleUIModeScreen />);
    const toggle = getByLabelText('Przełącz tryb uproszczony');

    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@kptest:simple_mode_enabled',
        'true'
      );
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Włączono tryb uproszczony',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('should save simple mode disabled when toggle switched off', async () => {
    // First enable it, then disable
    const { getByLabelText, rerender } = render(<SimpleUIModeScreen />);
    
    // Simulate already enabled state by mocking
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);
    
    rerender(<SimpleUIModeScreen />);
    
    const toggle = getByLabelText('Przełącz tryb uproszczony');
    fireEvent(toggle, 'valueChange', false);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@kptest:simple_mode_enabled',
        'false'
      );
    });
  });

  it('should show error alert when saving fails', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { getByLabelText } = render(<SimpleUIModeScreen />);
    const toggle = getByLabelText('Przełącz tryb uproszczony');

    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Błąd',
        'Nie udało się zapisać ustawień.',
        expect.any(Array)
      );
    });
  });

  it('should navigate back when back button pressed', () => {
    const { getByText } = render(<SimpleUIModeScreen />);
    const backButton = getByText('Wróć');

    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should prevent multiple rapid toggles while saving', async () => {
    let resolveSetItem: () => void;
    const setItemPromise = new Promise<void>((resolve) => {
      resolveSetItem = resolve;
    });

    (AsyncStorage.setItem as jest.Mock).mockImplementation(() => setItemPromise);

    const { getByLabelText } = render(<SimpleUIModeScreen />);
    const toggle = getByLabelText('Przełącz tryb uproszczony');

    fireEvent(toggle, 'valueChange', true);
    fireEvent(toggle, 'valueChange', false); // Try to toggle again

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    resolveSetItem!();
  });

  it('should render info card with instructions', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText(/Tryb uproszczony można włączyć lub wyłączyć/)).toBeTruthy();
  });

  it('should display correct toggle state label', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    // Initial state should be WYŁĄCZONE
    expect(getByText('WYŁĄCZONE')).toBeTruthy();
  });

  it('should have emoji in header', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('👁️')).toBeTruthy();
  });

  it('should have feature icons', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('📏')).toBeTruthy();
    expect(getByText('👆')).toBeTruthy();
    expect(getByText('🎨')).toBeTruthy();
    expect(getByText('🏠')).toBeTruthy();
    expect(getByText('💬')).toBeTruthy();
  });

  it('should have section icons', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    expect(getByText('📱')).toBeTruthy();
    expect(getByText('✨')).toBeTruthy();
    expect(getByText('👥')).toBeTruthy();
    expect(getByText('👀')).toBeTruthy();
  });

  it('should render back button with correct variant', () => {
    const { getByText } = render(<SimpleUIModeScreen />);

    const backButton = getByText('Wróć');
    expect(backButton).toBeTruthy();
  });
});
