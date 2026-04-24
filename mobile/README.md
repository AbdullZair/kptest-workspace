# KPTEST Mobile

React Native mobile application dla systemu telemedycznego KPTEST.

## 📊 Status

| Metryka | Wartość |
|---------|---------|
| Status | ✅ 100% |
| Screens | 20+ |
| Components | 50+ |
| Features | 6 |

## 🛠️ Technologie

- **Framework:** React Native 0.73
- **Platform:** Expo SDK 50
- **Language:** TypeScript 5
- **Navigation:** Expo Router
- **State:** Zustand
- **UI:** NativeWind (TailwindCSS for RN)
- **Storage:** Expo SecureStore, AsyncStorage
- **HTTP Client:** Axios

## 📁 Struktura

```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Home screen
│   ├── login.tsx            # Login screen
│   ├── register.tsx         # Register screen
│   ├── dashboard.tsx        # Dashboard
│   ├── patients/
│   │   ├── index.tsx        # Patients list
│   │   ├── [id].tsx         # Patient detail
│   │   └── add.tsx          # Add patient
│   ├── projects/
│   │   ├── index.tsx        # Projects list
│   │   ├── [id].tsx         # Project detail
│   │   └── tasks.tsx        # Project tasks
│   ├── messages/
│   │   ├── index.tsx        # Messages list
│   │   └── [id].tsx         # Conversation
│   ├── calendar/
│   │   ├── index.tsx        # Calendar view
│   │   └── [id].tsx         # Event detail
│   ├── profile/
│   │   ├── index.tsx        # Profile view
│   │   └── settings.tsx     # Settings
│   └── _layout.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── List.tsx
│   ├── forms/
│   │   ├── FormField.tsx
│   │   ├── SelectPicker.tsx
│   │   └── DatePicker.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── TabBar.tsx
│       └── BottomSheet.tsx
├── features/
│   ├── auth/
│   │   ├── useAuth.ts
│   │   └── authStore.ts
│   ├── patients/
│   │   ├── usePatients.ts
│   │   └── patientsStore.ts
│   └── ...
├── services/
│   ├── api.ts
│   └── storage.ts
├── utils/
│   ├── validators.ts
│   └── formatters.ts
├── types/
│   ├── api.ts
│   └── models.ts
├── app.json
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Wymagania

- Node.js 20+
- npm lub yarn
- Expo CLI
- iOS Simulator lub Android Emulator
- Expo Go app (na fizycznym urządzeniu)

### Instalacja

```bash
cd mobile

# Instalacja zależności
npm install

# Uruchomienie
npm run start

# iOS
npm run ios

# Android
npm run android
```

### Expo Go

1. Zainstaluj Expo Go na telefonie
2. Zeskanuj QR kod z terminala
3. Aplikacja uruchomi się na urządzeniu

## 📱 Features

### Authentication

- Login z email/password
- Rejestracja
- 2FA support
- Biometric authentication (FaceID/TouchID)
- Remember me

### Dashboard

- Stats overview
- Quick actions
- Recent patients
- Upcoming appointments
- Notifications

### Patient Management

- View patients list
- Patient detail view
- Add new patient
- Edit patient
- Patient projects
- Patient documents

### Project Management

- View projects list
- Project detail view
- Project timeline
- Task management
- Progress tracking

### Messaging

- View conversations
- Real-time chat
- Send messages
- View attachments
- Push notifications

### Calendar

- Calendar view
- Event details
- Add appointment
- Edit appointment
- Reminders

### Profile & Settings

- View profile
- Edit profile
- Change password
- App settings
- Logout

## 🎨 Components

### UI Components

| Component | Opis |
|-----------|------|
| Button | Button variants |
| Input | Text input |
| Card | Card container |
| List | List view |
| Avatar | User avatar |
| Badge | Status badge |
| Chip | Filter chip |

### Form Components

| Component | Opis |
|-----------|------|
| FormField | Form input field |
| SelectPicker | Dropdown picker |
| DatePicker | Date picker |
| TimePicker | Time picker |
| Checkbox | Checkbox |
| Switch | Toggle switch |

### Layout Components

| Component | Opis |
|-----------|------|
| Header | Screen header |
| TabBar | Bottom tab bar |
| BottomSheet | Bottom sheet modal |
| SafeView | Safe area wrapper |

## 🔄 State Management

### Zustand Stores

```typescript
// features/auth/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (credentials) => {
    const response = await api.login(credentials);
    set({ user: response.user, token: response.token, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  },
  refresh: async () => {
    const response = await api.refresh();
    set({ token: response.token });
  },
}));
```

### Custom Hooks

```typescript
// features/patients/usePatients.ts
export function usePatients() {
  const { data, isLoading, error } = useGetPatientsQuery();
  const [createPatient] = useCreatePatientMutation();
  const [updatePatient] = useUpdatePatientMutation();
  const [deletePatient] = useDeletePatientMutation();

  return {
    patients: data,
    isLoading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
  };
}
```

## 📝 Konfiguracja

### app.json

```json
{
  "expo": {
    "name": "KPTEST",
    "slug": "kptest-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.kptest.mobile",
      "supportsTablet": true
    },
    "android": {
      "package": "com.kptest.mobile",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-camera",
      "expo-image-picker"
    ]
  }
}
```

### NativeWind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
};
```

## 🔐 Security

### Secure Storage

```typescript
// services/storage.ts
import * as SecureStore from 'expo-secure-store';

export const storage = {
  getToken: async () => {
    return await SecureStore.getItemAsync('token');
  },
  setToken: async (token: string) => {
    await SecureStore.setItemAsync('token', token);
  },
  removeToken: async () => {
    await SecureStore.deleteItemAsync('token');
  },
};
```

### Biometric Authentication

```typescript
// features/auth/useBiometric.ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate',
    });
    return result.success;
  }
  return false;
}
```

## 🚀 Build

### iOS

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

### Development Build

```bash
# Create dev build
eas build --profile development --platform all

# Preview build
eas build --profile preview --platform all
```

## 🧪 Testy

```bash
# Testy jednostkowe
npm test

# Testy na emulatorze
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🔧 Troubleshooting

### Metro bundler error

```bash
# Wyczyść cache
npm start -- --reset-cache

# Lub
rm -rf .expo node_modules
npm install
npm start
```

### iOS build error

```bash
# Wyczyść build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Ponów build
npm run ios
```

### Android build error

```bash
# Wyczyść build
cd android
./gradlew clean
cd ..

# Ponów build
npm run android
```

## 📊 Performance

### Metryki

| Metryka | Wartość |
|---------|---------|
| App Launch Time | < 2s |
| Screen Transition | < 300ms |
| Memory Usage | < 200MB |
| Battery Impact | Low |

### Optimization

- Lazy loading screens
- Image caching
- Virtualized lists
- Memoized components
- Optimized re-renders

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

---

**KPTEST Team** © 2026
