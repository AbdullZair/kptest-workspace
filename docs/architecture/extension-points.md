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

W repozytorium zinwentaryzowano **4 extension pointy zrealizowane jako interfejsy
strategii** (provider pattern) plus **OAuth2 szkielet** dla Authentication:

| # | Extension point                                  | Lokalizacja interfejsu                                                                  | Implementacje                                       | Pluggable? |
|---|--------------------------------------------------|------------------------------------------------------------------------------------------|-----------------------------------------------------|------------|
| 1 | `EmailProvider`                                  | `backend/src/main/java/com/kptest/infrastructure/email/EmailProvider.java`               | `SendGridEmailProvider`                             | TAK        |
| 2 | `SmsProvider`                                    | `backend/src/main/java/com/kptest/infrastructure/sms/SmsProvider.java`                   | `TwilioSmsProvider`                                 | TAK        |
| 3 | `PushNotificationProvider`                       | `backend/src/main/java/com/kptest/infrastructure/push/PushNotificationProvider.java`     | `FcmPushProvider` (`@Profile("prod")`), `LogPushProvider` (`@Profile("dev")`) | TAK        |
| 4 | `HisService` (interfejs — **OK, pluggable** od ADR-003) | `backend/src/main/java/com/kptest/application/service/HisService.java`                   | `RestHisProvider` (`@Profile("!test")`, używa `HisClient` Apache HC5), `MockHisProvider` (`@Profile("test")`, in-memory fixtures) | TAK        |
| 5 | `AuthenticationService` + OAuth2 szkielet (ADR-004) | `backend/src/main/java/com/kptest/application/service/AuthenticationService.java` + `infrastructure/config/SecurityConfig.java` | hasło + TOTP (default); OAuth2 ready przez `application-oauth2.yml` (Google placeholder) | TAK (OAuth2 disabled by default) |

