import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@shared/api'
import { PendingVerificationsPage } from '../PendingVerificationsPage'

const approveMock = vi.fn()
const rejectMock = vi.fn()
const refetchMock = vi.fn()

const baseRow = {
  patient_id: 'p-1',
  first_name: 'Anna',
  last_name: 'Nowak',
  pesel_masked: '*******1234',
  email: 'anna@test.local',
  phone: '+48123456789',
  verification_status: 'PENDING' as const,
  his_patient_id: undefined,
  created_at: '2026-04-20T10:00:00Z',
}

vi.mock('../../api/adminApi', () => ({
  useGetPendingVerificationsQuery: () => ({
    data: {
      content: [baseRow],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    },
    isLoading: false,
    error: null,
    refetch: refetchMock,
  }),
  useApproveVerificationMutation: () => [
    approveMock,
    { isLoading: false, error: null },
  ],
  useRejectVerificationMutation: () => [
    rejectMock,
    { isLoading: false, error: null },
  ],
}))

const createMockStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

describe('PendingVerificationsPage (US-NH-01)', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
    approveMock.mockReset()
    rejectMock.mockReset()
    refetchMock.mockReset()
    approveMock.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    rejectMock.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  const setup = () =>
    render(
      <Provider store={store}>
        <PendingVerificationsPage />
      </Provider>
    )

  it('renders the pending verifications table with patient row', () => {
    setup()
    expect(screen.getByTestId('pending-verifications-table')).toBeInTheDocument()
    expect(screen.getByTestId('pending-row-p-1')).toBeInTheDocument()
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument()
    expect(screen.getByText('*******1234')).toBeInTheDocument()
  })

  it('exposes per-row action buttons with stable test ids', () => {
    setup()
    expect(screen.getByTestId('verify-his-p-1')).toBeInTheDocument()
    expect(screen.getByTestId('manual-approve-p-1')).toBeInTheDocument()
    expect(screen.getByTestId('reject-p-1')).toBeInTheDocument()
  })

  it('opens HIS modal and submits with cart number', async () => {
    setup()
    fireEvent.click(screen.getByTestId('verify-his-p-1'))
    expect(screen.getByTestId('his-modal')).toBeInTheDocument()

    const cartInput = screen.getByTestId('his-cart-input') as HTMLInputElement
    fireEvent.change(cartInput, { target: { value: 'CART-001' } })
    fireEvent.click(screen.getByTestId('confirm-his'))

    await waitFor(() => {
      expect(approveMock).toHaveBeenCalledWith({
        patientId: 'p-1',
        body: { method: 'HIS', his_cart_number: 'CART-001' },
      })
    })
  })

  it('disables HIS confirm when cart number is empty', () => {
    setup()
    fireEvent.click(screen.getByTestId('verify-his-p-1'))
    const confirm = screen.getByTestId('confirm-his') as HTMLButtonElement
    expect(confirm).toBeDisabled()
  })

  it('opens manual modal and rejects too-short reasons via disabled confirm', () => {
    setup()
    fireEvent.click(screen.getByTestId('manual-approve-p-1'))
    expect(screen.getByTestId('manual-modal')).toBeInTheDocument()

    const reason = screen.getByTestId('manual-reason-input') as HTMLTextAreaElement
    fireEvent.change(reason, { target: { value: 'too short' } })
    expect(screen.getByTestId('confirm-manual')).toBeDisabled()
  })

  it('submits manual approval with valid reason', async () => {
    setup()
    fireEvent.click(screen.getByTestId('manual-approve-p-1'))
    const reason = screen.getByTestId('manual-reason-input') as HTMLTextAreaElement
    fireEvent.change(reason, {
      target: { value: 'On-site identity verified with passport' },
    })
    fireEvent.click(screen.getByTestId('confirm-manual'))

    await waitFor(() => {
      expect(approveMock).toHaveBeenCalledWith({
        patientId: 'p-1',
        body: { method: 'MANUAL', reason: 'On-site identity verified with passport' },
      })
    })
  })

  it('submits rejection with valid reason', async () => {
    setup()
    fireEvent.click(screen.getByTestId('reject-p-1'))
    const reason = screen.getByTestId('reject-reason-input') as HTMLTextAreaElement
    fireEvent.change(reason, {
      target: { value: 'PESEL does not match HIS records' },
    })
    fireEvent.click(screen.getByTestId('confirm-reject'))

    await waitFor(() => {
      expect(rejectMock).toHaveBeenCalledWith({
        patientId: 'p-1',
        body: { reason: 'PESEL does not match HIS records' },
      })
    })
  })

  it('disables reject confirm when reason is too short', () => {
    setup()
    fireEvent.click(screen.getByTestId('reject-p-1'))
    const reason = screen.getByTestId('reject-reason-input') as HTMLTextAreaElement
    fireEvent.change(reason, { target: { value: 'short' } })
    expect(screen.getByTestId('confirm-reject')).toBeDisabled()
  })
})
