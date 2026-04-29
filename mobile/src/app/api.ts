/**
 * Shared RTK Query base API.
 *
 * Feature-level APIs (e.g. badges, quizzes) inject their endpoints into this
 * base via `api.injectEndpoints({...})` so they all share a single reducer
 * and middleware while still living next to their feature code.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL =
  (typeof process !== 'undefined' && process.env && (process.env as Record<string, string>).EXPO_PUBLIC_API_URL) ||
  'https://api.kptest.com';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: [
    'Badges',
    'PatientBadges',
    'Quizzes',
    'QuizAttempts',
  ],
  endpoints: () => ({}),
});

export type Api = typeof api;
