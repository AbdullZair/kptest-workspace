---
name: Extension Points (US-S-05)
description: Inwentaryzacja punktów rozszerzenia (interfejsów provider) i przepis na dopinanie nowych integracji
type: architecture
status: ACCEPTED
date: 2026-04-29
---

# Extension Points — Otwartość na rozszerzenia integracji

> **User Story US-S-05**: System zaprojektowany tak, aby łatwo dodać nowe integracje
> (np. nowy HIS, nowy push provider, nowy email gateway) bez przepisywania kodu klienta.

## 1. Stan zastany — przegląd

W repozytorium zinwentaryzowano **3 ekstension pointy zrealizowane jako interfejsy
strategii** (provider pattern) plus **1 anty-wzorzec** (HIS bez interfejsu):

| # | Extension point                                  | Lokalizacja interfejsu                                                                  | Implementacje                                       | Pluggable? |
|---|--------------------------------------------------|------------------------------------------------------------------------------------------|-----------------------------------------------------|------------|
| 1 | `EmailProvider`                                  | `backend/src/main/java/com/kptest/infrastructure/email/EmailProvider.java`               | `SendGridEmailProvider`                             | TAK        |
| 2 | `SmsProvider`                                    | `backend/src/main/java/com/kptest/infrastructure/sms/SmsProvider.java`                   | `TwilioSmsProvider`                                 | TAK        |
| 3 | `PushNotificationProvider`                       | `backend/src/main/java/com/kptest/infrastructure/push/PushNotificationProvider.java`     | `FcmPushProvider` (`@Profile("prod")`), `LogPushProvider` (`@Profile("dev")`) | TAK        |
| 4 | `HisService` (klasa konkretna — **anti-pattern**) | `backend/src/main/java/com/kptest/application/service/HisService.java`                   | jedna implementacja, używa `HisClient` (Apache HC5) | NIE        |
| 5 | `AuthenticationService` (klasa konkretna)        | `backend/src/main/java/com/kptest/application/service/AuthenticationService.java`        | jedna ścieżka: hasło + opcjonalny TOTP              | NIE        |

