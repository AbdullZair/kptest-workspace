# PROMPT: KPTESTPRO RESCUE PLAN — wieloagentowa naprawa

> Wklej całość poniżej do nowej sesji Claude Code uruchomionej w `/home/user1/KPTESTPRO/`.
> Prompt orkiestruje 3 fazy z wieloma agentami w każdej. Wymaga włączonego trybu auto.
> Skille `kpt-backend`, `kpt-frontend`, `kpt-mobile`, `kpt-devops`, `kpt-tester`, `kpt-dokumentalista` muszą istnieć w `~/.claude/skills/`.

---

# MISJA

Doprowadzić projekt KPTESTPRO do stanu rzeczywistego production-ready (~21% FULL → cel 80%+), naprawić 4 KRYTYCZNE LUKI RODO, zielony build backendu i E2E pokrywające zaimplementowane funkcje. Operacja w 3 fazach z weryfikacją między fazami.

## PRE-FLIGHT — wczytaj kontekst (zrób to przed odpalaniem agentów)

1. Wczytaj memory: `~/.claude/projects/-home-user1/memory/MEMORY.md` + 3 wpisy `project_kptestpro_*.md`.
2. Przeczytaj `BACKEND_COMPILATION_STATUS.md`, `BACKEND_COMPILATION_FIXES.md`, `FINAL_PROJECT_SUMMARY.md`, `SECURITY.md`.
3. Zerknij na `git status` (na ten dzień ~17 zmodyfikowanych plików — refaktor `userId UUID→String`).
4. Sprawdź `ls ~/.claude/skills/` — masz mieć 6 skili `kptest-*`.
5. **Nie commituj nic w pre-flight.** Tylko czytasz.

## ZASADY OGÓLNE — wymuszane na każdym agencie

- Agent wywołuje swój skill (`kpt-backend` / `kpt-frontend` / `kpt-mobile` / `kpt-devops` / `kpt-tester` / `kpt-dokumentalista`) i czyta odpowiedni `<warstwa>/CLAUDE.md` przed pierwszą edycją.
- **Verify before implement:** najpierw sprawdza czy funkcja już nie istnieje (grep, find). Tylko jeśli faktycznie brakuje — implementuje.
- **Małe commity per agent**, nie zbiorcze. Format wiadomości: `<warstwa>(<scope>): <co>` np. `backend(rodo): add anonymize endpoint US-A-10`.
- **Bez `--no-verify`, bez `--force`, bez `git reset --hard`.** Hooki muszą zielono przejść.
- Jeśli build/test pada — agent **zatrzymuje się i raportuje**, nie obchodzi problemu.
- **Konwencje obowiązkowe** z odpowiedniego `CLAUDE.md`: records dla DTO, konstruktor-DI, `@PreAuthorize`, soft-delete, audit fields, FSD layering, RHF+Zod, RTK Query, brak `any`.
- **Nie dotykaj sekretów** w `.env`, `application.yml` (poza dodaniem env-var placeholderów), `secrets-template.yaml`.
- **Nie pisz dokumentacji w `docs/` / nowych `.md`** — to robi `kpt-dokumentalista` w Fazie 3.

---

# FAZA 0 — Backend Compilation Fix (1 agent, sekwencyjnie)

Cel: zielony `./gradlew build`. Bez tego Faza 1B nie startuje.

**Dispatch (1 agent ogólnego użytku, model sonnet):**

```
Agent({
  description: "Fix backend compilation 28 errors",
  subagent_type: "general-purpose",
  prompt: """
  Pracujesz jako backend developer KPTEST. Wywołaj skill kpt-backend i czytaj backend/CLAUDE.md.

  Cel: doprowadzić ./gradlew build do zielonego stanu w /home/user1/KPTESTPRO/backend/.
  Aktualnie 28 błędów kompilacji w 8 kategoriach (patrz BACKEND_COMPILATION_STATUS.md):
    1. QuizAnswer.isCorrect() - częściowo poprawione w git diff, dokończ
    2. InboxService - Status vs ThreadStatus enum mismatch (7 błędów)
    3. AdminController - request param mismatch (2)
    4. AdminService - undefined oldTwoFactorEnabled / oldTwoFactorSecret (3)
    5. EventChangeRequestController - duplikat patientId, missing jwt (5)
    6. BadgeService - findByActive() not found, BadgeCategory enum import (4)
    7. TherapyStageService - protected constructor access
    8. DTO references do disabled packages (np. TherapyStageDto: Quiz.getQuizId())

  Workflow:
  1. ./gradlew build 2>&1 | head -200 — przeczytaj realne błędy
  2. Dla każdego napraw: minimalnie, bez refaktoru poza bugiem
  3. UWAGA: trwa refaktor userId UUID→String — utrzymaj kierunek, nie cofaj go
  4. Po każdej kategorii ./gradlew compileJava — sprawdź postęp
  5. Gdy compileJava zielony: ./gradlew test (sprawdź czy testy nie padły przez fix)
  6. Commit: "backend(build): fix N compilation errors in Iter 2/3"

  Stop conditions:
  - Build zielony → commit + raport "FAZA 0 OK"
  - Po 90 minutach pracy bez postępu → raport "FAZA 0 BLOCKED" z listą pozostałych błędów

  Nie przechodź do Fazy 1B dopóki build nie jest zielony.
  """
})
```

