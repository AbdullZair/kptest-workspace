# SMS Provider Setup Guide

## Overview

This guide describes how to configure and manage SMS notifications in the KPTEST system using Twilio as the primary SMS provider.

## Prerequisites

- Twilio account (https://www.twilio.com)
- Verified phone number or Twilio-provided number
- API credentials (Account SID, Auth Token)

## Configuration

### Environment Variables

```bash
# SMS Provider Configuration
SMS_PROVIDER=twilio
SMS_TWILIO_ENABLED=true
SMS_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxx
SMS_TWILIO_AUTH_TOKEN=your_auth_token_here
SMS_TWILIO_FROM_NUMBER=+48000000000

# Optional: Sender ID (for supported countries)
SMS_TWILIO_SENDER_ID=KPTEST
```

### Application Properties

```properties
# SMS Configuration
sms.provider=twilio
sms.twilio.enabled=true
sms.twilio.account-sid=${SMS_TWILIO_ACCOUNT_SID}
sms.twilio.auth-token=${SMS_TWILIO_AUTH_TOKEN}
sms.twilio.from-number=${SMS_TWILIO_FROM_NUMBER}

# Rate Limiting
sms.rate-limit.per-minute=10
sms.rate-limit.per-hour=50

# Retry Configuration
sms.retry.max-attempts=3
sms.retry.delay-ms=1000
```

## Twilio Setup

### Step 1: Create Twilio Account

1. Visit https://www.twilio.com
2. Click "Sign Up"
3. Complete registration with phone verification
4. Verify email address

### Step 2: Get Credentials

1. Log in to Twilio Console
2. Navigate to **Settings** → **General**
3. Copy **Account SID**
4. Click **Show** under Auth Token and copy it

### Step 3: Get Phone Number

#### Option A: Twilio-Provided Number

1. Navigate to **Phone Numbers** → **Buy a Number**
2. Search for available numbers
3. Select number with SMS capability
4. Complete purchase

#### Option B: Verified Sender ID

For countries that support alphanumeric sender IDs:

1. Navigate to **Messaging** → **Sender IDs**
2. Click **Add Sender ID**
3. Enter desired sender ID (e.g., "KPTEST")
4. Complete verification process

### Step 4: Configure Webhooks (Optional)

For delivery status callbacks:

```
https://api.kptest.com/api/v1/notifications/sms/status
```

## Implementation

### SMS Provider Interface

```java
public interface SmsProvider {
    /**
     * Send SMS message
     * @param phoneNumber Recipient phone number
     * @param message Message content
     * @return true if sent successfully
     */
    boolean send(String phoneNumber, String message);
    
    /**
     * Send SMS with custom sender ID
     */
    boolean send(String phoneNumber, String message, String senderId);
    
    /**
     * Check if provider is available
     */
    boolean isAvailable();
    
    /**
     * Get provider name
     */
    String getProviderName();
}
```

### Twilio Implementation

```java
@Service
@Slf4j
public class TwilioSmsProvider implements SmsProvider {
    
    @Autowired
    private TwilioConfiguration twilioConfig;
    
    @Override
    public boolean send(String phoneNumber, String message) {
        return send(phoneNumber, message, twilioConfig.getFromNumber());
    }
    
    @Override
    public boolean send(String phoneNumber, String message, String senderId) {
        if (!twilioConfig.isEnabled()) {
            log.warn("SMS provider disabled, skipping send");
            return false;
        }
        
        if (!isValidPhoneNumber(phoneNumber)) {
            log.error("Invalid phone number: {}", maskPhoneNumber(phoneNumber));
            return false;
        }
        
        try {
            Message messageRequest = Message.creator(
                new com.twilio.type.PhoneNumber(phoneNumber),
                new com.twilio.type.PhoneNumber(senderId),
                message
            ).create();
            
            log.info("SMS sent successfully to {}: {}", 
                maskPhoneNumber(phoneNumber), messageRequest.getSid());
            
            return "queued".equals(messageRequest.getStatus().name().toLowerCase()) ||
                   "sent".equals(messageRequest.getStatus().name().toLowerCase());
                   
        } catch (ApiException e) {
            log.error("Failed to send SMS to {}: {}", 
                maskPhoneNumber(phoneNumber), e.getMessage());
            return false;
        }
    }
    
    @Override
    public boolean isAvailable() {
        return twilioConfig.isEnabled();
    }
    
    @Override
    public String getProviderName() {
        return "Twilio";
    }
    
    private boolean isValidPhoneNumber(String phoneNumber) {
        return phoneNumber != null && 
               phoneNumber.matches("^\\+[1-9]\\d{1,14}$") &&
               phoneNumber.length() >= 10;
    }
    
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) return "****";
        return "****" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
```

### SMS Service

```java
@Service
public class SmsService {
    
    @Autowired
    private SmsProvider smsProvider;
    
    @Autowired
    private RateLimiter rateLimiter;
    
    /**
     * Send critical reminder SMS
     */
    public boolean sendCriticalReminder(String phoneNumber, String message) {
        if (!rateLimiter.isAllowed(phoneNumber, "CRITICAL_REMINDER")) {
            log.warn("Rate limit exceeded for critical reminder to {}", 
                maskPhoneNumber(phoneNumber));
            return false;
        }
        
        return smsProvider.send(phoneNumber, message);
    }
    
    /**
     * Send appointment reminder
     */
    public boolean sendAppointmentReminder(String phoneNumber,
                                           LocalDateTime appointmentDate,
                                           String appointmentType,
                                           String location) {
        String message = formatAppointmentReminder(
            appointmentDate, appointmentType, location);
        
        return smsProvider.send(phoneNumber, message);
    }
    
    /**
     * Send verification code
     */
    public boolean sendVerificationCode(String phoneNumber, String code) {
        String message = String.format(
            "KPTEST: Twoj kod weryfikacyjny to: %s. Wazny przez 10 minut.",
            code);
        
        return smsProvider.send(phoneNumber, message);
    }
    
    /**
     * Send bulk SMS
     */
    public int sendBulk(List<String> phoneNumbers, String message) {
        int successCount = 0;
        
        for (String phoneNumber : phoneNumbers) {
            if (smsProvider.send(phoneNumber, message)) {
                successCount++;
            }
            // Small delay to avoid rate limiting
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        return successCount;
    }
    
    private String formatAppointmentReminder(LocalDateTime date, 
                                              String type, 
                                              String location) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(
            "yyyy-MM-dd 'o godz.' HH:mm");
        
        return String.format(
            "PRZYPOMNIENIE: Wizyta (%s) dnia %s. Lokalizacja: %s. " +
            "W razie pytan tel: 123-456-789",
            type, date.format(formatter), location);
    }
    
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) return "****";
        return "****" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
```

## Message Templates

### Appointment Reminder

```
PRZYPOMNIENIE: Wizyta ({type}) dnia {date} o godz. {time}. 
Lokalizacja: {location}. W razie pytan tel: {phone}
```

### Verification Code

```
KPTEST: Twoj kod weryfikacyjny to: {code}. Wazny przez 10 minut. 
Nie udostepniaj nikomu.
```

### Project Assignment

```
Witaj! Zostales przypisany do projektu terapeutycznego: {project}. 
Skontaktuj sie z koordynatorem: {coordinator}.
```

### Low Adherence Alert (Staff)

```
ALERT: Pacjent {patient} ma niska adherencje ({rate}%). 
Sprawdz w systemie KPTEST.
```

## Rate Limiting

### Configuration

```yaml
sms:
  rate-limit:
    per-minute: 10
    per-hour: 50
    per-day: 200
```

### Implementation

```java
@Component
public class SmsRateLimiter {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean isAllowed(String phoneNumber, String type) {
        String minuteKey = "sms:rate:" + phoneNumber + ":minute:" + 
            getCurrentMinute();
        String hourKey = "sms:rate:" + phoneNumber + ":hour:" + 
            getCurrentHour();
        
        Long minuteCount = redisTemplate.opsForValue().increment(minuteKey);
        Long hourCount = redisTemplate.opsForValue().increment(hourKey);
        
        if (minuteCount == 1) {
            redisTemplate.expire(minuteKey, 1, TimeUnit.MINUTES);
        }
        if (hourCount == 1) {
            redisTemplate.expire(hourKey, 1, TimeUnit.HOURS);
        }
        
        return minuteCount <= 10 && hourCount <= 50;
    }
}
```

## Testing

### Unit Tests

```java
@SpringBootTest
class SmsServiceTest {
    
    @MockBean
    private SmsProvider smsProvider;
    
    @Autowired
    private SmsService smsService;
    
    @Test
    void shouldSendAppointmentReminder() {
        // Given
        when(smsProvider.send(any(), any())).thenReturn(true);
        
        // When
        boolean result = smsService.sendAppointmentReminder(
            "+48123456789",
            LocalDateTime.of(2026, 4, 25, 10, 30),
            "Wizyta kontrolna",
            "Gabinet 101"
        );
        
        // Then
        assertTrue(result);
        verify(smsProvider).send(eq("+48123456789"), any());
    }
    
    @Test
    void shouldSendVerificationCode() {
        // Given
        when(smsProvider.send(any(), any())).thenReturn(true);
        
        // When
        boolean result = smsService.sendVerificationCode(
            "+48123456789", "123456");
        
        // Then
        assertTrue(result);
    }
}
```

## Monitoring

### Metrics

```java
@Component
public class SmsMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public SmsMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }
    
    public void recordSmsSent(String provider, boolean success) {
        meterRegistry.counter("sms.sent", 
            "provider", provider,
            "success", String.valueOf(success)).increment();
    }
    
    public void recordSmsLatency(String provider, long latencyMs) {
        meterRegistry.timer("sms.latency", "provider", provider)
            .record(latencyMs, TimeUnit.MILLISECONDS);
    }
}
```

### Alerts

```yaml
# Prometheus alert rules
groups:
- name: sms
  rules:
  - alert: HighSmsFailureRate
    expr: |
      sum(rate(sms_sent{success="false"}[5m])) / 
      sum(rate(sms_sent[5m])) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High SMS failure rate"
      
  - alert: SmsRateLimitExceeded
    expr: sum(rate(sms_rate_limit_exceeded[5m])) > 10
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "SMS rate limit frequently exceeded"
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| SMS not sending | Invalid credentials | Verify Account SID and Auth Token |
| Invalid phone number | Wrong format | Use E.164 format (+48...) |
| Rate limit exceeded | Too many requests | Implement backoff, check limits |
| Delivery failed | Invalid number | Verify number is active |

### Logs

```java
// Enable debug logging
logging:
  level:
    com.twilio: DEBUG
    com.kptest.sms: DEBUG
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
