# Dokumentacja API

Dokumentacja wszystkich endpointów REST API systemu KPTEST.

## 📡 Base URL

| Środowisko | URL |
|------------|-----|
| Development | `http://localhost:8080/api/v1` |
| Production | `https://api.kptest.com/api/v1` |

## 🔐 Autentykacja

Wszystkie endpointy (poza `/auth/register` i `/auth/login`) wymagają nagłówka:

```
Authorization: Bearer <JWT_TOKEN>
```

## 📚 Spis Endpointów

### Authentication
- [POST /auth/register](./authentication.md#post-authregister) - Rejestracja pacjenta
- [POST /auth/login](./authentication.md#post-authlogin) - Logowanie
- [POST /auth/refresh](./authentication.md#post-authrefresh) - Refresh tokena
- [POST /auth/2fa/enable](./authentication.md#post-auth2faenable) - Włącz 2FA
- [POST /auth/2fa/verify](./authentication.md#post-auth2faverify) - Weryfikuj 2FA
- [POST /auth/forgot-password](./authentication.md#post-authforgot-password) - Reset hasła

### Patients
- [GET /patients](./patients.md#get-patients) - Lista pacjentów
- [GET /patients/{id}](./patients.md#get-patientsid) - Szczegóły pacjenta
- [POST /patients](./patients.md#post-patients) - Dodaj pacjenta
- [PUT /patients/{id}](./patients.md#put-patientsid) - Aktualizuj pacjenta
- [POST /patients/verify](./patients.md#post-patientsverify) - Weryfikacja HIS

### Projects
- [GET /projects](./projects.md#get-projects) - Lista projektów
- [POST /projects](./projects.md#post-projects) - Utwórz projekt
- [GET /projects/{id}](./projects.md#get-projectsid) - Szczegóły projektu
- [PUT /projects/{id}](./projects.md#put-projectsid) - Aktualizuj projekt
- [POST /projects/{id}/patients](./projects.md#post-projectsidpatients) - Przypisz pacjentów

## 📝 Format Odpowiedzi

### Sukces (200 OK)
```json
{
  "data": { ... },
  "timestamp": "2026-04-23T10:00:00Z"
}
```

### Błąd (4xx/5xx)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [ ... ],
    "timestamp": "2026-04-23T10:00:00Z"
  }
}
```

## 🔄 Versioning

API jest wersjonowane w URL: `/api/v1/`, `/api/v2/` (przyszłość)
