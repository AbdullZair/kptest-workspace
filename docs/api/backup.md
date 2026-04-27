# Backup Management API Documentation

## Overview

The Backup Management API provides endpoints for creating, restoring, and managing system backups. This implements **ww.68** requirement for backup management functionality.

## Base URL

```
/api/v1/admin/backup
```

## Authentication

All endpoints require:
- Role: `ADMIN`
- JWT Bearer token

---

## Endpoints

### Create Backup

```http
POST /api/v1/admin/backup/create
```

**Description:** Creates a new system backup (implements **ww.68**).

**Request:** No body required

**Request Example:**
```bash
POST /api/v1/admin/backup/create
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "backupId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "message": "Backup completed successfully",
  "createdAt": "2026-04-24T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Backup created successfully
- `500 Internal Server Error` - Backup failed

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| backupId | String | Unique backup identifier |
| status | String | Backup status: `COMPLETED`, `FAILED`, `IN_PROGRESS` |
| message | String | Status message |
| createdAt | DateTime | Creation timestamp |

---

### Get Backup History

```http
GET /api/v1/admin/backup/history
```

**Description:** Returns list of all backups with their status (implements **ww.68**).

**Request Example:**
```bash
GET /api/v1/admin/backup/history
Authorization: Bearer <token>
```

**Response Example:**
```json
[
  {
    "backupId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-24T10:00:00Z",
    "createdBy": "system",
    "sizeBytes": 52428800,
    "status": "COMPLETED",
    "databaseVersion": "15.0",
    "notes": "Daily automated backup",
    "isDownloadable": true,
    "isRestorable": true
  },
  {
    "backupId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-04-17T10:00:00Z",
    "createdBy": "admin@kptest.com",
    "sizeBytes": 50331648,
    "status": "COMPLETED",
    "databaseVersion": "15.0",
    "notes": "Pre-deployment backup",
    "isDownloadable": true,
    "isRestorable": true
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| backupId | String | Unique backup identifier |
| createdAt | DateTime | Creation timestamp |
| createdBy | String | User/system that created backup |
| sizeBytes | Long | Backup file size in bytes |
| status | String | Backup status |
| databaseVersion | String | Database version at backup time |
| notes | String | Backup notes/description |
| isDownloadable | Boolean | Can be downloaded |
| isRestorable | Boolean | Can be used for restore |

---

### Get Backup by ID

```http
GET /api/v1/admin/backup/{id}
```

**Description:** Returns detailed information about a specific backup.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Backup ID |

**Request Example:**
```bash
GET /api/v1/admin/backup/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response:** Same structure as backup history entry.

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Backup not found

---

### Restore from Backup

```http
POST /api/v1/admin/backup/restore/{id}
```

**Description:** Restores system from a specific backup (implements **ww.68**).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Backup ID to restore from |

**Request Body:**

```json
{
  "confirm": true,
  "notes": "Emergency restore after data corruption"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| confirm | Boolean | Yes | Must be `true` to proceed |
| notes | String | No | Reason for restore |

**Request Example:**
```bash
POST /api/v1/admin/backup/restore/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirm": true,
  "notes": "Emergency restore"
}
```

**Response Example:**
```json
{
  "backupId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "message": "Restore completed successfully",
  "createdAt": "2026-04-24T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Restore completed
- `400 Bad Request` - Confirmation not provided
- `500 Internal Server Error` - Restore failed

**Warning:** Restore operation:
1. Puts system in maintenance mode
2. Drops all existing data
3. Restores from backup
4. Clears all caches
5. Requires system restart

---

### Delete Backup

```http
DELETE /api/v1/admin/backup/{id}
```

**Description:** Deletes an old backup to free up storage space.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Backup ID to delete |

**Request Example:**
```bash
DELETE /api/v1/admin/backup/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Status Codes:**
- `204 No Content` - Deleted successfully
- `404 Not Found` - Backup not found

---

### Download Backup

```http
GET /api/v1/admin/backup/{id}/download
```

**Description:** Downloads backup file for offline storage.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Backup ID to download |

**Request Example:**
```bash
GET /api/v1/admin/backup/550e8400-e29b-41d4-a716-446655440000/download
Authorization: Bearer <token>
```

**Response:**
- Content-Type: `application/sql`
- Content-Disposition: `attachment; filename="backup_550e8400-e29b-41d4-a716-446655440000.sql"`

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Backup not found

---

## Backup Status Values

| Status | Description |
|--------|-------------|
| `COMPLETED` | Backup completed successfully |
| `FAILED` | Backup failed |
| `IN_PROGRESS` | Backup is being created |
| `PENDING` | Backup is queued |

---

## Automated Backups

The system supports automated daily backups:

```java
@Scheduled(cron = "0 0 2 * * *")  // Daily at 2 AM
public void scheduleDailyBackup() {
    backupService.scheduleDailyBackup();
}
```

### Retention Policy

Default retention: 30 days

```java
backupService.cleanupOldBackups();  // Removes backups older than 30 days
```

---

## Storage Usage

Check backup storage usage:

```java
long usageBytes = backupService.getStorageUsage();
```

---

## Security Considerations

1. **Access Control:** Only ADMIN role can manage backups
2. **Audit Logging:** All backup operations are logged
3. **Encryption:** Backups encrypted at rest (AES-256)
4. **Secure Storage:** Backups stored in secure, access-controlled location
5. **Confirmation:** Restore requires explicit confirmation
6. **Download Security:** Downloads require authentication and are logged

---

## Backup Workflow

### Create Backup

```
1. Lock database for consistent snapshot
2. Export all tables to SQL dump
3. Compress backup file
4. Upload to secure storage
5. Record metadata in database
6. Send notification to admins
7. Release database lock
```

### Restore Backup

```
1. Validate backup file exists
2. Put system in maintenance mode
3. Drop all tables
4. Import backup SQL dump
5. Verify data integrity
6. Clear cache
7. Bring system back online
8. Send notification to admins
```

---

## Related Requirements

| Requirement | Description |
|-------------|-------------|
| **ww.68** | Backup management |
| **nf.18** | Automated backup every 24 hours |
| **dos.02** | Automatic backup mechanisms |
| **sec.01** | RODO compliance for data backup |

---

## Testing

### Unit Tests

```bash
./gradlew test --tests "BackupServiceTest"
./gradlew test --tests "BackupServiceAdditionalTest"
./gradlew test --tests "BackupControllerTest"
```

### Test Coverage

- `BackupServiceTest`: 13 tests
- `BackupServiceAdditionalTest`: 11 tests
- `BackupControllerTest`: 12 tests

**Total:** 36 tests for backup functionality

---

## Error Handling

| Scenario | Status Code | Response |
|----------|-------------|----------|
| Backup creation failed | 500 | Error message |
| Backup not found | 404 | Not found |
| Restore without confirmation | 400 | Bad request |
| Restore failed | 500 | Error message |
| Unauthorized access | 403 | Forbidden |

---

**Last Updated:** 2026-04-24  
**Version:** 1.0.0