**Gate Faza 0 → Faza 1B:** `./gradlew build` musi zwrócić `BUILD SUCCESSFUL`.

---

# FAZA 1 — Backend Implementation (4 agenty równolegle)

**Po zielonym buildzie**, dispatch 4 agentów backend RÓWNOLEGLE (jedna wiadomość, 4 wywołania `Agent`):

### Agent B-RODO-1: US-A-10 + US-A-11 (anonimizacja + eksport)

```
Agent({
  description: "RODO: anonymize + export endpoints",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-backend, przeczytaj backend/CLAUDE.md, sprawdź spec.md linie 890-913.

  Implementuj US-A-10 i US-A-11 w backend/.

  US-A-10 - Anonimizacja:
    POST /api/v1/admin/patients/{id}/anonymize
    AdminController + AdminService.anonymizePatient(id)
    Zastępuje: pesel→"XXXXXXXXXXX-{hash}", firstName→"ANON", lastName→"ANON-{seq}",
              email→"anon-{id}@deleted.local", phone→null, dateOfBirth→null,
              addressStreet/City/PostalCode→null
    Zachowuje: id, projektowe powiązania (PatientProject), historie (audit_logs)
    @PreAuthorize("hasRole('ADMIN')")
    Audit: AuditLog z action=ANONYMIZE, oldValues + newValues w JSONB
    DTO: AnonymizationResponse(patientId, anonymizedAt, audit_log_id)

  US-A-11 - Eksport (RODO Art. 20):
    GET /api/v1/admin/patients/{id}/export-data?format=json|pdf
    Zwraca: dane osobowe + projekty + wiadomości + materiały odczytane + zdarzenia +
            quiz attempts + badges + audit log dla pacjenta
    @PreAuthorize("hasRole('ADMIN')")
    JSON: ResponseEntity<PatientDataExportDto>
    PDF: ResponseEntity<byte[]> z Content-Type: application/pdf, Content-Disposition: attachment

  Workflow:
  1. Sprawdź czy klasy już nie istnieją (grep "anonymizePatient", "exportPatientData")
  2. Dodaj DTO records w api/dto/ (PatientDataExportDto, AnonymizationResponse)
  3. Rozszerz AdminController + AdminService
  4. Bean Validation, GlobalExceptionHandler, Swagger @Operation/@Tag
  5. ./gradlew test — testy istniejące mają przejść
  6. Dodaj JUnit @WebMvcTest(AdminController) i @SpringBootTest dla dwóch nowych endpointów
  7. ./gradlew build && ./gradlew test
  8. Commit: "backend(rodo): implement US-A-10 anonymize + US-A-11 export"

  ZAKAZ: dotykania frontendu / mobile / docs / migracji DB (zostaje na Fazę 1).
  """
})
```

### Agent B-RODO-2: US-A-12 + US-A-13 (erasure + registry)

```
Agent({
  description: "RODO: erasure + processing registry",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-backend, czytaj backend/CLAUDE.md, spec.md linie 914-937.

  Implementuj US-A-12 i US-A-13 w backend/.

  US-A-12 - Prawo do bycia zapomnianym (RODO Art. 17):
    DELETE /api/v1/admin/patients/{id}/erase
    Body: ErasureRequest(reason: String, confirmationToken: String)
    AdminService.erasePatient(id, reason):
      1. Weryfikuje że pacjent ma deletedAt > 30 dni temu (cooling period) lub force flag z wyższym auth
      2. Hard-delete: PatientBadge, MaterialProgress, QuizAnswerSelection, QuizAttempt,
                     MessageAttachment, Notification, EmergencyContact
      3. Anonimizuje: Message (sender→null), AuditLog (entityId zachowany, dane PII zerowane)
      4. Hard-delete Patient i User (jeśli dedykowany dla pacjenta)
      5. Zapisuje DataProcessingErasureLog (osobna encja w domain/audit/)
    @PreAuthorize("hasRole('ADMIN')")
    Audit: zapis w AuditLog z action=ERASURE przed wykonaniem

  US-A-13 - Rejestr przetwarzania danych osobowych (RODO Art. 30):
    Nowa encja: domain/audit/DataProcessingActivity.java z polami:
      id (UUID), name, purpose (TEXT), legalBasis (enum: CONSENT, CONTRACT, LEGAL_OBLIGATION,
      VITAL_INTEREST, PUBLIC_TASK, LEGITIMATE_INTEREST), categories (JSONB List<String>),
      recipients (JSONB), retentionPeriod, securityMeasures (TEXT),
      dataController, dataProcessor, createdBy, createdAt, updatedAt
    Repozytorium: DataProcessingActivityRepository extends JpaRepository<...,UUID>
    DataProcessingController /api/v1/admin/data-processing-activities:
      GET / GET /{id} / POST / PUT /{id} / DELETE /{id}
      @PreAuthorize("hasRole('ADMIN')")
    Migracja Flyway: V2__data_processing_registry.sql
      CREATE TABLE data_processing_activities + data_processing_erasure_logs

  Workflow:
  1. Grep czy nie ma już tych klas
  2. Encje + repozytoria + service + kontroler + DTO records
  3. Migracja V2__... w backend/src/main/resources/db/migration/
  4. JUnit testy: @DataJpaTest dla repos, @WebMvcTest dla controllerów, @SpringBootTest e2e
  5. ./gradlew build && ./gradlew test
  6. Commit: "backend(rodo): implement US-A-12 erasure + US-A-13 processing registry"

  ZAKAZ: zmiany istniejącej migracji V1, zmiany frontendu/mobile/docs.
  """
})
```

