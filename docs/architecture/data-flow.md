---
name: Data Flow Diagram (DFD)
description: Data Flow Diagrams showing how data moves through the system
type: architecture
---

# Data Flow Diagram (DFD)

## Overview

Data Flow Diagrams (DFD) illustrate how data flows through the KPTEST system, showing inputs, processes, data stores, and outputs. This documentation includes Level 0 (Context), Level 1 (Major processes), and Level 2 (Detailed processes) diagrams.

## DFD Level 0 - Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL ENTITIES                                │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Patient  │    │Coordinator│    │ Therapist │    │   HIS    │             │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘             │
│       │               │               │               │                     │
└───────┼───────────────┼───────────────┼───────────────┼─────────────────────┘
        │               │               │               │
        │ Patient data  │ Project data  │ Therapy data  │ Verification      │
        │ Task updates  │ Patient mgmt  │ Progress      │ requests          │
        │ Messages      │ Reports       │ Messages      │ Patient info      │
        │               │               │               │                     │
        ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KPTEST SYSTEM                                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Telemedicine Platform                              │   │
│  │                                                                       │   │
│  │  Processes patient data, manages therapeutic projects, tracks        │   │
│  │  adherence, facilitates communication, generates reports             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
        │               │               │               │
        │ Notifications │ Dashboard     │ Patient list  │ Verification      │
        │ Reminders     │ Reports       │ Messages      │ results           │
        │ Confirmations │ Alerts        │ Schedules     │                   │
        │               │               │               │                     │
        ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Email   │    │  Admin   │    │  Push    │    │  File    │
│ Service  │    │  Panel   │    │ Service  │    │ Storage  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

## DFD Level 1 - Major Processes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KPTEST SYSTEM - Level 1                            │
│                                                                              │
│                                                                              │
│  ┌──────────┐     ┌────────────────────────────────────────────────────┐    │
│  │ Patient  │────▶│  1.0                                                │    │
│  │          │     │  Patient Management                                 │    │
│  └──────────┘     │                                                      │    │
│                   │  • Register patient                                 │    │
│  ┌──────────┐     │  • Verify with HIS                                  │    │
│  │Coordinator│────▶│  • Update profile                                   │    │
│  │          │     │  • Search patients                                  │    │
│  └──────────┘     └───────────────────┬────────────────────────────────┘    │
│                                       │                                     │
│                                       │ Patient data                        │
│                                       ▼                                     │
│                               ┌───────────────┐                            │
│                               │  D1 Patients  │                            │
│                               └───────┬───────┘                            │
│                                       │                                     │
│  ┌──────────┐     ┌───────────────────┼────────────────────────────────┐    │
│  │Coordinator│────▶│  2.0              │       Project Management       │    │
│  │          │     │                   │                                 │    │
│  └──────────┘     │  • Create project │                                 │    │
│                   │  • Assign patients│                                 │    │
│                   │  • Track progress │                                 │    │
│                   │  • Generate stats │                                 │    │
│                   └───────────────────┬─────────────────────────────────┘    │
│                                       │                                      │
│                                       │ Project data                         │
│                                       ▼                                      │
│                               ┌───────────────┐                             │
│                               │ D2 Projects   │                             │
│                               └───────┬───────┘                             │
│                                       │                                      │
│  ┌──────────┐     ┌───────────────────┼─────────────────────────────────┐    │
│  │ Patient  │────▶│  3.0              │       Task Management            │    │
│  │          │     │                   │                                  │    │
│  └──────────┘     │  • Assign tasks   │                                  │    │
│                   │  • Complete tasks │                                  │    │
│                   │  • Track adherence│                                  │    │
│                   │  • Calculate rate │                                  │    │
│                   └───────────────────┬─────────────────────────────────┘    │
│                                       │                                      │
│                                       │ Task data                            │
│                                       ▼                                      │
│                               ┌───────────────┐                             │
│                               │  D3 Tasks     │                             │
│                               └───────┬───────┘                             │
│                                       │                                      │
│  ┌──────────┐     ┌───────────────────┼─────────────────────────────────┐    │
│  │ Patient  │────▶│  4.0              │       Communication              │    │
│  │          │     │                   │                                  │    │
│  │Therapist │────▶│  • Send messages  │                                  │    │
│  │          │     │  • Attach files   │                                  │    │
│  └──────────┘     │  • Notifications  │                                  │    │
│                   │  • Push alerts    │                                  │    │
│                   └───────────────────┬─────────────────────────────────┘    │
│                                       │                                      │
│                                       │ Message data                         │
│                                       ▼                                      │
│                               ┌───────────────┐                             │
│                               │ D4 Messages   │                             │
│                               └───────┬───────┘                             │
│                                       │                                      │
│  ┌──────────┐     ┌───────────────────┼─────────────────────────────────┐    │
│  │Coordinator│────▶│  5.0              │       Reporting                  │    │
│  │          │     │                   │                                  │    │
│  │Therapist │────▶│  • Adherence rpts │                                  │    │
│  │          │     │  • Project stats  │                                  │    │
│  └──────────┘     │  • Export data    │                                  │    │
│                   │  • Dashboard      │                                  │    │
│                   └───────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## DFD Level 2 - Detailed Processes

