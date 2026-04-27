import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders correctly with required props', () => {
    const { getByText } = render(
      <EmptyState title="No items" message="Nothing to show" />
    );
    expect(getByText('No items')).toBeTruthy();
    expect(getByText('Nothing to show')).toBeTruthy();
  });

  it('renders with custom icon', () => {
    const { getByText } = render(
      <EmptyState icon="📭" title="Empty" />
    );
    expect(getByText('📭')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const onAction = jest.fn();
    const { getByAccessibilityLabel } = render(
      <EmptyState
        title="Empty"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );
    expect(getByAccessibilityLabel('Add Item')).toBeTruthy();
  });

  it('calls onAction when button is pressed', () => {
    const onAction = jest.fn();
    const { getByAccessibilityLabel } = render(
      <EmptyState
        title="Empty"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );
    
    fireEvent.press(getByAccessibilityLabel('Add Item'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

import { fireEvent } from '@testing-library/react-native';
