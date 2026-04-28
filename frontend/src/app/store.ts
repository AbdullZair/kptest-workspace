import { configureStore, type Middleware } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// API services
import { api } from '@shared/api'

// Feature slices
import { authReducer } from '@features/auth/slices/authSlice'
import { patientReducer } from '@features/patients/slices/patientSlice'

/**
 * Root reducer - combines all reducers
 */
const rootReducer = {
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  patient: patientReducer,
}

/**
 * Error handling middleware
 * Handles errors from async actions and API calls
 */
const errorMiddleware: Middleware = () => (next) => (action: unknown) => {
  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string' &&
    action.type.endsWith('/rejected') &&
    'error' in action
  ) {
    const errorAction = action as { error?: { message?: string }; payload?: unknown }
    console.error('[Redux Error]', {
      type: action.type,
      error: errorAction.error?.message,
      payload: errorAction.payload,
    })
  }
  return next(action)
}

/**
 * Redux store configuration
 * Uses Redux Toolkit's configureStore for best practices
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for File/Blob
        ignoredActions: ['file/upload'],
        // Ignore these field paths in state
        ignoredPaths: ['auth.tempFile'],
      },
      immutableCheck: {
        // Ignore these paths for immutable check
        ignoredPaths: ['auth.tempFile'],
      },
    })
      .concat(api.middleware)
      .concat(errorMiddleware),
  devTools: import.meta.env.DEV,
})

// Setup RTK Query listeners for refetchOnMount, refetchOnFocus, refetchOnReconnect
setupListeners(store.dispatch)

/**
 * Types
 */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Typed hooks for use throughout the app
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Re-export for convenience
 */
export default store
