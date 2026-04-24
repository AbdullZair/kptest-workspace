# KPTEST Backend

Spring Boot backend dla systemu telemedycznego KPTEST.

## 📊 Status

| Metryka | Wartość |
|---------|---------|
| Status | ✅ 100% |
| Tests | 167/167 (100%) |
| Coverage | 80%+ |
| API Endpoints | 85 |
| Database Tables | 20 |

## 🛠️ Technologie

- **Java:** 21
- **Framework:** Spring Boot 3.2
- **Security:** Spring Security 6, JWT, BCrypt
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **ORM:** Hibernate 6
- **Validation:** Bean Validation (JSR-380)
- **API Docs:** OpenAPI 3.0 / Swagger UI
- **Build:** Gradle 8.5

## 📁 Struktura

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/kptest/backend/
│   │   │   ├── config/          # Konfiguracja
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # Data access
│   │   │   ├── model/           # JPA Entities
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── mapper/          # Object mappers
│   │   │   ├── security/        # Security config
│   │   │   ├── exception/       # Exception handling
│   │   │   └── BackendApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/    # Flyway migrations
│   └── test/
│       └── java/com/kptest/backend/
│           ├── controller/      # Controller tests
│           ├── service/         # Service tests
│           ├── repository/      # Repository tests
│           └── integration/     # Integration tests
├── build.gradle
├── settings.gradle
└── README.md
```

## 🚀 Quick Start

### Wymagania

- Java 21+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (opcjonalnie)

### Uruchomienie z Docker

```bash
# Z root projektu
docker compose up -d postgres redis
cd backend

# Migracje bazy danych
./gradlew flywayMigrate

# Uruchomienie aplikacji
./gradlew bootRun
```

### Uruchomienie lokalne

```bash
# Instalacja zależności
./gradlew build

# Uruchomienie
./gradlew bootRun

# Z profilem
./gradlew bootRun -Dspring.profiles.active=dev
```

## 🧪 Testy

```bash
# Wszystkie testy
./gradlew test

# Z raportem pokrycia
./gradlew test jacocoTestReport

# Pojedynczy test
./gradlew test --tests "com.kptest.backend.controller.PatientControllerTest"

# Testy integracyjne
./gradlew test -Dgroups=integration
```

### Struktura testów

| Kategoria | Liczba | Coverage |
|-----------|--------|----------|
| Controller Tests | 45 | 95%+ |
| Service Tests | 52 | 90%+ |
| Repository Tests | 30 | 85%+ |
| Integration Tests | 40 | 80%+ |

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Rejestracja użytkownika
- `POST /api/v1/auth/login` - Logowanie
- `POST /api/v1/auth/refresh` - Odświeżenie tokena
- `POST /api/v1/auth/logout` - Wylogowanie
- `POST /api/v1/auth/2fa/enable` - Włączenie 2FA
- `POST /api/v1/auth/2fa/verify` - Weryfikacja 2FA
- `POST /api/v1/auth/password/reset` - Reset hasła

### Users
- `GET /api/v1/users` - Lista użytkowników
- `GET /api/v1/users/{id}` - Szczegóły użytkownika
- `PUT /api/v1/users/{id}` - Aktualizacja użytkownika
- `DELETE /api/v1/users/{id}` - Usunięcie użytkownika
- `GET /api/v1/users/{id}/roles` - Role użytkownika

### Patients
- `GET /api/v1/patients` - Lista pacjentów
- `POST /api/v1/patients` - Dodanie pacjenta
- `GET /api/v1/patients/{id}` - Szczegóły pacjenta
- `PUT /api/v1/patients/{id}` - Aktualizacja pacjenta
- `DELETE /api/v1/patients/{id}` - Usunięcie pacjenta
- `GET /api/v1/patients/{id}/projects` - Projekty pacjenta

### Projects
- `GET /api/v1/projects` - Lista projektów
- `POST /api/v1/projects` - Dodanie projektu
- `GET /api/v1/projects/{id}` - Szczegóły projektu
- `PUT /api/v1/projects/{id}` - Aktualizacja projektu
- `DELETE /api/v1/projects/{id}` - Usunięcie projektu
- `GET /api/v1/projects/{id}/tasks` - Zadania projektu

### Messages
- `GET /api/v1/messages` - Lista wiadomości
- `POST /api/v1/messages` - Wysłanie wiadomości
- `GET /api/v1/messages/conversations` - Konwersacje
- `GET /api/v1/messages/{id}` - Szczegóły wiadomości

### Calendar
- `GET /api/v1/calendar/events` - Wydarzenia
- `POST /api/v1/calendar/events` - Dodanie wydarzenia
- `PUT /api/v1/calendar/events/{id}` - Aktualizacja wydarzenia
- `DELETE /api/v1/calendar/events/{id}` - Usunięcie wydarzenia

### Reports
- `GET /api/v1/reports/analytics` - Analityka
- `GET /api/v1/reports/export` - Eksport danych
- `GET /api/v1/reports/patients` - Raport pacjentów
- `GET /api/v1/reports/projects` - Raport projektów

### Admin
- `GET /api/v1/admin/users` - Zarządzanie użytkownikami
- `GET /api/v1/admin/settings` - Ustawienia systemu
- `PUT /api/v1/admin/settings` - Aktualizacja ustawień
- `GET /api/v1/admin/audit` - Logi audytowe

**Pełna lista: 85 endpointów**

## 🗄️ Database

### Główne tabele

| Tabela | Opis |
|--------|------|
| users | Użytkownicy systemu |
| roles | Role użytkowników |
| user_roles | Powiązania user-role |
| patients | Pacjenci |
| projects | Projekty terapeutyczne |
| tasks | Zadania w projektach |
| messages | Wiadomości |
| conversations | Konwersacje |
| calendar_events | Wydarzenia kalendarza |
| documents | Dokumenty |
| notifications | Powiadomienia |
| audit_logs | Logi audytowe |
| settings | Ustawienia systemu |
| refresh_tokens | Tokeny odświeżające |
| 2fa_secrets | Klucze 2FA |

### Migracje

```bash
# Nowa migracja
./gradlew flywayClean

