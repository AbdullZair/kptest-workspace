# Email Provider Setup Guide

## Overview

This guide describes how to configure and manage email notifications in the KPTEST system using SendGrid as the primary email provider.

## Prerequisites

- SendGrid account (https://sendgrid.com)
- Verified sender domain or email
- API key with appropriate permissions

## Configuration

### Environment Variables

```bash
# Email Provider Configuration
EMAIL_PROVIDER=sendgrid
EMAIL_SENDGRID_ENABLED=true
EMAIL_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_SENDGRID_FROM_EMAIL=noreply@kptest.com
EMAIL_SENDGRID_FROM_NAME=KPTEST System

# Optional: Reply-to address
EMAIL_SENDGRID_REPLY_TO=kontakt@kptest.com
```

### Application Properties

```properties
# Email Configuration
email.provider=sendgrid
email.sendgrid.enabled=true
email.sendgrid.api-key=${EMAIL_SENDGRID_API_KEY}
email.sendgrid.from-email=${EMAIL_SENDGRID_FROM_EMAIL}
email.sendgrid.from-name=${EMAIL_SENDGRID_FROM_NAME}
email.sendgrid.reply-to=${EMAIL_SENDGRID_REPLY_TO}

# Rate Limiting
email.rate-limit.per-minute=60
email.rate-limit.per-hour=500

# Retry Configuration
email.retry.max-attempts=3
email.retry.delay-ms=2000
```

## SendGrid Setup

### Step 1: Create SendGrid Account

1. Visit https://sendgrid.com
2. Click "Sign Up Free"
3. Complete registration
4. Verify email address

### Step 2: Verify Sender

#### Option A: Single Sender Verification

1. Navigate to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in sender details:
   - From Email: noreply@kptest.com
   - From Name: KPTEST System
   - Reply-To: kontakt@kptest.com
4. Click verification link sent to email

#### Option B: Domain Authentication (Recommended)

1. Navigate to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Enter domain: kptest.com
4. Add DNS records to your domain:
   ```
   Type: CNAME
   Host: em1234.kptest.com
   Value: u1234.wl123.sendgrid.net
   
   Type: CNAME
   Host: email.kptest.com
   Value: tx.sendgrid.net
   
   Type: CNAME
   Host: s1._domainkey.kptest.com
   Value: s1.domainkey.u1234.sendgrid.net
   ```
5. Wait for DNS propagation (up to 48 hours)
6. Click **Verify**

### Step 3: Create API Key

1. Navigate to **Settings** → **API Keys**
2. Click **Create API Key**
3. Enter name: "KPTEST Production"
4. Select permissions:
   - **Mail Send**: Full Access
   - **Templates**: Read Only (if using templates)
5. Click **Create & View**
6. **Copy the API key immediately** (won't be shown again)

### Step 4: Configure IP Access Management (Optional)

For additional security:

1. Navigate to **Settings** → **IP Access Management**
2. Add your server IPs to allowed list
3. Enable IP Access for API key

## Implementation

### Email Provider Interface

```java
public interface EmailProvider {
    /**
     * Send plain text email
     */
    boolean send(String to, String subject, String body);
    
    /**
     * Send HTML email
     */
    boolean sendHtml(String to, String subject, String htmlBody);
    
    /**
     * Send email using template
     */
    boolean sendTemplate(String to, String templateName, Map<String, Object> variables);
    
    /**
     * Send email with attachment
     */
    boolean sendWithAttachment(String to, String subject, String body,
                               String attachmentName, byte[] attachmentContent);
    
    /**
     * Send bulk emails
     */
    int sendBulk(List<String> to, String subject, String body);
    
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

### SendGrid Implementation

```java
@Service
@Slf4j
public class SendGridEmailProvider implements EmailProvider {
    
    @Autowired
    private SendGridConfiguration sendGridConfig;
    
    private final SendGrid sendGrid;
    
    public SendGridEmailProvider(SendGridConfiguration config) {
        this.sendGridConfig = config;
        this.sendGrid = new SendGrid(config.getApiKey());
    }
    
    @Override
    public boolean send(String to, String subject, String body) {
        return sendHtml(to, subject, convertToHtml(body));
    }
    
    @Override
    public boolean sendHtml(String to, String subject, String htmlBody) {
        if (!sendGridConfig.isEnabled()) {
            log.warn("Email provider disabled, skipping send");
            return false;
        }
        
        try {
            Email from = new Email(sendGridConfig.getFromEmail(), 
                                   sendGridConfig.getFromName());
            Email toEmail = new Email(to);
            Content content = new Content("text/html", htmlBody);
            
            Mail mail = new Mail(from, subject, toEmail, content);
            mail.setReplyTo(new Email(sendGridConfig.getReplyTo()));
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() == 202) {
                log.info("Email sent successfully to {}", maskEmail(to));
                return true;
            } else {
                log.error("Failed to send email to {}: {}", 
                    maskEmail(to), response.getStatusCode());
                return false;
            }
            
        } catch (IOException e) {
            log.error("Failed to send email to {}: {}", 
                maskEmail(to), e.getMessage());
            return false;
        }
    }
    
    @Override
    public boolean sendTemplate(String to, String templateName, 
                                 Map<String, Object> variables) {
        try {
            Email from = new Email(sendGridConfig.getFromEmail(),
                                   sendGridConfig.getFromName());
            Email toEmail = new Email(to);
            
            Mail mail = new Mail();
            mail.setFrom(from);
            mail.setSubject("{{subject}}");
            mail.addPersonalization(new Personalization() {{
                addTo(toEmail);
                variables.forEach(this::addDynamicTemplateData);
            }});
            mail.setTemplateId(getTemplateId(templateName));
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            return response.getStatusCode() == 202;
            
        } catch (IOException e) {
            log.error("Failed to send template email to {}: {}", 
                maskEmail(to), e.getMessage());
            return false;
        }
    }
    
    @Override
    public boolean sendWithAttachment(String to, String subject, String body,
                                       String attachmentName, 
                                       byte[] attachmentContent) {
        try {
            Email from = new Email(sendGridConfig.getFromEmail(),
                                   sendGridConfig.getFromName());
            Email toEmail = new Email(to);
            Content content = new Content("text/html", body);
            
            Mail mail = new Mail(from, subject, toEmail, content);
            
            // Add attachment (base64 encoded)
            String base64Content = Base64.getEncoder()
                .encodeToString(attachmentContent);
            Attachment attachment = new Attachment();
            attachment.setContent(base64Content);
            attachment.setType("application/pdf");
            attachment.setFilename(attachmentName);
            attachment.setDisposition("attachment");
            mail.addAttachment(attachment);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            return response.getStatusCode() == 202;
            
        } catch (IOException e) {
            log.error("Failed to send email with attachment to {}: {}", 
                maskEmail(to), e.getMessage());
            return false;
        }
    }
    
    @Override
    public int sendBulk(List<String> recipients, String subject, String body) {
        int successCount = 0;
        
        for (String to : recipients) {
            if (send(to, subject, body)) {
                successCount++;
            }
            // Small delay to avoid rate limiting
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        return successCount;
    }
    
    @Override
    public boolean isAvailable() {
        return sendGridConfig.isEnabled();
    }
    
    @Override
    public String getProviderName() {
        return "SendGrid";
    }
    
    private String convertToHtml(String plainText) {
        return String.format(
            "<html><body style='font-family: Arial, sans-serif;'>%s</body></html>",
            plainText.replace("\n", "<br>")
        );
    }
    
    private String getTemplateId(String templateName) {
        // Map template names to SendGrid template IDs
        Map<String, String> templateMap = Map.of(
            "welcome", "d-xxxxx",
            "appointment_reminder", "d-yyyyy",
            "password_reset", "d-zzzzz"
        );
        return templateMap.getOrDefault(templateName, "");
    }
    
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "****";
        String[] parts = email.split("@");
        return parts[0].charAt(0) + "***@" + parts[1];
    }
}
```

### Email Service

```java
@Service
public class EmailService {
    
    @Autowired
    private EmailProvider emailProvider;
    
    /**
     * Send welcome email
     */
    public boolean sendWelcomeEmail(String to, String patientName) {
        String subject = "Witaj w systemie KPTEST - Aktywacja konta";
        String body = formatWelcomeEmail(patientName);
        
        return emailProvider.sendHtml(to, subject, body);
    }
    
    /**
     * Send appointment reminder
     */
    public boolean sendAppointmentReminder(String to, String patientName,
                                            LocalDateTime appointmentDate,
                                            String appointmentType,
                                            String location,
                                            String therapistName) {
        String subject = String.format("PRZYPOMNIENIE: Nadchodząca wizyta - %s", 
            appointmentType);
        String body = formatAppointmentReminder(
            patientName, appointmentDate, appointmentType, location, therapistName);
        
        return emailProvider.sendHtml(to, subject, body);
    }
    
    /**
     * Send password reset email
     */
    public boolean sendPasswordResetEmail(String to, String userName, 
                                           String resetLink) {
        String subject = "Reset hasła - KPTEST";
        String body = formatPasswordResetEmail(userName, resetLink);
        
        return emailProvider.sendHtml(to, subject, body);
    }
    
    /**
     * Send low adherence alert
     */
    public boolean sendLowAdherenceAlert(String to, String staffName,
                                          String patientName,
                                          double complianceRate,
                                          double threshold) {
        String subject = String.format("ALERT: Niska adherencja pacjenta - %s", 
            patientName);
        String body = formatLowAdherenceAlert(
            staffName, patientName, complianceRate, threshold);
        
        return emailProvider.sendHtml(to, subject, body);
    }
    
    private String formatWelcomeEmail(String patientName) {
        return String.format("""
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                <h2>Witaj, %s!</h2>
                <p>Dziękujemy za rejestrację w systemie KPTEST.</p>
                <p>Aby aktywować konto, kliknij poniższy link:</p>
                <p><a href='%s' style='background-color: #4CAF50; color: white; 
                    padding: 14px 20px; text-decoration: none; border-radius: 4px;'>
                    Aktywuj konto</a></p>
                <p>Pozdrawiamy,<br>Zespół KPTEST</p>
            </body>
            </html>
            """, patientName, "#");
    }
    
    private String formatAppointmentReminder(String patientName,
                                              LocalDateTime date,
                                              String type,
                                              String location,
                                              String therapistName) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(
            "dd MMMM yyyy 'o godzinie' HH:mm");
        
        return String.format("""
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Przypomnienie o wizycie</h2>
                <p>Szanowny/a %s,</p>
                <p>Przypominamy o nadchodzącej wizycie:</p>
                <ul>
                    <li><strong>Typ:</strong> %s</li>
                    <li><strong>Data:</strong> %s</li>
                    <li><strong>Lokalizacja:</strong> %s</li>
                    <li><strong>Terapeuta:</strong> %s</li>
                </ul>
                <p>W razie pytań prosimy o kontakt.</p>
                <p>Pozdrawiamy,<br>Zespół KPTEST</p>
            </body>
            </html>
            """, patientName, type, date.format(formatter), location, therapistName);
    }
    
    private String formatPasswordResetEmail(String userName, String resetLink) {
        return String.format("""
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Reset hasła</h2>
                <p>Witaj %s,</p>
                <p>Otrzymaliśmy prośbę o reset hasła do Twojego konta.</p>
                <p><a href='%s' style='background-color: #4CAF50; color: white;
                    padding: 14px 20px; text-decoration: none; border-radius: 4px;'>
                    Resetuj hasło</a></p>
                <p>Link wygaśnie za 1 godzinę.</p>
                <p>Jeśli nie prosiłeś o reset, zignoruj tę wiadomość.</p>
                <p>Pozdrawiamy,<br>Zespół KPTEST</p>
            </body>
            </html>
            """, userName, resetLink);
    }
    
    private String formatLowAdherenceAlert(String staffName,
                                            String patientName,
                                            double complianceRate,
                                            double threshold) {
        return String.format("""
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #d9534f;'>ALERT: Niska adherencja</h2>
                <p>Szanowny/a %s,</p>
                <p>Pacjent <strong>%s</strong> ma niską adherencję do terapii.</p>
                <ul>
                    <li><strong>Aktualna adherencja:</strong> %.1f%%</li>
                    <li><strong>Próg ostrzeżenia:</strong> %.1f%%</li>
                </ul>
                <p>Prosimy o kontakt z pacjentem i sprawdzenie przyczyn.</p>
                <p><a href='%s' style='background-color: #5bc0de; color: white;
                    padding: 10px 15px; text-decoration: none; border-radius: 4px;'>
                    Zobacz w systemie</a></p>
                <p>Pozdrawiamy,<br>Zespół KPTEST</p>
            </body>
            </html>
            """, staffName, patientName, complianceRate, threshold, "#");
    }
}
```

## Email Templates

### Template Variables

| Template | Variables |
|----------|-----------|
| welcome | patientName, activationLink |
| appointment_reminder | patientName, date, type, location, therapistName |
| password_reset | userName, resetLink, expiryHours |
| low_adherence_alert | staffName, patientName, complianceRate, threshold |
| project_assignment | patientName, projectName, coordinatorName |
| new_message | staffName, senderName, messagePreview, threadUrl |

## Rate Limiting

### Configuration

```yaml
email:
  rate-limit:
    per-minute: 60
    per-hour: 500
    per-day: 5000