**Wynik analizy konwencji KPTEST:**
- Zgodnie z `backend/CLAUDE.md` warstwa biznesowa powinna mieć interfejs + implementację.
- Warstwy **infrastructure/** (email, sms, push) i **application/service.HisService** (od ADR-003) trzymają się tej zasady.
- Pozostała warstwa **application/service** (Auth — częściowo, Notification, Patient, Project itd.) to klasy konkretne `@Service`.
- Po ekstrakcji `HisService` (ADR-003) dodanie HL7 FHIR / CGM providera nie wymaga zmiany callerów (`PatientController`, `PatientService`), wystarczy nowa klasa `FhirHisProvider implements HisService`.
- OAuth2 (Authentication) — od ADR-004 (2026-04-29) szkielet w `SecurityConfig`
  z `Customizer.withDefaults()` + profil `application-oauth2.yml` z Google placeholder.

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

## 5. Extension Point #4 — `HisService` (OK — pluggable od ADR-003)

### Kontrakt

```java
package com.kptest.application.service;

public interface HisService {
    HisVerificationResult verifyPatient(String pesel, String cartNumber);
    HisDemographicsDto getDemographics(String pesel);
}
```

### Implementacje

| Klasa                          | Pakiet                                        | Profil           | Opis                                                                                       |
|--------------------------------|-----------------------------------------------|------------------|--------------------------------------------------------------------------------------------|
| `RestHisProvider`              | `com.kptest.infrastructure.his`               | `!test`          | Produkcyjna ścieżka — wywołuje `his-mock` REST przez `HisClient` (Apache HttpClient 5).   |
| `MockHisProvider`              | `com.kptest.infrastructure.his`               | `test`           | In-memory fixturze (3 PESELE: 12345678901, 98765432109, 11111111111). Bez ruchu sieciowego. |

### Konsumerzy
- `com.kptest.api.controller.PatientController` (`private final HisService hisService`).
- `com.kptest.application.service.PatientService` (`private final HisService hisService`).

Spring wstrzyknie odpowiednią implementację na podstawie aktywnego profilu;
callerzy nie wiedzą która implementacja jest aktywna.

### Status
- **Pluggable**: TAK.
- Decyzja architektoniczna: **ADR-003** (`docs/architecture/adr/ADR-003.md`).
- Sygnatury publiczne nie zmieniły się przy ekstrakcji — caller refactor zerowy.

### Jak dodać HL7 FHIR provider
1. Klasa: `com.kptest.infrastructure.his.fhir.FhirHisProvider implements HisService`.
2. Adnotacje: `@Service @ConditionalOnProperty(name="his.provider", havingValue="fhir")`.
3. Aby uniknąć kolizji z `RestHisProvider` (`@Profile("!test")`), trzeba dodać tam
   również `@ConditionalOnProperty(name="his.provider", havingValue="rest", matchIfMissing=true)`
   albo wprowadzić dispatcher `Map<String, HisService>`.
4. Zależność: `implementation 'ca.uhn.hapi.fhir:hapi-fhir-client:7.0.0'`.
5. Konfiguracja:
   ```yaml
   his:
     provider: fhir
     fhir:
       base-url: https://fhir.szpital.pl/fhir
       client-id: kptest-portal
       client-secret: ${HIS_FHIR_SECRET}
   ```
6. Mapowanie: `Patient` (FHIR resource) → `HisDemographicsDto`.

### Jak dodać CGM / OptiMed provider
Analogicznie do FHIR — nowa klasa `CgmHisProvider implements HisService` lub
`OptiMedHisProvider implements HisService` w `infrastructure/his/<vendor>/`,
aktywowana przez `@ConditionalOnProperty`.

---

## 6. Extension Point #5 — Authentication (OK — OAuth2 ready, disabled by default)

> **Status: OK — OAuth2 ready (disabled by default).** Po realizacji ADR-004
> (zob. `docs/architecture/adr/ADR-004.md`) `SecurityConfig` zawiera
> `oauth2Login(Customizer.withDefaults())` a `build.gradle` ma startery
> `spring-boot-starter-oauth2-client` + `spring-boot-starter-oauth2-resource-server`.
> Aktywacja providera (Google / Microsoft / Keycloak) sprowadza się do
> wpisów w `application-oauth2.yml` + env vars — bez refaktoru kodu Java.

### Stan zastany (po ADR-004)
- `SecurityConfig.SecurityFilterChain` — dodano `.oauth2Login(Customizer.withDefaults())`
  jako szkielet; aktywuje się wyłącznie gdy `spring.security.oauth2.client.registration.*`
  zawiera niepuste `client-id`.
- `application-oauth2.yml` — profil z placeholderami dla Google (aktywny, env vars puste)
  i Microsoft (zakomentowany).
- `AuthenticationService` (klasa konkretna) — bez zmian: nadal trzyma flow
  `PasswordEncoder` + opcjonalny `TotpService`. JWT auth jest **default**, OAuth2
  to **opcjonalna druga ścieżka** logowania.

### Co pozostaje do zrobienia (US-S-05 implementation sprint)
- `GoogleOidcUserService extends OidcUserService` — mapowanie `OidcUser` → lokalny `User`
  (po `email`), polityka auto-create vs invite-only, allowed-domains.
- `OAuthLoginSuccessHandler` — generowanie lokalnego JWT przez `JwtService`,
  redirect na `/oauth-callback?token=...`.
- Tabela `user_external_identity` (Flyway) — link `User` → `(provider, subject)`.
- Refactor `AuthenticationService` na interfejs `AuthProvider` (`local` / `google` /
  `azure-ad`) z `AuthProviderRegistry` jako mapą `Map<String, AuthProvider>`.

### Problem (historyczny — przed ADR-004)
Dodanie SSO (OAuth/OIDC, SAML) wymagało edycji `SecurityConfig`, dependencies,
profilu i całej ścieżki integracji. Po ADR-004 dependencies + szkielet konfiguracji
są już wbudowane.

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
| HIS                   | OK            | Interfejs `HisService` + `RestHisProvider` (`@Profile("!test")`) + `MockHisProvider` (`@Profile("test")`) — ADR-003. Dodanie HL7 FHIR / CGM nie wymaga ruszania callerów. |
| Auth                  | OK / częściowy DŁUG | OAuth2 szkielet w `SecurityConfig` (ADR-004) — gotowy do aktywacji env vars. Pełny `AuthProvider` (lokalny / OAuth / SAML) z `AuthProviderRegistry` nadal do zrobienia w US-S-05 implementation sprint. |
| Notification dispatch | częściowo OK  | Rozważyć dispatcher rozdzielający kanał (email vs sms vs push) na podstawie `NotificationPreference` użytkownika. |

**Łącznie zidentyfikowano 5 extension points** (4 zaimplementowane jako interfejsy
po ADR-003, 1 — Authentication — nadal w fazie szkieletu OAuth2). Trzy konkretne
plany integracji opisano powyżej.

---

## 9. Mobile build & distribution (US-S-14, ADR-007)

> **Status: OK — pipeline skonfigurowany.** EAS Build (Expo Application Services)
> jest punktem rozszerzenia dla build/dystrybucji mobile na obu platformach
> (iOS + Android), z kanałami `preview` i `production` oraz integracją
> TestFlight / Play Internal Testing.

### Stan zastany (po ADR-007)

| Element                            | Lokalizacja                                                      | Profil/Trigger                                  |
|------------------------------------|------------------------------------------------------------------|-------------------------------------------------|
| `eas.json`                         | `mobile/eas.json`                                                | 3 profile: `development`, `preview`, `production` |
| Expo project config                | `mobile/app.json`                                                | `runtimeVersion: { policy: 'appVersion' }`, `extra.eas.projectId`, `updates.url`, `ios.bundleIdentifier=com.kptest.mobile`, `android.package=com.kptest.mobile` |
| GitHub Actions workflow            | `.github/workflows/eas-build.yml`                                | `push: main` (paths `mobile/**`), `pull_request`, `workflow_dispatch` (manual profile/platform) |
| Runbook                            | `mobile/EAS_BUILD.md`                                            | Lokalny build, submit, CI/CD, wymagania kont    |
| Build CI step (legacy validation)  | `.github/workflows/mobile-ci.yml` (`eas-build` job)              | `expo-doctor` + `eas build:configure` smoke check |

### Submit ścieżki

- **Android** → `eas submit --platform android` → Google Play **Internal Testing**
  track (`submit.production.android.track: internal` w `eas.json`).
  Wymaga `google-service-account.json` (service account z rolą Release Manager).
- **iOS** → `eas submit --platform ios` → App Store Connect **TestFlight**
  (`submit.production.ios.appleId/ascAppId/appleTeamId`).
  Wymaga Apple Developer Program ($99/rok) + App-Specific Password lub
  `eas credentials` z App Store Connect API key.

### Profile build — environment variables

| Profile        | `API_BASE_URL`                          | Channel       | Format Android      | Format iOS                    |
|----------------|------------------------------------------|---------------|---------------------|--------------------------------|
| `development`  | (default — `app.json.extra.apiUrl`)      | —             | debug APK (gradle)  | simulator build               |
| `preview`      | `https://staging-api.kptest.com`         | `preview`     | APK (`buildType: apk`) | device build (no simulator) |
| `production`   | `https://api.kptest.com`                 | `production`  | AAB (`app-bundle`)  | autoIncrement build number    |

### Jak dodać kolejny target dystrybucji (np. App Store Public + Play Production)

1. Rozszerzyć sekcję `submit` w `mobile/eas.json`:
   ```json
   "submit": {
     "production-store": {
       "android": { "track": "production", "serviceAccountKeyPath": "./google-service-account.json" },
       "ios":     { "appleId": "...", "ascAppId": "...", "appleTeamId": "..." }
     }
   }
   ```
2. Workflow `eas-build.yml` rozszerzyć o krok `eas submit --profile production-store`
   z manual approval (env `production`).
3. Compliance: changelog + release notes per platform przed publikacją.

### Otwarte gaps (wymagają człowieka)

- Apple Developer Program enrollment ($99/rok) — KYC, D-U-N-S number dla
  organizacji.
- Google Play Developer account ($25 jednorazowo) — KYC, payment.
- `EXPO_TOKEN` w GitHub Secrets (jednorazowo z
  `expo.dev/accounts/[user]/settings/access-tokens`).
- `extra.eas.projectId` w `mobile/app.json` jest placeholderem
  (`00000000-0000-0000-0000-000000000000`) — pierwsze uruchomienie
  `eas build:configure` nadpisze go realnym UUID.
- `google-service-account.json` (Play) — wymagany przed `eas submit --platform android`.

