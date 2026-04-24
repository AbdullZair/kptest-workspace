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

### API Documentation
- [OpenAPI Specification](docs/api/openapi.yaml)
- [Endpoints Reference](docs/api/endpoints.md)
- [Authentication Guide](docs/api/auth.md)
- [Error Codes](docs/api/errors.md)

### Architecture
- [System Overview](docs/architecture/overview.md)
- [Component Diagram](docs/architecture/components.md)
- [Data Flow](docs/architecture/dataflow.md)
- [Integration Patterns](docs/architecture/integrations.md)

### ADR (Architecture Decision Records)
- [ADR-001: Technology Stack](docs/decisions/adr-001.md)
- [ADR-002: Database Design](docs/decisions/adr-002.md)
- [ADR-003: Authentication](docs/decisions/adr-003.md)
- [ADR-004: Architecture Style](docs/decisions/adr-004.md)

### Setup Guides
- [Development Setup](docs/setup/development.md)
- [Production Deployment](docs/setup/production.md)
- [Troubleshooting](docs/setup/troubleshooting.md)

### Reports
- [Final Project Report](FINAL_PROJECT_REPORT.md)
- [E2E Test Report](E2E_COMPLETE_REPORT.md)
- [Integration Report](INTEGRATION_FIX_REPORT.md)

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