```

### Implementation

```java
@Component
public class EmailRateLimiter {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean isAllowed(String recipient, String type) {
        String minuteKey = "email:rate:" + recipient + ":minute:" + 
            getCurrentMinute();
        String hourKey = "email:rate:" + recipient + ":hour:" + 
            getCurrentHour();
        
        Long minuteCount = redisTemplate.opsForValue().increment(minuteKey);
        Long hourCount = redisTemplate.opsForValue().increment(hourKey);
        
        if (minuteCount == 1) {
            redisTemplate.expire(minuteKey, 1, TimeUnit.MINUTES);
        }
        if (hourCount == 1) {
            redisTemplate.expire(hourKey, 1, TimeUnit.HOURS);
        }
        
        return minuteCount <= 60 && hourCount <= 500;
    }
}
```

## Testing

### Unit Tests

```java
@SpringBootTest
class EmailServiceTest {
    
    @MockBean
    private EmailProvider emailProvider;
    
    @Autowired
    private EmailService emailService;
    
    @Test
    void shouldSendWelcomeEmail() {
        // Given
        when(emailProvider.sendHtml(any(), any(), any())).thenReturn(true);
        
        // When
        boolean result = emailService.sendWelcomeEmail(
            "patient@example.com", "Jan Kowalski");
        
        // Then
        assertTrue(result);
        verify(emailProvider).sendHtml(
            eq("patient@example.com"), any(), any());
    }
    
