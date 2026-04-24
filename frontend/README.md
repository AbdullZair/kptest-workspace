# KPTEST Frontend

React web application dla systemu telemedycznego KPTEST.

## 📊 Status

| Metryka | Wartość |
|---------|---------|
| Status | ✅ 100% |
| E2E Tests | 369/369 (100%) |
| Coverage | 80%+ |
| Pages | 25+ |
| Components | 100+ |

## 🛠️ Technologie

- **Framework:** React 18
- **Language:** TypeScript 5
- **State:** Redux Toolkit + RTK Query
- **Styling:** TailwindCSS 3
- **UI Components:** Headless UI, Radix UI
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts, Chart.js
- **HTTP Client:** Axios
- **Build:** Vite

## 📁 Struktura

```
frontend/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── store.ts           # Redux store
│   │   └── hooks.ts           # Typed hooks
│   ├── components/
│   │   ├── common/            # Shared components
│   │   ├── layout/            # Layout components
│   │   ├── forms/             # Form components
│   │   └── ui/                # UI primitives
│   ├── features/
│   │   ├── auth/              # Auth feature
│   │   ├── patients/          # Patients feature
│   │   ├── projects/          # Projects feature
│   │   ├── messages/          # Messages feature
│   │   ├── calendar/          # Calendar feature
│   │   ├── reports/           # Reports feature
│   │   └── admin/             # Admin feature
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PatientsPage.tsx
│   │   └── ...
│   ├── services/
│   │   ├── api.ts             # API client
│   │   └── endpoints.ts       # API endpoints
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   └── ...
│   ├── utils/
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── types/
│   │   ├── api.ts
│   │   └── models.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Quick Start

### Wymagania

- Node.js 20+
- npm lub yarn
- Backend running (port 8080)

### Instalacja

```bash
cd frontend

# Instalacja zależności
npm install

# Uruchomienie development
npm run dev

# Build produkcyjny
npm run build

# Preview build
npm run preview
```

### Zmienne środowiskowe

```bash
# .env.local
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=KPTEST
VITE_APP_VERSION=1.0.0
```

## 🧪 Testy

```bash
# Testy jednostkowe
npm test

# Testy z coverage
npm run test:coverage

# E2E tests (z root projektu)
cd ../tests && npm test
```

### Struktura testów

| Kategoria | Liczba | Status |
|-----------|--------|--------|
| Authentication | 45 | ✅ 100% |
| Patient Management | 62 | ✅ 100% |
| Project Management | 58 | ✅ 100% |
| Messaging | 41 | ✅ 100% |
| Calendar | 38 | ✅ 100% |
| Admin Panel | 52 | ✅ 100% |
| Reports | 35 | ✅ 100% |
| Edge Cases | 38 | ✅ 100% |

## 📡 Features

### Authentication

- Login z email/password
- Rejestracja nowego użytkownika
- 2FA (TOTP) support
- Password reset flow
- Remember me functionality
- Session management

### Dashboard

- Stats overview
- Recent patients
- Upcoming appointments
- Quick actions
- Notifications

### Patient Management

- Patient list with filtering
- Patient detail view
- Add/Edit patient
- Patient projects
- Patient documents
- Search functionality

### Project Management

- Project list
- Project detail view
- Project timeline
- Task management
- Progress tracking
- Team assignment

### Messaging

- Conversations list
- Real-time chat
- Message attachments
- Search messages
- Mark as read

### Calendar

- Month/week/day views
- Event creation
- Event editing
- Appointment scheduling
- Reminders

### Reports

- Analytics dashboard
- Patient reports
- Project reports
- Export to PDF/CSV
- Charts and graphs

### Admin Panel

- User management
- Role management
- System settings
- Audit logs
- System monitoring

## 🎨 Components

### Layout Components

- `Header` - Top navigation
- `Sidebar` - Side navigation
- `Footer` - Footer
- `MainLayout` - Page layout wrapper

### Form Components

- `Input` - Text input
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio` - Radio input
- `DatePicker` - Date picker
- `TextArea` - Multi-line input
- `FileUpload` - File upload

### UI Components

- `Button` - Button variants
- `Card` - Card container
- `Modal` - Modal dialog
- `Table` - Data table
- `Pagination` - Pagination
- `Spinner` - Loading spinner
- `Alert` - Alert messages
- `Toast` - Toast notifications

## 🔄 State Management

### Redux Slices

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../services/api';
import authSlice from '../features/auth/authSlice';
import patientsSlice from '../features/patients/patientsSlice';
import projectsSlice from '../features/projects/projectsSlice';
// ...

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
    patients: patientsSlice,
    projects: projectsSlice,
    // ...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
```

### RTK Query Hooks

```typescript
// Auto-generated hooks
const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = apiSlice;
```

## 🎯 Pages

| Page | Route | Opis |
|------|-------|------|
| Login | `/login` | Login page |
| Register | `/register` | Registration page |
| Dashboard | `/` | Main dashboard |
| Patients | `/patients` | Patient list |
| Patient Detail | `/patients/:id` | Patient detail |
| Projects | `/projects` | Project list |
| Project Detail | `/projects/:id` | Project detail |
| Messages | `/messages` | Messages inbox |
| Conversation | `/messages/:id` | Chat conversation |
| Calendar | `/calendar` | Calendar view |
| Reports | `/reports` | Reports dashboard |
| Admin | `/admin` | Admin panel |
| Profile | `/profile` | User profile |
| Settings | `/settings` | User settings |

## 📝 Konfiguracja

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
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
  plugins: [],
};
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t kptest-frontend .

# Run container
docker run -p 3000:80 kptest-frontend
```

### Kubernetes

```bash
# Deploy
kubectl apply -f ../devops/k8s/frontend-deployment.yaml
kubectl apply -f ../devops/k8s/frontend-service.yaml
```

### Build

```bash
# Production build
npm run build

# Output: dist/
```

## 🔧 Troubleshooting

### API connection failed

```bash
# Sprawdź backend
curl http://localhost:8080/api/v1/health

# Sprawdź .env.local
cat .env.local
```

### Build errors

```bash
# Wyczyść cache
rm -rf node_modules package-lock.json
npm install

# Ponów build
npm run build
```

### TypeScript errors

```bash
# Sprawdź typy
npx tsc --noEmit

# Zainstaluj typy
npm install --save-dev @types/react @types/node
```

## 📊 Performance

### Bundle Size

| Bundle | Size | Gzipped |
|--------|------|---------|
| main.js | 250KB | 80KB |
| vendor.js | 200KB | 65KB |
| styles.css | 50KB | 10KB |

### Load Time

| Metryka | Wartość |
|---------|---------|
| FCP | < 1.5s |
| LCP | < 2.5s |
| TTI | < 3s |
| CLS | < 0.1 |

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

---

**KPTEST Team** © 2026
