# Projects API Documentation

Base URL: `/api/v1/projects`

## Overview

The Projects API provides management of therapeutic projects, including CRUD operations, patient assignments, team management, and project statistics.

## Authentication

All endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/v1/projects

Retrieve a list of projects with optional filtering.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `THERAPIST`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by project status (PLANNED, ACTIVE, COMPLETED, ARCHIVED, CANCELLED) |
| `name` | string | No | Filter by project name (partial match) |

**Example Request:**

```http
GET /api/v1/projects?status=ACTIVE&name=Rehabilitacja HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Rehabilitacja słuchu - grupa A",
    "description": "Kompleksowy program rehabilitacji dla dorosłych pacjentów po implantacji ślimakowej",
    "therapyGoals": [
      "Poprawa rozumienia mowy w hałasie",
      "Adaptacja do procesora mowy",
      "Ćwiczenia percepcji dźwięków"
    ],
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "ACTIVE",
    "stage": "ONGOING",
    "createdAt": "2023-12-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "name": "Rehabilitacja słuchu - grupa B",
    "description": "Program rehabilitacji dla dzieci w wieku 6-12 lat",
    "therapyGoals": [
      "Rozwój umiejętności słuchowych",
      "Nauka poprzez zabawę",
      "Wsparcie rodziny w procesie terapii"
    ],
    "startDate": "2024-02-01",
    "endDate": null,
    "status": "ACTIVE",
    "stage": "ONGOING",
    "createdAt": "2024-01-10T14:30:00Z",
    "updatedAt": "2024-01-10T14:30:00Z"
  }
]
```

---

### GET /api/v1/projects/{id}

Retrieve detailed information about a specific project.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `THERAPIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Example Request:**

```http
GET /api/v1/projects/660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Rehabilitacja słuchu - grupa A",
  "description": "Kompleksowy program rehabilitacji dla dorosłych pacjentów po implantacji ślimakowej",
  "therapyGoals": [
    "Poprawa rozumienia mowy w hałasie",
    "Adaptacja do procesora mowy",
    "Ćwiczenia percepcji dźwięków"
  ],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": "ACTIVE",
  "stage": "ONGOING",
  "team": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440010",
      "staffId": "staff-001",
      "role": "COORDINATOR",
      "joinedAt": "2023-12-15T10:00:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440011",
      "staffId": "staff-002",
      "role": "DOCTOR",
      "joinedAt": "2023-12-15T10:00:00Z"
    }
  ],
  "patientCount": 25,
  "createdAt": "2023-12-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### POST /api/v1/projects

Create a new therapeutic project.

**Roles:** `ADMIN`, `DOCTOR`

**Request Body:**

```json
{
  "name": "Nowy projekt terapeutyczny",
  "description": "Opis celów i zakresu projektu",
  "therapyGoals": [
    "Cel terapeutyczny 1",
    "Cel terapeutyczny 2",
    "Cel terapeutyczny 3"
  ],
  "startDate": "2024-03-01",
  "endDate": "2024-12-31",
  "teamMembers": [
    {
      "staffId": "staff-001",
      "role": "COORDINATOR"
    },
    {
      "staffId": "staff-002",
      "role": "DOCTOR"
    },
    {
      "staffId": "staff-003",
      "role": "THERAPIST"
    }
  ]
}
```

**Example Request:**

```http
POST /api/v1/projects HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Rehabilitacja słuchu - grupa C",
  "description": "Program rehabilitacji dla seniorów",
  "therapyGoals": [
    "Adaptacja do implantu",
    "Ćwiczenia codziennych sytuacji komunikacyjnych"
  ],
  "startDate": "2024-03-01",
  "endDate": "2024-09-30"
}
```

