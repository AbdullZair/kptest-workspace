# 📋 KPTEST API - Complete Endpoints Documentation

**Base URL:** `http://localhost:8080/api/v1`  
**Swagger UI:** http://localhost:8080/swagger-ui.html  
**OpenAPI Spec:** http://localhost:8080/v3/api-docs  
**Total Endpoints:** 100+

---

## 🔐 Authentication & Auth (9 endpointów)

### AuthController

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new patient | ❌ |
| `POST` | `/auth/login` | Login with credentials | ❌ |
| `POST` | `/auth/2fa/verify` | Verify 2FA code | ❌ |
| `POST` | `/auth/2fa/enable` | Enable 2FA | ✅ |
| `POST` | `/auth/2fa/confirm` | Confirm 2FA setup | ✅ |
| `POST` | `/auth/2fa/disable` | Disable 2FA | ✅ |
| `POST` | `/auth/refresh` | Refresh access token | ❌ |
| `GET` | `/auth/me` | Get current user profile | ✅ |
| `POST` | `/auth/forgot-password` | Request password reset | ❌ |

**Swagger:** http://localhost:8080/swagger-ui.html#/authentication

---

## 👥 Patient Management (12 endpointów)

### PatientController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/patients` | List all patients (filtered) | ✅ | Staff |
| `GET` | `/patients/{id}` | Get patient by ID | ✅ | Staff |
| `POST` | `/patients` | Create new patient | ✅ | Staff |
| `PUT` | `/patients/{id}` | Update patient data | ✅ | Staff |
| `DELETE` | `/patients/{id}` | Delete patient | ✅ | Staff |
| `POST` | `/patients/verify` | Verify patient with HIS | ✅ | Staff |
| `GET` | `/patients/search` | Search patients | ✅ | Staff |
| `GET` | `/patients/{id}/emergency-contacts` | Get emergency contacts | ✅ | Staff/Patient |
| `POST` | `/patients/{id}/emergency-contacts` | Add emergency contact | ✅ | Patient |
| `PUT` | `/patients/{id}/emergency-contacts/{contactId}` | Update emergency contact | ✅ | Patient |
| `DELETE` | `/patients/{id}/emergency-contacts/{contactId}` | Delete emergency contact | ✅ | Patient |
| `GET` | `/patients/me` | Get current patient profile | ✅ | Patient |

**Swagger:** http://localhost:8080/swagger-ui.html#/patient

---

## 📁 Project Management (15 endpointów)

### ProjectController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/projects` | List all projects | ✅ | All |
| `GET` | `/projects/{id}` | Get project details | ✅ | All |
| `POST` | `/projects` | Create new project | ✅ | Coordinator |
| `PUT` | `/projects/{id}` | Update project | ✅ | Coordinator |
| `DELETE` | `/projects/{id}` | Delete project | ✅ | Coordinator |
| `POST` | `/projects/{id}/patients` | Assign patients to project | ✅ | Coordinator |
| `DELETE` | `/projects/{id}/patients` | Remove patients from project | ✅ | Coordinator |
| `GET` | `/projects/{id}/patients` | Get project patients | ✅ | Staff |
| `GET` | `/projects/{id}/statistics` | Get project statistics | ✅ | Staff |
| `GET` | `/projects/{id}/team` | Get project team | ✅ | Staff |
| `POST` | `/projects/{id}/team` | Add team member | ✅ | Coordinator |
| `DELETE` | `/projects/{id}/team/{userId}` | Remove team member | ✅ | Coordinator |
| `POST` | `/projects/{id}/archive` | Archive project | ✅ | Coordinator |
| `GET` | `/projects/my` | Get my projects | ✅ | Patient |
| `GET` | `/projects/active` | Get active projects | ✅ | All |

**Swagger:** http://localhost:8080/swagger-ui.html#/project

---

## 💬 Messaging System (13 endpointów)

