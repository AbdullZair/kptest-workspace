# Audit Logs API Documentation

## Overview

The Audit Logs API provides endpoints for viewing, filtering, and exporting audit logs. This implements **ww.66** and **ww.67** requirements for audit log management.

## Base URL

```
/api/v1/admin
```

## Authentication

All endpoints require:
- Role: `ADMIN`
- JWT Bearer token

---

## Endpoints

### Get Audit Logs

```http
GET /api/v1/admin/audit-logs
```

**Description:** Returns paginated audit logs with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String | No | Filter by user ID |
| action | String | No | Filter by action type |
| entityType | String | No | Filter by entity type |
| entityId | String | No | Filter by entity ID |
| dateFrom | String | No | Filter by date from (ISO 8601) |
| dateTo | String | No | Filter by date to (ISO 8601) |
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |

**Request Example:**
```bash
GET /api/v1/admin/audit-logs?action=LOGIN&dateFrom=2026-01-01&page=0&size=20
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "content": [
    {
      "logId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "userName": "Jan Kowalski",
      "action": "LOGIN",
      "entityType": "USER",
      "entityId": "user-123",
      "details": "{\"ip\": \"192.168.1.1\"}",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0",
      "timestamp": "2026-04-24T10:00:00Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 150,
  "totalPages": 8,
  "isFirst": true,
  "isLast": false
}
```

---

### Get Audit Log by ID

```http
GET /api/v1/admin/audit-logs/{id}
```

**Description:** Returns detailed information about a specific audit log.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Audit log ID |

**Request Example:**
```bash
GET /api/v1/admin/audit-logs/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "logId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "userName": "Jan Kowalski",
  "action": "LOGIN",
  "entityType": "USER",
  "entityId": "user-123",
  "details": "{\"ip\": \"192.168.1.1\", \"session\": \"abc123\"}",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0",
  "timestamp": "2026-04-24T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Log not found

---

### Export Audit Logs

```http
POST /api/v1/admin/audit-logs/export
```

**Description:** Exports audit logs to CSV or JSON format (implements **ww.67**).

**Request Body:**

```json
{
  "format": "csv",
  "includeSystemLogs": false,
  "dateFrom": "2026-01-01",
  "dateTo": "2026-04-24"
}
```

| Field | Type | Description |
|-------|------|-------------|
| format | String | Export format: `csv` or `json` |
| includeSystemLogs | Boolean | Include system logs in export |
| dateFrom | String | Start date (ISO 8601) |
| dateTo | String | End date (ISO 8601) |

**Request Example:**
```bash
POST /api/v1/admin/audit-logs/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "csv",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-04-24"
}
```

**Response:**
- Content-Type: `text/csv` or `application/json`
- Content-Disposition: `attachment; filename="audit_logs_2026-04-24.csv"`

**CSV Format Example:**
```csv
logId,userId,userName,action,entityType,entityId,timestamp,ipAddress
550e8400-e29b-41d4-a716-446655440000,user-123,Jan Kowalski,LOGIN,USER,user-123,2026-04-24T10:00:00Z,192.168.1.1
```

---

## Audit Log Actions

| Action | Description |
|--------|-------------|
| LOGIN | User login |
| LOGOUT | User logout |
| REGISTER | User registration |
| PASSWORD_RESET | Password reset request |
| CREATE | Entity creation |
| UPDATE | Entity update |
| DELETE | Entity deletion |
| ASSIGN | Assignment (patient to project) |
| REMOVE | Removal (patient from project) |
| EXPORT | Data export |
| IMPORT | Data import |
| CONFIG_CHANGE | System configuration change |

---

## Entity Types

| Entity Type | Description |
|-------------|-------------|
| USER | User account |
| PATIENT | Patient record |
| PROJECT | Therapy project |
| MESSAGE | Message/Conversation |
| MATERIAL | Educational material |
| EVENT | Calendar event |
| NOTIFICATION | Notification |
| SYSTEM | System-level operation |

---

## Filtering Examples

### Filter by User Action
```
GET /api/v1/admin/audit-logs?action=LOGIN
```

### Filter by Entity Type
```
GET /api/v1/admin/audit-logs?entityType=PATIENT
```

### Filter by Date Range
```
GET /api/v1/admin/audit-logs?dateFrom=2026-01-01&dateTo=2026-01-31
```

### Combined Filters
```
GET /api/v1/admin/audit-logs?userId=user-123&action=CREATE&entityType=PROJECT&page=0&size=10
```

---

## Security Considerations

1. **Access Control:** Only ADMIN role can access audit logs
2. **Audit Logging:** All audit log access is itself logged
3. **Data Retention:** Logs retained for minimum 10 years (compliance)
4. **Export Security:** Exports are secured and access-controlled
5. **PII Protection:** Sensitive data masked in logs where possible

---

## Related Requirements

| Requirement | Description |
|-------------|-------------|
| **ww.66** | View audit logs |
| **ww.67** | Export audit logs |
| **ww.7** | Log all user actions |
| **nf.06** | Log all data access |
| **sec.01** | RODO compliance |

---

## Testing

### Unit Tests

```bash
./gradlew test --tests "AdminControllerAuditLogTest"
```

### Test Coverage

- `AdminControllerAuditLogTest`: 5 tests covering:
  - Get audit logs with filters
  - Get audit log by ID
  - Export audit logs (CSV/JSON)
  - Not found handling

---

**Last Updated:** 2026-04-24  
**Version:** 1.0.0
