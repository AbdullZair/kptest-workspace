# RODO Endpoints

Dokumentacja endpointów związanych z RODO (Rozporządzenie o Ochronie Danych Osobowych).

## POST /api/v1/admin/patients/{id}/anonymize

### Description
Anonimizuje dane pacjenta zgodnie z RODO Art. 17 (prawo do bycia zapomnianym).

### Request
- **Method:** POST
- **Path:** `/api/v1/admin/patients/{id}/anonymize`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Path Parameters:**
  - `id` (UUID) - ID pacjenta
- **Body:**
```json
{
  "reason": "string"
}
```

### Response (200 OK)
```json
{
  "patientId": "uuid",
  "anonymizedAt": "2026-04-27T12:00:00Z",
  "auditLogId": "uuid"
}
```

### Anonymization Details
| Pole | Wartość po anonimizacji |
|------|------------------------|
| pesel | `XXXXXXXXXXX-{hash}` |
| firstName | `ANON` |
| lastName | `ANON-{seq}` |
| email | `anon-{id}@deleted.local` |
| phone | `null` |
| dateOfBirth | `null` |
| addressStreet | `null` |
| addressCity | `null` |
| addressPostalCode | `null` |

**Zachowane:**
- `id` pacjenta
- Powiązania projektowe (`PatientProject`)
- Historia auditu (`audit_logs`)

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |
| 404 Not Found | Pacjent nie znaleziony |
| 400 Bad Request | Niepoprawny format żądania |

### User Story
- US-A-10

---

## GET /api/v1/admin/patients/{id}/export-data

### Description
Eksportuje dane pacjenta zgodnie z RODO Art. 20 (prawo do przenoszenia danych).

### Request
- **Method:** GET
- **Path:** `/api/v1/admin/patients/{id}/export-data`
- **Headers:** 
  - `Authorization: Bearer {token}`
- **Path Parameters:**
  - `id` (UUID) - ID pacjenta
- **Query Parameters:**
  - `format` (string) - Format eksportu: `json` lub `pdf`

### Response (200 OK)

**JSON:**
```json
{
  "patientId": "uuid",
  "exportedAt": "2026-04-27T12:00:00Z",
  "data": {
    "personalData": { ... },
    "projects": [ ... ],
    "messages": [ ... ],
    "materials": [ ... ],
    "events": [ ... ],
    "quizAttempts": [ ... ],
    "badges": [ ... ],
    "auditLog": [ ... ]
  }
}
```

**PDF:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="patient-{id}-export.pdf"`
- **Body:** Binary PDF data

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |
| 404 Not Found | Pacjent nie znaleziony |
| 400 Bad Request | Niepoprawny format |

### User Story
- US-A-11

---

## DELETE /api/v1/admin/patients/{id}/erase

### Description
Trwale usuwa dane pacjenta (hard delete) zgodnie z RODO Art. 17.

### Request
- **Method:** DELETE
- **Path:** `/api/v1/admin/patients/{id}/erase`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Path Parameters:**
  - `id` (UUID) - ID pacjenta
- **Body:**
```json
{
  "reason": "string",
  "confirmationToken": "string"
}
```

### Response (200 OK)
```json
{
  "erasedAt": "2026-04-27T12:00:00Z",
  "erasureLogId": "uuid",
  "deletedEntities": {
    "patientBadges": 5,
    "materialProgress": 12,
    "quizAnswerSelections": 8,
    "quizAttempts": 3,
    "messageAttachments": 2,
    "notifications": 4,
    "emergencyContacts": 1
  }
}
```

### Erasure Process
1. **Weryfikacja cooling period:** pacjent musi mieć `deletedAt > 30 dni` temu (lub flaga `force` z wyższym auth)
2. **Hard-delete encji:**
   - `PatientBadge`
   - `MaterialProgress`
   - `QuizAnswerSelection`
   - `QuizAttempt`
   - `MessageAttachment`
   - `Notification`
   - `EmergencyContact`
3. **Anonimizacja powiązań:**
   - `Message.sender` → `null`
   - `AuditLog` - dane PII zerowane, `entityId` zachowane
4. **Hard-delete:** `Patient` i `User` (jeśli dedykowany dla pacjenta)
5. **Audit:** zapis w `DataProcessingErasureLog`

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |
| 404 Not Found | Pacjent nie znaleziony |
| 400 Bad Request | Niepoprawny format / cooling period nie minął |
| 409 Conflict | Token potwierdzenia niepoprawny |

### User Story
- US-A-12

---

## GET /api/v1/admin/data-processing-activities

### Description
Pobiera listę czynności przetwarzania danych osobowych (RODO Art. 30).

### Request
- **Method:** GET
- **Path:** `/api/v1/admin/data-processing-activities`
- **Headers:** 
  - `Authorization: Bearer {token}`
- **Query Parameters:**
  - `page` (int, optional) - Numer strony (domyślnie 0)
  - `size` (int, optional) - Rozmiar strony (domyślnie 20)
  - `legalBasis` (string, optional) - Filtr po podstawie prawnej

### Response (200 OK)
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Przetwarzanie danych pacjentów",
      "purpose": "Realizacja usług medycznych",
      "legalBasis": "LEGAL_OBLIGATION",
      "categories": ["dane zdrowotne", "dane osobowe"],
      "recipients": ["HIS", "laboratoria"],
      "retentionPeriod": "10 lat",
      "securityMeasures": "AES-256 encryption, RBAC",
      "dataController": "Dr Jan Kowalski",
      "dataProcessor": "KPTEST Sp. z o.o.",
      "createdAt": "2026-04-27T10:00:00Z",
      "updatedAt": "2026-04-27T10:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "unsorted": false }
  },
  "totalElements": 1,
  "totalPages": 1
}
```

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |

