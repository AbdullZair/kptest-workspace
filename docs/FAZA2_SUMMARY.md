# FAZA 2 Summary - Frontend Implementation

## Przegląd

FAZA 2 obejmuje implementację frontendową dla funkcji RODO, bezpieczeństwa oraz usprawnień UX zdefiniowanych w specyfikacji projektu KPTESTPRO.

**Data realizacji:** 2026-04-27  
**Status:** ACCEPTED

---

## Zakres FAZA 2

### 1. Frontend RODO Panels (US-A-10..13)

**Lokalizacja:** `frontend/src/features/admin/`

#### Komponenty

| Komponent | Plik | Opis |
|-----------|------|------|
| `PatientDataAdminPage` | `features/admin/pages/PatientDataAdminPage.tsx` | Główna strona z tabs: View \| Anonymize \| Export \| Erase \| Audit Trail |
| `AnonymizePatientDialog` | `features/admin/components/AnonymizePatientDialog.tsx` | Dialog potwierdzenia anonimizacji z input "ANONYMIZUJ" + dropdown reason |
| `ExportPatientDataButton` | `features/admin/components/ExportPatientDataButton.tsx` | Dropdown: JSON / PDF, pobieranie przez blob |
| `ErasePatientDialog` | `features/admin/components/ErasePatientDialog.tsx` | 30-day cooling check, dwustopniowe potwierdzenie + reason |
| `DataProcessingActivitiesPage` | `features/admin/pages/DataProcessingActivitiesPage.tsx` | Lista czynności przetwarzania z filtrami i CRUD form |

#### RTK Endpoints

Rozszerzenie `features/admin/api/adminApi.ts`:
```typescript
// Anonimizacja
anonymizePatient: build.mutation({
  query: ({ id, reason }) => ({
    url: `/admin/patients/${id}/anonymize`,
    method: 'POST',
    body: { reason }
  }),
  invalidatesTags: ['Patient', 'AuditLog']
})

// Eksport
exportPatientData: build.query({
  query: ({ id, format }) => `/admin/patients/${id}/export-data?format=${format}`
})

// Erasure
erasePatient: build.mutation({
  query: ({ id, reason, confirmationToken }) => ({
    url: `/admin/patients/${id}/erase`,
    method: 'DELETE',
    body: { reason, confirmationToken }
  }),
  invalidatesTags: ['Patient']
})

// Processing activities
getProcessingActivities: build.query({
  query: ({ page, size, legalBasis }) => 
    `/admin/data-processing-activities?page=${page}&size=${size}${legalBasis ? `&legalBasis=${legalBasis}` : ''}`
}),
createProcessingActivity: build.mutation({...}),
updateProcessingActivity: build.mutation({...}),
deleteProcessingActivity: build.mutation({...})
```

#### Walidacja (Zod)

`features/admin/lib/schemas.ts`:
```typescript
export const anonymizePatientSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters')
})

export const erasePatientSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  confirmationToken: z.string().length(36, 'Invalid confirmation token')
})

export const processingActivitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  legalBasis: z.enum(['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTEREST', 'PUBLIC_TASK', 'LEGITIMATE_INTEREST']),
  categories: z.array(z.string()),
  recipients: z.array(z.string()),
  retentionPeriod: z.string(),
  securityMeasures: z.string(),
  dataController: z.string(),
  dataProcessor: z.string()
})
```

#### Routes

`app/providers/router/`:
```typescript
{
  path: '/admin/patients/:id/data',
  element: <PatientDataAdminPage />,
  guard: { hasRole: ['ADMIN'] }
}
{
  path: '/admin/data-processing-activities',
  element: <DataProcessingActivitiesPage />,
  guard: { hasRole: ['ADMIN'] }
}
```

---

### 2. Change-Password UI (US-P-09)

**Lokalizacja:** `frontend/src/features/auth/`

#### Komponent

`features/auth/components/ChangePasswordDialog.tsx`:
- Otwierany z `SettingsPage`
- RHF + Zod walidacja
- Pola: `currentPassword`, `newPassword`, `confirmNewPassword` (z match validation)
- Wywołuje `POST /auth/change-password`
- Po sukcesie: `clearAuth` + redirect `/login` (backend revokuje refresh tokeny)

#### Walidacja (Zod)

```typescript
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword']
})
```

#### RTK Endpoint

Rozszerzenie `features/auth/api/authApi.ts`:
```typescript
changePassword: build.mutation({
  query: ({ currentPassword, newPassword }) => ({
    url: '/auth/change-password',
    method: 'POST',
    body: { currentPassword, newPassword }
  }),
  onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
    try {
      await queryFulfilled
      dispatch(clearAuth()) // clearAuth + redirect /login
    } catch (error) {
      // handle error
    }
  }
})
```

---

### 3. Inbox Delegation (US-K-14)

**Lokalizacja:** `frontend/src/features/inbox/`

#### Komponenty

| Komponent | Plik | Opis |
|-----------|------|------|
| `InboxThreadActions` | `features/inbox/components/InboxThreadActions.tsx` | Dropdown z opcjami: Mark as, Assign to, Set priority |
| `InboxThreadItem` | `features/inbox/components/InboxThreadItem.tsx` | Badge ze statusem + assignee avatar |

