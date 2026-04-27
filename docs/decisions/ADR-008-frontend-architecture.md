# ADR-008: Frontend Architecture

## Status

ACCEPTED

## Date

2025-11-01

## Context

The KPTEST telemedicine system requires a web application for staff (coordinators, therapists, admins) that:
- Provides rich, interactive UI for managing patients and projects
- Supports real-time updates (messages, notifications)
- Works across desktop and tablet devices
- Maintains high performance with large datasets
- Follows accessibility standards (WCAG 2.1 AA)
- Enables efficient development and maintenance

Key requirements:
1. **Performance** - Fast load times, smooth interactions
2. **Scalability** - Handle 100+ concurrent users
3. **State Management** - Complex application state
4. **API Integration** - REST API consumption
5. **Type Safety** - Reduce runtime errors
6. **Testing** - Comprehensive test coverage
7. **Accessibility** - WCAG 2.1 AA compliance

## Decision

We will implement the web portal using **React 18 with TypeScript, Redux Toolkit + RTK Query, and TailwindCSS**.

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Frontend Stack                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Core Framework                                  │    │
│  │                                                                       │    │
│  │  React 18  •  TypeScript 5  •  Vite                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      State Management                                │    │
│  │                                                                       │    │
│  │  Redux Toolkit  •  RTK Query  •  React Context                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      UI & Styling                                    │    │
│  │                                                                       │    │
│  │  TailwindCSS 3  •  Headless UI  •  Radix UI                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Forms & Validation                              │    │
│  │                                                                       │    │
│  │  React Hook Form  •  Zod                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Testing                                         │    │
│  │                                                                       │    │
│  │  Jest  •  React Testing Library  •  Playwright                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Additional Libraries                            │    │
│  │                                                                       │    │
│  │  Recharts  •  date-fns  •  axios  •  react-router-dom                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Project Structure (Feature-Sliced Design)