### Agent B-SEC: PESEL encryption + per-project auth + rate limiting

```
Agent({
  description: "Security: PESEL encrypt + project auth + rate limit",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-backend, czytaj backend/CLAUDE.md, ADR-001, ADR-002.

  Implementuj US-S-01, US-S-02 (rate limit), US-S-03 w backend/.

  US-S-01 - Encrypt PESEL at rest:
    Stwórz infrastructure/security/AesAttributeConverter.java implements AttributeConverter<String,String>
      Klucz z env var KPTEST_DB_ENCRYPTION_KEY (256-bit, Base64)
      AES-256-GCM (z IV per wartość, IV+ciphertext+tag w bazie)
      W dev fallback: KPTEST_DB_ENCRYPTION_KEY z application-dev.yml (testowy klucz, oznaczony jako dev-only)
    Zastosuj @Convert(converter = AesAttributeConverter.class) na:
      Patient.pesel
      User.phone (opcjonalnie - dane PII)
    Migracja V3__encrypt_pesel.sql:
      Walidacja schemy (varchar wystarczająco długi). Nie migruj danych w SQL — dodaj
      backend/src/main/java/com/kptest/infrastructure/migration/PeselEncryptionMigration.java
      jako @PostConstruct hook profile=encrypt-existing który raz przemieli istniejące rekordy.
      W produkcji uruchamiać świadomie z flagą feature.
    
  US-S-02 - Rate limiting (Bucket4j):
    Dodaj do build.gradle: implementation 'com.bucket4j:bucket4j-core:8.7.0'
                         implementation 'com.bucket4j:bucket4j-spring-boot-starter:0.6.0'
    infrastructure/security/RateLimitFilter.java OncePerRequestFilter
      /api/v1/auth/login: 5 req/min per IP
      /api/v1/auth/forgot-password: 3 req/15min per IP
      /api/v1/his/**: 10 req/min per IP
      Reszta: 100 req/min per user (z JWT) lub IP (anon)
    Bucket per IP w mapie ConcurrentHashMap (in-memory; w prod K8s -> docelowo Redis-backed,
    ale na MVP in-memory wystarczy)
    Konfiguracja w application.yml: kptest.security.rate-limit.{login,forgotPassword,his,default}.{capacity,refillTokens,refillPeriodSeconds}

  US-S-03 - Per-project authorization:
    Stwórz infrastructure/security/ProjectAccessChecker.java jako @Component bean
      Method: hasProjectAccess(UUID userId, UUID projectId): boolean
        ADMIN -> true
        Staff -> sprawdza ProjectTeamRepository.existsByProjectIdAndStaffUserId
        PATIENT -> sprawdza PatientProjectRepository.existsByProjectIdAndPatientUserId(activeOnly=true)
    Użyj jako @PreAuthorize("@projectAccessChecker.hasProjectAccess(authentication.principal, #projectId)")
    Zastosuj w: ProjectController, MaterialController, QuizController, TherapyStageController,
                CalendarController, MessageController (per thread.projectId)
    Dla endpointów po patientId — analogicznie hasPatientAccess(userId, patientId)

  Workflow:
  1. Każda zmiana w osobnym commicie:
     a) "backend(sec): add AES converter + apply to PESEL US-S-01"
     b) "backend(sec): add Bucket4j rate limit filter US-S-02"
     c) "backend(sec): per-project authorization US-S-03"
  2. JUnit testy:
     - AesAttributeConverterTest (encrypt/decrypt roundtrip, distinct IV)
     - RateLimitFilterTest (@WebMvcTest, sprawdza 429 po przekroczeniu)
     - ProjectAccessCheckerTest (@DataJpaTest scenariusze ADMIN/STAFF/PATIENT/cross-project)
  3. ./gradlew build && ./gradlew test po KAŻDYM commicie

  ZAKAZ: zmiana logiki biznesowej w istniejących service'ach poza dodaniem @PreAuthorize.
         Zmiana frontendu/mobile/docs.
  """
})
```

### Agent B-FUNC: change password + push notification trigger