#### Statusy wątków

```typescript
type ThreadStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED'
type ThreadPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
```

#### Akcje

`InboxThreadActions.tsx`:
- **Mark as:** dropdown ze statusem
- **Assign to:** picker staff list (fetch z `/api/v1/staff`)
- **Set priority:** dropdown z priorytetem

Wywołują istniejące endpointy `InboxController` (już zaimplementowane w backendzie):
- `PUT /api/v1/messages/threads/{id}/status`
- `PUT /api/v1/messages/threads/{id}/assign`
- `PUT /api/v1/messages/threads/{id}/priority`

---

### 4. Export Conversation to PDF (US-K-15)

**Lokalizacja:** `frontend/src/features/inbox/`

#### Backend Endpoint (wymagany)

```
POST /api/v1/messages/threads/{threadId}/export?format=pdf
```

**Implementacja backend:**
- Rozszerzenie `MessageController` + `MessageService.exportThreadAsPdf`
- Biblioteka: Apache PDFBox `org.apache.pdfbox:pdfbox:3.0.1`

#### Komponent Frontend

`features/inbox/components/ExportConversationButton.tsx`:
```typescript
const handleExport = async () => {
  const response = await fetch(`/api/v1/messages/threads/${threadId}/export?format=pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `conversation-${threadId}.pdf`
  a.click()
}
```

---

### 5. i18n Setup PL+EN (US-S-17)

**Lokalizacja:** `frontend/src/`

#### Instalacja

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

#### Konfiguracja

`shared/config/i18n.ts`:
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import pl from './locales/pl.json'
import en from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en }
    },
    lng: 'pl',
    fallbackLng: 'pl',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
```

#### Struktura plików locales

`shared/locales/pl.json`:
```json
{
  "common": {
    "save": "Zapisz",
    "cancel": "Anuluj",
    "delete": "Usuń",
    "edit": "Edytuj",
    "loading": "Ładowanie..."
  },
  "auth": {
    "login": {
      "title": "Logowanie",
      "email": "Email",
      "password": "Hasło",
      "submit": "Zaloguj się"
    },
    "register": {
      "title": "Rejestracja"
    }
  },
  "admin": {
    "patients": {
      "anonymize": "Anonimizuj",
      "export": "Eksportuj dane",
      "erase": "Usuń trwale"
    }
  }
}
```

#### Provider

`app/providers/I18nProvider.tsx`:
```typescript
import { I18nextProvider } from 'react-i18next'
import i18n from '../../shared/config/i18n'

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
```

#### LanguageSwitcher

`features/settings/components/LanguageSwitcher.tsx`:
```typescript
const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  
  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18nextLng', lng)
  }

  return (
    <select value={i18n.language} onChange={(e) => handleChange(e.target.value)}>
      <option value="pl">Polski</option>
      <option value="en">English</option>
    </select>
  )
}
```

#### Komponenty przetłumaczone (priorytet)

1. `LoginPage`
2. `RegisterPage`
3. `DashboardPage`
4. `SettingsPage`
5. `AdminUsersPage`

**Pozostałe komponenty:** TODO do migracji iteracyjnej.

---

## Testy

### Vitest

```typescript
// AnonymizePatientDialog.test.tsx
describe('AnonymizePatientDialog', () => {
  it('shows validation error for reason < 10 chars', async () => {
    // test
  })
  
  it('calls anonymizePatient mutation on submit', async () => {
    // test
  })
})

// ChangePasswordDialog.test.tsx
describe('ChangePasswordDialog', () => {
  it('validates password strength', async () => {
    // test
  })
  
  it('shows error when passwords do not match', async () => {
    // test
  })
})

// LanguageSwitcher.test.tsx
describe('LanguageSwitcher', () => {
  it('toggles between PL and EN', async () => {
    // test
  })
  
  it('persists language in localStorage', async () => {
    // test
  })
})
```

---

## Walidacja

```bash
npm run lint
npm run type-check
npm run build
npm test
```

---

## Commity

```bash
# Backend endpoint dla US-K-15 (wymagany przed UI)
git add .
git commit -m "backend(messages): export thread to PDF US-K-15"

# Frontend commity
git commit -m "frontend(admin): RODO panels US-A-10..13"
git commit -m "frontend(auth): change-password dialog US-P-09"
git commit -m "frontend(inbox): thread actions delegation US-K-14"
git commit -m "frontend(inbox): export to PDF button US-K-15"
git commit -m "frontend(i18n): setup react-i18next infra"
git commit -m "frontend(i18n): translate auth + dashboard + settings + admin/users"
git commit -m "frontend(i18n): add LanguageSwitcher in settings"
```

---

## Podsumowanie

| Obszar | Komponenty | User Stories |
|--------|------------|--------------|
| RODO Admin | 5 | US-A-10, US-A-11, US-A-12, US-A-13 |
| Auth | 1 | US-P-09 |
| Inbox | 3 | US-K-14, US-K-15 |
| i18n | 3 | US-S-17 |

**Razem:** 12 komponentów, 8 user stories

---

**Autor:** Technical Writer (kpt-dokumentalista)  
**Data:** 2026-04-27
