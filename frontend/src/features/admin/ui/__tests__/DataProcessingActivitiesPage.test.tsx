import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@shared/api'
import { DataProcessingActivitiesPage } from '../DataProcessingActivitiesPage'

// Mock the RTK Query hooks
vi.mock('../../api/adminApi', () => ({
  useGetDataProcessingActivitiesQuery: () => ({
    data: {
      content: [
        {
          id: 'activity-1',
          name: 'Przetwarzanie danych pacjentów',
          purpose: 'Realizacja usług medycznych',
          legal_basis: 'CONTRACT',
          categories: ['Dane zdrowotne', 'Dane osobowe'],
          recipients: ['Personel medyczny'],
          retention_period: '5 lat od zakończenia leczenia',
          security_measures: 'Szyfrowanie, kontrola dostępu',
          data_controller: 'Szpital Testowy',
          data_processor: 'Firma IT Sp. z o.o.',
          created_by: 'admin',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCreateDataProcessingActivityMutation: () => [
    vi.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ id: 'new-activity' }) })),
    { isLoading: false, error: null },
  ],
  useUpdateDataProcessingActivityMutation: () => [
    vi.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ id: 'activity-1' }) })),
    { isLoading: false, error: null },
  ],
  useDeleteDataProcessingActivityMutation: () => [
    vi.fn(() => Promise.resolve({ unwrap: () => Promise.resolve() })),
    { isLoading: false, error: null },
  ],
}))

const createMockStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

describe('DataProcessingActivitiesPage', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
    vi.clearAllMocks()
  })

  it('renders page header and title', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    expect(screen.getByText('Rejestr czynności przetwarzania')).toBeInTheDocument()
    expect(
      screen.getByText('Zarządzaj rejestrem czynności przetwarzania danych osobowych')
    ).toBeInTheDocument()
  })

  it('has "Dodaj czynność" button', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    expect(screen.getByRole('button', { name: /Dodaj czynność/i })).toBeInTheDocument()
  })

  it('displays legal basis filter buttons', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    expect(screen.getByText('Wszystkie podstawy')).toBeInTheDocument()
    expect(screen.getByText('Zgoda')).toBeInTheDocument()
    expect(screen.getByText('Umowa')).toBeInTheDocument()
  })

  it('renders table with activity data', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    expect(screen.getByText('Przetwarzanie danych pacjentów')).toBeInTheDocument()
    expect(screen.getByText('Realizacja usług medycznych')).toBeInTheDocument()
    expect(screen.getByText('Szpital Testowy')).toBeInTheDocument()
  })

  it('opens form dialog when "Dodaj czynność" is clicked', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Dodaj czynność/i }))

    expect(screen.getByText('Dodaj czynność przetwarzania')).toBeInTheDocument()
    expect(screen.getByLabelText('Nazwa *')).toBeInTheDocument()
    expect(screen.getByLabelText('Cel przetwarzania *')).toBeInTheDocument()
    expect(screen.getByLabelText('Podstawa prawna *')).toBeInTheDocument()
  })

  it('validates required fields in form', async () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Dodaj czynność/i }))

    const submitButton = screen.getByRole('button', { name: /Dodaj/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Nazwa musi mieć co najmniej 3 znaki')).toBeInTheDocument()
    })
  })

  it('has all required form fields', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Dodaj czynność/i }))

    expect(screen.getByLabelText('Nazwa *')).toBeInTheDocument()
    expect(screen.getByLabelText('Cel przetwarzania *')).toBeInTheDocument()
    expect(screen.getByLabelText('Podstawa prawna *')).toBeInTheDocument()
    expect(screen.getByLabelText('Kategorie danych *')).toBeInTheDocument()
    expect(screen.getByLabelText('Okres przechowywania *')).toBeInTheDocument()
    expect(screen.getByLabelText('Środki bezpieczeństwa *')).toBeInTheDocument()
    expect(screen.getByLabelText('Administrator danych *')).toBeInTheDocument()
    expect(screen.getByLabelText('Procesor danych')).toBeInTheDocument()
  })

  it('closes dialog when cancel is clicked', () => {
    render(
      <Provider store={store}>
        <DataProcessingActivitiesPage />
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Dodaj czynność/i }))
    fireEvent.click(screen.getByRole('button', { name: /Anuluj/i }))

    expect(screen.queryByText('Dodaj czynność przetwarzania')).not.toBeInTheDocument()
  })
})
