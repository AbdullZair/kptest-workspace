# SMS/Email Integration Guide

## Overview

System KPTEST ma zaimplementowane serwisy SMS i Email, ale wymagają konfiguracji zewnętrznego dostawcy.

Niniejszy dokument zawiera kompleksowy przewodnik integracji zewnętrznych dostawców usług SMS i Email z systemem KPTEST.

---

## Email Integration

### 1. Choose Provider

Dostępne opcje dostawców usług Email:

| Provider | Recommended | Free Tier | Pricing | Best For |
|----------|-------------|-----------|---------|----------|
| **SendGrid** | ✅ Yes | 100 emails/day | $15/month (50k emails) | Production apps |
| AWS SES | No | 62k emails/month (from EC2) | $0.10 per 1k emails | AWS infrastructure |
| Mailgun | No | 5k emails/month (first 3 months) | $35/month (50k emails) | Developer-friendly |
| SMTP (Gmail, Office365) | No | Limited | Free - $6/user/month | Development/Testing |

**Recommendation:** SendGrid jest rekomendowanym dostawcą dla środowiska produkcyjnego ze względu na:
- Wysoką deliverability rate
- Łatwą integrację przez API
- Dashboard z analityką
- Wbudowane szablony
- Wsparcie dla webhooków

### 2. Configuration

Dodaj konfigurację do pliku `application.yml`:

```yaml
# backend/src/main/resources/application.yml
kptest:
  email:
    enabled: true
    provider: sendgrid
    api-key: ${SENDGRID_API_KEY}
    from-email: noreply@kptest.com
    from-name: KPTEST System
    reply-to: support@kptest.com
    environment: ${SPRING_PROFILES_ACTIVE:development}
    
    # Rate limiting
    rate-limit:
      enabled: true
      max-per-hour: 100
      max-per-day: 1000
    
    # Retry configuration
    retry:
      max-attempts: 3
      delay-ms: 1000
```

### 3. Environment Variables

Skonfiguruj zmienne środowiskowe w pliku `.env` lub secrets manager:

```bash
# .env
SENDGRID_API_KEY=your-api-key-here

# Production (AWS Secrets Manager)
# aws secretsmanager create-secret \
#   --name kptest/email/sendgrid \
#   --secret-string '{"apiKey":"your-api-key-here"}'
```

**Security Best Practices:**
- Nigdy nie commituj API keys do repozytorium
- Używaj secrets manager w produkcji
- Rotuj klucze co 90 dni
- Używaj oddzielnych kluczy dla dev/staging/prod

### 4. Implementation

Email service jest już zaimplementowany w następujących plikach:

```
backend/src/main/java/com/kptest/infrastructure/email/
├── EmailService.java              # Główny serwis email
├── EmailProvider.java             # Interface dla dostawców
├── SendGridEmailProvider.java     # Implementacja SendGrid
├── SesEmailProvider.java          # Implementacja AWS SES
├── MailgunEmailProvider.java      # Implementacja Mailgun
└── SmtpEmailProvider.java         # Implementacja SMTP
```

**Kluczowe klasy:**

```java
// EmailService.java - główny serwis
@Service
@RequiredArgsConstructor
public class EmailService {
    private final EmailProvider emailProvider;
    private final NotificationRepository notificationRepository;
    
    public void sendEmail(EmailRequest request) {
        // Walidacja
        // Logowanie do bazy
        // Wysyłka przez providera
        // Handle bounce/complaint
    }
}

// SendGridEmailProvider.java
@Component
@ConditionalOnProperty(value = "kptest.email.provider", havingValue = "sendgrid")
public class SendGridEmailProvider implements EmailProvider {
    private final SendGrid sendGrid;
    
    @Override
    public EmailResponse send(EmailRequest request) {
        // Implementacja SendGrid API
    }
}
```

### 5. Testing

#### Send test email via API

