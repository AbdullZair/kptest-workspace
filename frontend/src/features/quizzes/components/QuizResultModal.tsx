import React from 'react'
import { Modal, Button, ProgressBar } from '@shared/components'
import type { QuizAttempt } from '../../types/quiz.types'

/**
 * QuizResultModal component props
 */
export interface QuizResultModalProps {
  isOpen: boolean
  onClose: () => void
  attempt: QuizAttempt | null
  onRetry?: () => void
  showDetails?: boolean
}

/**
 * QuizResultModal component for displaying quiz results
 */
export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  isOpen,
  onClose,
  attempt,
  onRetry,
  showDetails = true,
}) => {
  if (!attempt) return null

  const percentage = Math.round(attempt.percentage)
  const passed = attempt.passed
  const timeSpent = attempt.time_spent_seconds
    ? `${Math.floor(attempt.time_spent_seconds / 60)}m ${attempt.time_spent_seconds % 60}s`
    : '-'

  const getScoreColor = (): string => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBarColor = (): string => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Wyniki Quizu">
      <div className="p-6">
        {/* Header Result */}
        <div className="text-center mb-6">
          <div
            className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}
          >
            {passed ? '✓ Zaliczony!' : '✗ Niezaliczony'}
          </div>
          <p className="text-gray-600">{attempt.quiz_title}</p>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${getScoreColor()}`}>{percentage}%</div>
            <div className="text-sm text-gray-600">Wynik</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {attempt.score} / {attempt.max_score}
            </div>
            <div className="text-sm text-gray-600">Punkty</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{timeSpent}</div>
            <div className="text-sm text-gray-600">Czas</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Postęp</span>
            <span className={`font-semibold ${getScoreColor()}`}>{percentage}%</span>
          </div>
          <ProgressBar value={percentage} color={getProgressBarColor()} />
        </div>

        {/* Answer Summary */}
        {showDetails && attempt.answer_selections && attempt.answer_selections.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Podsumowanie odpowiedzi</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attempt.answer_selections.map((selection, index) => (
                <div
                  key={selection.id}
                  className={`p-3 rounded-lg ${
                    selection.is_correct ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {index + 1}. {selection.question_text}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Zdobyte punkty: {selection.points_earned}
                      </p>
                    </div>
                    <span
                      className={`text-lg ${
                        selection.is_correct ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {selection.is_correct ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {onRetry && !passed && (
            <Button variant="secondary" onClick={onRetry}>
              Spróbuj ponownie
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    </Modal>
  )
}
