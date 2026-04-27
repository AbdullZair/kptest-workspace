# Security Endpoints

Dokumentacja endpointów związanych z bezpieczeństwem systemu.

## POST /api/v1/auth/change-password

### Description
Zmienia hasło zalogowanego użytkownika.

### Request
- **Method:** POST
- **Path:** `/api/v1/auth/change-password`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Password Requirements
- **Minimalna długość:** 12 znaków
- **Wielka litera:** wymagana
- **Mała litera:** wymagana
- **Cyfra:** wymagana
- **Znak specjalny:** wymagany

### Response (200 OK)
```json
{
  "message": "Password changed successfully",
  "passwordChangedAt": "2026-04-27T12:00:00Z"
}
```

### Side Effects
- Weryfikacja obecnego hasła przez BCrypt
- Aktualizacja `User.passwordHash` i `User.passwordChangedAt`
- **Revokowanie wszystkich refresh tokenów** użytkownika
- Audit: `AuditLog` z `action=PASSWORD_CHANGED`

### Errors
| Code | Description |
|------|-------------|
| 401 Unauthorized | Brak autentykacji |
| 400 Bad Request | Niepoprawny format / password policy violation |
| 403 Forbidden | Current password niepoprawne |

### User Story
- US-P-09

---

## POST /api/v1/notifications/devices/register

### Description
Rejestruje urządzenie do powiadomień push (FCM).

### Request
- **Method:** POST
- **Path:** `/api/v1/notifications/devices/register`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "token": "string",
  "platform": "IOS | ANDROID"
}
```

### Response (201 Created)
```json
{
  "deviceTokenId": "uuid",
  "registeredAt": "2026-04-27T12:00:00Z",
  "platform": "IOS"
}
```

### Push Notification Triggers
Powiadomienia push są wysyłane przy:
- **Wiadomość:** `MessageService.sendMessage` → push do recipientów
- **Wydarzenie:** `CalendarService.createEvent` → push do pacjenta
- **Materiał:** `MaterialService.createMaterial` → push do przypisanych pacjentów
- **Zmiana wydarzenia:** `EventChangeRequestService.acceptChangeRequest/rejectChangeRequest` → push do pacjenta

### Architecture
- **Provider pattern:** `PushNotificationProvider` interface
  - `LogPushProvider` (@Profile("dev")) - loguje, nie wysyła
  - `FcmPushProvider` (@Profile("prod")) - Firebase Cloud Messaging (stub)
- **Storage:** `user_device_tokens` tabela (userId, token, platform, lastUsedAt)

### Errors
| Code | Description |
|------|-------------|
| 401 Unauthorized | Brak autentykacji |
| 400 Bad Request | Niepoprawny format |

### User Story
- US-P-21

---

## Rate Limiting

### Configuration

| Endpoint | Limit | Okno | Per |
|----------|-------|------|-----|
| `/api/v1/auth/login` | 5 req | 1 min | IP |
| `/api/v1/auth/forgot-password` | 3 req | 15 min | IP |
| `/api/v1/his/**` | 10 req | 1 min | IP |
| **Default** | 100 req | 1 min | User/IP |

### Implementation
- **Biblioteka:** Bucket4j (`com.bucket4j:bucket4j-spring-boot-starter:0.6.0`)
- **Filter:** `RateLimitFilter` extends `OncePerRequestFilter`
- **Storage:** `ConcurrentHashMap` (in-memory; docelowo Redis w K8s)

### Response (429 Too Many Requests)
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 60 seconds.",
    "retryAfter": 60
  },
  "timestamp": "2026-04-27T12:00:00Z"
}
```

### Configuration (application.yml)
```yaml
kptest:
  security:
    rate-limit:
      login:
        capacity: 5
        refillTokens: 5
        refillPeriodSeconds: 60
      forgotPassword:
        capacity: 3
        refillTokens: 3
        refillPeriodSeconds: 900
      his:
        capacity: 10
        refillTokens: 10
        refillPeriodSeconds: 60
      default:
        capacity: 100
        refillTokens: 100
        refillPeriodSeconds: 60
```

### User Stories
- US-S-02

---

## Encryption at Rest

### PESEL Encryption
- **Algorytm:** AES-256-GCM
- **Converter:** `AesAttributeConverter` implements `AttributeConverter<String,String>`
- **Klucz:** env var `KPTEST_DB_ENCRYPTION_KEY` (256-bit, Base64)
- **IV:** Generowany per wartość (unikalny)
- **Format w bazie:** IV + ciphertext + tag (Base64 encoded)

### Phone Encryption
- **Algorytm:** AES-256-GCM
- **Pole:** `User.phone`
- **Ten sam converter** co dla PESEL

### Application
- `Patient.pesel` - `@Convert(converter = AesAttributeConverter.class)`
- `User.phone` - `@Convert(converter = AesAttributeConverter.class)` (opcjonalnie)

### Dev Fallback
W profilu `dev`: klucz z `application-dev.yml` (testowy, oznaczony jako dev-only).

### Migration
- **Skrypt:** `V3__encrypt_pesel.sql` - walidacja schemy
- **Migracja danych:** `PeselEncryptionMigration.java` (@PostConstruct, profile=encrypt-existing)

### User Story
- US-S-01

---

## Per-Project Authorization

### Implementation
- **Checker:** `ProjectAccessChecker` (@Component)
- **Method:** `hasProjectAccess(UUID userId, UUID projectId): boolean`

### Access Rules

| Rola | Dostęp |
|------|--------|
| `ADMIN` | ✅ Wszystkie projekty |
| `STAFF` | ✅ Tylko projekty z `ProjectTeam` |
| `PATIENT` | ✅ Tylko aktywne projekty z `PatientProject` |

### Usage
```java
@PreAuthorize("@projectAccessChecker.hasProjectAccess(authentication.principal, #projectId)")
```

### Applied To
- `ProjectController`
- `MaterialController`
- `QuizController`
- `TherapyStageController`
- `CalendarController`
- `MessageController` (per `thread.projectId`)

### Patient Access
Analogicznie `hasPatientAccess(userId, patientId)` dla endpointów po `patientId`.

### User Story
- US-S-03

---

**Ostatnia aktualizacja:** 2026-04-27
