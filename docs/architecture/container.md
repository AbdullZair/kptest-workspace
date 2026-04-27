---
name: Container Diagram (C4 Level 2)
description: C4 model Level 2 - Container diagram showing high-level technology choices
type: architecture
---

# Container Diagram (C4 Level 2)

## Overview

The Container diagram breaks down the KPTEST system into the main technical building blocks (containers). Each container represents an independently deployable unit such as a web application, mobile app, microservice, or database.

## C4 Level 2 Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  USERS                                       │
│                                                                              │
│         ┌─────────────────┐                ┌─────────────────┐              │
│         │     Patient     │                │  Staff (Web)    │              │
│         │   (Mobile App)  │                │   (Browser)     │              │
│         └────────┬────────┘                └────────┬────────┘              │
│                  │                                  │                        │
└──────────────────┼──────────────────────────────────┼────────────────────────┘
                   │                                  │
                   │ HTTPS/REST + WebSocket           │ HTTPS/REST             │
                   ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KPTEST SYSTEM                                     │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        API Gateway                                     │  │
│  │                   [Spring Boot + Security]                             │  │
│  │                                                                        │  │
│  │  • JWT Authentication       • Rate Limiting                            │  │
│  │  • Request Routing          • API Versioning                           │  │
│  │  • CORS Handling            • Request/Response Logging                 │  │
│  └─────────────────────────────┬─────────────────────────────────────────┘  │
│                                │                                            │
│         ┌──────────────────────┼──────────────────────┐                     │
│         │                      │                      │                     │
│         ▼                      ▼                      ▼                     │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │   Mobile    │       │  Web Portal │       │   Admin     │               │
│  │    BFF      │       │   Backend   │       │   Backend   │               │
│  │  [Node.js]  │       │ [Spring Boot]│      │ [Spring Boot]│              │
│  │             │       │             │       │             │               │
│  │ • Mobile-   │       │ • Patient   │       │ • User      │               │
│  │   specific  │       │   Mgmt      │       │   Mgmt      │               │
│  │   endpoints │       │ • Project   │       │ • System    │               │
│  │ • Push      │       │   Mgmt      │       │   Config    │               │
│  │   notifs    │       │ • Reports   │       │ • Audit     │               │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘               │
│         │                     │                      │                      │
│         └─────────────────────┼──────────────────────┘                      │
│                               │                                             │
│                               ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       Core Services                                    │  │
│  │                     [Spring Boot Services]                             │  │
│  │                                                                        │  │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐              │  │
│  │  │  Patient  │ │  Project  │ │Communication│ │ Calendar  │              │  │
│  │  │  Service  │ │  Service  │ │  Service  │ │  Service  │              │  │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘              │  │
│  │                                                                        │  │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐              │  │
│  │  │ Education │ │  Report   │ │  Audit    │ │  Backup   │              │  │
│  │  │  Service  │ │  Service  │ │  Service  │ │  Service  │              │  │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘              │  │
│  └─────────────────────────────┬─────────────────────────────────────────┘  │
│                                │                                            │
│         ┌──────────────────────┼──────────────────────┐                     │
│         │                      │                      │                     │
│         ▼                      ▼                      ▼                     │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │  PostgreSQL │       │    Redis    │       │File Storage │               │
│  │  Database   │       │    Cache    │       │   (S3)      │               │
│  │             │       │             │       │             │               │
│  │ • Users     │       │ • Sessions  │       │ • Materials │               │
│  │ • Patients  │       │ • Cache     │       │ • Attach-   │               │
│  │ • Projects  │       │ • Rate      │       │   ments     │               │
│  │ • Messages  │       │   Limiting  │       │ • Exports   │               │
│  │ • Events    │       │ • 2FA Codes │       │             │               │
│  │ • Audit     │       │             │       │             │               │
│  └─────────────┘       └─────────────┘       └─────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
                   │                                  │
                   │                                  │
                   ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SYSTEMS                                    │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  HIS System  │    │  Email       │    │  SMS         │                  │