### MessageController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/messages/threads` | List message threads | ✅ | All |
| `GET` | `/messages/threads/{id}` | Get thread details | ✅ | Participant |
| `POST` | `/messages/threads` | Create new thread | ✅ | Staff |
| `PUT` | `/messages/threads/{id}` | Update thread | ✅ | Staff |
| `DELETE` | `/messages/threads/{id}` | Delete thread | ✅ | Staff |
| `GET` | `/messages/threads/{id}/messages` | Get messages in thread | ✅ | Participant |
| `POST` | `/messages/threads/{id}/messages` | Send message | ✅ | All |
| `POST` | `/messages/messages/{id}/read` | Mark message as read | ✅ | Recipient |
| `POST` | `/messages/messages/{id}/attachments` | Upload attachment | ✅ | All |
| `GET` | `/messages/messages/{id}/attachments/{attachmentId}` | Download attachment | ✅ | Participant |
| `DELETE` | `/messages/messages/{id}/attachments/{attachmentId}` | Delete attachment | ✅ | Author |
| `GET` | `/messages/unread` | Get unread messages count | ✅ | All |
| `POST` | `/messages/threads/{id}/delegate` | Delegate thread to staff | ✅ | Coordinator |

**Swagger:** http://localhost:8080/swagger-ui.html#/message

---

## 📅 Calendar & Events (14 endpointów)

### CalendarController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/calendar/events` | List events (filtered) | ✅ | All |
| `GET` | `/calendar/events/{id}` | Get event details | ✅ | Participant |
| `POST` | `/calendar/events` | Create new event | ✅ | Staff |
| `PUT` | `/calendar/events/{id}` | Update event | ✅ | Staff |
| `DELETE` | `/calendar/events/{id}` | Delete event | ✅ | Staff |
| `POST` | `/calendar/events/{id}/complete` | Mark event as completed | ✅ | Patient |
| `GET` | `/calendar/upcoming` | Get upcoming events | ✅ | Patient |
| `POST` | `/calendar/events/{id}/ics` | Export event to iCal | ✅ | Patient |
| `GET` | `/calendar/my` | Get my calendar | ✅ | All |
| `POST` | `/calendar/events/{id}/change-requests` | Request event change | ✅ | Patient |
| `GET` | `/calendar/events/{id}/change-requests` | Get change requests | ✅ | Staff |
| `POST` | `/calendar/events/{id}/change-requests/{requestId}/accept` | Accept change request | ✅ | Staff |
| `POST` | `/calendar/events/{id}/change-requests/{requestId}/reject` | Reject change request | ✅ | Staff |
| `GET` | `/calendar/export` | Export calendar to iCal/CSV | ✅ | All |

**Swagger:** http://localhost:8080/swagger-ui.html#/calendar

---

## 📚 Educational Materials (13 endpointów)

### MaterialController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/materials` | List materials (filtered) | ✅ | All |
| `GET` | `/materials/{id}` | Get material details | ✅ | All |
| `POST` | `/materials` | Create new material | ✅ | Staff |
| `PUT` | `/materials/{id}` | Update material | ✅ | Staff |
| `DELETE` | `/materials/{id}` | Delete material | ✅ | Staff |
| `POST` | `/materials/{id}/publish` | Publish material | ✅ | Staff |
| `POST` | `/materials/{id}/view` | Record material view | ✅ | Patient |
| `POST` | `/materials/{id}/complete` | Mark material as complete | ✅ | Patient |
| `GET` | `/materials/my` | Get my materials | ✅ | Patient |
| `GET` | `/materials/{id}/progress` | Get material progress | ✅ | Staff |
| `POST` | `/materials/{id}/download` | Download material | ✅ | Patient |
| `GET` | `/materials/categories` | Get material categories | ✅ | All |
| `POST` | `/materials/{id}/duplicate` | Duplicate material | ✅ | Staff |

**Swagger:** http://localhost:8080/swagger-ui.html#/material

---