```
Agent({
  description: "Functional: change-password + push trigger",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-backend, czytaj backend/CLAUDE.md.

  Implementuj US-P-09, częściowo US-P-21 w backend/.

  US-P-09 - Zmiana hasła:
    POST /api/v1/auth/change-password (uwierzytelnione)
    Body: ChangePasswordRequest(currentPassword: String, newPassword: String)
    AuthController.changePassword + AuthenticationService.changePassword(userId, current, new):
      1. Verify currentPassword przez BCrypt
      2. Walidacja: min 12 znaków, wielka, mała, cyfra, znak spec (Pattern w DTO)
      3. newPassword != currentPassword
      4. Update User.passwordHash + User.passwordChangedAt
      5. Revoke wszystkie refresh tokeny tego usera (RefreshTokenService.revokeAllForUser)
      6. Audit: AuditLog action=PASSWORD_CHANGED
    Bean Validation: @ValidPassword custom (regex)
    Errors: InvalidCredentialsException (currentPassword wrong), BusinessRuleException
            (new == current, password policy fail)

  US-P-21 - Backend trigger dla push (FCM-ready):
    Stwórz infrastructure/push/PushNotificationProvider.java interface (Strategy pattern jak
    EmailProvider/SmsProvider):
      send(String deviceToken, PushPayload payload)
    Implementacje:
      - LogPushProvider (default w dev — loguje, nie wysyła) — @Profile("dev")
      - FcmPushProvider (TODO: tylko stub klasy, bez prawdziwego SDK Firebase — będzie podpięty
        gdy zostaną klucze; przyjmuje ${kptest.push.fcm.api-key}) — @Profile("prod")
    NotificationService rozszerzenie:
      sendPushNotification(userId, type, title, body, data)
      Pobiera user.deviceTokens z nowej tabeli user_device_tokens
      (encja UserDeviceToken: id, userId, token, platform IOS|ANDROID, createdAt, lastUsedAt)
    POST /api/v1/notifications/devices/register
    Body: RegisterDeviceRequest(token, platform)
    Triggery (podpięcie do istniejących service'ów - dodaj 1 linię w każdym):
      MessageService.sendMessage → push do recipientów
      CalendarService.createEvent → push do pacjenta
      MaterialService.createMaterial → push do przypisanych pacjentów
      EventChangeRequestService.acceptChangeRequest/rejectChangeRequest → push do pacjenta

  Workflow:
  1. Sprawdź spec.md linie 297-320 (US-P-21) i 136-148 (US-P-09)
  2. Migracja V4__user_device_tokens.sql
  3. Encje, repozytoria, service'y, kontrolery, DTO records
  4. Triggery push w istniejących service'ach
  5. JUnit testy
  6. Commity:
     a) "backend(auth): add change-password endpoint US-P-09"
     b) "backend(push): add provider abstraction + register-device US-P-21"
     c) "backend(push): wire push triggers in services"
  7. ./gradlew build && ./gradlew test po każdym

  ZAKAZ: implementacja FCM SDK (tylko stub), zmiana frontendu/mobile/docs.
  """
})
```

**Gate Faza 1 → Faza 2:**
- `./gradlew build` zielony.
- 4 commity backendowe na branchu (każdy agent po swoim).
- Spawnuj agenta `general-purpose` na 5 min: weryfikacja że wszystkie 4 patche dotarły, brak konfliktów, testy zielone. Jeśli konflikt — wkrocz, rozwiąż, dopiero wtedy startuj Fazę 2.

---

# FAZA 2 — Frontend Implementation (3 agenty równolegle)

**Dispatch 3 agentów frontendowych RÓWNOLEGLE:**

### Agent F-ADMIN: panele RODO

```
Agent({
  description: "Frontend admin RODO panels",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-frontend, czytaj frontend/CLAUDE.md.

  Cel: UI dla US-A-10..13 w frontend/src/.

  Komponenty (w features/admin/):
    1. PatientDataAdminPage (route: /admin/patients/:id/data)
       - tabs: View | Anonymize | Export | Erase | Audit Trail
    2. AnonymizePatientDialog
       - confirmation z input "ANONYMIZUJ" + dropdown reason
       - calls POST /admin/patients/:id/anonymize
    3. ExportPatientDataButton
       - dropdown: JSON / PDF
       - calls GET /admin/patients/:id/export-data?format=...
       - download via blob
    4. ErasePatientDialog
       - 30-day cooling check (jeśli deletedAt < 30 dni temu — disabled z tooltip)
       - dwustopniowe potwierdzenie + reason
       - calls DELETE /admin/patients/:id/erase
    5. DataProcessingActivitiesPage (route: /admin/data-processing-activities)
       - lista DataProcessingActivity z filtrami
       - CRUD form z RHF + Zod
       - calls /admin/data-processing-activities

  Stack:
    - RTK endpoints w features/admin/api/adminApi.ts (rozszerzenie)
    - RHF + Zod schemas w features/admin/lib/schemas.ts
    - shared/ui Buttons + HeadlessUI Dialog
    - Tailwind, polskie strings

  Workflow:
  1. Sprawdź czy AdminUsersPage / AdminAuditLogsPage istnieją (w features/admin/)
  2. Dodaj routes w app/providers/router/
  3. RoleGuard hasRole(['ADMIN'])
  4. RTK endpoints + invalidation tags
  5. Vitest dla 2 najbardziej krytycznych komponentów (AnonymizePatientDialog,
     DataProcessingActivityForm)
  6. npm run lint && npm run type-check && npm run build
  7. Commit: "frontend(admin): RODO panels US-A-10..13"

  ZAKAZ: zmiana backendu/mobile/docs/tests.
  """
})
```

