# Admin API Documentation

## Overview

The Admin API provides endpoints for system administration, user management, system configuration, and monitoring. This implements **ww.61** through **ww.70** requirements for administrative functionality.

## Base URL

```
/api/v1/admin
```

## Authentication

All endpoints require:
- Role: `ADMIN`
- JWT Bearer token in `Authorization` header

---

## User Management

### Get All Users

```http
GET /api/v1/admin/users
```

**Description:** Returns paginated list of all users with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role | String | No | Filter by role: `ADMIN`, `COORDINATOR`, `THERAPIST` |
| status | String | No | Filter by status: `ACTIVE`, `INACTIVE`, `PENDING` |
| search | String | No | Search by name or email |
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |

**Request Example:**
```bash
GET /api/v1/admin/users?role=COORDINATOR&status=ACTIVE&page=0&size=10
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "koordinator@kptest.pl",
      "firstName": "Anna",
      "lastName": "Nowak",
      "role": "COORDINATOR",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z",
      "lastLoginAt": "2026-04-24T08:30:00Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 45,
  "totalPages": 5,
  "isFirst": true,
  "isLast": false
}
```

---

### Get User by ID

```http
GET /api/v1/admin/users/{id}
```

**Description:** Returns detailed information about a specific user.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | User ID |

**Request Example:**
```bash
GET /api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "koordinator@kptest.pl",
  "firstName": "Anna",
  "lastName": "Nowak",
  "role": "COORDINATOR",
  "status": "ACTIVE",
  "phoneNumber": "+48123456789",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-04-20T14:00:00Z",
  "lastLoginAt": "2026-04-24T08:30:00Z",
  "twoFactorEnabled": true,
  "permissions": ["PATIENTS_READ", "PATIENTS_WRITE", "PROJECTS_READ", "PROJECTS_WRITE"]
}
```

---

### Create User

```http
POST /api/v1/admin/users
```

**Description:** Creates a new user account (implements **ww.61**).

**Request Body:**
```json
{
  "email": "terapeuta@kptest.pl",
  "password": "TempPassword123!",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "THERAPIST",
  "phoneNumber": "+48123456789",
  "sendInviteEmail": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | User email (must be unique) |
| password | String | Yes | Temporary password |
| firstName | String | Yes | First name |
| lastName | String | Yes | Last name |
| role | String | Yes | Role: `ADMIN`, `COORDINATOR`, `THERAPIST` |
| phoneNumber | String | No | Phone number |
| sendInviteEmail | Boolean | No | Send invitation email (default: true) |

**Request Example:**
```bash
POST /api/v1/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "terapeuta@kptest.pl",
  "password": "TempPassword123!",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "THERAPIST"
}
```

**Response Example:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "terapeuta@kptest.pl",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "THERAPIST",
  "status": "ACTIVE",
  "createdAt": "2026-04-24T10:00:00Z",
  "message": "User created successfully. Invitation email sent."
}
```

---

### Update User

```http
PUT /api/v1/admin/users/{id}
```

**Description:** Updates user information.

**Request Body:**
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "phoneNumber": "+48987654321",
  "role": "COORDINATOR",
  "status": "ACTIVE"
}
```

**Request Example:**
```bash
PUT /api/v1/admin/users/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "COORDINATOR"
}
```

---

### Deactivate User

```http
DELETE /api/v1/admin/users/{id}
```

**Description:** Deactivates a user account (soft delete).

**Request Example:**
```bash
DELETE /api/v1/admin/users/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### Reset User Password

```http
POST /api/v1/admin/users/{id}/reset-password
```

**Description:** Resets user password and sends temporary password via email.

**Request Example:**
```bash
POST /api/v1/admin/users/660e8400-e29b-41d4-a716-446655440001/reset-password
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "message": "Password reset email sent to user",
  "temporaryPasswordExpiresAt": "2026-04-25T10:00:00Z"
}
```

---

## System Configuration

### Get System Settings

```http
GET /api/v1/admin/settings
```