```bash
# Pobierz token administratora
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Wyślij testowy email
curl -X POST http://localhost:8080/api/v1/admin/test-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@email.com",
    "subject": "KPTEST - Test Email",
    "body": "This is a test email from KPTEST system",
    "template": "welcome",
    "variables": {
      "userName": "Test User",
      "activationLink": "http://localhost:4200/activate/123"
    }
  }'
```

#### Unit Tests

```bash
# Uruchom testy jednostkowe
cd backend
./mvnw test -Dtest=EmailServiceTest
./mvnw test -Dtest=SendGridEmailProviderTest
```

#### Integration Tests

```bash
# Uruchom testy integracyjne z mockiem
./mvnw test -Dtest=EmailIntegrationTest -Dspring.profiles.active=test
```

---

## SMS Integration

### 1. Choose Provider

Dostępne opcje dostawców usług SMS:

| Provider | Recommended | Poland Support | Pricing | Best For |
|----------|-------------|----------------|---------|----------|
| **Twilio** | ✅ Yes | ✅ Yes | ~$0.07/SMS | Global apps |
| SMSAPI | ✅ Yes (PL) | ✅ Native | ~0.05 PLN/SMS | Polish market |
| Vonage (Nexmo) | No | ✅ Yes | ~$0.06/SMS | Enterprise |
| MessageBird | No | ✅ Yes | ~$0.065/SMS | Multi-channel |

**Recommendation:** 
- **Twilio** - dla aplikacji z międzynarodowymi użytkownikami
- **SMSAPI** - dla rynku polskiego (niższe koszty, polskie wsparcie)

### 2. Configuration

Dodaj konfigurację do pliku `application.yml`:

```yaml
# backend/src/main/resources/application.yml
kptest:
  sms:
    enabled: true
    provider: twilio
    account-sid: ${TWILIO_ACCOUNT_SID}
    auth-token: ${TWILIO_AUTH_TOKEN}
    from-number: ${TWILIO_PHONE_NUMBER}
    
    # Poland-specific (SMSAPI)
    # provider: smsapi
    # username: ${SMSAPI_USERNAME}
    # password: ${SMSAPI_PASSWORD}
    
    # Rate limiting
    rate-limit:
      enabled: true
      max-per-hour: 10
      max-per-day: 50
    
    # Retry configuration
    retry:
      max-attempts: 2
      delay-ms: 2000
    
    # Message settings
    message:
      max-length: 160
      encoding: GSM-7
      sender-name: KPTEST
```

### 3. Environment Variables

Skonfiguruj zmienne środowiskowe:

```bash
# .env
# Twilio configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SMSAPI configuration (alternative)
SMSAPI_USERNAME=your-username
SMSAPI_PASSWORD=your-password
SMSAPI_SENDER_NAME=KPTEST
```

**Production (AWS Secrets Manager):**

```bash
aws secretsmanager create-secret \
  --name kptest/sms/twilio \
  --secret-string '{
    "accountSid": "ACxxxxxxxxxxxxx",
    "authToken": "your-auth-token",
    "phoneNumber": "+1234567890"
  }'
```

### 4. Implementation

SMS service jest już zaimplementowany w następujących plikach:

```
backend/src/main/java/com/kptest/infrastructure/sms/
├── SmsService.java              # Główny serwis SMS
├── SmsProvider.java             # Interface dla dostawców
├── TwilioSmsProvider.java       # Implementacja Twilio
├── SmsApiProvider.java          # Implementacja SMSAPI
└── VonageSmsProvider.java       # Implementacja Vonage
```

**Kluczowe klasy:**

