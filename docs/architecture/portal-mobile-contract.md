---
name: Portal ↔ Mobile API Contract (US-S-06)
description: Inwentaryzacja endpointów konsumowanych przez aplikację mobilną, ocena spójności DTO i rekomendacje (OpenAPI codegen, Pact)
type: architecture
status: ACCEPTED
date: 2026-04-29
---

# Portal ↔ Mobile — Kontrakt komunikacji

> **User Story US-S-06**: Portal (web) i aplikacja mobilna (React Native) komunikują się
> przez REST API. Kontrakty muszą być spójne — typy DTO współdzielone.

## 1. Podsumowanie wykonawcze

- **Wspólne źródło prawdy**: brak. Nie istnieje katalog `shared-types/`, `contracts/`,
  ani plik `openapi.yaml` w repo. Backend udostępnia Swagger UI (springdoc 2.3.0) —
  ale nikt nie generuje z niego typów dla frontu/mobile.
- **Typy DTO**: kopiowane ręcznie z TypeScript do TypeScript. `frontend/src/features/*/api/*.ts`
  i `mobile/src/features/*/api/*.ts` mają **dwa równoległe drzewa** typów RTK Query.
- **Auth**: oba klienci uderzają w te same endpointy `/auth/login`, `/auth/refresh`, ten sam JWT.
- **Base URL mobile**: `https://api.kptest.com` (env `EXPO_PUBLIC_API_URL`).
  Brak prefixu `/api/v1` w mobilnym `BASE_URL` — większość mobilnych endpointów żyje pod
  ścieżkami **bez** `/api/v1`, podczas gdy backend kontrolery mają `@RequestMapping("/api/v1/...")`.
  **To jest rozjazd** — opisany w sekcji „Ryzyka".

## 2. Inventory — endpointy konsumowane przez mobilkę

Skanowano: `mobile/src/features/*/api/*.ts` i `mobile/src/app/api.ts`.

