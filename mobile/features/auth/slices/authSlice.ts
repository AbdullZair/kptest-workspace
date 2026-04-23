import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import type { AuthState, User } from './types';
import { authApi } from '../api/authApi';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TwoFaRequest,
} from '../api/types';

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,
  requiresTwoFa: false,
  tempToken: null,
  isLoading: false,
  error: null,
};

// Async thunks for SecureStore operations
export const saveTokens = createAsyncThunk(
  'auth/saveTokens',
  async ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ accessToken, refreshToken }));
    return { accessToken, refreshToken };
  }
);

export const loadTokens = createAsyncThunk('auth/loadTokens', async () => {
  const tokens = await SecureStore.getItemAsync(TOKEN_KEY);
  return tokens ? JSON.parse(tokens) : null;
});

export const clearTokens = createAsyncThunk('auth/clearTokens', async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
});

export const saveUser = createAsyncThunk('auth/saveUser', async (user: User) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  return user;
});

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? JSON.parse(user) : null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.requiresTwoFa = false;
      state.tempToken = null;
      state.error = null;
    },
    setTwoFaPending(state, action: PayloadAction<{ tempToken: string }>) {
      state.requiresTwoFa = true;
      state.tempToken = action.payload.tempToken;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as LoginResponse;
        
        if (payload.requiresTwoFa && payload.tempToken) {
          state.requiresTwoFa = true;
          state.tempToken = payload.tempToken;
        } else {
          state.accessToken = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          state.tokenExpiresAt = Date.now() + payload.expiresIn * 1000;
          if (payload.user) {
            state.user = payload.user as User;
            state.isAuthenticated = true;
          }
        }
      })
      .addCase(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })

      // Register
      .addCase(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authApi.endpoints.register.matchFulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })

      // TwoFa Verification
      .addCase(authApi.endpoints.verifyTwoFa.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authApi.endpoints.verifyTwoFa.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.requiresTwoFa = false;
        state.tempToken = null;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiresAt = Date.now() + action.payload.expiresIn * 1000;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(authApi.endpoints.verifyTwoFa.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '2FA verification failed';
      })

      // Logout
      .addCase(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiresAt = null;
        state.requiresTwoFa = false;
        state.tempToken = null;
      })

      // Get Current User
      .addCase(authApi.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(authApi.endpoints.getCurrentUser.matchRejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      // Token persistence
      .addCase(saveTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loadTokens.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(saveUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(clearTokens.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { resetError, clearAuth, setTwoFaPending } = authSlice.actions;
export default authSlice.reducer;
