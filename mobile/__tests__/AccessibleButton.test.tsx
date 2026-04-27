import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleButton } from '../AccessibleButton';

describe('AccessibleButton', () => {
  it('renders correctly with label', () => {
    const onPress = jest.fn();
    const { getByAccessibilityLabel } = render(
      <AccessibleButton onPress={onPress} label="Test Button" />
    );
    expect(getByAccessibilityLabel('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByAccessibilityLabel } = render(
      <AccessibleButton onPress={onPress} label="Test Button" />
    );
    
    fireEvent.press(getByAccessibilityLabel('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const onPress = jest.fn();
    const { getByAccessibilityLabel } = render(
      <AccessibleButton onPress={onPress} label="Test Button" disabled />
    );
    
    fireEvent.press(getByAccessibilityLabel('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const onPress = jest.fn();
    const { rerender } = render(
      <AccessibleButton onPress={onPress} label="Primary" variant="primary" />
    );
    expect(rerender).toBeTruthy();
    
    rerender(
      <AccessibleButton onPress={onPress} label="Danger" variant="danger" />
    );
    expect(rerender).toBeTruthy();
  });

  it('renders with icon', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AccessibleButton onPress={onPress} label="With Icon" icon="🚀" />
    );
    expect(getByText('🚀')).toBeTruthy();
  });
});
