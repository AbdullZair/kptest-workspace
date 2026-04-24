# Calendar API Documentation

Base URL: `/api/v1/calendar`

## Overview

The Calendar API provides management of therapy events, including scheduling, status tracking, iCal export, and reminder configuration. Events can be individual or group sessions, appointments, medication reminders, and health measurements.

## Authentication

All endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/v1/calendar/events

Retrieve a list of therapy events with optional filtering.

**Roles:** `PATIENT`, `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | No | Filter events by patient ID |
| `type` | string | No | Filter by event type (see Event Types below) |
| `status` | string | No | Filter by event status (SCHEDULED, COMPLETED, OVERDUE, CANCELLED) |
| `startDate` | string | No | Filter events starting from this date (ISO-8601) |
| `endDate` | string | No | Filter events up to this date (ISO-8601) |

**Example Request:**

```http
GET /api/v1/calendar/events?patientId=550e8400-e29b-41d4-a716-446655440000&status=SCHEDULED&startDate=2024-02-01T00:00:00Z&endDate=2024-02-29T23:59:59Z HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "event-001",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "patientName": "Jan Kowalski",
    "title": "Wizyta kontrolna",
    "description": "Regularna wizyta kontrolna po 3 miesiącach od implantacji",
    "type": "MEDICAL_APPOINTMENT",
    "status": "SCHEDULED",
    "startDate": "2024-02-25T10:00:00Z",
    "endDate": "2024-02-25T11:00:00Z",
    "location": "Gabinet 205, ul. Medyczna 12, Warszawa",
    "createdBy": {
      "id": "staff-001",
      "name": "Dr Maria Wiśniewska",
      "role": "COORDINATOR"
    },
    "reminders": [
      {
        "type": "PUSH",
        "minutesBefore": 1440
      },
      {
        "type": "SMS",
        "minutesBefore": 120
      }
    ],
    "isRecurring": false,
    "completedAt": null,
    "patientNotes": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": "event-002",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "patientName": "Jan Kowalski",
    "title": "Ćwiczenia percepcji dźwięków",
    "description": "Codzienne ćwiczenia z aplikacją - zestaw 5",
    "type": "THERAPY_SESSION",
    "status": "SCHEDULED",
    "startDate": "2024-02-22T08:00:00Z",
    "endDate": "2024-02-22T08:30:00Z",
    "location": null,
    "createdBy": {
      "id": "staff-003",
      "name": "mgr Katarzyna Lewandowska",
      "role": "THERAPIST"
    },
    "reminders": [
      {
        "type": "PUSH",
        "minutesBefore": 30
      }
    ],
    "isRecurring": true,
    "recurrencePattern": {
      "frequency": "DAILY",
      "interval": 1,
      "endDate": "2024-03-22T00:00:00Z"
    },
    "completedAt": null,
    "patientNotes": null,
    "createdAt": "2024-01-20T09:00:00Z",
    "updatedAt": "2024-01-20T09:00:00Z"
  },
  {
    "id": "event-003",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "patientName": "Jan Kowalski",
    "title": "Przypomnienie o lekach",
    "description": "Przyjmij witaminy z grupy B",
    "type": "MEDICATION_REMINDER",
    "status": "SCHEDULED",
    "startDate": "2024-02-22T09:00:00Z",
    "endDate": "2024-02-22T09:00:00Z",
    "location": null,
    "createdBy": {
      "id": "staff-002",
      "name": "Dr Piotr Zieliński",
      "role": "DOCTOR"
    },
    "reminders": [
      {
        "type": "PUSH",
        "minutesBefore": 0
      }
    ],
    "isRecurring": true,
    "recurrencePattern": {
      "frequency": "DAILY",
      "interval": 1
    },
    "completedAt": null,
    "patientNotes": null,
    "createdAt": "2024-01-20T09:30:00Z",
    "updatedAt": "2024-01-20T09:30:00Z"
  }
]
```

---

### GET /api/v1/calendar/events/{id}

Retrieve detailed information about a specific therapy event.

**Roles:** `PATIENT`, `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Example Request:**

