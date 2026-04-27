import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders correctly with default props', () => {
    const { getByAccessibilityLabel } = render(<LoadingSpinner />);
    expect(getByAccessibilityLabel('Ładowanie...')).toBeTruthy();
  });

  it('renders with custom text', () => {
    const { getByText } = render(<LoadingSpinner text="Test loading..." />);
    expect(getByText('Test loading...')).toBeTruthy();
  });

  it('renders in full screen mode', () => {
    const { getByTestId } = render(<LoadingSpinner fullScreen testID="spinner" />);
    const container = getByTestId('spinner').parent;
    expect(container).toBeTruthy();
  });
});
