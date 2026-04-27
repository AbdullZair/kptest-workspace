import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import APIs from features
import { authApi } from '../features/auth/api/authApi';
import authReducer from '../features/auth/slices/authSlice';

import { patientApi } from '../src/features/patients/api/patientApi';
import { projectApi } from '../src/features/projects/api/projectApi';
import { messageApi } from '../src/features/messages/api/messageApi';
import { calendarApi } from '../src/features/calendar/api/calendarApi';
import { materialApi } from '../src/features/materials/api/materialApi';
import { notificationApi } from '../src/features/notifications/api/notificationApi';
import { statsApi } from '../src/features/stats/api/statsApi';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [patientApi.reducerPath]: patientApi.reducer,
  [projectApi.reducerPath]: projectApi.reducer,
  [messageApi.reducerPath]: messageApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [materialApi.reducerPath]: materialApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [statsApi.reducerPath]: statsApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      patientApi.middleware,
      projectApi.middleware,
      messageApi.middleware,
      calendarApi.middleware,
      materialApi.middleware,
      notificationApi.middleware,
      statsApi.middleware
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
