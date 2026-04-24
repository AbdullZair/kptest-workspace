# Messages API Documentation

Base URL: `/api/v1/messages`

## Overview

The Messages API provides a thread-based messaging system for communication between patients and medical staff. It supports individual and group conversations, file attachments, and message status tracking.

## Authentication

All endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/v1/messages/threads

Retrieve a list of message threads with optional filtering.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | UUID | No | Filter threads by project ID |
| `type` | string | No | Filter by thread type (INDIVIDUAL, GROUP) |
| `page` | integer | No | Page number (0-indexed, default: 0) |
| `size` | integer | No | Page size (default: 20) |

**Example Request:**

```http
GET /api/v1/messages/threads?projectId=660e8400-e29b-41d4-a716-446655440001&type=GROUP HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "thread-001",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "type": "GROUP",
    "title": "Announcements - Group A",
    "participants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jan Kowalski",
        "role": "PATIENT"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Anna Nowak",
        "role": "PATIENT"
      }
    ],
    "lastMessage": {
      "id": "msg-100",
      "content": "Przypominamy o jutrzejszej wizycie",
      "sentAt": "2024-02-20T14:30:00Z",
      "senderName": "Dr Maria Wiśniewska"
    },
    "unreadCount": 2,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-02-20T14:30:00Z"
  },
  {
    "id": "thread-002",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "type": "INDIVIDUAL",
    "title": "Conversation with Jan Kowalski",
    "participants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jan Kowalski",
        "role": "PATIENT"
      }
    ],
    "lastMessage": {
      "id": "msg-095",
      "content": "Dziękuję za pomoc",
      "sentAt": "2024-02-19T11:15:00Z",
      "senderName": "Jan Kowalski"
    },
    "unreadCount": 0,
    "createdAt": "2024-01-20T09:30:00Z",
    "updatedAt": "2024-02-19T11:15:00Z"
  }
]
```

---

### GET /api/v1/messages/threads/{id}

Retrieve detailed information about a specific thread.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Thread ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | UUID | No | Project ID for validation |

**Example Request:**

```http
GET /api/v1/messages/threads/thread-001?projectId=660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "thread-001",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "type": "GROUP",
  "title": "Announcements - Group A",
  "description": "General announcements for all Group A participants",
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jan Kowalski",
      "role": "PATIENT",
      "joinedAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Anna Nowak",
      "role": "PATIENT",
      "joinedAt": "2024-01-16T11:00:00Z"
    },
    {
      "id": "staff-001",
      "name": "Dr Maria Wiśniewska",
      "role": "COORDINATOR",
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "createdBy": {
    "id": "staff-001",
    "name": "Dr Maria Wiśniewska",
    "role": "COORDINATOR"
  },
  "messageCount": 45,
  "unreadCount": 2,
  "isArchived": false,
  "isPinned": true,
  "tags": ["important", "announcements"],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-02-20T14:30:00Z"
}
```

---

### POST /api/v1/messages/threads

Create a new message thread.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Request Body:**

```json
{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "type": "GROUP",
  "title": "New discussion topic",
  "description": "Optional description of the thread purpose",
  "participantIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "isPinned": false,
  "tags": ["discussion"]
}
```

**Example Request:**