│  │  (REST API)  │    │  (SendGrid)  │    │  (Twilio)    │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐                                       │
│  │  FCM/APNs    │    │  Monitoring  │                                       │
│  │  (Push)      │    │  (Prometheus)│                                       │
│  └──────────────┘    └──────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Containers

### 1. Mobile App (React Native)

**Name:** KPTEST Mobile Application

**Technology:** React Native + Expo SDK 50

**Responsibilities:**
- Patient-facing mobile interface
- Task completion and tracking
- Educational material consumption
- Secure messaging
- Push notification handling
- Offline-first data access

**Key Features:**
- Biometric authentication (Face ID/Touch ID)
- Offline mode with local persistence
- Background synchronization
- Push notifications (FCM/APNs)
- Responsive design for iOS/Android

**Data Storage:**
- AsyncStorage for app state
- SecureStore for sensitive data (tokens)
- SQLite for offline data

**Communication:**
- REST API over HTTPS
- WebSocket for real-time updates
- Push notification channels

---

### 2. Web Portal (React SPA)

**Name:** KPTEST Web Portal

**Technology:** React 18 + TypeScript + Vite

**Responsibilities:**
- Staff-facing web interface
- Patient management
- Project coordination
- Reporting and analytics
- System administration

**Key Features:**
- Role-based access control
- Real-time updates (WebSocket)
- Responsive design (desktop/tablet)
- WCAG 2.1 AA accessibility
- Feature-Sliced Design architecture

**State Management:**
- Redux Toolkit for global state
- RTK Query for API caching
- Local storage for preferences

**Communication:**
- REST API over HTTPS
- WebSocket for real-time features

---

### 3. API Gateway

**Name:** KPTEST API Gateway

**Technology:** Spring Boot 3.2 + Spring Security 6

**Responsibilities:**
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- Request/response logging
- API versioning
- CORS handling

**Key Features:**
- JWT token validation
- Role-based access control (RBAC)
- Rate limiting (Redis-backed)
- Request validation
- Response compression

**Configuration:**
```yaml
server:
  port: 8080
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER}
```

---

### 4. Backend Services

#### Patient Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Patient CRUD operations
- Patient search and filtering
- HIS verification workflow
- Patient statistics

**API Endpoints:**
```
GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/{id}
PUT    /api/v1/patients/{id}
POST   /api/v1/patients/verify
```

---

#### Project Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Therapeutic project management
- Patient-project assignments
- Project team management
- Project statistics

**API Endpoints:**
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PUT    /api/v1/projects/{id}
POST   /api/v1/projects/{id}/patients
```

---

#### Communication Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Message thread management
- File attachment handling
- Email notifications
- Push notifications

**API Endpoints:**
```
GET    /api/v1/messages
POST   /api/v1/messages
GET    /api/v1/messages/conversations
GET    /api/v1/messages/conversations/{id}
```

---

#### Calendar Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Event scheduling
- Appointment management
- Reminder configuration
- iCal export

**API Endpoints:**
```
GET    /api/v1/calendar/events
POST   /api/v1/calendar/events
GET    /api/v1/calendar/events/{id}
DELETE /api/v1/calendar/events/{id}
```

---

#### Education Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Educational material management
- Material progress tracking
- Material statistics
- Offline download support

**API Endpoints:**
```
GET    /api/v1/materials
POST   /api/v1/materials
GET    /api/v1/materials/{id}
POST   /api/v1/materials/{id}/download
```

---

#### Report Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Adherence/compliance reports
- Project statistics
- Patient progress reports
- Report exports

**API Endpoints:**
```
GET    /api/v1/reports/patients/{id}/adherence
GET    /api/v1/reports/projects/{id}/statistics
POST   /api/v1/reports/export
```

---

#### Audit Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Activity logging
- Data access logging
- Audit trail export
- Compliance reporting

**API Endpoints:**
```
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/audit-logs/{id}
POST   /api/v1/admin/audit-logs/export
```

---

#### Backup Service

**Technology:** Spring Boot 3.2

**Responsibilities:**
- Database backup creation
- Backup restoration
- Backup scheduling
- Storage management

**API Endpoints:**
```
POST   /api/v1/admin/backup/create
GET    /api/v1/admin/backup/history
POST   /api/v1/admin/backup/restore/{id}
```

---

### 5. PostgreSQL Database

**Name:** KPTEST Primary Database

**Technology:** PostgreSQL 15

**Responsibilities:**
- Persistent data storage
- Transaction management
- Data integrity enforcement
- Query optimization

**Key Tables:**
- `users` - User accounts
- `patients` - Patient records
- `projects` - Therapeutic projects
- `messages` - Message threads
- `therapy_events` - Calendar events
- `educational_materials` - Learning materials
- `audit_log` - Audit trail
- `notifications` - Push notifications

**Schema:**
```sql
CREATE SCHEMA kptest;

