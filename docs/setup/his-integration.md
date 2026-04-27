# HIS Integration Guide

## Overview

This guide describes the integration between KPTEST and external Hospital Information Systems (HIS). The integration enables patient verification and demographic data synchronization.

## Integration Scope

### What's Included

- Patient verification (PESEL + medical record number)
- Demographic data retrieval
- Patient existence validation
- Basic patient information sync

### What's NOT Included

- Full medical records access
- Treatment history
- Laboratory results
- Imaging data
- Prescription history

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HIS Integration Architecture                          │
│                                                                              │
│  ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐            │
│  │   KPTEST     │     │   Integration    │     │     HIS      │            │
│  │   System     │────▶│    Service       │────▶│   System     │            │
│  │              │     │                  │     │              │            │
│  │ • Patient Mgmt│    │ • REST Client    │     │ • Patient    │            │
│  │ • Verification│    │ • Data Mapping   │     │   Registry   │            │
│  │              │    │ • Error Handling │     │ • API        │            │
│  └──────────────┘    │ • Caching        │     │              │            │
│                      └──────────────────┘     └──────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

```yaml
his:
  integration:
    enabled: true
    base-url: ${HIS_BASE_URL}
    api-key: ${HIS_API_KEY}
    timeout-ms: 5000
    retry-count: 3
    cache-ttl-minutes: 60
```

### Application Properties

```properties
# HIS Integration Configuration
his.integration.enabled=true
his.integration.base-url=https://his.hospital.gov.pl/api/v1
his.integration.api-key=${HIS_API_KEY}
his.integration.timeout-ms=5000
his.integration.retry.count=3
his.integration.cache.ttl-minutes=60

# SSL Configuration
his.integration.ssl.trust-store=classpath:his-truststore.jks
his.integration.ssl.trust-store-password=${HIS_TRUSTSTORE_PASSWORD}
```

## API Endpoints

### Patient Verification

**Request:**
```http
POST /api/v1/his/verify
Content-Type: application/json
Authorization: Bearer <token>

{
  "pesel": "80010112345",
  "medicalRecordNumber": "MRN123456"
}
```

**Response (Success):**
```json
{
  "verified": true,
  "patient": {
    "pesel": "80010112345",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "dateOfBirth": "1980-01-01",
    "gender": "MALE",
    "address": {
      "street": "ul. Przykładowa 1",
      "city": "Warszawa",
      "postalCode": "00-001"
    },
    "contact": {
      "phone": "+48123456789",
      "email": "jan.kowalski@email.pl"
    }
  },
  "verifiedAt": "2026-04-24T10:00:00Z"
}
```

**Response (Not Found):**
```json
{
  "verified": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient not found in HIS registry"
  }
}
```

### Patient Search

**Request:**
```http
GET /api/v1/his/patients?pesel=80010112345
Authorization: Bearer <token>
```

**Response:**
```json
{
  "patients": [
    {
      "pesel": "80010112345",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "dateOfBirth": "1980-01-01",
      "medicalRecordNumber": "MRN123456"
    }
  ]
}
```

## Implementation

### HIS Client Service

```java
@Service
@Slf4j
public class HisClientService {
    
    @Autowired
    private RestTemplate hisRestTemplate;
    
    @Autowired
    private HisCacheService cacheService;
    
    @Value("${his.integration.base-url}")
    private String hisBaseUrl;
    
    /**
     * Verify patient against HIS registry
     */
    public HisVerificationResponse verifyPatient(String pesel, String medicalRecordNumber) {
        // Check cache first
        Optional<HisVerificationResponse> cached = cacheService.getVerification(pesel);
        if (cached.isPresent()) {
            log.info("HIS verification cache hit for PESEL: {}", maskPesel(pesel));
            return cached.get();
        }
        
        // Build request
        HisVerificationRequest request = new HisVerificationRequest(pesel, medicalRecordNumber);
        
        // Execute request with retry
        HisVerificationResponse response = executeWithRetry(() -> 
            hisRestTemplate.postForObject(
                hisBaseUrl + "/patients/verify",
                request,
                HisVerificationResponse.class
            )
        );
        
        // Cache successful verification
        if (response != null && response.isVerified()) {
            cacheService.cacheVerification(pesel, response);
        }
        
        return response;
    }
    
    /**
     * Search for patient by PESEL
     */
    public List<HisPatient> searchByPesel(String pesel) {
        ResponseEntity<HisSearchResponse> response = hisRestTemplate.getForEntity(
            hisBaseUrl + "/patients?pesel=" + pesel,
            HisSearchResponse.class
        );
        
        return response.getBody().getPatients();
    }
    
    private <T> T executeWithRetry(Supplier<T> operation) {
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                return operation.get();
            } catch (HttpServerErrorException e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw e;
                }
                log.warn("HIS request failed, retrying ({}/{})", retryCount, maxRetries);
                try {
                    Thread.sleep(1000 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return null;
    }
    
    private String maskPesel(String pesel) {
        if (pesel == null || pesel.length() != 11) return "***********";
        return "*******" + pesel.substring(7);
    }
}
```

### Fallback Mode

