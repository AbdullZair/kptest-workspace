# Sprint Plan 4-6

**Projekt:** IFPS-TMS (System Zarządzania Terapią Pacjentów po Implantacji Ślimakowej)
**Okres:** 2026-05-01 do 2026-06-12 (6 tygodni)
**Wersja:** 1.0

---

## Overview

| Sprint | Okres | Cel Główny |
|--------|-------|------------|
| Sprint 4 | 2026-05-01 do 2026-05-14 (2 tygodnie) | Uzupełnienie braków funkcjonalnych (Must Have) |
| Sprint 5 | 2026-05-15 do 2026-05-28 (2 tygodnie) | Funkcje Should Have + UX improvements |
| Sprint 6 | 2026-05-29 do 2026-06-12 (2 tygodnie) | Funkcje Could Have + Phase 2 prep |

---

## Sprint 4 (2026-05-01 do 2026-05-14)

### Cel Sprintu
Uzupełnienie brakujących funkcji o wysokim priorytecie z specyfikacji Must Have oraz przygotowanie do wdrożenia produkcyjnego.

### Backend

#### Priorytet Wysoki
- [ ] **US-P-02:** Endpoint weryfikacji pacjenta z numerem kartoteki HIS
  - `POST /api/v1/patients/verify-his` z parametrami: PESEL + numer_kartoteki
  - Walidacja: format numeru kartoteki (regex)
  - Response: dane pacjenta z HIS lub błąd
  - Audyt: logowanie każdej próby weryfikacji
  - **Pliki:** `PatientController.java`, `PatientService.java`, `HisClient.java`
  - **Czas:** 3 dni

- [ ] **US-NH-08:** Priorytety wiadomości (INFO/PYTANIE/PILNE)
  - Nowy enum `MessagePriority: INFO, QUESTION, URGENT`
  - Endpoint: `PUT /api/v1/messages/{id}/priority`
  - Sortowanie inboxa wg priorytetu
  - Powiadomienie SMS/email przy priorytecie PILNE (konfigurowalne)
  - **Pliki:** `Message.java`, `MessagePriority.java`, `MessageController.java`
  - **Czas:** 2 dni

- [ ] **US-NH-17:** Wymuszenie resetu hasła przez administratora
  - Endpoint: `POST /api/v1/admin/users/{id}/force-password-reset`
  - Unieważnienie aktualnego hasła
  - Wylogowanie wszystkich aktywnych sesji
  - Wymagane pole: `reason` (audyt)
  - **Pliki:** `AdminController.java`, `UserService.java`, `AuditService.java`
  - **Czas:** 1 dzień

- [ ] **US-NH-18:** Wyczyszczenie konfiguracji 2FA przez administratora
  - Endpoint: `POST /api/v1/admin/users/{id}/clear-2fa`
  - Usunięcie sekretu 2FA i kodów zapasowych
  - Wylogowanie wszystkich sesji
  - Wymagane pole: `reason` (audyt, szczególnie wrażliwe)
  - **Pliki:** `AdminController.java`, `TwoFactorService.java`, `AuditService.java`
  - **Czas:** 1 dzień

- [ ] **US-NH-13:** Central inbox z delegowaniem
  - Endpoint: `GET /api/v1/messages/inbox` (agregacja ze wszystkich projektów)
  - Filtry: priorytet, status, projekt, przypisanie
  - Endpoint: `PUT /api/v1/messages/{id}/delegate` (przypisanie do członka zespołu)
  - Status wątku: NEW, IN_PROGRESS, RESOLVED, CLOSED
  - **Pliki:** `MessageController.java`, `MessageService.java`, `ConversationRepository.java`
  - **Czas:** 3 dni

#### Priorytet Średni
- [ ] **Testy jednostkowe:** Rozszerzenie coverage do 85%
  - Testy dla nowych endpointów
  - Testy integracyjne z HIS mock
  - **Czas:** 2 dni

