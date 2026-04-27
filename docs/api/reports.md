# Reports API Documentation

## Overview

The Reports API provides endpoints for generating, viewing, and exporting various system reports including patient adherence, project statistics, and therapy progress. This implements **ww.51** through **ww.56** requirements for reporting functionality.

## Base URL

```
/api/v1/reports
```

## Authentication

All endpoints require:
- JWT Bearer token in `Authorization` header
- Appropriate role permissions

---

## Patient Adherence Reports

### Get Patient Adherence Report

```http
GET /api/v1/reports/patients/{id}/adherence
```

**Description:** Returns adherence/compliance statistics for a specific patient (implements **ww.51**).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Patient ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | UUID | No | Filter by specific project |
| dateFrom | String | No | Start date (ISO 8601) |
| dateTo | String | No | End date (ISO 8601) |

**Request Example:**
```bash
GET /api/v1/reports/patients/550e8400-e29b-41d4-a716-446655440000/adherence?dateFrom=2026-01-01&dateTo=2026-04-24
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jan Kowalski",
  "overallComplianceRate": 78.5,
  "reportPeriod": {
    "from": "2026-01-01",
    "to": "2026-04-24"
  },
  "byProject": [
    {
      "projectId": "proj-001",
      "projectName": "Terapia Słuchowa 2026",
      "complianceRate": 82.3,
      "totalTasks": 120,
      "completedTasks": 99,
      "missedTasks": 21
    }
  ],
  "byWeek": [
    {
      "week": "2026-W01",
      "complianceRate": 75.0,
      "completedTasks": 15,
      "totalTasks": 20
    },
    {
      "week": "2026-W02",
      "complianceRate": 85.0,
      "completedTasks": 17,
      "totalTasks": 20
    }
  ],
  "trend": "IMPROVING",
  "lastUpdated": "2026-04-24T10:00:00Z"
}
```

**Compliance Rate Calculation:**
```
complianceRate = (completedTasks / totalTasks) * 100
```

---

### Get Low Adherence Patients

```http
GET /api/v1/reports/patients/low-adherence
```

**Description:** Returns list of patients with adherence below threshold (implements **ww.52**).

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| threshold | Integer | No | 60 | Compliance rate threshold |
| projectId | UUID | No | - | Filter by project |
| sortBy | String | No | complianceRate | Sort field |
| sortOrder | String | No | asc | Sort order: `asc`, `desc` |

**Request Example:**
```bash
GET /api/v1/reports/patients/low-adherence?threshold=60&projectId=proj-001
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "threshold": 60.0,
  "totalPatients": 25,
  "patients": [
    {
      "patientId": "pat-001",
      "patientName": "Anna Nowak",
      "complianceRate": 45.5,
      "projectId": "proj-001",
      "projectName": "Terapia Słuchowa 2026",
      "totalTasks": 100,
      "completedTasks": 45,
      "missedTasks": 55,
      "lastActiveDate": "2026-04-20T14:00:00Z",
      "coordinatorName": "Dr Jan Kowalski",
      "riskLevel": "HIGH"
    },
    {
      "patientId": "pat-002",
      "patientName": "Piotr Wiśniewski",
      "complianceRate": 52.0,
      "projectId": "proj-001",
      "projectName": "Terapia Słuchowa 2026",
      "totalTasks": 80,
      "completedTasks": 42,
      "missedTasks": 38,
      "lastActiveDate": "2026-04-22T09:00:00Z",
      "coordinatorName": "Dr Jan Kowalski",
      "riskLevel": "MEDIUM"
    }
  ]
}
```

**Risk Levels:**
- `HIGH`: Compliance rate < 40%
- `MEDIUM`: Compliance rate 40-60%
- `LOW`: Compliance rate > 60%

---

## Project Reports

### Get Project Statistics

```http
GET /api/v1/reports/projects/{id}/statistics
```

**Description:** Returns comprehensive statistics for a specific project (implements **ww.53**).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Project ID |

**Request Example:**
```bash
GET /api/v1/reports/projects/proj-001/statistics
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "projectId": "proj-001",
  "projectName": "Terapia Słuchowa 2026",
  "status": "ACTIVE",
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-06-30"
  },
  "patients": {
    "total": 50,
    "active": 45,
    "completed": 3,
    "dropped": 2
  },
  "adherence": {
    "averageComplianceRate": 78.5,
    "medianComplianceRate": 82.0,
    "patientsAboveThreshold": 38,
    "patientsBelowThreshold": 12
  },
  "tasks": {
    "total": 2500,
    "completed": 1962,
    "pending": 438,
    "overdue": 100,
    "completionRate": 78.5
  },
  "messages": {
    "total": 450,
    "fromPatients": 280,
    "fromStaff": 170,
    "averageResponseTime": "2h 15m"
  },
  "events": {
    "total": 120,
    "individual": 80,
    "group": 30,
    "cancelled": 10
  },
  "materials": {
    "total": 45,
    "views": 1250,
    "averageCompletionRate": 65.0
  },
  "team": {
    "coordinator": "Dr Anna Nowak",
    "therapists": 5,
    "totalMessages": 450
  }
}
```

