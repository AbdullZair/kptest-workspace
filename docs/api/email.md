# Email API Documentation

## Overview

The Email API provides endpoints for sending email notifications to patients and staff. This implements **funk.42** requirement for email notifications as an alternative communication channel.

## Configuration

### Environment Variables

```yaml
email:
  sendgrid:
    enabled: false                    # Enable/disable email provider
    api-key: ${SENDGRID_API_KEY}
    from-email: noreply@kptest.com
    from-name: KPTEST System
```

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Notification   │────▶│ EmailService │────▶│ EmailProvider   │
│   Controller    │     │              │     │ (SendGrid)      │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Interfaces

### EmailProvider

```java
public interface EmailProvider {
    boolean send(String to, String subject, String body);
    boolean sendHtml(String to, String subject, String htmlBody);
    boolean sendTemplate(String to, String templateName, Map<String, Object> variables);
    boolean sendWithAttachment(String to, String subject, String body, 
                               String attachmentName, byte[] attachmentContent);
    int sendBulk(List<String> to, String subject, String body);
    boolean isAvailable();
    String getProviderName();
}
```

## Email Service Methods

### Send Welcome Email

```java
boolean sendWelcomeEmail(String to, String patientName)
```

**Usage:** Send welcome email to newly registered patients.

**Example:**
```java
emailService.sendWelcomeEmail("patient@example.com", "Jan Kowalski");
```

**Subject:** `Witaj w systemie KPTEST - Aktywacja konta`

---

### Send Appointment Reminder

```java
boolean sendAppointmentReminder(
    String to,
    String patientName,
    LocalDateTime appointmentDate,
    String appointmentType,
    String location,
    String therapistName
)
```

**Usage:** Send appointment reminders (implements **ww.42**).

**Example:**
```java
emailService.sendAppointmentReminder(
    "patient@example.com",
    "Jan Kowalski",
    LocalDateTime.of(2026, 4, 25, 10, 30),
    "Wizyta kontrolna",
    "Gabinet 101",
    "Dr Nowak"
);
```

**Subject:** `PRZYPOMNIENIE: Nadchodząca wizyta - Wizyta kontrolna`

---

### Send New Message Notification

```java
boolean sendNewMessageNotification(
    String to,
    String staffName,
    String senderName,
    String messagePreview,
    String threadUrl
)
```

**Usage:** Notify staff about new messages from patients (implements **ww.34**).

**Example:**
```java
emailService.sendNewMessageNotification(
    "staff@kptest.com",
    "Dr Nowak",
    "Jan Kowalski",
    "Pilna sprawa dotycząca terapii",
    "https://kptest.com/messages/123"
);
```

**Subject:** `NOWA WIADOMOŚĆ od: Jan Kowalski`

---

### Send Project Assignment Notification

```java
boolean sendProjectAssignmentNotification(
    String to,
    String patientName,
    String projectName,
    String coordinatorName
)
```

**Usage:** Notify patient about project assignment (implements **ww.25**).

**Example:**
```java
emailService.sendProjectAssignmentNotification(
    "patient@example.com",
    "Jan Kowalski",
    "Terapia Słuchowa 2026",
    "Mgr Nowak"
);
```

**Subject:** `Przypisanie do projektu terapeutycznego: Terapia Słuchowa 2026`

---

### Send Password Reset Email

```java
boolean sendPasswordResetEmail(String to, String userName, String resetLink)
```

**Usage:** Send password reset link.

**Example:**
```java
emailService.sendPasswordResetEmail(
    "user@example.com",
    "Jan Kowalski",
    "https://kptest.com/reset/abc123"
);
```

**Subject:** `Reset hasła - KPTEST`

---

### Send Low Adherence Alert

```java
boolean sendLowAdherenceAlert(
    String to,
    String staffName,
    String patientName,
    double complianceRate,
    double threshold
)
```

**Usage:** Alert staff about patients with low adherence (implements **ww.52**).

**Example:**
```java
emailService.sendLowAdherenceAlert(
    "staff@kptest.com",
    "Dr Nowak",
    "Jan Kowalski",
    45.5,
    60.0
);
```

**Subject:** `ALERT: Niska adherencja pacjenta - Jan Kowalski`

---

### Send New Material Notification

```java
boolean sendNewMaterialNotification(
    String to,
    String patientName,
    String materialTitle,
    String projectName
)
```

**Usage:** Notify patients about new educational materials (implements **ww.34**).

**Example:**
```java
emailService.sendNewMaterialNotification(
    "patient@example.com",
    "Jan Kowalski",
    "Ćwiczenia słuchowe - etap 1",
    "Terapia Słuchowa 2026"
);
```

**Subject:** `NOWY MATERIAŁ edukacyjny: Ćwiczenia słuchowe - etap 1`

---

### Send HTML Email

```java
boolean sendHtml(String to, String subject, String htmlContent)
```

**Usage:** Send HTML-formatted emails.

**Example:**
```java
String html = "<html><body><h1>Witaj!</h1></body></html>";
emailService.sendHtml("patient@example.com", "Witaj", html);
```

---

### Send Template Email

```java
boolean sendTemplate(String to, String templateName, Map<String, Object> variables)
```

**Usage:** Send emails using predefined templates.

**Example:**
```java
Map<String, Object> vars = Map.of(
    "name", "Jan Kowalski",
    "project", "Terapia Słuchowa"
);
emailService.sendTemplate("patient@example.com", "welcome_template", vars);
```

---

### Send Bulk Email

```java
int sendBulk(List<String> to, String subject, String body)
```

**Usage:** Send emails to multiple recipients.

**Example:**
```java
List<String> recipients = List.of("a@example.com", "b@example.com");
int count = emailService.sendBulk(recipients, "Newsletter", "Treść");
```

---

## Provider Implementation

### SendGridEmailProvider

Production-ready SendGrid integration.

**Features:**
- Plain text and HTML emails
- Template support with variables
- Attachment support
- Bulk email sending
- Configurable via environment variables

**Configuration:**
```properties
email.sendgrid.enabled=true
email.sendgrid.api-key=SG.xxxxxx
email.sendgrid.from-email=noreply@kptest.com
email.sendgrid.from-name=KPTEST System
```

---

## Security Considerations

1. **Email Validation:** Validate email format before sending
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **SPF/DKIM:** Configure SPF and DKIM records for domain
4. **Consent:** Ensure patient consent for email communications (RODO compliance)
5. **Unsubscribe:** Include unsubscribe option in marketing emails

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Provider disabled | Returns `false`, logs warning |
| Null/empty email | Returns `false`, logs error |
| Null/empty subject | Returns `false`, logs error |
| API failure | Returns `false`, logs exception |

---

## Testing

### Unit Tests

```bash
./gradlew test --tests "EmailServiceTest"
./gradlew test --tests "SendGridEmailProviderTest"
```

### Test Coverage

- `EmailServiceTest`: 14 tests
- `SendGridEmailProviderTest`: 15 tests

---

## Related Requirements

| Requirement | Description |
|-------------|-------------|
| **funk.42** | Email notifications as alternative channel |
| **ww.25** | Notify patient about project assignment |
| **ww.34** | Notify about new messages/materials |
| **ww.42** | Configuration of reminders |
| **ww.52** | Identify patients with low adherence |
| **sec.01** | RODO compliance for data processing |

---

**Last Updated:** 2026-04-24  
**Version:** 1.0.0
