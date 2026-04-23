---
name: System Architecture Overview
description: Wysokopoziomowy widok architektury systemu KPTEST
type: architecture
---

# System Architecture Overview

## Diagram Kontekstowy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            KPTEST System                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API Gateway                               │   │
│  │                    (Spring Boot + Security)                       │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │    Auth      │  │   Patient    │  │   Project    │            │   │
│  │  │   Service    │  │   Service    │  │   Service    │            │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │  Communication│  │   Calendar   │  │   Education  │            │   │
│  │  │   Service    │  │   Service    │  │   Service    │            │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐                               │   │
│  │  │    Audit     │  │     HIS      │                               │   │
│  │  │   Service    │  │  Integration │                               │   │
│  │  └──────────────┘  └──────────────┘                               │   │
│  └───────────────────────────┬───────────────────────────────────────┘   │
│                              │                                            │
└──────────────────────────────┼────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  PostgreSQL   │     │     Redis     │     │  File Storage │
│   (Primary)   │     │   (Cache)     │     │  (S3/Local)   │
└───────────────┘     └───────────────┘     └───────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           External Systems                              │
│                                                                          │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐         │
│  │  HIS (Hospital│     │  FCM/APNs     │     │  SMS Gateway  │         │
│  │  Info System) │     │  (Push Notif) │     │  (Optional)   │         │
│  └───────────────┘     └───────────────┘     └───────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              Clients                                    │
│                                                                          │
│  ┌─────────────────────────┐           ┌─────────────────────────┐     │
│  │    Mobile App           │           │    Portal Webowy        │     │
│  │  (React Native + Expo)  │           │  (React 18 + Vite)      │     │
│  │                         │           │                         │     │
│  │  - Pacjenci             │           │  - Koordynator          │     │
│  │  - iOS + Android        │           │  - Lekarz/Terapeuta     │     │
│  │  - Offline-first        │           │  - Administrator        │     │
│  └─────────────────────────┘           └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Warstwy Architektury

### 1. Warstwa Prezentacji (Clients)

#### Mobile App (React Native)
- **Framework:** Expo (React Native)
- **Stan:** Redux Toolkit + RTK Query
- **Nawigacja:** React Navigation v6
- **Features:**
  - Offline-first architecture
  - Push notifications (FCM/APNs)
  - Biometria (Face ID/Touch ID)
  - Synchronizacja w tle

#### Portal Webowy (React)
- **Framework:** React 18 + Vite
- **Stan:** Redux Toolkit + RTK Query
- **Styling:** TailwindCSS + Headless UI
- **Features:**
  - Feature-Sliced Design architecture
  - Responsive design (desktop/tablet)
  - WCAG 2.1 AA accessibility
  - Real-time updates (WebSocket)

### 2. Warstwa API (Gateway)

**Spring Boot 3 + Spring Security**

- **Authentication:** JWT + TOTP 2FA
- **Authorization:** RBAC (Role-Based Access Control)
- **API Versioning:** URL versioning (`/api/v1/`)
- **Rate Limiting:** Redis-based
- **Validation:** Bean Validation (JSR-380)
- **Documentation:** OpenAPI 3.0 (Swagger)

#### Kontrolery REST

```
/api/v1/
├── /auth/*              - Uwierzytelnianie
├── /patients/*          - Zarządzanie pacjentami
├── /projects/*          - Projekty terapeutyczne
├── /messages/*          - Komunikacja
├── /calendar/*          - Harmonogram
├── /materials/*         - Materiały edukacyjne
├── /reports/*           - Raporty i statystyki
├── /admin/*             - Administracja systemu
└── /his/*               - Integracja z HIS
```

### 3. Warstwa Biznesowa (Services)

#### Auth Service
- Rejestracja i logowanie
- 2FA generation/verification
- Password reset flow
- Account status management

#### Patient Service
- Patient profile management
- Emergency contacts
- HIS verification workflow
- Project enrollment

#### Project Service
- Therapeutic project CRUD
- Patient-project assignment
- Project team management
- Statistics and compliance

#### Communication Service
- Message threads (per project)
- File attachments
- Email notifications
- Push notifications

#### Calendar Service
- Event scheduling (individual/group/cyclic)
- Event status tracking
- iCal export
- Reminders configuration

#### Education Service
- Educational materials management
- Material progress tracking
- Offline download support
- Statistics (views, completion)

#### Audit Service
- Activity logging (who, what, when)
- RODO compliance (data access log)
- Audit trail export
- Sensitive operations monitoring

### 4. Warstwa Danych

#### PostgreSQL 15
**Schema:** `kptest`

**Kluczowe tabele:**
- `users` - wszyscy użytkownicy systemu
- `patients` - dane pacjentów
- `staff` - dane personelu
- `projects` - projekty terapeutyczne
- `patient_projects` - przypisania pacjentów
- `messages` - wiadomości
- `therapy_events` - wydarzenia w kalendarzu
- `educational_materials` - materiały
- `audit_log` - dziennik audytu

#### Redis 7
**Zastosowanie:**
- Cache frequently accessed data
- Session storage (refresh tokens)
- Rate limiting counters
- Temporary 2FA codes
- Background job queues

#### File Storage
**Zastosowanie:**
- Educational materials (PDF, images, videos)
- Message attachments (max 10MB)
- Export files (CSV, PDF, iCal)

**Opcje:**
- Local storage (dev)
- AWS S3 / MinIO (prod)

### 5. Integracje Zewnętrzne

#### HIS (Hospital Information System)
**Zakres integracji:**
- Weryfikacja pacjenta (PESEL + nr kartoteki)
- Pobieranie danych demograficznych
- Walidacja istnienia pacjenta