---

### Get Project Timeline Report

```http
GET /api/v1/reports/projects/{id}/timeline
```

**Description:** Returns timeline of patient progress within a project (implements **ww.54**).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Project ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| patientId | UUID | No | Filter by specific patient |

**Request Example:**
```bash
GET /api/v1/reports/projects/proj-001/timeline
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "projectId": "proj-001",
  "projectName": "Terapia Słuchowa 2026",
  "timeline": [
    {
      "date": "2026-01-15",
      "event": "PROJECT_STARTED",
      "description": "Project therapy started",
      "patientsAffected": 50
    },
    {
      "date": "2026-02-01",
      "event": "MATERIAL_ADDED",
      "description": "New educational material added: Ćwiczenia słuchowe etap 1",
      "materialId": "mat-001"
    },
    {
      "date": "2026-02-15",
      "event": "MILESTONE_REACHED",
      "description": "50% of patients completed stage 1",
      "patientsAffected": 25
    },
    {
      "date": "2026-03-01",
      "event": "GROUP_EVENT",
      "description": "Group therapy session",
      "attendees": 35
    },
    {
      "date": "2026-04-01",
      "event": "COMPLIANCE_ALERT",
      "description": "10 patients below compliance threshold",
      "patientsAffected": 10
    }
  ]
}
```

---

### Compare Projects

```http
GET /api/v1/reports/projects/compare
```

**Description:** Compares statistics across multiple projects.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectIds | Array | Yes | List of project IDs to compare |

**Request Example:**
```bash
GET /api/v1/reports/projects/compare?projectIds=proj-001,proj-002,proj-003
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "comparison": [
    {
      "projectId": "proj-001",
      "projectName": "Terapia Słuchowa 2026",
      "patients": 50,
      "averageComplianceRate": 78.5,
      "completionRate": 65.0,
      "totalMessages": 450,
      "averageResponseTime": "2h 15m"
    },
    {
      "projectId": "proj-002",
      "projectName": "Terapia Wizualna 2026",
      "patients": 35,
      "averageComplianceRate": 82.3,
      "completionRate": 70.0,
      "totalMessages": 320,
      "averageResponseTime": "1h 45m"
    },
    {
      "projectId": "proj-003",
      "projectName": "Terapia Ruchowa 2026",
      "patients": 40,
      "averageComplianceRate": 71.2,
      "completionRate": 58.0,
      "totalMessages": 380,
      "averageResponseTime": "3h 00m"
    }
  ],
  "averages": {
    "averageComplianceRate": 77.3,
    "averageCompletionRate": 64.3,
    "averageResponseTime": "2h 20m"
  }
}
```

---

## System Reports

### Get Dashboard Report

```http
GET /api/v1/reports/dashboard
```

**Description:** Returns comprehensive dashboard report for coordinators and admins.

**Request Example:**
```bash
GET /api/v1/reports/dashboard
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "summary": {
    "totalPatients": 500,
    "activePatients": 350,
    "totalProjects": 85,
    "activeProjects": 60,
    "averageComplianceRate": 78.5
  },
  "alerts": [
    {
      "type": "LOW_ADHERENCE",
      "severity": "HIGH",
      "count": 25,
      "description": "Patients below compliance threshold"
    },
    {
      "type": "OVERDUE_TASKS",
      "severity": "MEDIUM",
      "count": 150,
      "description": "Overdue tasks across all projects"
    },
    {
      "type": "UNREAD_MESSAGES",
      "severity": "LOW",
      "count": 45,
      "description": "Unread messages from patients"
    }
  ],
  "recentActivity": [
    {
      "type": "PATIENT_ENROLLMENT",
      "timestamp": "2026-04-24T09:30:00Z",
      "description": "5 new patients enrolled in Terapia Słuchowa 2026"
    },
    {
      "type": "MATERIAL_PUBLISHED",
      "timestamp": "2026-04-24T08:00:00Z",
      "description": "New material published: Ćwiczenia oddechowe"
    }
  ],
  "trends": {
    "patientGrowth": "+12% (last 30 days)",
    "complianceTrend": "+3.5% (last 30 days)",
    "messageVolume": "+8% (last 30 days)"
  }
}
```

---

### Export Report

```http
POST /api/v1/reports/export
```

**Description:** Exports report data in various formats.