### 1.0 Patient Management - Level 2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    1.0 Patient Management - Level 2                          │
│                                                                              │
│                                                                              │
│  ┌──────────┐                                                                │
│  │Coordinator│                                                               │
│  └────┬─────┘                                                                │
│       │ Patient data                                                         │
│       ▼                                                                      │
│  ┌─────────────────┐                                                         │
│  │  1.1            │                                                         │
│  │  Register       │                                                         │
│  │  Patient        │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Validation                                                       │
│           ▼                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐     ┌──────────┐               │
│  │  1.2            │     │  1.3            │     │   HIS    │               │
│  │  Verify with    │────▶│  Send           │────▶│  System  │               │
│  │  HIS            │     │  Verification   │     │          │               │
│  └────────┬────────┘     └─────────────────┘     └────┬─────┘               │
│           │                                           │                     │
│           │ Verification result                        │ Patient info        │
│           ▼                                           │                     │
│  ┌─────────────────┐                                  │                     │
│  │  1.4            │◀─────────────────────────────────┘                     │
│  │  Store Patient  │                                                        │
│  │  Data           │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           │ Patient record                                                   │
│           ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │ D1 Patients   │                                                          │
│  └───────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.0 Task Management - Level 2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    3.0 Task Management - Level 2                             │
│                                                                              │
│                                                                              │
│  ┌──────────┐                                                                │
│  │Coordinator│                                                               │
│  └────┬─────┘                                                                │
│       │ Task definitions                                                     │
│       ▼                                                                      │
│  ┌─────────────────┐                                                         │
│  │  3.1            │                                                         │
│  │  Create Task    │                                                         │
│  │  Template       │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Task template                                                    │
│           ▼                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                                │
│  │  3.2            │     │  D2 Projects    │                                │
│  │  Assign Tasks   │◀────│                 │                                │
│  │  to Patients    │     └─────────────────┘                                │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Assigned tasks                                                   │
│           ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │ D3 Tasks      │                                                          │
│  └───────┬───────┘                                                          │
│          │                                                                   │
│          │ Task list                                                         │
│          ▼                                                                   │
│  ┌──────────┐     ┌─────────────────┐                                        │
│  │ Patient  │────▶│  3.3            │                                        │
│  │          │     │  Complete       │                                        │
│  │          │     │  Task           │                                        │
│  └──────────┘     └────────┬────────┘                                        │
│                           │                                                  │
│                           │ Completion data                                  │
│                           ▼                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                                │
│  │  3.4            │     │  D3 Tasks       │                                │
│  │  Calculate      │◀────│  (update)       │                                │
│  │  Adherence      │     └─────────────────┘                                │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Adherence rate                                                   │
│           ▼                                                                  │
│  ┌─────────────────┐                                                         │
│  │  3.5            │                                                         │
│  │  Check Low      │                                                         │
│  │  Adherence      │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Alert                                                            │
│           ▼                                                                  │
│  ┌──────────┐                                                                │
│  │Coordinator│                                                               │
│  └──────────┘                                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.0 Communication - Level 2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    4.0 Communication - Level 2                               │
│                                                                              │
│                                                                              │
│  ┌──────────┐     ┌──────────┐                                              │
│  │ Patient  │     │ Therapist│                                              │
│  └────┬─────┘     └────┬─────┘                                              │
│       │                │                                                    │
│       │ Message        │ Message                                            │
│       ▼                ▼                                                    │
│  ┌─────────────────────────────────┐                                        │
│  │  4.1                            │                                        │
│  │  Create Message Thread          │                                        │
│  └────────────┬────────────────────┘                                        │
│               │                                                             │
│               │ Thread ID                                                   │
│               ▼                                                             │
│  ┌─────────────────┐     ┌─────────────────┐                               │
│  │  4.2            │     │  D4 Messages    │                               │
│  │  Send Message   │────▶│  (store)        │                               │
│  └────────┬────────┘     └─────────────────┘                               │
│           │                                                                 │
│           │ Notification trigger                                            │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  4.3 Send Notifications                                             │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │    Email     │  │     SMS      │  │    Push      │              │    │
│  │  │  Notification│  │  Notification│  │  Notification│              │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │    │
│  └─────────┼─────────────────┼─────────────────┼──────────────────────┘    │
│            │                 │                 │                           │
│            ▼                 ▼                 ▼                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │ Email        │  │ SMS          │  │ Push         │                     │
│  │ Service      │  │ Gateway      │  │ Service      │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.0 Reporting - Level 2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    5.0 Reporting - Level 2                                   │
│                                                                              │
│                                                                              │
│  ┌──────────┐                                                                │
│  │Coordinator│                                                               │
│  │Therapist │                                                                │
│  └────┬─────┘                                                                │
│       │ Report request                                                       │
│       ▼                                                                      │
│  ┌─────────────────┐                                                         │
│  │  5.1            │                                                         │
│  │  Get Report     │                                                         │
│  │  Parameters     │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Query criteria                                                   │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  5.2 Aggregate Data                                                 │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │   Patient    │  │    Task      │  │   Project    │              │    │
│  │  │   Data       │  │    Data      │  │   Data       │              │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │    │
│  └─────────┼─────────────────┼─────────────────┼──────────────────────┘    │
│            │                 │                 │                           │
│            ▼                 ▼                 ▼                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │ D1 Patients  │  │  D3 Tasks    │  │ D2 Projects  │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
│                                                                              │
│           ▲                                                                  │
│           │ Aggregated data                                                  │
│           │                                                                  │
│  ┌─────────────────┐                                                         │
│  │  5.3            │                                                         │
│  │  Calculate      │                                                         │
│  │  Metrics        │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Report data                                                      │
│           ▼                                                                  │
│  ┌─────────────────┐                                                         │
│  │  5.4            │                                                         │
│  │  Format Report  │                                                         │
│  │  (CSV/PDF/XLSX) │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           │ Formatted report                                                 │
│           ▼                                                                  │
│  ┌──────────┐                                                                │
│  │Coordinator│                                                               │
│  │Therapist │                                                                │
│  └──────────┘                                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Stores