### Agent F-FUNC: change-password + delegation + PDF export

```
Agent({
  description: "Frontend: change-pw + delegation + PDF",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-frontend, czytaj frontend/CLAUDE.md.

  Cel: UI dla US-P-09 (change password), US-K-14 (oznaczanie/przypisywanie konwersacji),
       US-K-15 (eksport konwersacji do PDF).

  US-P-09 - features/auth/ui/ChangePasswordDialog.tsx:
    - Otwierany z SettingsPage, RHF + Zod (12 znaków, regex strength)
    - Pola: currentPassword, newPassword, confirmNewPassword (z match validation)
    - calls POST /auth/change-password
    - Po sukcesie: clearAuth + redirect /login (bo backend revokuje refresh)

  US-K-14 - features/inbox/ui/:
    - InboxThreadActions.tsx: dropdown z opcjami:
      Mark as: NEW | IN_PROGRESS | RESOLVED | ARCHIVED
      Assign to: <picker staff list>
      Set priority: LOW | NORMAL | HIGH | URGENT
    - calls istniejące endpointy InboxController (już są w backendzie)
    - InboxThreadItem.tsx: badge ze statusem + assignee avatar

  US-K-15 - features/inbox/ui/ExportConversationButton.tsx:
    - Backend NIE MA jeszcze endpointu eksportu PDF konwersacji.
    - Stwórz endpoint w backendzie: POST /api/v1/messages/threads/{threadId}/export?format=pdf
      (rozszerz MessageController + MessageService.exportThreadAsPdf przy pomocy
      jakiejkolwiek dostępnej biblioteki — sprawdź build.gradle czy jest iText/Apache PDFBox;
      jeśli nie ma — dodaj Apache PDFBox 'org.apache.pdfbox:pdfbox:3.0.1', proste rendering)
    - Frontend ExportConversationButton wywołuje endpoint i pobiera blob
    - Commit backend osobno: "backend(messages): export thread to PDF US-K-15" (przed UI)

  Workflow:
  1. Najpierw dodaj backend endpoint dla US-K-15 (build && test) — pojedynczy commit backend
  2. Potem 3 zestawy frontendu, po commicie każdy:
     a) "frontend(auth): change-password dialog US-P-09"
     b) "frontend(inbox): thread actions delegation US-K-14"
     c) "frontend(inbox): export to PDF button US-K-15"
  3. Vitest dla ChangePasswordDialog (validation), InboxThreadActions
  4. npm run lint && npm run type-check && npm run build

  ZAKAZ: zmiana mobile/docs/innych features.
  """
})
```

### Agent F-I18N: setup react-i18next + ekstraktacja stringów

```
Agent({
  description: "Frontend i18n setup PL+EN",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-frontend, czytaj frontend/CLAUDE.md.

  Cel: US-S-17 - setup react-i18next dla PL i EN we frontend/.

  Workflow:
  1. npm install react-i18next i18next i18next-browser-languagedetector
  2. shared/config/i18n.ts: init z resources { pl, en }, default pl, fallback pl
  3. shared/locales/pl.json + en.json - struktura per-feature:
     {
       common: { save, cancel, delete, ... },
       auth: { login: { title, ... }, ... },
       admin: { ... },
       patient: { ... },
       ...
     }
  4. Wrap app w I18nextProvider w app/providers/
  5. Zamień strings w 5 NAJWAŻNIEJSZYCH stronach (priorytet):
     - LoginPage, RegisterPage, DashboardPage, SettingsPage, AdminUsersPage
  6. Dodaj LanguageSwitcher.tsx w SettingsPage (PL / EN toggle, persist w localStorage)
  7. Pozostałych stron NIE TYKAJ — to migracja iteracyjna (tracked jako TODO).

  Commity:
    a) "frontend(i18n): setup react-i18next infra"
    b) "frontend(i18n): translate auth + dashboard + settings + admin/users"
    c) "frontend(i18n): add LanguageSwitcher in settings"

  Walidacja:
    npm run lint && npm run type-check && npm run build
    Vitest dla LanguageSwitcher (toggle + persist)

  Wynotuj listę pozostałych komponentów do tłumaczenia w wynikowym raporcie agenta
  (do podjęcia przez kolejny sprint).

  ZAKAZ: tłumaczenia stron innych niż 5 wymienionych. Zmiana backendu/mobile/docs.
  """
})
```

**Gate Faza 2 → Faza 3:**
- `npm run build` w `frontend/` zielony.
- Commity per agent na branchu (3-4 commity).
- Krótka weryfikacja konfliktów (jeśli np. F-ADMIN i F-FUNC obaj edytowali `frontend/src/app/providers/router/` — rozwiąż merge).

---

# FAZA 3 — Cross-skill (4 agenty równolegle)

