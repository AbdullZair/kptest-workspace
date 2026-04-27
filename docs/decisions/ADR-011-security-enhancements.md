# ADR-011: Security Enhancements

## Status
ACCEPTED (2026-04-27)

## Context
System KPTESTPRO wymaga wzmocnienia bezpieczeństwa w obszarach:

1. **Szyfrowanie danych PII w bazie** - PESEL i numer telefonu muszą być zaszyfrowane at-rest
2. **Rate limiting endpointów** - ochrona przed brute-force i DDoS
3. **Autoryzacja per-projektowa** - użytkownicy mają dostęp tylko do przypisanych projektów

Wymagania wynikają z:
- Specyfikacji projektu (FAZA 1 - backend security)
- Best practices dla systemów medycznych
- Wymagań compliance (RODO - bezpieczeństwo przetwarzania)

## Decision

### 1. AES-256-GCM Encryption for PESEL/Phone (US-S-01)

**Implementacja:**
- `AesAttributeConverter` implements `AttributeConverter<String,String>`
- Klucz z env var `KPTEST_DB_ENCRYPTION_KEY` (256-bit, Base64)
- AES-256-GCM z unikalnym IV per wartość
- Format w bazie: IV + ciphertext + tag (Base64 encoded)

**Zastosowanie:**
- `Patient.pesel` - `@Convert(converter = AesAttributeConverter.class)`
- `User.phone` - `@Convert(converter = AesAttributeConverter.class)`

**Migracja:**
- `V3__encrypt_pesel.sql` - walidacja schemy
- `PeselEncryptionMigration.java` (@PostConstruct) - migracja istniejących danych (profile=encrypt-existing)

### 2. Bucket4j Rate Limiting (US-S-02)

**Implementacja:**
- Biblioteka: `com.bucket4j:bucket4j-spring-boot-starter:0.6.0`
- `RateLimitFilter` extends `OncePerRequestFilter`
- Storage: `ConcurrentHashMap` (in-memory; docelowo Redis w K8s)

**Limity:**
| Endpoint | Limit | Okno | Per |
|----------|-------|------|-----|
| `/api/v1/auth/login` | 5 req | 1 min | IP |
| `/api/v1/auth/forgot-password` | 3 req | 15 min | IP |
| `/api/v1/his/**` | 10 req | 1 min | IP |
| **Default** | 100 req | 1 min | User/IP |

### 3. Per-Project Authorization (US-S-03)

**Implementacja:**
- `ProjectAccessChecker` (@Component)
- Method: `hasProjectAccess(UUID userId, UUID projectId): boolean`

**Reguły dostępu:**
| Rola | Dostęp |
|------|--------|
| `ADMIN` | ✅ Wszystkie projekty |
| `STAFF` | ✅ Tylko projekty z `ProjectTeam` |
| `PATIENT` | ✅ Tylko aktywne projekty z `PatientProject` |

**Zastosowanie:**
```java
@PreAuthorize("@projectAccessChecker.hasProjectAccess(authentication.principal, #projectId)")
```

**Endpointy:**
- `ProjectController`
- `MaterialController`
- `QuizController`
- `TherapyStageController`
- `CalendarController`
- `MessageController` (per `thread.projectId`)

## Alternatives Considered

### Opcja 1: TDE (Transparent Data Encryption) na poziomie bazy
- **Odrzucona:** TDE chroni przed kradzieżą plików DB, ale nie przed dostępem przez uprawnionego użytkownika bazy. Aplikacyjne szyfrowanie daje lepszą kontrolę.

### Opcja 2: Rate limiting w API Gateway (Kong/Apigee)
- **Odrzucona:** Wymagałoby dodatkowej infrastruktury. Bucket4j w aplikacji jest prostszy dla MVP.

### Opcja 3: @PreAuthorize z wyrażeniami SpEL
- **Odrzucona:** Wyrażenia SpEL są trudne do testowania i utrzymania. `ProjectAccessChecker` jako @Component jest łatwiejszy do mockowania w testach.

## Consequences

### Pozytywne
- ✅ **Encrypted PII at rest** - PESEL i phone są zaszyfrowane w bazie
- ✅ **DDoS protection** - rate limiting chroni przed brute-force i overload
- ✅ **Proper RBAC per project** - użytkownicy mają dostęp tylko do przypisanych projektów
- ✅ **Compliance** - spełnione wymagania bezpieczeństwa RODO (Art. 32)

### Negatywne / Ryzyka
- ⚠️ **Klucz szyfrujący** - musi być bezpiecznie przechowywany (env var, nie w repo)
- ⚠️ **In-memory rate limiting** - nie działa poprawnie w clusterze (docelowo Redis)
- ⚠️ **Performance** - szyfrowanie/deszyfrowanie dodaje niewielki overhead (~1-2ms per operacja)
- ⚠️ **Migracja danych** - migracja istniejących PESEL wymaga ostrożności (hook @PostConstruct, profile=encrypt-existing)

## Implementation Details

### Backend
- `infrastructure/security/AesAttributeConverter.java` - converter AES
- `infrastructure/security/RateLimitFilter.java` - filter rate limiting
- `infrastructure/security/ProjectAccessChecker.java` - checker autoryzacji
- Migracja Flyway: `V3__encrypt_pesel.sql`
- `domain/migration/PeselEncryptionMigration.java` - migracja danych

### Dependencies
```gradle
implementation 'com.bucket4j:bucket4j-core:8.7.0'
implementation 'com.bucket4j:bucket4j-spring-boot-starter:0.6.0'
```

### Configuration (application.yml)
```yaml
kptest:
  security:
    rate-limit:
      login:
        capacity: 5
        refillTokens: 5
        refillPeriodSeconds: 60
      forgotPassword:
        capacity: 3
        refillTokens: 3
        refillPeriodSeconds: 900
      his:
        capacity: 10
        refillTokens: 10
        refillPeriodSeconds: 60
      default:
        capacity: 100
        refillTokens: 100
        refillPeriodSeconds: 60
```

### Testy
- `AesAttributeConverterTest` - encrypt/decrypt roundtrip, distinct IV
- `RateLimitFilterTest` - @WebMvcTest, sprawdza 429 po przekroczeniu
- `ProjectAccessCheckerTest` - @DataJpaTest scenariusze ADMIN/STAFF/PATIENT/cross-project

## Security Mapping

| Wymaganie | Implementacja | User Story |
|-----------|---------------|------------|
| Encryption at rest | `AesAttributeConverter` + AES-256-GCM | US-S-01 |
| Rate limiting | `RateLimitFilter` + Bucket4j | US-S-02 |
| Per-project auth | `ProjectAccessChecker` + @PreAuthorize | US-S-03 |

---

**Autor:** Technical Writer (kpt-dokumentalista)  
**Data:** 2026-04-27
