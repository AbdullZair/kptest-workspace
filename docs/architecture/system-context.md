---
name: System Context Diagram (C4 Level 1)
description: C4 model Level 1 - System Context showing KPTEST and external dependencies
type: architecture
---

# System Context Diagram (C4 Level 1)

## Overview

The System Context diagram shows the KPTEST system as a single box and its relationships with users and external systems. This is the highest level of abstraction in the C4 model.

## C4 Level 1 Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  USERS                                       │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Patient    │    │  Koordynator │    │  Lekarz/     │                  │
│  │              │    │              │    │  Terapeuta   │                  │
│  │  Mobile App  │    │  Web Portal  │    │  Web Portal  │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
└─────────┼───────────────────┼───────────────────┼───────────────────────────┘
          │                   │                   │
          │ HTTPS             │ HTTPS             │ HTTPS
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KPTEST SYSTEM                                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Telemedicine Platform                              │   │
│  │                                                                       │   │
│  │  • Patient Management           • Project Coordination                │   │
│  │  • Therapeutic Programs         • Communication System                │   │
│  │  • Calendar & Scheduling        • Educational Materials               │   │
│  │  • Adherence Tracking           • Reports & Analytics                 │   │
│  │  • Notifications (Email/SMS)    • Audit Logging                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │                   │                   │
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SYSTEMS                                    │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  HIS System  │    │  Email       │    │  SMS         │                  │
│  │              │    │  Provider    │    │  Gateway     │                  │
│  │  Patient      │    │  (SendGrid)  │    │  (Twilio)    │                  │
│  │  Verification │    │  Notifications                  │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐                                       │
│  │  Push        │    │  File        │                                       │
│  │  Notification│    │  Storage     │                                       │
│  │  (FCM/APNs)  │    │  (S3/MinIO)  │                                       │
│  └──────────────┘    └──────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## System Description

### KPTEST System

**Name:** KPTEST - System Telemedyczny

**Description:** A comprehensive telemedicine platform for managing therapeutic projects with HIS integration, patient adherence tracking, and multi-channel communication.

**Primary Responsibilities:**
- Patient registration and management
- Therapeutic project coordination
- Task assignment and adherence tracking
- Secure messaging between patients and staff
- Calendar management for therapy events
- Educational material distribution
- Compliance reporting and analytics
- Audit logging for regulatory compliance

**Technology Stack:**
- Backend: Spring Boot 3.2 (Java 21)
- Frontend: React 18 (TypeScript)
- Mobile: React Native (Expo)
- Database: PostgreSQL 15
- Cache: Redis 7
- Infrastructure: Docker, Kubernetes

## Users (Actors)

### 1. Patient

**Description:** Individuals enrolled in therapeutic programs who use the mobile application.

**Responsibilities:**
- Complete assigned therapy tasks
- View educational materials
- Communicate with therapy team
- Track personal progress
- Receive notifications

**Technical Implementation:**
- React Native mobile app (iOS/Android)
- Offline-first architecture
- Biometric authentication
- Push notifications

### 2. Koordynator (Coordinator)

**Description:** Staff members responsible for managing patients and therapeutic projects.

**Responsibilities:**
- Create and manage patient records
- Create and manage therapeutic projects
- Assign patients to projects
- Monitor patient adherence
- Generate reports
- System configuration

**Technical Implementation:**
- React web portal
- Admin dashboard access
- Full CRUD operations on patients/projects

### 3. Lekarz/Terapeuta (Doctor/Therapist)

**Description:** Healthcare professionals who conduct therapy sessions.

**Responsibilities:**
- View assigned patients
- Access patient progress data
- Communicate with patients
- Update therapy notes
- View calendar events

**Technical Implementation:**
- React web portal
- Limited to assigned projects
- Read-only access to patient data

### 4. Administrator

**Description:** Technical staff responsible for system maintenance.

**Responsibilities:**
- User management
- System configuration
- Backup management
- Audit log review
- System monitoring

**Technical Implementation:**
- React web portal
- Full admin panel access
- System health monitoring

## External Systems

### 1. HIS System (Hospital Information System)

**Type:** External Healthcare System

**Integration Purpose:** Patient verification

**Data Flow:**
- KPTEST → HIS: Patient PESEL + medical record number
- HIS → KPTEST: Patient verification status + demographic data

**Integration Method:**
- REST API (HL7/FHIR compatible)
- Synchronous requests
- Fallback to manual verification

**Frequency:** On-demand (patient registration/verification)

**Security:** TLS 1.3, API key authentication

---

### 2. Email Provider (SendGrid)

**Type:** Third-party Service

