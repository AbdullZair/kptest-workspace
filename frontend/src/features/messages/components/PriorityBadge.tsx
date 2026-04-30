import { MessagePriority } from '../types'

interface PriorityBadgeProps {
  priority: MessagePriority
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const priorityConfig: Record<
  MessagePriority,
  {
    bgColor: string
    textColor: string
    borderColor: string
    icon: string
    label: string
  }
> = {
  INFO: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: 'ℹ️',
    label: 'Info',
  },
  QUESTION: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: '❓',
    label: 'Pytanie',
  },
  URGENT: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    icon: '🚨',
    label: 'Pilne',
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

/**
 * PriorityBadge component for displaying message priority
 */
export function PriorityBadge({ priority, showLabel = true, size = 'md' }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  const sizeClass = sizeClasses[size]

  return (
    <span
      aria-label={`Priorytet: ${config.label}`}
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClass} `}
      role="status"
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel ? <span>{config.label}</span> : null}
    </span>
  )
}

export default PriorityBadge