```http
GET /api/v1/calendar/events/event-001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "event-001",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jan Kowalski",
  "title": "Wizyta kontrolna",
  "description": "Regularna wizyta kontrolna po 3 miesiącach od implantacji",
  "type": "MEDICAL_APPOINTMENT",
  "status": "SCHEDULED",
  "startDate": "2024-02-25T10:00:00Z",
  "endDate": "2024-02-25T11:00:00Z",
  "location": "Gabinet 205, ul. Medyczna 12, Warszawa",
  "createdBy": {
    "id": "staff-001",
    "name": "Dr Maria Wiśniewska",
    "role": "COORDINATOR"
  },
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 1440,
      "sentAt": null
    },
    {
      "type": "SMS",
      "minutesBefore": 120,
      "sentAt": null
    }
  ],
  "isRecurring": false,
  "recurrencePattern": null,
  "attachments": [
    {
      "id": "attach-evt-001",
      "fileName": "karta_wizyty.pdf",
      "fileSize": 512000,
      "mimeType": "application/pdf",
      "downloadUrl": "/api/v1/calendar/events/event-001/attachments/attach-evt-001"
    }
  ],
  "completedAt": null,
  "patientNotes": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### POST /api/v1/calendar/events

Create a new therapy event.

**Roles:** `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Request Body:**

```json
{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Nowe wydarzenie",
  "description": "Opis wydarzenia",
  "type": "THERAPY_SESSION",
  "startDate": "2024-03-01T10:00:00Z",
  "endDate": "2024-03-01T11:00:00Z",
  "location": "Gabinet 205",
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 1440
    },
    {
      "type": "SMS",
      "minutesBefore": 120
    }
  ],
  "isRecurring": false,
  "notifyPatient": true
}
```

**Example Request:**

```http
POST /api/v1/calendar/events HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Sesja terapeutyczna - ćwiczenia słuchowe",
  "description": "Indywidualna sesja z terapeutą prowadzącym",
  "type": "THERAPY_SESSION",
  "startDate": "2024-03-05T14:00:00Z",
  "endDate": "2024-03-05T15:00:00Z",
  "location": "Centrum Słuchu, sala terapii 3",
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 1440
    },
    {
      "type": "PUSH",
      "minutesBefore": 120
    }
  ],
  "isRecurring": false
}
```

**Example Response (201 Created):**

```json
{
  "id": "event-010",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jan Kowalski",
  "title": "Sesja terapeutyczna - ćwiczenia słuchowe",
  "description": "Indywidualna sesja z terapeutą prowadzącym",
  "type": "THERAPY_SESSION",
  "status": "SCHEDULED",
  "startDate": "2024-03-05T14:00:00Z",
  "endDate": "2024-03-05T15:00:00Z",
  "location": "Centrum Słuchu, sala terapii 3",
  "createdBy": {
    "id": "staff-003",
    "name": "mgr Katarzyna Lewandowska",
    "role": "THERAPIST"
  },
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 1440
    },
    {
      "type": "PUSH",
      "minutesBefore": 120
    }
  ],
  "isRecurring": false,
  "notificationSent": true,
  "createdAt": "2024-02-20T16:00:00Z",
  "updatedAt": "2024-02-20T16:00:00Z"
}
```

---

### PUT /api/v1/calendar/events/{id}

Update an existing therapy event.

**Roles:** `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Request Body:**

```json
{
  "title": "Zaktualizowany tytuł",
  "description": "Zaktualizowany opis",
  "startDate": "2024-03-06T14:00:00Z",
  "endDate": "2024-03-06T15:00:00Z",
  "location": "Nowa lokalizacja",
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 60
    }
  ],
  "notifyPatient": true
}
```

**Example Request:**

```http
PUT /api/v1/calendar/events/event-010 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "startDate": "2024-03-06T15:00:00Z",
  "endDate": "2024-03-06T16:00:00Z",
  "location": "Centrum Słuchu, sala terapii 5"
}
```

**Example Response:**

```json
{
  "id": "event-010",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jan Kowalski",
  "title": "Sesja terapeutyczna - ćwiczenia słuchowe",
  "description": "Indywidualna sesja z terapeutą prowadzącym",
  "type": "THERAPY_SESSION",
  "status": "SCHEDULED",
  "startDate": "2024-03-06T15:00:00Z",
  "endDate": "2024-03-06T16:00:00Z",
  "location": "Centrum Słuchu, sala terapii 5",
  "createdBy": {
    "id": "staff-003",
    "name": "mgr Katarzyna Lewandowska",
    "role": "THERAPIST"
  },
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 1440
    },
    {
      "type": "PUSH",
      "minutesBefore": 120
    }
  ],
  "isRecurring": false,
  "notificationSent": true,
  "updatedAt": "2024-02-21T09:00:00Z"
}
```

---

### DELETE /api/v1/calendar/events/{id}

Delete a therapy event.

**Roles:** `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Example Request:**

```http
DELETE /api/v1/calendar/events/event-010 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response (204 No Content):**

```
HTTP/1.1 204 No Content
```

---

### POST /api/v1/calendar/events/{id}/complete

Mark a therapy event as completed.

**Roles:** `PATIENT`, `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Request Body (optional):**