**Nie obejmuje:**
- Pełna dokumentacja medyczna
- Historia wizyt z HIS

**Tryb pracy:**
- Sync na żądanie (on-demand)
- Fallback na tryb manualny
- Cache danych z HIS

#### Push Notifications
- **Firebase Cloud Messaging (FCM)** - Android
- **Apple Push Notification service (APNs)** - iOS
- **Topic-based** routing (per project)

#### SMS Gateway (Optional)
- Krytyczne powiadomienia
- 2FA codes (fallback)
- Dostawcy: SMSAPI, Twilio

## Security Architecture

### Authentication Flow

```
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Server  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  POST /auth/login                       │
     │  (email, password)                      │
     │────────────────────────────────────────>│
     │                                         │
     │                                         │ Verify credentials
     │                                         │ Check 2FA status
     │                                         │
     │  Response:                              │
     │  - 2FA required: true                   │
     │  - temp_token: "abc123..."              │
     │<────────────────────────────────────────│
     │                                         │
     │  POST /auth/2fa/verify                  │
     │  (temp_token, totp_code)                │
     │────────────────────────────────────────>│
     │                                         │ Verify TOTP
     │                                         │
     │  Response:                              │
     │  - access_token: "eyJ..." (JWT, 15min)  │
     │  - refresh_token: "xyz..." (7 days)     │
     │<────────────────────────────────────────│
```

### RBAC Matrix

| Endpoint | Admin | Koordynator | Lekarz | Pacjent |
|----------|-------|-------------|--------|---------|
| `GET /patients` | ✅ All | ✅ All | ✅ Project patients | ❌ |
| `GET /patients/{id}` | ✅ All | ✅ All | ✅ Project patients | ✅ Self only |
| `POST /patients` | ✅ | ✅ | ❌ | ❌ |
| `GET /projects` | ✅ All | ✅ All | ✅ Assigned | ✅ Assigned |
| `POST /projects` | ✅ | ✅ | ❌ | ❌ |
| `POST /projects/{id}/patients` | ✅ | ✅ | ❌ | ❌ |
| `GET /messages` | ✅ | ✅ | ✅ Assigned threads | ✅ Self threads |
| `POST /messages` | ✅ | ✅ | ✅ | ✅ |
| `GET /admin/*` | ✅ | ❌ | ❌ | ❌ |

### Data Protection

**In Transit:**
- TLS 1.3 encryption
- HTTPS enforcement
- Certificate pinning (mobile)

**At Rest:**
- AES-256 encryption for sensitive fields (PESEL, contact data)
- Database encryption (TDE)
- Encrypted backups

**Access Control:**
- Principle of least privilege
- Row-level security (RLS) in PostgreSQL
- Audit logging all access

## Deployment Architecture

### Development

```
┌─────────────────────────────────────────┐
│         Docker Compose (local)          │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Frontend │  │ Backend  │  │ HIS    ││
│  │  :3000   │  │  :8080   │  │ :8081  ││
│  └──────────┘  └──────────┘  └────────┘│
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ Postgres │  │  Redis   │             │
│  │  :5432   │  │  :6379   │             │
│  └──────────┘  └──────────┘             │
└─────────────────────────────────────────┘
```

### Production (Kubernetes)

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                    │
│                                                           │
│  ┌─────────────────┐         ┌─────────────────┐        │
│  │  Ingress Controller     │  │  Load Balancer  │        │
│  │  (nginx)          │     │  │  (cloud)        │        │
│  └────────┬──────────┘     └─────────────────┘        │
│           │                                             │
│  ┌────────▼──────────────────────────────────────────┐  │
│  │              Application Layer                     │  │
│  │                                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │  │
│  │  │ Frontend    │  │  Backend    │  │ HIS Mock   │ │  │
│  │  │ Deployment  │  │ Deployment  │  │ (optional) │ │  │
│  │  │ replicas: 3 │  │ replicas: 5 │  │            │ │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │  │
│  │                                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐                  │  │
│  │  │  HPA        │  │  HPA        │                  │  │
│  │  │ (auto-scale)│  │ (auto-scale)│                  │  │
│  │  └─────────────┘  └─────────────┘                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Data Layer                            │  │
│  │                                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │  │
│  │  │ PostgreSQL  │  │   Redis     │  │ File Store │ │  │
│  │  │ StatefulSet │  │ StatefulSet │  │   (S3)     │ │  │
│  │  │  replicas: 3│  │  replicas: 2│  │            │ │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Scalability Strategy

### Horizontal Scaling

- **Backend:** Stateless design → add replicas behind load balancer
- **Frontend:** CDN for static assets, edge caching
- **Database:** Read replicas for reporting queries
- **Redis:** Cluster mode for high availability

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| API response time (p95) | < 500ms | Redis cache, DB indexes |
| Page load time | < 2s | Code splitting, lazy loading |
| Mobile app start | < 3s | Hermes engine, bundle optimization |
| Concurrent users | 500+ (web), 5000+ (mobile) | Auto-scaling, CDN |
| Database queries | < 100ms (p95) | Query optimization, indexing |

## Monitoring & Observability

### Metrics (Prometheus)

- JVM metrics (heap, GC, threads)
- HTTP request rates and latencies
- Database connection pool stats
- Cache hit/miss ratios
- Business metrics (active patients, compliance scores)

### Logging (ELK Stack)

- Application logs (JSON format)
- Audit logs (separate index)
- Error tracking (Sentry)
- Log retention: 10 years (compliance)

### Alerting (Grafana/PagerDuty)

- High error rate (> 1%)
- High latency (p99 > 2s)
- Low disk space (< 10%)
- Pod restarts (> 3 in 5 min)
- HIS integration failures

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-23  
**Author:** KPTEST Architect Agent
