---
name: Component Diagram (C4 Level 3)
description: C4 model Level 3 - Component diagram showing internal structure of containers
type: architecture
---

# Component Diagram (C4 Level 3)

## Overview

The Component diagram breaks down each container into its internal components, showing how responsibilities are distributed within each container and how components communicate with each other.

## Backend Components (Spring Boot)

### API Gateway Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        API Gateway                                   │
│                     [Spring Boot Application]                        │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Security      │  │    Request      │  │    Response     │      │
│  │   Component     │  │    Handler      │  │    Handler      │      │
│  │                 │  │   Interceptor   │  │   Interceptor   │      │
│  │ • JWT Filter    │  │ • Logging       │  │ • Compression   │      │
│  │ • Auth Manager  │  │ • Metrics       │  │ • Error Format  │      │
│  │ • RBAC Checker  │  │ • Correlation   │  │ • Headers       │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│           └────────────────────┼────────────────────┘                │
│                                │                                     │
│           ┌────────────────────┼────────────────────┐                │
│           │                    │                    │                │
│           ▼                    ▼                    ▼                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Rate Limit    │  │    Routing      │  │   Versioning    │      │
│  │   Component     │  │    Component    │  │   Component     │      │
│  │                 │  │                 │  │                 │      │
│  │ • Redis Counter │  │ • Path Matching │  │ • URL Version   │      │
│  │ • Throttling    │  │ • Load Balance  │  │ • Deprecation   │      │
│  │ • Quota Check   │  │ • Fallback      │  │ • Migration     │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Patient Service Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Patient Service                                │
│                     [Spring Boot Application]                        │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Patient       │  │   Patient       │  │    HIS          │      │
│  │   Controller    │  │   Service       │  │   Integration   │      │
│  │                 │  │                 │  │   Component     │      │
│  │ • GET /patients │  │ • CRUD ops      │  │                 │      │
│  │ • POST /patients│  │ • Search        │  │ • Verify        │      │
│  │ • GET /{id}     │  │ • Statistics    │  │ • Sync          │      │
│  │ • PUT /{id}     │  │ • Validation    │  │ • Cache         │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│           │           ┌────────┴────────┐           │                │
│           │           │                 │           │                │
│           ▼           ▼                 ▼           ▼                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Patient Repository                        │    │
│  │                                                               │    │
│  │  • findById()        • findByPesel()     • search()         │    │
│  │  • save()            • findByProject()   • countByStatus()  │    │
│  │  • delete()          • findAllActive()   • existsByEmail()  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                │                                     │
│                                ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      Patient Entity                          │    │
│  │                                                               │    │
│  │  @Entity(name = "patients")                                  │    │
│  │  - id: UUID           - lastName: String                     │    │
│  │  - pesel: String      - phoneNumber: String                  │    │
│  │  - firstName: String  - emergencyContact: JSON               │    │
│  │  - email: String      - hisVerified: Boolean                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Project Service Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Project Service                                │
│                     [Spring Boot Application]                        │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Project       │  │   Project       │  │  Assignment     │      │
│  │   Controller    │  │   Service       │  │  Service        │      │
│  │                 │  │                 │  │                 │      │
│  │ • GET /projects │  │ • CRUD ops      │  │ • Assign        │      │
│  │ • POST /projects│  │ • Statistics    │  │   patients      │      │
│  │ • GET /{id}     │  │ • Compliance    │  │ • Remove        │      │
│  │ • PUT /{id}     │  │ • Team mgmt     │  │   patients      │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│           │           ┌────────┴────────┐           │                │
│           ▼           ▼                 ▼           ▼                │
│  ┌─────────────────┐         ┌─────────────────┐                     │
│  │   Project       │         │   Patient-      │                     │
│  │   Repository    │         │   Project       │                     │
│  │                 │         │   Repository    │                     │
│  │ • findById()    │         │ • findByPatient()│                    │
│  │ • save()        │         │ • findByProject()│                    │
│  │ • findByStatus()│         │ • assign()      │                     │
│  └─────────────────┘         └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Communication Service Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Communication Service                            │
│                     [Spring Boot Application]                        │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Message       │  │   Message       │  │  Notification   │      │
│  │   Controller    │  │   Service       │  │  Service        │      │
│  │                 │  │                 │  │                 │      │
│  │ • GET /messages │  │ • Send message  │  │ • Email         │      │
│  │ • POST /messages│  │ • Get threads   │  │ • SMS           │      │
│  │ • GET /conv/{id}│  │ • Attachments   │  │ • Push          │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│           │           ┌────────┴────────┐           │                │
│           ▼           ▼                 ▼           ▼                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Email         │  │     SMS         │  │    Push         │      │
│  │   Provider      │  │   Provider      │  │   Provider      │      │
│  │                 │  │                 │  │                 │      │
│  │ • SendGrid      │  │ • Twilio        │  │ • FCM           │      │
│  │ • Templates     │  │ • Verification  │  │ • APNs          │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Report Service Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Report Service                                │
│                     [Spring Boot Application]                        │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Report        │  │   Report        │  │    Export       │      │
│  │   Controller    │  │   Service       │  │    Service      │      │
│  │                 │  │                 │  │                 │      │
│  │ • Adherence     │  │ • Calculate     │  │ • CSV export    │      │
│  │ • Project stats │  │   metrics       │  │ • PDF export    │      │
│  │ • Export        │  │ • Aggregate     │  │ • XLSX export   │      │
│  └────────┬────────┘  │   data          │  │ • JSON export   │      │
│           │          └────────┬────────┘  └────────┬────────┘      │
│           │                   │                    │                │
│           ▼                   ▼                    ▼                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Adherence     │  │   Statistics    │  │    Template     │      │
│  │   Calculator    │  │   Aggregator    │  │    Engine       │      │
│  │                 │  │                 │  │                 │      │
│  │ • Compliance    │  │ • Project       │  │ • PDF templates │      │
│  │   rate          │  │   metrics       │  │ • CSV templates │      │
│  │ • Trends        │  │ • Comparisons   │  │ • XLSX templates│      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