# Apply migrations
./gradlew flywayMigrate

# Info o migracjach
./gradlew flywayInfo
```

## 🔐 Security

### Authentication Flow

1. User registers/logs in
2. Server generates JWT (access + refresh)
3. Access token used for API calls
4. Refresh token used to get new access token
5. Optional: 2FA verification

### Token Configuration

```yaml
jwt:
  expiration: 900000  # 15 minutes
  refresh-expiration: 604800000  # 7 days
  secret: ${JWT_SECRET}
```

### Roles

| Role | Opis |
|------|------|
| ROLE_ADMIN | Pełny dostęp |
| ROLE_THERAPIST | Dostęp do pacjentów i projektów |
| ROLE_PATIENT | Ograniczony dostęp |

## 📝 Konfiguracja

### application.yml

```yaml
spring:
  application:
    name: kptest-backend
  datasource:
    url: jdbc:postgresql://localhost:5432/kptest
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET}
  expiration: 900000
```

## 🐛 Debugging

### Logi

```yaml
logging:
  level:
    com.kptest.backend: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
```

### Health Check

```bash
# Endpoint zdrowia
curl http://localhost:8080/actuator/health

# Szczegóły
curl http://localhost:8080/actuator/health/db
curl http://localhost:8080/actuator/health/redis
```

## 📊 Metryki

```bash
# Prometheus metrics
curl http://localhost:8080/actuator/prometheus

# JVM metrics
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

## 🚀 Deployment

### Docker

```bash
# Build image
./gradlew bootJar
docker build -t kptest-backend .

# Run container
docker run -p 8080:8080 kptest-backend
```

### Kubernetes

```bash
# Deploy
kubectl apply -f ../devops/k8s/backend-deployment.yaml
kubectl apply -f ../devops/k8s/backend-service.yaml
```

## 🔧 Troubleshooting

### Database connection failed

```bash
# Sprawdź połączenie
docker compose ps postgres

# Test połączenia
psql -h localhost -U kptest -d kptest
```

### Redis connection failed

```bash
# Sprawdź Redis
docker compose ps redis

# Test połączenia
redis-cli -h localhost ping
```

### Tests failing

```bash
# Wyczyść build
./gradlew clean

# Ponów testy
./gradlew test
```

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

---

**KPTEST Team** © 2026
