---
name: Security Architecture
description: Security architecture, controls, and compliance documentation
type: architecture
---

# Security Architecture

## Overview

This document describes the security architecture of the KPTEST system, including authentication, authorization, data protection, network security, and compliance measures.

## Security Principles

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Security Layers                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Layer 1: Network Security                                           │    │
│  │  • VPC isolation                                                     │    │
│  │  • Security groups                                                   │    │
│  │  • Network policies                                                  │    │
│  │  • DDoS protection                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Layer 2: Application Security                                       │    │
│  │  • Authentication (JWT + 2FA)                                        │    │
│  │  • Authorization (RBAC)                                              │    │
│  │  • Input validation                                                  │    │
│  │  • Rate limiting                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Layer 3: Data Security                                              │    │
│  │  • Encryption at rest (AES-256)                                      │    │
│  │  • Encryption in transit (TLS 1.3)                                   │    │
│  │  • Data masking                                                      │    │
│  │  • Audit logging                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Layer 4: Operational Security                                       │    │
│  │  • Security monitoring                                               │    │
│  │  • Incident response                                                 │    │
│  │  • Backup and recovery                                               │    │
│  │  • Access reviews                                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Authentication Architecture

### Authentication Flow

```
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Server  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  POST /auth/login                       │
     │  { email, password }                    │
     │────────────────────────────────────────>│
     │                                         │
     │                                         │ Verify credentials
     │                                         │ Generate temp_token
     │                                         │ Check 2FA status
     │                                         │
     │  Response:                              │
     │  {                                      │
     │    "requires2FA": true,                 │
     │    "tempToken": "abc123..."             │
     │  }                                      │
     │<────────────────────────────────────────│
     │                                         │
     │  POST /auth/2fa/verify                  │
     │  { tempToken, totpCode }                │
     │────────────────────────────────────────>│
     │                                         │ Verify TOTP
     │                                         │ Generate tokens
     │                                         │
     │  Response:                              │
     │  {                                      │
     │    "accessToken": "eyJ...",             │
     │    "refreshToken": "xyz...",            │
     │    "expiresIn": 900                     │
     │  }                                      │
     │<────────────────────────────────────────│
     │                                         │
     │  Subsequent requests:                   │
     │  Authorization: Bearer <accessToken>    │
     │────────────────────────────────────────>│
```

### Token Structure

#### Access Token (JWT)

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "COORDINATOR",
  "permissions": ["PATIENTS_READ", "PATIENTS_WRITE"],
  "iat": 1682340000,
  "exp": 1682340900,
  "iss": "kptest.com",
  "jti": "token-uuid"
}
```

**Properties:**
- Algorithm: HS256
- Expiration: 15 minutes
- Issuer: kptest.com
- Signing Key: 256-bit secret

#### Refresh Token

```json
{
  "jti": "refresh-token-uuid",
  "sub": "user-uuid",
  "iat": 1682340000,
  "exp": 1682944800,
  "iss": "kptest.com"
}
```

**Properties:**
- Stored in Redis
- Expiration: 7 days
- Revocable
- Single use (rotation)

### Two-Factor Authentication (2FA)

#### TOTP Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                    2FA Setup Flow                                │
│                                                                  │
│  1. User enables 2FA                                            │
│     │                                                           │
│     ▼                                                           │
│  2. Server generates secret                                     │
│     • 32-character base32 secret                                │
│     • QR code for authenticator app                             │
│     │                                                           │
│     ▼                                                           │
│  3. User scans QR code                                          │
│     • Google Authenticator                                      │
│     • Authy                                                     │
│     • Microsoft Authenticator                                   │
│     │                                                           │
│     ▼                                                           │
│  4. User enters verification code                               │
│     • Server verifies TOTP                                      │
│     • Backup codes generated                                    │
│     │                                                           │
│     ▼                                                           │
│  5. 2FA enabled                                                 │
│     • Secret stored encrypted                                   │
│     • Recovery codes displayed once                             │
└─────────────────────────────────────────────────────────────────┘
```

#### TOTP Verification

