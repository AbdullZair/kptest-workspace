import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrioritySelector } from './PrioritySelector'
import type { MessagePriority } from '../types'

describe('PrioritySelector', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render all priority options', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    expect(screen.getByText('Informacja')).toBeInTheDocument()
    expect(screen.getByText('Pytanie')).toBeInTheDocument()
    expect(screen.getByText('Pilne')).toBeInTheDocument()
    expect(screen.getByText('ℹ️')).toBeInTheDocument()
    expect(screen.getByText('❓')).toBeInTheDocument()
    expect(screen.getByText('🚨')).toBeInTheDocument()
  })

  it('should show correct descriptions', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    expect(screen.getByText('Zwykła wiadomość informacyjna')).toBeInTheDocument()
    expect(screen.getByText('Pytanie wymagające odpowiedzi')).toBeInTheDocument()
    expect(screen.getByText('Sprawa wymagająca natychmiastowej uwagi')).toBeInTheDocument()
  })

  it('should call onChange when priority is selected', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('Pytanie'))
    expect(mockOnChange).toHaveBeenCalledWith('QUESTION')

    fireEvent.click(screen.getByText('Pilne'))
    expect(mockOnChange).toHaveBeenCalledWith('URGENT')
  })

  it('should show selected state for INFO priority', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    const infoButton = screen.getByLabelText('Wybierz priorytet: Informacja')
    expect(infoButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should show selected state for QUESTION priority', () => {
    render(<PrioritySelector value="QUESTION" onChange={mockOnChange} />)

    const questionButton = screen.getByLabelText('Wybierz priorytet: Pytanie')
    expect(questionButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should show selected state for URGENT priority', () => {
    render(<PrioritySelector value="URGENT" onChange={mockOnChange} />)

    const urgentButton = screen.getByLabelText('Wybierz priorytet: Pilne')
    expect(urgentButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} disabled />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('should not call onChange when disabled', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} disabled />)

    fireEvent.click(screen.getByText('Pytanie'))
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('should display custom label', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} label="Custom Label" />)

    expect(screen.getByText('Custom Label')).toBeInTheDocument()
  })

  it('should display default label', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    expect(screen.getByText('Priorytet')).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} error="Priority is required" />)

    expect(screen.getByText('Priority is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should not display error when no error prop', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    expect(screen.queryByText('Priority is required')).not.toBeInTheDocument()
  })

  it('should have correct accessibility attributes', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    const infoButton = screen.getByLabelText('Wybierz priorytet: Informacja')
    expect(infoButton).toHaveAttribute('aria-pressed', 'true')
    expect(infoButton).toHaveAttribute('aria-label')
  })

  it('should show checkmark icon for selected priority', () => {
    render(<PrioritySelector value="URGENT" onChange={mockOnChange} />)

    const urgentButton = screen.getByLabelText('Wybierz priorytet: Pilne')
    // Check for the checkmark SVG
    const checkmark = urgentButton.querySelector('svg')
    expect(checkmark).toBeInTheDocument()
  })

  it('should not show checkmark icon for unselected priorities', () => {
    render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    const infoButton = screen.getByLabelText('Wybierz priorytet: Informacja')
    const questionButton = screen.getByLabelText('Wybierz priorytet: Pytanie')
    
    expect(infoButton.querySelector('svg')).toBeInTheDocument()
    expect(questionButton.querySelector('svg')).not.toBeInTheDocument()
  })

  it('should change selection when clicking different priorities', () => {
    const { rerender } = render(<PrioritySelector value="INFO" onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('Pytanie'))
    expect(mockOnChange).toHaveBeenCalledWith('QUESTION')

    // Simulate parent component updating the value
    rerender(<PrioritySelector value="QUESTION" onChange={mockOnChange} />)

    const questionButton = screen.getByLabelText('Wybierz priorytet: Pytanie')
    expect(questionButton).toHaveAttribute('aria-pressed', 'true')
  })
})