**Integration Purpose:** Email notifications

**Data Flow:**
- KPTEST → SendGrid: Email content + recipient
- SendGrid → KPTEST: Delivery status

**Email Types:**
- Welcome emails
- Appointment reminders
- Password reset
- Low adherence alerts
- New message notifications

**Integration Method:**
- REST API
- Asynchronous delivery

**Frequency:** Event-driven

**Security:** API key authentication, TLS

---

### 3. SMS Gateway (Twilio)

**Type:** Third-party Service

**Integration Purpose:** SMS notifications for critical reminders

**Data Flow:**
- KPTEST → Twilio: SMS content + phone number
- Twilio → KPTEST: Delivery status

**SMS Types:**
- Critical reminders
- 2FA verification codes
- Appointment reminders

**Integration Method:**
- REST API

**Frequency:** Event-driven

**Security:** API key authentication, TLS

---

### 4. Push Notification Service (FCM/APNs)

**Type:** Platform Service

**Integration Purpose:** Mobile push notifications

**Data Flow:**
- KPTEST → FCM/APNs: Push payload + device tokens
- FCM/APNs → Mobile: Push notifications

**Notification Types:**
- New messages
- Task reminders
- Project updates

**Integration Method:**
- Firebase Cloud Messaging (Android)
- Apple Push Notification service (iOS)

**Frequency:** Event-driven

**Security:** Service account keys, TLS

---

### 5. File Storage (S3/MinIO)

**Type:** Storage Service

**Integration Purpose:** Store educational materials and attachments

**Data Flow:**
- KPTEST → Storage: Files upload
- Storage → KPTEST: Files download

**Stored Content:**
- Educational materials (PDF, video, images)
- Message attachments
- Export files

**Integration Method:**
- S3-compatible API

**Security:** IAM credentials, encryption at rest

---

## Relationships

| Source | Destination | Type | Description |
|--------|-------------|------|-------------|
| Patient | KPTEST | Uses | Mobile app access |
| Koordynator | KPTEST | Uses | Web portal access |
| Lekarz/Terapeuta | KPTEST | Uses | Web portal access |
| Administrator | KPTEST | Uses | Admin panel access |
| KPTEST | HIS | Integrates | Patient verification |
| KPTEST | Email Provider | Uses | Send emails |
| KPTEST | SMS Gateway | Uses | Send SMS |
| KPTEST | Push Service | Uses | Send push notifications |
| KPTEST | File Storage | Uses | Store/retrieve files |

---

## Security Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                  Trust Boundary                          │
│                                                          │
│  ┌────────────┐         ┌────────────┐                  │
│  │  External  │         │  KPTEST    │                  │
│  │  Systems   │◄───────►│  System    │                  │
│  └────────────┘  TLS    └────────────┘                  │
│       ▲                      ▲                          │
│       │                      │                          │
│  ┌────┴──────────────────────┴────┐                     │
│  │        Internet (Public)       │                     │
│  └────────────────────────────────┘                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Internal Network                     │   │
│  │  ┌────────────┐         ┌────────────┐           │   │
│  │  │  Users     │◄───────►│  KPTEST    │           │   │
│  │  │  (HTTPS)   │  TLS    │  System    │           │   │
│  │  └────────────┘         └────────────┘           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Security Controls:**
- All external communication over TLS 1.3
- API authentication via JWT tokens
- Rate limiting on all endpoints
- Input validation and sanitization
- Audit logging of all operations

---

## Deployment Contexts

### Development

```
┌─────────────────────────────────────────┐
│         Docker Compose (Local)          │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Frontend │  │ Backend  │  │ HIS    ││
│  │  :3000   │  │  :8080   │  │ :8081  ││
│  └──────────┘  └──────────┘  └────────┘│
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ Postgres │  │  Redis   │             │
│  │  :5432   │  │  :6379   │             │
│  └──────────┘  └──────────┘             │
└─────────────────────────────────────────┘
```

### Production

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │              Application Layer                   │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │     │
│  │  │Frontend  │  │ Backend  │  │   HIS    │      │     │
│  │  │ x3 pods  │  │ x5 pods  │  │  (ext)   │      │     │
│  │  └──────────┘  └──────────┘  └──────────┘      │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │                 Data Layer                       │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │     │
│  │  │PostgreSQL│  │  Redis   │  │   S3     │      │     │
│  │  │Cluster   │  │ Cluster  │  │ (ext)    │      │     │
│  │  └──────────┘  └──────────┘  └──────────┘      │     │
│  └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0
**Last Updated:** 2026-04-24
**Author:** KPTEST Architect Agent
