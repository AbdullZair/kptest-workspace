import React, { useState, useCallback } from 'react'
import { Card, Checkbox, Radio } from '@shared/components'
import type { QuizQuestion, QuizAnswer } from '../../types/quiz.types'

/**
 * QuestionCard component props
 */
export interface QuestionCardProps {
  question: QuizQuestion
  selectedAnswers: string[]
  onAnswerSelect: (questionId: string, answerIds: string[]) => void
  showResult?: boolean
  disabled?: boolean
}

/**
 * QuestionCard component for displaying quiz questions
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswers,
  onAnswerSelect,
  showResult = false,
  disabled = false,
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedAnswers)

  const handleAnswerChange = useCallback(
    (answerId: string, checked: boolean) => {
      if (disabled) return

      let newSelection: string[]

      if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
        // Single selection - replace current selection
        newSelection = checked ? [answerId] : []
      } else {
        // Multi selection - toggle answer
        if (checked) {
          newSelection = [...localSelection, answerId]
        } else {
          newSelection = localSelection.filter((id) => id !== answerId)
        }
      }

      setLocalSelection(newSelection)
      onAnswerSelect(question.id, newSelection)
    },
    [question.id, question.type, localSelection, onAnswerSelect, disabled]
  )

  const getAnswerStyle = (answer: QuizAnswer): string => {
    if (!showResult) return ''

    const isSelected = localSelection.includes(answer.id)
    const isCorrect = answer.correct

    if (isCorrect) {
      return 'bg-green-50 border-green-500'
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-50 border-red-500'
    }
    return ''
  }

  const getQuestionTypeLabel = (): string => {
    switch (question.type) {
      case 'SINGLE_CHOICE':
        return 'Wybierz jedną odpowiedź'
      case 'MULTI_CHOICE':
        return 'Wybierz wszystkie poprawne odpowiedzi'
      case 'TRUE_FALSE':
        return 'Prawda czy Fałsz'
      default:
        return ''
    }
  }

  return (
    <Card className="p-6 mb-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Pytanie {question.order_index + 1}
          </h3>
          <span className="text-sm text-gray-500">{question.points} pkt</span>
        </div>
        <p className="text-gray-700 mb-2">{question.question}</p>
        <p className="text-sm text-blue-600 italic">{getQuestionTypeLabel()}</p>
      </div>

      <div className="space-y-3">
        {question.answers.map((answer, index) => {
          const isSelected = localSelection.includes(answer.id)
          const isCorrect = showResult && answer.correct
          const isWrong = showResult && isSelected && !answer.correct

          return (
            <div
              key={answer.id}
              className={`
                border rounded-lg p-4 transition-colors
                ${getAnswerStyle(answer)}
                ${!showResult && isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                ${!disabled ? 'cursor-pointer hover:border-gray-300' : ''}
              `}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                {question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' ? (
                  <Radio
                    checked={isSelected}
                    onChange={(e) => handleAnswerChange(answer.id, e.target.checked)}
                    disabled={disabled}
                    className="mt-1"
                  />
                ) : (
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => handleAnswerChange(answer.id, e.target.checked)}
                    disabled={disabled}
                    className="mt-1"
                  />
                )}
                <div className="flex-1">
                  <span className="text-gray-900">{answer.answer}</span>
                  {showResult && isCorrect && (
                    <span className="ml-2 text-green-600 text-sm">✓ Poprawna</span>
                  )}
                  {showResult && isWrong && (
                    <span className="ml-2 text-red-600 text-sm">✗ Niepoprawna</span>
                  )}
                  {showResult && answer.explanation && (
                    <p className="mt-2 text-sm text-gray-600 italic">{answer.explanation}</p>
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
