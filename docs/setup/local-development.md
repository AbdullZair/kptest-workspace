# Local Development Setup

Kompleksowa instrukcja konfiguracji środowiska lokalnego dla projektu KPTEST.

## 📋 Wymagania Wstępne

### Niezbędne Oprogramowanie

| Narzędzie | Wersja | Link | Uwagi |
|-----------|--------|------|-------|
| **Java** | 21+ | [Adoptium](https://adoptium.net/) | Wymagany JDK 21 |
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) | LTS recommended |
| **Docker** | 24+ | [docker.com](https://docker.com/) | Docker Desktop lub Docker Engine |
| **Docker Compose** | 2.0+ | W zestawie z Docker | |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com/) | |

### Sprawdzenie Instalacji

```bash
# Java
java -version
# Oczekiwany output: openjdk version "21.x.x"

# Node.js
node --version
# Oczekiwany output: v20.x.x

# npm
npm --version
# Oczekiwany output: 10.x.x

# Docker
docker --version
# Oczekiwany output: Docker version 24.x.x

# Docker Compose
docker compose version
# Oczekiwany output: Docker Compose version v2.x.x

# Git
git --version
# Oczekiwany output: git version 2.4x.x
```

---

## 🚀 Quick Start

### Krok 1: Klonowanie Repozytorium

```bash
git clone https://github.com/your-org/kptest-workspace.git
cd kptest-workspace
```

### Krok 2: Uruchomienie Infrastrukturę (Docker)

```bash
# Uruchom PostgreSQL, Redis i HIS Mock
docker compose up -d postgres redis his-mock

# Sprawdź status
docker compose ps
```

Oczekiwany output:
```
NAME                 STATUS         PORTS
kptest-postgres      Up (healthy)   0.0.0.0:5432->5432/tcp
kptest-redis         Up (healthy)   0.0.0.0:6379->6379/tcp
kptest-his-mock      Up             0.0.0.0:8081->8081/tcp
```

### Krok 3: Konfiguracja Environment Variables

Utwórz plik `.env` w katalogu głównym:

```bash
# Skopiuj szablon
cp .env.example .env
```

Edytuj `.env`:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=kptest
DB_USER=kptest
DB_PASSWORD=kptest_password

# JWT (production-quality secret for local dev)
JWT_SECRET=dev-secret-key-must-be-at-least-32-characters-long

# HIS Integration
HIS_BASE_URL=http://his-mock:8081
HIS_API_KEY=dev-api-key

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email (optional - dla reset hasła)
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Krok 4: Uruchomienie Backendu

```bash
cd backend

# Nadaj uprawnienia gradlew
chmod +x gradlew

# Uruchom z profilem dev
./gradlew bootRun --args='--spring.profiles.active=dev'
```

**Alternatywnie z Docker:**

```bash
# Zbuduj i uruchom backend w Docker
docker compose up -d backend

# Sprawdź logi
docker compose logs -f backend
```

### Krok 5: Weryfikacja

```bash
# Health check backendu
curl http://localhost:8080/api/v1/health

# Oczekiwany response:
# {"status":"UP","timestamp":"2026-04-23T10:00:00Z","service":"kptest-backend"}

# Health check HIS Mock
curl http://localhost:8081/api/v1/health

# Oczekiwany response:
# {"status":"UP","service":"his-mock","timestamp":"..."}
```

---

## 🔧 Development Tools

### Database GUI

**DBeaver** (darmowy, uniwersalny)
- Pobierz z: https://dbeaver.io/download/
- Connection settings:
  - Host: `localhost`
  - Port: `5432`
  - Database: `kptest`
  - Username: `kptest`
  - Password: `kptest_password`

**pgAdmin** (oficjalne narzędzie PostgreSQL)
```bash
docker run -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@kptest.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -e PGADMIN_CONFIG_SERVER_MODE=False \
  dpage/pgadmin4
```
Dostęp: http://localhost:5050

### Redis GUI

**Redis Insight** (darmowy od Redis Ltd)
- Pobierz z: https://redis.com/redis-enterprise/redis-insight/
- Connection: `redis://localhost:6379`

### API Testing

**Postman** lub **Insomnia**

Importuj kolekcję endpointów lub użyj Swagger UI:
- Swagger UI: http://localhost:8080/swagger-ui.html (po dodaniu springdoc-openapi)

---

## 📦 Struktura Projektu

