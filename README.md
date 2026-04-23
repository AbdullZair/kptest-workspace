# KPTEST - System Telemedyczny

Kompleksowy system telemedyczny do zarządzania projektami terapeutycznymi z integracją HIS.

## 📋 Spis treści

- [Architektura](#architektura)
- [Technologie](#technologie)
- [Quick Start](#quick-start)
- [Struktura projektu](#struktura-projektu)
- [Developers Guide](#developers-guide)
- [API Documentation](#api-documentation)

## 🏗 Architektura

```
┌─────────────────────────────────────────────────────────────┐
│                        KPTEST System                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Frontend   │  │   Mobile    │  │   HIS Integration   │  │
│  │  (React 18) │  │ (React Nat) │  │   (REST API)        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                    │
│                  ┌───────▼────────┐                          │
│                  │  API Gateway   │                          │
│                  │   (Spring)     │                          │
│                  └───────┬────────┘                          │
│                          │                                    │
│         ┌────────────────┼────────────────┐                  │
│         │                │                │                  │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐          │
│  │ PostgreSQL  │  │    Redis    │  │   Audit     │          │
│  │  (Primary)  │  │   (Cache)   │  │    Log      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠 Technologie

### Backend
- **Java 17+** z Spring Boot 3
- **Spring Security** z JWT authentication
- **PostgreSQL** - baza danych
- **Redis** - cache i sesje
- **Flyway** - migracje bazy
- **MapStruct** - mapping obiektów
- **TestContainers** - testy integracyjne

### Frontend (Web)
- **React 18** z TypeScript
- **Vite** - build tool
- **TailwindCSS** - styling
- **Redux Toolkit** + RTK Query
- **React Router v6**
- **React Hook Form** + Zod

### Mobile
- **React Native** (Expo)
- **TypeScript**
- **Redux Toolkit**
- **Expo Router** - navigation

### DevOps
- **Docker** + Docker Compose
- **GitHub Actions** - CI/CD
- **Flyway** - database migrations

## 🚀 Quick Start

### Wymagania
- Java 17+
- Node.js 20+
- Docker + Docker Compose
- Git

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/your-org/kptest-workspace.git
cd kptest-workspace
```

### 2. Inicjalizacja projektu

```bash
# Utwórz strukturę katalogów
chmod +x init_project.sh
./init_project.sh
```

### 3. Uruchomienie środowiska deweloperskiego

```bash
# Uruchom wszystkie usługi
docker-compose up -d

# Sprawdź status
docker-compose ps
```

### 4. Dostęp do aplikacji

| Usługa | URL | Port |
|--------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8080/api | 8080 |
| HIS Mock | http://localhost:8081 | 8081 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## 📁 Struktura projektu

```
kptest-workspace/
├── backend/                 # Spring Boot API
│   ├── src/main/java/com/kptest/
│   │   ├── domain/         # Encje biznesowe
│   │   ├── infrastructure/ # Implementacje
│   │   ├── application/    # Use cases
│   │   └── api/            # REST controllers
│   ├── src/main/resources/db/migration/
│   └── build.gradle
│
├── frontend/               # React Web App
│   ├── src/
│   │   ├── app/           # Konfiguracja aplikacji
│   │   ├── entities/      # Encje i slice'y
│   │   ├── features/      # Feature slices
│   │   ├── shared/        # Wspólne komponenty
│   │   └── widgets/       # Złożone widgety
│   └── package.json
│
├── mobile/                # React Native App
│   ├── src/
│   │   ├── app/          # Navigation
│   │   ├── features/     # Feature modules
│   │   └── shared/       # Shared utilities
│   └── package.json
│
├── devops/
│   ├── docker/           # Docker configs
│   ├── scripts/          # Automation scripts
│   └── his-mock/         # HIS mock server
│
└── docs/                 # Dokumentacja
```

## 👥 Role użytkowników

| Rola | Opis | Uprawnienia |
|------|------|-------------|
| **Admin** | Administrator systemu | Pełny dostęp |
| **Koordynator** | Koordynator terapii | Zarządzanie pacjentami, projektami |
| **Lekarz** | Terapeuta | Dostęp do pacjentów, czat, harmonogram |
| **Pacjent** | Uczeń/Pacjent | Własne materiały, czat, harmonogram |

## 🔐 Bezpieczeństwo

- **RBAC** - Role Based Access Control
- **JWT** - Token-based authentication
- **2FA** - Two-factor authentication (TOTP)
- **Audit Log** - Rejestracja wszystkich operacji
- **RODO** - Compliance z przepisami

## 📝 Developers Guide

### Backend

```bash
cd backend

# Build
./gradlew build

# Testy
./gradlew test

# Uruchomienie (dev)
./gradlew bootRun

# Migracje bazy
./gradlew flywayMigrate
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build

# Testy
npm run test
```

### Mobile

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Build Android
npm run build:android

# Build iOS
npm run build:ios
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login           # Logowanie
POST   /api/auth/register        # Rejestracja
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/2fa/enable      # Włącz 2FA
POST   /api/auth/2fa/verify      # Weryfikuj 2FA
```

### Patients
```
GET    /api/patients             # Lista pacjentów
GET    /api/patients/{id}        # Szczegóły pacjenta
POST   /api/patients             # Dodaj pacjenta
PUT    /api/patients/{id}        # Aktualizuj pacjenta
DELETE /api/patients/{id}        # Usuń pacjenta
```

### Therapeutic Projects
```
GET    /api/projects             # Lista projektów
POST   /api/projects             # Utwórz projekt
GET    /api/projects/{id}        # Szczegóły projektu
PUT    /api/projects/{id}        # Aktualizuj projekt
```

## 🔧 Konfiguracja

### Zmienne środowiskowe (backend)

```bash
# Database
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# HIS Integration
HIS_BASE_URL=http://his-provider.example.com
HIS_API_KEY=your-api-key

# Email (2FA)
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=noreply@kptest.com
MAIL_PASSWORD=your-app-password
```

## 📊 Monitoring

```bash
# Health check
curl http://localhost:8080/api/actuator/health

# Metrics
curl http://localhost:8080/api/actuator/metrics
```

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

---

**KPTEST Team** © 2024
