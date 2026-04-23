# Authentication API

Dokumentacja endpointów uwierzytelniania i autoryzacji.

## Base URL

```
Development: http://localhost:8080/api/v1
Production: https://api.kptest.com/api/v1
```

---

## POST /auth/register

Rejestracja nowego pacjenta w systemie.

### Request

```http
POST /api/v1/auth/register
Content-Type: application/json
```

#### Body

```json
{
  "identifier": "jan.kowalski@email.com",
  "password": "StrongP@ssw0rd123",
  "pesel": "12345678901",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789",
  "termsAccepted": "true"
}
```

#### Validation Rules

| Pole | Wymagania |
|------|-----------|
| `identifier` | Email lub telefon (wymagane) |
| `password` | Min. 10 znaków, wielkie litery, małe litery, cyfry, znaki specjalne |
| `pesel` | Dokładnie 11 cyfr |
| `firstName` | Max 100 znaków |
| `lastName` | Max 100 znaków |
| `email` | Valid format email |
| `phone` | Valid format międzynarodowy |

### Response

**201 Created**

```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789",
  "role": "PATIENT",
  "status": "PENDING_VERIFICATION",
  "first_name": "Jan",
  "last_name": "Kowalski",
  "pesel": "12345678901",
  "date_of_birth": "1980-01-15",
  "created_at": "2026-04-23T10:00:00Z",
  "two_factor_enabled": false
}
```

### Error Responses

**400 Bad Request** - Validation error

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "status": "BAD_REQUEST",
  "details": [
    {
      "field": "pesel",
      "message": "PESEL must be 11 digits",
      "rejected_value": "12345"
    }
  ],
  "timestamp": "2026-04-23T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

**409 Conflict** - Duplicate user/patient

```json
{
  "error_code": "DUPLICATE_RESOURCE",
  "message": "User with email 'jan.kowalski@email.com' already exists",
  "status": "CONFLICT",
  "details": [],
  "timestamp": "2026-04-23T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

---

## POST /auth/login

Logowanie użytkownika z credentialami.

### Request

```http
POST /api/v1/auth/login
Content-Type: application/json
```

#### Body

```json
{
  "identifier": "jan.kowalski@email.com",
  "password": "StrongP@ssw0rd123",
  "totpCode": "123456"
}
```

### Response

**200 OK** - Successful login

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900000
}
```

**200 OK** - 2FA required

```json
{
  "requires_2fa": true,
  "temp_token": "temp_a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11_1234567890"
}
```

### Error Responses

**401 Unauthorized** - Invalid credentials

```json
{
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid email/phone or password",
  "status": "UNAUTHORIZED",
  "details": [],
  "timestamp": "2026-04-23T10:00:00Z",
  "path": "/api/v1/auth/login"
}
```

**423 Locked** - Account locked after failed attempts

```json
{
  "error_code": "ACCOUNT_LOCKED",
  "message": "Account is temporarily locked due to too many failed login attempts",
  "status": "LOCKED",
  "details": [],
  "timestamp": "2026-04-23T10:00:00Z",
  "path": "/api/v1/auth/login"
}
```

---

## POST /auth/2fa/verify

Weryfikacja kodu 2FA po initial login.

### Request

```http
POST /api/v1/auth/2fa/verify
Content-Type: application/json
```

#### Body

```json
{
  "temp_token": "temp_a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11_1234567890",
  "totp_code": "123456"
}
```

### Response

**200 OK**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900000
}
```

---

## POST /auth/2fa/enable

Włączenie uwierzytelniania dwuskładnikowego.

### Request

```http
POST /api/v1/auth/2fa/enable
Authorization: Bearer <access_token>
```

### Response

**200 OK**

```json
{
  "enabled": false,
  "qr_code_url": "otpauth://totp/KPTEST:jan.kowalski@email.com?secret=JBSWY3DPEHPK3PXP&issuer=KPTEST",
  "secret_key": "JBSWY3DPEHPK3PXP",
  "backup_codes": ["ABC12345", "DEF67890", "GHI11111", ...]
}
```

### Next Steps

1. Zeskanuj QR kod aplikacją authenticator (Google Authenticator, Authy)
2. Wywołaj `POST /auth/2fa/confirm` z kodem z aplikacji

---

## POST /auth/2fa/confirm

Potwierdzenie i aktywacja 2FA.

### Request

```http
POST /api/v1/auth/2fa/confirm
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Body

```json
{
  "totp_code": "123456"
}
```

### Response

**200 OK**

```json
{
  "success": true
}
```

---

## POST /auth/2fa/disable

Wyłączenie uwierzytelniania dwuskładnikowego.

### Request

```http
POST /api/v1/auth/2fa/disable
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Body

```json
{
  "totp_code": "123456"
}
```

### Response

**200 OK**

```json
{
  "success": true
}
```

---

## POST /auth/refresh

Odświeżenie tokena dostępu.

### Request

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

#### Body

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response

**200 OK**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900000
}
```

### Error Responses

**401 Unauthorized** - Invalid/expired refresh token

```json
{
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid email/phone or password",
  "status": "UNAUTHORIZED",
  "details": [],
  "timestamp": "2026-04-23T10:00:00Z",
  "path": "/api/v1/auth/refresh"
}
```

---

## GET /auth/me

Pobierz dane profilu zalogowanego użytkownika.

### Request

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Response

**200 OK**

```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789",
  "role": "PATIENT",
  "status": "ACTIVE",
  "first_name": "Jan",
  "last_name": "Kowalski",
  "pesel": "12345678901",
  "date_of_birth": "1980-01-15",
  "created_at": "2026-04-23T10:00:00Z",
  "two_factor_enabled": true
}
```

---

## POST /auth/forgot-password

Żądanie resetu hasła.

### Request

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

#### Body

```json
{
  "identifier": "jan.kowalski@email.com",
  "channel": "email"
}
```

### Response

**200 OK**

```json
{
  "message": "If an account exists, you will receive password reset instructions"
}
```

> **Security Note:** Zawsze zwracamy sukces aby zapobiec enumeracji emaili.

---

## Token Structure

### Access Token (JWT)

```json
{
  "sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "role": "PATIENT",
  "2fa_verified": true,
  "iat": 1234567890,
  "exp": 1234576890,
  "iss": "kptest-api"
}
```

**Validity:** 15 minut

### Refresh Token (JWT)

```json
{
  "sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "iat": 1234567890,
  "exp": 1235172690,
  "iss": "kptest-api"
}
```

**Validity:** 7 dni

---

## Security Headers

Wszystkie requesty (poza `/auth/register` i `/auth/login`) wymagają:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 prób na 15 minut na użytkownika |
| `/auth/register` | 3 rejestracje na godzinę na IP |
| `/auth/2fa/verify` | 5 prób na 15 minut |
| `/auth/refresh` | 10 odświeżeń na minutę |

---

**Last Updated:** 2026-04-23