```
kptest-workspace/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kptest/
│   │   │   │   ├── api/       # REST controllers, DTOs
│   │   │   │   ├── application/  # Use cases, services
│   │   │   │   ├── domain/    # Entities, repositories
│   │   │   │   ├── exception/ # Exceptions, handlers
│   │   │   │   └── infrastructure/ # Security, config
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Flyway migracje
│   │   │       └── application.yml
│   │   └── test/
│   ├── build.gradle
│   └── Dockerfile
├── frontend/                   # React Web App (w trakcie)
├── mobile/                     # React Native App (w trakcie)
├── devops/
│   ├── docker-compose.yml
│   └── his-mock/
└── docs/                       # Dokumentacja
```

---

## 🧪 Testowanie

### Backend Testy

```bash
cd backend

# Wszystkie testy
./gradlew test

# Testy z coverage
./gradlew test jacocoTestReport

# Otwórz raport coverage
open build/reports/jacoco/test/html/index.html

# Pojedynczy test class
./gradlew test --tests "com.kptest.application.service.AuthenticationServiceTest"
```

### HIS Mock Testowanie

```bash
# Weryfikacja pacjenta
curl -X POST http://localhost:8081/api/v1/patients/verify \
  -H "X-API-Key: dev-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "pesel": "12345678901",
    "cart_number": "CART001"
  }'

# Response:
# {
#   "verified": true,
#   "patient": {
#     "pesel": "12345678901",
#     "first_name": "Jan",
#     "last_name": "Kowalski",
#     ...
#   }
# }
```

### Testowi Użytkownicy (HIS Mock)

| PESEL | Cart Number | Imię i Nazwisko |
|-------|-------------|-----------------|
| 12345678901 | CART001 | Jan Kowalski |
| 98765432109 | CART002 | Anna Nowak |
| 11111111111 | CART003 | Piotr Wiśniewski |

---

## 🐛 Troubleshooting

### Problem: Port already in use

```bash
# Sprawdź co używa portu 8080
lsof -i :8080

# Lub port 5432 (PostgreSQL)
lsof -i :5432

# Zabij proces
kill -9 <PID>

# Lub zatrzymaj Docker containers
docker compose down
```

### Problem: Backend nie łączy się z bazą

```bash
# Sprawdź czy PostgreSQL działa
docker compose ps postgres

# Zobacz logi
docker compose logs postgres

# Restart
docker compose down postgres
docker compose up -d postgres

# Sprawdź connection string
# Powinien być: jdbc:postgresql://localhost:5432/kptest
```

### Problem: Gradle build fails

```bash
# Wyczyść cache
./gradlew clean

# Refresh dependencies
./gradlew --refresh-dependencies

# Rebuild
./gradlew clean build -x test
```

### Problem: Docker images nie chcą się zbudować

```bash
# Wyczyść nieużywane zasoby
docker system prune -a

# Zbuduj ponownie z cache
docker compose build --no-cache

# Sprawdź Docker logs
docker compose logs
```

### Problem: Baza danych jest pusta

Migracje Flyway powinny uruchomić się automatycznie. Sprawdź:

```bash
# Logi backendu
docker compose logs backend | grep -i flyway

# Sprawdź czy tabele istnieją
psql -h localhost -U kptest -d kptest -c "\dt"
```

---

## 🔐 Domyślne Dane Testowe

Po uruchomieniu systemu możesz przetestować flow:

### 1. Rejestracja Pacjenta

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@email.com",
    "password": "TestP@ssw0rd123",
    "pesel": "12345678901",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@email.com",
    "phone": "+48123456789",
    "termsAccepted": "true"
  }'
```

### 2. Logowanie

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@email.com",
    "password": "TestP@ssw0rd123"
  }'
```

---

## 📝 Next Steps

Po skonfigurowaniu środowiska:

1. ✅ Backend jest gotowy
2. ⏳ Frontend - patrz `/frontend/README.md`
3. ⏳ Mobile - patrz `/mobile/README.md`

### Przydatne Komendy

```bash
# Zatrzymaj wszystko
docker compose down

# Uruchom wszystko
docker compose up -d

# Zobacz logi wszystkich serwisów
docker compose logs -f

# Restart pojedynczego serwisu
docker compose restart backend

# Wyczyść bazę danych (uwaga: usuwa dane!)
docker compose down -v postgres
```

---

**Last Updated:** 2026-04-23  
**Author:** KPTEST DevOps Team