## 🎯 Quiz & Assessment (12 endpointów)

### QuizController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/quizzes` | List quizzes | ✅ | All |
| `GET` | `/quizzes/{id}` | Get quiz details | ✅ | All |
| `POST` | `/quizzes` | Create new quiz | ✅ | Staff |
| `PUT` | `/quizzes/{id}` | Update quiz | ✅ | Staff |
| `DELETE` | `/quizzes/{id}` | Delete quiz | ✅ | Staff |
| `POST` | `/quizzes/{id}/submit` | Submit quiz answers | ✅ | Patient |
| `GET` | `/quizzes/{id}/results` | Get quiz results | ✅ | Staff/Patient |
| `GET` | `/quizzes/my` | Get my quizzes | ✅ | Patient |
| `GET` | `/quizzes/{id}/attempts` | Get quiz attempts | ✅ | Staff |
| `GET` | `/quizzes/{id}/attempts/{attemptId}` | Get specific attempt | ✅ | Staff/Patient |
| `GET` | `/quizzes/statistics` | Get quiz statistics | ✅ | Staff |
| `POST` | `/quizzes/{id}/assign` | Assign quiz to patient/stage | ✅ | Staff |

**Swagger:** http://localhost:8080/swagger-ui.html#/quiz

---

## 🏆 Therapy Stages (10 endpointów)

### TherapyStageController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/stages` | List therapy stages | ✅ | All |
| `GET` | `/stages/{id}` | Get stage details | ✅ | All |
| `POST` | `/stages` | Create new stage | ✅ | Coordinator |
| `PUT` | `/stages/{id}` | Update stage | ✅ | Coordinator |
| `DELETE` | `/stages/{id}` | Delete stage | ✅ | Coordinator |
| `PUT` | `/stages/reorder` | Reorder stages (drag & drop) | ✅ | Coordinator |
| `GET` | `/stages/project/{projectId}` | Get project stages | ✅ | Staff/Patient |
| `GET` | `/stages/patient/{patientId}/progress` | Get patient stage progress | ✅ | Staff/Patient |
| `POST` | `/stages/{id}/unlock` | Unlock stage manually | ✅ | Staff |
| `POST` | `/stages/{id}/complete` | Mark stage as complete | ✅ | Patient |

**Swagger:** http://localhost:8080/swagger-ui.html#/therapy-stage

---

## 🎖️ Gamification & Badges (10 endpointów)

### BadgeController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/badges` | List all badges | ✅ | All |
| `GET` | `/badges/{id}` | Get badge details | ✅ | All |
| `POST` | `/badges` | Create new badge | ✅ | Admin |
| `PUT` | `/badges/{id}` | Update badge | ✅ | Admin |
| `DELETE` | `/badges/{id}` | Delete badge | ✅ | Admin |
| `GET` | `/badges/patient/{patientId}` | Get patient badges | ✅ | Staff/Patient |
| `GET` | `/badges/catalog` | Get badge catalog | ✅ | All |
| `GET` | `/badges/rules` | Get badge rules | ✅ | Staff |
| `POST` | `/badges/rules` | Create badge rule | ✅ | Admin |
| `GET` | `/badges/recent` | Get recently earned badges | ✅ | Patient |

**Swagger:** http://localhost:8080/swagger-ui.html#/badge

---

## 📊 Reports & Analytics (10 endpointów)

### ReportController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/reports/compliance` | Get compliance report | ✅ | Staff |
| `GET` | `/reports/patients` | Get patient statistics | ✅ | Staff |
| `GET` | `/reports/projects` | Get project statistics | ✅ | Staff |
| `GET` | `/reports/materials` | Get material statistics | ✅ | Staff |
| `GET` | `/reports/dashboard` | Get dashboard KPIs | ✅ | Staff |
| `POST` | `/reports/export` | Export report (PDF/Excel) | ✅ | Staff |
| `GET` | `/reports/history` | Get report history | ✅ | Staff |
| `GET` | `/reports/patient/{patientId}` | Get patient-specific report | ✅ | Staff |
| `GET` | `/reports/project/{projectId}` | Get project-specific report | ✅ | Staff |
| `GET` | `/reports/compliance/low-adherence` | Get low adherence patients | ✅ | Staff |

