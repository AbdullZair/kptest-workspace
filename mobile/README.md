# KPTEST Mobile App

React Native mobile application built with Expo for KPTEST platform.

## Tech Stack

- **Framework**: Expo SDK 50+
- **Language**: TypeScript (strict mode)
- **State Management**: Redux Toolkit + RTK Query
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **Forms**: React Hook Form + Zod validation
- **Security**: Expo SecureStore + Biometric Authentication
- **Notifications**: Expo Notifications (push)
- **Architecture**: Feature-Sliced Design

## Project Structure

```
mobile/
├── app/                    # App configuration
│   ├── store.ts           # Redux store setup
│   ├── navigation.tsx     # Navigation configuration
│   └── theme.ts           # Theme configuration
├── features/              # Feature modules
│   └── auth/              # Authentication feature
│       ├── api/           # API definitions
│       ├── slices/        # Redux slices
│       └── screens/       # Screen components
├── entities/              # Business entities
│   └── user/              # User entity
├── shared/                # Shared code
│   ├── api/               # API client
│   ├── components/        # UI components
│   ├── hooks/             # Custom hooks
│   └── services/          # Services
└── screens/               # App screens
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Features

### Authentication
- Email/password login
- User registration with validation
- Two-factor authentication (2FA)
- Biometric authentication (Face ID/Touch ID)
- Secure token storage

### Security
- Encrypted storage with Expo SecureStore
- Biometric authentication support
- Automatic token refresh
- Request interceptors

### UI/UX
- Dark mode support
- Responsive design
- WCAG accessibility compliance
- Custom theme system

## Development

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

### Environment Variables

Create a `.env` file in the root:

```env
API_URL=https://api.kptest.com
EXPO_PROJECT_ID=your-project-id
```

## Architecture

### Feature-Sliced Design

This project follows Feature-Sliced Design methodology:

- **Features**: User-facing functionality (auth, profile, etc.)
- **Entities**: Business entities (User, Product, etc.)
- **Shared**: Reusable components, hooks, utilities
- **App**: Application-level configuration

### State Management

- **RTK Query**: Server state (API caching, background updates)
- **Redux Slice**: Client state (UI state, auth tokens)
- **Redux Persist**: State persistence across app restarts

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Deployment

```bash
# Submit to stores
eas submit --platform ios
eas submit --platform android

# Or use OTA updates
eas update
```

## License

Private - KPTEST
