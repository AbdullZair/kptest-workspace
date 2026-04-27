import { api } from '@app/api'
import type { Quiz, QuizAttempt, SubmitQuizAnswers } from './types'

export const quizzesApi = api.injectEndpoints({
  endpoints: (build) => ({
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

    // Get quiz for taking
    getQuizForTaking: build.query<Quiz, { id: string }>({
      query: ({ id }) => `/api/v1/quizzes/${id}/take`,
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
  }),
  overrideExisting: false,
})

export const {
  useGetActiveQuizzesQuery,
  useGetQuizForTakingQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAnswersMutation,
  useGetAttemptsByPatientQuery,
} = quizzesApi
