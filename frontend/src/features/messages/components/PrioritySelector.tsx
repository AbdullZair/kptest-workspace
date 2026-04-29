import { MessagePriority } from '../types'

interface PrioritySelectorProps {
  value: MessagePriority
  onChange: (priority: MessagePriority) => void
  disabled?: boolean
  label?: string
  error?: string
}

const priorityOptions: {
  value: MessagePriority
  label: string
  icon: string
  description: string
}[] = [
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
      {label ? (
        <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              className={`relative flex flex-col items-center rounded-lg border-2 p-4 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${colorClass} ${isSelected ? 'scale-105 transform shadow-lg' : 'shadow-sm hover:shadow-md'} `}
              aria-pressed={isSelected}
              aria-label={`Wybierz priorytet: ${option.label}`}
            >
              <span className="mb-2 text-2xl" aria-hidden="true">
                {option.icon}
              </span>
              <span className="mb-1 text-sm font-semibold">{option.label}</span>
              <span className="text-center text-xs opacity-80">{option.description}</span>
              {isSelected ? (
                <span
                  className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white"
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default PrioritySelector
