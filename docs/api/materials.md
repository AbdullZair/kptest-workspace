# Materials API Documentation

Base URL: `/api/v1/materials`

## Overview

The Materials API provides management of educational materials assigned to therapeutic projects. It supports various material types (articles, PDFs, videos, audio), progress tracking, and patient engagement metrics.

## Authentication

All endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/v1/materials

Retrieve a list of educational materials with optional filtering.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | UUID | No | Filter by project ID |
| `category` | string | No | Filter by category (e.g., "Rehabilitation", "Device Care") |
| `difficulty` | string | No | Filter by difficulty level (BEGINNER, INTERMEDIATE, ADVANCED) |
| `type` | string | No | Filter by material type (ARTICLE, PDF, VIDEO, AUDIO, LINK, QUIZ) |
| `published` | boolean | No | Filter by published status |

**Example Request:**

```http
GET /api/v1/materials?projectId=660e8400-e29b-41d4-a716-446655440001&difficulty=BEGINNER&published=true HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "mat-001",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "title": "Wprowadzenie do implantu ślimakowego",
    "description": "Podstawowe informacje o działaniu i pielęgnacji implantu",
    "category": "Education",
    "type": "ARTICLE",
    "difficulty": "BEGINNER",
    "content": {
      "body": "Implant ślimakowy to urządzenie medyczne...",
      "wordCount": 1500,
      "readingTimeMinutes": 7
    },
    "isPublished": true,
    "order": 1,
    "statistics": {
      "totalViews": 45,
      "uniqueViews": 38,
      "completionRate": 85.5,
      "averageQuizScore": null
    },
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "publishedAt": "2024-01-10T10:00:00Z"
  },
  {
    "id": "mat-002",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "title": "Ćwiczenia domowe - tydzień 1",
    "description": "Zestaw ćwiczeń do wykonania w pierwszym tygodniu terapii",
    "category": "Exercises",
    "type": "PDF",
    "difficulty": "BEGINNER",
    "content": {
      "url": "/api/v1/materials/mat-002/download",
      "fileName": "cwiczenia_tydzien_1.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "pageCount": 5
    },
    "isPublished": true,
    "order": 2,
    "statistics": {
      "totalViews": 42,
      "uniqueViews": 35,
      "completionRate": 78.3,
      "averageQuizScore": null
    },
    "createdAt": "2024-01-10T09:30:00Z",
    "updatedAt": "2024-01-10T09:30:00Z",
    "publishedAt": "2024-01-10T10:00:00Z"
  },
  {
    "id": "mat-003",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "title": "Jak dbać o procesor mowy?",
    "description": "Film instruktażowy dotyczący codziennej pielęgnacji",
    "category": "Device Care",
    "type": "VIDEO",
    "difficulty": "BEGINNER",
    "content": {
      "url": "https://videos.kptest.com/device-care-basics",
      "thumbnailUrl": "/api/v1/materials/mat-003/thumbnail",
      "duration": 420,
      "provider": "internal"
    },
    "isPublished": true,
    "order": 3,
    "statistics": {
      "totalViews": 50,
      "uniqueViews": 40,
      "completionRate": 92.0,
      "averageQuizScore": null
    },
    "createdAt": "2024-01-11T11:00:00Z",
    "updatedAt": "2024-01-11T11:00:00Z",
    "publishedAt": "2024-01-11T12:00:00Z"
  }
]
```

---

### GET /api/v1/materials/{id}

Retrieve detailed information about a specific educational material.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Example Request:**

