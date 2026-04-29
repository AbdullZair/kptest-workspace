import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MessageDelegateModal } from '../MessageDelegateModal'
import * as inboxApi from '../../api/inboxApi'

// Mock the RTK Query hook
jest.mock('../../api/inboxApi', () => ({
  useDelegateThreadMutation: jest.fn(),
}))

describe('MessageDelegateModal', () => {
  const mockOnClose = jest.fn()
  const mockDelegateThread = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(inboxApi.useDelegateThreadMutation as jest.Mock).mockReturnValue([
      mockDelegateThread,
      { isLoading: false, error: null },
    ])
  })

  it('does not render when isOpen is false', () => {
    render(
      <MessageDelegateModal
        isOpen={false}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    expect(screen.queryByText(/deleguj wątek/i)).not.toBeInTheDocument()
  })

  it('renders modal when isOpen is true', () => {
    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    expect(screen.getByText(/deleguj wątek/i)).toBeInTheDocument()
    expect(screen.getByText(/test thread/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/przypisz do/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/komentarz/i)).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    fireEvent.click(screen.getByText(/anuluj/i))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows validation error when assignee is not selected', async () => {
    const originalAlert = window.alert
    window.alert = jest.fn()

    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    fireEvent.click(screen.getByText(/deleguj/i))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Wybierz osobę do przypisania')
    })

    window.alert = originalAlert
  })

  it('calls delegateThread with correct data when form is submitted', async () => {
    mockDelegateThread.mockResolvedValue({})

    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    // Select assignee
    const assigneeSelect = screen.getByLabelText(/przypisz do/i)
    fireEvent.change(assigneeSelect, { target: { value: '1' } })

    // Select status
    const statusSelect = screen.getByLabelText(/status/i)
    fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } })

    // Add comment
    const commentTextarea = screen.getByLabelText(/komentarz/i)
    fireEvent.change(commentTextarea, { target: { value: 'Test comment' } })

    // Submit
    fireEvent.click(screen.getByText(/deleguj/i))

    await waitFor(() => {
      expect(mockDelegateThread).toHaveBeenCalledWith({
        threadId: 'thread-123',
        body: {
          assignee_id: '1',
          status: 'IN_PROGRESS',
          comment: 'Test comment',
        },
      })
    })

    // Verify modal closes and form resets
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows error message when delegation fails', async () => {
    mockDelegateThread.mockRejectedValue(new Error('Delegation failed'))

    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    // Select assignee and submit
    const assigneeSelect = screen.getByLabelText(/przypisz do/i)
    fireEvent.change(assigneeSelect, { target: { value: '1' } })

    fireEvent.click(screen.getByText(/deleguj/i))

    await waitFor(() => {
      expect(screen.queryByText(/błąd:/i)).toBeInTheDocument()
    })
  })

  it('shows loading state when delegating', () => {
    ;(inboxApi.useDelegateThreadMutation as jest.Mock).mockReturnValue([
      mockDelegateThread,
      { isLoading: true, error: null },
    ])

    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    const assigneeSelect = screen.getByLabelText(/przypisz do/i)
    fireEvent.change(assigneeSelect, { target: { value: '1' } })

    expect(screen.getByText(/delegowanie.../i)).toBeInTheDocument()
    expect(screen.getByText(/deleguj/i)).toBeDisabled()
  })

  it('displays all team members as options', () => {
    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    const assigneeSelect = screen.getByLabelText(/przypisz do/i)

    expect(assigneeSelect).toHaveTextContent('Dr. Anna Kowalska')
    expect(assigneeSelect).toHaveTextContent('Piotr Nowak')
    expect(assigneeSelect).toHaveTextContent('Maria Wiśniewska')
    expect(assigneeSelect).toHaveTextContent('Jan Zieliński')
  })

  it('displays all status options', () => {
    render(
      <MessageDelegateModal
        isOpen={true}
        onClose={mockOnClose}
        threadId="thread-123"
        threadTitle="Test Thread"
      />
    )

    const statusSelect = screen.getByLabelText(/status/i)

    expect(statusSelect).toHaveTextContent('Nowy')
    expect(statusSelect).toHaveTextContent('W trakcie')
    expect(statusSelect).toHaveTextContent('Rozwiązany')
    expect(statusSelect).toHaveTextContent('Zamknięty')
  })
})
