import React, { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, PageLoader, Alert } from '@shared/components'
import { QuestionCard } from '../components/QuestionCard'
import { QuizResultModal } from '../components/QuizResultModal'
import {
  useGetQuizForTakingQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAnswersMutation,
  useGetAttemptsByPatientQuery,
} from '../api/quizApi'

/**
 * QuizPage Component
 *
 * Patient-facing page for taking educational quizzes
 */
export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Mock patient ID - in real app, get from auth context
  const patientId = '00000000-0000-0000-0000-000000000000'

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // RTK Query hooks
  const {
    data: quiz,
    isLoading: isLoadingQuiz,
    error,
  } = useGetQuizForTakingQuery({ id: id! }, { skip: !id })
  const [startAttempt] = useStartQuizAttemptMutation()
  const [submitAnswers] = useSubmitQuizAnswersMutation()
  const { data: attempts } = useGetAttemptsByPatientQuery({ patientId })

  // Handle answer selection
  const handleAnswerSelect = useCallback((questionId: string, answerIds: string[]) => {
    setAnswers((prev) => {
      const newMap = new Map(prev)
      newMap.set(questionId, answerIds)
      return newMap
    })
  }, [])

  // Check if all questions are answered
  const allQuestionsAnswered = useMemo(() => {
    if (!quiz?.questions) return false
    return quiz.questions.every((q) => answers.has(q.id) && answers.get(q.id)!.length > 0)
  }, [quiz, answers])

  // Start quiz attempt
  const handleStartQuiz = async () => {
    try {
      const result = await startAttempt({ quizId: id!, patientId }).unwrap()
      setAttemptId(result.id)
    } catch (err) {
      console.error('Failed to start quiz attempt:', err)
    }
  }

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!quiz || !attemptId) return

    setIsSubmitting(true)
    try {
      const payload = {
        quiz_id: quiz.id,
        patient_id: patientId,
        answers: quiz.questions.map((q) => ({
          question_id: q.id,
          selected_answer_ids: answers.get(q.id) || [],
        })),
      }

      await submitAnswers(payload).unwrap()
      setShowResults(true)
    } catch (err) {
      console.error('Failed to submit quiz:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation
  const goToPrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  // Loading state
  if (isLoadingQuiz) {
    return <PageLoader size="lg" text="Ładowanie quizu..." />
  }

  if (error || !quiz) {
    return (
      <Alert title="Błąd ładowania quizu" variant="error">
        Nie udało się załadować quizu. Spróbuj ponownie później.
      </Alert>
    )
  }

  // Already completed
  const lastAttempt = attempts?.[0]
  if (lastAttempt?.completed_at && !showResults) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <div className="py-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Już rozwiązałeś ten quiz</h2>
            <p className="mb-6 text-gray-600">
              Twój ostatni wynik: {Math.round(lastAttempt.percentage)}%
            </p>
            <Button variant="primary" onClick={() => navigate('/quizzes')}>
              Powrót do quizów
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{quiz.title}</h1>
        {quiz.description ? <p className="mb-4 text-gray-600">{quiz.description}</p> : null}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            Pytania: {quiz.questions.length} | Maksymalna liczba punktów: {quiz.max_score}
          </span>
          <span>Próg zaliczenia: {quiz.pass_threshold}%</span>
          {quiz.time_limit_seconds ? (
            <span>Czas: {Math.floor(quiz.time_limit_seconds / 60)} min</span>
          ) : null}
        </div>
      </div>

      {/* Start Button */}
      {!attemptId && (
        <Card className="mb-6 p-6 text-center">
          <p className="mb-4 text-gray-700">Rozpocznij quiz, aby sprawdzić swoją wiedzę.</p>
          <Button size="lg" variant="primary" onClick={handleStartQuiz}>
            Rozpocznij Quiz
          </Button>
        </Card>
      )}

      {/* Questions */}
      {attemptId && quiz.questions.length > 0 ? (
        <>
          {quiz.questions[currentQuestionIndex] ? (
            <QuestionCard
              disabled={isSubmitting}
              question={quiz.questions[currentQuestionIndex]}
              selectedAnswers={answers.get(quiz.questions[currentQuestionIndex].id) || []}
              onAnswerSelect={handleAnswerSelect}
            />
          ) : null}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              disabled={currentQuestionIndex === 0}
              variant="secondary"
              onClick={goToPrevious}
            >
              Poprzednie
            </Button>

            <div className="text-sm text-gray-600">
              Pytanie {currentQuestionIndex + 1} z {quiz.questions.length}
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                disabled={!allQuestionsAnswered || isSubmitting}
                variant="primary"
                onClick={handleSubmitQuiz}
              >
                {isSubmitting ? 'Wysyłanie...' : 'Zakończ i sprawdź'}
              </Button>
            ) : (
              <Button variant="primary" onClick={goToNext}>
                Następne
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600'
                    : quiz.questions[index] && answers.has(quiz.questions[index].id)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}

      {/* Result Modal */}
      {showResults && attemptId ? (
        <QuizResultModal attempt={null} isOpen={showResults} onClose={() => navigate('/quizzes')} />
      ) : null}
    </div>
  )
}