```http
GET /api/v1/materials/mat-001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "mat-001",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "title": "Wprowadzenie do implantu ślimakowego",
  "description": "Podstawowe informacje o działaniu i pielęgnacji implantu",
  "category": "Education",
  "type": "ARTICLE",
  "difficulty": "BEGINNER",
  "content": {
    "body": "Implant ślimakowy to urządzenie medyczne, które pomaga osobom z głęboką utratą słuchu...",
    "wordCount": 1500,
    "readingTimeMinutes": 7,
    "sections": [
      {
        "title": "Czym jest implant ślimakowy?",
        "order": 1
      },
      {
        "title": "Jak działa implant?",
        "order": 2
      },
      {
        "title": "Pielęgnacja urządzenia",
        "order": 3
      }
    ]
  },
  "tags": ["implant", "basics", "education"],
  "prerequisites": [],
  "relatedMaterials": ["mat-002", "mat-003"],
  "isPublished": true,
  "order": 1,
  "statistics": {
    "totalViews": 45,
    "uniqueViews": 38,
    "completionRate": 85.5,
    "averageQuizScore": null,
    "averageTimeSpentSeconds": 420
  },
  "createdBy": {
    "id": "staff-001",
    "name": "Dr Maria Wiśniewska",
    "role": "COORDINATOR"
  },
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "publishedAt": "2024-01-10T10:00:00Z"
}
```

---

### POST /api/v1/materials

Create a new educational material.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`

**Request Body (Article):**

```json
{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Nowy artykuł edukacyjny",
  "description": "Opis materiału",
  "category": "Education",
  "type": "ARTICLE",
  "difficulty": "BEGINNER",
  "content": {
    "body": "Treść artykułu...",
    "sections": [
      {
        "title": "Sekcja 1",
        "order": 1
      }
    ]
  },
  "tags": ["tag1", "tag2"],
  "prerequisites": ["mat-001"],
  "relatedMaterials": ["mat-002"],
  "isPublished": false
}
```

**Request Body (PDF/File):**

```json
{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Materiał PDF",
  "description": "Dokument do pobrania",
  "category": "Exercises",
  "type": "PDF",
  "difficulty": "INTERMEDIATE",
  "content": {
    "url": "/uploads/materials/file.pdf",
    "fileName": "dokument.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf"
  },
  "isPublished": true
}
```

**Request Body (Video):**

```json
{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Film instruktażowy",
  "description": "Nagranie z ćwiczeniami",
  "category": "Exercises",
  "type": "VIDEO",
  "difficulty": "BEGINNER",
  "content": {
    "url": "https://videos.kptest.com/exercise-video",
    "thumbnailUrl": "/uploads/thumbnails/thumb.jpg",
    "duration": 300,
    "provider": "internal"
  },
  "isPublished": true
}
```

**Example Request:**

```http
POST /api/v1/materials HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Rozpoznawanie dźwięków środowiskowych",
  "description": "Ćwiczenia z rozpoznawania codziennych dźwięków",
  "category": "Exercises",
  "type": "ARTICLE",
  "difficulty": "INTERMEDIATE",
  "content": {
    "body": "W tym ćwiczeniu będziesz słuchać różnych dźwięków...",
    "wordCount": 800,
    "readingTimeMinutes": 4
  },
  "tags": ["sounds", "exercises", "intermediate"],
  "isPublished": false
}
```

**Example Response (201 Created):**

```json
{
  "id": "mat-010",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "title": "Rozpoznawanie dźwięków środowiskowych",
  "description": "Ćwiczenia z rozpoznawania codziennych dźwięków",
  "category": "Exercises",
  "type": "ARTICLE",
  "difficulty": "INTERMEDIATE",
  "content": {
    "body": "W tym ćwiczeniu będziesz słuchać różnych dźwięków...",
    "wordCount": 800,
    "readingTimeMinutes": 4
  },
  "tags": ["sounds", "exercises", "intermediate"],
  "isPublished": false,
  "order": 10,
  "statistics": {
    "totalViews": 0,
    "uniqueViews": 0,
    "completionRate": 0,
    "averageQuizScore": null
  },
  "createdAt": "2024-02-20T17:00:00Z",
  "updatedAt": "2024-02-20T17:00:00Z",
  "publishedAt": null
}
```

---

### PUT /api/v1/materials/{id}

Update an existing educational material.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Request Body:**

```json
{
  "title": "Zaktualizowany tytuł",
  "description": "Zaktualizowany opis",
  "category": "Updated Category",
  "difficulty": "ADVANCED",
  "content": {
    "body": "Zaktualizowana treść..."
  },
  "tags": ["new", "tags"],
  "isPublished": true
}
```

**Example Request:**

```http
PUT /api/v1/materials/mat-010 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Rozpoznawanie dźwięków środowiskowych - wersja 2",
  "description": "Rozszerzone ćwiczenia z rozpoznawania codziennych dźwięków",
  "content": {
    "body": "W tym rozszerzonym ćwiczeniu będziesz słuchać..."
  }
}
```

**Example Response:**

```json
{
  "id": "mat-010",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "projectName": "Rehabilitacja słuchu - grupa A",
  "title": "Rozpoznawanie dźwięków środowiskowych - wersja 2",
  "description": "Rozszerzone ćwiczenia z rozpoznawania codziennych dźwięków",
  "category": "Exercises",
  "type": "ARTICLE",
  "difficulty": "INTERMEDIATE",
  "content": {
    "body": "W tym rozszerzonym ćwiczeniu będziesz słuchać...",
    "wordCount": 1200,
    "readingTimeMinutes": 6
  },
  "isPublished": false,
  "updatedAt": "2024-02-21T10:00:00Z"
}
```

---

### DELETE /api/v1/materials/{id}

Delete an educational material.

**Roles:** `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Example Request:**