```http
POST /api/v1/messages/threads HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "type": "INDIVIDUAL",
  "title": "Consultation request",
  "participantIds": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

**Example Response (201 Created):**

```json
{
  "id": "thread-003",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "type": "INDIVIDUAL",
  "title": "Consultation request",
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jan Kowalski",
      "role": "PATIENT"
    }
  ],
  "createdBy": {
    "id": "staff-002",
    "name": "Dr Piotr Zieliński",
    "role": "DOCTOR"
  },
  "messageCount": 0,
  "unreadCount": 0,
  "createdAt": "2024-02-20T15:00:00Z",
  "updatedAt": "2024-02-20T15:00:00Z"
}
```

---

### GET /api/v1/messages/threads/{id}/messages

Retrieve messages in a specific thread.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Thread ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (0-indexed, default: 0) |
| `size` | integer | No | Page size (default: 50) |

**Example Request:**

```http
GET /api/v1/messages/threads/thread-001/messages?page=0&size=20 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "msg-100",
    "threadId": "thread-001",
    "content": "Przypominamy o jutrzejszej wizycie kontrolnej o godzinie 10:00",
    "sender": {
      "id": "staff-001",
      "name": "Dr Maria Wiśniewska",
      "role": "COORDINATOR"
    },
    "priority": "NORMAL",
    "isRead": false,
    "readBy": [
      {
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "readAt": "2024-02-20T14:35:00Z"
      }
    ],
    "attachments": [],
    "sentAt": "2024-02-20T14:30:00Z",
    "deliveredAt": "2024-02-20T14:30:01Z"
  },
  {
    "id": "msg-099",
    "threadId": "thread-001",
    "content": "Czy mogę przenieść wizytę na późniejszy termin?",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jan Kowalski",
      "role": "PATIENT"
    },
    "priority": "NORMAL",
    "isRead": true,
    "readBy": [
      {
        "userId": "staff-001",
        "readAt": "2024-02-20T14:00:00Z"
      }
    ],
    "attachments": [],
    "sentAt": "2024-02-20T13:45:00Z",
    "deliveredAt": "2024-02-20T13:45:01Z"
  },
  {
    "id": "msg-098",
    "threadId": "thread-001",
    "content": "W załączniku przesyłam nowe materiały ćwiczeniowe",
    "sender": {
      "id": "staff-003",
      "name": "mgr Katarzyna Lewandowska",
      "role": "THERAPIST"
    },
    "priority": "NORMAL",
    "isRead": true,
    "readBy": [
      {
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "readAt": "2024-02-20T12:30:00Z"
      },
      {
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "readAt": "2024-02-20T13:00:00Z"
      }
    ],
    "attachments": [
      {
        "id": "attach-001",
        "fileName": "cwiczenia_domowe.pdf",
        "fileSize": 2048576,
        "mimeType": "application/pdf",
        "uploadedAt": "2024-02-20T12:00:00Z"
      }
    ],
    "sentAt": "2024-02-20T12:00:00Z",
    "deliveredAt": "2024-02-20T12:00:01Z"
  }
]
```

---

### POST /api/v1/messages/threads/{id}/messages

Send a new message to a thread.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Thread ID |

**Request Body:**

```json
{
  "content": "Treść wiadomości",
  "priority": "NORMAL"
}
```

**Example Request:**

```http
POST /api/v1/messages/threads/thread-001/messages HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "Dziękuję za informację. Będę punktualnie.",
  "priority": "NORMAL"
}
```

**Example Response (201 Created):**

```json
{
  "id": "msg-101",
  "threadId": "thread-001",
  "content": "Dziękuję za informację. Będę punktualnie.",
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jan Kowalski",
    "role": "PATIENT"
  },
  "priority": "NORMAL",
  "isRead": false,
  "readBy": [],
  "attachments": [],
  "sentAt": "2024-02-20T15:30:00Z",
  "deliveredAt": "2024-02-20T15:30:01Z"
}
```

---

### POST /api/v1/messages/messages/{id}/read

Mark a message as read by the current user.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Message ID |

**Example Request:**

```http
POST /api/v1/messages/messages/msg-100/read HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "msg-100",
  "threadId": "thread-001",
  "content": "Przypominamy o jutrzejszej wizycie kontrolnej o godzinie 10:00",
  "sender": {
    "id": "staff-001",
    "name": "Dr Maria Wiśniewska",
    "role": "COORDINATOR"
  },
  "priority": "NORMAL",
  "isRead": true,
  "readBy": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "readAt": "2024-02-20T14:35:00Z"
    },
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "readAt": "2024-02-20T15:35:00Z"
    }
  ],
  "attachments": [],
  "sentAt": "2024-02-20T14:30:00Z",
  "deliveredAt": "2024-02-20T14:30:01Z"
}
```

---

### POST /api/v1/messages/messages/{id}/attachments

Upload a file attachment to a message.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Message ID |

**Request Body (multipart/form-data):**

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | File to upload (max 10MB) |

**Example Request:**

```http
POST /api/v1/messages/messages/msg-098/attachments HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="wyniki_badan.pdf"
Content-Type: application/pdf

[binary file content]
------WebKitFormBoundary--
```

**Example Response (201 Created):**

```json
{
  "id": "attach-002",
  "messageId": "msg-098",
  "fileName": "wyniki_badan.pdf",
  "fileSize": 1536000,
  "mimeType": "application/pdf",
  "downloadUrl": "/api/v1/messages/attachments/attach-002/download",
  "uploadedBy": {
    "id": "staff-003",
    "name": "mgr Katarzyna Lewandowska",
    "role": "THERAPIST"
  },
  "uploadedAt": "2024-02-20T16:00:00Z"
}
```

---

### GET /api/v1/messages/unread

Retrieve unread messages for the current user.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | UUID | No | Filter by project ID |
| `page` | integer | No | Page number (0-indexed, default: 0) |
| `size` | integer | No | Page size (default: 20) |

**Example Request:**

```http
GET /api/v1/messages/unread?projectId=660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "msg-100",
      "threadId": "thread-001",
      "threadTitle": "Announcements - Group A",
      "content": "Przypominamy o jutrzejszej wizycie kontrolnej o godzinie 10:00",
      "sender": {
        "id": "staff-001",
        "name": "Dr Maria Wiśniewska",
        "role": "COORDINATOR"
      },
      "priority": "NORMAL",
      "sentAt": "2024-02-20T14:30:00Z"
    },
    {
      "id": "msg-102",
      "threadId": "thread-002",
      "threadTitle": "Conversation with Jan Kowalski",
      "content": "Proszę o potwierdzenie obecności",
      "sender": {
        "id": "staff-002",
        "name": "Dr Piotr Zieliński",
        "role": "DOCTOR"
      },
      "priority": "HIGH",
      "sentAt": "2024-02-20T16:00:00Z"
    }
  ],
  "total": 2
}
```

---

### GET /api/v1/messages/unread/count

Get the count of unread messages for the current user.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `USER`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | UUID | No | Filter by project ID |

**Example Request:**

```http
GET /api/v1/messages/unread/count?projectId=660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "count": 2
}
```

---

## Message Conversation Example

### Complete Conversation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient   │     │    Staff    │     │   System    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  POST /threads    │                   │
       │  (create thread)  │                   │
       │──────────────────>│                   │
       │                   │                   │
       │  201 Created      │                   │
       │  (thread-001)     │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  POST /threads/{id}/messages          │
       │  (initial message)                    │
       │──────────────────>│                   │
       │                   │                   │
       │  201 Created      │                   │
       │  (msg-001)        │                   │
       │<──────────────────│                   │
       │                   │                   │
       │                   │  POST /threads/{id}/messages
       │                   │  (reply)
       │                   │──────────────────>│
       │                   │                   │
       │  Notification     │                   │
       │  (push/email)     │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  GET /threads/{id}/messages
       │  (fetch conversation)
       │──────────────────>│                   │
       │                   │                   │
       │  Messages array   │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  POST /messages/{id}/read
       │  (mark as read)   │                   │
       │──────────────────>│                   │
       │                   │                   │
```