```java
// SmsService.java - główny serwis
@Service
@RequiredArgsConstructor
public class SmsService {
    private final SmsProvider smsProvider;
    private final NotificationRepository notificationRepository;
    
    public void sendSms(SmsRequest request) {
        // Walidacja numeru telefonu (E.164)
        // Sprawdzenie limitów
        // Logowanie do bazy
        // Wysyłka przez providera
        // Handle delivery status
    }
    
    public void sendVerificationCode(String phoneNumber) {
        // Generowanie 6-cyfrowego kodu
        // Wysyłka SMS
        // Zapis w cache (5 min expiry)
    }
}

// TwilioSmsProvider.java
@Component
@ConditionalOnProperty(value = "kptest.sms.provider", havingValue = "twilio")
public class TwilioSmsProvider implements SmsProvider {
    private final TwilioRestClient client;
    
    @Override
    public SmsResponse send(SmsRequest request) {
        // Implementacja Twilio API
    }
}
```

### 5. Testing

#### Send test SMS via API

```bash
# Pobierz token administratora
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Wyślij testowy SMS
curl -X POST http://localhost:8080/api/v1/admin/test-sms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+48123456789",
    "message": "KPTEST - Test SMS message"
  }'
```

#### Send verification code

```bash
curl -X POST http://localhost:8080/api/v1/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+48123456789"}'
```

#### Unit Tests

```bash
# Uruchom testy jednostkowe
cd backend
./mvnw test -Dtest=SmsServiceTest
./mvnw test -Dtest=TwilioSmsProviderTest
```

---

## Notification Templates

### Email Templates

Lokalizacja: `backend/src/main/resources/templates/email/`

```
templates/email/
├── welcome.html                 # Powitanie nowego użytkownika
├── password-reset.html          # Reset hasła
├── email-verification.html      # Weryfikacja email
├── event-reminder.html          # Przypomnienie o wydarzeniu
├── new-message.html             # Nowa wiadomość
├── new-material.html            # Nowy materiał
├── appointment-confirm.html     # Potwierdzenie wizyty
├── appointment-reminder.html    # Przypomnienie wizyty
└── weekly-summary.html          # Tygodniowe podsumowanie
```

**Przykład szablonu:**

```html
<!-- welcome.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Witaj w KPTEST!</title>
</head>
<body>
    <div class="container">
        <h1>Witaj <span th:text="${userName}">Użytkowniku</span>!</h1>
        <p>Dziękujemy za rejestrację w systemie KPTEST.</p>
        <p>Aby aktywować konto, kliknij poniżej:</p>
        <a th:href="${activationLink}" class="button">Aktywuj konto</a>
        <p>Link wygaśnie za 24 godziny.</p>
    </div>
</body>
</html>
```

**Zmienne dostępne w szablonach:**

| Template | Variables |
|----------|-----------|
| welcome | userName, activationLink, expiryHours |
| password-reset | userName, resetCode, expiryMinutes |
| event-reminder | eventName, eventDate, eventLocation |
| new-message | senderName, messagePreview, inboxLink |
| new-material | materialName, courseName, materialLink |

### SMS Templates

Lokalizacja: `backend/src/main/resources/templates/sms/`

```
templates/sms/
├── password-reset.txt           # Kod resetu hasła
├── email-verification.txt       # Kod weryfikacji email
├── event-reminder.txt           # Przypomnienie (krótkie)
├── appointment-confirm.txt      # Potwierdzenie wizyty
└── verification-code.txt        # Kod weryfikacyjny
```

**Przykłady szablonów:**

```txt
# password-reset.txt
KPTEST: Twój kod resetu hasła to: {resetCode}. Ważny przez {expiryMinutes} min.

# verification-code.txt
KPTEST: Twój kod weryfikacyjny to: {code}. Nie udostępniaj go nikomu.

# event-reminder.txt
KPTEST: Przypomnienie - {eventName} jutro o {eventTime}. {location}
```

---

## User Preferences

### Configuration Endpoint

Użytkownicy mogą konfigurować preferencje powiadomień:

```http
PUT /api/v1/notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00",
    "timezone": "Europe/Warsaw"
  },
  "categories": {
    "messages": true,
    "events": true,
    "materials": false,
    "reminders": true,
    "systemAnnouncements": true,
    "marketing": false
  },
  "frequency": {
    "instant": ["messages", "reminders"],
    "daily": [],
    "weekly": ["materials", "events"]
  }
}
```

