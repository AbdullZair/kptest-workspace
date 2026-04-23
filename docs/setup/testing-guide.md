# 🧪 Testowanie Integracji Backend + Frontend

Kompleksowy przewodnik testowania systemu KPTEST.

## 🚀 Quick Start - Uruchomienie Wszystkiego

### Opcja 1: Docker Compose (Zalecane)

```bash
cd /home/user1/KPTESTPRO

# Uruchom wszystkie usługi (5 kontenerów)
docker compose up -d

# Sprawdź status
docker compose ps

# Zobacz logi wszystkich serwisów
docker compose logs -f

# Zobacz logi pojedynczego serwisu
docker compose logs -f backend
docker compose logs -f frontend
```

**Oczekiwany status:**
```
NAME                 STATUS                    PORTS
kptest-postgres      Up (healthy)              0.0.0.0:5432->5432/tcp
kptest-redis         Up (healthy)              0.0.0.0:6379->6379/tcp
kptest-backend       Up (health: starting)     0.0.0.0:8080->8080/tcp
kptest-frontend      Up                        0.0.0.0:3000->3000/tcp
kptest-his-mock      Up                        0.0.0.0:8081->8081/tcp
```

### Opcja 2: Lokalnie (Development)

```bash
# Terminal 1 - Infrastructure
docker compose up -d postgres redis his-mock

# Terminal 2 - Backend
cd backend
chmod +x gradlew
./gradlew bootRun --args='--spring.profiles.active=dev'

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

---

## ✅ Health Checks

### 1. Backend API
```bash
curl http://localhost:8080/api/v1/health
```

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-04-23T10:00:00Z",
  "service": "kptest-backend"
}
```

### 2. Frontend Web
```bash
curl http://localhost:3000
```

**Response:** HTML strony (status 200)

### 3. HIS Mock
```bash
curl http://localhost:8081/api/v1/health
```

**Response:**
```json
{
  "status": "UP",
  "service": "his-mock",
  "timestamp": "2026-04-23T10:00:00Z"
}
```

### 4. PostgreSQL
```bash
docker compose exec postgres psql -U kptest -d kptest -c "SELECT 1;"
```

**Response:**
```
 ?column? 
----------
        1
(1 row)
```

### 5. Redis
```bash
docker compose exec redis redis-cli ping
```

**Response:** `PONG`

---

## 🧪 Test Scenarios

### Scenario 1: Rejestracja Pacjenta

**Krok 1:** Otwórz stronę rejestracji
```
http://localhost:3000/register
```

**Krok 2:** Wypełnij formularz:
- Email: `jan.kowalski@email.com`
- Telefon: `+48123456789`
- PESEL: `12345678901`
- Imię: `Jan`
- Nazwisko: `Kowalski`
- Hasło: `TestP@ssw0rd123`
- Powtórz hasło: `TestP@ssw0rd123`
- ✅ Akceptuję regulamin

**Krok 3:** Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Komunikat sukcesu
- ✅ Przekierowanie na `/login`
- ✅ User w bazie danych ze statusem `PENDING_VERIFICATION`

**Weryfikacja w bazie:**
```bash
docker compose exec postgres psql -U kptest -d kptest -c \
  "SELECT id, email, role, status FROM users WHERE email = 'jan.kowalski@email.com';"
```

### Scenario 2: Logowanie

**Krok 1:** Otwórz stronę logowania
```
http://localhost:3000/login
```

**Krok 2:** Wprowadź dane:
- Email: `jan.kowalski@email.com`
- Hasło: `TestP@ssw0rd123`

**Krok 3:** Kliknij "Zaloguj się"

**Oczekiwany rezultat:**
- ✅ Przekierowanie do `/dashboard`
- ✅ Token zapisany w localStorage
- ✅ User menu widoczne w header

**Test API:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "jan.kowalski@email.com",
    "password": "TestP@ssw0rd123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900000
}
```

### Scenario 3: Weryfikacja 2FA (jeśli włączona)

**Krok 1:** Po zalogowaniu, jeśli 2FA wymagane:
```
http://localhost:3000/2fa
```

**Krok 2:** Wprowadź kod z authenticator app

**Krok 3:** Kliknij "Weryfikuj"

**Test API:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "temp_token": "temp_xxx",
    "totp_code": "123456"
  }'
```

### Scenario 4: Dashboard

Po zalogowaniu otwórz:
```
http://localhost:3000/dashboard
```

**Oczekiwany widok:**
- ✅ Welcome message
- ✅ Stats cards (liczba pacjentów, projektów, itp.)
- ✅ Quick actions
- ✅ Sidebar z nawigacją
- ✅ User menu w header

---

## 🐛 Debugging

### Backend nie startuje

```bash
# Sprawdź logi
docker compose logs backend

# Sprawdź czy baza jest gotowa
docker compose logs postgres | grep "ready to accept connections"

# Restart backendu
docker compose restart backend
```

### Frontend nie łączy się z backendem

```bash
# Sprawdź .env frontendu
cat frontend/.env

# Powinno być:
# VITE_API_URL=http://localhost:8080/api

# Sprawdź CORS w backendu
docker compose logs backend | grep -i cors
```

### Baza danych nie działa

```bash
# Sprawdź status
docker compose ps postgres

# Zobacz logi
docker compose logs postgres

# Restart z wyczyszczeniem danych (UWAGA: usuwa dane!)
docker compose down -v postgres
docker compose up -d postgres
```

### Token authentication errors

```bash
# Sprawdź czy Redis działa
docker compose exec redis redis-cli ping

# Zobacz zapisane tokeny
docker compose exec redis redis-cli KEYS "refresh_token:*"
```

---

## 📊 Testowanie API z Postman/Insomnia

### Importuj kolekcję

Stwórz nową kolekcję z endpointami:

```
Base URL: http://localhost:8080/api/v1
```

### Requesty

**1. Register**
```http
POST /auth/register
Content-Type: application/json

{
  "identifier": "test@email.com",
  "password": "TestP@ssw0rd123",
  "pesel": "12345678901",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@email.com",
  "phone": "+48123456789",
  "termsAccepted": "true"
}
```

**2. Login**
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "test@email.com",
  "password": "TestP@ssw0rd123"
}
```

**3. Get Current User**
```http
GET /auth/me
Authorization: Bearer {{access_token}}
```

**4. Refresh Token**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "{{refresh_token}}"
}
```

---

## 🧹 Czyszczenie Środowiska

```bash
# Zatrzymaj wszystkie kontenery
docker compose down

# Zatrzymaj i usuw wolumeny (UWAGA: usuwa dane!)
docker compose down -v

# Wyczyść nieużywane zasoby Docker
docker system prune -a

# Przywróć środowisko
docker compose up -d
```

---

## 📈 Monitoring

### Backend Metrics (po dodaniu Spring Actuator)
```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

### Database Stats
```bash
docker compose exec postgres psql -U kptest -d kptest -c \
  "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';"
```

### Redis Stats
```bash
docker compose exec redis redis-cli INFO
```

---

## ✅ Checklista Testowa

| Test | Status | Notatki |
|------|--------|---------|
| Backend health | ⏳ | |
| Frontend health | ⏳ | |
| HIS Mock health | ⏳ | |
| PostgreSQL connection | ⏳ | |
| Redis connection | ⏳ | |
| Rejestracja pacjenta | ⏳ | |
| Logowanie | ⏳ | |
| 2FA (opcjonalnie) | ⏳ | |
| Dashboard loading | ⏳ | |
| Protected routes | ⏳ | |
| Logout | ⏳ | |

---

**Last Updated:** 2026-04-23  
**Author:** KPTEST Squad