| Endpoint                                                | Method | Mobile (RTK)                      | Portal (frontend) | Notatki                                                          |
|---------------------------------------------------------|--------|-----------------------------------|-------------------|------------------------------------------------------------------|
| `/auth/login`                                           | POST   | `authApi.login`                   | TAK               | Brak `/api/v1` prefix w mobile call                              |
| `/auth/register`                                        | POST   | `authApi.register`                | TAK               |                                                                  |
| `/auth/verify-2fa`                                      | POST   | `authApi.verify2fa`               | TAK               |                                                                  |
| `/auth/send-2fa`                                        | POST   | `authApi.send2fa`                 | TAK               |                                                                  |
| `/auth/reset-password`                                  | POST   | `authApi.resetPassword`           | TAK               |                                                                  |
| `/auth/confirm-reset-password`                          | POST   | `authApi.confirmResetPassword`    | TAK               |                                                                  |
| `/auth/logout`                                          | POST   | `authApi.logout`                  | TAK               |                                                                  |
| `/auth/me`                                              | GET    | `authApi.getMe`                   | TAK               |                                                                  |
| `/auth/refresh`                                         | POST   | `authApi.refresh`                 | TAK               |                                                                  |
| `/auth/change-password`                                 | POST   | `authApi.changePassword`          | TAK               |                                                                  |
| `/patients`                                             | GET    | `patientApi.list`                 | TAK               |                                                                  |
| `/patients`                                             | POST   | `patientApi.create`               | TAK               |                                                                  |
| `/patients/{id}`                                        | GET    | `patientApi.get`                  | TAK               |                                                                  |
| `/patients/{id}`                                        | PUT    | `patientApi.update`               | TAK               |                                                                  |
| `/patients/{id}`                                        | DELETE | `patientApi.delete`               | TAK               |                                                                  |
| `/patients/{id}/projects`                               | GET    | `patientApi.getProjects`          | TAK               |                                                                  |
| `/patients/search`                                      | GET    | `patientApi.search`               | TAK               |                                                                  |
| `/projects`                                             | GET    | `projectApi.list`                 | TAK               |                                                                  |
| `/projects`                                             | POST   | `projectApi.create`               | TAK               |                                                                  |
| `/projects/{id}`                                        | GET    | `projectApi.get`                  | TAK               |                                                                  |
| `/projects/{id}`                                        | PUT    | `projectApi.update`               | TAK               |                                                                  |
| `/projects/{id}`                                        | DELETE | `projectApi.delete`               | TAK               |                                                                  |
| `/projects/{id}/patients`                               | GET    | `projectApi.getPatients`          | TAK               |                                                                  |
| `/projects/{projectId}/patients/{patientId}`            | POST   | `projectApi.assignPatient`        | TAK               |                                                                  |
| `/projects/{projectId}/patients/{patientId}`            | DELETE | `projectApi.unassignPatient`      | TAK               |                                                                  |
| `/projects/search`                                      | GET    | `projectApi.search`               | TAK               |                                                                  |
| `/projects/{projectId}/materials`                       | GET    | `materialApi.byProject`           | TAK               |                                                                  |
| `/materials`                                            | GET    | `materialApi.list`                | TAK               |                                                                  |
| `/materials/{id}`                                       | GET    | `materialApi.get`                 | TAK               |                                                                  |
| `/materials/categories`                                 | GET    | `materialApi.categories`          | TAK               |                                                                  |
| `/materials/{id}/read`                                  | POST   | `materialApi.markRead`            | częściowo         | Mobile-first feature                                             |
| `/materials/{id}/download`                              | POST   | `materialApi.download`            | TAK               |                                                                  |
| `/materials/{id}/download`                              | DELETE | `materialApi.cancelDownload`      | tylko mobile      | Cleanup po stronie backendu offline-mode                         |
| `/materials/search`                                     | GET    | `materialApi.search`              | TAK               |                                                                  |
| `/calendar/events`                                      | GET    | `calendarApi.list`                | TAK               |                                                                  |
| `/calendar/events`                                      | POST   | `calendarApi.create`              | TAK               |                                                                  |
| `/calendar/events/{id}`                                 | GET    | `calendarApi.get`                 | TAK               |                                                                  |
| `/calendar/events/{id}`                                 | PUT    | `calendarApi.update`              | TAK               |                                                                  |
| `/calendar/events/{id}`                                 | DELETE | `calendarApi.delete`              | TAK               |                                                                  |
| `/calendar/events/{id}/complete`                        | POST   | `calendarApi.complete`            | częściowo         |                                                                  |
| `/calendar/export`                                      | POST   | `calendarApi.export`              | TAK               | iCal export                                                      |
| `/calendar/sync`                                        | POST   | `calendarApi.sync`                | tylko mobile      | Synchronizacja offline                                           |
| `/messages/threads`                                     | GET    | `messageApi.threads`              | TAK               |                                                                  |
| `/messages/threads`                                     | POST   | `messageApi.createThread`         | TAK               |                                                                  |
| `/messages/threads/{id}`                                | GET    | `messageApi.thread`               | TAK               |                                                                  |
| `/messages/threads/{threadId}/messages`                 | GET    | `messageApi.threadMessages`       | TAK               |                                                                  |
| `/messages/threads/{threadId}/read`                     | POST   | `messageApi.markThreadRead`       | TAK               |                                                                  |
| `/messages`                                             | POST   | `messageApi.send`                 | TAK               |                                                                  |
| `/messages/{messageId}/read`                            | POST   | `messageApi.markRead`             | TAK               |                                                                  |
| `/messages/{messageId}`                                 | DELETE | `messageApi.delete`               | TAK               |                                                                  |
| `/messages/search`                                      | GET    | `messageApi.search`               | TAK               |                                                                  |
| `/notifications/settings`                               | GET    | `notificationApi.getSettings`     | TAK               |                                                                  |
| `/notifications/settings/preferences`                   | PUT    | `notificationApi.updatePrefs`     | TAK               |                                                                  |
| `/notifications/settings/quiet-hours`                   | PUT    | `notificationApi.setQuietHours`   | TAK               |                                                                  |
| `/notifications/register-token`                         | POST   | `notificationApi.registerToken`   | tylko mobile      | Push token (FCM/APNs)                                            |
| `/notifications/unregister-token`                       | POST   | `notificationApi.unregisterToken` | tylko mobile      |                                                                  |
| `/notifications/mark-all-read`                          | POST   | `notificationApi.markAllRead`     | TAK               |                                                                  |
| `/notifications/badge`                                  | GET    | `notificationApi.getBadge`        | tylko mobile      | Liczba nieprzeczytanych dla badge na ikonie aplikacji            |
| `/notifications/badge`                                  | PUT    | `notificationApi.setBadge`        | tylko mobile      |                                                                  |
| `/stats/compliance`                                     | GET    | `statsApi.compliance`             | TAK               |                                                                  |
| `/stats/events`                                         | GET    | `statsApi.events`                 | TAK               |                                                                  |
| `/stats/materials`                                      | GET    | `statsApi.materials`              | TAK               |                                                                  |
| `/stats/compliance/chart`                               | GET    | `statsApi.complianceChart`        | TAK               |                                                                  |
| `/api/v1/badges/{patientBadgeId}/notify`                | POST   | `badgeApi.notify`                 | częściowo         | **Z prefixem `/api/v1`** — niespójność                           |
| `/api/v1/quizzes/{quizId}/attempts?patientId=...`       | POST   | `quizApi.startAttempt`            | TAK               | **Z prefixem `/api/v1`** — niespójność                           |
| `/api/v1/quizzes/attempts/submit`                       | POST   | `quizApi.submit`                  | TAK               | **Z prefixem `/api/v1`** — niespójność                           |

