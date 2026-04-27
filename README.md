# KPTEST - System Telemedyczny

Kompleksowy system telemedyczny do zarządzania projektami terapeutycznymi z integracją HIS.

![Status](https://img.shields.io/badge/status-complete-success)
![Backend](https://img.shields.io/badge/backend-100%25-success)
![Frontend](https://img.shields.io/badge/frontend-100%25-success)
![Mobile](https://img.shields.io/badge/mobile-100%25-success)
![Tests](https://img.shields.io/badge/tests-100%25-success)
![Coverage](https://img.shields.io/badge/coverage-80%25%2B-success)

## 🚀 Quick Start

### Klonowanie repozytorium

```bash
git clone https://github.com/AbdullZair/kptest-workspace.git
cd kptest-workspace
```

### Uruchomienie z Docker Compose

```bash
# Uruchomienie wszystkich usług
docker compose up -d

# Sprawdzenie statusu
docker compose ps

# Logi
docker compose logs -f
```

### Dostęp do aplikacji

| Usługa | URL | Port |
|--------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8080/api/v1 | 8080 |
| HIS Mock | http://localhost:8081 | 8081 |
| Swagger UI | http://localhost:8080/swagger-ui.html | 8080 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

### Domyślne konto administratora

```
Email: admin@kptest.pl
Password: Admin123!
```

## 📊 Status

| Component | Status | Tests | Coverage |
|-----------|--------|-------|----------|
| Backend | ✅ 100% | 167/167 | 80%+ |
| Frontend | ✅ 100% | 369/369 | 80%+ |
| Mobile | ✅ 100% | - | - |
| DevOps | ✅ 100% | - | - |

## 📁 Struktura Projektu

```
kptest-workspace/
├── backend/              # Spring Boot API (Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/     # Kod źródłowy
│   │   │   └── resources/ # Konfiguracja
│   │   └── test/         # Testy jednostkowe
│   ├── build.gradle
│   └── README.md
│
├── frontend/             # React Web App (TypeScript)
│   ├── src/
│   │   ├── app/          # Redux store
│   │   ├── components/   # UI Components
│   │   ├── features/     # Feature modules
│   │   ├── pages/        # Pages
│   │   └── services/     # API client
│   ├── package.json
│   └── README.md
│
├── mobile/               # React Native App (Expo)
│   ├── app/              # App screens
│   ├── components/       # Shared components
│   ├── features/         # Feature modules
│   └── README.md
│
├── devops/               # Infrastructure
│   ├── docker/           # Dockerfiles
│   ├── k8s/              # Kubernetes manifests
│   └── github/           # CI/CD workflows
│
├── tests/                # E2E Tests (Playwright)
│   ├── e2e/              # Test scenarios
│   └── README.md
│
├── docs/                 # Documentation
│   ├── api/              # API documentation
│   ├── architecture/     # Architecture docs
│   ├── decisions/        # ADRs
│   └── setup/            # Setup guides
│
├── scripts/              # Automation scripts
│   ├── init_project.sh   # Project initialization
│   └── start.sh          # Quick start
│
└── docker-compose.yml    # Docker Compose config
```

## 🧪 Testy

### Backend Tests

```bash
cd backend

# Uruchomienie wszystkich testów
./gradlew test

# Z raportem pokrycia
./gradlew test jacocoTestReport

# Pojedynczy test
./gradlew test --tests "com.kptest.backend.controller.PatientControllerTest"
```

### Frontend E2E Tests

```bash
cd tests

# Instalacja zależności
npm install

# Uruchomienie testów
npm test

# Testy z UI
npm run test:ui

# Raport
npm run report
```

### Mobile Tests

```bash
cd mobile

# Testy jednostkowe
npm test

# Testy na emulatorze
npm run test:e2e
```

## 📖 Dokumentacja

Kompleksowa dokumentacja zawiera 57 plików w 10 kategoriach.

### API Documentation (13 plików)
- [API Reference](docs/api/README.md) - Przegląd wszystkich endpointów
- [Authentication](docs/api/authentication.md) - Autentykacja i autoryzacja
- [Patients](docs/api/patients.md) - Zarządzanie pacjentami
- [Projects](docs/api/projects.md) - Zarządzanie projektami
- [Messages](docs/api/messages.md) - Komunikacja
- [Calendar](docs/api/calendar.md) - Kalendarz i wydarzenia
- [Materials](docs/api/materials.md) - Materiały edukacyjne
- [Admin](docs/api/admin.md) - Endpointy administracyjne
- [Reports](docs/api/reports.md) - Raporty i eksport
- [Audit](docs/api/audit.md) - Logi audytowe
- [Backup](docs/api/backup.md) - Zarządzanie backup
- [Email](docs/api/email.md) - Powiadomienia email
- [SMS](docs/api/sms.md) - Powiadomienia SMS

### Architecture (10 plików)
- [System Overview](docs/architecture/system-overview.md) - Przegląd systemu
- [System Context C4](docs/architecture/system-context.md) - C4 Level 1
- [Container Diagram C4](docs/architecture/container.md) - C4 Level 2
- [Component Diagram C4](docs/architecture/component.md) - C4 Level 3
- [Data Flow DFD](docs/architecture/data-flow.md) - Diagram przepływu danych
- [Deployment K8s](docs/architecture/deployment.md) - Architektura Kubernetes
- [Security Architecture](docs/architecture/security-architecture.md) - Bezpieczeństwo
- [Data Model](docs/architecture/data-model.md) - Model danych
- [Sequence Diagrams](docs/architecture/sequence-diagrams.md) - Diagramy sekwencji

### ADR - Architecture Decision Records (9 plików)
- [ADR-001](docs/decisions/ADR-001-authentication-strategy.md) - Strategia autentykacji
- [ADR-002](docs/decisions/ADR-002-his-verification-workflow.md) - Workflow weryfikacji HIS
- [ADR-003](docs/decisions/ADR-003-patient-project-assignment.md) - Przypisanie pacjentów
- [ADR-004](docs/decisions/ADR-004-messaging-architecture.md) - Architektura komunikacji
- [ADR-005](docs/decisions/ADR-005-database-choice.md) - Wybór bazy danych
- [ADR-006](docs/decisions/ADR-006-authentication-strategy.md) - Strategia JWT
- [ADR-007](docs/decisions/ADR-007-microservices-vs-monolith.md) - Mikroserwisy vs Monolit
- [ADR-008](docs/decisions/ADR-008-frontend-architecture.md) - Architektura frontend
- [ADR-009](docs/decisions/ADR-009-mobile-architecture.md) - Architektura mobile

### Setup Guides (9 plików)
- [Local Development](docs/setup/local-development.md) - Środowisko lokalne
- [Production Deployment](docs/setup/production-deployment.md) - Deployment produkcyjny
- [Testing Guide](docs/setup/testing-guide.md) - Przewodnik testowania
- [HIS Integration](docs/setup/his-integration.md) - Integracja z HIS
- [SMS Provider Setup](docs/setup/sms-provider-setup.md) - Konfiguracja SMS
- [Email Provider Setup](docs/setup/email-provider-setup.md) - Konfiguracja email
- [Backup Procedure](docs/setup/backup-procedure.md) - Procedury backup
- [Disaster Recovery](docs/setup/disaster-recovery.md) - Disaster recovery

### User Guides (4 pliki)
- [Patient Guide](docs/user-guides/patient-guide.md) - Przewodnik pacjenta
- [Coordinator Guide](docs/user-guides/coordinator-guide.md) - Przewodnik koordynatora
- [Doctor Guide](docs/user-guides/doctor-guide.md) - Przewodnik lekarza
- [Admin Guide](docs/user-guides/admin-guide.md) - Przewodnik administratora

### Deployment (4 pliki)
- [Staging Deployment](docs/deployment/staging-deployment.md) - Deployment na staging
- [Production Deployment](docs/deployment/production-deployment.md) - Deployment na produkcję
- [Rollback Procedure](docs/deployment/rollback-procedure.md) - Procedura rollback
- [Blue-Green Deployment](docs/deployment/blue-green-deployment.md) - Blue-green deployment

### Operations (5 plików)
- [Monitoring](docs/operations/monitoring.md) - Monitoring systemu
- [Alerting](docs/operations/alerting.md) - Konfiguracja alertów
- [Troubleshooting](docs/operations/troubleshooting.md) - Rozwiązywanie problemów
- [Maintenance](docs/operations/maintenance.md) - Procedury maintenance
- [Scaling](docs/operations/scaling.md) - Skalowanie systemu

### Full Documentation Index
- [Complete Documentation](docs/README.md) - Pełny indeks wszystkich dokumentów

## 📊 Metryki Projektu

| Kategoria | Metryka | Wartość |
|-----------|---------|---------|
| **Kod** | Total Files | 6500+ |
| | Lines of Code | 45,000+ |
| | Java Files | 150+ |
| | TypeScript Files | 280+ |
| **Backend** | API Endpoints | 85 |
| | Database Tables | 20 |
| | JPA Entities | 20 |
| | Services | 15 |
| **Frontend** | Pages | 25+ |
| | Components | 100+ |
| | RTK Query Hooks | 80+ |
| **Tests** | Unit Tests | 167 |
| | E2E Tests | 369 |
| | Coverage | 80%+ |
| **DevOps** | Docker Images | 5 |
| | K8s Manifests | 10+ |
| | CI/CD Workflows | 5 |

## 🛠️ Technologie

### Backend
- **Language:** Java 21
- **Framework:** Spring Boot 3.2
- **Security:** Spring Security 6, JWT
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **ORM:** Hibernate 6

### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5
- **State:** Redux Toolkit + RTK Query
- **Styling:** TailwindCSS 3
- **Forms:** React Hook Form + Zod

### Mobile
- **Framework:** React Native 0.73
- **Platform:** Expo SDK 50
- **Language:** TypeScript 5
- **Navigation:** Expo Router

### DevOps
- **Containerization:** Docker
- **Orchestration:** Kubernetes 1.29
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana

## 🔧 Rozwój

### Wymagania

- Java 21+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Konfiguracja lokalna

```bash
# Inicjalizacja projektu
./init_project.sh

# Start środowiska
./start.sh

# Alternatywnie z Docker
docker compose up -d
```

### Zmienne środowiskowe

```bash
# .env (skopiuj z .env.example)
DATABASE_URL=jdbc:postgresql://localhost:5432/kptest
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 🚨 Troubleshooting

### Częste problemy

**Port already in use:**
```bash
# Sprawdź zajęte porty
lsof -i :8080
lsof -i :3000

# Zakończ proces
kill -9 <PID>
```

**Database connection failed:**
```bash
# Sprawdź status bazy
docker compose ps postgres

# Restart
docker compose restart postgres
```

**Tests failing:**
```bash
# Wyczyść cache
./gradlew clean
npm run clean

# Ponów testy
./gradlew test
npm test
```

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

## 👥 Zespół

- **ARCHITEKT** - Lead Architect
- **BACKEND DEV** - Spring Boot Expert
- **FRONTEND DEV** - React Expert
- **MOBILE DEV** - React Native Expert
- **DEVOPS ENGINEER** - Infrastructure
- **TECHNICAL WRITER** - Documentation

## 📞 Kontakt

- **Repository:** https://github.com/AbdullZair/kptest-workspace
- **Documentation:** https://github.com/AbdullZair/kptest-workspace/docs

---

**KPTEST Team** © 2026

*Version: 1.0.0 | Last Updated: 2026-04-24*
