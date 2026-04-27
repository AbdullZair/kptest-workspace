import React from 'react'
import { render, screen } from '@testing-library/react'
import { PriorityBadge } from './PriorityBadge'
import type { MessagePriority } from '../types'

describe('PriorityBadge', () => {
  it('should render INFO priority badge', () => {
    render(<PriorityBadge priority="INFO" />)

    expect(screen.getByText('ℹ️')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Priorytet: Info')
  })

  it('should render QUESTION priority badge', () => {
    render(<PriorityBadge priority="QUESTION" />)

    expect(screen.getByText('❓')).toBeInTheDocument()
    expect(screen.getByText('Pytanie')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Priorytet: Pytanie')
  })

  it('should render URGENT priority badge', () => {
    render(<PriorityBadge priority="URGENT" />)

    expect(screen.getByText('🚨')).toBeInTheDocument()
    expect(screen.getByText('Pilne')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Priorytet: Pilne')
  })

  it('should hide label when showLabel is false', () => {
    const { container } = render(<PriorityBadge priority="INFO" showLabel={false} />)

    expect(screen.getByText('ℹ️')).toBeInTheDocument()
    expect(container.querySelector('span')).not.toHaveTextContent('Info')
  })

  it('should show label by default', () => {
    render(<PriorityBadge priority="INFO" />)

    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('should render with small size', () => {
    const { container } = render(<PriorityBadge priority="INFO" size="sm" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs')
  })

  it('should render with medium size (default)', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm')
  })

  it('should render with large size', () => {
    const { container } = render(<PriorityBadge priority="INFO" size="lg" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base')
  })

  it('should have correct INFO colors', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-300')
  })

  it('should have correct QUESTION colors', () => {
    const { container } = render(<PriorityBadge priority="QUESTION" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-300')
  })

  it('should have correct URGENT colors', () => {
    const { container } = render(<PriorityBadge priority="URGENT" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-300')
  })

  it('should have rounded-full class', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('rounded-full')
  })

  it('should have border class', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('border')
  })

  it('should have font-medium class', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('font-medium')
  })

  it('should have inline-flex layout', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('inline-flex')
  })

  it('should have gap between icon and label', () => {
    const { container } = render(<PriorityBadge priority="INFO" />)

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('gap-1')
  })

  it('should have role status for accessibility', () => {
    render(<PriorityBadge priority="INFO" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should have aria-label with priority label', () => {
    render(<PriorityBadge priority="URGENT" />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Priorytet: Pilne')
  })

  it('should render with all size variants', () => {
    const { container: sm } = render(<PriorityBadge priority="INFO" size="sm" />)
    const { container: md } = render(<PriorityBadge priority="INFO" size="md" />)
    const { container: lg } = render(<PriorityBadge priority="INFO" size="lg" />)

    expect(sm.querySelector('span')).toHaveClass('text-xs')
    expect(md.querySelector('span')).toHaveClass('text-sm')
    expect(lg.querySelector('span')).toHaveClass('text-base')
  })

  it('should render without crashing for all priority types', () => {
    expect(() => render(<PriorityBadge priority="INFO" />)).not.toThrow()
    expect(() => render(<PriorityBadge priority="QUESTION" />)).not.toThrow()
    expect(() => render(<PriorityBadge priority="URGENT" />)).not.toThrow()
  })
})
