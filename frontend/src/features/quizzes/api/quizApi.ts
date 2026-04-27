import { api } from '@shared/api'
import type { Quiz, QuizAttempt, QuizFormData, SubmitQuizAnswers } from '../types/quiz.types'

export const quizzesApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Get all quizzes for a project
    getQuizzesByProject: build.query<Quiz[], { projectId: string }>({
      query: ({ projectId }) => `/api/v1/quizzes?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Quizzes' as const, id })),
              { type: 'Quizzes' as const, id: 'LIST' },
            ]
          : [{ type: 'Quizzes' as const, id: 'LIST' }],
    }),

    // Get active quizzes for a project
    getActiveQuizzes: build.query<Quiz[], { projectId: string }>({
      query: ({ projectId }) => `/api/v1/quizzes/active?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Quizzes' as const, id })),
              { type: 'Quizzes' as const, id: 'LIST' },
            ]
          : [{ type: 'Quizzes' as const, id: 'LIST' }],
    }),

    // Get quiz by ID
    getQuizById: build.query<Quiz, { id: string }>({
      query: ({ id }) => `/api/v1/quizzes/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: 'Quizzes', id }],
    }),

    // Get quiz for taking
    getQuizForTaking: build.query<Quiz, { id: string }>({
      query: ({ id }) => `/api/v1/quizzes/${id}/take`,
    }),

    // Create quiz
    createQuiz: build.mutation<Quiz, QuizFormData>({
      query: (quiz) => ({
        url: '/api/v1/quizzes',
        method: 'POST',
        body: quiz,
      }),
      invalidatesTags: [{ type: 'Quizzes', id: 'LIST' }],
    }),

    // Update quiz
    updateQuiz: build.mutation<Quiz, { id: string; quiz: QuizFormData }>({
      query: ({ id, quiz }) => ({
        url: `/api/v1/quizzes/${id}`,
        method: 'PUT',
        body: quiz,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Quizzes', id }],
    }),

    // Delete quiz
    deleteQuiz: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Quizzes', id: 'LIST' }],
    }),

    // Activate quiz
    activateQuiz: build.mutation<Quiz, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/quizzes/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Quizzes', id }],
    }),

    // Deactivate quiz
    deactivateQuiz: build.mutation<Quiz, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/quizzes/${id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Quizzes', id }],
    }),

    // Start quiz attempt
    startQuizAttempt: build.mutation<QuizAttempt, { quizId: string; patientId: string }>({
      query: ({ quizId, patientId }) => ({
        url: `/api/v1/quizzes/${quizId}/attempts?patientId=${patientId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'QuizAttempts', id: 'LIST' }],
    }),

    // Submit quiz answers
    submitQuizAnswers: build.mutation<QuizAttempt, SubmitQuizAnswers>({
      query: (answers) => ({
        url: '/api/v1/quizzes/attempts/submit',
        method: 'POST',
        body: answers,
      }),
      invalidatesTags: [{ type: 'QuizAttempts', id: 'LIST' }],
    }),

    // Get attempts for a patient
    getAttemptsByPatient: build.query<QuizAttempt[], { patientId: string }>({
      query: ({ patientId }) => `/api/v1/quizzes/attempts/patient/${patientId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'QuizAttempts' as const, id })),
              { type: 'QuizAttempts' as const, id: 'LIST' },
            ]
          : [{ type: 'QuizAttempts' as const, id: 'LIST' }],
    }),

    // Get attempt by ID
    getAttemptById: build.query<QuizAttempt, { id: string; includeDetails?: boolean }>({
      query: ({ id, includeDetails = true }) =>
        `/api/v1/quizzes/attempts/${id}?includeDetails=${includeDetails}`,
      providesTags: (_result, _error, { id }) => [{ type: 'QuizAttempts', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetQuizzesByProjectQuery,
  useGetActiveQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizForTakingQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useActivateQuizMutation,
  useDeactivateQuizMutation,
  useStartQuizAttemptMutation,
  useSubmitQuizAnswersMutation,
  useGetAttemptsByPatientQuery,
  useGetAttemptByIdQuery,
} = quizzesApi