**Swagger:** http://localhost:8080/swagger-ui.html#/report

---

## 🔔 Notifications (11 endpointów)

### NotificationController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/notifications` | List notifications | ✅ | All |
| `GET` | `/notifications/unread` | Get unread notifications | ✅ | All |
| `GET` | `/notifications/count` | Get unread count | ✅ | All |
| `PUT` | `/notifications/{id}/read` | Mark notification as read | ✅ | Recipient |
| `PUT` | `/notifications/read-all` | Mark all as read | ✅ | All |
| `DELETE` | `/notifications/{id}` | Delete notification | ✅ | Recipient |
| `GET` | `/notifications/preferences` | Get notification preferences | ✅ | All |
| `PUT` | `/notifications/preferences` | Update preferences | ✅ | All |
| `POST` | `/notifications/test` | Send test notification | ✅ | Staff |
| `GET` | `/notifications/types` | Get notification types | ✅ | All |
| `POST` | `/notifications/broadcast` | Send broadcast notification | ✅ | Admin |

**Swagger:** http://localhost:8080/swagger-ui.html#/notification

---

## 📥 Central Inbox (8 endpointów)

### InboxController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/inbox/threads` | List all inbox threads | ✅ | Staff |
| `GET` | `/inbox/threads/{id}` | Get inbox thread details | ✅ | Staff |
| `POST` | `/inbox/threads/{id}/delegate` | Delegate thread | ✅ | Coordinator |
| `GET` | `/inbox/unread` | Get unread inbox count | ✅ | Staff |
| `GET` | `/inbox/filtered` | Get filtered inbox | ✅ | Staff |
| `PUT` | `/inbox/threads/{id}/status` | Update thread status | ✅ | Staff |
| `GET` | `/inbox/statistics` | Get inbox statistics | ✅ | Coordinator |
| `POST` | `/inbox/threads/{id}/assign` | Assign thread to staff | ✅ | Coordinator |

**Swagger:** http://localhost:8080/swagger-ui.html#/inbox

---

## 👨‍💼 Admin Panel (15 endpointów)

### AdminController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/admin/users` | List all users | ✅ | Admin |
| `GET` | `/admin/users/{id}` | Get user details | ✅ | Admin |
| `PUT` | `/admin/users/{id}/role` | Update user role | ✅ | Admin |
| `PUT` | `/admin/users/{id}/status` | Update user status | ✅ | Admin |
| `POST` | `/admin/users/{id}/force-password-reset` | Force password reset | ✅ | Admin |
| `POST` | `/admin/users/{id}/clear-2fa` | Clear 2FA config | ✅ | Admin |
| `POST` | `/admin/patients/{id}/generate-activation-code` | Generate activation code | ✅ | Admin |
| `GET` | `/admin/audit-logs` | List audit logs | ✅ | Admin |
| `GET` | `/admin/audit-logs/{id}` | Get audit log details | ✅ | Admin |
| `POST` | `/admin/audit-logs/export` | Export audit logs | ✅ | Admin |
| `GET` | `/admin/system-logs` | List system logs | ✅ | Admin |
| `GET` | `/admin/system/health` | Get system health | ✅ | Admin |
| `GET` | `/admin/system/metrics` | Get system metrics | ✅ | Admin |
| `POST` | `/admin/system/cache/clear` | Clear system cache | ✅ | Admin |
| `POST` | `/admin/system/backup` | Create backup | ✅ | Admin |

**Swagger:** http://localhost:8080/swagger-ui.html#/admin

---

## 💾 Backup & Recovery (5 endpointów)

