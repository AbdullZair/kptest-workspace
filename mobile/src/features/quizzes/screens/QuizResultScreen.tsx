import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useGetAttemptByIdQuery } from '../api/quizApi'
import { colors, spacing, typography, borderRadius } from '@app/theme'

interface QuizResultScreenNavigationProps {
  navigate: (screen: string) => void
}

interface QuizResultScreenRouteParams {
  quizId: string
  attemptId: string
}

type QuizResultScreenRoute = RouteProp<{ params: QuizResultScreenRouteParams }, 'params'>

export function QuizResultScreen(): JSX.Element {
  const navigation = useNavigation<QuizResultScreenNavigationProps>()
  const route = useRoute<QuizResultScreenRoute>()
  const { quizId, attemptId } = route.params

  const { data: attempt, isLoading } = useGetAttemptByIdQuery({ id: attemptId })

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie wyników...</Text>
      </View>
    )
  }

  if (!attempt) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Nie udało się załadować wyników</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Wróć</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const percentage = Math.round(attempt.percentage)
  const passed = attempt.passed
  const timeSpent = attempt.time_spent_seconds
    ? `${Math.floor(attempt.time_spent_seconds / 60)}m ${attempt.time_spent_seconds % 60}s`
    : '-'

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Result */}
        <View style={styles.header}>
          <Text style={styles.resultIcon}>{passed ? '✓' : '✗'}</Text>
          <Text style={[styles.resultTitle, passed ? styles.passedText : styles.failedText]}>
            {passed ? 'Zaliczony!' : 'Niezaliczony'}
          </Text>
          <Text style={styles.quizTitle}>{attempt.quiz_title}</Text>
        </View>

        {/* Score Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, percentage >= 70 ? styles.passedText : styles.failedText]}>
              {percentage}%
            </Text>
            <Text style={styles.statLabel}>Wynik</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {attempt.score} / {attempt.max_score}
            </Text>
            <Text style={styles.statLabel}>Punkty</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{timeSpent}</Text>
            <Text style={styles.statLabel}>Czas</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%` },
                percentage >= 70 ? styles.progressPassed : styles.progressFailed,
              ]}
            />
          </View>
          <Text style={styles.progressText}>{percentage}%</Text>
        </View>

        {/* Answer Summary */}
        {attempt.answer_selections && attempt.answer_selections.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Podsumowanie</Text>
            {attempt.answer_selections.map((selection, index) => (
              <View
                key={selection.id}
                style={[
                  styles.summaryItem,
                  selection.is_correct ? styles.correctItem : styles.incorrectItem,
                ]}
              >
                <Text style={styles.summaryQuestion}>
                  {index + 1}. {selection.question_text}
                </Text>
                <Text style={styles.summaryPoints}>
                  Punkty: {selection.points_earned}
                </Text>
                <Text style={selection.is_correct ? styles.correctText : styles.incorrectText}>
                  {selection.is_correct ? '✓ Poprawnie' : '✗ Niepoprawnie'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Quizzes')}
        >
          <Text style={styles.doneButtonText}>Gotowe</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = {
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  resultTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  passedText: {
    color: colors.success,
  },
  failedText: {
    color: colors.error,
  },
  quizTitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: colors.textLight,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBackground: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressPassed: {
    backgroundColor: colors.success,
  },
  progressFailed: {
    backgroundColor: colors.error,
  },
  progressText: {
    ...typography.small,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  summaryContainer: {
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  correctItem: {
    backgroundColor: colors.successLight,
  },
  incorrectItem: {
    backgroundColor: colors.errorLight,
  },
  summaryQuestion: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  summaryPoints: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  correctText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
  incorrectText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  doneButtonText: {
    ...typography.button,
    color: colors.white,
  },
}