```
frontend/
├── src/
│   ├── app/                      # Application initialization
│   │   ├── providers/            # Context providers
│   │   │   ├── StoreProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── QueryProvider.tsx
│   │   ├── styles/               # Global styles
│   │   │   └── globals.css
│   │   └── App.tsx
│   │
│   ├── pages/                    # Page components (routing)
│   │   ├── login/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── patients/
│   │   │   ├── PatientsListPage.tsx
│   │   │   └── PatientDetailPage.tsx
│   │   ├── projects/
│   │   │   ├── ProjectsListPage.tsx
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── messages/
│   │   │   └── MessagesPage.tsx
│   │   ├── admin/
│   │   │   └── AdminPage.tsx
│   │   └── not-found/
│   │       └── NotFoundPage.tsx
│   │
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── slices/
│   │   │       └── authSlice.ts
│   │   │
│   │   ├── patients/
│   │   │   ├── components/
│   │   │   │   ├── PatientList.tsx
│   │   │   │   ├── PatientCard.tsx
│   │   │   │   ├── PatientForm.tsx
│   │   │   │   └── PatientSearch.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePatients.ts
│   │   │   └── slices/
│   │   │       └── patientsSlice.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── slices/
│   │   │
│   │   ├── messages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── slices/
│   │   │
│   │   └── reports/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── slices/
│   │
│   ├── entities/                 # Business entities
│   │   ├── user/
│   │   │   ├── types.ts
│   │   │   └── constants.ts
│   │   ├── patient/
│   │   │   ├── types.ts
│   │   │   └── selectors.ts
│   │   ├── project/
│   │   │   └── types.ts
│   │   └── message/
│   │       └── types.ts
│   │
│   ├── shared/                   # Shared resources
│   │   ├── api/                  # API client
│   │   │   ├── api.ts
│   │   │   └── endpoints.ts
│   │   ├── components/           # UI components
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── feedback/
│   │   │       ├── Toast.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   ├── hooks/                # Shared hooks
│   │   │   ├── useDebounce.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── utils/                # Utilities
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── types/                # Shared types
│   │       └── common.ts
│   │
│   └── widgets/                  # Complex UI blocks
│       ├── PatientListWidget/
│       ├── ProjectStatsWidget/
│       └── MessagesWidget/
│
├── public/
├── tests/
│   ├── e2e/
│   └── integration/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── jest.config.js
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      State Management                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Redux Store                                     │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │  authSlice   │  │ patientsSlice│  │ projectsSlice│               │    │
│  │  │              │  │              │  │              │               │    │
│  │  │ • user       │  │ • list       │  │ • list       │               │    │
│  │  │ • token      │  │ • selected   │  │ • selected   │               │    │
│  │  │ • 2fa        │  │ • filters    │  │ • filters    │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ messagesSlice│  │ calendarSlice│  │  adminSlice  │               │    │
│  │  │              │  │              │  │              │               │    │
│  │  │ • threads    │  │ • events     │  │ • users      │               │    │
│  │  │ • selected   │  │ • selected   │  │ • settings   │               │    │
│  │  │ • composing  │  │ • filters    │  │ • audit      │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      RTK Query API                                   │    │
│  │                                                                       │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                    apiSlice.ts                                │   │    │
│  │  │                                                               │   │    │
│  │  │  export const apiSlice = createApi({                         │   │    │
│  │  │    baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),        │   │    │
│  │  │    endpoints: (builder) => ({                                │   │    │
│  │  │      login: builder.mutation({ ... }),                       │   │    │
│  │  │      getPatients: builder.query({ ... }),                    │   │    │
│  │  │      getProjects: builder.query({ ... }),                    │   │    │
│  │  │      getMessages: builder.query({ ... }),                    │   │    │
│  │  │    }),                                                       │   │    │
│  │  │  });                                                         │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Local State                                     │    │
│  │                                                                       │    │
│  │  • Component state (useState)                                        │    │
│  │  • Form state (React Hook Form)                                      │    │
│  │  • UI state (modals, dropdowns)                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Integration (RTK Query)

```typescript
// src/shared/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Patient', 'Project', 'Message', 'User'],
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Patients
    getPatients: builder.query<Patient[], GetPatientsParams>({
      query: (params) => ({
        url: '/patients',
        params,
      }),
      providesTags: ['Patient'],
    }),
    
    getPatient: builder.query<Patient, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    
    createPatient: builder.mutation<Patient, CreatePatientRequest>({
      query: (patient) => ({
        url: '/patients',
        method: 'POST',
        body: patient,
      }),
      invalidatesTags: ['Patient'],
    }),
    
    // Projects
    getProjects: builder.query<Project[], GetProjectsParams>({
      query: (params) => ({
        url: '/projects',
        params,
      }),
      providesTags: ['Project'],
    }),
    
    // Messages
    getConversations: builder.query<Conversation[], void>({
      query: () => '/messages/conversations',
      providesTags: ['Message'],
    }),
    
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (message) => ({
        url: '/messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useGetProjectsQuery,
  useGetConversationsQuery,
  useSendMessageMutation,
} = apiSlice;
```

### Component Architecture

```tsx
// src/features/patients/components/PatientList.tsx
import React, { useState, useMemo } from 'react';
import { useGetPatientsQuery } from '../api/patientsApi';
import { PatientCard } from './PatientCard';
import { PatientSearch } from './PatientSearch';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { Spinner } from '../../../shared/components/feedback/Spinner';
import { Patient } from '../../../entities/patient/types';

interface PatientListProps {
  onPatientSelect: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const { data: patients, isLoading, error } = useGetPatientsQuery({
    search: searchTerm,
    page: page - 1,
    size: pageSize,
  });
  
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => 
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);
  
  if (isLoading) {
    return <Spinner size="lg" />;
  }
  
  if (error) {
    return <div>Error loading patients</div>;
  }
  
  return (
    <div className="space-y-4">
      <PatientSearch 
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={() => onPatientSelect(patient)}
          />
        ))}
      </div>
      
      <Pagination
        currentPage={page}
        totalPages={Math.ceil((patients?.length || 0) / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
```

## Consequences

### Positive

1. **Type Safety** - TypeScript catches errors at compile time
2. **Performance** - React 18 concurrent features, memoization
3. **Developer Experience** - Hot reload, excellent tooling
4. **State Management** - Predictable state with Redux
5. **API Caching** - RTK Query handles caching automatically
6. **Styling** - TailwindCSS for rapid UI development
7. **Accessibility** - Headless UI components are accessible by default

### Negative

1. **Bundle Size** - React + Redux + dependencies (~200KB gzipped)
2. **Learning Curve** - TypeScript, Redux patterns
3. **Boilerplate** - More code than simpler frameworks
4. **Build Complexity** - Vite configuration, TypeScript setup

### Performance Optimizations

```typescript
// Code splitting
const AdminPage = lazy(() => import('../../pages/admin/AdminPage'));

// Memoization
const PatientCard = memo(({ patient, onClick }) => {
  // Component logic
});

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

// Image optimization
import { LazyLoadImage } from 'react-lazy-load-image-component';
```

## Testing Strategy

```typescript
// Unit tests (Jest + React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientList } from './PatientList';

describe('PatientList', () => {
  it('renders loading state', () => {
    render(<PatientList onPatientSelect={() => {}} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
  
  it('renders patients when loaded', async () => {
    render(<PatientList onPatientSelect={() => {}} />);
    
    expect(await screen.findByText('Jan Kowalski')).toBeInTheDocument();
  });
  
  it('calls onPatientSelect when card clicked', async () => {
    const mockSelect = jest.fn();
    render(<PatientList onPatientSelect={mockSelect} />);
    
    const card = await screen.findByTestId('patient-card-1');
    fireEvent.click(card);
    
    expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      firstName: 'Jan',
    }));
  });
});
```

## Alternatives Considered

### Vue 3 + Pinia

**Pros:**
- Simpler learning curve
- Smaller bundle size
- Built-in state management

**Cons:**
- Smaller ecosystem
- Less enterprise adoption
- Fewer TypeScript examples

### Angular

**Pros:**
- Full framework (batteries included)
- Strong TypeScript integration
- Enterprise support

**Cons:**
- Steeper learning curve
- More opinionated
- Larger bundle size

### Next.js

**Pros:**
- Server-side rendering
- File-based routing
- Excellent DX

**Cons:**
- Server infrastructure needed
- Less control over bundling
- Overkill for admin portal

---

**Authors:** KPTEST Frontend Agent
**Reviewers:** Frontend Team, UX Team