**Response:**

```json
{
  "id": "pref_123456",
  "userId": "user_789",
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00",
    "timezone": "Europe/Warsaw"
  },
  "categories": {
    "messages": true,
    "events": true,
    "materials": false,
    "reminders": true,
    "systemAnnouncements": true,
    "marketing": false
  },
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-04-24T14:20:00Z"
}
```

### Get Preferences

```http
GET /api/v1/notifications/preferences
Authorization: Bearer {token}
```

### Available Categories

| Category | Description | Default |
|----------|-------------|---------|
| messages | Nowe wiadomości od innych użytkowników | ON |
| events | Przypomnienia o wydarzeniach i terminach | ON |
| materials | Nowe materiały edukacyjne | OFF |
| reminders | Przypomnienia o zadaniach | ON |
| systemAnnouncements | Komunikaty systemowe | ON |
| marketing | Materiały marketingowe i promocje | OFF |

---

## Cost Estimation

### Email (SendGrid)

| Plan | Price | Monthly Emails | Cost per 1k |
|------|-------|----------------|-------------|
| Free | $0 | 3,000 (100/day) | $0 |
| Essentials | $15 | 50,000 | $0.30 |
| Plus | $89 | 100,000 | $0.89 |
| Pro | $195 | 150,000+ | $1.30+ |

**Recommended for KPTEST:**
- Plan: **Essentials** ($15/month)
- Estimated usage: ~5,000 emails/month
  - Welcome emails: 500/month (new users)
  - Password resets: 200/month
  - Event reminders: 2,000/month
  - New messages: 1,500/month
  - New materials: 500/month
  - Weekly summaries: 300/month

**Annual cost: $180**

### SMS (Twilio)

| Country | Price per SMS |
|---------|---------------|
| Poland (PL) | $0.072 |
| Germany (DE) | $0.075 |
| UK | $0.055 |
| USA | $0.0075 |

**Recommended for KPTEST:**
- Estimated usage: ~500 SMS/month (critical only)
  - Verification codes: 300/month
  - Password resets: 100/month
  - Critical reminders: 100/month

**Monthly cost: ~$36**
**Annual cost: ~$432**

### SMS (SMSAPI - Polish Provider)

| Package | Price | SMS Count | Cost per SMS |
|---------|-------|-----------|--------------|
| Pay-as-you-go | $0 | - | ~0.05 PLN ($0.012) |
| 1000 SMS | ~$50 | 1,000 | ~$0.05 |
| 5000 SMS | ~$200 | 5,000 | ~$0.04 |

**Recommended for KPTEST (Polish market):**
- Package: Pay-as-you-go
- Estimated usage: ~500 SMS/month
- **Monthly cost: ~$6**
- **Annual cost: ~$72**

### Total Cost Summary

| Provider | Monthly | Annual |
|----------|---------|--------|
| **SendGrid + Twilio** | $51 | $612 |
| **SendGrid + SMSAPI** | $21 | $252 |

**Recommendation:** Dla rynku polskiego wybierz **SMSAPI** - oszczędność ~$360/rok.

---

## Compliance

### RODO/GDPR

#### Legal Requirements

1. **Consent Management**
   ```java
   // Record consent for each notification channel
   Consent consent = new Consent();
   consent.setUserId(userId);
   consent.setChannel(NotificationChannel.EMAIL);
   consent.setGranted(true);
   consent.setIpAddress(request.getRemoteAddr());
   consent.setUserAgent(request.getHeader("User-Agent"));
   consent.setTimestamp(Instant.now());
   consentRepository.save(consent);
   ```

2. **Right to Opt-Out**
   - Każdy email musi zawierać link do wypisania się
   - SMS musi zawierać instrukcję STOP
   - Preferencje muszą być łatwo dostępne w panelu użytkownika

