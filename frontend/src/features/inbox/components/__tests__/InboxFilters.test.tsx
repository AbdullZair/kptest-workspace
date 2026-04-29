import { render, screen, fireEvent } from '@testing-library/react'
import { InboxFilters } from '../InboxFilters'

describe('InboxFilters', () => {
  const mockOnFilterChange = jest.fn()
  const mockOnReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all filter inputs', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    expect(screen.getByLabelText(/projekt/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/przypisany do/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priorytet/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tylko nieprzeczytane/i)).toBeInTheDocument()
  })

  it('displays "Resetuj filtry" button when filters are active', () => {
    render(
      <InboxFilters
        projectId="1"
        status="NEW"
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    )

    expect(screen.getByText(/resetuj filtry/i)).toBeInTheDocument()
  })

  it('does not display "Resetuj filtry" button when no filters are active', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    expect(screen.queryByText(/resetuj filtry/i)).not.toBeInTheDocument()
  })

  it('calls onFilterChange when project is selected', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const projectSelect = screen.getByLabelText(/projekt/i)
    fireEvent.change(projectSelect, { target: { value: 'project-123' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith({ projectId: 'project-123' })
  })

  it('calls onFilterChange when status is selected', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const statusSelect = screen.getByLabelText(/status/i)
    fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith({ status: 'IN_PROGRESS' })
  })

  it('calls onFilterChange when assignee is selected', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const assigneeSelect = screen.getByLabelText(/przypisany do/i)
    fireEvent.change(assigneeSelect, { target: { value: 'user-123' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith({ assignedTo: 'user-123' })
  })

  it('calls onFilterChange when priority is selected', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const prioritySelect = screen.getByLabelText(/priorytet/i)
    fireEvent.change(prioritySelect, { target: { value: 'HIGH' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith({ priority: 'HIGH' })
  })

  it('calls onFilterChange when unread checkbox is toggled', () => {
    render(<InboxFilters onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const unreadCheckbox = screen.getByLabelText(/tylko nieprzeczytane/i)
    fireEvent.click(unreadCheckbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith({ isUnread: true })
  })

  it('calls onReset when reset button is clicked', () => {
    render(<InboxFilters projectId="1" onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/resetuj filtry/i)
    fireEvent.click(resetButton)

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('resets page to 0 when filter changes', () => {
    render(<InboxFilters page={5} onFilterChange={mockOnFilterChange} onReset={mockOnReset} />)

    const projectSelect = screen.getByLabelText(/projekt/i)
    fireEvent.change(projectSelect, { target: { value: 'new-project' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ page: 0 }))
  })
})
