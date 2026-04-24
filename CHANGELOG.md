# Changelog

All notable changes to the KPTEST project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.0] - 2026-04-24

### Added

#### Reports Module
- **GET /api/v1/reports/compliance** - Compliance report for project
- **GET /api/v1/reports/patients** - Patient statistics report
- **GET /api/v1/reports/projects** - Project statistics report
- **GET /api/v1/reports/materials** - Material statistics report
- **GET /api/v1/reports/dashboard** - Dashboard KPIs
- **POST /api/v1/reports/export** - Export report to PDF/Excel
- **GET /api/v1/reports/history** - Report history

#### Admin Module
- **GET /api/v1/admin/users** - All users with filters
- **GET /api/v1/admin/users/{id}** - User details
- **PUT /api/v1/admin/users/{id}/role** - Update user role
- **PUT /api/v1/admin/users/{id}/status** - Update user status
- **PUT /api/v1/admin/users/{id}/reset-password** - Reset password
- **DELETE /api/v1/admin/users/{id}** - Delete user
- **GET /api/v1/admin/audit-logs** - Audit logs with filters
- **GET /api/v1/admin/audit-logs/{id}** - Audit log details
- **POST /api/v1/admin/audit-logs/export** - Export audit logs
- **GET /api/v1/admin/system-logs** - System logs with filters
- **POST /api/v1/admin/system-logs/export** - Export system logs
- **GET /api/v1/admin/system/health** - System health status
- **GET /api/v1/admin/system/metrics** - System metrics
- **POST /api/v1/admin/system/cache/clear** - Clear cache
- **POST /api/v1/admin/system/backup** - Create backup

#### Notifications Module
- Push notifications (FCM)
- Email notifications
- SMS notifications
- Notification preferences

### Fixed
- 23 backend compilation errors
- BCrypt hash for test users
- JWT format (added 'typ' header)
- expires_in (seconds instead of milliseconds)
- 75 service tests
- 46 E2E tests

### Changed
- Moved @EnableJpaAuditing to JpaConfig
- Updated test configuration
- Improved error handling

---

## [1.1.0] - 2024-02-20

### Added - Iteracja 2: Features

#### Patients Module
- **GET /api/v1/patients** - Lista pacjentów z filtrami (PESEL, nazwa, status, weryfikacja)
- **GET /api/v1/patients/{id}** - Szczegóły pacjenta
- **POST /api/v1/patients** - Dodawanie nowego pacjenta
- **PUT /api/v1/patients/{id}** - Aktualizacja danych pacjenta
- **DELETE /api/v1/patients/{id}** - Soft delete pacjenta
- **POST /api/v1/patients/verify** - Weryfikacja pacjenta w systemie HIS
- **GET /api/v1/patients/search** - Wyszukiwanie pacjentów po PESEL, nazwisku, HIS ID

#### Projects Module
- **GET /api/v1/projects** - Lista projektów terapeutycznych
- **GET /api/v1/projects/{id}** - Szczegóły projektu
- **POST /api/v1/projects** - Tworzenie nowego projektu
- **PUT /api/v1/projects/{id}** - Aktualizacja projektu
- **DELETE /api/v1/projects/{id}** - Usuwanie projektu
- **POST /api/v1/projects/{id}/patients** - Przypisywanie pacjentów do projektu
- **DELETE /api/v1/projects/{id}/patients** - Usuwanie pacjentów z projektu
- **GET /api/v1/projects/{id}/patients** - Lista pacjentów w projekcie
- **GET /api/v1/projects/{id}/team** - Zespół projektu
- **GET /api/v1/projects/{id}/statistics** - Statystyki projektu (compliance, aktywność)
- **GET /api/v1/projects/my/active** - Aktywne projekty użytkownika

#### Messages Module
- **GET /api/v1/messages/threads** - Lista wątków wiadomości
- **POST /api/v1/messages/threads** - Tworzenie nowego wątku
- **GET /api/v1/messages/threads/{id}** - Szczegóły wątku
- **GET /api/v1/messages/threads/{id}/messages** - Wiadomości w wątku
- **POST /api/v1/messages/threads/{id}/messages** - Wysłanie wiadomości
- **POST /api/v1/messages/messages/{id}/read** - Oznaczenie wiadomości jako przeczytanej
- **POST /api/v1/messages/messages/{id}/attachments** - Dodanie załącznika do wiadomości
- **GET /api/v1/messages/unread** - Nieprzeczytane wiadomości
- **GET /api/v1/messages/unread/count** - Liczba nieprzeczytanych wiadomości

#### Calendar Module
- **GET /api/v1/calendar/events** - Lista wydarzeń terapeutycznych
- **GET /api/v1/calendar/events/{id}** - Szczegóły wydarzenia
- **POST /api/v1/calendar/events** - Tworzenie wydarzenia
- **PUT /api/v1/calendar/events/{id}** - Aktualizacja wydarzenia
- **DELETE /api/v1/calendar/events/{id}** - Usuwanie wydarzenia
- **POST /api/v1/calendar/events/{id}/complete** - Oznaczenie wydarzenia jako wykonane
- **GET /api/v1/calendar/upcoming** - Nadchodzące wydarzenia
- **POST /api/v1/calendar/events/{id}/ics** - Eksport wydarzenia do iCal