### D1 - Patients

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary key |
| pesel | String | National ID |
| firstName | String | First name |
| lastName | String | Last name |
| email | String | Email address |
| phoneNumber | String | Phone number |
| emergencyContact | JSON | Emergency contact info |
| hisVerified | Boolean | HIS verification status |
| createdAt | Timestamp | Record creation time |
| updatedAt | Timestamp | Last update time |

### D2 - Projects

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary key |
| name | String | Project name |
| description | String | Project description |
| startDate | Date | Start date |
| endDate | Date | End date |
| status | String | ACTIVE, COMPLETED, ARCHIVED |
| coordinatorId | UUID | Coordinator reference |
| createdAt | Timestamp | Record creation time |
| updatedAt | Timestamp | Last update time |

### D3 - Tasks

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary key |
| projectId | UUID | Project reference |
| patientId | UUID | Patient reference |
| title | String | Task title |
| description | String | Task description |
| dueDate | Date | Due date |
| completedAt | Timestamp | Completion time |
| status | String | PENDING, COMPLETED, OVERDUE |
| createdAt | Timestamp | Record creation time |

### D4 - Messages

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Primary key |
| threadId | UUID | Conversation thread |
| senderId | UUID | Sender reference |
| content | Text | Message content |
| attachments | JSON | File attachments |
| readAt | Timestamp | Read timestamp |
| createdAt | Timestamp | Send time |

## Data Flows Summary

| Flow ID | Source | Destination | Data |
|---------|--------|-------------|------|
| F1 | Patient | System | Registration data, task updates |
| F2 | Coordinator | System | Patient data, project config |
| F3 | Therapist | System | Progress notes, messages |
| F4 | System | HIS | Verification requests |
| F5 | HIS | System | Patient verification results |
| F6 | System | Email Service | Notification requests |
| F7 | System | Push Service | Push notification payloads |
| F8 | System | File Storage | Files for storage |

---

**Document Version:** 1.0
**Last Updated:** 2026-04-24
**Author:** KPTEST Architect Agent
