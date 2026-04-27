import { api } from '@shared/api'
import type { Badge, PatientBadge, BadgeFormData, BadgeStats } from '../types/badge.types'

export const badgesApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Get all badges (admin view)
    getAllBadges: build.query<Badge[], void>({
      query: () => '/api/v1/badges',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Badges' as const, id })),
              { type: 'Badges' as const, id: 'LIST' },
            ]
          : [{ type: 'Badges' as const, id: 'LIST' }],
    }),

    // Get visible badges (patient view)
    getVisibleBadges: build.query<Badge[], void>({
      query: () => '/api/v1/badges/visible',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Badges' as const, id })),
              { type: 'Badges' as const, id: 'LIST' },
            ]
          : [{ type: 'Badges' as const, id: 'LIST' }],
    }),

    // Get badge by ID
    getBadgeById: build.query<Badge, { id: string }>({
      query: ({ id }) => `/api/v1/badges/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: 'Badges', id }],
    }),

    // Create badge
    createBadge: build.mutation<Badge, BadgeFormData>({
      query: (badge) => ({
        url: '/api/v1/badges',
        method: 'POST',
        body: badge,
      }),
      invalidatesTags: [{ type: 'Badges', id: 'LIST' }],
    }),

    // Update badge
    updateBadge: build.mutation<Badge, { id: string; badge: BadgeFormData }>({
      query: ({ id, badge }) => ({
        url: `/api/v1/badges/${id}`,
        method: 'PUT',
        body: badge,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Badges', id }],
    }),

    // Delete badge
    deleteBadge: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/badges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Badges', id: 'LIST' }],
    }),

    // Get my badges (patient)
    getMyBadges: build.query<PatientBadge[], { patientId: string }>({
      query: ({ patientId }) => `/api/v1/badges/my?patientId=${patientId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PatientBadges' as const, id })),
              { type: 'PatientBadges' as const, id: 'LIST' },
            ]
          : [{ type: 'PatientBadges' as const, id: 'LIST' }],
    }),

    // Get patient badges (staff)
    getPatientBadges: build.query<PatientBadge[], { patientId: string }>({
      query: ({ patientId }) => `/api/v1/badges/patient/${patientId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PatientBadges' as const, id })),
              { type: 'PatientBadges' as const, id: 'LIST' },
            ]
          : [{ type: 'PatientBadges' as const, id: 'LIST' }],
    }),

    // Get unnotified badges
    getUnnotifiedBadges: build.query<PatientBadge[], { patientId: string }>({
      query: ({ patientId }) => `/api/v1/badges/my/unnotified?patientId=${patientId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PatientBadges' as const, id })),
              { type: 'PatientBadges' as const, id: 'LIST' },
            ]
          : [{ type: 'PatientBadges' as const, id: 'LIST' }],
    }),

    // Mark badge as notified
    markBadgeAsNotified: build.mutation<void, { patientBadgeId: string }>({
      query: ({ patientBadgeId }) => ({
        url: `/api/v1/badges/${patientBadgeId}/notify`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { patientBadgeId }) => [
        { type: 'PatientBadges', id: patientBadgeId },
      ],
    }),

    // Get badge stats
    getBadgeStats: build.query<BadgeStats, { patientId: string }>({
      query: ({ patientId }) => `/api/v1/badges/stats?patientId=${patientId}`,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllBadgesQuery,
  useGetVisibleBadgesQuery,
  useGetBadgeByIdQuery,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
  useGetMyBadgesQuery,
  useGetPatientBadgesQuery,
  useGetUnnotifiedBadgesQuery,
  useMarkBadgeAsNotifiedMutation,
  useGetBadgeStatsQuery,
} = badgesApi
