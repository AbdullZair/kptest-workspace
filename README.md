# KPTEST - System Telemedyczny

Kompleksowy system telemedyczny do zarządzania projektami terapeutycznymi z integracją HIS.

## Status (2026-04-24)

### ✅ Ukończone Iteracje:
- **Iteracja 1:** Auth + 2FA + JWT (100%)
- **Iteracja 2:** 5 Feature Modules (100%)
- **Iteracja 3:** Reports + Admin + Notifications (100%)

### 📊 Test Status:
- **Unit Tests:** 111/167 passed (66.5%)
- **E2E Tests:** 46/369 passed (12.5%)
- **Coverage:** 5.8% (target: >80%)

### 🚀 Quick Start:
```bash
docker compose up -d
./scripts/seed-all.sh
```

### 📡 API Endpoints:
- Authentication: 9 endpoints
- Patients: 7 endpoints
- Projects: 10 endpoints
- Messages: 8 endpoints
- Calendar: 9 endpoints
- Materials: 10 endpoints
- Reports: 7 endpoints
- Admin: 18 endpoints

**Total: 85 API endpoints**

---

## 📋 Spis treści

- [Architektura](#architektura)
- [Technologie](#technologie)
- [Iteracja 2 - Features](#iteracja-2---features)
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

## 🎯 Iteracja 2 - Features

Iteracja 2 rozszerza system o pełną funkcjonalność zarządzania terapią pacjentów:

### Pacjenci
- CRUD pacjentów z integracją HIS
- Weryfikacja tożsamości w systemie szpitalnym
- Wyszukiwanie po PESEL, nazwisku, HIS ID
- Kontakt awaryjny

### Projekty Terapeutyczne
- Tworzenie i zarządzanie projektami
- Przypisywanie pacjentów do projektów (indywidualnie i grupowo)
- Zarządzanie zespołem projektu
- Statystyki projektu (compliance, aktywność, postępy)

### Komunikacja
- Wiadomości tekstowe w wątkach
- Konwersacje indywidualne i grupowe
- Załączniki do 10MB
- Statusy wiadomości (doręczona, przeczytana)
- Powiadomienia o nowych wiadomościach

### Kalendarz
- Wydarzenia terapeutyczne (wizyty, sesje, ćwiczenia, przypomnienia)
- Wydarzenia cykliczne
- Eksport do iCal
- Powiadomienia i przypomnienia
- Oznaczanie wykonania z notatkami

### Materiały Edukacyjne
- Różne typy materiałów (artykuły, PDF, video, audio, quizy)
- Kategorie i poziomy trudności
- Śledzenie postępów pacjenta
- Statystyki wyświetleń i ukończeń

### Dokumentacja
- [Sequence Diagrams](./docs/architecture/sequence-diagrams.md)
- [ADR-004: Messaging Architecture](./docs/decisions/ADR-004-messaging-architecture.md)
- [API Documentation](./docs/api/)

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

### Authentication (v1.0.0)
```
POST   /api/v1/auth/login           # Logowanie
POST   /api/v1/auth/register        # Rejestracja z weryfikacją HIS
POST   /api/v1/auth/refresh         # Refresh token
POST   /api/v1/auth/2fa/enable      # Włącz 2FA
POST   /api/v1/auth/2fa/verify      # Weryfikuj 2FA
POST   /api/v1/auth/forgot-password # Reset hasła
POST   /api/v1/auth/reset-password  # Ustaw nowe hasło
```

### Patients (v1.1.0)
```
GET    /api/v1/patients             # Lista pacjentów z filtrami
GET    /api/v1/patients/{id}        # Szczegóły pacjenta
POST   /api/v1/patients             # Dodaj pacjenta
PUT    /api/v1/patients/{id}        # Aktualizuj pacjenta
DELETE /api/v1/patients/{id}        # Usuń pacjenta (soft delete)
POST   /api/v1/patients/verify      # Weryfikacja HIS
GET    /api/v1/patients/search      # Wyszukiwanie pacjentów
```

### Therapeutic Projects (v1.1.0)
```
GET    /api/v1/projects             # Lista projektów
GET    /api/v1/projects/my/active   # Moje aktywne projekty
POST   /api/v1/projects             # Utwórz projekt
GET    /api/v1/projects/{id}        # Szczegóły projektu
PUT    /api/v1/projects/{id}        # Aktualizuj projekt
DELETE /api/v1/projects/{id}        # Usuń projekt
POST   /api/v1/projects/{id}/patients       # Przypisz pacjentów
DELETE /api/v1/projects/{id}/patients       # Usuń pacjentów z projektu
GET    /api/v1/projects/{id}/patients       # Pacjenci w projekcie
GET    /api/v1/projects/{id}/team           # Zespół projektu
GET    /api/v1/projects/{id}/statistics     # Statystyki projektu
```

### Messages (v1.1.0)
```
GET    /api/v1/messages/threads             # Lista wątków
POST   /api/v1/messages/threads             # Utwórz wątek
GET    /api/v1/messages/threads/{id}        # Szczegóły wątku
GET    /api/v1/messages/threads/{id}/messages  # Wiadomości w wątku
POST   /api/v1/messages/threads/{id}/messages  # Wyślij wiadomość
POST   /api/v1/messages/messages/{id}/read     # Oznacz jako przeczytane
POST   /api/v1/messages/messages/{id}/attachments  # Dodaj załącznik
GET    /api/v1/messages/unread              # Nieprzeczytane wiadomości
GET    /api/v1/messages/unread/count        # Liczba nieprzeczytanych
```

### Calendar (v1.1.0)
```
GET    /api/v1/calendar/events          # Lista wydarzeń
GET    /api/v1/calendar/events/{id}     # Szczegóły wydarzenia
POST   /api/v1/calendar/events          # Utwórz wydarzenie
PUT    /api/v1/calendar/events/{id}     # Aktualizuj wydarzenie
DELETE /api/v1/calendar/events/{id}     # Usuń wydarzenie
POST   /api/v1/calendar/events/{id}/complete  # Oznacz jako wykonane
GET    /api/v1/calendar/upcoming        # Nadchodzące wydarzenia
POST   /api/v1/calendar/events/{id}/ics # Eksport do iCal
```

### Educational Materials (v1.1.0)
```
GET    /api/v1/materials                # Lista materiałów
GET    /api/v1/materials/my             # Materiały pacjenta
POST   /api/v1/materials                # Dodaj materiał
GET    /api/v1/materials/{id}           # Szczegóły materiału
PUT    /api/v1/materials/{id}           # Aktualizuj materiał
DELETE /api/v1/materials/{id}          # Usuń materiał
POST   /api/v1/materials/{id}/publish   # Opublikuj materiał
POST   /api/v1/materials/{id}/unpublish # Cofnij publikację
POST   /api/v1/materials/{id}/view      # Zarejestruj wyświetlenie
POST   /api/v1/materials/{id}/complete  # Oznacz jako ukończone
GET    /api/v1/materials/progress       # Postępy pacjenta
```

### Health & Monitoring
```
GET    /api/v1/health                   # Health check
GET    /api/v1/actuator/metrics         # Metryki systemu
```

## 📚 API Documentation

Szczegółowa dokumentacja API:

- [Authentication API](./docs/api/authentication.md)
- [Patients API](./docs/api/patients.md)
- [Projects API](./docs/api/projects.md)
- [Messages API](./docs/api/messages.md)
- [Calendar API](./docs/api/calendar.md)
- [Materials API](./docs/api/materials.md)

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