**Wynik analizy konwencji KPTEST:**
- Zgodnie z `backend/CLAUDE.md` warstwa biznesowa powinna mieć interfejs + implementację.
- Realnie tylko warstwa **infrastructure/** (email, sms, push) trzyma się tej zasady.
- Warstwa **application/service** (HIS, Auth, Notification, Patient, Project itd.) to klasy konkretne `@Service`.
- Konsekwencja: zmiana providera HIS lub dodanie OAuth wymaga refaktoru, a nie wpięcia nowej klasy.

---

## 2. Extension Point #1 — `EmailProvider`

### Kontrakt

```java
public interface EmailProvider {
    boolean send(String to, String subject, String body);
    boolean sendHtml(String to, String subject, String htmlBody);
    // + multi-recipient + isAvailable()
}
```

### Konsumer
`com.kptest.infrastructure.email.EmailService` (`@Service`, wstrzykuje `EmailProvider`
przez `@RequiredArgsConstructor`). Spring wstrzyknie pierwszego beana implementującego
interfejs — jeżeli ich więcej, należy dodać `@Primary` albo aktywować przez `@Profile`.

### Gdzie dodać nową implementację
- Pakiet: `com.kptest.infrastructure.email.<provider>`
- Klasa: `<Provider>EmailProvider implements EmailProvider`
- Adnotacje: `@Component @Profile("email-<provider>")` lub `@ConditionalOnProperty(name="email.<provider>.enabled", havingValue="true")`
- Konfiguracja: dopisać sekcję `email.<provider>.*` w `backend/src/main/resources/application.yml`

### Przykład — AWS SES (pseudokod)

```java
package com.kptest.infrastructure.email.ses;

@Component
@ConditionalOnProperty(name = "email.ses.enabled", havingValue = "true")
public class SesEmailProvider implements EmailProvider {
    private final SesClient ses;
    @Value("${email.ses.from-email}") String from;

    public boolean send(String to, String subject, String body) {
        ses.sendEmail(b -> b.source(from)
            .destination(d -> d.toAddresses(to))
            .message(m -> m.subject(s -> s.data(subject))
                           .body(bd -> bd.text(t -> t.data(body)))));
        return true;
    }
    // ...
}
```

`application.yml`:
```yaml
email:
  ses:
    enabled: true
    region: eu-central-1
    from-email: noreply@kptest.com
```

Aby uniknąć kolizji z `SendGridEmailProvider` należy ten ostatni również chronić
`@ConditionalOnProperty(name="email.sendgrid.enabled", havingValue="true")` (obecnie ma jedynie
flagę runtime'ową — bean zawsze powstaje).

---

## 3. Extension Point #2 — `SmsProvider`

### Kontrakt

```java
public interface SmsProvider {
    boolean send(String phoneNumber, String message);
    boolean send(String phoneNumber, String message, String senderId);
    boolean isAvailable();
}
```

### Konsumer
`com.kptest.infrastructure.sms.SmsService`.

### Jak dodać `SmsApiProvider` (polski operator SMSAPI.pl)
1. Stwórz `com.kptest.infrastructure.sms.smsapi.SmsApiProvider implements SmsProvider`.
2. Oznacz `@Component @ConditionalOnProperty(name="sms.smsapi.enabled", havingValue="true")`.
3. Wstrzyknij `@Value("${sms.smsapi.token}")` i wykonaj POST do `https://api.smsapi.pl/sms.do`.
4. Domyślny `TwilioSmsProvider` zostaw, ale dodaj `@ConditionalOnProperty(name="sms.twilio.enabled", havingValue="true")`.
5. W `application-prod.yml`: `sms.smsapi.enabled: true`.

---

## 4. Extension Point #3 — `PushNotificationProvider`

### Kontrakt

```java
public interface PushNotificationProvider {
    void send(String deviceToken, PushPayload payload);
}
```

### Konsumer
`com.kptest.application.service.NotificationService` (pole `PushNotificationProvider pushProvider`,
wywoływane w pętli po tokenach urządzeń z `UserDeviceTokenRepository`).

### Stan obecny
- `FcmPushProvider` — `@Profile("prod")`, **stub** (TODO: dodać Firebase Admin SDK).
- `LogPushProvider` — `@Profile("dev")`.

### Jak dodać APNs (Apple Push Notification service)
1. Pakiet: `com.kptest.infrastructure.push.apns`.
2. Klasa: `ApnsPushProvider implements PushNotificationProvider`.
3. Adnotacje: `@Component @Profile("push-apns")` (lub `prod` z dyspatcherem opartym o `payload.platform()`).
4. Dodać zależność do `build.gradle`: `implementation 'com.eatthepath:pushy:0.15.4'`.
5. Konfiguracja:
   ```yaml
   push:
     apns:
       team-id: ABCDE12345
       key-id: 1A2B3C4D5E
       key-path: classpath:apns-auth-key.p8
       bundle-id: com.kptest.mobile
       production: true
   ```
6. **Uwaga**: jeśli aplikacja musi wspierać iOS i Android jednocześnie, należy rozszerzyć
   `PushNotificationProvider` o metodę `Platform supports()` albo wprowadzić
   `PushNotificationDispatcher` (decorator) który routuje po polu
   `UserDeviceToken.platform`.

---

## 5. Extension Point #4 (BRAKUJĄCY) — `HisService`

### Stan zastany
`com.kptest.application.service.HisService` to **klasa konkretna** `@Service` używająca
`com.kptest.infrastructure.his.HisClient` (Apache HttpClient 5 + REST do mocka HIS na
`http://kptest-his-mock:8080`).

### Problem
- Brak interfejsu = nie da się podmienić providera bez modyfikacji kodu.
- Nie da się równolegle wspierać dwóch HISów (np. szpital A → REST mock, szpital B → HL7 FHIR).
- Trudno mockować w testach jednostkowych (musi być pełny `RestClient` mock).

### Rekomendowany refactor (nadal w ramach P5d — TYLKO dokumentacja, nie kod)

```java
// 1. Wyciągnij interfejs:
package com.kptest.application.service;
public interface HisVerificationProvider {
    Optional<HisDemographicsDto> getDemographics(String pesel);
    HisVerificationResult verify(HisVerifyRequest req);
    String name(); // np. "rest-mock", "hl7-fhir"
}

// 2. Domyślną implementację przemianuj na:
//    HisServiceImpl (lub: RestMockHisProvider) implements HisVerificationProvider
//    @Component @ConditionalOnProperty(name="his.provider", havingValue="rest", matchIfMissing=true)

// 3. Konsumerzy (PatientService, RegistrationService) wstrzykują interfejs:
private final HisVerificationProvider his;
```

### Jak dodać HL7 FHIR provider
1. `com.kptest.infrastructure.his.fhir.FhirHisProvider implements HisVerificationProvider`.
2. `@Component @ConditionalOnProperty(name="his.provider", havingValue="fhir")`.
3. Zależność: `implementation 'ca.uhn.hapi.fhir:hapi-fhir-client:7.0.0'`.
4. Konfiguracja:
   ```yaml
   his:
     provider: fhir
     fhir:
       base-url: https://fhir.szpital.pl/fhir
       client-id: kptest-portal
       client-secret: ${HIS_FHIR_SECRET}
   ```
5. Mapowanie: `Patient` (FHIR resource) → `HisDemographicsDto`.

---

## 6. Extension Point #5 (BRAKUJĄCY) — Authentication

### Stan zastany
`AuthenticationService` to klasa konkretna z hardcoded'owanym flow:
`PasswordEncoder` + opcjonalny `TotpService`. `AuthController` (`/api/v1/auth/*`) ma
endpointy `login`, `register`, `verify-2fa`, `reset-password`, `refresh`. Brak
`OAuth2LoginConfigurer` w `SecurityConfig`.

### Problem
Niemożliwe jest dodanie SSO (OAuth/OIDC, SAML) bez edycji `AuthController` i
`AuthenticationService`. Brak interfejsu `AuthenticationProvider` na poziomie aplikacji.

### Rekomendowana abstrakcja

```java
public interface AuthProvider {
    String id();                                // "local", "google", "azure-ad"
    boolean supports(String issuer);
    AuthResult authenticate(Object credentials); // unia: hasło, kod OAuth
}
```

Domyślny `LocalAuthProvider` opakowuje obecny `AuthenticationService`. Nowe providery
(`GoogleOAuthProvider`, `AzureAdOidcProvider`) implementują ten interfejs, a
`AuthController` deleguje do `AuthProviderRegistry` (mapa `Map<String, AuthProvider>`).

---

## 7. Trzy konkretne propozycje integracji do dopięcia

### 7.1. OAuth provider — Google (Login with Google)

**Cel**: pozwolić personelowi medycznemu logować się kontem Google Workspace szpitala.

1. **Dependencies (`backend/build.gradle`)**:
   ```gradle
   implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
   implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
   ```
2. **Klasy do stworzenia**:
   - `com.kptest.infrastructure.security.oauth.GoogleOidcUserService extends OidcUserService` — mapuje `OidcUser` → lokalny `User` (po `email`); jeśli user nie istnieje, tworzy `User` z rolą `STAFF` (lub odrzuca, jeśli polityka „tylko zaproszeni").
   - `com.kptest.infrastructure.security.oauth.OAuthLoginSuccessHandler` — generuje JWT przez istniejący `JwtService` i przekierowuje na `/oauth-callback?token=...`.
3. **Konfiguracja `application.yml`**:
   ```yaml
   spring:
     security:
       oauth2:
         client:
           registration:
             google:
               client-id: ${GOOGLE_CLIENT_ID}
               client-secret: ${GOOGLE_CLIENT_SECRET}
               scope: openid,email,profile
               redirect-uri: '{baseUrl}/login/oauth2/code/{registrationId}'
   kptest:
     oauth:
       allowed-domains:
         - kptest-szpital.pl
   ```
4. **`SecurityConfig.java`** — dopisać:
   ```java
   .oauth2Login(oauth -> oauth
       .userInfoEndpoint(u -> u.oidcUserService(googleOidcUserService))
       .successHandler(oauthLoginSuccessHandler))
   ```
5. **Frontend** — dodać przycisk „Zaloguj przez Google" na `/login` (link do `/oauth2/authorization/google`).
6. **Mobile** — wykorzystać `expo-auth-session` z `discovery: 'google'`, callback wymienia `idToken` na lokalny JWT przez nowy endpoint `POST /auth/oauth/google` (Google ID Token JWT verification po stronie backendu).

### 7.2. Alternatywny HIS — HL7 FHIR

**Cel**: integracja z prawdziwym szpitalnym HIS udostępniającym REST/FHIR R4 endpoint.

1. **Wstępny refactor** (sekcja 5): wyciągnij `HisVerificationProvider`.
2. **Klasa**: `com.kptest.infrastructure.his.fhir.FhirHisProvider implements HisVerificationProvider`.
3. **Zależność**: `ca.uhn.hapi.fhir:hapi-fhir-client:7.0.0`.
4. **Implementacja**:
   ```java
   @Component
   @ConditionalOnProperty(name = "his.provider", havingValue = "fhir")
   public class FhirHisProvider implements HisVerificationProvider {
       private final IGenericClient fhir;

       public Optional<HisDemographicsDto> getDemographics(String pesel) {
           Bundle b = fhir.search().forResource(Patient.class)
               .where(Patient.IDENTIFIER.exactly().systemAndCode(
                   "urn:oid:2.16.840.1.113883.3.4424.1.1.616", pesel))
               .returnBundle(Bundle.class).execute();
           return b.getEntry().stream().findFirst()
               .map(e -> mapToDto((Patient) e.getResource()));
       }
       public String name() { return "hl7-fhir"; }
   }
   ```
5. **Konfiguracja `application-prod.yml`**:
   ```yaml
   his:
     provider: fhir
     fhir:
       base-url: https://fhir.szpital.pl/r4
       auth:
         type: client_credentials
         token-url: https://idp.szpital.pl/oauth/token
         client-id: kptest
         client-secret: ${HIS_FHIR_SECRET}
   ```
6. **Cutover plan**: 
   - `his.provider=rest` (mock) na DEV, 
   - `his.provider=fhir` na PROD,
   - przejście kontrolowane feature-flagiem na poziomie operatora.

### 7.3. Firebase Cloud Messaging dla push (dokończenie istniejącego stuba)

**Cel**: wysyłka prawdziwych pushy iOS+Android z poziomu `FcmPushProvider` (obecnie TODO/log).

1. **Dependencies (`backend/build.gradle`)**:
   ```gradle
   implementation 'com.google.firebase:firebase-admin:9.2.0'
   ```
2. **Inicjalizacja** — nowa klasa `com.kptest.infrastructure.config.FirebaseConfig`:
   ```java
   @Configuration
   @ConditionalOnProperty(name = "push.fcm.enabled", havingValue = "true")
   public class FirebaseConfig {
       @Bean
       public FirebaseApp firebaseApp(@Value("${push.fcm.credentials-path}") Resource creds) throws IOException {
           FirebaseOptions opts = FirebaseOptions.builder()
               .setCredentials(GoogleCredentials.fromStream(creds.getInputStream()))
               .build();
           return FirebaseApp.initializeApp(opts);
       }
       @Bean
       public FirebaseMessaging firebaseMessaging(FirebaseApp app) { return FirebaseMessaging.getInstance(app); }
   }
   ```
3. **Wymiana implementacji w `FcmPushProvider`**:
   ```java
   @Component
   @ConditionalOnProperty(name = "push.fcm.enabled", havingValue = "true")
   public class FcmPushProvider implements PushNotificationProvider {
       private final FirebaseMessaging firebase;
       public void send(String deviceToken, PushPayload payload) {
           Message msg = Message.builder()
               .setToken(deviceToken)
               .setNotification(Notification.builder()
                   .setTitle(payload.title())
                   .setBody(payload.body()).build())
               .putAllData(payload.data() != null ? payload.data() : Map.of())
               .putData("type", payload.type().name())
               .build();
           try { firebase.send(msg); }
           catch (FirebaseMessagingException e) { log.error("FCM send failed: {}", e.getMessage()); }
       }
   }
   ```
4. **Konfiguracja `application-prod.yml`**:
   ```yaml
   push:
     fcm:
       enabled: true
       credentials-path: classpath:firebase-service-account.json
       project-id: kptest-prod
   ```
5. **Mobile** — `mobile/src/features/notifications/services/pushRegistration.ts`
   już POSTuje do `/notifications/register-token` (sprawdzone). Wystarczy upewnić się,
   że zwracany jest token FCM (`getDevicePushTokenAsync` z `expo-notifications`),
   a nie token Expo Push.

---

## 8. Podsumowanie i rekomendacje

| Obszar                | Stan          | Akcja                                                                                          |
|-----------------------|---------------|------------------------------------------------------------------------------------------------|
| Email                 | OK            | Dodać `@ConditionalOnProperty` na `SendGridEmailProvider`, by uniknąć kolizji.                 |
| SMS                   | OK            | Analogicznie do email.                                                                         |
| Push                  | OK (stub)     | Dokończyć `FcmPushProvider` (sekcja 7.3) + dodać APNs (alternatywnie unified FCM HTTP v1).     |
| HIS                   | **DŁUG**      | Wyciągnąć `HisVerificationProvider`. Bez tego nie da się dodać HL7 FHIR bez refaktoru.         |
| Auth                  | **DŁUG**      | Wyciągnąć `AuthProvider` (lokalny / OAuth / SAML). Zaplanowane do US-S-05 follow-up.            |
| Notification dispatch | częściowo OK  | Rozważyć dispatcher rozdzielający kanał (email vs sms vs push) na podstawie `NotificationPreference` użytkownika. |

**Łącznie zidentyfikowano 5 extension points** (3 zaimplementowane jako interfejsy,
2 wymagające ekstrakcji). Trzy konkretne plany integracji opisano powyżej.
