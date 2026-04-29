import { createSlice, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@shared/types'
import type { UserEntity } from './types'
import { toUserEntity } from './types'

/**
 * User entity adapter
 */
const usersAdapter = createEntityAdapter<UserEntity>({
  sortComparer: (a: UserEntity, b: UserEntity) => a.lastName.localeCompare(b.lastName),
})

/**
 * User state interface
 */
export interface UserState {
  currentUser: UserEntity | null
  isLoading: boolean
  error: string | null
}

/**
 * Initial state
 */
const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
}

/**
 * User slice
 * Manages user entity state in Redux store
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        state.currentUser = toUserEntity(action.payload)
      } else {
        state.currentUser = null
      }
      state.error = null
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser && action.payload.id === state.currentUser.id) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
          fullName: action.payload.firstName
            ? `${action.payload.firstName} ${action.payload.lastName ?? state.currentUser.lastName}`
            : state.currentUser.fullName,
          initials: action.payload.firstName
            ? `${action.payload.firstName.charAt(0)}${(action.payload.lastName ?? state.currentUser.lastName).charAt(0)}`
            : state.currentUser.initials,
        }
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    clearUser: (state) => {
      state.currentUser = null
      state.isLoading = false
      state.error = null
    },
  },
})

/**
 * Actions
 */
export const { setCurrentUser, updateUser, setLoading, setError, clearUser } = userSlice.actions

/**
 * Selectors
 */
export const selectCurrentUser = (state: { user: UserState }): UserEntity | null =>
  state.user.currentUser
export const selectIsLoading = (state: { user: UserState }): boolean => state.user.isLoading
export const selectError = (state: { user: UserState }): string | null => state.user.error
export const selectIsAuthenticated = (state: { user: UserState }): boolean =>
  state.user.currentUser !== null

/**
 * Adapter selectors (for future use with multiple users)
 */
// Adapter selectors operate on the EntityState; the slice state is shaped
// differently (currentUser-only) so we get a default entity state here.
const _emptyEntityState = usersAdapter.getInitialState()
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
} = usersAdapter.getSelectors(() => _emptyEntityState)

/**
 * Reducer
 */
export const userReducer = userSlice.reducer

export default userSlice
