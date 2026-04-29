import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  useGetQuizForTakingQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAnswersMutation,
} from '../api/quizApi'
import { colors, spacing, typography, borderRadius } from '@app/theme'
import type { QuizQuestion } from '../api/types'

type QuizScreenNavigationProps = NativeStackNavigationProp<
  Record<string, object | undefined>
>;

interface QuizScreenRouteParams {
  quizId: string
  patientId: string
}

type QuizScreenRoute = RouteProp<{ params: QuizScreenRouteParams }, 'params'>

export function QuizScreen(): JSX.Element {
  const navigation = useNavigation<QuizScreenNavigationProps>()
  const route = useRoute<QuizScreenRoute>()
  const { quizId, patientId } = route.params

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map())
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // RTK Query hooks
  const { data: quiz, isLoading, error } = useGetQuizForTakingQuery({ id: quizId })
  const [startAttempt] = useStartQuizAttemptMutation()
  const [submitAnswers] = useSubmitQuizAnswersMutation()

  const handleAnswerSelect = useCallback((questionId: string, answerIds: string[]) => {
    setAnswers((prev) => {
      const newMap = new Map(prev)
      newMap.set(questionId, answerIds)
      return newMap
    })
  }, [])

  const allQuestionsAnswered = answers.size === (quiz?.questions.length || 0)

  const handleStartQuiz = async () => {
    try {
      const result = await startAttempt({ quizId, patientId }).unwrap()
      setAttemptId(result.id)
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się rozpocząć quizu')
    }
  }

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

      const result = await submitAnswers(payload).unwrap()
      navigation.navigate('QuizResult', {
        quizId: quiz.id,
        attemptId: result.id,
      })
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się wysłać odpowiedzi')
      setIsSubmitting(false)
    }
  }

  const goToNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const goToPrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie quizu...</Text>
      </View>
    )
  }

  if (error || !quiz) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Nie udało się załadować quizu</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Wróć</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!attemptId) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>{quiz.title}</Text>
          {quiz.description && (
            <Text style={styles.description}>{quiz.description}</Text>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Pytania: {quiz.questions.length}</Text>
            <Text style={styles.infoText}>Maks. punkty: {quiz.max_score}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Próg zaliczenia: {quiz.pass_threshold}%</Text>
            {quiz.time_limit_seconds && (
              <Text style={styles.infoText}>
                Czas: {Math.floor(quiz.time_limit_seconds / 60)} min
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <Text style={styles.startButtonText}>Rozpocznij Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Pytanie {currentQuestionIndex + 1} z {quiz.questions.length}
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <Text style={styles.pointsText}>{currentQuestion.points} pkt</Text>

          <View style={styles.answersContainer}>
            {currentQuestion.answers.map((answer) => {
              const isSelected = (answers.get(currentQuestion.id) || []).includes(answer.id)
              const isSingleChoice =
                currentQuestion.type === 'SINGLE_CHOICE' ||
                currentQuestion.type === 'TRUE_FALSE'

              return (
                <TouchableOpacity
                  key={answer.id}
                  style={[
                    styles.answerOption,
                    isSelected && styles.answerOptionSelected,
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion.id, [answer.id])}
                >
                  <View
                    style={[
                      styles.answerRadio,
                      isSelected && styles.answerRadioSelected,
                    ]}
                  />
                  <Text style={styles.answerText}>{answer.answer}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Poprzednie</Text>
        </TouchableOpacity>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!allQuestionsAnswered || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitQuiz}
            disabled={!allQuestionsAnswered || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Wysyłanie...' : 'Zakończ'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            <Text style={styles.navButtonText}>Następne</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.small,
    color: colors.textLight,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  startButtonText: {
    ...typography.button,
    color: colors.white,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressText: {
    ...typography.small,
    color: colors.textLight,
  },
  questionCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  questionText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pointsText: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  answersContainer: {
    gap: spacing.md,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  answerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  answerRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  answerRadioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  answerText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  navButtonDisabled: {
    backgroundColor: colors.border,
  },
  navButtonText: {
    ...typography.button,
    color: colors.white,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
  },
})
