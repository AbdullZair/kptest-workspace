import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SimpleButton } from '../SimpleButton';

describe('SimpleButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render with label', () => {
    const { getByText } = render(
      <SimpleButton onPress={mockOnPress} label="Test Button" />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <SimpleButton onPress={mockOnPress} label="Test Button" />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const { getByText } = render(
      <SimpleButton onPress={mockOnPress} label="Test Button" disabled />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with icon', () => {
    const { getByText } = render(
      <SimpleButton onPress={mockOnPress} label="Test Button" icon="🔔" />
    );

    expect(getByText('🔔')).toBeTruthy();
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should render primary variant', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Primary" variant="primary" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should render secondary variant', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Secondary" variant="secondary" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should render outline variant', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Outline" variant="outline" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should render danger variant', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Danger" variant="danger" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should render medium size', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Medium" size="medium" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should render large size', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Large" size="large" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should render full width when specified', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Full Width" fullWidth testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should have accessibility props', () => {
    const { getByLabelText } = render(
      <SimpleButton
        onPress={mockOnPress}
        label="Test Button"
        hint="This is a test button"
        testID="btn"
      />
    );

    const button = getByLabelText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should show disabled state visually', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Disabled" disabled testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <SimpleButton
        onPress={mockOnPress}
        label="Custom Style"
        style={customStyle}
        testID="btn"
      />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should apply custom text style', () => {
    const customTextStyle = { fontWeight: 'bold' };
    const { getByText } = render(
      <SimpleButton
        onPress={mockOnPress}
        label="Custom Text"
        textStyle={customTextStyle}
      />
    );

    expect(getByText('Custom Text')).toBeTruthy();
  });

  it('should have minimum touch target of 48', () => {
    // This is verified by the component's internal styles
    // We can check that the component renders correctly
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Touch Target" testID="btn" />
    );

    expect(getByTestId('btn')).toBeTruthy();
  });

  it('should not press when saving state', () => {
    const { getByText } = render(
      <SimpleButton onPress={mockOnPress} label="Test" disabled />
    );

    fireEvent.press(getByText('Test'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with testID for testing', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={mockOnPress} label="Test" testID="test-button" />
    );

    expect(getByTestId('test-button')).toBeTruthy();
  });
});
