# ADR-009: Mobile Architecture

## Status

ACCEPTED

## Date

2025-11-05

## Context

The KPTEST telemedicine system requires a mobile application for patients that:
- Provides access to therapy tasks and educational materials
- Works offline (patients may have limited connectivity)
- Supports push notifications for reminders
- Runs on both iOS and Android platforms
- Provides accessible UI for elderly patients
- Maintains security for medical data

Key requirements:
1. **Cross-platform** - iOS and Android from single codebase
2. **Offline-first** - Function without constant connectivity
3. **Performance** - Smooth animations, fast load times
4. **Accessibility** - Support for elderly users
5. **Security** - Biometric authentication, encrypted storage
6. **Push Notifications** - Reminders and updates
7. **App Store Compliance** - iOS App Store and Google Play

## Decision

We will implement the mobile application using **React Native with Expo SDK 50**.

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Mobile Stack                                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Core Framework                                  │    │
│  │                                                                       │    │
│  │  React Native 0.73  •  Expo SDK 50  •  TypeScript 5                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Navigation                                      │    │
│  │                                                                       │    │
│  │  Expo Router 3  •  React Navigation 6                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      State Management                                │    │
│  │                                                                       │    │
│  │  Zustand  •  React Query  •  AsyncStorage                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Styling                                         │    │
│  │                                                                       │    │
│  │  NativeWind (TailwindCSS for RN)  •  Restyle                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Native Modules                                  │    │
│  │                                                                       │    │
│  │  Expo SecureStore  •  Expo Notifications  •  Expo Camera             │    │
│  │  Expo Biometrics   •  Expo FileSystem     •  Expo Image Picker      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Testing                                         │    │
│  │                                                                       │    │
│  │  Jest  •  React Native Testing Library  •  Detox (E2E)               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
mobile/
├── app/                        # Expo Router (file-based routing)
│   ├── (auth)/                 # Auth stack
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── 2fa.tsx
│   │   └── reset-password.tsx
│   │
│   ├── (main)/                 # Main app stack
│   │   ├── index.tsx           # Dashboard
│   │   ├── tasks/
│   │   │   ├── index.tsx       # Tasks list
│   │   │   └── [id].tsx        # Task detail
│   │   ├── materials/
│   │   │   ├── index.tsx       # Materials list
│   │   │   └── [id].tsx        # Material detail
│   │   ├── messages/
│   │   │   ├── index.tsx       # Messages list
│   │   │   └── [id].tsx        # Conversation
│   │   ├── calendar/
│   │   │   └── index.tsx       # Calendar view
│   │   └── profile/
│   │       └── index.tsx       # Profile settings
│   │
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx          # 404 page
│
├── components/                 # Reusable components
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── List.tsx
│   │   └── Modal.tsx
│   │
│   ├── forms/
│   │   ├── FormField.tsx
│   │   ├── SelectPicker.tsx
│   │   └── DatePicker.tsx
│   │
│   ├── feedback/
│   │   ├── Loading.tsx
│   │   ├── Error.tsx
│   │   └── EmptyState.tsx
│   │
│   └── navigation/
│       ├── TabBar.tsx
│       └── Header.tsx
│
├── features/                   # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── tasks/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── materials/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── messages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   └── notifications/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── services/                   # Core services
│   ├── api.ts                  # API client
│   ├── storage.ts              # Local storage
│   ├── notifications.ts        # Push notifications
│   └── biometrics.ts           # Biometric auth
│
├── hooks/                      # Shared hooks
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useMaterials.ts
│   └── useOffline.ts
│
├── store/                      # State management
│   ├── index.ts
│   ├── authStore.ts
│   ├── tasksStore.ts
│   └── uiStore.ts
│
├── utils/                      # Utilities
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
│
├── types/                      # TypeScript types
│   ├── api.ts
│   ├── models.ts
│   └── navigation.ts
│
├── assets/                     # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── babel.config.js
```

### Offline-First Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Offline-First Architecture                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Data Flow                                       │    │
│  │                                                                       │    │
│  │  ┌──────────┐     ┌──────────┐     ┌──────────┐                     │    │
│  │  │   UI     │────▶│  React   │────▶│  Zustand  │                     │    │
│  │  │Component │     │  Query   │     │   Store   │                     │    │
│  │  └──────────┘     └────┬─────┘     └────┬─────┘                     │    │
│  │                        │                │                            │    │
│  │                        │                │                            │    │
│  │                        ▼                ▼                            │    │
│  │               ┌─────────────────────────────────┐                    │    │
│  │               │        AsyncStorage             │                    │    │
│  │               │      (Local Cache)              │                    │    │
│  │               └─────────────┬───────────────────┘                    │    │
│  │                             │                                        │    │
│  │                             │ Sync                                   │    │
│  │                             ▼                                        │    │
│  │               ┌─────────────────────────────────┐                    │    │
│  │               │        API Client               │                    │    │
│  │               │      (Network Layer)            │                    │    │
│  │               └─────────────┬───────────────────┘                    │    │
│  │                             │                                        │    │
│  │                             │ HTTPS                                  │    │
│  │                             ▼                                        │    │
│  │               ┌─────────────────────────────────┐                    │    │
│  │               │        Backend API              │                    │    │
│  │               └─────────────────────────────────┘                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Sync Strategy                                   │    │
│  │                                                                       │    │
│  │  1. App loads → Load from AsyncStorage (instant)                     │    │
│  │  2. React Query fetches → Update cache in background                 │    │
│  │  3. User actions → Optimistic update + queue for sync                │    │
│  │  4. Network available → Process queued mutations                     │    │
│  │  5. Conflict resolution → Last-write-wins (with audit)               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Management (Zustand)

```typescript
// store/tasksStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/models';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTask: null,
      isLoading: false,
      error: null,
      
      setTasks: (tasks) => set({ tasks, isLoading: false }),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      
      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
        ),
      })),
      
      setSelectedTask: (task) => set({ selectedTask: task }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
```

### API Client with React Query

```typescript
// services/api.ts
import { QueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.kptest.com/api/v1';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await SecureStore.getItemAsync('access_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Handle token refresh
      await handleTokenRefresh();
      return request<T>(endpoint, options);
    }
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// Custom hooks for API calls
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => request<Task[]>('/tasks'),
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) =>
      request<Task>(`/tasks/${taskId}/complete`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

### Push Notifications

```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id',
    })).data;
    
    // Register token with backend
    await registerTokenWithBackend(token);
    
    return token;
  }
  
  return null;
}

export async function scheduleTaskReminder(task: Task, dueDate: Date) {
  const trigger = new Date(dueDate);
  trigger.setMinutes(trigger.getMinutes() - 30); // 30 minutes before
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Przypomnienie o zadaniu',
      body: `Czas na: ${task.title}`,
      data: { taskId: task.id, type: 'TASK_REMINDER' },
    },
    trigger,
  });
}
```

### Biometric Authentication

```typescript
// services/biometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export async function authenticateWithBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;
  
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Odblokuj KPTEST',
    fallbackLabel: 'Użyj kodu',
    cancelLabel: 'Anuluj',
  });
  
  return result.success;
}

export async function enableBiometricLogin(): Promise<void> {
  const authenticated = await authenticateWithBiometrics();
  if (authenticated) {
    await SecureStore.setItemAsync('biometric_enabled', 'true');
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync('biometric_enabled');
  return enabled === 'true';
}
```

## Consequences

### Positive

1. **Cross-platform** - Single codebase for iOS and Android
2. **Development Speed** - Fast iteration with Expo
3. **Native Features** - Access to camera, biometrics, notifications
4. **Offline Support** - AsyncStorage + React Query caching
5. **Performance** - Near-native performance with Hermes engine
6. **App Store Distribution** - EAS Build handles store submissions
7. **Type Safety** - TypeScript throughout

### Negative

1. **Bundle Size** - Larger than native apps (~50MB)
2. **Native Modules** - Some features require native code
3. **App Store Review** - Additional review process for updates
4. **Platform Differences** - iOS/Android inconsistencies

### Performance Optimizations

```typescript
// Hermes engine (enabled by default in Expo)
// android/app/build.gradle
project.ext.react = [
    enableHermes: true
]

// FlatList for large lists
<FlatList
  data={tasks}
  renderItem={({ item }) => <TaskCard task={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>

// Image optimization
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  cachePolicy="memory-disk"
/>

// Memoization
const TaskCard = memo(({ task, onComplete }) => {
  // Component logic
});
```

## Security Considerations

### Secure Storage

```typescript
// Tokens stored in SecureStore (encrypted)
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('access_token', token);
await SecureStore.setItemAsync('refresh_token', refreshToken);

// Sensitive data encrypted
import { encrypt, decrypt } from '../utils/crypto';

await SecureStore.setItemAsync(
  'user_data',
  await encrypt(JSON.stringify(userData))
);
```

### Certificate Pinning

```typescript
// Configure in app.json
{
  "expo": {
    "plugins": [
      [
        "expo-network-security",
        {
          "pinDomains": ["api.kptest.com"],
          "includeSubdomains": true
        }
      ]
    ]
  }
}
```

## Alternatives Considered

### Flutter

**Pros:**
- Excellent performance
- Consistent UI across platforms
- Growing ecosystem

**Cons:**
- Dart language (new learning curve)
- Larger community for React Native
- Team familiarity with React

### Native (Swift/Kotlin)

**Pros:**
- Best performance
- Full platform access
- Smaller app size

**Cons:**
- Two codebases
- Double development effort
- Higher maintenance cost

### React Native CLI (without Expo)

**Pros:**
- More control over native code
- Smaller bundle size
- No Expo limitations

**Cons:**
- More complex setup
- Manual native module linking
- No EAS Build/Update

---

**Authors:** KPTEST Mobile Agent
**Reviewers:** Mobile Team, Security Team
