import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ForcePasswordResetButton } from '../ForcePasswordResetButton'
import * as adminApi from '../../api/adminApi'

jest.mock('../../api/adminApi', () => ({
  useForcePasswordResetMutation: jest.fn(),
}))

describe('ForcePasswordResetButton', () => {
  const mockOnSuccess = jest.fn()
  const mockForcePasswordReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminApi.useForcePasswordResetMutation as jest.Mock).mockReturnValue([
      mockForcePasswordReset,
      { isLoading: false, error: null },
    ])
  })

  it('renders the reset button', () => {
    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    expect(screen.getByText(/resetuj hasło/i)).toBeInTheDocument()
  })

  it('opens modal when button is clicked', () => {
    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    expect(screen.getByText(/wymuś reset hasła/i)).toBeInTheDocument()
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
  })

  it('requires a reason to be entered', async () => {
    const originalAlert = window.alert
    window.alert = jest.fn()

    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))
    fireEvent.click(screen.getByText(/resetuj hasło/i))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Podaj powód resetu hasła')
    })

    window.alert = originalAlert
  })

  it('calls forcePasswordReset with correct data', async () => {
    mockForcePasswordReset.mockResolvedValue({
      user_id: 'user-123',
      message: 'Password reset successfully',
      temporary_password: 'TempPass123!',
    })

    render(
      <ForcePasswordResetButton
        userId="user-123"
        userEmail="test@example.com"
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Security audit' } })

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    await waitFor(() => {
      expect(mockForcePasswordReset).toHaveBeenCalledWith({
        userId: 'user-123',
        body: { reason: 'Security audit' },
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('shows success alert with temporary password', async () => {
    const originalAlert = window.alert
    window.alert = jest.fn()

    mockForcePasswordReset.mockResolvedValue({
      user_id: 'user-123',
      message: 'Password reset successfully',
      temporary_password: 'TempPass123!',
    })

    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test reason' } })

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('TempPass123!'))
    })

    window.alert = originalAlert
  })

  it('shows error message on failure', async () => {
    mockForcePasswordReset.mockRejectedValue(new Error('Reset failed'))

    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test' } })

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    await waitFor(() => {
      expect(screen.queryByText(/błąd/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during reset', () => {
    ;(adminApi.useForcePasswordResetMutation as jest.Mock).mockReturnValue([
      mockForcePasswordReset,
      { isLoading: true, error: null },
    ])

    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test' } })

    expect(screen.getByText(/resetowanie.../i)).toBeInTheDocument()
  })

  it('displays warning about consequences', () => {
    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    expect(screen.getByText(/skutki tej operacji/i)).toBeInTheDocument()
    expect(screen.getByText(/wszystkie sesje/i)).toBeInTheDocument()
    expect(screen.getByText(/nowe hasło/i)).toBeInTheDocument()
    expect(screen.getByText(/tymczasowe hasło/i)).toBeInTheDocument()
  })

  it('closes modal and resets form on cancel', () => {
    render(<ForcePasswordResetButton userId="user-123" userEmail="test@example.com" />)

    fireEvent.click(screen.getByText(/resetuj hasło/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test reason' } })

    fireEvent.click(screen.getByText(/anuluj/i))

    expect(screen.queryByText(/wymuś reset hasła/i)).not.toBeInTheDocument()
  })
})