**Dispatch 4 agentów RÓWNOLEGLE w jednej wiadomości:**

### Agent M-MOBILE: change-password + FCM push integration

```
Agent({
  description: "Mobile: change-pw screen + FCM push",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-mobile, czytaj mobile/CLAUDE.md.

  Cel: US-P-09 mobile, US-P-21 mobile push integration.

  US-P-09 - mobile/src/features/settings/screens/ChangePasswordScreen.tsx:
    - RHF + Zod (regex 12 znaków)
    - Wywołuje POST /auth/change-password przez RTK (rozszerz authApi)
    - Po sukcesie: clearTokens + reset stack do Auth/Login
    - Dodaj do SettingsStackParamList w AppNavigator
    - Z SettingsHomeScreen: nowy menu item "Zmień hasło"

  US-P-21 - mobile push integration:
    - mobile/src/features/notifications/services/pushRegistration.ts:
      registerForPushAsync():
        1. Notifications.requestPermissionsAsync()
        2. expoPushToken = Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })
        3. POST /api/v1/notifications/devices/register { token, platform }
        4. Persist w SecureStore key=expo_push_token
    - Wywołaj registerForPushAsync() po udanym loginie (w authSlice extraReducers .matchFulfilled login)
    - Wywołaj unregisterPushAsync() przy logout (DELETE /notifications/devices/{token})
    - Notifications.addNotificationResponseReceivedListener: nawigacja na podstawie data.type
      (message → ConversationScreen, event → EventDetailScreen, material → MaterialDetailScreen)

  Workflow:
  1. Sprawdź czy ekran/serwis już istnieje w src/features/ (nie w legacy)
  2. UWAGA: RTK Query w mobile ma hardcoded prod URL — JEŚLI dodajesz nowy endpoint do
     authApi/notificationApi, ZACHOWAJ konwencję istniejących plików (nie naprawiaj globalnie)
  3. Jest + RNTL test dla ChangePasswordScreen (validation, submit success path)
  4. npm run type-check && npm run lint && npm test

  Commity:
    a) "mobile(auth): change-password screen US-P-09"
    b) "mobile(push): register device + listener US-P-21"

  ZAKAZ: globalna naprawa dualnej struktury legacy/src (osobny tech-debt task).
         Zmiana backendu/frontu/docs.
  """
})
```

### Agent D-DEVOPS: docker-compose healthchecks + K6 load tests

```
Agent({
  description: "DevOps: healthchecks + K6 load tests",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-devops, czytaj devops/CLAUDE.md.

  Cele: 
  1. Dodaj brakujące healthchecki w docker-compose.yml
  2. K6 load test scenariusze dla US-S-07/08/09

  TASK 1 - docker-compose.yml healthchecki:
    - backend: 
        healthcheck:
          test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/v1/health"]
          interval: 30s, timeout: 10s, retries: 3, start_period: 60s
    - frontend:
        test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
    - his-mock:
        test: ["CMD", "curl", "-f", "http://localhost:8081/api/v1/health"]
    - depends_on: zmień frontend.depends_on.backend na { condition: service_healthy }
    Commit: "devops(docker): add healthchecks for backend/frontend/his-mock"

  TASK 2 - K6 load tests w devops/load-tests/:
    Stwórz: devops/load-tests/{baseline,stress,spike}/
    Pliki k6 (JS) korzystające z httpx:
      baseline.js - 100 RPS przez 5 min, mierzy p95 latency dla:
        GET /api/v1/health, GET /api/v1/patients (auth), GET /api/v1/projects
      stress.js - rampuje 10 → 500 RPS przez 15 min (sprawdza czy HPA kick-in)
      spike.js - 50 RPS baseline + 10s spike do 1000 RPS + 50 RPS recovery
    Threshold:
      http_req_duration p95 < 2000ms (US-S-07)
      http_req_failed rate < 0.01 (US-S-02 stability)
    devops/load-tests/README.md (krótki — instrukcja uruchomienia, wymóg K8s staging)
    .github/workflows/load-test.yml (manual trigger workflow_dispatch, NIE schedule)

  Commit:
    a) "devops(load): K6 baseline/stress/spike scenarios"
    b) "devops(ci): manual load-test workflow"

  Walidacja:
    docker compose config — composen się waliduje
    k6 inspect baseline.js — k6 syntax OK (jeśli k6 dostępne lokalnie; jeśli nie — pomiń)

  ZAKAZ: zmiana K8s manifestów production (osobny task), zmiana kodu aplikacji.
  """
})
```

### Agent T-TESTER: E2E dla nowych endpointów