- [ ] **Dokumentacja API:** Aktualizacja OpenAPI spec
  - Nowe endpointy
  - Przykłady request/response
  - **Czas:** 1 dzień

### Frontend

#### Priorytet Wysoki
- [ ] **US-P-02:** Formularz weryfikacji HIS w rejestracji
  - Pola: PESEL (auto-fill), numer kartoteki (input)
  - Walidacja online formatu numeru kartoteki
  - Komunikaty błędów: przyjazne dla użytkownika
  - **Pliki:** `RegisterPage.tsx`, `HisVerificationForm.tsx`
  - **Czas:** 2 dni

- [ ] **US-NH-08:** Priorytety wiadomości w UI
  - Selector priorytetu przy wysyłaniu wiadomości
  - Wizualne wyróżnienie priorytetów w inboxie (kolory, ikony)
  - Tooltip z wyjaśnieniem priorytetów
  - **Pliki:** `MessageComposer.tsx`, `InboxList.tsx`, `ConversationThread.tsx`
  - **Czas:** 2 dni

- [ ] **US-NH-13:** Central Inbox w dashboardzie
  - Nowy widżet w dashboardzie: "Oczekujące wiadomości"
  - Filtry: priorytet, status, projekt
  - Akcje: deleguj, zmień status
  - **Pliki:** `DashboardPage.tsx`, `CentralInboxWidget.tsx`, `InboxPage.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-17/18:** Panel administratora - zarządzanie użytkownikami
  - Przycisk "Wymuś reset hasła" w szczegółach użytkownika
  - Przycisk "Wyczyść 2FA" w szczegółach użytkownika
  - Modal z potwierdzeniem i polem przyczyny
  - **Pliki:** `UserManagementPage.tsx`, `UserDetailPage.tsx`, `AdminActionsModal.tsx`
  - **Czas:** 2 dni

#### Priorytet Średni
- [ ] **Poprawki UX:** Ujednolicenie komunikatów błędów
  - Walidacja formularzy: spójne komunikaty
  - Error boundaries: obsługa nieoczekiwanych błędów
  - Loading states: spójne animacje
  - **Pliki:** `shared/components/ui/*`
  - **Czas:** 2 dni

- [ ] **Testy E2E:** Nowe scenariusze dla funkcji Sprint 4
  - Weryfikacja HIS
  - Priorytety wiadomości
  - Central inbox
  - Admin actions
  - **Czas:** 2 dni

### Mobile

#### Priorytet Wysoki
- [ ] **US-P-02:** Ekran weryfikacji HIS w rejestracji
  - Pola: PESEL (auto-fill), numer kartoteki
  - Walidacja formatu
  - Komunikat statusu: "Oczekiwanie na weryfikację"
  - **Pliki:** `app/register.tsx`, `features/auth/HisVerificationScreen.tsx`
  - **Czas:** 2 dni

- [ ] **US-NH-08:** Priorytety wiadomości w mobile
  - Selector priorytetu przy wysyłaniu
  - Wizualne wyróżnienie w liście konwersacji
  - **Pliki:** `features/messages/MessageComposer.tsx`, `features/messages/ConversationList.tsx`
  - **Czas:** 2 dni

#### Priorytet Średni
- [ ] **Poprawki UX mobile:** Dostosowanie do Material Design / HIG
  - Touch targets: min. 44x44px
  - Czcionki: skalowalność systemowa
  - Kolory: kontrast WCAG AA
  - **Pliki:** `components/ui/*`
  - **Czas:** 2 dni

### DevOps

#### Priorytet Wysoki
- [ ] **HIS Mock:** Rozszerzenie o endpoint weryfikacji z numerem kartoteki
  - `POST /api/v1/his/verify` z PESEL + numer_kartoteki
  - Response: dane pacjenta lub błąd 404
  - **Pliki:** `devops/his-mock/`, `docker-compose.yml`
  - **Czas:** 2 dni

- [ ] **CI/CD:** Pipeline dla nowych funkcji
  - Testy automatyczne dla priorytetów wiadomości
  - Testy automatyczne dla admin actions
  - **Pliki:** `.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`
  - **Czas:** 1 dzień

- [ ] **Monitoring:** Dashboard dla priorytetów wiadomości
  - Liczba wiadomości per priorytet
  - Czas reakcji na wiadomości PILNE
  - **Pliki:** `devops/grafana/dashboards/`, `devops/prometheus/rules/`
  - **Czas:** 1 dzień

### Technical Writer

#### Priorytet Wysoki
- [ ] **Dokumentacja użytkownika:** Aktualizacja o nowe funkcje
  - Rozdział: Weryfikacja HIS
  - Rozdział: Priorytety wiadomości
  - Rozdział: Central inbox
  - Rozdział: Narzędzia administratora
  - **Pliki:** `docs/user-guide/`
  - **Czas:** 2 dni

- [ ] **Release Notes:** Sprint 4
  - Lista zmian
  - Instrukcja migracji (jeśli dotyczy)
  - **Pliki:** `CHANGELOG.md`
  - **Czas:** 1 dzień

---

## Sprint 5 (2026-05-15 do 2026-05-28)

### Cel Sprintu
Funkcje Should Have: biometria, tryb uproszczony UI, powiadomienia email, wersjonowanie materiałów.

### Backend

#### Priorytet Wysoki
- [ ] **US-NH-11:** Biometria - endpointy wspierające
  - Endpoint: `POST /api/v1/auth/biometric-register` (rejestracja klucza biometrycznego)
  - Endpoint: `POST /api/v1/auth/biometric-login` (logowanie biometrią)
  - Walidacja: podpis cyfrowy z urządzenia mobilnego
  - Rate limiting: 5 prób na godzinę
  - **Pliki:** `AuthController.java`, `BiometricService.java`, `BiometricKey.java`
  - **Czas:** 3 dni

- [ ] **US-NH-10:** Tryb uproszczony - backend
  - Nowy atrybut użytkownika: `simplified_ui_mode: boolean`
  - Endpoint: `PUT /api/v1/users/profile/simplified-mode`
  - API zwraca flagę w response profilu
  - **Pliki:** `User.java`, `UserController.java`, `UserProfileDto.java`
  - **Czas:** 1 dzień

- [ ] **US-NH-22:** Powiadomienia email
  - Integracja z SMTP / SendGrid / Mailgun
  - Szablony email: nowe wiadomości, wydarzenia, materiały
  - Konfiguracja: włącz/wyłącz per użytkownik
  - Rate limiting: max 50 emaili/godzinę na użytkownika
  - **Pliki:** `EmailService.java`, `EmailTemplate.java`, `NotificationController.java`
  - **Czas:** 3 dni

- [ ] **US-NH-16:** Wersjonowanie materiałów
  - Nowa encja: `MaterialVersion` (historia zmian)
  - Przy każdej edycji: tworzenie nowej wersji
  - Endpoint: `GET /api/v1/materials/{id}/versions` (historia wersji)
  - Endpoint: `GET /api/v1/materials/{id}/version/{versionId}` (podgląd wersji)
  - Pacjent widzi wersję przypisaną w momencie udostępnienia
  - **Pliki:** `MaterialVersion.java`, `MaterialController.java`, `MaterialService.java`
  - **Czas:** 3 dni

#### Priorytet Średni
- [ ] **US-NH-21:** One-time activation code
  - Generator kodów: 8 znaków alfanumerycznych
  - Ważność: 72 godziny
  - Endpoint: `POST /api/v1/admin/activation-codes` (generowanie)
  - Endpoint: `POST /api/v1/auth/activate-with-code` (aktywacja)
  - PDF z instrukcją do wydruku
  - **Pliki:** `ActivationCode.java`, `AdminController.java`, `PdfGenerationService.java`
  - **Czas:** 2 dni

### Frontend

#### Priorytet Wysoki
- [ ] **US-NH-10:** Tryb uproszczony UI
  - Toggle w ustawieniach profilu
  - Większe touch targets (min. 48x48px)
  - Tekst skalowany 125%
  - Uproszczony język komunikatów
  - Mniej elementów na ekranie
  - **Pliki:** `features/profile/SettingsPage.tsx`, `shared/components/SimplifiedLayout.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-22:** Konfiguracja powiadomień email
  - Checkbox w ustawieniach: "Otrzymuj powiadomienia email"
  - Wybór typów powiadomień: wiadomości, wydarzenia, materiały
  - Podgląd szablonu email
  - **Pliki:** `features/profile/NotificationSettingsPage.tsx`
  - **Czas:** 2 dni

- [ ] **US-NH-16:** Podgląd historii wersji materiałów
  - Tabela wersji w szczegółach materiału
  - Data, autor, zmiany (diff)
  - Przywracanie poprzedniej wersji (admin)
  - **Pliki:** `features/materials/MaterialDetailPage.tsx`, `MaterialVersionHistory.tsx`
  - **Czas:** 2 dni

#### Priorytet Średni
- [ ] **US-NH-14:** Konfigurowalny dashboard z widżetami
  - Drag & drop widżetów
  - Ukryj/pokaż widżety
  - Zapis układu per użytkownik
  - Domyślne widżety dla ról
  - **Pliki:** `pages/DashboardPage.tsx`, `features/dashboard/WidgetManager.tsx`
  - **Czas:** 3 dni

### Mobile

#### Priorytet Wysoki
- [ ] **US-NH-11:** Biometria (Face ID / Touch ID)
  - Integracja z Expo LocalAuthentication
  - Ekran aktywacji biometrii po pierwszym logowaniu
  - Fallback na hasło przy niepowodzeniu
  - Wymóg biometrii po powrocie z tła (konfigurowalny czas)
  - **Pliki:** `features/auth/useBiometric.ts`, `app/login.tsx`, `app/settings/biometric.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-10:** Tryb uproszczony w mobile
  - Toggle w ustawieniach (synchronizowany z backendem)
  - Większe elementy UI
  - 3 duże kafle na ekranie głównym
  - Proste modalne potwierdzenia
  - **Pliki:** `app/index.tsx`, `app/settings/display.tsx`, `features/ui/SimplifiedMode.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-22:** Powiadomienia email - konfiguracja
  - Checkbox w ustawieniach powiadomień
  - Wybór typów powiadomień email
  - **Pliki:** `app/settings/notifications.tsx`
  - **Czas:** 1 dzień

### DevOps

#### Priorytet Wysoki
- [ ] **SMTP Configuration:** Konfiguracja serwera email
  - Docker: dodanie kontenera Mailhog (dev) / integracja z SendGrid (prod)
  - Zmienne środowiskowe: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  - **Pliki:** `docker-compose.yml`, `.env.example`, `devops/docker/backend/Dockerfile`
  - **Czas:** 2 dni

- [ ] **PDF Generation:** Usługa do generowania PDF
  - Docker: dodanie kontenera z wkhtmltopdf lub Puppeteer
  - Endpoint do generowania kodów aktywacyjnych
  - **Pliki:** `docker-compose.yml`, `devops/docker/pdf-service/`
  - **Czas:** 2 dni

- [ ] **Security Audit:** Przegląd nowych funkcji
  - Biometria: analiza ryzyka
  - Powiadomienia email: ochrona przed spamem
  - Rate limiting: konfiguracja
  - **Pliki:** `docs/security/audit-sprint5.md`
  - **Czas:** 1 dzień

### Technical Writer

#### Priorytet Wysoki
- [ ] **Dokumentacja użytkownika:** Nowe rozdziały
  - Biometria: jak aktywować i używać
  - Tryb uproszczony: dla kogo i jak włączyć
  - Powiadomienia email: konfiguracja
  - Wersjonowanie materiałów: historia zmian
  - **Pliki:** `docs/user-guide/`
  - **Czas:** 2 dni

- [ ] **Dokumentacja administratora:** Kody aktywacyjne
  - Jak generować kody
  - Jak drukować instrukcje
  - Zarządzanie wygaśnięciami
  - **Pliki:** `docs/admin-guide/activation-codes.md`
  - **Czas:** 1 dzień

- [ ] **Release Notes:** Sprint 5
  - **Pliki:** `CHANGELOG.md`
  - **Czas:** 1 dzień

---

## Sprint 6 (2026-05-29 do 2026-06-12)

### Cel Sprintu
Funkcje Could Have (Phase 2): quizy edukacyjne, etapy terapii, gamifikacja, HIS Calendar Sync.

### Backend

#### Priorytet Średni
- [ ] **US-NH-03:** Quizy edukacyjne
  - Nowa encja: `Quiz` (pytania, odpowiedzi, próg zaliczenia)
  - Typy pytań: single choice, multi choice, true/false
  - Endpoint: `GET /api/v1/quizzes/{id}` (pobranie quizu)
  - Endpoint: `POST /api/v1/quizzes/{id}/submit` (zaliczenie quizu)
  - Walidacja odpowiedzi na backendzie
  - Historia podejść: `QuizAttempt`
  - **Pliki:** `Quiz.java`, `QuizQuestion.java`, `QuizAttempt.java`, `QuizController.java`
  - **Czas:** 4 dni

- [ ] **US-NH-06/07:** Etapy terapii
  - Nowa encja: `TherapyStage` (nazwa, opis, tryb odblokowywania, quiz)
  - Tryby: MANUAL, AUTO_QUIZ
  - Drag & drop kolejności (endpoint do aktualizacji order)
  - Przypisanie pacjenta do etapu
  - Automatyczne przejście po zaliczeniu quizu
  - Ręczne przenoszenie z uzasadnieniem
  - **Pliki:** `TherapyStage.java`, `PatientStageAssignment.java`, `TherapyStageController.java`
  - **Czas:** 4 dni

- [ ] **US-NH-04/20:** Odznaki i gamifikacja
  - Nowa encja: `Badge` (nazwa, opis, reguła, ikona)
  - Reguły: wydarzenia, materiały, compliance, streaki, quizy
  - Automatyczne przyznawanie odznak (event listener)
  - Endpoint: `GET /api/v1/badges` (katalog odznak)
  - Endpoint: `GET /api/v1/users/{id}/badges` (zdobyte odznaki)
  - **Pliki:** `Badge.java`, `BadgeRule.java`, `UserBadge.java`, `BadgeController.java`
  - **Czas:** 3 dni

- [ ] **US-NH-05/19:** Propozycja zmiany terminu wydarzenia
  - Nowa encja: `EventRescheduleRequest` (wydarzenie, pacjent, nowy termin, powód)
  - Walidacja: min. 24h przed, max 3 próby
  - Endpoint: `POST /api/v1/calendar/events/{id}/reschedule-request`
  - Endpoint: `PUT /api/v1/calendar/reschedule-requests/{id}/approve`
  - Endpoint: `PUT /api/v1/calendar/reschedule-requests/{id}/reject`
  - Powiadomienie pacjenta po decyzji
  - **Pliki:** `EventRescheduleRequest.java`, `CalendarController.java`
  - **Czas:** 3 dni

#### Priorytet Niski
- [ ] **US-NH-24:** HIS Calendar Sync
  - Endpoint: `GET /api/v1/his/calendar` (pobranie wydarzeń z HIS)
  - Synchronizacja jednokierunkowa (HIS → system)
  - Wydarzenia z HIS oznaczone graficznie
  - **Uwaga:** Wymaga dostępności endpointu w HIS
  - **Pliki:** `HisClient.java`, `CalendarSyncService.java`
  - **Czas:** 3 dni

### Frontend

#### Priorytet Średni
- [ ] **US-NH-03:** Quizy edukacyjne w UI
  - Lista dostępnych quizów
  - Ekran rozwiązywania quizu
  - Podsumowanie wyniku (punkty, procent, status zaliczenia)
  - Historia podejść
  - **Pliki:** `features/materials/QuizList.tsx`, `features/materials/QuizRunner.tsx`, `features/materials/QuizResult.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-06/07:** Etapy terapii w UI
  - Widok etapów w projekcie (timeline)
  - Materiały filtrowane per etap
  - Etapy zablokowane oznaczone graficznie
  - Przenoszenie pacjenta między etapami (personel)
  - **Pliki:** `features/projects/TherapyStagesTimeline.tsx`, `features/projects/PatientStagesManager.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-04:** Odznaki w UI
  - Katalog odznak w profilu pacjenta
  - Zdobyte odznaki z datami
  - Dostępne odznaki z opisem warunków
  - Powiadomienie przy zdobyciu nowej odznaki
  - **Pliki:** `features/profile/BadgesPage.tsx`, `features/profile/BadgeCollection.tsx`
  - **Czas:** 2 dni

- [ ] **US-NH-05/19:** Propozycja zmiany terminu
  - Przycisk "Zaproponuj inny termin" w szczegółach wydarzenia
  - Formularz: nowy termin, powód
  - Widok oczekujących propozycji (personel)
  - Akcje: akceptuj/odrzuć z komentarzem
  - **Pliki:** `features/calendar/EventDetailPage.tsx`, `features/calendar/RescheduleRequestModal.tsx`
  - **Czas:** 2 dni

#### Priorytet Niski
- [ ] **US-NH-24:** Wydarzenia z HIS w kalendarzu
  - Wizualne oznaczenie wydarzeń z HIS
  - Toggle: pokaż/ukryj wydarzenia z HIS
  - **Pliki:** `features/calendar/CalendarPage.tsx`
  - **Czas:** 1 dzień

### Mobile

#### Priorytet Średni
- [ ] **US-NH-03:** Quizy edukacyjne w mobile
  - Lista quizów
  - Ekran rozwiązywania
  - Wynik i historia
  - **Pliki:** `features/materials/QuizScreen.tsx`, `features/materials/QuizResultScreen.tsx`
  - **Czas:** 3 dni

- [ ] **US-NH-04:** Odznaki w mobile
  - Widok "Moje odznaki"
  - Animacja przy zdobyciu nowej odznaki
  - **Pliki:** `features/profile/BadgesScreen.tsx`
  - **Czas:** 2 dni

- [ ] **US-NH-05:** Propozycja zmiany terminu w mobile
  - Przycisk w szczegółach wydarzenia
  - Formularz propozycji
  - **Pliki:** `features/calendar/EventDetailScreen.tsx`
  - **Czas:** 2 dni

### DevOps

#### Priorytet Średni
- [ ] **Database Migrations:** Nowe tabele dla Phase 2
  - Quiz, QuizQuestion, QuizAttempt
  - TherapyStage, PatientStageAssignment
  - Badge, BadgeRule, UserBadge
  - EventRescheduleRequest
  - **Pliki:** `backend/src/main/resources/db/migration/`
  - **Czas:** 2 dni

- [ ] **Performance Testing:** Testy obciążeniowe dla nowych funkcji
  - Quizy: symulacja 1000 jednoczesnych podejść
  - Odznaki: wydajność event listenerów
  - **Pliki:** `tests/performance/`, `devops/jmeter/`
  - **Czas:** 2 dni

### Technical Writer

#### Priorytet Średni
- [ ] **Dokumentacja użytkownika:** Phase 2
  - Quizy: jak rozwiązywać
  - Etapy terapii: struktura i nawigacja
  - Odznaki: jak zdobywać
  - Propozycja zmiany terminu: workflow
  - **Pliki:** `docs/user-guide/phase2/`
  - **Czas:** 2 dni

- [ ] **Release Notes:** Sprint 6
  - **Pliki:** `CHANGELOG.md`
  - **Czas:** 1 dzień

- [ ] **Phase 2 Summary:** Raport z wdrożenia
  - Lista funkcji Phase 2
  - Metryki adoptowania
  - Rekomendacje na przyszłość
  - **Pliki:** `docs/reports/phase2-summary.md`
  - **Czas:** 1 dzień

---

## Definicja Gotowości (DoD)

### Backend
- [ ] Kod zaimplementowany i przetestowany (unit tests ≥85% coverage)
- [ ] Testy integracyjne dla nowych endpointów
- [ ] Dokumentacja API zaktualizowana (OpenAPI)
- [ ] Migracje bazy danych przygotowane i przetestowane
- [ ] Audyt logowania dla operacji wrażliwych

### Frontend
- [ ] Komponenty zaimplementowane i przetestowane (unit + integration)
- [ ] Testy E2E dla nowych user flows
- [ ] Responsywność: desktop + tablet
- [ ] Dostępność: WCAG 2.1 AA (kontrast, nawigacja klawiaturą)
- [ ] Dokumentacja użytkownika zaktualizowana

### Mobile
- [ ] Ekrany zaimplementowane i przetestowane
- [ ] Testy na iOS i Android
- [ ] Zgodność z Material Design / HIG
- [ ] Obsługa trybu offline (gdzie dotyczy)
- [ ] Dokumentacja użytkownika zaktualizowana

### DevOps
- [ ] Konfiguracja środowiskowa zaktualizowana
- [ ] CI/CD pipeline zaktualizowane o nowe testy
- [ ] Monitoring i alerty skonfigurowane
- [ ] Backup i restore przetestowane

### Technical Writer
- [ ] Release notes napisane
- [ ] Dokumentacja użytkownika zaktualizowana
- [ ] Instrukcje migracji (jeśli dotyczy)

---

## Metryki Sprintów

| Sprint | Velocity (punkty) | Test Coverage | Bug Count | Technical Debt |
|--------|-------------------|---------------|-----------|----------------|
| Sprint 4 | TBD | 85%+ | <5 critical | Low |
| Sprint 5 | TBD | 85%+ | <5 critical | Low |
| Sprint 6 | TBD | 85%+ | <10 critical | Medium |

---

## Ryzyka i Mitigacja

### Ryzyka Wysokie
1. **HIS Calendar Sync** - zależne od dostępności endpointu w HIS
   - **Mitigacja:** Wcześniejszy kontakt z zespołem IT placówki, fallback do manualnego importu

2. **Tryb uproszczony** - wymaga testów z użytkownikami seniorami
   - **Mitigacja:** Testy użyteczności w Sprincie 5, iteracyjne poprawki

### Ryzyka Średnie
3. **Biometria** - problemy z kompatybilnością na starszych urządzeniach
   - **Mitigacja:** Fallback na hasło, testy na szerokiej gamie urządzeń

4. **Quizy edukacyjne** - ryzyko przeciążenia użytkowników
   - **Mitigacja:** Opcjonalność quizów, konfiguracja progu zaliczenia

### Ryzyka Niskie
5. **Odznaki** - mogą być postrzegane jako infantylne
   - **Mitigacja:** Konfigurowalność, możliwość wyłączenia

---

## Podsumowanie

**Sprint 4:** Funkcje Must Have - gotowość do wdrożenia produkcyjnego
**Sprint 5:** Funkcje Should Have - poprawa UX i dostępności
**Sprint 6:** Funkcje Could Have - Phase 2 features

**Łączny czas:** 6 tygodni
**Łączna liczba zadań:** ~70 (backend: 25, frontend: 25, mobile: 15, devops: 5, docs: 5)

---

**Autor:** ARCHITEKT (Lead)
**Data:** 2026-04-24
**Wersja:** 1.0