3. **Notification Logging**
   ```sql
   CREATE TABLE notification_logs (
       id UUID PRIMARY KEY,
       user_id UUID NOT NULL,
       channel VARCHAR(20) NOT NULL,
       template VARCHAR(100),
       status VARCHAR(20),
       sent_at TIMESTAMP,
       delivered_at TIMESTAMP,
       opened_at TIMESTAMP,
       clicked_at TIMESTAMP,
       bounced_at TIMESTAMP,
       complaint_at TIMESTAMP,
       retention_until TIMESTAMP GENERATED ALWAYS AS (sent_at + INTERVAL '3 years')
   );
   ```

4. **Data Retention**
   - Logi powiadomień: **3 lata**
   - Consenty: **3 lata od wycofania**
   - Treści powiadomień: **90 dni**

### Security

#### API Keys Management

```bash
# Development
export SENDGRID_API_KEY="SG.xxxxx"
export TWILIO_ACCOUNT_SID="ACxxxxx"

# Production (AWS Secrets Manager)
aws secretsmanager create-secret \
  --name kptest/notifications/sendgrid \
  --secret-string '{"apiKey":"SG.xxxxx"}'

# Rotate keys every 90 days
aws secretsmanager rotate-secret \
  --secret-id kptest/notifications/sendgrid
```

#### HTTPS Requirements

```yaml
# Force HTTPS for all notification API calls
kptest:
  email:
    require-ssl: true
  sms:
    require-ssl: true
```

#### Rate Limiting

```yaml
# Per-user rate limits
kptest:
  notifications:
    rate-limit:
      email:
        per-hour: 10
        per-day: 50
      sms:
        per-hour: 3
        per-day: 10
```

#### Audit Logging

```java
@EventListener
public void onNotificationSent(NotificationSentEvent event) {
    auditLogService.log(
        AuditAction.NOTIFICATION_SENT,
        event.getUserId(),
        Map.of(
            "channel", event.getChannel(),
            "template", event.getTemplate(),
            "recipient", event.getRecipient(),
            "timestamp", event.getTimestamp()
        )
    );
}
```

---

## Troubleshooting

### Email not sending

#### 1. Check API Key Validity

```bash
# Test SendGrid API key
curl -X GET "https://api.sendgrid.com/v3/user/account" \
  -H "Authorization: Bearer $SENDGRID_API_KEY"

# Expected: 200 OK with account details
# 401: Invalid API key
# 403: Key lacks permissions
```

#### 2. Check Application Logs

```bash
# Search for email errors
grep -i "email" backend/logs/application.log | tail -50
grep -i "sendgrid" backend/logs/application.log | tail -50
```

#### 3. Verify Domain Configuration

```bash
# Check SPF record
dig TXT kptest.com | grep "v=spf1"

# Check DKIM record
dig TXT sendgrid._domainkey.kptest.com

# Expected: Include SendGrid in SPF, DKIM public key
```

**SPF Record Example:**
```
kptest.com. IN TXT "v=spf1 include:sendgrid.net ~all"
```

#### 4. Check SendGrid Dashboard

1. Login to https://app.sendgrid.com
2. Navigate to **Email API** → **Stats**
3. Check for:
   - Bounces
   - Blocks
   - Invalid emails
   - Spam reports

#### 5. Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Regenerate API key |
| 403 Forbidden | Check key permissions |
| 500 Server Error | Check from-email domain |
| Emails to spam | Configure SPF/DKIM/DMARC |
| Rate limited | Reduce send frequency |

### SMS not sending

#### 1. Check Account Balance

```bash
# Twilio
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"

# Check balance in response
```

#### 2. Verify Phone Number Format

```java
// Must be E.164 format
// Valid: +48123456789, +14155551234
// Invalid: 123456789, 48 123 456 789

public boolean isValidPhoneNumber(String phoneNumber) {
    return phoneNumber.matches("^\\+[1-9]\\d{6,14}$");
}
```

#### 3. Check Twilio Dashboard

1. Login to https://console.twilio.com
2. Navigate to **Messaging** → **Logs**
3. Check for:
   - Failed deliveries
   - Carrier blocks
   - Account suspension