**Łącznie ok. 65 endpointów konsumowanych przez mobile**, w tym **3 jawnie z prefixem
`/api/v1`** (badge, quiz×2) i **62 bez prefixu**. Backend jednak zawsze publikuje pod
`/api/v1/...` (zob. `@RequestMapping` w `AuthController`, `PatientController` itd.).

## 3. Spójność DTO

### 3.1. Dwa równoległe drzewa typów

```
frontend/src/features/auth/api/authApi.ts    ──┐
                                                 ├── nie wiedzą o sobie
mobile/src/features/auth/api/authApi.ts      ──┘
```

Każdy klient definiuje **lokalnie**:
- `LoginRequest`, `LoginResponse`, `User`, `AuthTokens`,
- `Patient`, `Project`, `Material`, `CalendarEvent`, `Message`, `Notification`...

Zmiana DTO w backendzie wymaga ręcznej synchronizacji w **dwóch** miejscach. Ryzyko
desynchronizacji rośnie z każdym sprintem.

### 3.2. Brak generatora z OpenAPI

- Backend ma `springdoc-openapi-starter-webmvc-ui:2.3.0` — Swagger UI dostępny pod `/swagger-ui.html`.
- W `frontend/package.json` ani `mobile/package.json` nie ma generatorów (`openapi-typescript`,
  `orval`, `openapi-generator-cli`).
- W `.github/workflows/` nie ma kroku eksportu `openapi.json`.

**Wniosek**: Swagger służy wyłącznie eksploracji API, nie jest źródłem prawdy dla
typów klienta. To **techniczny dług** udokumentowany w niniejszym dokumencie.

## 4. Auth flow — portal vs mobile

| Aspekt                       | Portal                                                | Mobile                                                |
|------------------------------|-------------------------------------------------------|-------------------------------------------------------|
| Endpoint logowania           | `POST /api/v1/auth/login`                             | `POST /auth/login` (brak prefixu — wymaga rewrite proxy/CORS) |
| Format JWT                   | Bearer                                                | Bearer                                                |
| Refresh                      | `/auth/refresh`                                       | `/auth/refresh`                                       |
| Storage tokenu               | `localStorage` (frontend RTK)                         | `expo-secure-store` (mobile shared)                   |
| 2FA                          | TOTP (`/auth/verify-2fa`)                             | TOTP (ten sam endpoint)                               |
| Biometria                    | nie dotyczy                                           | TAK (warstwa nad istniejącym JWT, lokalna weryfikacja) |

**Dobrze**: te same endpointy, ten sam token. **Źle**: brak prefixu w mobile bazie URL +
dwa różne mechanizmy storage'u (akceptowalne ze względu na platformę).

## 5. Ryzyka

### R1. Desynchronizacja DTO (HIGH)
Po dodaniu pola `Patient.consentVersion` w backendzie, frontend i mobile muszą zostać
ręcznie zaktualizowane. Brak compile-time check po stronie klienta — błędy ujawnią się
dopiero w runtime (RTK Query rzuci `parsing error` albo nie zmapuje pola).

**Mitigacja**: zob. sekcja 6 (OpenAPI codegen).

### R2. Niespójny base URL mobile (MEDIUM)
Mobile bazowy URL to `https://api.kptest.com`, ale endpointy mobile to `/auth/login`,
`/patients` itp. — bez `/api/v1`. Tymczasem 3 endpointy (badge, quiz×2) jawnie mają
`/api/v1/...`. Rzeczywista praca aplikacji zależy od tego, czy:
- (a) ingress/nginx ma rewrite `^/(auth|patients|...)` → `/api/v1/$1`, **albo**
- (b) `EXPO_PUBLIC_API_URL` w prod kończy się na `/api/v1`.

