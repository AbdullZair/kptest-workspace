import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InboxThreadActions } from '../InboxThreadActions'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@shared/api'

const mockThread = {
  id: 'thread-1',
  project_id: 'project-1',
  project_name: 'Test Project',
  title: 'Test Thread',
  type: 'PATIENT_COMMUNICATION' as const,
  created_at: '2024-01-01T00:00:00Z',
  last_message_at: '2024-01-02T00:00:00Z',
  message_count: 5,
  unread_count: 2,
  status: 'NEW' as const,
  assigned_to: undefined,
  assigned_to_name: undefined,
  created_by: 'user-1',
  created_by_name: 'Test User',
  participants: ['user-1', 'user-2'],
}

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

describe('InboxThreadActions', () => {
  const mockOnActionComplete = vi.fn()

  beforeEach(() => {
    mockOnActionComplete.mockClear()
  })

  it('renders actions button', () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    expect(screen.getByText('Akcje')).toBeInTheDocument()
  })

  it('opens dropdown menu on button click', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Priorytet')).toBeInTheDocument()
      expect(screen.getByText('Przypisz do')).toBeInTheDocument()
    })
  })

  it('shows status options in dropdown', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('Nowy')).toBeInTheDocument()
      expect(screen.getByText('W trakcie')).toBeInTheDocument()
      expect(screen.getByText('Rozwiązany')).toBeInTheDocument()
      expect(screen.getByText('Zamknięty')).toBeInTheDocument()
    })
  })

  it('shows priority options in dropdown', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('Niski')).toBeInTheDocument()
      expect(screen.getByText('Średni')).toBeInTheDocument()
      expect(screen.getByText('Wysoki')).toBeInTheDocument()
      expect(screen.getByText('Pilny')).toBeInTheDocument()
    })
  })

  it('shows team members in assignee section', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('Dr. Anna Kowalska')).toBeInTheDocument()
      expect(screen.getByText('Piotr Nowak')).toBeInTheDocument()
      expect(screen.getByText('Maria Wiśniewska')).toBeInTheDocument()
      expect(screen.getByText('Jan Zieliński')).toBeInTheDocument()
    })
  })

  it('shows current status with checkmark', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      const statusRow = screen.getByText('Nowy').closest('button')
      expect(statusRow).toContainElement(screen.getByText('✓'))
    })
  })

  it('calls onActionComplete after status change', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('W trakcie')).toBeInTheDocument()
    })

    const inProgressOption = screen.getByText('W trakcie').closest('button')
    if (inProgressOption) {
      fireEvent.click(inProgressOption)
    }

    await waitFor(() => {
      expect(mockOnActionComplete).toHaveBeenCalled()
    })
  })

  it('calls onActionComplete after priority change', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('Wysoki')).toBeInTheDocument()
    })

    const highPriorityOption = screen.getByText('Wysoki').closest('button')
    if (highPriorityOption) {
      fireEvent.click(highPriorityOption)
    }

    await waitFor(() => {
      expect(mockOnActionComplete).toHaveBeenCalled()
    })
  })

  it('calls onActionComplete after assignee change', async () => {
    renderWithProviders(
      <InboxThreadActions thread={mockThread} onActionComplete={mockOnActionComplete} />
    )

    const actionsButton = screen.getByText('Akcje')
    fireEvent.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText('Dr. Anna Kowalska')).toBeInTheDocument()
    })

    const assigneeOption = screen.getByText('Dr. Anna Kowalska').closest('button')
    if (assigneeOption) {
      fireEvent.click(assigneeOption)
    }

    await waitFor(() => {
      expect(mockOnActionComplete).toHaveBeenCalled()
    })
  })
})
