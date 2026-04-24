# API Summary

Kompleksowe podsumowanie wszystkich endpointów REST API systemu KPTEST.

**Total: 85 API endpoints**

---

## Authentication (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Rejestracja nowego pacjenta |
| POST | `/api/v1/auth/login` | Logowanie z credentialami |
| POST | `/api/v1/auth/2fa/verify` | Weryfikacja kodu 2FA po initial login |
| POST | `/api/v1/auth/2fa/enable` | Włączenie uwierzytelniania dwuskładnikowego |
| POST | `/api/v1/auth/2fa/confirm` | Potwierdzenie i aktywacja 2FA |
| POST | `/api/v1/auth/2fa/disable` | Wyłączenie 2FA |
| POST | `/api/v1/auth/refresh` | Odświeżenie tokena dostępu |
| GET | `/api/v1/auth/me` | Dane profilu zalogowanego użytkownika |
| POST | `/api/v1/auth/forgot-password` | Żądanie resetu hasła |

---

## Patients (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patients` | Lista pacjentów z filtrami |
| GET | `/api/v1/patients/{id}` | Szczegóły pacjenta |
| POST | `/api/v1/patients` | Dodaj pacjenta |
| PUT | `/api/v1/patients/{id}` | Aktualizuj pacjenta |
| DELETE | `/api/v1/patients/{id}` | Usuń pacjenta (soft delete) |
| POST | `/api/v1/patients/verify` | Weryfikacja HIS |
| GET | `/api/v1/patients/search` | Wyszukiwanie pacjentów |

---

## Projects (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | Lista projektów |
| GET | `/api/v1/projects/{id}` | Szczegóły projektu |
| POST | `/api/v1/projects` | Utwórz projekt |
| PUT | `/api/v1/projects/{id}` | Aktualizuj projekt |
| DELETE | `/api/v1/projects/{id}` | Usuń projekt |
| POST | `/api/v1/projects/{id}/patients` | Przypisz pacjentów |
| DELETE | `/api/v1/projects/{id}/patients` | Usuń pacjentów z projektu |
| GET | `/api/v1/projects/{id}/patients` | Pacjenci w projekcie |
| GET | `/api/v1/projects/{id}/team` | Zespół projektu |
| GET | `/api/v1/projects/{id}/statistics` | Statystyki projektu |
| GET | `/api/v1/projects/my/active` | Aktywne projekty użytkownika |

---

## Messages (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages/threads` | Lista wątków |
| POST | `/api/v1/messages/threads` | Utwórz wątek |
| GET | `/api/v1/messages/threads/{id}` | Szczegóły wątku |
| GET | `/api/v1/messages/threads/{id}/messages` | Wiadomości w wątku |
| POST | `/api/v1/messages/threads/{id}/messages` | Wyślij wiadomość |
| POST | `/api/v1/messages/messages/{id}/read` | Oznacz jako przeczytane |
| POST | `/api/v1/messages/messages/{id}/attachments` | Dodaj załącznik |
| GET | `/api/v1/messages/unread` | Nieprzeczytane wiadomości |
| GET | `/api/v1/messages/unread/count` | Liczba nieprzeczytanych |

---

## Calendar (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/calendar/events` | Lista wydarzeń |
| GET | `/api/v1/calendar/events/{id}` | Szczegóły wydarzenia |
| POST | `/api/v1/calendar/events` | Utwórz wydarzenie |
| PUT | `/api/v1/calendar/events/{id}` | Aktualizuj wydarzenie |
| DELETE | `/api/v1/calendar/events/{id}` | Usuń wydarzenie |
| POST | `/api/v1/calendar/events/{id}/complete` | Oznacz jako wykonane |
| GET | `/api/v1/calendar/upcoming` | Nadchodzące wydarzenia |
| POST | `/api/v1/calendar/events/{id}/ics` | Eksport do iCal |

---

## Materials (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/materials` | Lista materiałów |
| GET | `/api/v1/materials/{id}` | Szczegóły materiału |
| POST | `/api/v1/materials` | Dodaj materiał |
| PUT | `/api/v1/materials/{id}` | Aktualizuj materiał |
| DELETE | `/api/v1/materials/{id}` | Usuń materiał |
| POST | `/api/v1/materials/{id}/publish` | Opublikuj materiał |
| POST | `/api/v1/materials/{id}/unpublish` | Cofnij publikację |
| POST | `/api/v1/materials/{id}/view` | Zarejestruj wyświetlenie |
| POST | `/api/v1/materials/{id}/complete` | Oznacz jako ukończone |
| GET | `/api/v1/materials/my` | Materiały pacjenta |
| GET | `/api/v1/materials/progress` | Postępy pacjenta |

---

## Reports (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/compliance` | Compliance report |
| GET | `/api/v1/reports/patients` | Patient statistics |
| GET | `/api/v1/reports/projects` | Project statistics |
| GET | `/api/v1/reports/materials` | Material statistics |
| GET | `/api/v1/reports/dashboard` | Dashboard KPIs |
| POST | `/api/v1/reports/export` | Export report (PDF/Excel) |
| GET | `/api/v1/reports/history` | Report history |

---

## Admin (18 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | All users with filters |
| GET | `/api/v1/admin/users/{id}` | User details |
| PUT | `/api/v1/admin/users/{id}/role` | Update user role |
| PUT | `/api/v1/admin/users/{id}/status` | Update user status |
| PUT | `/api/v1/admin/users/{id}/reset-password` | Reset password |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/audit-logs` | Audit logs with filters |
| GET | `/api/v1/admin/audit-logs/{id}` | Audit log details |
| POST | `/api/v1/admin/audit-logs/export` | Export audit logs |
| GET | `/api/v1/admin/system-logs` | System logs with filters |
| POST | `/api/v1/admin/system-logs/export` | Export system logs |
| GET | `/api/v1/admin/system/health` | System health |
| GET | `/api/v1/admin/system/metrics` | System metrics |
| POST | `/api/v1/admin/system/cache/clear` | Clear cache |
| POST | `/api/v1/admin/system/backup` | Create backup |

---

## Health & Monitoring (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/actuator/metrics` | System metrics |
| GET | `/api/v1/actuator/health` | Actuator health |

---

## API Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8080/api/v1` |
| Production | `https://api.kptest.com/api/v1` |

---

## Authentication

All endpoints (except `/auth/register`, `/auth/login`, `/auth/forgot-password`) require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Response Format

### Success (2xx)

```json
{
  "data": { ... },
  "timestamp": "2026-04-24T10:00:00Z"
}
```

### Error (4xx/5xx)

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "status": "BAD_REQUEST",
  "details": [],
  "timestamp": "2026-04-24T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 prób na 15 minut |
| `/auth/register` | 3 rejestracje na godzinę |
| `/auth/2fa/verify` | 5 prób na 15 minut |
| `/auth/refresh` | 10 odświeżeń na minutę |

---

**Last Updated:** 2026-04-24
