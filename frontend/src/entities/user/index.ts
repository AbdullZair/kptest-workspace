export { toUserEntity, getUserRoleName, hasRole, hasAnyRole, isMedicalStaff, isAdmin } from './model/types'
export {
  setCurrentUser,
  updateUser,
  setLoading,
  setError,
  clearUser,
  selectCurrentUser,
  selectIsLoading,
  selectError,
  selectIsAuthenticated,
  userReducer,
} from './model/slice'
export { UserAvatar, UserCard, UserBadge } from './ui/UserAvatar'
export type { UserEntity } from './model/types'