#### Materials Module
- **GET /api/v1/materials** - Lista materiałów edukacyjnych
- **GET /api/v1/materials/{id}** - Szczegóły materiału
- **POST /api/v1/materials** - Dodawanie materiału
- **PUT /api/v1/materials/{id}** - Aktualizacja materiału
- **DELETE /api/v1/materials/{id}** - Usuwanie materiału
- **POST /api/v1/materials/{id}/publish** - Publikacja materiału
- **POST /api/v1/materials/{id}/unpublish** - Cofnięcie publikacji
- **POST /api/v1/materials/{id}/view** - Rejestracja wyświetlenia
- **POST /api/v1/materials/{id}/complete** - Oznaczenie materiału jako ukończone
- **GET /api/v1/materials/my** - Materiały przypisane do pacjenta
- **GET /api/v1/materials/progress** - Postępy pacjenta w materiałach

#### Documentation
- Added [Patients API Documentation](./docs/api/patients.md)
- Added [Projects API Documentation](./docs/api/projects.md)
- Added [Messages API Documentation](./docs/api/messages.md)
- Added [Calendar API Documentation](./docs/api/calendar.md)
- Added [Materials API Documentation](./docs/api/materials.md)
- Added [Sequence Diagrams](./docs/architecture/sequence-diagrams.md)
- Added [ADR-004: Messaging Architecture](./docs/decisions/ADR-004-messaging-architecture.md)

#### Backend
- Patient entity with HIS verification support
- Project entity with team and patient assignments
- Message thread and message entities with attachments
- Therapy event entity with recurrence support
- Educational material entity with progress tracking
- MapStruct mappers for all DTOs
- Service layer for all modules
- REST controllers with Swagger documentation
- Validation with Jakarta Validation

#### Database
- Flyway migrations for all new tables:
  - `patients` - Patient records
  - `projects` - Therapeutic projects
  - `patient_projects` - Patient-project assignments
  - `project_teams` - Project team members
  - `message_threads` - Conversation threads
  - `messages` - Stored messages
  - `message_read_receipts` - Read status tracking
  - `message_attachments` - File attachments
  - `therapy_events` - Calendar events
  - `educational_materials` - Learning materials
  - `material_progress` - Patient progress tracking

### Changed
- Updated API base path from `/api` to `/api/v1` for versioning
- Updated README.md with Iteration 2 features and complete API endpoint list

### Security
- Role-based access control for all new endpoints
- JWT authentication required for all API calls
- File upload validation (type, size limit 10MB)

---

## [1.0.0] - 2024-01-15

### Added - Iteracja 1: Authentication

#### Authentication Module
- **POST /api/v1/auth/login** - User login with credentials
- **POST /api/v1/auth/register** - Patient registration with HIS verification
- **POST /api/v1/auth/refresh** - Refresh access token
- **POST /api/v1/auth/2fa/enable** - Enable two-factor authentication
- **POST /api/v1/auth/2fa/verify** - Verify 2FA code
- **POST /api/v1/auth/forgot-password** - Request password reset
- **POST /api/v1/auth/reset-password** - Reset password with token

#### Backend
- Spring Security with JWT authentication
- JWT token generation and validation
- Refresh token management with Redis
- TOTP-based 2FA implementation
- Password reset flow with email tokens
- Account lockout after 5 failed attempts
- User entity with roles (ADMIN, DOCTOR, NURSE, PATIENT, etc.)
- Refresh token entity with expiration

#### HIS Integration
- Patient verification API integration
- Demographic data retrieval from HIS
- Cart number validation

#### Database
- Flyway migrations for authentication tables:
  - `users` - User accounts
  - `refresh_tokens` - Token storage
  - `audit_log` - Security audit trail

#### Documentation
- Added [Authentication API Documentation](./docs/api/authentication.md)
- Added [ADR-001: Authentication Strategy](./docs/decisions/ADR-001-authentication-strategy.md)
- Added [ADR-002: HIS Verification Workflow](./docs/decisions/ADR-002-his-verification-workflow.md)

### Security
- Password hashing with BCrypt
- JWT with configurable expiration
- Rate limiting on authentication endpoints
- HTTPS enforcement in production

---

## [0.1.0] - 2023-12-01

### Added
- Initial project setup
- Backend Spring Boot application structure
- Frontend React + Vite configuration
- Mobile React Native (Expo) setup
- Docker Compose configuration
- Basic CI/CD pipeline with GitHub Actions

---

## Version History

| Version | Date | Codename | Focus |
|---------|------|----------|-------|
| 1.1.0 | 2026-04-24 | Complete | Reports + Admin + Notifications |
| 1.1.0 | 2024-02-20 | Features | Core therapy management |
| 1.0.0 | 2024-01-15 | Foundation | Authentication & Security |
| 0.1.0 | 2023-12-01 | Setup | Project initialization |

---

## Upcoming Features (v1.2.0)

### Planned
- [ ] Push notifications (FCM, APNS)
- [ ] Real-time messaging with WebSocket
- [ ] Advanced analytics dashboard
- [ ] Bulk patient import/export
- [ ] Custom event types
- [ ] Material quizzes with scoring
- [ ] Compliance reports
- [ ] Mobile app beta release

### Under Consideration
- [ ] Video calls integration
- [ ] AI-powered therapy recommendations
- [ ] Integration with external health systems
- [ ] Multi-language support

---

**KPTEST Development Team**