**Description:** Returns all system configuration settings (implements **ww.62**).

**Request Example:**
```bash
GET /api/v1/admin/settings
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "settings": [
    {
      "key": "system.name",
      "value": "KPTEST - System Telemedyczny",
      "category": "GENERAL",
      "description": "System display name"
    },
    {
      "key": "email.provider",
      "value": "sendgrid",
      "category": "EMAIL",
      "description": "Email provider configuration"
    },
    {
      "key": "sms.enabled",
      "value": "false",
      "category": "SMS",
      "description": "SMS notifications enabled"
    },
    {
      "key": "his.integration.enabled",
      "value": "true",
      "category": "HIS",
      "description": "HIS integration status"
    },
    {
      "key": "backup.retention_days",
      "value": "30",
      "category": "BACKUP",
      "description": "Backup retention period in days"
    }
  ]
}
```

---

### Update System Setting

```http
PUT /api/v1/admin/settings/{key}
```

**Description:** Updates a specific system setting.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| key | String | Setting key |

**Request Body:**
```json
{
  "value": "new_value"
}
```

**Request Example:**
```bash
PUT /api/v1/admin/settings/sms.enabled
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "true"
}
```

**Response Example:**
```json
{
  "key": "sms.enabled",
  "value": "true",
  "updatedAt": "2026-04-24T10:00:00Z",
  "updatedBy": "admin@kptest.pl"
}
```

---

### Get System Health

```http
GET /api/v1/admin/health
```

**Description:** Returns system health status and component status.

**Request Example:**
```bash
GET /api/v1/admin/health
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "status": "HEALTHY",
  "timestamp": "2026-04-24T10:00:00Z",
  "components": {
    "database": {
      "status": "UP",
      "responseTime": "15ms",
      "connections": {
        "active": 10,
        "idle": 40,
        "max": 50
      }
    },
    "cache": {
      "status": "UP",
      "responseTime": "2ms",
      "hitRate": "95.5%"
    },
    "his": {
      "status": "UP",
      "responseTime": "120ms",
      "lastCheck": "2026-04-24T09:59:00Z"
    },
    "email": {
      "status": "UP",
      "provider": "SendGrid"
    },
    "storage": {
      "status": "UP",
      "used": "45GB",
      "total": "100GB",
      "percentUsed": 45
    }
  },
  "metrics": {
    "uptime": "15d 4h 32m",
    "activeUsers": 125,
    "requestsPerMinute": 450,
    "errorRate": "0.02%"
  }
}
```

---

## Audit Logs

See [Audit Logs API](./audit.md) for detailed documentation.

### Quick Reference

```http
GET /api/v1/admin/audit-logs          # List audit logs
GET /api/v1/admin/audit-logs/{id}     # Get specific log
POST /api/v1/admin/audit-logs/export  # Export logs
```

---

## Backup Management

See [Backup API](./backup.md) for detailed documentation.

### Quick Reference

```http
POST /api/v1/admin/backup/create      # Create backup
GET /api/v1/admin/backup/history      # Get backup history
GET /api/v1/admin/backup/{id}         # Get backup details
POST /api/v1/admin/backup/restore/{id} # Restore from backup
DELETE /api/v1/admin/backup/{id}      # Delete backup
GET /api/v1/admin/backup/{id}/download # Download backup
```

---

## Reports & Analytics

### Get Dashboard Statistics

```http
GET /api/v1/admin/reports/dashboard
```

**Description:** Returns dashboard statistics for admin panel.

**Request Example:**
```bash
GET /api/v1/admin/reports/dashboard
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "users": {
    "total": 250,
    "active": 220,
    "byRole": {
      "ADMIN": 5,
      "COORDINATOR": 25,
      "THERAPIST": 70,
      "PATIENT": 150
    }
  },
  "patients": {
    "total": 500,
    "activeInProjects": 350,
    "newThisMonth": 45
  },
  "projects": {
    "total": 85,
    "active": 60,
    "completed": 20,
    "archived": 5
  },
  "messages": {
    "totalThisMonth": 1250,
    "averageResponseTime": "2h 30m"
  },
  "adherence": {
    "averageComplianceRate": 78.5,
    "patientsBelowThreshold": 25
  },
  "system": {
    "uptime": "99.9%",
    "errorRate": "0.02%",
    "avgResponseTime": "180ms"
  }
}
```