```json
{
  "patientNotes": "Notatka pacjenta dotycząca wykonania wydarzenia"
}
```

**Example Request (Patient completing event):**

```http
POST /api/v1/calendar/events/event-002/complete HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientNotes": "Ćwiczenia wykonane. Trudności z rozróżnianiem dźwięków o podobnej częstotliwości."
}
```

**Example Response:**

```json
{
  "id": "event-002",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jan Kowalski",
  "title": "Ćwiczenia percepcji dźwięków",
  "description": "Codzienne ćwiczenia z aplikacją - zestaw 5",
  "type": "THERAPY_SESSION",
  "status": "COMPLETED",
  "startDate": "2024-02-22T08:00:00Z",
  "endDate": "2024-02-22T08:30:00Z",
  "location": null,
  "createdBy": {
    "id": "staff-003",
    "name": "mgr Katarzyna Lewandowska",
    "role": "THERAPIST"
  },
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 30,
      "sentAt": "2024-02-22T07:30:00Z"
    }
  ],
  "isRecurring": true,
  "completedAt": "2024-02-22T08:25:00Z",
  "patientNotes": "Ćwiczenia wykonane. Trudności z rozróżnianiem dźwięków o podobnej częstotliwości.",
  "createdAt": "2024-01-20T09:00:00Z",
  "updatedAt": "2024-02-22T08:25:00Z"
}
```

---

### GET /api/v1/calendar/upcoming

Retrieve upcoming therapy events for the current user.

**Roles:** `PATIENT`, `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | No | Patient ID (required for staff roles) |

**Example Request (Patient):**

```http
GET /api/v1/calendar/upcoming HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Request (Staff):**

```http
GET /api/v1/calendar/upcoming?patientId=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "event-001",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Wizyta kontrolna",
    "type": "MEDICAL_APPOINTMENT",
    "status": "SCHEDULED",
    "startDate": "2024-02-25T10:00:00Z",
    "endDate": "2024-02-25T11:00:00Z",
    "location": "Gabinet 205, ul. Medyczna 12, Warszawa",
    "timeUntilStart": "P5D"
  },
  {
    "id": "event-002",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ćwiczenia percepcji dźwięków",
    "type": "THERAPY_SESSION",
    "status": "SCHEDULED",
    "startDate": "2024-02-22T08:00:00Z",
    "endDate": "2024-02-22T08:30:00Z",
    "location": null,
    "timeUntilStart": "P2D"
  }
]
```

---

### POST /api/v1/calendar/events/{id}/ics

Export a therapy event to iCal format.

**Roles:** `PATIENT`, `COORDINATOR`, `DOCTOR`, `THERAPIST`, `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Example Request:**

```http
POST /api/v1/calendar/events/event-001/ics HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```
HTTP/1.1 200 OK
Content-Type: text/calendar
Content-Disposition: attachment; filename="event-event-001.ics"

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KPTEST//Calendar API//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:event-001@kptest.com
DTSTAMP:20240220T160000Z
DTSTART:20240225T100000Z
DTEND:20240225T110000Z
SUMMARY:Wizyta kontrolna
DESCRIPTION:Regularna wizyta kontrolna po 3 miesiącach od implantacji
LOCATION:Gabinet 205\, ul. Medyczna 12\, Warszawa
ORGANIZER;CN=Dr Maria Wiśniewska:mailto:maria.wisniewska@kptest.com
ATTENDEE;CN=Jan Kowalski;RSVP=TRUE:mailto:jan.kowalski@email.com
STATUS:CONFIRMED
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Przypomnienie
TRIGGER:-PT1440M
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Przypomnienie
TRIGGER:-PT120M
END:VALARM
END:VEVENT
END:VCALENDAR
```

---

## Event Types

| Type | Code | Description |
|------|------|-------------|
| Medical Appointment | `MEDICAL_APPOINTMENT` | Doctor visits, check-ups, consultations |
| Therapy Session | `THERAPY_SESSION` | Individual or group therapy sessions |
| Medication Reminder | `MEDICATION_REMINDER` | Reminders to take medications |
| Exercise/Procedure | `EXERCISE_PROCEDURE` | Home exercises and procedures |
| Health Measurement | `HEALTH_MEASUREMENT` | Regular health parameter measurements |
| Other | `OTHER` | Custom event types |

---

## Event Status

| Status | Code | Description |
|--------|------|-------------|
| Scheduled | `SCHEDULED` | Event is planned for the future |
| Completed | `COMPLETED` | Event has been completed by the patient |
| Overdue | `OVERDUE` | Event was not completed by the scheduled time |
| Cancelled | `CANCELLED` | Event has been cancelled |