```http
DELETE /api/v1/materials/mat-010 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "message": "Material deleted successfully",
  "id": "mat-010"
}
```

---

### POST /api/v1/materials/{id}/publish

Publish an educational material (make it visible to patients).

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Example Request:**

```http
POST /api/v1/materials/mat-010/publish HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "mat-010",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Rozpoznawanie dźwięków środowiskowych - wersja 2",
  "isPublished": true,
  "publishedAt": "2024-02-21T10:30:00Z",
  "updatedAt": "2024-02-21T10:30:00Z"
}
```

---

### POST /api/v1/materials/{id}/unpublish

Unpublish an educational material (hide from patients).

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Example Request:**

```http
POST /api/v1/materials/mat-010/unpublish HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "mat-010",
  "projectId": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Rozpoznawanie dźwięków środowiskowych - wersja 2",
  "isPublished": false,
  "publishedAt": null,
  "updatedAt": "2024-02-21T11:00:00Z"
}
```

---

### POST /api/v1/materials/{id}/view

Record a view for an educational material (patient action).

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `PATIENT`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient ID who viewed the material |

**Example Request:**

```http
POST /api/v1/materials/mat-001/view?patientId=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "mat-001",
  "title": "Wprowadzenie do implantu ślimakowego",
  "isPublished": true,
  "statistics": {
    "totalViews": 46,
    "uniqueViews": 38,
    "completionRate": 85.5
  },
  "patientProgress": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "firstViewedAt": "2024-02-21T12:00:00Z",
    "lastViewedAt": "2024-02-21T12:00:00Z",
    "viewCount": 1,
    "isCompleted": false,
    "completedAt": null
  }
}
```

---

### POST /api/v1/materials/{id}/complete

Mark an educational material as completed by a patient.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `PATIENT`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Material ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient ID who completed the material |
| `quizScore` | integer | No | Quiz score (0-100) if material has a quiz |

**Example Request:**

```http
POST /api/v1/materials/mat-001/complete?patientId=550e8400-e29b-41d4-a716-446655440000&quizScore=85 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "mat-001",
  "title": "Wprowadzenie do implantu ślimakowego",
  "isPublished": true,
  "statistics": {
    "totalViews": 46,
    "uniqueViews": 38,
    "completionRate": 86.2,
    "averageQuizScore": 85
  },
  "patientProgress": {
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "firstViewedAt": "2024-02-21T12:00:00Z",
    "lastViewedAt": "2024-02-21T12:30:00Z",
    "viewCount": 1,
    "isCompleted": true,
    "completedAt": "2024-02-21T12:30:00Z",
    "quizScore": 85
  }
}
```