-- Example table
CREATE TABLE kptest.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

### 6. Redis Cache

**Name:** KPTEST Cache Layer

**Technology:** Redis 7

**Responsibilities:**
- Session storage
- API response caching
- Rate limiting counters
- 2FA code storage
- Background job queues

**Key Usage:**
```
Sessions: session:{userId} → JWT refresh token
Cache: cache:{endpoint}:{params} → Cached response
Rate Limit: ratelimit:{userId}:{endpoint} → Counter
2FA Codes: 2fa:{userId} → TOTP secret
```

---

### 7. File Storage

**Name:** KPTEST File Storage

**Technology:** AWS S3 / MinIO

**Responsibilities:**
- Educational material storage
- Message attachment storage
- Export file storage
- Backup storage

**Bucket Structure:**
```
kptest-files/
├── materials/
│   ├── {projectId}/
│   │   └── {materialId}.pdf
├── attachments/
│   └── {messageId}/
│       └── {attachmentId}.jpg
├── exports/
│   └── {userId}/
│       └── report-{date}.csv
└── backups/
    └── backup-{timestamp}.sql.gz
```

---

## Communication Patterns

### Synchronous (REST)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│ Service  │
│          │◀────│  Gateway │◀────│          │
└──────────┘     └──────────┘     └──────────┘
     HTTPS             HTTPS
```

### Asynchronous (Events)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Service  │────▶│  Redis   │────▶│ Service  │
│   A      │     │  Pub/Sub │     │   B      │
└──────────┘     └──────────┘     └──────────┘
```

### Real-time (WebSocket)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │◀───▶│   API    │◀───▶│ Service  │
│          │     │  Gateway │     │          │
└──────────┘     └──────────┘     └──────────┘
    WebSocket
```

---

## Technology Summary

| Container | Technology | Purpose |
|-----------|------------|---------|
| Mobile App | React Native + Expo | Patient mobile interface |
| Web Portal | React 18 + TypeScript | Staff web interface |
| API Gateway | Spring Boot 3.2 | Request routing, auth |
| Backend Services | Spring Boot 3.2 | Business logic |
| Database | PostgreSQL 15 | Primary data store |
| Cache | Redis 7 | Caching, sessions |
| File Storage | S3/MinIO | File storage |

---

## Deployment Units

### Docker Containers

```dockerfile
# Backend
FROM eclipse-temurin:21-jre
COPY backend.jar /app/
CMD ["java", "-jar", "/app/backend.jar"]

# Frontend
FROM node:20-alpine
COPY dist/ /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]

# Mobile (Build)
FROM node:20-alpine
WORKDIR /app
COPY mobile/ .
RUN npm install && npm run build
```

### Kubernetes Pods

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend
spec:
  replicas: 5
  selector:
    matchLabels:
      app: backend
  template:
    spec:
      containers:
      - name: backend
        image: kptest/backend:latest
        ports:
        - containerPort: 8080
```

---

**Document Version:** 1.0
**Last Updated:** 2026-04-24
**Author:** KPTEST Architect Agent
