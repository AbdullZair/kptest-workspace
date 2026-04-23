---
name: Data Model (ERD)
description: Model danych bazy PostgreSQL z relacjami encji
type: architecture
---

# Data Model (Entity Relationship Diagram)

## Overview

Baza danych PostgreSQL 15 z schema `kptest`. Wszystkie tabele mają:
- `id` jako UUID (GENERATED UUID)
- `created_at` i `updated_at` timestampy
- Soft delete gdzie wymagane (`deleted_at`)

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| PATIENTS : "1:1 role-specific"
    USERS ||--o| STAFF : "1:1 role-specific"
    USERS ||--o{ AUDIT_LOGS : "generates"
    
    PATIENTS ||--o{ PATIENT_PROJECTS : "enrolled in"
    PATIENTS ||--o| EMERGENCY_CONTACTS : "has"
    PATIENTS ||--o{ THERAPY_EVENTS : "completes"
    PATIENTS ||--o{ MATERIAL_PROGRESS : "tracks"
    PATIENTS ||--o{ MESSAGES : "sends/receives"
    PATIENTS ||--o{ NOTIFICATIONS : "receives"
    
    PROJECTS ||--o{ PATIENT_PROJECTS : "contains patients"
    PROJECTS ||--o{ PROJECT_TEAM : "has members"
    PROJECTS ||--o{ EDUCATIONAL_MATERIALS : "defines"
    PROJECTS ||--o{ THERAPY_EVENTS : "schedules"
    PROJECTS ||--o{ MESSAGE_THREADS : "has conversations"
    PROJECTS ||--o{ PROJECT_STAGES : "defines stages"
    
    PROJECT_TEAM }|--|| USERS : "assigns staff"
    
    MESSAGE_THREADS ||--o{ MESSAGES : "contains"
    MESSAGES ||--o{ MESSAGE_ATTACHMENTS : "may have"
    
    EDUCATIONAL_MATERIALS ||--o{ MATERIAL_PROGRESS : "tracked by"
    EDUCATIONAL_MATERIALS ||--o{ MATERIAL_VERSIONS : "versioned"
    
    PROJECT_STAGES ||--o{ QUIZZES : "may have"
    
    THERAPY_EVENTS {
        uuid id PK
        uuid project_id FK
        uuid patient_id FK "nullable for group events"
        uuid created_by FK "staff who created"
        EventType type
        string title
        text description
        timestamptz scheduled_at
        timestamptz ends_at "nullable"
        string location
        EventStatus status
        boolean is_cyclic
        string recurrence_rule "RRULE format"
        timestamptz completed_at
        text patient_notes
        int reminder_24h "default true"
        int reminder_2h "default true"
        int reminder_30min "default true"
    }
    
    USERS {
        uuid id PK
        string email "unique, not null"
        string phone "unique, nullable"
        string password_hash "BCrypt, not null"
        UserRole role "enum"
        AccountStatus status "enum"
        boolean two_factor_enabled "default false"
        string two_factor_secret "encrypted"
        string[] recovery_codes "encrypted"
        timestamptz last_login_at
        timestamptz locked_until
        int failed_login_attempts "default 0"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }
    
    PATIENTS {
        uuid id PK
        uuid user_id FK "unique"
        string pesel "encrypted, unique"
        string first_name
        string last_name
        timestamptz date_of_birth
        Gender gender "enum"
        string his_patient_id "external HIS ID"
        VerificationStatus verification_status "enum"
        timestamptz verified_at
        uuid verified_by FK "staff"
        string verification_method "HIS, MANUAL"
        string address_street
        string address_city
        string address_postal_code
        timestamptz created_at
        timestamptz updated_at
    }
    
    STAFF {
        uuid id PK
        uuid user_id FK "unique"
        string employee_id "internal ID"
        string first_name
        string last_name
        string specialization
        string phone
        string email
        timestamptz hired_at
        boolean active "default true"
        timestamptz created_at
        timestamptz updated_at
    }
    
    PROJECTS {
        uuid id PK
        string name "not null"
        text description "therapy goals"
        timestamptz start_date
        timestamptz end_date "nullable"
        ProjectStatus status "enum"
        uuid created_by FK "staff"
        int compliance_threshold "default 80"
        text config "JSONB for custom settings"
        timestamptz created_at
        timestamptz updated_at
    }
    
    PATIENT_PROJECTS {
        uuid id PK
        uuid patient_id FK
        uuid project_id FK
        timestamptz enrolled_at
        timestamptz left_at "nullable"
        string removal_reason "required when left_at set"
        uuid removed_by FK "staff"
        TherapyStage current_stage "enum"
        decimal compliance_score "computed, 0-100"
        timestamptz created_at
        timestamptz updated_at
        unique(patient_id, project_id, left_at)
    }
    
    PROJECT_TEAM {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        ProjectRole role "enum"
        timestamptz assigned_at
        unique(project_id, user_id)
    }
    
    MESSAGE_THREADS {
        uuid id PK
        uuid project_id FK
        string title
        ThreadType type "INDIVIDUAL, GROUP"
        uuid created_by FK
        timestamptz created_at
        timestamptz last_message_at
    }
    
    MESSAGES {
        uuid id PK
        uuid thread_id FK
        uuid sender_id FK
        text content
        MessagePriority priority "INFO, QUESTION, URGENT"
        timestamptz sent_at
        timestamptz read_at "nullable"
        uuid[] read_by "user IDs who read"
        uuid parent_id FK "for threading"
        text internal_note "staff only, encrypted"
    }
    
    MESSAGE_ATTACHMENTS {
        uuid id PK
        uuid message_id FK
        string file_name
        string file_type "MIME type"
        bigint file_size "bytes"
        string storage_path "S3 key or local path"
        timestamptz uploaded_at
    }
    
    EDUCATIONAL_MATERIALS {
        uuid id PK
        uuid project_id FK
        string title
        text content "HTML for articles"
        MaterialType type "ARTICLE, PDF, IMAGE, VIDEO, LINK"
        string file_url "for PDF/image/video"
        string external_url "for links"
        string category
        DifficultyLevel difficulty "BASIC, INTERMEDIATE, ADVANCED"
        uuid[] assigned_to_patients "nullable, null = all in project"
        int[] assigned_to_stages "stage IDs"
        int view_count
        int completion_count
        boolean published "default false"
        uuid created_by FK
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    MATERIAL_PROGRESS {
        uuid id PK
        uuid material_id FK
        uuid patient_id FK
        MaterialStatus status "PENDING, IN_PROGRESS, COMPLETED"
        timestamptz started_at
        timestamptz completed_at
        int time_spent_seconds
        int quiz_score "nullable, if quiz attached"
        timestamptz created_at
        timestamptz updated_at
        unique(material_id, patient_id)
    }
    
    THERAPY_EVENTS {
        uuid id PK
        uuid project_id FK
        uuid patient_id FK "nullable for group events"
        uuid created_by FK "staff"
        EventType type "VISIT, SESSION, MEDICATION, EXERCISE, MEASUREMENT, OTHER"
        string title
        text description
        timestamptz scheduled_at
        timestamptz ends_at "nullable"
        string location "nullable"
        EventStatus status "SCHEDULED, COMPLETED, MISSED, CANCELLED"
        boolean is_cyclic "default false"
        string recurrence_rule "RRULE format (RFC 5545)"
        timestamptz completed_at "nullable"
        text patient_notes "nullable"
        boolean reminder_24h "default true"
        boolean reminder_2h "default true"
        boolean reminder_30min "default true"
        timestamptz created_at
        timestamptz updated_at
    }
    
    EMERGENCY_CONTACTS {
        uuid id PK
        uuid patient_id FK
        string contact_name
        string contact_phone
        string contact_email "nullable"
        string relationship
        boolean is_primary "default false"
        timestamptz created_at
        timestamptz updated_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid patient_id FK
        NotificationType type "MESSAGE, EVENT, MATERIAL, SCHEDULE_CHANGE"
        string title
        text content
        string action_url "deep link"
        boolean sent_push "default false"
        boolean sent_email "default false"
        boolean sent_sms "default false"
        boolean read "default false"
        timestamptz scheduled_for
        timestamptz sent_at
        timestamptz created_at
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK "who performed action"
        uuid patient_id FK "nullable, if patient-related"
        uuid project_id FK "nullable, if project-related"
        string action "CREATE, UPDATE, DELETE, VIEW, LOGIN, etc."
        string entity_type "PATIENT, PROJECT, MESSAGE, etc."
        uuid entity_id "ID of affected entity"
        jsonb old_values "previous state (for UPDATE/DELETE)"
        jsonb new_values "new state (for CREATE/UPDATE)"
        string ip_address
        string user_agent
        timestamptz created_at
    }
    
    VERIFICATION_REQUESTS {
        uuid id PK
        uuid patient_id FK
        string his_cart_number "encrypted"
        string pesel "encrypted"
        VerificationStatus status "PENDING, APPROVED, REJECTED"
        string rejection_reason "required when REJECTED"
        uuid verified_by FK "staff user"
        string verification_method "HIS_VERIFY, MANUAL_OVERRIDE"
        timestamptz verified_at
        timestamptz created_at
    }
    
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash "hashed refresh token"
        timestamptz expires_at
        timestamptz revoked_at "nullable"
        string revoked_reason "ROTATED, LOGOUT, COMPROMISED"
        string device_info "user agent / device ID"
        string ip_address
        timestamptz created_at
    }
    
    SYSTEM_CONFIGURATIONS {
        uuid id PK
        string config_key "unique"
        jsonb config_value
        string description
        uuid last_modified_by FK
        timestamptz last_modified_at
    }
    
    DICTIONARIES {
        uuid id PK
        string dictionary_type "EVENT_TYPE, MATERIAL_CATEGORY, REMOVAL_REASON"
        string value
        string label_pl "Polish label"
        string label_en "English label"
        int sort_order
        boolean active "default true"
    }
```

## Enum Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'COORDINATOR',
    'DOCTOR',
    'THERAPIST',
    'NURSE',
    'PATIENT'
);

-- Account status
CREATE TYPE account_status AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'BLOCKED',
    'REJECTED',
    'DEACTIVATED'
);

-- Verification status
CREATE TYPE verification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- Gender
CREATE TYPE gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'UNKNOWN'
);

-- Project status
CREATE TYPE project_status AS ENUM (
    'PLANNED',
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED',
    'CANCELLED'
);

-- Therapy stage
CREATE TYPE therapy_stage AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'REMOVED'
);

-- Project role
CREATE TYPE project_role AS ENUM (
    'COORDINATOR',
    'DOCTOR',
    'THERAPIST',
    'NURSE',
    'CONSULTANT'
);

-- Thread type
CREATE TYPE thread_type AS ENUM (
    'INDIVIDUAL',
    'GROUP'
);

-- Message priority
CREATE TYPE message_priority AS ENUM (
    'INFO',
    'QUESTION',
    'URGENT'
);

-- Material type
CREATE TYPE material_type AS ENUM (
    'ARTICLE',
    'PDF',
    'IMAGE',
    'VIDEO',
    'LINK',
    'AUDIO'
);

-- Difficulty level
CREATE TYPE difficulty_level AS ENUM (
    'BASIC',
    'INTERMEDIATE',
    'ADVANCED'
);

-- Material status
CREATE TYPE material_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);

-- Event type
CREATE TYPE event_type AS ENUM (
    'VISIT',
    'SESSION',
    'MEDICATION',
    'EXERCISE',
    'MEASUREMENT',
    'OTHER'
);

-- Event status
CREATE TYPE event_status AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'MISSED',
    'CANCELLED'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
    'MESSAGE',
    'EVENT',
    'MATERIAL',
    'SCHEDULE_CHANGE',
    'REMINDER'
);
```

## Indexes

### Performance Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Patients
CREATE INDEX idx_patients_pesel ON patients(pesel);
CREATE INDEX idx_patients_his_id ON patients(his_patient_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- Patient Projects
CREATE INDEX idx_patient_projects_patient_id ON patient_projects(patient_id);
CREATE INDEX idx_patient_projects_project_id ON patient_projects(project_id);
CREATE INDEX idx_patient_projects_active ON patient_projects(patient_id, project_id) WHERE left_at IS NULL;

-- Projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Messages
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_read ON messages(read_at) WHERE read_at IS NULL;

-- Therapy Events
CREATE INDEX idx_events_patient_id ON therapy_events(patient_id);
CREATE INDEX idx_events_project_id ON therapy_events(project_id);
CREATE INDEX idx_events_scheduled_at ON therapy_events(scheduled_at);
CREATE INDEX idx_events_status ON therapy_events(status);
CREATE INDEX idx_events_patient_date ON therapy_events(patient_id, scheduled_at DESC);

-- Materials
CREATE INDEX idx_materials_project_id ON educational_materials(project_id);
CREATE INDEX idx_materials_published ON educational_materials(published) WHERE published = true;

-- Material Progress
CREATE INDEX idx_material_progress_patient_id ON material_progress(patient_id);
CREATE INDEX idx_material_progress_material_id ON material_progress(material_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_patient_id ON audit_logs(patient_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Notifications
CREATE INDEX idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX idx_notifications_unread ON notifications(patient_id, read) WHERE read = false;
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL;
```

## Security (RLS - Row Level Security)

```sql
-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_events ENABLE ROW LEVEL SECURITY;

-- Patients: Staff can see only patients in their projects
CREATE POLICY staff_patients_policy ON patients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_projects pp
            JOIN project_team pt ON pp.project_id = pt.project_id
            WHERE pp.patient_id = patients.id
            AND pt.user_id = current_setting('app.current_user_id')::uuid
        )
        OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = current_setting('app.current_user_id')::uuid
            AND users.role = 'ADMIN'
        )
    );

-- Messages: Users can see only messages in their threads
CREATE POLICY messages_policy ON messages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN patient_projects pp ON mt.project_id = pp.project_id
            JOIN project_team pt ON pp.project_id = pt.project_id
            WHERE mt.id = messages.thread_id
            AND (
                pp.patient_id = current_setting('app.current_patient_id')::uuid
                OR pt.user_id = current_setting('app.current_user_id')::uuid
            )
        )
    );
```

## Migration Strategy

**Tool:** Flyway

**Naming convention:** `V{version}__{description}.sql`

**Przykładowe migracje:**

```
db/migration/
├── V1__initial_schema.sql          - Tabele użytkowników, pacjentów, staff
├── V2__projects_schema.sql         - Projekty, patient_projects, project_team
├── V3__communication_schema.sql    - Wiadomości, wątki, załączniki
├── V4__calendar_schema.sql         - Therapy events, reminders
├── V5__education_schema.sql        - Materiały edukacyjne, postępy
├── V6__audit_logging.sql           - Audit logs, refresh tokens
├── V7__dictionaries.sql            - Słowniki systemowe
└── V8__indexes_security.sql        - Indexes, RLS policies
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-23  
**Author:** KPTEST Architect Agent