```java
// Time-based One-Time Password
// RFC 6238 implementation

public class TotpService {
    
    private static final int TIME_STEP = 30; // seconds
    private static final int CODE_LENGTH = 6;
    private static final int WINDOW_SIZE = 1; // Allow 1 step skew
    
    public boolean verify(String secret, String code) {
        long currentTime = System.currentTimeMillis() / 1000;
        long timeStep = currentTime / TIME_STEP;
        
        // Check current and adjacent time steps
        for (int i = -WINDOW_SIZE; i <= WINDOW_SIZE; i++) {
            String generatedCode = generateCode(secret, timeStep + i);
            if (generatedCode.equals(code)) {
                return true;
            }
        }
        return false;
    }
}
```

## Authorization Architecture

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RBAC Matrix                                        │
│                                                                              │
│  ┌─────────────┬──────────┬─────────────┬───────────┬──────────┐           │
│  │  Endpoint   │  ADMIN   │COORDINATOR  │ THERAPIST │ PATIENT  │           │
│  ├─────────────┼──────────┼─────────────┼───────────┼──────────┤           │
│  │ GET /users  │    ✅    │     ❌      │    ❌     │    ❌    │           │
│  │ POST /users │    ✅    │     ❌      │    ❌     │    ❌    │           │
│  │             │          │             │           │          │           │
│  │ GET /patients│   ✅    │     ✅      │    ✅*    │   ✅**   │           │
│  │ POST /patients│  ✅    │     ✅      │    ❌     │    ❌    │           │
│  │ PUT /patients│   ✅    │     ✅      │    ❌     │   ✅**   │           │
│  │             │          │             │           │          │           │
│  │ GET /projects│  ✅     │     ✅      │    ✅*    │   ✅*    │           │
│  │ POST /projects│  ✅    │     ✅      │    ❌     │    ❌    │           │
│  │ PUT /projects│   ✅    │     ✅      │    ❌     │    ❌    │           │
│  │             │          │             │           │          │           │
│  │ GET /messages│  ✅     │     ✅      │    ✅*    │   ✅*    │           │
│  │ POST /messages│  ✅    │     ✅      │    ✅     │    ✅    │           │
│  │             │          │             │           │          │           │
│  │ GET /admin/*│   ✅     │     ❌      │    ❌     │    ❌    │           │
│  │ POST /admin/*│  ✅     │     ❌      │    ❌     │    ❌    │           │
│  └─────────────┴──────────┴─────────────┴───────────┴──────────┘           │
│                                                                              │
│  * Limited to assigned patients/projects                                    │
│  ** Self-access only                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Permission Model

```yaml
permissions:
  # Patient permissions
  PATIENTS_READ: "View patient records"
  PATIENTS_WRITE: "Create/update patient records"
  PATIENTS_DELETE: "Delete patient records"
  
  # Project permissions
  PROJECTS_READ: "View project data"
  PROJECTS_WRITE: "Create/update projects"
  PROJECTS_DELETE: "Delete projects"
  
  # Message permissions
  MESSAGES_READ: "Read messages"
  MESSAGES_WRITE: "Send messages"
  
  # Report permissions
  REPORTS_READ: "View reports"
  REPORTS_EXPORT: "Export reports"
  
  # Admin permissions
  ADMIN_USERS: "Manage users"
  ADMIN_SETTINGS: "Modify system settings"
  ADMIN_AUDIT: "View audit logs"
  ADMIN_BACKUP: "Manage backups"
```

### Authorization Filter

```java
@Component
public class AuthorizationFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String uri = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        
        Authentication auth = SecurityContextHolder.getContext()
            .getAuthentication();
        
        // Check if user has required permission
        String requiredPermission = getRequiredPermission(uri, method);
        
        if (!auth.hasPermission(requiredPermission)) {
            ((HttpServletResponse) response)
                .sendError(HttpStatus.FORBIDDEN.value());
            return;
        }
        
        chain.doFilter(request, response);
    }
}
```

## Data Protection

### Encryption at Rest

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Data Encryption                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Database (PostgreSQL)                                               │    │
│  │                                                                      │    │
│  │  • Transparent Data Encryption (TDE)                                 │    │
│  │  • AES-256 encryption                                                │    │
│  │  • Key rotation every 90 days                                        │    │
│  │                                                                      │    │
│  │  Sensitive fields (additional encryption):                           │    │
│  │  • PESEL: AES-256-GCM                                                │    │
│  │  • Phone numbers: AES-256-GCM                                        │    │
│  │  • Emergency contacts: AES-256-GCM                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  File Storage (S3)                                                   │    │
│  │                                                                      │    │
│  │  • Server-side encryption (SSE-S3)                                   │    │
│  │  • Bucket-level encryption                                           │    │
│  │  • Pre-signed URLs for access                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Backups                                                             │    │
│  │                                                                      │    │
│  │  • Encrypted backup files                                            │    │
│  │  • Secure key storage (AWS KMS)                                      │    │
│  │  • Access-controlled restoration                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Encryption in Transit

```yaml
# TLS Configuration
tls:
  version: "1.3"
  min_version: "1.2"
  cipher_suites:
    - TLS_AES_256_GCM_SHA384
    - TLS_CHACHA20_POLY1305_SHA256
    - TLS_AES_128_GCM_SHA256
  
# Certificate
certificate:
  provider: "Let's Encrypt"
  renewal: "Automatic (Cert-Manager)"
  validity: "90 days"
  
# HSTS
hsts:
  enabled: true
  max_age: 31536000
  include_subdomains: true
  preload: true
```

### Data Masking

```java
@Component
public class DataMaskingService {
    
    // Mask PESEL (show only last 4 digits)
    public String maskPesel(String pesel) {
        if (pesel == null || pesel.length() != 11) return "***********";
        return "*******" + pesel.substring(7);
    }
    
    // Mask phone number (show only last 4 digits)
    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "****" + phone.substring(phone.length() - 4);
    }
    
    // Mask email (show first char and domain)
    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "****";
        String[] parts = email.split("@");
        return parts[0].charAt(0) + "***@" + parts[1];
    }
}
```

## Network Security

### Network Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Network Security                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Public Subnet                                                       │    │
│  │                                                                      │    │
│  │  ┌──────────────┐                                                   │    │
│  │  │  Load        │                                                   │    │
│  │  │  Balancer    │                                                   │    │
│  │  │  (ALB)       │                                                   │    │
│  │  └──────┬───────┘                                                   │    │
│  │         │                                                           │    │
│  └─────────┼───────────────────────────────────────────────────────────┘    │
│            │                                                                 │
│  ┌─────────┼───────────────────────────────────────────────────────────┐    │
│  │         ▼                                                           │    │
│  │  ┌──────────────┐  ┌──────────────┐                                │    │
│  │  │   Ingress    │  │   WAF        │                                │    │
│  │  │  Controller  │  │  (Rules)     │                                │    │
│  │  └──────┬───────┘  └──────────────┘                                │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │              Private Subnet (Application)                    │    │    │
│  │  │                                                               │    │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │    │    │
│  │  │  │ Frontend │  │ Backend  │  │   HIS    │                   │    │    │
│  │  │  │  Pods    │  │  Pods    │  │  Mock    │                   │    │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘                   │    │    │
│  │  │                                                               │    │    │
│  │  │  Network Policies:                                            │    │    │
│  │  │  • Frontend → Backend (8080)                                  │    │    │
│  │  │  • Backend → Database (5432)                                  │    │    │
│  │  │  • Backend → Redis (6379)                                     │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │              Private Subnet (Data)                           │    │    │
│  │  │                                                               │    │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │    │    │
│  │  │  │PostgreSQL│  │  Redis   │  │   S3     │                   │    │    │
│  │  │  │          │  │          │  │  Gateway │                   │    │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘                   │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Security Groups

```yaml
# Application Security Group
security_groups:
  app_sg:
    ingress:
    - from: load_balancer_sg
      ports: [8080, 80]
    egress:
    - to: database_sg
      ports: [5432]
    - to: redis_sg
      ports: [6379]
    - to: nat_gateway
      ports: [443]  # External APIs
  
  # Database Security Group
  database_sg:
    ingress:
    - from: app_sg
      ports: [5432]
    egress: []  # No outbound
  
  # Redis Security Group
  redis_sg:
    ingress:
    - from: app_sg
      ports: [6379]
    egress: []  # No outbound
  
  # Load Balancer Security Group
  load_balancer_sg:
    ingress:
    - from: 0.0.0.0/0
      ports: [443, 80]
    egress:
    - to: app_sg
      ports: [8080, 80]
```

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: kptest-production
spec:
  podSelector:
    matchLabels:
      app: kptest-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: kptest-frontend
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

## Input Validation

### Validation Rules

```java
@Data
public class PatientRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "Password must contain uppercase, lowercase, and number")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must be less than 100 characters")
    @Pattern(regexp = "^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\\s-]+$", 
             message = "First name contains invalid characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must be less than 100 characters")
    @Pattern(regexp = "^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\\s-]+$", 
             message = "Last name contains invalid characters")
    private String lastName;
    
    @NotBlank(message = "PESEL is required")
    @Pattern(regexp = "^\\d{11}$", message = "PESEL must be 11 digits")
    private String pesel;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", 
             message = "Invalid phone number format")
    private String phoneNumber;
}
```

### SQL Injection Prevention

```java
// Using parameterized queries (JPA)
@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    
    // ✅ Safe - parameterized
    List<Patient> findByLastName(String lastName);
    
    // ✅ Safe - @Query with parameters
    @Query("SELECT p FROM Patient p WHERE p.firstName = :firstName AND p.lastName = :lastName")
    List<Patient> findByName(@Param("firstName") String firstName, 
                             @Param("lastName") String lastName);
    
    // ❌ Unsafe - string concatenation (never do this)
    // @Query("SELECT p FROM Patient p WHERE p.lastName = '" + lastName + "'")
}
```

### XSS Prevention

```java
@Component
public class XssFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Set security headers
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        httpResponse.setHeader("X-Frame-Options", "DENY");
        httpResponse.setHeader("Content-Security-Policy", 
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
        
        chain.doFilter(new XssRequestWrapper(httpRequest), response);
    }
}
```

## Rate Limiting

### Redis-based Rate Limiter

```java
@Component
public class RateLimiter {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final int MAX_REQUESTS = 100;
    private static final int WINDOW_SECONDS = 60;
    
    public boolean isAllowed(String userId, String endpoint) {
        String key = "ratelimit:" + userId + ":" + endpoint;
        long current = redisTemplate.opsForValue().increment(key);
        
        if (current == 1) {
            redisTemplate.expire(key, WINDOW_SECONDS, TimeUnit.SECONDS);
        }
        
        return current <= MAX_REQUESTS;
    }
}
```

### Rate Limit Configuration

```yaml
rate_limiting:
  global:
    requests_per_minute: 1000
    burst_size: 100
  
  per_user:
    requests_per_minute: 100
    burst_size: 20
  
  per_endpoint:
    /api/v1/auth/login:
      requests_per_minute: 10
      burst_size: 5
    /api/v1/auth/register:
      requests_per_minute: 5
      burst_size: 2
```

## Audit Logging

### Audit Events

```java
@Entity
@Table(name = "audit_log")
@Data
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String action;  // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    
    @Column(nullable = false)
    private String entityType;  // PATIENT, PROJECT, MESSAGE
    
    private String entityId;
    
    @Column(columnDefinition = "TEXT")
    private String details;  // JSON
    
    private String ipAddress;
    
    private String userAgent;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
```

### Audit Log Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "userName": "admin@kptest.pl",
  "action": "UPDATE",
  "entityType": "PATIENT",
  "entityId": "patient-456",
  "details": {
    "changes": {
      "firstName": {"old": "Jan", "new": "Janusz"},
      "status": {"old": "ACTIVE", "new": "INACTIVE"}
    }
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-04-24T10:00:00Z"
}
```

## Compliance

### RODO/GDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| Data minimization | Only collect necessary data |
| Purpose limitation | Clear data usage policies |
| Storage limitation | Automated data retention policies |
| Integrity & confidentiality | Encryption, access controls |
| Accountability | Audit logging, documentation |
| Data subject rights | Export, delete, rectify endpoints |

### HIPAA Considerations

| Requirement | Implementation |
|-------------|----------------|
| Access controls | RBAC, authentication |
| Audit controls | Complete audit trail |
| Integrity controls | Data validation, checksums |
| Transmission security | TLS encryption |
| Physical safeguards | Cloud provider compliance |

## Security Monitoring

### Alert Rules

```yaml
groups:
- name: security
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
  
  - alert: MultipleFailedLogins
    expr: sum(rate(login_failures_total[5m])) by (user) > 5
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "Multiple failed login attempts"
  
  - alert: UnauthorizedAccessAttempt
    expr: sum(rate(http_requests_total{status="403"}[5m])) > 10
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Multiple unauthorized access attempts"
```

---

**Document Version:** 1.0
**Last Updated:** 2026-04-24
**Author:** KPTEST Security Agent
