export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  twoFaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}