```
Agent({
  description: "Tester: E2E for new RODO + change-pw + delegation",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-tester, czytaj TESTING_GUIDE.md i tests/README.md.

  Cel: testy E2E Playwright dla wszystkiego co wprowadziły Fazy 1+2.

  Pliki do dodania w tests/:

  1. tests/admin/rodo.spec.ts (project: regression):
     - "should anonymize patient and verify data anonymized"
     - "should export patient data as JSON" (sprawdza strukturę response)
     - "should export patient data as PDF" (sprawdza Content-Type + non-empty blob)
     - "should erase patient after cooling period"
     - "should reject erase before cooling period (30d)"
     - "should CRUD data processing activities"

  2. tests/admin/data-processing.spec.ts:
     - lista, create, edit, delete

  3. tests/auth/change-password.spec.ts (project: regression):
     - "should change password with valid current"
     - "should reject weak new password" (różne policy violations)
     - "should reject if currentPassword wrong"
     - "should logout all sessions after password change" (verify refresh token revoke)

  4. tests/inbox/delegation.spec.ts (project: phase2):
     - "should mark thread as IN_PROGRESS"
     - "should assign thread to staff member"
     - "should set thread priority"
     - "should export conversation to PDF"

  5. tests/api/rate-limit.api.spec.ts (project: api):
     - "should return 429 after 5 login attempts" (US-S-02)
     - "should reset rate limit after window"

  6. tests/api/project-isolation.api.spec.ts (project: api):
     - "patient from project A cannot read patient B" (US-S-03)
     - "staff outside project team cannot read materials"
     - "admin can access cross-project"

  Workflow:
  1. Sprawdź wzorce w istniejących spec.ts (selektory data-testid, page objects, fixtures)
  2. Skorzystaj z global-setup i .auth/user.json gdzie sensowne
  3. Wszystkie testy MUSZĄ używać data-testid (jeśli komponenty go nie mają — DODAJ je
     przy okazji do komponentów frontendowych w 1 commicie "frontend: add data-testid for E2E")
  4. npx playwright test --project=regression --list (sprawdź że wszystkie się ładują)
  5. JEŚLI staging/lokalne backend działa - npx playwright test --project=api (przynajmniej api)
  6. Commit: "tests(e2e): add specs for RODO + change-pw + delegation + rate-limit + isolation"

  ZAKAZ: zmiana logiki backendu/frontendu/mobile poza dodaniem data-testid w komponentach.
  """
})
```

### Agent K-DOCS: synchronizacja docs z prawdziwym stanem

```
Agent({
  description: "Docs: sync with reality + ADR-010 + archive",
  subagent_type: "general-purpose",
  prompt: """
  Wywołaj skill kpt-dokumentalista, czytaj docs/README.md i 9 istniejących ADR-ów.

  Cele:
  1. Aktualizacja README.md - prawdziwy status (już nie 100%)
  2. Nowy ADR-010 dla decyzji RODO + rate-limiting + per-project auth
  3. docs/api/admin.md - dokumentacja endpointów RODO US-A-10..13
  4. docs/security/rodo-compliance.md - mapowanie funkcji systemu na artykuły RODO
  5. CHANGELOG.md - wpisy z Faz 0/1/2/3
  6. Archiwizacja zwietrzałych raportów: utwórz .archive/ i przenieś:
     - FAZA2_*.md, FAZA3_*.md
     - FINAL_PROJECT_REPORT.md, _v2.md (zostaje FINAL_PROJECT_SUMMARY.md)
     - E2E_COMPLETE_REPORT.md, E2E_FINAL_REPORT.md, E2E_FIX_REPORT.md
     - INTEGRATION_FIX_REPORT.md, SWAGGER_FIX.md
     - GITHUB_ACTIONS_ANALYSIS.md, GITHUB_ACTIONS_LOGS.md, GITHUB_PUSH_INSTRUCTIONS.md
     - PUSH_REPORT.md, FINAL_PUSH_REPORT.md
     - API_ENDPOINTS_COMPLETE.md, API_SUMMARY.md (zawartość już w docs/api/)
     - PROJECT_METRICS.md, PROJECT_COMPLETION_CERTIFICATE.md
     - RAPORT_GAP_ANALYSIS.md, SPRINT_PLAN_4-6.md, TEAM_TASKS.md
     - BACKEND_COMPLETE_REPORT.md, FRONTEND_COMPLETE_REPORT.md, DEVOPS_PRODUCTION_REPORT.md,
       DOCUMENTATION_COMPLETE_REPORT.md, MOBILE_COMPLETE_REPORT.md (już w mobile/),
       TEST_SUMMARY_REPORT.md
     - BACKEND_COMPILATION_*.md (build już zielony)
  7. mobile/README.md - popraw rozjazd: zamień 'Zustand + NativeWind' na 'Redux Toolkit + custom theme'

  Workflow:
  1. README.md - dodaj sekcję "Status realizacji" z tabelą per US-* (na podstawie raportów
     z poprzedniej weryfikacji - sprawdź pamięć / poprzednie raporty z root /home/user1/)
  2. ADR-010 nowy plik docs/decisions/ADR-010-rodo-compliance-architecture.md:
     - Status: ACCEPTED, Data: today
     - Kontekst: 4 wymagania RODO Art. 17/20/30 + szyfrowanie at-rest
     - Decyzja: AesAttributeConverter + RODO endpoints + DataProcessingActivity registry
     - Konsekwencje: encryption key management, GDPR compliance verification cycle
  3. docs/api/admin.md - rozszerz o anonymize, export-data, erase, data-processing-activities
  4. docs/security/rodo-compliance.md - nowy plik z tabelą Art.RODO → endpoint/feature
  5. CHANGELOG.md - format Keep a Changelog, sekcja "## [Unreleased]" z dodanymi rzeczami
  6. mkdir -p .archive && git mv <stary plik> .archive/ dla każdego archiwizowanego
  7. mobile/README.md - sed-ish poprawka stack listy

  Commity:
    a) "docs(rodo): add ADR-010 + admin RODO endpoints + rodo-compliance.md"
    b) "docs(readme): sync project status with reality"
    c) "docs(changelog): add unreleased entries"
    d) "docs(archive): move stale reports to .archive/"
    e) "docs(mobile): fix README stack mismatch"

  ZAKAZ: usuwanie plików (tylko move do .archive/). Zmiana kodu produkcyjnego.
  """
})
```