**Mitigacja**: ustalić jedną konwencję (rekomendacja: wszystkie ścieżki `/api/v1/...`
po stronie klienta, base URL bez prefixu) i wymusić ją lintem (np. ESLint rule lub
testem snapshotowym RTK).

### R3. Endpointy „mobile-only" bez kontraktu testowego (LOW)
`/notifications/register-token`, `/notifications/badge`, `/calendar/sync`,
`/materials/{id}/download` (DELETE) są używane wyłącznie przez mobilkę. Zmiana
sygnatury w backendzie nie zostanie zauważona przez E2E portalu.

**Mitigacja**: dodać contract testy (zob. sekcja 7).

### R4. Brak wersjonowania API (MEDIUM)
Mimo prefixu `/api/v1`, nie ma planu migracji do `/v2`. Mobile auto-update przez OTA
(EAS Update) może wymusić synchronizację: stara wersja mobile + nowy backend = błąd 400.

**Mitigacja**: trzymać `/v1` non-breaking, nowe pola opcjonalne, deprecation header
`Sunset:` na endpointach do usunięcia.

## 6. Rekomendacja: OpenAPI codegen

> **Status (B3 / US-S-06): ZAIMPLEMENTOWANE — 2026-04-29.**
>
> - `frontend/src/shared/api/generated/types.ts` — 8155 linii, 122 schemas, 129 paths.
> - `mobile/src/shared/api/generated/types.ts` — wygenerowane z tego samego snapshot.
> - Snapshot OpenAPI commitowany jako `frontend/openapi.json` (single source of truth).
> - Skrypty: `npm run generate:api` (live z `localhost:8080`) i
>   `npm run generate:api:offline` (z `frontend/openapi.json`) — w obu aplikacjach.
> - Sample użycia: `frontend/src/features/projects/api/projectApi.ts`
>   (`GeneratedProjectResponse = components['schemas']['ProjectResponse']`).
> - Decyzja architektoniczna i konsekwencje: zob. `docs/architecture/adr/ADR-005.md`.
>
> Adopcja jest **incremental** — istniejące typy lokalne (`features/*/types.ts`)
> pozostają, nowe miejsca importują typy z `@shared/api/generated/types`.
> Pre-commit hook + CI verify są follow-upem (TODO).

### Plan wdrożenia (estymata: 1 sprint) — historia decyzji

1. **Backend** — zapewnić, że springdoc generuje pełny `openapi.json`:
   ```yaml
   springdoc:
     api-docs:
       path: /v3/api-docs
       enabled: true
   ```
   + adnotacje `@Schema(description=..., example=...)` na DTO records'ach.

2. **CI workflow** — nowy job `export-openapi.yml`:
   ```yaml
   - run: ./gradlew bootRun &
   - run: sleep 30 && curl -o openapi.json http://localhost:8080/v3/api-docs
   - uses: actions/upload-artifact@v4
     with: { name: openapi-spec, path: openapi.json }
   ```

3. **Shared types package** — `shared-types/` na poziomie root repo (lub publikacja jako
   prywatny pakiet npm `@kptest/api-types`):
   ```
   shared-types/
     openapi.json          # commitowany lub generowany w CI
     package.json
     src/types.ts          # generated
   ```

4. **Frontend i mobile** — w `package.json`:
   ```json
   "devDependencies": {
     "openapi-typescript": "^7.0.0"
   },
   "scripts": {
     "gen:types": "openapi-typescript ../shared-types/openapi.json -o src/shared/api/types.gen.ts"
   }
   ```
   Wynikowy `types.gen.ts` re-exportuje typy: `LoginRequest`, `PatientDto`, etc.
   Każdy `*Api.ts` importuje typy z `types.gen.ts` zamiast definiować lokalnie.

5. **Pre-commit hook** — `lint-staged` uruchamia `npm run gen:types` jeśli
   `openapi.json` się zmienił.

**Alternatywa cięższa**: `orval` — generuje gotowe RTK Query slice'y z definicji
OpenAPI. Mniej własnego kodu w `*Api.ts`, ale dodaje opinionated runtime.

## 7. Rekomendowane testy konsumenckie (Pact / contract testing)

### Cel
Wyłapać desynchronizację portal/mobile vs backend **przed** zmergowaniem PR-a, bez
konieczności podnoszenia całego stacka E2E.

### Architektura

