import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Clear2faButton } from '../Clear2faButton'
import * as adminApi from '../../api/adminApi'

jest.mock('../../api/adminApi', () => ({
  useClear2faMutation: jest.fn(),
}))

describe('Clear2faButton', () => {
  const mockOnSuccess = jest.fn()
  const mockClear2fa = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminApi.useClear2faMutation as jest.Mock).mockReturnValue([
      mockClear2fa,
      { isLoading: false, error: null },
    ])
  })

  it('renders the clear 2FA button', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    expect(screen.getByText(/usuń 2fa/i)).toBeInTheDocument()
  })

  it('is disabled when 2FA is not enabled', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="NURSE"
        twoFactorEnabled={false}
      />
    )

    expect(screen.getByText(/usuń 2fa/i)).toBeDisabled()
  })

  it('opens modal when button is clicked', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    expect(screen.getByText(/usuń konfigurację 2fa/i)).toBeInTheDocument()
  })

  it('requires a reason to be entered', async () => {
    const originalAlert = window.alert
    window.alert = jest.fn()

    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))
    fireEvent.click(screen.getByText(/usuń 2fa/i))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Podaj powód usunięcia konfiguracji 2FA')
    })

    window.alert = originalAlert
  })

  it('calls clear2fa with correct data', async () => {
    mockClear2fa.mockResolvedValue({
      user_id: 'user-123',
      message: '2FA cleared successfully',
    })

    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="NURSE"
        twoFactorEnabled={true}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'User lost phone' } })

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    await waitFor(() => {
      expect(mockClear2fa).toHaveBeenCalledWith({
        userId: 'user-123',
        body: { reason: 'User lost phone' },
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('shows warning for roles requiring 2FA', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    expect(screen.getByText(/uwaga:/i)).toBeInTheDocument()
    expect(screen.getByText(/rola doctor wymaga włączonego 2fa/i)).toBeInTheDocument()
  })

  it('does not show 2FA warning for roles not requiring 2FA', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="NURSE"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    expect(screen.queryByText(/uwaga:/i)).not.toBeInTheDocument()
  })

  it('lists consequences of clearing 2FA', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    expect(screen.getByText(/skutki tej operacji/i)).toBeInTheDocument()
    expect(screen.getByText(/sekret 2fa zostanie usunięty/i)).toBeInTheDocument()
    expect(screen.getByText(/kody zapasowe/i)).toBeInTheDocument()
    expect(screen.getByText(/uwierzytelnianie dwuskładnikowe/i)).toBeInTheDocument()
  })

  it('shows loading state during clear', () => {
    ;(adminApi.useClear2faMutation as jest.Mock).mockReturnValue([
      mockClear2fa,
      { isLoading: true, error: null },
    ])

    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test' } })

    expect(screen.getByText(/usuwanie.../i)).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    mockClear2fa.mockRejectedValue(new Error('Clear failed'))

    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test' } })

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    await waitFor(() => {
      expect(screen.queryByText(/błąd/i)).toBeInTheDocument()
    })
  })

  it('closes modal and resets form on cancel', () => {
    render(
      <Clear2faButton
        userId="user-123"
        userEmail="test@example.com"
        userRole="DOCTOR"
        twoFactorEnabled={true}
      />
    )

    fireEvent.click(screen.getByText(/usuń 2fa/i))

    const reasonTextarea = screen.getByLabelText(/powód/i)
    fireEvent.change(reasonTextarea, { target: { value: 'Test reason' } })

    fireEvent.click(screen.getByText(/anuluj/i))

    expect(screen.queryByText(/usuń konfigurację 2fa/i)).not.toBeInTheDocument()
  })
})
