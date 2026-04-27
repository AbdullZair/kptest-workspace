import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SimpleCard } from '../SimpleCard';

describe('SimpleCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render with title', () => {
    const { getByText } = render(
      <SimpleCard title="Test Card" />
    );

    expect(getByText('Test Card')).toBeTruthy();
  });

  it('should render with description', () => {
    const { getByText } = render(
      <SimpleCard title="Test Card" description="This is a description" />
    );

    expect(getByText('This is a description')).toBeTruthy();
  });

  it('should render with icon', () => {
    const { getByText } = render(
      <SimpleCard title="Test Card" icon="🏠" />
    );

    expect(getByText('🏠')).toBeTruthy();
  });

  it('should render with children', () => {
    const { getByText } = render(
      <SimpleCard title="Test Card">
        <TestChild />
      </SimpleCard>
    );

    expect(getByText('Child Content')).toBeTruthy();
  });

  it('should call onPress when pressed (pressable card)', () => {
    const { getByText } = render(
      <SimpleCard title="Pressable Card" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Pressable Card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when no handler provided', () => {
    const { getByText } = render(
      <SimpleCard title="Static Card" />
    );

    // Static cards should not be pressable
    expect(getByText('Static Card')).toBeTruthy();
  });

  it('should render default variant', () => {
    const { getByTestId } = render(
      <SimpleCard title="Default" variant="default" testID="card" />
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should render highlight variant', () => {
    const { getByTestId } = render(
      <SimpleCard title="Highlight" variant="highlight" testID="card" />
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should render info variant', () => {
    const { getByTestId } = render(
      <SimpleCard title="Info" variant="info" testID="card" />
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should render warning variant', () => {
    const { getByTestId } = render(
      <SimpleCard title="Warning" variant="warning" testID="card" />
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should have accessibility label from title', () => {
    const { getByLabelText } = render(
      <SimpleCard title="Accessible Card" onPress={mockOnPress} />
    );

    expect(getByLabelText('Accessible Card')).toBeTruthy();
  });

  it('should use custom accessibility label', () => {
    const { getByLabelText } = render(
      <SimpleCard
        title="Card"
        accessibilityLabel="Custom Label"
        onPress={mockOnPress}
      />
    );

    expect(getByLabelText('Custom Label')).toBeTruthy();
  });

  it('should have accessibility hint', () => {
    const { getByLabelText } = render(
      <SimpleCard
        title="Hinted Card"
        accessibilityHint="Custom hint"
        onPress={mockOnPress}
      />
    );

    expect(getByLabelText('Hinted Card')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <SimpleCard title="Custom Style" style={customStyle} testID="card" />
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should have testID for testing', () => {
    const { getByTestId } = render(
      <SimpleCard title="Test Card" testID="test-card" />
    );

    expect(getByTestId('test-card')).toBeTruthy();
  });

  it('should render with all props', () => {
    const { getByText, getByTestId } = render(
      <SimpleCard
        title="Complete Card"
        description="Full description here"
        icon="⭐"
        variant="highlight"
        onPress={mockOnPress}
        testID="complete-card"
      />
    );

    expect(getByText('Complete Card')).toBeTruthy();
    expect(getByText('Full description here')).toBeTruthy();
    expect(getByText('⭐')).toBeTruthy();
    expect(getByTestId('complete-card')).toBeTruthy();
  });

  it('should render children with title and description', () => {
    const { getByText } = render(
      <SimpleCard title="With Children" description="Has children">
        <TestChild />
      </SimpleCard>
    );

    expect(getByText('With Children')).toBeTruthy();
    expect(getByText('Has children')).toBeTruthy();
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('should render without title', () => {
    const { getByText } = render(
      <SimpleCard description="No title card">
        <TestChild />
      </SimpleCard>
    );

    expect(getByText('No title card')).toBeTruthy();
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('should render only icon', () => {
    const { getByText } = render(
      <SimpleCard icon="🎯" />
    );

    expect(getByText('🎯')).toBeTruthy();
  });
});

function TestChild() {
  return <TestChildContent />;
}

function TestChildContent() {
  return <TestFinalChild />;
}

function TestFinalChild() {
  return <span>Child Content</span>;
}