---

### GET /api/v1/materials/my

Retrieve materials assigned to the current patient.

**Roles:** `PATIENT`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient ID |

**Example Request:**

```http
GET /api/v1/materials/my?patientId=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "mat-001",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "title": "Wprowadzenie do implantu ślimakowego",
    "description": "Podstawowe informacje o działaniu i pielęgnacji implantu",
    "category": "Education",
    "type": "ARTICLE",
    "difficulty": "BEGINNER",
    "content": {
      "wordCount": 1500,
      "readingTimeMinutes": 7
    },
    "isPublished": true,
    "order": 1,
    "patientProgress": {
      "isCompleted": true,
      "completedAt": "2024-02-21T12:30:00Z",
      "quizScore": 85
    }
  },
  {
    "id": "mat-002",
    "projectId": "660e8400-e29b-41d4-a716-446655440001",
    "projectName": "Rehabilitacja słuchu - grupa A",
    "title": "Ćwiczenia domowe - tydzień 1",
    "description": "Zestaw ćwiczeń do wykonania w pierwszym tygodniu terapii",
    "category": "Exercises",
    "type": "PDF",
    "difficulty": "BEGINNER",
    "content": {
      "fileName": "cwiczenia_tydzien_1.pdf",
      "fileSize": 2048576
    },
    "isPublished": true,
    "order": 2,
    "patientProgress": {
      "isCompleted": false,
      "completedAt": null,
      "quizScore": null,
      "lastViewedAt": "2024-02-20T10:00:00Z"
    }
  }
]
```

---

### GET /api/v1/materials/progress

Retrieve progress for all materials for a specific patient.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `PATIENT`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient ID |

**Example Request:**

```http
GET /api/v1/materials/progress?patientId=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "materialId": "mat-001",
    "materialTitle": "Wprowadzenie do implantu ślimakowego",
    "category": "Education",
    "type": "ARTICLE",
    "difficulty": "BEGINNER",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "firstViewedAt": "2024-02-21T12:00:00Z",
    "lastViewedAt": "2024-02-21T12:30:00Z",
    "viewCount": 1,
    "completedAt": "2024-02-21T12:30:00Z",
    "quizScore": 85,
    "timeSpentSeconds": 420
  },
  {
    "materialId": "mat-002",
    "materialTitle": "Ćwiczenia domowe - tydzień 1",
    "category": "Exercises",
    "type": "PDF",
    "difficulty": "BEGINNER",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "IN_PROGRESS",
    "firstViewedAt": "2024-02-20T10:00:00Z",
    "lastViewedAt": "2024-02-20T10:15:00Z",
    "viewCount": 2,
    "completedAt": null,
    "quizScore": null,
    "timeSpentSeconds": 180
  },
  {
    "materialId": "mat-003",
    "materialTitle": "Jak dbać o procesor mowy?",
    "category": "Device Care",
    "type": "VIDEO",
    "difficulty": "BEGINNER",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "NOT_STARTED",
    "firstViewedAt": null,
    "lastViewedAt": null,
    "viewCount": 0,
    "completedAt": null,
    "quizScore": null,
    "timeSpentSeconds": 0
  }
]
```

---

## Material Types

| Type | Code | Description | Content Fields |
|------|------|-------------|----------------|
| Article | `ARTICLE` | Text-based educational content | `body`, `wordCount`, `readingTimeMinutes`, `sections` |
| PDF Document | `PDF` | Downloadable PDF file | `url`, `fileName`, `fileSize`, `pageCount` |
| Video | `VIDEO` | Video content | `url`, `thumbnailUrl`, `duration`, `provider` |
| Audio | `AUDIO` | Audio recording | `url`, `duration`, `fileName`, `fileSize` |
| Link | `LINK` | External resource link | `url`, `domain`, `previewImage` |
| Quiz | `QUIZ` | Interactive quiz | `questions`, `passingScore`, `timeLimitSeconds` |
| Image | `IMAGE` | Infographic or diagram | `url`, `caption`, `width`, `height` |