```
                ┌────────────────────────┐
                │  Backend (Provider)    │
                │  Spring Boot           │
                │                        │
                │ @PactBroker            │
                └────────▲───────────────┘
                         │ provider verification
                         │
                ┌────────┴───────────────┐
                │  Pact Broker           │
                │  (Pactflow / OSS)      │
                └────────▲───────────────┘
                         │ publish pacts
       ┌─────────────────┼──────────────────┐
       │                 │                  │
┌──────┴────────┐ ┌──────┴────────┐ ┌──────┴────────┐
│ Frontend      │ │ Mobile        │ │ (any future   │
│ (Consumer)    │ │ (Consumer)    │ │  consumer)    │
│ Pact + Vitest │ │ Pact + Jest   │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Implementacja po stronie konsumenta (mobile, przykład)

```typescript
// mobile/src/features/auth/api/__tests__/authApi.contract.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'kptest-mobile',
  provider: 'kptest-backend',
  dir: '../../../pacts',
});

describe('AuthApi contract', () => {
  it('POST /api/v1/auth/login returns AuthResponse', async () => {
    await provider
      .given('user with email therapist@kptest.com exists')
      .uponReceiving('a login request')
      .withRequest({
        method: 'POST',
        path: '/api/v1/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'therapist@kptest.com', password: 'P@ssw0rd123!' },
      })
      .willRespondWith({
        status: 200,
        body: {
          accessToken: MatchersV3.like('eyJhbGc...'),
          refreshToken: MatchersV3.like('eyJhbGc...'),
          requires2fa: MatchersV3.boolean(false),
          user: {
            id: MatchersV3.uuid(),
            email: 'therapist@kptest.com',
            role: MatchersV3.regex('^(STAFF|ADMIN|PATIENT)$', 'STAFF'),
          },
        },
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/v1/auth/login`, { /* ... */ });
        expect(res.status).toBe(200);
      });
  });
});
```

Kontrakt jest publikowany do Pact Brokera przy każdym mergu do `main` (CI:
`.github/workflows/pact-publish.yml`).

### Implementacja po stronie providera (backend)

```java
// backend/src/test/java/com/kptest/contract/PactProviderTest.java
@Provider("kptest-backend")
@PactBroker(host = "${PACT_BROKER_HOST}")
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class PactProviderTest {

    @LocalServerPort int port;

    @BeforeEach
    void setup(PactVerificationContext ctx) {
        ctx.setTarget(new HttpTestTarget("localhost", port));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPact(PactVerificationContext ctx) {
        ctx.verifyInteraction();
    }

    @State("user with email therapist@kptest.com exists")
    void seedUser() {
        userRepository.save(...);
    }
}
```

Cykl: konsument zmienia DTO → publikuje pakt → backend pull provider verification →
**FAIL** jeżeli backend nie spełnia kontraktu → autor PR-a wie, że trzeba dostosować
backend ALBO konsumenta przed mergem.

### Co NIE jest w zakresie Pact
- Testy wydajnościowe (zostają k6/Gatling, są w `tests/k6/`).
- Testy semantyki domenowej (zostają E2E Playwright).
- Pact pokrywa **shape** odpowiedzi, nie pełne flow biznesowe.

### Rekomendacja minimum (sprint 1)
- Pakty na **Auth** (login/refresh/me), **Patient CRUD**, **Notification settings**,
  **Push token register/unregister** — endpointy wspólne dla obu konsumentów + krytyczne
  dla mobile-only.
- 8–10 paktów wystarczy na first iteration.

---

## 8. Podsumowanie

| Pytanie z US-S-06                            | Odpowiedź                                                |
|----------------------------------------------|----------------------------------------------------------|
| Czy istnieje shared types package?           | **TAK (B3, 2026-04-29)** — `openapi-typescript` codegen, snapshot `frontend/openapi.json`. |
| Czy frontend i mobile mają osobne typy?      | **TAK (lokalne, legacy)** + **NIE (generowane, single-source)** — adopcja incremental. |
| Ile endpointów konsumuje mobile?             | **~65** (z czego ~5 jest mobile-only).                    |
| Czy auth jest spójny?                        | **TAK** co do endpointów i JWT, **NIE** co do prefixu URL. |
| Główne ryzyka                                | desynchronizacja DTO (zaadresowane B3), niespójny base URL, brak contract testów |
| Rekomendacja                                 | ~~OpenAPI codegen~~ (DONE — B3, ADR-005) + Pact dla 8–10 kluczowych endpointów (TODO) |
