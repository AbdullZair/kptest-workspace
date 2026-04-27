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

### RODO (Data Protection)
- [POST /admin/patients/{id}/anonymize](./rodo.md#post-apiv1adminpatientsidanonymize) - Anonimizacja pacjenta (US-A-10)
- [GET /admin/patients/{id}/export-data](./rodo.md#get-apiv1adminpatientsidexport-data) - Eksport danych pacjenta (US-A-11)
- [DELETE /admin/patients/{id}/erase](./rodo.md#delete-apiv1adminpatientsiderase) - Trwałe usunięcie pacjenta (US-A-12)
- [GET /admin/data-processing-activities](./rodo.md#get-apiv1admindata-processing-activities) - Lista czynności przetwarzania (US-A-13)
- [POST /admin/data-processing-activities](./rodo.md#post-apiv1admindata-processing-activities) - Dodaj czynność przetwarzania (US-A-13)
- [PUT /admin/data-processing-activities/{id}](./rodo.md#put-apiv1admindata-processing-activitiesid) - Aktualizuj czynność (US-A-13)
- [DELETE /admin/data-processing-activities/{id}](./rodo.md#delete-apiv1admindata-processing-activitiesid) - Usuń czynność (US-A-13)

### Security
- [POST /auth/change-password](./security.md#post-apiv1authchange-password) - Zmiana hasła (US-P-09)
- [POST /notifications/devices/register](./security.md#post-apiv1notificationsdevicesregister) - Rejestracja urządzenia push (US-P-21)

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

---

**Ostatnia aktualizacja:** 2026-04-27