```java
@Service
public class PatientVerificationService {
    
    @Autowired
    private HisClientService hisClientService;
    
    @Value("${his.integration.enabled:true}")
    private boolean hisEnabled;
    
    /**
     * Verify patient with fallback to manual verification
     */
    public VerificationResult verifyPatient(PatientVerificationRequest request) {
        if (!hisEnabled) {
            log.warn("HIS integration disabled, using manual verification");
            return manualVerification(request);
        }
        
        try {
            HisVerificationResponse hisResponse = hisClientService.verifyPatient(
                request.getPesel(),
                request.getMedicalRecordNumber()
            );
            
            if (hisResponse != null && hisResponse.isVerified()) {
                return VerificationResult.verified(hisResponse.getPatient());
            }
            
            return VerificationResult.notFound();
            
        } catch (Exception e) {
            log.error("HIS verification failed, falling back to manual", e);
            return manualVerification(request);
        }
    }
    
    private VerificationResult manualVerification(PatientVerificationRequest request) {
        // Manual verification flow
        // Coordinator must confirm patient identity
        return VerificationResult.pendingManualReview();
    }
}
```

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `HIS_UNAVAILABLE` | 503 | HIS system unavailable |
| `HIS_TIMEOUT` | 504 | Request timeout |
| `PATIENT_NOT_FOUND` | 404 | Patient not in registry |
| `INVALID_PESEL` | 400 | Invalid PESEL format |
| `AUTHENTICATION_FAILED` | 401 | API key invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Circuit Breaker

```java
@Service
public class HisCircuitBreakerService {
    
    @Autowired
    private CircuitBreakerFactory circuitBreakerFactory;
    
    public HisVerificationResponse verifyWithCircuitBreaker(String pesel, String mrn) {
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("hisCircuitBreaker");
        
        return circuitBreaker.run(
            () -> hisClientService.verifyPatient(pesel, mrn),
            throwable -> handleFallback(throwable)
        );
    }
    
    private HisVerificationResponse handleFallback(Throwable throwable) {
        log.warn("HIS circuit breaker opened, using fallback", throwable);
        return HisVerificationResponse.fallback();
    }
}
```

## Testing

### Integration Tests

```java
@SpringBootTest
@AutoConfigureWireMock(port = 0)
class HisClientServiceIntegrationTest {
    
    @Autowired
    private HisClientService hisClientService;
    
    @Value("${wiremock.server.baseUrl}")
    private String wireMockUrl;
    
    @BeforeEach
    void setUp() {
        // Configure HIS client to use WireMock
        ReflectionTestUtils.setField(hisClientService, "hisBaseUrl", wireMockUrl);
    }
    
    @Test
    void shouldVerifyPatient() {
        // Given
        stubFor(post(urlEqualTo("/api/v1/patients/verify"))
            .willReturn(aResponse()
                .withStatus(200)
                .withBody("""
                {
                  "verified": true,
                  "patient": {
                    "pesel": "80010112345",
                    "firstName": "Jan",
                    "lastName": "Kowalski"
                  }
                }
                """)));
        
        // When
        HisVerificationResponse response = hisClientService.verifyPatient(
            "80010112345", "MRN123456"
        );
        
        // Then
        assertTrue(response.isVerified());
        assertEquals("Jan", response.getPatient().getFirstName());
    }
    
    @Test
    void shouldHandleHisUnavailable() {
        // Given
        stubFor(post(urlEqualTo("/api/v1/patients/verify"))
            .willReturn(aResponse().withStatus(503)));
        
        // When/Then
        assertThrows(HttpServerErrorException.class, () -> 
            hisClientService.verifyPatient("80010112345", "MRN123456")
        );
    }
}
```

## Monitoring

### Metrics

```java
@Component
public class HisMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public HisMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Register metrics
        Gauge.builder("his.requests.active", this, HisMetrics::getActiveRequests)
            .register(meterRegistry);
    }
    
    public void recordVerification(boolean success, long durationMs) {
        meterRegistry.counter("his.verification.requests", 
            "success", String.valueOf(success)).increment();
        
        meterRegistry.timer("his.verification.duration")
            .record(durationMs, TimeUnit.MILLISECONDS);
    }
}
```

### Health Check

```java
@Component
public class HisHealthIndicator implements HealthIndicator {
    
    @Autowired
    private HisClientService hisClientService;
    
    @Override
    public Health health() {
        try {
            // Perform simple health check
            hisClientService.healthCheck();
            return Health.up().withDetail("his", "available").build();
        } catch (Exception e) {
            return Health.down(e).withDetail("his", "unavailable").build();
        }
    }
}
```

## Security

### API Key Management

```yaml
# Kubernetes Secret
apiVersion: v1
kind: Secret
metadata:
  name: his-credentials
type: Opaque
stringData:
  api-key: <his-api-key>
  truststore-password: <password>
```

### SSL/TLS Configuration

```java
@Configuration
public class HisSslConfiguration {
    
    @Value("${his.integration.ssl.trust-store}")
    private String trustStorePath;
    
    @Value("${his.integration.ssl.trust-store-password}")
    private String trustStorePassword;
    
    @Bean
    public RestTemplate hisRestTemplate() throws Exception {
        SSLContext sslContext = SSLContextBuilder.create()
            .loadTrustMaterial(
                new File(trustStorePath),
                trustStorePassword.toCharArray()
            )
            .build();
        
        HttpClient httpClient = HttpClientBuilder.create()
            .setSSLContext(sslContext)
            .build();
        
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory(httpClient);
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        
        return new RestTemplate(factory);
    }
}
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
