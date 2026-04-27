import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChangePasswordDialog } from '../ChangePasswordDialog'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@shared/api'

// Mock useAuth hook
vi.mock('@features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    clearAuth: vi.fn(),
  }),
}))

const createTestStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore()
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  }
}

describe('ChangePasswordDialog', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('renders dialog when isOpen is true', () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    expect(screen.getByText('Zmień hasło')).toBeInTheDocument()
    expect(screen.getByText('Po zmianie hasła zostaniesz wylogowany')).toBeInTheDocument()
  })

  it('does not render dialog when isOpen is false', () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={false} onClose={mockOnClose} />
    )

    expect(screen.queryByText('Zmień hasło')).not.toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const submitButton = screen.getByText('Zmień hasło')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Podaj obecne hasło')).toBeInTheDocument()
      expect(screen.getByText('Hasło musi mieć co najmniej 12 znaków')).toBeInTheDocument()
    })
  })

  it('shows validation error for password too short', async () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const currentPassword = screen.getByLabelText('Obecne hasło')
    const newPassword = screen.getByLabelText('Nowe hasło')
    const confirmNewPassword = screen.getByLabelText('Potwierdź nowe hasło')

    fireEvent.change(currentPassword, { target: { value: 'OldPassword123!' } })
    fireEvent.change(newPassword, { target: { value: 'short' } })
    fireEvent.change(confirmNewPassword, { target: { value: 'short' } })

    const submitButton = screen.getByText('Zmień hasło')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Hasło musi mieć co najmniej 12 znaków')).toBeInTheDocument()
    })
  })

  it('shows validation error for missing uppercase letter', async () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const newPassword = screen.getByLabelText('Nowe hasło')
    fireEvent.change(newPassword, { target: { value: 'newpassword123!' } })

    const submitButton = screen.getByText('Zmień hasło')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Hasło musi zawierać wielką literę')).toBeInTheDocument()
    })
  })

  it('shows validation error for passwords not matching', async () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const newPassword = screen.getByLabelText('Nowe hasło')
    const confirmNewPassword = screen.getByLabelText('Potwierdź nowe hasło')

    fireEvent.change(newPassword, { target: { value: 'NewPassword123!' } })
    fireEvent.change(confirmNewPassword, { target: { value: 'DifferentPassword456!' } })

    const submitButton = screen.getByText('Zmień hasło')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Hasła nie są identyczne')).toBeInTheDocument()
    })
  })

  it('shows validation error for new password same as current', async () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const currentPassword = screen.getByLabelText('Obecne hasło')
    const newPassword = screen.getByLabelText('Nowe hasło')
    const confirmNewPassword = screen.getByLabelText('Potwierdź nowe hasło')

    fireEvent.change(currentPassword, { target: { value: 'SamePassword123!' } })
    fireEvent.change(newPassword, { target: { value: 'SamePassword123!' } })
    fireEvent.change(confirmNewPassword, { target: { value: 'SamePassword123!' } })

    const submitButton = screen.getByText('Zmień hasło')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Nowe hasło musi być inne niż obecne')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const currentPassword = screen.getByLabelText('Obecne hasło')
    const newPassword = screen.getByLabelText('Nowe hasło')
    const confirmNewPassword = screen.getByLabelText('Potwierdź nowe hasło')

    fireEvent.change(currentPassword, { target: { value: 'OldPassword123!' } })
    fireEvent.change(newPassword, { target: { value: 'NewPassword456!' } })
    fireEvent.change(confirmNewPassword, { target: { value: 'NewPassword456!' } })

    const submitButton = screen.getByText('Zmień hasło')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /zmień hasło/i })).toBeDisabled()
    })
  })

  it('closes dialog on cancel button click', () => {
    renderWithProviders(
      <ChangePasswordDialog isOpen={true} onClose={mockOnClose} />
    )

    const cancelButton = screen.getByText('Anuluj')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
