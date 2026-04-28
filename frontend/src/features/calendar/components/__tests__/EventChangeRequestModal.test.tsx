import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EventChangeRequestModal } from '../EventChangeRequestModal'

describe('EventChangeRequestModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const defaultProps = {
    eventId: 'test-event-id',
    eventTitle: 'Test Event',
    eventDate: '2024-05-15T10:00:00Z',
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSubmit.mockClear()
  })

  it('should not render when isOpen is false', () => {
    render(<EventChangeRequestModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Zmień termin wydarzenia')).not.toBeInTheDocument()
  })

  it('should render modal when isOpen is true', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    expect(screen.getByText('Zmień termin wydarzenia')).toBeInTheDocument()
    expect(screen.getByText('Zaproponuj nowy termin dla wydarzenia')).toBeInTheDocument()
  })

  it('should display event information', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText(/Obecny termin:/)).toBeInTheDocument()
  })

  it('should have proposed date input', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    const dateInput = screen.getByLabelText(/Proponowany nowy termin/)
    expect(dateInput).toBeInTheDocument()
  })

  it('should have reason textarea', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    const reasonInput = screen.getByLabelText(/Powód zmiany/)
    expect(reasonInput).toBeInTheDocument()
  })

  it('should show info about attempt limit', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    expect(screen.getByText(/Masz maksymalnie 3 próby/)).toBeInTheDocument()
  })

  it('should call onClose when cancel button clicked', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    const cancelButton = screen.getByText('Anuluj')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onSubmit with form data when submitted', async () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    const dateInput = screen.getByLabelText(/Proponowany nowy termin/)
    const reasonInput = screen.getByLabelText(/Powód zmiany/)
    const submitButton = screen.getByText('Wyślij prośbę')

    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

    fireEvent.change(dateInput, { target: { value: futureDate } })
    fireEvent.change(reasonInput, { target: { value: 'Need to reschedule' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        proposedDate: futureDate,
        reason: 'Need to reschedule',
      })
    })
  })

  it('should reset form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined)

    render(<EventChangeRequestModal {...defaultProps} />)

    const dateInput = screen.getByLabelText(/Proponowany nowy termin/)
    const reasonInput = screen.getByLabelText(/Powód zmiany/)
    const submitButton = screen.getByText('Wyślij prośbę')

    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

    fireEvent.change(dateInput, { target: { value: futureDate } })
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show error message on submission failure', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Submission failed'))

    render(<EventChangeRequestModal {...defaultProps} />)

    const dateInput = screen.getByLabelText(/Proponowany nowy termin/)
    const reasonInput = screen.getByLabelText(/Powód zmiany/)
    const submitButton = screen.getByText('Wyślij prośbę')

    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

    fireEvent.change(dateInput, { target: { value: futureDate } })
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Nie udało się wysłać prośby/)).toBeInTheDocument()
    })
  })

  it('should show loading state while submitting', async () => {
    mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<EventChangeRequestModal {...defaultProps} />)

    const dateInput = screen.getByLabelText(/Proponowany nowy termin/)
    const reasonInput = screen.getByLabelText(/Powód zmiany/)
    const submitButton = screen.getByText('Wyślij prośbę')

    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

    fireEvent.change(dateInput, { target: { value: futureDate } })
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Wysyłanie...')).toBeInTheDocument()
    expect(screen.getByText('Anuluj')).toBeDisabled()
  })

  it('should close modal and reset form on cancel', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    const dateInput = screen.getByLabelText(/Proponowany nowy termin/)
    const reasonInput = screen.getByLabelText(/Powód zmiany/)

    fireEvent.change(dateInput, { target: { value: '2024-06-01T10:00' } })
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } })

    const cancelButton = screen.getByText('Anuluj')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should have proper accessibility attributes', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should have required fields marked', () => {
    render(<EventChangeRequestModal {...defaultProps} />)

    expect(screen.getByText('Proponowany nowy termin *')).toBeInTheDocument()
    expect(screen.getByText('Powód zmiany *')).toBeInTheDocument()
  })
})
