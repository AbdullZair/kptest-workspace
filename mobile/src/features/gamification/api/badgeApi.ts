import { api } from '@app/api'
import type { Badge, PatientBadge, BadgeStats } from './types'

export const badgesApi = api.injectEndpoints({
  endpoints: (build) => ({
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

    // Get my badges
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
  useGetVisibleBadgesQuery,
  useGetMyBadgesQuery,
  useGetUnnotifiedBadgesQuery,
  useMarkBadgeAsNotifiedMutation,
  useGetBadgeStatsQuery,
} = badgesApi