**Gate Faza 3 → Finalizacja:**
- Po wszystkich 4 agentach: `git log --oneline | head -30` powinno pokazać ~15-20 nowych commitów (tematycznie czystych).
- `./gradlew build && cd frontend && npm run build && cd ../mobile && npm run type-check` — wszystko zielone.
- `npx playwright test --project=api --list` — listing testów bez błędu konfiguracji.

---

# FINALIZACJA — synthesis (1 agent ogólny)

```
Agent({
  description: "Final synthesis report",
  subagent_type: "general-purpose",
  prompt: """
  Cel: jeden raport końcowy z całej operacji rescue.

  Workflow:
  1. git log --oneline od commit-a sprzed Fazy 0 do HEAD
  2. Per faza wynotuj:
     - Co zaplanowane vs co zrobione
     - Liczbę nowych endpointów / komponentów / testów
     - Czy build/test zielony
  3. Tabela US z poprzedniej analizy (89 historii) zaktualizuj statusami:
     - przed rescue: 19 FULL / 21 NO_TEST / 37 PARTIAL / 2 BROKEN / 11 MISSING
     - po rescue: ?
  4. Lista pozostałych luk (czego rescue NIE zrobił - świadomie):
     - Globalna migracja struktur mobile (legacy → src/)
     - Pozostałe strony i18n (poza 5 priorytetowych)
     - Real-time WebSocket (US-S-06) - zostawione jako osobna decyzja architektoniczna
     - HIS Strategy Pattern (US-S-05) - osobny task
     - Soft-delete cooling period < 30 dni edge case
     - Redis HA (Sentinel/Cluster)
     - Bundle size profiling mobile
  5. Rekomendacje na sprint kolejny.

  Format: jeden plik /home/user1/KPTESTPRO/RESCUE_COMPLETION_REPORT.md
  Po polsku, technicznie, ścieżki [plik](ścieżka).

  Commit: "docs(rescue): completion report"

  Aktualizuj memory:
    Wpis project_kptestpro_state.md - update sekcję "Stan na" do dnia rescue, opis
    co zostało naprawione, że build zielony.
  """
})
```

---

# CONSTRAINTS GLOBALNE

- **Sekrety:** klucze szyfrowania (KPTEST_DB_ENCRYPTION_KEY) - tylko placeholder w `.env.example`, dev-only fallback, NIGDY commit prawdziwego klucza.
- **Branch:** wszystkie commity na `main` (lokalny). NIE pushuj. NIE twórz PR. Ostatecznie zostawiam decyzję push użytkownikowi.
- **Migracje DB:** numeruj sekwencyjnie od V2. Jeśli dwa agenty potrzebują migracji, zsynchronizuj numery (V2/V3/V4) przed commitami — niech B-RODO-2 weźmie V2, B-SEC weźmie V3, B-FUNC weźmie V4.
- **Build cache:** jeśli któryś agent traci kontekst — niech robi `./gradlew --stop` przed `./gradlew build`.
- **Konflikty merge:** jeśli wystąpią między agentami - rozwiąż ręcznie (NIE `git checkout --theirs/--ours` ślepo). Wczytaj oba pliki, scalaj logicznie.
- **Stop conditions globalne:** jeśli faza padła (build broken po fazie) - zatrzymaj, raportuj, NIE startuj kolejnej.

# OCZEKIWANY WYNIK

- Backend kompiluje się i przechodzi testy.
- 4 endpointy RODO + change-password + push trigger w backendzie.
- PESEL szyfrowany at-rest, rate limiting aktywny, per-project authorization wszędzie.
- Frontend ma panele RODO + dialog zmiany hasła + delegation w inbox + PDF export + i18n na 5 stronach.
- Mobile ma change-password screen + FCM push wired.
- 6 nowych specs E2E + healthchecki w docker-compose + K6 scenariusze.
- Docs zsynchronizowane (ADR-010, rodo-compliance.md, README z prawdziwym statusem) i archiwum zaśmieconych raportów.
- 1 finalny raport `RESCUE_COMPLETION_REPORT.md`.

Łącznie ~15-20 commitów, ~3-5 godzin pracy agentów (z faz parallel ~1.5h zegara realnego).

Powodzenia.
