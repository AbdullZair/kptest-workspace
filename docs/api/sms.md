# SMS API Documentation

## Overview

The SMS API provides endpoints for sending SMS notifications to patients and staff. This implements **funk.43** requirement for SMS notifications for critical reminders.

## Configuration

### Environment Variables

```yaml
sms:
  twilio:
    enabled: false                    # Enable/disable SMS provider
    account-sid: ${TWILIO_ACCOUNT_SID}
    auth-token: ${TWILIO_AUTH_TOKEN}
    from-number: ${TWILIO_FROM_NUMBER}
```

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Notification   │────▶│  SmsService  │────▶│  SmsProvider    │
│   Controller    │     │              │     │  (Twilio)       │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Interfaces

### SmsProvider

```java
public interface SmsProvider {
    boolean send(String phoneNumber, String message);
    boolean send(String phoneNumber, String message, String senderId);
    boolean isAvailable();
    String getProviderName();
}
```

## SMS Service Methods

### Send Critical Reminder

```java
boolean sendCriticalReminder(String phoneNumber, String message)
```

**Usage:** Send critical reminders to patients.

**Example:**
```java
smsService.sendCriticalReminder("+48123456789", "Przypomnienie o wizycie jutro o 10:00");
```

---

### Send Appointment Reminder

```java
boolean sendAppointmentReminder(
    String phoneNumber,
    LocalDateTime appointmentDate,
    String appointmentType,
    String location
)
```

**Usage:** Send formatted appointment reminders.

**Example:**
```java
smsService.sendAppointmentReminder(
    "+48123456789",
    LocalDateTime.of(2026, 4, 25, 10, 30),
    "Wizyta kontrolna",
    "Gabinet 101"
);
```

**Message Format:**
```
PRZYPOMNIENIE: Wizyta (Wizyta kontrolna) dnia 2026-04-25 o godz. 10:30. Lokalizacja: Gabinet 101. W razie pytan tel: 123-456-789
```

---

### Send Verification Code

```java
boolean sendVerificationCode(String phoneNumber, String code)
```

**Usage:** Send 2FA or password reset verification codes.

**Example:**
```java
smsService.sendVerificationCode("+48123456789", "123456");
```

**Message Format:**
```
KPTEST: Twoj kod weryfikacyjny to: 123456. Wazny przez 10 minut. Nie udostepniaj nikomu.
```

---

### Send Password Reset Confirmation

```java
boolean sendPasswordResetConfirmation(String phoneNumber)
```

**Usage:** Confirm password reset operation.

**Example:**
```java
smsService.sendPasswordResetConfirmation("+48123456789");
```

---

### Send Project Assignment Notification

```java
boolean sendProjectAssignmentNotification(String phoneNumber, String projectName)
```

**Usage:** Notify patient about project assignment (implements **ww.25**).

**Example:**
```java
smsService.sendProjectAssignmentNotification("+48123456789", "Terapia Słuchowa 2026");
```

---

### Send Bulk SMS

```java
int sendBulk(List<String> phoneNumbers, String message)
```

**Usage:** Send SMS to multiple recipients.

**Example:**
```java
List<String> numbers = List.of("+48123456789", "+48987654321");
int successCount = smsService.sendBulk(numbers, "Wiadomość grupowa");
```

**Returns:** Number of successfully sent messages.

---

## Provider Implementation

### TwilioSmsProvider

Production-ready Twilio integration.

**Features:**
- Configurable via environment variables
- Phone number masking for logs
- Sender ID support
- Availability check

**Configuration:**
```properties
sms.twilio.enabled=true
sms.twilio.account-sid=ACxxxxxxxxxxxxx
sms.twilio.auth-token=your_auth_token
sms.twilio.from-number=+48000000000
```

---

## Security Considerations

1. **Phone Number Validation:** All phone numbers should be in international format (+48...)
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **Logging:** Phone numbers are masked in logs (showing only last 4 digits)
4. **Consent:** Ensure patient consent for SMS communications (RODO compliance)

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Provider disabled | Returns `false`, logs warning |
| Null/empty phone | Returns `false`, logs error |
| Null/empty message | Returns `false`, logs error |
| API failure | Returns `false`, logs exception |

---

## Testing

### Unit Tests

```bash
./gradlew test --tests "SmsServiceTest"
./gradlew test --tests "TwilioSmsProviderTest"
```

### Test Coverage

- `SmsServiceTest`: 14 tests
- `TwilioSmsProviderTest`: 12 tests

---

## Related Requirements

| Requirement | Description |
|-------------|-------------|
| **funk.43** | SMS notifications for critical reminders |
| **ww.25** | Notify patient about project assignment |
| **sec.01** | RODO compliance for data processing |

---

## API Endpoints (via Notification Controller)

SMS functionality is accessed through the Notification Controller:

```
POST /api/v1/notifications/test
```

With SMS-specific preferences:
```json
{
  "userId": "uuid",
  "type": "REMINDER",
  "title": "Appointment Reminder",
  "content": "Your appointment is tomorrow",
  "sendSms": true,
  "sendEmail": false,
  "sendPush": true
}
```

---

**Last Updated:** 2026-04-24  
**Version:** 1.0.0