## Frontend Components (React)

### Web Portal Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Web Portal                                    │
│                    [React 18 + TypeScript]                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      App Shell                               │    │
│  │                                                               │    │
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐   │    │
│  │  │   Sidebar   │  │              Main Content            │   │    │
│  │  │   Navigation│  │                                      │   │    │
│  │  │             │  │  ┌────────────────────────────────┐  │   │    │
│  │  │ • Dashboard │  │  │         Page Router            │  │   │    │
│  │  │ • Patients  │  │  │                                │  │   │    │
│  │  │ • Projects  │  │  │  /dashboard                    │  │   │    │
│  │  │ • Messages  │  │  │  /patients                     │  │   │    │
│  │  │ • Calendar  │  │  │  /projects                     │  │   │    │
│  │  │ • Reports   │  │  │  /messages                     │  │   │    │
│  │  │ • Admin     │  │  │  /admin                        │  │   │    │
│  │  │             │  │  └────────────────────────────────┘  │   │    │
│  │  └─────────────┘  └─────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    State Management                          │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │    │
│  │  │  Redux Store │  │   RTK Query  │  │   Local      │      │    │
│  │  │              │  │              │  │   Storage    │      │    │
│  │  │ • auth       │  │ • API cache  │  │              │      │    │
│  │  │ • patients   │  │ • Endpoints  │  │ • Preferences│      │    │
│  │  │ • projects   │  │ • Transforms │  │ • Session    │      │    │
│  │  │ • messages   │  │              │  │              │      │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Feature Modules                           │    │
│  │                                                               │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │    │
│  │  │  Patient  │ │  Project  │ │ Messaging │ │  Calendar │   │    │
│  │  │  Module   │ │  Module   │ │  Module   │ │  Module   │   │    │
│  │  │           │ │           │ │           │ │           │   │    │
│  │  │ • List    │ │ • List    │ │ • Inbox   │ │ • View    │   │    │
│  │  │ • Detail  │ │ • Detail  │ │ • Thread  │ │ • Events  │   │    │
│  │  │ • Form    │ │ • Form    │ │ • Compose │ │ • Form    │   │    │
│  │  │ • Search  │ │ • Stats   │ │ • Search  │ │ • Export  │   │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile App Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Mobile App                                     │
│                  [React Native + Expo SDK 50]                        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Navigation Stack                          │    │
│  │                                                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │    │
│  │  │    Auth     │  │     Main    │  │   Profile   │         │    │
│  │  │    Stack    │  │    Stack    │  │    Stack    │         │    │
│  │  │             │  │             │  │             │         │    │
│  │  │ • Login     │  │ • Dashboard │  │ • Settings  │         │    │
│  │  │ • Register  │  │ • Tasks     │  │ • Privacy   │         │    │
│  │  │ • 2FA       │  │ • Messages  │  │ • About     │         │    │
│  │  │ • Reset     │  │ • Materials │  │             │         │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    State Management                          │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │    │
│  │  │   Zustand    │  │   React      │  │   Expo       │      │    │
│  │  │   Store      │  │   Query      │  │   Storage    │      │    │
│  │  │              │  │              │  │              │      │    │
│  │  │ • User state │  │ • API cache  │  │ • Tokens     │      │    │
│  │  │ • Tasks      │  │ • Endpoints  │  │ • Offline    │      │    │
│  │  │ • Notifs     │  │              │  │   data       │      │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Native Modules                            │    │
│  │                                                               │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │    │
│  │  │Biometrics │ │   Push    │ │  Camera   │ │  File     │   │    │
│  │  │           │ │ Notifs    │ │           │ │  System   │   │    │
│  │  │ • Face ID │ │ • FCM     │ │ • Scan    │ │ • Upload  │   │    │
│  │  │ • Touch ID│ │ • APNs    │ │ • Capture │ │ • Download│   │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### Patient Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Web    │     │   API    │     │ Patient  │     │    HIS   │
│  Portal  │     │  Gateway │     │ Service  │     │  System  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ POST /patients │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ Route request  │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │ Validate data  │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │ Return result  │
     │                │                │<───────────────│
     │                │                │                │
     │                │                │ Save to DB     │
     │                │                │                │
     │                │ Return response│                │
     │                │<───────────────│                │
     │                │                │                │
     │ Return result  │                │                │
     │<───────────────│                │                │
     │                │                │                │