    @Test
    void shouldSendAppointmentReminder() {
        // Given
        when(emailProvider.sendHtml(any(), any(), any())).thenReturn(true);
        
        // When
        boolean result = emailService.sendAppointmentReminder(
            "patient@example.com",
            "Jan Kowalski",
            LocalDateTime.of(2026, 4, 25, 10, 30),
            "Wizyta kontrolna",
            "Gabinet 101",
            "Dr Nowak"
        );
        
        // Then
        assertTrue(result);
    }
}
```

## Monitoring

### Metrics

```java
@Component
public class EmailMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public EmailMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }
    
    public void recordEmailSent(String provider, String type, boolean success) {
        meterRegistry.counter("email.sent",
            "provider", provider,
            "type", type,
            "success", String.valueOf(success)).increment();
    }
    
    public void recordEmailLatency(String provider, long latencyMs) {
        meterRegistry.timer("email.latency", "provider", provider)
            .record(latencyMs, TimeUnit.MILLISECONDS);
    }
}
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not sending | Invalid API key | Regenerate API key in SendGrid |
| Domain not verified | DNS not propagated | Wait 48 hours, check DNS records |
| Rate limit exceeded | Too many emails | Implement backoff, increase limits |
| Email in spam | Missing SPF/DKIM | Configure domain authentication |

### Logs

```java
// Enable debug logging
logging:
  level:
    com.sendgrid: DEBUG
    com.kptest.email: DEBUG
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