**Request Body:**
```json
{
  "reportType": "PATIENT_ADHERENCE",
  "format": "csv",
  "parameters": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-04-24"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| reportType | String | Type: `PATIENT_ADHERENCE`, `PROJECT_STATISTICS`, `LOW_ADHERENCE`, `TIMELINE` |
| format | String | Format: `csv`, `xlsx`, `pdf`, `json` |
| parameters | Object | Report-specific parameters |

**Request Example:**
```bash
POST /api/v1/reports/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportType": "PATIENT_ADHERENCE",
  "format": "csv",
  "parameters": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-04-24"
  }
}
```

**Response:**
- Content-Type: `text/csv` (or requested format)
- Content-Disposition: `attachment; filename="patient_adherence_2026-04-24.csv"`

---

## Therapy Progress Reports

### Get Patient Therapy Progress

```http
GET /api/v1/reports/patients/{id}/progress
```

**Description:** Returns detailed therapy progress report for a patient.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Patient ID |

**Request Example:**
```bash
GET /api/v1/reports/patients/550e8400-e29b-41d4-a716-446655440000/progress
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jan Kowalski",
  "currentProjects": [
    {
      "projectId": "proj-001",
      "projectName": "Terapia Słuchowa 2026",
      "enrollmentDate": "2026-01-15",
      "stage": "STAGE_2",
      "progress": 65.0,
      "tasksCompleted": 78,
      "tasksTotal": 120,
      "nextMilestone": "Complete stage 2 exercises",
      "estimatedCompletion": "2026-06-30"
    }
  ],
  "completedProjects": [
    {
      "projectId": "proj-old",
      "projectName": "Terapia Wstępna 2025",
      "enrollmentDate": "2025-09-01",
      "completionDate": "2025-12-31",
      "finalComplianceRate": 92.5,
      "outcome": "COMPLETED_SUCCESSFULLY"
    }
  ],
  "achievements": [
    {
      "type": "STREAK",
      "title": "7-Day Streak",
      "earnedAt": "2026-04-10T10:00:00Z"
    },
    {
      "type": "MILESTONE",
      "title": "50% Complete",
      "earnedAt": "2026-03-15T14:00:00Z"
    }
  ],
  "adherenceHistory": {
    "last7Days": 85.0,
    "last30Days": 78.5,
    "last90Days": 75.0,
    "allTime": 78.5
  }
}
```

---

## Message Statistics

### Get Message Statistics

```http
GET /api/v1/reports/messages/statistics
```

**Description:** Returns messaging statistics.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | UUID | No | Filter by project |
| dateFrom | String | No | Start date |
| dateTo | String | No | End date |

**Request Example:**
```bash
GET /api/v1/reports/messages/statistics?projectId=proj-001&dateFrom=2026-01-01
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "period": {
    "from": "2026-01-01",
    "to": "2026-04-24"
  },
  "overview": {
    "totalMessages": 1250,
    "fromPatients": 780,
    "fromStaff": 470,
    "averagePerDay": 12.5
  },
  "responseTime": {
    "average": "2h 15m",
    "median": "1h 30m",
    "p95": "6h 00m",
    "p99": "12h 00m"
  },
  "byType": {
    "question": 450,
    "update": 380,
    "concern": 120,
    "other": 300
  },
  "byProject": [
    {
      "projectId": "proj-001",
      "projectName": "Terapia Słuchowa 2026",
      "totalMessages": 450,
      "averageResponseTime": "2h 00m"
    }
  ],
  "trends": {
    "volumeChange": "+8%",
    "responseTimeChange": "-15%"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `REPORT_NOT_FOUND` | 404 | Report type not found |
| `PATIENT_NOT_FOUND` | 404 | Patient ID not found |
| `PROJECT_NOT_FOUND` | 404 | Project ID not found |
| `INVALID_DATE_RANGE` | 400 | Invalid date range |
| `EXPORT_FAILED` | 500 | Export generation failed |
| `ACCESS_DENIED` | 403 | Insufficient permissions |

---

## Related Requirements

| Requirement | Description |
|-------------|-------------|
| **ww.51** | View patient adherence/compliance statistics |
| **ww.52** | Identify patients with low adherence |
| **ww.53** | View project statistics |
| **ww.54** | View patient progress timeline |
| **ww.55** | Compare projects |
| **ww.56** | Export reports |

---

## Testing

### Unit Tests

```bash
./gradlew test --tests "ReportControllerTest"
./gradlew test --tests "ReportServiceTest"
./gradlew test --tests "AdherenceReportTest"
```

### Test Coverage

- `ReportControllerTest`: 20 tests
- `ReportServiceTest`: 25 tests
- `AdherenceReportTest`: 15 tests

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
