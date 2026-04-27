import React from 'react'
import { MessagePriority } from '../types'

interface PrioritySelectorProps {
  value: MessagePriority
  onChange: (priority: MessagePriority) => void
  disabled?: boolean
  label?: string
  error?: string
}

const priorityOptions: { value: MessagePriority; label: string; icon: string; description: string }[] = [
  {
    value: 'INFO',
    label: 'Informacja',
    icon: 'ℹ️',
    description: 'Zwykła wiadomość informacyjna',
  },
  {
    value: 'QUESTION',
    label: 'Pytanie',
    icon: '❓',
    description: 'Pytanie wymagające odpowiedzi',
  },
  {
    value: 'URGENT',
    label: 'Pilne',
    icon: '🚨',
    description: 'Sprawa wymagająca natychmiastowej uwagi',
  },
]

const priorityColors: Record<MessagePriority, string> = {
  INFO: 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200',
  QUESTION: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200',
  URGENT: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200',
}

const prioritySelectedColors: Record<MessagePriority, string> = {
  INFO: 'bg-blue-500 border-blue-600 text-white ring-2 ring-blue-300',
  QUESTION: 'bg-yellow-500 border-yellow-600 text-white ring-2 ring-yellow-300',
  URGENT: 'bg-red-500 border-red-600 text-white ring-2 ring-red-300',
}

/**
 * PrioritySelector component for selecting message priority
 */
export function PrioritySelector({
  value,
  onChange,
  disabled = false,
  label = 'Priorytet',
  error,
}: PrioritySelectorProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {priorityOptions.map((option) => {
          const isSelected = value === option.value
          const colorClass = isSelected
            ? prioritySelectedColors[option.value]
            : priorityColors[option.value]
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center p-4 rounded-lg border-2 
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${colorClass}
                ${isSelected ? 'transform scale-105 shadow-lg' : 'shadow-sm hover:shadow-md'}
              `}
              aria-pressed={isSelected}
              aria-label={`Wybierz priorytet: ${option.label}`}
            >
              <span className="text-2xl mb-2" aria-hidden="true">
                {option.icon}
              </span>
              <span className="font-semibold text-sm mb-1">
                {option.label}
              </span>
              <span className="text-xs text-center opacity-80">
                {option.description}
              </span>
              {isSelected && (
                <span
                  className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg className="w-3 h-3 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default PrioritySelector