**Example Response (201 Created):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440003",
  "name": "Rehabilitacja słuchu - grupa C",
  "description": "Program rehabilitacji dla seniorów",
  "therapyGoals": [
    "Adaptacja do implantu",
    "Ćwiczenia codziennych sytuacji komunikacyjnych"
  ],
  "startDate": "2024-03-01",
  "endDate": "2024-09-30",
  "status": "PLANNED",
  "stage": "INITIALIZATION",
  "createdAt": "2024-02-15T09:00:00Z",
  "updatedAt": "2024-02-15T09:00:00Z"
}
```

---

### PUT /api/v1/projects/{id}

Update an existing project.

**Roles:** `ADMIN`, `DOCTOR`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Request Body:**

```json
{
  "name": "Zaktualizowana nazwa projektu",
  "description": "Zaktualizowany opis",
  "therapyGoals": ["Nowy cel 1", "Nowy cel 2"],
  "startDate": "2024-03-01",
  "endDate": "2025-03-31",
  "status": "ACTIVE"
}
```

**Example Request:**

```http
PUT /api/v1/projects/660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Rehabilitacja słuchu - grupa A (rozszerzona)",
  "description": "Rozszerzony program rehabilitacji",
  "endDate": "2025-06-30"
}
```

**Example Response:**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Rehabilitacja słuchu - grupa A (rozszerzona)",
  "description": "Rozszerzony program rehabilitacji",
  "therapyGoals": [
    "Poprawa rozumienia mowy w hałasie",
    "Adaptacja do procesora mowy",
    "Ćwiczenia percepcji dźwięków"
  ],
  "startDate": "2024-01-01",
  "endDate": "2025-06-30",
  "status": "ACTIVE",
  "stage": "ONGOING",
  "updatedAt": "2024-02-20T11:30:00Z"
}
```

---

### DELETE /api/v1/projects/{id}

Delete a project and remove all associations.

**Roles:** `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Example Request:**

```http
DELETE /api/v1/projects/660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "message": "Project deleted successfully",
  "id": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

### POST /api/v1/projects/{id}/patients

Assign one or more patients to a project.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Request Body:**

```json
{
  "patientIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Example Request:**

```http
POST /api/v1/projects/660e8400-e29b-41d4-a716-446655440001/patients HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Example Response:**

```json
{
  "message": "Patients assigned successfully",
  "assigned_count": 2,
  "patient_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

---

### DELETE /api/v1/projects/{id}/patients

Remove one or more patients from a project.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Request Body:**

```json
{
  "patientIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "reason": "Patient requested to leave the program"
}
```

**Example Request:**

```http
DELETE /api/v1/projects/660e8400-e29b-41d4-a716-446655440001/patients HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "reason": "Patient relocated to another city"
}
```

**Example Response:**

```json
{
  "message": "Patients removed successfully",
  "removed_count": 1,
  "patient_ids": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

---

### GET /api/v1/projects/{id}/patients

Retrieve patients enrolled in a project.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `THERAPIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activeOnly` | boolean | No | Only return active enrollments (default: true) |

**Example Request:**

```http
GET /api/v1/projects/660e8400-e29b-41d4-a716-446655440001/patients?activeOnly=true HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "patient-project-001",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "patientName": "Jan Kowalski",
    "enrolledAt": "2024-01-15T10:00:00Z",
    "status": "ACTIVE",
    "completedAt": null
  },
  {
    "id": "patient-project-002",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "patientName": "Anna Nowak",
    "enrolledAt": "2024-01-16T11:30:00Z",
    "status": "ACTIVE",
    "completedAt": null
  }
]
```

---

### GET /api/v1/projects/{id}/team

Retrieve team members assigned to a project.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `THERAPIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Example Request:**

```http
GET /api/v1/projects/660e8400-e29b-41d4-a716-446655440001/team HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440010",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "staffId": "staff-001",
    "staffName": "Dr Maria Wiśniewska",
    "role": "COORDINATOR",
    "joinedAt": "2023-12-15T10:00:00Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440011",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "staffId": "staff-002",
    "staffName": "Dr Piotr Zieliński",
    "role": "DOCTOR",
    "joinedAt": "2023-12-15T10:00:00Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440012",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "staffId": "staff-003",
    "staffName": "mgr Katarzyna Lewandowska",
    "role": "THERAPIST",
    "joinedAt": "2024-01-05T09:00:00Z"
  }
]
```

---

### GET /api/v1/projects/{id}/statistics

Retrieve statistics for a specific project.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `THERAPIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Example Request:**

```http
GET /api/v1/projects/660e8400-e29b-41d4-a716-446655440001/statistics HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "patientStatistics": {
    "totalAssigned": 25,
    "activePatients": 22,
    "completedPatients": 3,
    "removedPatients": 0
  },
  "complianceStatistics": {
    "averageCompliance": 78.5,
    "highCompliance": 15,
    "mediumCompliance": 7,
    "lowCompliance": 3
  },
  "activityStatistics": {
    "totalEvents": 150,
    "completedEvents": 120,
    "upcomingEvents": 25,
    "overdueEvents": 5
  },
  "materialStatistics": {
    "totalMaterials": 45,
    "averageReadRate": 82.3,
    "averageCompletionRate": 71.5
  },
  "messagingStatistics": {
    "totalThreads": 30,
    "totalMessages": 450,
    "unreadMessages": 12
  },
  "generatedAt": "2024-02-20T14:30:00Z"
}
```