---

## Recurrence Patterns

Events can be configured to recur with the following patterns:

```json
{
  "frequency": "DAILY",
  "interval": 1,
  "count": 30,
  "endDate": "2024-03-22T00:00:00Z",
  "byDay": ["MO", "WE", "FR"]
}
```

### Frequency Options

| Frequency | Description | Example |
|-----------|-------------|---------|
| DAILY | Every day | Daily exercises |
| WEEKLY | Every week | Weekly therapy sessions |
| MONTHLY | Every month | Monthly check-ups |
| YEARLY | Every year | Annual reviews |

### Interval

Number of frequency units between occurrences:
- `interval: 1` with `DAILY` = every day
- `interval: 2` with `WEEKLY` = every other week

---

## Reminder Configuration

Reminders can be configured for each event:

```json
{
  "reminders": [
    {
      "type": "PUSH",
      "minutesBefore": 1440
    },
    {
      "type": "SMS",
      "minutesBefore": 120
    },
    {
      "type": "EMAIL",
      "minutesBefore": 60
    }
  ]
}
```

### Reminder Types

| Type | Description | Max per Event |
|------|-------------|---------------|
| PUSH | Push notification to mobile app | 5 |
| SMS | SMS text message | 3 |
| EMAIL | Email notification | 3 |

### Standard Reminder Times

| Time Before | Use Case |
|-------------|----------|
| 1440 min (24h) | Day-before reminder |
| 120 min (2h) | Short-term reminder |
| 60 min (1h) | Immediate reminder |
| 30 min | Very soon reminder |
| 0 min | At-event notification |

---

## Error Responses

### 400 Bad Request

```json
{
  "timestamp": "2024-02-20T16:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Event end date must be after start date",
  "path": "/api/v1/calendar/events"
}
```

### 403 Forbidden

```json
{
  "timestamp": "2024-02-20T16:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: user cannot manage events for this patient",
  "path": "/api/v1/calendar/events/event-001"
}
```

### 404 Not Found

```json
{
  "timestamp": "2024-02-20T16:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Event not found with id: event-001",
  "path": "/api/v1/calendar/events/event-001"
}
```

### 409 Conflict

```json
{
  "timestamp": "2024-02-20T16:00:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot complete an event that is scheduled for the future",
  "path": "/api/v1/calendar/events/event-001/complete"
}
```

---

## Data Models

### TherapyEventDto

```typescript
interface TherapyEventDto {
  id: string;                    // UUID
  projectId: string;             // UUID
  projectName?: string;
  patientId: string;             // UUID
  patientName?: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: string;             // ISO-8601 datetime
  endDate: string;               // ISO-8601 datetime
  location?: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  reminders: Reminder[];
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  attachments?: EventAttachment[];
  completedAt?: string;          // ISO-8601 datetime
  patientNotes?: string;
  notificationSent?: boolean;
  createdAt: string;             // ISO-8601 datetime
  updatedAt: string;             // ISO-8601 datetime
}
```

### Reminder

```typescript
interface Reminder {
  type: ReminderType;            // PUSH, SMS, EMAIL
  minutesBefore: number;
  sentAt?: string;               // ISO-8601 datetime
}
```

### RecurrencePattern

```typescript
interface RecurrencePattern {
  frequency: RecurrenceFrequency;  // DAILY, WEEKLY, MONTHLY, YEARLY
  interval: number;                // Repeat every N units
  count?: number;                  // Total occurrences (optional)
  endDate?: string;                // End date (optional)
  byDay?: string[];                // Days of week (MO, TU, WE, TH, FR, SA, SU)
}
```

### CreateTherapyEventRequest

```typescript
interface CreateTherapyEventRequest {
  projectId: string;             // UUID
  patientId: string;             // UUID
  title: string;
  description?: string;
  type: EventType;
  startDate: string;             // ISO-8601 datetime
  endDate: string;               // ISO-8601 datetime
  location?: string;
  reminders?: Reminder[];
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  notifyPatient?: boolean;       // Default: true
}
```

### UpdateTherapyEventRequest

```typescript
interface UpdateTherapyEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  startDate?: string;
  endDate?: string;
  location?: string;
  reminders?: Reminder[];
  notifyPatient?: boolean;
}
```

### CompleteEventRequest

```typescript
interface CompleteEventRequest {
  patientNotes?: string;
}
```

---

## Related Documentation

- [Patients API](./patients.md)
- [Projects API](./projects.md)
- [Materials API](./materials.md)