---

## Difficulty Levels

| Level | Code | Description |
|-------|------|-------------|
| Beginner | `BEGINNER` | Introductory materials for new patients |
| Intermediate | `INTERMEDIATE` | Materials for patients with basic knowledge |
| Advanced | `ADVANCED` | Complex materials for experienced patients |

---

## Progress Status

| Status | Code | Description |
|--------|------|-------------|
| Not Started | `NOT_STARTED` | Patient has not viewed the material |
| In Progress | `IN_PROGRESS` | Patient has viewed but not completed |
| Completed | `COMPLETED` | Patient has marked material as complete |

---

## Error Responses

### 400 Bad Request

```json
{
  "timestamp": "2024-02-20T17:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Material title cannot be empty",
  "path": "/api/v1/materials"
}
```

### 403 Forbidden

```json
{
  "timestamp": "2024-02-20T17:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: patient can only view their own progress",
  "path": "/api/v1/materials/progress"
}
```

### 404 Not Found

```json
{
  "timestamp": "2024-02-20T17:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Material not found with id: mat-010",
  "path": "/api/v1/materials/mat-010"
}
```

### 409 Conflict

```json
{
  "timestamp": "2024-02-20T17:00:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot complete material that has not been viewed",
  "path": "/api/v1/materials/mat-010/complete"
}
```

---

## Data Models

### EducationalMaterialDto

```typescript
interface EducationalMaterialDto {
  id: string;                    // UUID
  projectId: string;             // UUID
  projectName?: string;
  title: string;
  description?: string;
  category: string;
  type: MaterialType;            // ARTICLE, PDF, VIDEO, AUDIO, LINK, QUIZ, IMAGE
  difficulty: DifficultyLevel;   // BEGINNER, INTERMEDIATE, ADVANCED
  content: MaterialContent;
  tags?: string[];
  prerequisites?: string[];      // Array of material IDs
  relatedMaterials?: string[];   // Array of material IDs
  isPublished: boolean;
  order: number;
  statistics?: {
    totalViews: number;
    uniqueViews: number;
    completionRate: number;
    averageQuizScore?: number;
    averageTimeSpentSeconds?: number;
  };
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

### MaterialContent (Union Type)

```typescript
// Article content
interface ArticleContent {
  body: string;
  wordCount: number;
  readingTimeMinutes: number;
  sections?: { title: string; order: number }[];
}

// File content (PDF, Audio, Image)
interface FileContent {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  duration?: number;
}

// Video content
interface VideoContent {
  url: string;
  thumbnailUrl?: string;
  duration: number;
  provider: 'internal' | 'youtube' | 'vimeo';
}

// Link content
interface LinkContent {
  url: string;
  domain: string;
  previewImage?: string;
}

// Quiz content
interface QuizContent {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimitSeconds?: number;
}
```

### MaterialProgressDto

```typescript
interface MaterialProgressDto {
  materialId: string;
  materialTitle: string;
  category: string;
  type: MaterialType;
  difficulty: DifficultyLevel;
  patientId: string;
  status: ProgressStatus;        // NOT_STARTED, IN_PROGRESS, COMPLETED
  firstViewedAt?: string;
  lastViewedAt?: string;
  viewCount: number;
  completedAt?: string;
  quizScore?: number;
  timeSpentSeconds: number;
}
```

### MaterialFilters

```typescript
interface MaterialFilters {
  projectId?: string;
  category?: string;
  difficulty?: DifficultyLevel;
  type?: MaterialType;
  published?: boolean;
}
```

---

## Related Documentation

- [Patients API](./patients.md)
- [Projects API](./projects.md)
- [Calendar API](./calendar.md)