---

## Error Responses

### 400 Bad Request

```json
{
  "timestamp": "2024-02-20T15:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Message content cannot be empty",
  "path": "/api/v1/messages/threads/thread-001/messages"
}
```

### 403 Forbidden

```json
{
  "timestamp": "2024-02-20T15:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: user is not a participant of this thread",
  "path": "/api/v1/messages/threads/thread-001/messages"
}
```

### 404 Not Found

```json
{
  "timestamp": "2024-02-20T15:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Thread not found with id: thread-001",
  "path": "/api/v1/messages/threads/thread-001"
}
```

### 413 Payload Too Large

```json
{
  "timestamp": "2024-02-20T15:00:00Z",
  "status": 413,
  "error": "Payload Too Large",
  "message": "File size exceeds maximum limit of 10MB",
  "path": "/api/v1/messages/messages/msg-001/attachments"
}
```

---

## Data Models

### MessageThreadDto

```typescript
interface MessageThreadDto {
  id: string;                    // UUID
  projectId: string;             // UUID
  projectName?: string;
  type: ThreadType;              // INDIVIDUAL, GROUP
  title: string;
  description?: string;
  participants: ThreadParticipant[];
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    sentAt: string;
    senderName: string;
  };
  messageCount: number;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### MessageDto

```typescript
interface MessageDto {
  id: string;                    // UUID
  threadId: string;              // UUID
  content: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  priority: MessagePriority;     // LOW, NORMAL, HIGH, URGENT
  isRead: boolean;
  readBy: {
    userId: string;
    readAt: string;
  }[];
  attachments: MessageAttachmentDto[];
  sentAt: string;                // ISO-8601 datetime
  deliveredAt: string;           // ISO-8601 datetime
}
```

### MessageAttachmentDto

```typescript
interface MessageAttachmentDto {
  id: string;                    // UUID
  messageId: string;             // UUID
  fileName: string;
  fileSize: number;              // bytes
  mimeType: string;
  downloadUrl?: string;
  uploadedBy?: {
    id: string;
    name: string;
    role: string;
  };
  uploadedAt: string;            // ISO-8601 datetime
}
```

### CreateThreadRequest

```typescript
interface CreateThreadRequest {
  projectId: string;             // UUID
  type: ThreadType;              // INDIVIDUAL, GROUP
  title: string;
  description?: string;
  participantIds: string[];      // Array of UUIDs
  isPinned?: boolean;
  tags?: string[];
}
```

### SendMessageRequest

```typescript
interface SendMessageRequest {
  content: string;
  priority?: MessagePriority;    // Default: NORMAL
}
```

---

## Thread Types

### INDIVIDUAL

One-to-one conversation between a patient and a staff member.

**Characteristics:**
- Exactly 2 participants
- Private conversation
- Typically created for personal consultations

### GROUP

Multi-participant conversation within a project.

**Characteristics:**
- 3 or more participants
- Used for announcements, group discussions
- All participants can see all messages

---

## Message Priority Levels

| Priority | Description | Use Case |
|----------|-------------|----------|
| LOW | Non-urgent messages | General questions, feedback |
| NORMAL | Standard messages | Regular communication |
| HIGH | Important messages | Appointment changes, urgent requests |
| URGENT | Critical messages | Medical emergencies, immediate attention required |

---

## Related Documentation

- [Patients API](./patients.md)
- [Projects API](./projects.md)
- [Calendar API](./calendar.md)
- [Materials API](./materials.md)