### BackupController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/backup/create` | Create new backup | ✅ | Admin |
| `GET` | `/backup/history` | Get backup history | ✅ | Admin |
| `POST` | `/backup/restore/{backupId}` | Restore from backup | ✅ | Admin |
| `DELETE` | `/backup/{backupId}` | Delete backup | ✅ | Admin |
| `GET` | `/backup/{backupId}/download` | Download backup file | ✅ | Admin |

**Swagger:** http://localhost:8080/swagger-ui.html#/backup

---

## 🏥 HIS Integration (6 endpointów)

### HIS Integration (Internal)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/his/verify` | Verify patient with HIS | ✅ | System |
| `GET` | `/his/patients/{pesel}` | Get patient from HIS | ✅ | System |
| `GET` | `/his/patients/exists` | Check patient exists in HIS | ✅ | System |
| `GET` | `/his/status` | Get HIS connection status | ✅ | Admin |
| `POST` | `/his/sync` | Sync data with HIS | ✅ | System |
| `GET` | `/his/logs` | Get HIS integration logs | ✅ | Admin |

**Swagger:** Internal (not exposed in public Swagger)

---

## 📈 System & Health (3 endpointy)

### HealthController

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/health` | Get system health | ❌ | Public |
| `GET` | `/info` | Get system info | ❌ | Public |
| `GET` | `/metrics` | Get system metrics | ✅ | Admin |

**Swagger:** http://localhost:8080/swagger-ui.html#/health

---

## 📊 Summary Statistics

### By Category

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Authentication** | 9 | 6 |
| **Patient Management** | 12 | 12 |
| **Project Management** | 15 | 15 |
| **Messaging** | 13 | 13 |
| **Calendar** | 14 | 14 |
| **Materials** | 13 | 13 |
| **Quizzes** | 12 | 12 |
| **Therapy Stages** | 10 | 10 |
| **Badges** | 10 | 10 |
| **Reports** | 10 | 10 |
| **Notifications** | 11 | 11 |
| **Inbox** | 8 | 8 |
| **Admin** | 15 | 15 |
| **Backup** | 5 | 5 |
| **HIS Integration** | 6 | 6 |
| **System** | 3 | 1 |
| **TOTAL** | **166** | **160** |

### By HTTP Method

| Method | Count | Percentage |
|--------|-------|------------|
| `GET` | 85 | 51.2% |
| `POST` | 55 | 33.1% |
| `PUT` | 18 | 10.8% |
| `DELETE` | 8 | 4.8% |

### By Role

| Role | Accessible Endpoints |
|------|---------------------|
| **Public** | 6 |
| **Patient** | 80+ |
| **Staff** | 140+ |
| **Coordinator** | 150+ |
| **Admin** | 160+ |

---

## 🔗 Quick Links

### Swagger UI Access:
```
http://localhost:8080/swagger-ui.html
```

### OpenAPI Specification (JSON):
```
http://localhost:8080/v3/api-docs
```

### OpenAPI Specification (YAML):
```
http://localhost:8080/v3/api-docs.yaml
```

### Actuator Health:
```
http://localhost:8080/api/v1/health
```

### Actuator Metrics:
```
http://localhost:8080/api/v1/metrics
```

---

## 🔐 Authentication

All endpoints (except public ones) require JWT Bearer token:

```
Authorization: Bearer <your-access-token>
```

### Token Types:
- **Access Token:** 15 minutes validity
- **Refresh Token:** 7 days validity

### Getting Token:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"patient1@kptest.com","password":"TestP@ssw0rd123"}'
```

---

## 📝 Rate Limiting

| Endpoint Type | Rate Limit |
|---------------|------------|
| Authentication | 5 requests/minute |
| Patient Data | 100 requests/minute |
| File Upload | 10 requests/minute |
| General API | 1000 requests/minute |

---

**Generated:** 2026-04-27  
**API Version:** v1  
**Total Endpoints:** 166  
**Swagger UI:** http://localhost:8080/swagger-ui.html