### User Story
- US-A-13

---

## POST /api/v1/admin/data-processing-activities

### Description
Tworzy nową czynność przetwarzania danych osobowych.

### Request
- **Method:** POST
- **Path:** `/api/v1/admin/data-processing-activities`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Przetwarzanie danych pacjentów",
  "purpose": "Realizacja usług medycznych",
  "legalBasis": "LEGAL_OBLIGATION",
  "categories": ["dane zdrowotne", "dane osobowe"],
  "recipients": ["HIS", "laboratoria"],
  "retentionPeriod": "10 lat",
  "securityMeasures": "AES-256 encryption, RBAC",
  "dataController": "Dr Jan Kowalski",
  "dataProcessor": "KPTEST Sp. z o.o."
}
```

### Response (201 Created)
```json
{
  "id": "uuid",
  "name": "Przetwarzanie danych pacjentów",
  "purpose": "Realizacja usług medycznych",
  "legalBasis": "LEGAL_OBLIGATION",
  "createdAt": "2026-04-27T12:00:00Z",
  "updatedAt": "2026-04-27T12:00:00Z"
}
```

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |
| 400 Bad Request | Niepoprawny format żądania |

### User Story
- US-A-13

---

## PUT /api/v1/admin/data-processing-activities/{id}

### Description
Aktualizuje istniejącą czynność przetwarzania danych osobowych.

### Request
- **Method:** PUT
- **Path:** `/api/v1/admin/data-processing-activities/{id}`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Path Parameters:**
  - `id` (UUID) - ID czynności przetwarzania
- **Body:**
```json
{
  "name": "Przetwarzanie danych pacjentów",
  "purpose": "Realizacja usług medycznych",
  "legalBasis": "LEGAL_OBLIGATION",
  "categories": ["dane zdrowotne", "dane osobowe"],
  "recipients": ["HIS", "laboratoria"],
  "retentionPeriod": "10 lat",
  "securityMeasures": "AES-256 encryption, RBAC",
  "dataController": "Dr Jan Kowalski",
  "dataProcessor": "KPTEST Sp. z o.o."
}
```

### Response (200 OK)
```json
{
  "id": "uuid",
  "name": "Przetwarzanie danych pacjentów",
  "purpose": "Realizacja usług medycznych",
  "legalBasis": "LEGAL_OBLIGATION",
  "createdAt": "2026-04-27T10:00:00Z",
  "updatedAt": "2026-04-27T12:00:00Z"
}
```

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |
| 404 Not Found | Czynność nie znaleziona |
| 400 Bad Request | Niepoprawny format żądania |

### User Story
- US-A-13

---

## DELETE /api/v1/admin/data-processing-activities/{id}

### Description
Usuwa czynność przetwarzania danych osobowych.

### Request
- **Method:** DELETE
- **Path:** `/api/v1/admin/data-processing-activities/{id}`
- **Headers:** 
  - `Authorization: Bearer {token}`
- **Path Parameters:**
  - `id` (UUID) - ID czynności przetwarzania

### Response (204 No Content)

### Errors
| Code | Description |
|------|-------------|
| 403 Forbidden | Brak uprawnień admina |
| 404 Not Found | Czynność nie znaleziona |

### User Story
- US-A-13

---

## Legal Basis Enum

| Wartość | Opis |
|---------|------|
| `CONSENT` | Zgoda osoby fizycznej |
| `CONTRACT` | Niezbędne do wykonania umowy |
| `LEGAL_OBLIGATION` | Niezbędne do wypełnienia obowiązku prawnego |
| `VITAL_INTEREST` | Ochrona ważnych interesów osoby |
| `PUBLIC_TASK` | Zadanie realizowane w interesie publicznym |
| `LEGITIMATE_INTEREST` | Prawnie uzasadniony interes administratora |

---

## Security Requirements

Wszystkie endpointy RODO wymagają:
- **Rola:** `ADMIN`
- **Autoryzacja:** `@PreAuthorize("hasRole('ADMIN')")`
- **Audit:** Każda operacja jest logowana w `AuditLog`

---

**Ostatnia aktualizacja:** 2026-04-27