---

### Export System Report

```http
POST /api/v1/admin/reports/export
```

**Description:** Exports comprehensive system report (implements **ww.67**).

**Request Body:**
```json
{
  "type": "COMPREHENSIVE",
  "format": "pdf",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-04-24",
  "includeSections": [
    "USERS",
    "PATIENTS",
    "PROJECTS",
    "MESSAGES",
    "ADHERENCE",
    "SYSTEM_METRICS"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| type | String | Report type: `COMPREHENSIVE`, `USERS`, `PATIENTS`, `PROJECTS` |
| format | String | Export format: `pdf`, `csv`, `xlsx` |
| dateFrom | String | Start date (ISO 8601) |
| dateTo | String | End date (ISO 8601) |
| includeSections | Array | Sections to include |

**Request Example:**
```bash
POST /api/v1/admin/reports/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "COMPREHENSIVE",
  "format": "pdf",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-04-24"
}
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="system_report_2026-04-24.pdf"`

---

## Role Management

### Get All Roles

```http
GET /api/v1/admin/roles
```

**Description:** Returns all available roles and their permissions.

**Request Example:**
```bash
GET /api/v1/admin/roles
Authorization: Bearer <token>
```

**Response Example:**
```json
[
  {
    "name": "ADMIN",
    "description": "Full system access",
    "permissions": ["*"]
  },
  {
    "name": "COORDINATOR",
    "description": "Patient and project coordination",
    "permissions": [
      "PATIENTS_READ",
      "PATIENTS_WRITE",
      "PROJECTS_READ",
      "PROJECTS_WRITE",
      "MESSAGES_READ",
      "MESSAGES_WRITE"
    ]
  },
  {
    "name": "THERAPIST",
    "description": "Therapist access to assigned patients",
    "permissions": [
      "PATIENTS_READ",
      "PROJECTS_READ",
      "MESSAGES_READ",
      "MESSAGES_WRITE",
      "CALENDAR_READ"
    ]
  }
]
```

---

### Create Custom Role

```http
POST /api/v1/admin/roles
```

**Description:** Creates a custom role with specific permissions.

**Request Body:**
```json
{
  "name": "CUSTOM_ROLE",
  "description": "Custom role description",
  "permissions": [
    "PATIENTS_READ",
    "PROJECTS_READ",
    "REPORTS_READ"
  ]
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ADMIN_ACCESS_DENIED` | 403 | User does not have ADMIN role |
| `USER_NOT_FOUND` | 404 | User ID not found |
| `USER_ALREADY_EXISTS` | 409 | Email already registered |
| `INVALID_ROLE` | 400 | Invalid role specified |
| `SETTING_NOT_FOUND` | 404 | Setting key not found |
| `EXPORT_FAILED` | 500 | Report export failed |

---

## Related Requirements

| Requirement | Description |
|-------------|-------------|
| **ww.61** | Manage users and roles |
| **ww.62** | System configuration |
| **ww.63** | View system statistics |
| **ww.64** | Monitor system health |
| **ww.65** | View system logs |
| **ww.66** | View audit logs |
| **ww.67** | Export reports |
| **ww.68** | Backup management |
| **ww.69** | System maintenance mode |
| **ww.70** | Admin dashboard |

---

## Testing

### Unit Tests

```bash
./gradlew test --tests "AdminControllerTest"
./gradlew test --tests "AdminUserManagementTest"
./gradlew test --tests "AdminSettingsTest"
```

### Test Coverage

- `AdminControllerTest`: 25 tests
- `AdminUserManagementTest`: 18 tests
- `AdminSettingsTest`: 12 tests

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