```

### Message Sending Flow

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│  Mobile  │     │   API    │     │Communication│     │   Push   │
│   App    │     │  Gateway │     │   Service   │     │ Service  │
└────┬─────┘     └────┬─────┘     └─────┬───────┘     └────┬─────┘
     │                │                 │                  │
     │ POST /messages │                 │                  │
     │───────────────>│                 │                  │
     │                │                 │                  │
     │                │ Route request   │                  │
     │                │────────────────>│                  │
     │                │                 │                  │
     │                │                 │ Save message     │
     │                │                 │                  │
     │                │                 │ Send notification│
     │                │                 │─────────────────>│
     │                │                 │                  │
     │                │                 │ Return response  │
     │                │<────────────────│                  │
     │                │                 │                  │
     │ Return result  │                 │                  │
     │<───────────────│                 │                  │
     │                │                 │                  │
```

### Adherence Report Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Web    │     │   API    │     │  Report  │     │ Database │
│  Portal  │     │  Gateway │     │ Service  │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ GET /reports/  │                │                │
     │ adherence      │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ Route request  │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │ Query tasks    │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │ Return data    │
     │                │                │<───────────────│
     │                │                │                │
     │                │                │ Calculate rate │
     │                │                │                │
     │                │ Return report  │                │
     │                │<───────────────│                │
     │                │                │                │
     │ Return report  │                │                │
     │<───────────────│                │                │
     │                │                │                │
```

## Component Technologies

| Component | Technology | Description |
|-----------|------------|-------------|
| Patient Controller | Spring MVC | REST endpoint handling |
| Patient Service | Spring Service | Business logic |
| Patient Repository | Spring Data JPA | Data access |
| HIS Integration | Spring WebClient | External API client |
| Email Provider | SendGrid SDK | Email sending |
| SMS Provider | Twilio SDK | SMS sending |
| Push Provider | Firebase Admin | Push notifications |
| Adherence Calculator | Custom | Compliance calculation |
| Export Service | Apache POI, iText | File generation |

---

## Security Components

### Authentication Flow Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Authentication Components                         │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Login     │  │     JWT     │  │     2FA     │                 │
│  │   Filter    │  │   Filter    │  │   Filter    │                 │
│  │             │  │             │  │             │                 │
│  │ • Validate  │  │ • Verify    │  │ • Check     │                 │
│  │   creds     │  │   token     │  │   2FA       │                 │
│  │ • Create    │  │ • Extract   │  │ • TOTP      │                 │
│  │   session   │  │   claims    │  │   verify    │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┼────────────────┘                         │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   Security Context                           │    │
│  │                                                               │    │
│  │  • Authentication                                             │    │
│  │  • User details                                               │    │
│  │  • Permissions                                                │    │
│  │  • Session info                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0
**Last Updated:** 2026-04-24
**Author:** KPTEST Architect Agent
