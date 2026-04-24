# Patient API Documentation

Base URL: `/api/v1/patients`

## Overview

The Patient API provides comprehensive management of patient records, including CRUD operations, HIS (Hospital Information System) verification, and search capabilities.

## Authentication

All endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/v1/patients

Retrieve a paginated list of patients with optional filtering.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pesel` | string | No | Filter by PESEL number |
| `name` | string | No | Filter by first or last name |
| `hisPatientId` | string | No | Filter by HIS patient ID |
| `status` | string[] | No | Filter by user status (ACTIVE, BLOCKED, etc.) |
| `verificationStatus` | string[] | No | Filter by verification status (PENDING, APPROVED, REJECTED) |
| `project` | string | No | Filter by project ID |
| `page` | integer | No | Page number (0-indexed, default: 0) |
| `size` | integer | No | Page size (default: 20) |
| `sort` | string | No | Sort field (name, created_at, status, default: name) |
| `sortOrder` | string | No | Sort order (asc, desc, default: asc) |

**Example Request:**

```http
GET /api/v1/patients?status=ACTIVE&verificationStatus=APPROVED&page=0&size=10 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "pesel": "90010101234",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "dateOfBirth": "1990-01-01",
      "email": "jan.kowalski@email.com",
      "phone": "+48123456789",
      "status": "ACTIVE",
      "verificationStatus": "APPROVED",
      "hisPatientId": "HIS-12345",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 150,
  "totalPages": 15
}
```

---

### GET /api/v1/patients/{id}

Retrieve detailed information about a specific patient.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient ID |

**Example Request:**

```http
GET /api/v1/patients/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pesel": "90010101234",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789",
  "address": {
    "street": "ul. Przykładowa 12/3",
    "city": "Warszawa",
    "postalCode": "00-001",
    "country": "Poland"
  },
  "status": "ACTIVE",
  "verificationStatus": "APPROVED",
  "hisPatientId": "HIS-12345",
  "emergencyContact": {
    "name": "Anna Kowalska",
    "phone": "+48987654321",
    "relationship": "Spouse"
  },
  "projects": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Rehabilitacja słuchu - grupa A",
      "startDate": "2024-01-01",
      "status": "ACTIVE"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### POST /api/v1/patients

Create a new patient record.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Request Body:**

```json
{
  "pesel": "90010101234",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789",
  "address": {
    "street": "ul. Przykładowa 12/3",
    "city": "Warszawa",
    "postalCode": "00-001",
    "country": "Poland"
  },
  "emergencyContact": {
    "name": "Anna Kowalska",
    "phone": "+48987654321",
    "relationship": "Spouse"
  }
}
```

**Example Request:**

```http
POST /api/v1/patients HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "pesel": "90010101234",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789"
}
```

**Example Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pesel": "90010101234",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "email": "jan.kowalski@email.com",
  "phone": "+48123456789",
  "status": "PENDING",
  "verificationStatus": "PENDING",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### PUT /api/v1/patients/{id}

Update an existing patient record.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient ID |

**Request Body:** Same structure as POST

**Example Request:**

```http
PUT /api/v1/patients/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "pesel": "90010101234",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "email": "jan.kowalski@newemail.com",
  "phone": "+48123456789",
  "address": {
    "street": "ul. Nowa 45/7",
    "city": "Kraków",
    "postalCode": "30-001",
    "country": "Poland"
  }
}
```

**Example Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pesel": "90010101234",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "email": "jan.kowalski@newemail.com",
  "phone": "+48123456789",
  "address": {
    "street": "ul. Nowa 45/7",
    "city": "Kraków",
    "postalCode": "30-001",
    "country": "Poland"
  },
  "status": "ACTIVE",
  "verificationStatus": "APPROVED",
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

---

### DELETE /api/v1/patients/{id}

Soft delete a patient record.

**Roles:** `ADMIN`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient ID |

**Example Request:**

```http
DELETE /api/v1/patients/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
{
  "message": "Patient deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### POST /api/v1/patients/verify

Verify patient data against Hospital Information System (HIS).

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Request Body:**

```json
{
  "pesel": "90010101234",
  "cartNumber": "CART-2024-001"
}
```

**Example Request:**

```http
POST /api/v1/patients/verify HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "pesel": "90010101234",
  "cartNumber": "CART-2024-001"
}
```

**Example Response (Verified):**

```json
{
  "verified": true,
  "patientData": {
    "pesel": "90010101234",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "dateOfBirth": "1990-01-01",
    "hisPatientId": "HIS-12345"
  },
  "message": "Patient verified successfully in HIS"
}
```

**Example Response (Not Found):**

```json
{
  "verified": false,
  "patientData": null,
  "message": "Patient not found in HIS"
}
```

---

### GET /api/v1/patients/search

Search patients by PESEL, name, or HIS ID.

**Roles:** `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (PESEL, name, or HIS ID) |

**Example Request:**

```http
GET /api/v1/patients/search?query=Kowalski HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "pesel": "90010101234",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "dateOfBirth": "1990-01-01",
    "email": "jan.kowalski@email.com",
    "status": "ACTIVE",
    "verificationStatus": "APPROVED"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "pesel": "85050512345",
    "firstName": "Anna",
    "lastName": "Kowalska",
    "dateOfBirth": "1985-05-05",
    "email": "anna.kowalska@email.com",
    "status": "ACTIVE",
    "verificationStatus": "APPROVED"
  }
]
```

---

## Error Responses

### 400 Bad Request

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid PESEL format",
  "path": "/api/v1/patients"
}
```

### 401 Unauthorized

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired JWT token",
  "path": "/api/v1/patients"
}
```

### 403 Forbidden

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: insufficient privileges",
  "path": "/api/v1/patients/550e8400-e29b-41d4-a716-446655440000"
}
```

### 404 Not Found

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found with id: 550e8400-e29b-41d4-a716-446655440000",
  "path": "/api/v1/patients/550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Data Models

### PatientDto

```typescript
interface PatientDto {
  id: string;              // UUID
  pesel: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;     // ISO-8601 date
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: UserStatus;      // ACTIVE, BLOCKED, PENDING, etc.
  verificationStatus: VerificationStatus;  // PENDING, APPROVED, REJECTED
  hisPatientId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;       // ISO-8601 datetime
  updatedAt: string;       // ISO-8601 datetime
}
```

### VerificationStatus

```typescript
enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}
```

### PatientSearchResponse

```typescript
interface PatientSearchResponse {
  content: PatientDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

---

## Related Documentation

- [Authentication API](./authentication.md)
- [Projects API](./projects.md)
- [Messages API](./messages.md)