---

### GET /api/v1/projects/my/active

Retrieve active projects where the current user is a team member.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `THERAPIST`

**Example Request:**

```http
GET /api/v1/projects/my/active HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Rehabilitacja słuchu - grupa A",
    "description": "Kompleksowy program rehabilitacji",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "ACTIVE",
    "myRole": "DOCTOR",
    "patientCount": 25
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "name": "Rehabilitacja słuchu - grupa B",
    "description": "Program rehabilitacji dla dzieci",
    "startDate": "2024-02-01",
    "endDate": null,
    "status": "ACTIVE",
    "myRole": "DOCTOR",
    "patientCount": 18
  }
]
```

---

## Project Statistics Details

### Compliance Levels

| Level | Range | Description |
|-------|-------|-------------|
| High | ≥ 80% | Patient demonstrates excellent engagement |
| Medium | 50-79% | Patient shows moderate engagement |
| Low | < 50% | Patient needs additional support |

### Event Statistics

- **Total Events**: All events scheduled in the project
- **Completed Events**: Events marked as done by patients
- **Upcoming Events**: Future events not yet due
- **Overdue Events**: Past events not completed

### Material Statistics

- **Total Materials**: All educational materials in the project
- **Average Read Rate**: Percentage of materials viewed by patients
- **Average Completion Rate**: Percentage of materials marked as complete

---

## Error Responses

### 400 Bad Request

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Project end date must be after start date",
  "path": "/api/v1/projects"
}
```

### 404 Not Found

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Project not found with id: 660e8400-e29b-41d4-a716-446655440001",
  "path": "/api/v1/projects/660e8400-e29b-41d4-a716-446655440001"
}
```

### 409 Conflict

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Patient is already assigned to this project",
  "path": "/api/v1/projects/660e8400-e29b-41d4-a716-446655440001/patients"
}
```

---

## Data Models

### ProjectResponse

```typescript
interface ProjectResponse {
  id: string;                    // UUID
  name: string;
  description: string;
  therapyGoals: string[];
  startDate: string;             // ISO-8601 date
  endDate?: string;              // ISO-8601 date (optional)
  status: ProjectStatus;         // PLANNED, ACTIVE, COMPLETED, ARCHIVED, CANCELLED
  stage: TherapyStage;           // INITIALIZATION, ONGOING, CLOSING
  team?: ProjectTeam[];          // Included in detailed view
  patientCount?: number;         // Included in detailed view
  createdAt: string;             // ISO-8601 datetime
  updatedAt: string;             // ISO-8601 datetime
}
```

### ProjectCreateRequest

```typescript
interface ProjectCreateRequest {
  name: string;
  description: string;
  therapyGoals: string[];
  startDate: string;
  endDate?: string;
  teamMembers?: {
    staffId: string;
    role: ProjectRole;  // COORDINATOR, DOCTOR, NURSE, THERAPIST
  }[];
}
```

### ProjectStatisticsResponse

```typescript
interface ProjectStatisticsResponse {
  projectId: string;
  projectName: string;
  patientStatistics: {
    totalAssigned: number;
    activePatients: number;
    completedPatients: number;
    removedPatients: number;
  };
  complianceStatistics: {
    averageCompliance: number;
    highCompliance: number;
    mediumCompliance: number;
    lowCompliance: number;
  };
  activityStatistics: {
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    overdueEvents: number;
  };
  materialStatistics: {
    totalMaterials: number;
    averageReadRate: number;
    averageCompletionRate: number;
  };
  messagingStatistics: {
    totalThreads: number;
    totalMessages: number;
    unreadMessages: number;
  };
  generatedAt: string;
}
```

### ProjectTeam

```typescript
interface ProjectTeam {
  id: string;              // UUID
  projectId: string;
  staffId: string;
  staffName: string;
  role: ProjectRole;       // COORDINATOR, DOCTOR, NURSE, THERAPIST
  joinedAt: string;        // ISO-8601 datetime
}
```

### PatientProject

```typescript
interface PatientProject {
  id: string;              // UUID
  projectId: string;
  patientId: string;
  patientName: string;
  enrolledAt: string;      // ISO-8601 datetime
  status: string;          // ACTIVE, COMPLETED, REMOVED
  completedAt?: string;    // ISO-8601 datetime (optional)
}
```

---

## Related Documentation

- [Patients API](./patients.md)
- [Messages API](./messages.md)
- [Calendar API](./calendar.md)
- [Materials API](./materials.md)