#### 4. Verify Sender Number

```bash
# Check if sender number is active
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers/$TWILIO_PHONE_NUMBER.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

#### 5. Common Issues

| Issue | Solution |
|-------|----------|
| 21211 Invalid number | Format as E.164 (+48...) |
| 21608 Unverified number | Verify in Twilio console |
| 21610 SMS disabled | Enable SMS capability |
| 30003 Unreachable | Check carrier routing |
| 30005 Unknown destination | Invalid country code |

### Debug Mode

Enable debug logging for troubleshooting:

```yaml
# application-debug.yml
logging:
  level:
    com.kptest.infrastructure.email: DEBUG
    com.kptest.infrastructure.sms: DEBUG
    com.sendgrid: DEBUG
    com.twilio: DEBUG
```

```bash
# Run with debug profile
java -jar backend/target/kptest.jar --spring.profiles.active=debug
```

---

## Support

### External Provider Support

| Provider | Support Channel | Response Time |
|----------|-----------------|---------------|
| **SendGrid** | support@sendgrid.com | 24-48 hours |
| SendGrid Premium | priority@sendgrid.com | 1-4 hours |
| **Twilio** | support@twilio.com | 24-48 hours |
| Twilio Premium | priority@twilio.com | 1 hour |
| **SMSAPI** | pomoc@smsapi.pl | 2-24 hours |

### Internal Support

| Issue Type | Contact | SLA |
|------------|---------|-----|
| Technical issues | kptest-tech@kptest.com | 24 hours |
| Business questions | kptest-support@kptest.com | 48 hours |
| Security incidents | security@kptest.com | 1 hour |
| Compliance/RODO | rodo@kptest.com | 24 hours |

### Escalation Path

1. **Level 1**: Check documentation and logs
2. **Level 2**: Contact provider support
3. **Level 3**: Internal technical team
4. **Level 4**: Provider escalation (premium only)

### Useful Links

- [SendGrid Documentation](https://docs.sendgrid.com)
- [Twilio Documentation](https://www.twilio.com/docs)
- [SMSAPI Documentation](https://www.smsapi.pl/docs)
- [GDPR Guidelines for Email](https://gdpr.eu/email-marketing/)
- [E.164 Phone Number Format](https://www.itu.int/rec/T-REC-E.164)

---

## Appendix

### A. Quick Start Checklist

- [ ] Choose email provider (SendGrid recommended)
- [ ] Create account and verify domain
- [ ] Generate API key
- [ ] Add configuration to application.yml
- [ ] Add secrets to environment/secrets manager
- [ ] Test email sending
- [ ] Choose SMS provider (Twilio or SMSAPI)
- [ ] Create account and verify phone numbers
- [ ] Add configuration to application.yml
- [ ] Test SMS sending
- [ ] Configure notification templates
- [ ] Set up user preferences endpoint
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Test RODO compliance (opt-out, consent)

### B. Environment Variables Template

```bash
# .env.example
# Email Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
EMAIL_FROM=noreply@kptest.com
EMAIL_FROM_NAME=KPTEST System

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SMS Configuration (SMSAPI - alternative)
SMSAPI_USERNAME=your-username
SMSAPI_PASSWORD=your-password
SMSAPI_SENDER_NAME=KPTEST
```

### C. API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/notifications/email` | Send email notification |
| POST | `/api/v1/notifications/sms` | Send SMS notification |
| PUT | `/api/v1/notifications/preferences` | Update user preferences |
| GET | `/api/v1/notifications/preferences` | Get user preferences |
| POST | `/api/v1/admin/test-email` | Send test email (admin) |
| POST | `/api/v1/admin/test-sms` | Send test SMS (admin) |
| POST | `/api/v1/auth/send-verification-code` | Send verification code |
| POST | `/api/v1/auth/verify-code` | Verify code |

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-24  
**Author:** Technical Writing Team  
**Review Date:** 2026-07-24
