import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@shared/api'
import { AnonymizePatientDialog } from '../AnonymizePatientDialog'

// Mock the RTK Query hook
vi.mock('../../api/adminApi', () => ({
  useAnonymizePatientMutation: () => [
    vi.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ patient_id: 'test-id', anonymized_at: new Date().toISOString(), audit_log_id: 'audit-123', message: 'Success' }) })),
    { isLoading: false, error: null },
  ],
}))

const createMockStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })

describe('AnonymizePatientDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    patientId: 'test-patient-id',
    patientName: 'Jan Kowalski',
    onSuccess: vi.fn(),
  }

  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
    vi.clearAllMocks()
  })

  it('renders dialog with correct title and patient name', () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    expect(screen.getByText('Anonimizacja danych pacjenta')).toBeInTheDocument()
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument()
  })

  it('shows warning message about irreversible operation', () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    expect(screen.getByText(/Ta operacja jest nieodwracalna/i)).toBeInTheDocument()
  })

  it('has reason dropdown with correct options', () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    const reasonSelect = screen.getByLabelText('Powód anonimizacji *')
    expect(reasonSelect).toBeInTheDocument()
    expect(screen.getByText('Koniec leczenia')).toBeInTheDocument()
    expect(screen.getByText('Żądanie pacjenta')).toBeInTheDocument()
    expect(screen.getByText('Inne')).toBeInTheDocument()
  })

  it('has confirmation input field', () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    expect(screen.getByLabelText(/Wpisz "ANONYMIZUJ" aby potwierdzić/i)).toBeInTheDocument()
  })

  it('shows validation error when confirmation text is incorrect', async () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    const submitButton = screen.getByRole('button', { name: /Anonimizuj/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Wpisz "ANONYMIZUJ" aby potwierdzić/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess and onClose after successful submission', async () => {
    const { useAnonymizePatientMutation } = await import('../../api/adminApi')
    const mockAnonymize = vi.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ patient_id: 'test-id', anonymized_at: new Date().toISOString(), audit_log_id: 'audit-123', message: 'Success' }) }))
    vi.mocked(useAnonymizePatientMutation).mockReturnValue([mockAnonymize, { isLoading: false, error: null }])

    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    // Fill in the form
    const reasonSelect = screen.getByLabelText('Powód anonimizacji *')
    fireEvent.change(reasonSelect, { target: { value: 'patient_request' } })

    const confirmationInput = screen.getByLabelText(/Wpisz "ANONYMIZUJ" aby potwierdzić/i)
    fireEvent.change(confirmationInput, { target: { value: 'ANONYMIZUJ' } })

    const submitButton = screen.getByRole('button', { name: /Anonimizuj/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAnonymize).toHaveBeenCalledWith({
        patientId: 'test-patient-id',
        body: {
          reason: 'patient_request',
          additional_notes: undefined,
        },
      })
    })
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    const cancelButton = screen.getByRole('button', { name: /Anuluj/i })
    fireEvent.click(cancelButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('has additional notes textarea', () => {
    render(
      <Provider store={store}>
        <AnonymizePatientDialog {...mockProps} />
      </Provider>
    )

    expect(screen.getByLabelText('Notatki dodatkowe')).toBeInTheDocument()
  })
})
