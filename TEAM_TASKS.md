# Team Tasks - Przydział Zadań

**Projekt:** IFPS-TMS (System Zarządzania Terapią Pacjentów po Implantacji Ślimakowej)
**Sprinty:** 4-6 (2026-05-01 do 2026-06-12)
**Wersja:** 1.0

---

## Zespół i Role

| Rola | Osoba | Odpowiedzialności |
|------|-------|-------------------|
| **ARCHITEKT** | Lead | Przegląd architektury, code review, decyzje techniczne |
| **BACKEND DEV** | Spring Boot Expert | API, baza danych, integracje, bezpieczeństwo |
| **FRONTEND DEV** | React Expert | Portal webowy, UX, dostępność |
| **MOBILE DEV** | React Native Expert | Aplikacja mobilna iOS/Android |
| **DEVOPS ENGINEER** | Infrastructure | CI/CD, monitoring, środowiska |
| **TECHNICAL WRITER** | Documentation | Dokumentacja, release notes, guides |

---

## BACKEND DEV - Lista Zadań

### Sprint 4 (2026-05-01 do 2026-05-14)

#### Priorytet Wysoki
- [ ] **US-P-02:** Endpoint weryfikacji pacjenta z numerem kartoteki HIS
  - Pliki: `PatientController.java`, `PatientService.java`, `HisClient.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Endpoint `POST /api/v1/patients/verify-his` akceptuje PESEL + numer_kartoteki
    - Walidacja formatu numeru kartoteki (regex: `^[A-Z0-9]{6,12}$`)
    - Response zawiera dane pacjenta z HIS lub błąd 404
    - Każda próba weryfikacji logowana w audycie
    - Testy jednostkowe coverage ≥90%

- [ ] **US-NH-08:** Priorytety wiadomości (INFO/PYTANIE/PILNE)
  - Pliki: `Message.java`, `MessagePriority.java`, `MessageController.java`, `MessageService.java`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Nowy enum `MessagePriority` z wartościami: INFO, QUESTION, URGENT
    - Endpoint `PUT /api/v1/messages/{id}/priority` do zmiany priorytetu
    - Sortowanie inboxa wg priorytetu (URGENT first)
    - Konfiguracja powiadomień dla priorytetu PILNE
    - Testy jednostkowe dla sortowania

- [ ] **US-NH-17:** Wymuszenie resetu hasła przez administratora
  - Pliki: `AdminController.java`, `UserService.java`, `AuditService.java`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Endpoint `POST /api/v1/admin/users/{id}/force-password-reset`
    - Unieważnienie aktualnego hasła użytkownika
    - Wylogowanie wszystkich aktywnych sesji (invalidacja refresh tokenów)
    - Wymagane pole `reason` w requestcie
    - Audyt operacji z powodem

- [ ] **US-NH-18:** Wyczyszczenie konfiguracji 2FA przez administratora
  - Pliki: `AdminController.java`, `TwoFactorService.java`, `AuditService.java`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Endpoint `POST /api/v1/admin/users/{id}/clear-2fa`
    - Usunięcie sekretu 2FA z bazy danych
    - Unieważnienie kodów zapasowych
    - Wylogowanie wszystkich sesji
    - Wymagane pole `reason` (szczególnie wrażliwy audyt)

- [ ] **US-NH-13:** Central inbox z delegowaniem
  - Pliki: `MessageController.java`, `MessageService.java`, `ConversationRepository.java`, `Message.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Endpoint `GET /api/v1/messages/inbox` agreguje wiadomości ze wszystkich projektów
    - Filtry: priority, status, projectId, assigneeId
    - Endpoint `PUT /api/v1/messages/{id}/delegate` z assigneeId
    - Enum `ConversationStatus`: NEW, IN_PROGRESS, RESOLVED, CLOSED
    - Endpoint `PUT /api/v1/messages/{id}/status` do zmiany statusu
    - Testy wydajnościowe dla agregacji (≤500ms dla 1000 wiadomości)

#### Priorytet Średni
- [ ] **Testy jednostkowe:** Rozszerzenie coverage do 85%
  - Pliki: `src/test/java/com/kptest/backend/`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Coverage dla nowych klas ≥90%
    - Wszystkie gałęzie kodu przetestowane
    - Testy granicznych wartości

- [ ] **Dokumentacja API:** Aktualizacja OpenAPI spec
  - Pliki: `src/main/resources/openapi.yaml`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Wszystkie nowe endpointy udokumentowane
    - Przykłady request/response
    - Kody błędów opisane

### Sprint 5 (2026-05-15 do 2026-05-28)

#### Priorytet Wysoki
- [ ] **US-NH-11:** Biometria - endpointy wspierające
  - Pliki: `AuthController.java`, `BiometricService.java`, `BiometricKey.java`, `BiometricKeyRepository.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Endpoint `POST /api/v1/auth/biometric-register` z public key z urządzenia
    - Endpoint `POST /api/v1/auth/biometric-login` z podpisem cyfrowym
    - Walidacja podpisu za pomocą stored public key
    - Rate limiting: 5 prób na godzinę
    - Encja `BiometricKey` z deviceId, publicKey, createdAt

- [ ] **US-NH-10:** Tryb uproszczony - backend
  - Pliki: `User.java`, `UserController.java`, `UserProfileDto.java`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Nowe pole `simplified_ui_mode: boolean` w encji User
    - Endpoint `PUT /api/v1/users/profile/simplified-mode` z toggle
    - Flag zwracana w response profilu użytkownika
    - Migracja bazy danych dodająca kolumnę

- [ ] **US-NH-22:** Powiadomienia email
  - Pliki: `EmailService.java`, `EmailTemplate.java`, `EmailTemplateRepository.java`, `NotificationController.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Integracja z SMTP (Spring Mail) lub SendGrid
    - Szablony email: new_message, event_reminder, new_material
    - Endpoint `PUT /api/v1/users/profile/email-notifications` do konfiguracji
    - Rate limiting: max 50 emaili/godzinę na użytkownika
    - Logowanie wysłanych emaili w audycie

- [ ] **US-NH-16:** Wersjonowanie materiałów
  - Pliki: `Material.java`, `MaterialVersion.java`, `MaterialVersionRepository.java`, `MaterialController.java`, `MaterialService.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Encja `MaterialVersion` z: materialId, versionNumber, content, changesSummary, createdBy, createdAt
    - Przy każdej edycji materiału: tworzenie nowej wersji
    - Endpoint `GET /api/v1/materials/{id}/versions` zwraca historię wersji
    - Endpoint `GET /api/v1/materials/{id}/version/{versionId}` zwraca podgląd wersji
    - Endpoint `POST /api/v1/materials/{id}/restore-version/{versionId}` do przywracania wersji (admin)
    - Pacjent widzi wersję przypisaną w momencie udostępnienia (pole `assigned_version_id` w `PatientMaterial`)

#### Priorytet Średni
- [ ] **US-NH-21:** One-time activation code
  - Pliki: `ActivationCode.java`, `ActivationCodeRepository.java`, `AdminController.java`, `PdfGenerationService.java`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Encja `ActivationCode` z: code (8 znaków alfanumerycznych), expiresAt, used, usedAt
    - Generator kodów: `SecureRandom` z alfanumerycznym charset
    - Ważność: 72 godziny od wygenerowania
    - Endpoint `POST /api/v1/admin/activation-codes` (generowanie, wymaga roli ADMIN)
    - Endpoint `POST /api/v1/auth/activate-with-code` (aktywacja konta)
    - Generator PDF z instrukcją krok po kroku

### Sprint 6 (2026-05-29 do 2026-06-12)

#### Priorytet Średni
- [ ] **US-NH-03:** Quizy edukacyjne
  - Pliki: `Quiz.java`, `QuizQuestion.java`, `QuizAnswer.java`, `QuizAttempt.java`, `QuizRepository.java`, `QuizController.java`, `QuizService.java`
  - Czas: 4 dni
  - Kryteria akceptacji:
    - Encja `Quiz` z: title, description, passingThreshold, materialId
    - Encja `QuizQuestion` z: quizId, questionText, questionType (SINGLE_CHOICE, MULTI_CHOICE, TRUE_FALSE), order
    - Encja `QuizAnswer` z: questionId, answerText, isCorrect, order
    - Encja `QuizAttempt` z: quizId, userId, score, passed, startedAt, completedAt
    - Endpoint `GET /api/v1/quizzes/{id}` zwraca quiz z pytaniami i odpowiedziami (wymieszana kolejność)
    - Endpoint `POST /api/v1/quizzes/{id}/submit` z listą odpowiedzi użytkownika
    - Walidacja odpowiedzi na backendzie, obliczanie wyniku
    - Historia podejść dostępna przez `GET /api/v1/quizzes/{id}/attempts`

- [ ] **US-NH-06/07:** Etapy terapii
  - Pliki: `TherapyStage.java`, `PatientStageAssignment.java`, `TherapyStageRepository.java`, `TherapyStageController.java`, `TherapyStageService.java`
  - Czas: 4 dni
  - Kryteria akceptacji:
    - Encja `TherapyStage` z: projectId, name, description, unlockMode (MANUAL, AUTO_QUIZ), quizId, order
    - Encja `PatientStageAssignment` z: patientId, stageId, projectId, assignedAt, completedAt, completedAutomatically
    - Endpoint `GET /api/v1/projects/{id}/stages` zwraca etapy posortowane po order
    - Endpoint `PUT /api/v1/projects/{id}/stages/reorder` z listą stageIds w nowej kolejności
    - Endpoint `POST /api/v1/patients/{id}/stages/assign` z stageId i reason
    - Automatyczne przejście etapu po zaliczeniu quizu (event listener)
    - Materiały filtrowane po etapie pacjenta

- [ ] **US-NH-04/20:** Odznaki i gamifikacja
  - Pliki: `Badge.java`, `BadgeRule.java`, `UserBadge.java`, `BadgeRepository.java`, `BadgeController.java`, `BadgeService.java`, `BadgeEventListener.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Encja `Badge` z: name, description, iconUrl, enabled
    - Encja `BadgeRule` z: badgeId, ruleType (EVENTS_COMPLETED, MATERIALS_READ, COMPLIANCE_ABOVE, STREAK_DAYS, QUIZ_PASSED), threshold, metadata (JSON)
    - Encja `UserBadge` z: userId, badgeId, earnedAt, reason
    - Endpoint `GET /api/v1/badges` zwraca katalog odznak
    - Endpoint `GET /api/v1/users/{id}/badges` zwraca zdobyte odznaki z datami
    - Event listener nasłuchujący zdarzeń: event_completed, material_read, quiz_passed
    - Automatyczne przyznawanie odznak po spełnieniu reguły
    - Brak retroaktywnego przyznawania (tylko zdarzenia po dodaniu reguły)

- [ ] **US-NH-05/19:** Propozycja zmiany terminu wydarzenia
  - Pliki: `EventRescheduleRequest.java`, `EventRescheduleRequestRepository.java`, `CalendarController.java`, `CalendarService.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Encja `EventRescheduleRequest` z: eventId, patientId, proposedDateTime, reason, status (PENDING, APPROVED, REJECTED), staffComment, createdAt
    - Walidacja: min. 24h przed oryginalnym terminem, max 3 próby na wydarzenie
    - Endpoint `POST /api/v1/calendar/events/{id}/reschedule-request` z proposedDateTime i reason
    - Endpoint `GET /api/v1/calendar/reschedule-requests/pending` zwraca oczekujące propozycje (personel)
    - Endpoint `PUT /api/v1/calendar/reschedule-requests/{id}/approve` z optional staffComment
    - Endpoint `PUT /api/v1/calendar/reschedule-requests/{id}/reject` z required staffComment
    - Powiadomienie pacjenta push/email po decyzji personelu

#### Priorytet Niski
- [ ] **US-NH-24:** HIS Calendar Sync
  - Pliki: `HisClient.java`, `CalendarSyncService.java`, `CalendarSyncRepository.java`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Endpoint `GET /api/v1/his/calendar` (tylko jeśli HIS aktywny)
    - Pobranie wydarzeń z HIS: typ, data, opis, lokalizacja
    - Synchronizacja jednokierunkowa (HIS → system)
    - Wydarzenia z HIS oznaczone flagą `source = HIS`
    - Endpoint `POST /api/v1/his/calendar/sync` do ręcznej synchronizacji
    - Logowanie wszystkich operacji komunikacji z HIS

---

## FRONTEND DEV - Lista Zadań

### Sprint 4 (2026-05-01 do 2026-05-14)

#### Priorytet Wysoki
- [ ] **US-P-02:** Formularz weryfikacji HIS w rejestracji
  - Pliki: `src/pages/auth/RegisterPage.tsx`, `src/features/auth/HisVerificationForm.tsx`, `src/services/api.ts`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Formularz z polami: PESEL (auto-fill z poprzedniego kroku), numer_kartoteki (input tekstowy)
    - Walidacja online formatu numeru kartoteki (regex visual feedback)
    - Komunikat błędu: przyjazny tekst, nie technical details
    - Po sukcesie: przejście do next step rejestracji
    - Po błędzie: wyświetlenie komunikatu z prośbą o kontakt z koordynatorem

- [ ] **US-NH-08:** Priorytety wiadomości w UI
  - Pliki: `src/features/messages/MessageComposer.tsx`, `src/features/messages/InboxList.tsx`, `src/features/messages/ConversationThread.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Selector priorytetu (dropdown) przy wysyłaniu wiadomości
    - Domyślna wartość: "Informacja"
    - Wizualne wyróżnienie w inboxie: PILNE (czerwony), PYTANIE (żółty), INFO (szary)
    - Tooltip przy ikonie priorytetu z wyjaśnieniem
    - Sortowanie inboxa wg priorytetu (najpierw PILNE)

- [ ] **US-NH-13:** Central Inbox w dashboardzie
  - Pliki: `src/pages/DashboardPage.tsx`, `src/features/messages/CentralInboxWidget.tsx`, `src/pages/messages/InboxPage.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Nowy widżet w dashboardzie: "Oczekujące wiadomości"
    - Lista 5 ostatnich wiadomości z filtrem status=PENDING
    - Przycisk "Zobacz wszystkie" prowadzący do `/inbox`
    - Strona InboxPage z filtrami: priorytet, status, projekt, przypisanie
    - Akcje na wiadomości: deleguj (dropdown z użytkownikami), zmień status
    - Tabela z sortowaniem po kolumnach

- [ ] **US-NH-17/18:** Panel administratora - zarządzanie użytkownikami
  - Pliki: `src/pages/admin/UserManagementPage.tsx`, `src/pages/admin/UserDetailPage.tsx`, `src/features/admin/AdminActionsModal.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Przycisk "Wymuś reset hasła" w UserDetailPage (tylko dla roli ADMIN)
    - Przycisk "Wyczyść 2FA" w UserDetailPage (tylko dla roli ADMIN)
    - Modal potwierdzenia z polem tekstowym "Powód (wymagane)"
    - Walidacja: przycisk aktywny dopiero po wpisaniu powodu
    - Po sukcesie: toast z potwierdzeniem, odświeżenie listy użytkowników

#### Priorytet Średni
- [ ] **Poprawki UX:** Ujednolicenie komunikatów błędów
  - Pliki: `src/shared/components/ui/Alert.tsx`, `src/shared/components/ui/FormError.tsx`, `src/shared/utils/errorHandlers.ts`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Spójny format komunikatów błędów walidacji formularzy
    - Error boundaries na poziomie pages (graceful degradation)
    - Loading states: spójne animacje (spinner + skeleton)
    - Toast notifications: ujednolicony styl i pozycjonowanie

- [ ] **Testy E2E:** Nowe scenariusze dla funkcji Sprint 4
  - Pliki: `tests/e2e/specs/his-verification.spec.ts`, `tests/e2e/specs/message-priorities.spec.ts`, `tests/e2e/specs/central-inbox.spec.ts`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Scenariusz: weryfikacja HIS z poprawnym numerem kartoteki
    - Scenariusz: weryfikacja HIS z błędnym numerem kartoteki
    - Scenariusz: wysłanie wiadomości z priorytetem PILNE
    - Scenariusz: delegowanie wiadomości z central inbox
    - Wszystkie testy przechodzą na CI/CD

### Sprint 5 (2026-05-15 do 2026-05-28)

#### Priorytet Wysoki
- [ ] **US-NH-10:** Tryb uproszczony UI
  - Pliki: `src/pages/profile/SettingsPage.tsx`, `src/shared/components/SimplifiedLayout.tsx`, `src/app/hooks.ts`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Toggle "Tryb uproszczony" w SettingsPage
    - Po włączeniu: większe touch targets (min. 48x48px)
    - Tekst skalowany 125% (font-size multiplier)
    - Uproszczony język komunikatów (słownik: simplified-terms.json)
    - Mniej elementów na ekranie (ukrycie zaawansowanych opcji)
    - Stan zsynchronizowany z backendem

- [ ] **US-NH-22:** Konfiguracja powiadomień email
  - Pliki: `src/pages/profile/NotificationSettingsPage.tsx`, `src/features/notifications/EmailPreviewModal.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Checkbox "Otrzymuj powiadomienia email" w NotificationSettingsPage
    - Sekcja z checkboxami per typ powiadomienia: wiadomości, wydarzenia, materiały
    - Przycisk "Wyślij email testowy" z podglądem szablonu
    - Walidacja: czy użytkownik ma ustawiony email w profilu

- [ ] **US-NH-16:** Podgląd historii wersji materiałów
  - Pliki: `src/pages/materials/MaterialDetailPage.tsx`, `src/features/materials/MaterialVersionHistory.tsx`, `src/features/materials/MaterialVersionModal.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Tabela wersji w MaterialDetailPage: versionNumber, createdAt, createdBy, changesSummary
    - Przycisk "Zobacz" otwiera modal z podglądem wersji
    - Przycisk "Przywróć tę wersję" (tylko dla admin)
    - Diff viewer pokazujący zmiany między wersjami

#### Priorytet Średni
- [ ] **US-NH-14:** Konfigurowalny dashboard z widżetami
  - Pliki: `src/pages/DashboardPage.tsx`, `src/features/dashboard/WidgetManager.tsx`, `src/features/dashboard/DraggableWidget.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Drag & drop widżetów (biblioteka: dnd-kit lub react-beautiful-dnd)
    - Checkboxy w WidgetManager do ukrywania/pokazywania widżetów
    - Przycisk "Przywróć domyślny układ"
    - Zapis układu w backendzie (endpoint: `PUT /api/v1/users/profile/dashboard-layout`)
    - Domyślne układy per rola: ADMIN, KOORDYNATOR, LEKARZ

### Sprint 6 (2026-05-29 do 2026-06-12)

#### Priorytet Średni
- [ ] **US-NH-03:** Quizy edukacyjne w UI
  - Pliki: `src/pages/materials/QuizListPage.tsx`, `src/pages/materials/QuizRunnerPage.tsx`, `src/pages/materials/QuizResultPage.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - QuizListPage: lista dostępnych quizów z postępem (np. "Zaliczone: 2/5")
    - QuizRunnerPage: prezentacja pytań jedno po drugim, progress bar
    - Single choice: radio buttons, multi choice: checkboxes
    - QuizResultPage: wynik (punkty, procent), status (ZALICZONY/NIEZALICZONY), historia podejść
    - Przycisk "Spróbuj ponownie" jeśli niezaliczony

- [ ] **US-NH-06/07:** Etapy terapii w UI
  - Pliki: `src/pages/projects/ProjectDetailPage.tsx`, `src/features/projects/TherapyStagesTimeline.tsx`, `src/features/projects/PatientStagesManager.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Timeline widok etapów w projekcie (oś czasu z kafelkami)
    - Etapy zablokowane: szary kolor, ikona kłódki
    - Etap aktywny: kolor primary, ikona odblokowana
    - Etapy zakończone: kolor zielony, data ukończenia
    - Materiały filtrowane: "Pokaż materiały z etapu: [dropdown]"
    - PatientStagesManager: dropdown ze zmianą etapu pacjenta (personel)

- [ ] **US-NH-04:** Odznaki w UI
  - Pliki: `src/pages/profile/BadgesPage.tsx`, `src/features/profile/BadgeCollection.tsx`, `src/features/profile/BadgeModal.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - BadgesPage: dwie sekcje: "Zdobyte odznaki" i "Do zdobycia"
    - BadgeCollection: grid z ikonami odznak
    - Zdobyte: pełny kolor, data zdobycia w tooltip
    - Do zdobycia: szary kolor, warunek w tooltip
    - Progress bary dla odznak z postępem (np. "8/10 wydarzeń")

- [ ] **US-NH-05/19:** Propozycja zmiany terminu
  - Pliki: `src/pages/calendar/EventDetailPage.tsx`, `src/features/calendar/RescheduleRequestModal.tsx`, `src/pages/calendar/RescheduleRequestsPage.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Przycisk "Zaproponuj inny termin" w EventDetailPage (tylko dla pacjentów)
    - Modal z DatePicker, TimePicker, pole tekstowe "Powód"
    - Walidacja: min. 24h przed, informacja o liczbie pozostałych prób
    - RescheduleRequestsPage: tabela oczekujących propozycji (personel)
    - Akcje: przyciski "Akceptuj" i "Odrzuć" z modalem komentarza

#### Priorytet Niski
- [ ] **US-NH-24:** Wydarzenia z HIS w kalendarzu
  - Pliki: `src/pages/calendar/CalendarPage.tsx`, `src/features/calendar/HisEventToggle.tsx`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Toggle "Pokaż wydarzenia z HIS" w CalendarPage
    - Wydarzenia z HIS: inny kolor tła, ikona szpitala, tooltip "z HIS"
    - Kliknięcie wydarzenia z HIS: modal z informacją "To wydarzenie pochodzi z systemu HIS"

---

## MOBILE DEV - Lista Zadań

### Sprint 4 (2026-05-01 do 2026-05-14)

#### Priorytet Wysoki
- [ ] **US-P-02:** Ekran weryfikacji HIS w rejestracji
  - Pliki: `app/register.tsx`, `features/auth/HisVerificationScreen.tsx`, `src/services/api.ts`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Ekran z poliami: PESEL (auto-fill), numer_kartoteki (TextInput)
    - Walidacja formatu: regex check on blur
    - Przycisk "Zweryfikuj" z loading state
    - Po sukcesie: przejście do next screen
    - Po błędzie: Alert z komunikatem "Nie znaleziono pacjenta. Skontaktuj się z koordynatorem."

- [ ] **US-NH-08:** Priorytety wiadomości w mobile
  - Pliki: `features/messages/MessageComposer.tsx`, `features/messages/ConversationList.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Picker priorytetu przed wysłaniem wiadomości (SegmentedControl)
    - Wizualne wyróżnienie w liście konwersacji: ikona i kolor priorytetu
    - Domyślna wartość: "Informacja"

#### Priorytet Średni
- [ ] **Poprawki UX mobile:** Dostosowanie do Material Design / HIG
  - Pliki: `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/ListItem.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Touch targets: min. 44x44px (wymiary zgodne z HIG)
    - Czcionki: obsługa systemowej skali czcionki (Accessibility)
    - Kolory: kontrast min. 4.5:1 (WCAG AA)
    - Safe area insets: obsługa notcha i home indicator

- [ ] **Testy E2E mobile:** Scenariusze dla Sprint 4
  - Pliki: `tests/e2e/his-verification.spec.ts`, `tests/e2e/message-priorities.spec.ts`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Scenariusz: rejestracja z weryfikacją HIS
    - Scenariusz: wysłanie wiadomości z priorytetem
    - Testy na emulatorze iOS i Android

### Sprint 5 (2026-05-15 do 2026-05-28)

#### Priorytet Wysoki
- [ ] **US-NH-11:** Biometria (Face ID / Touch ID)
  - Pliki: `features/auth/useBiometric.ts`, `app/login.tsx`, `app/settings/BiometricSettingsScreen.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Integracja z expo-local-authentication
    - Ekran aktywacji biometrii po pierwszym logowaniu (toggle w ustawieniach)
    - Logowanie biometryczne: wywołanie LocalAuthentication.authenticateAsync
    - Fallback na hasło przy niepowodzeniu biometrii
    - Wymóg biometrii po powrocie z tła (>5min, konfigurowalne)
    - Obsługa Face ID i Touch ID (iOS), Fingerprint (Android)

- [ ] **US-NH-10:** Tryb uproszczony w mobile
  - Pliki: `app/index.tsx`, `app/settings/DisplaySettingsScreen.tsx`, `features/ui/SimplifiedModeProvider.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - Toggle "Tryb uproszczony" w DisplaySettingsScreen (synchronizacja z backendem)
    - Większe elementy UI: padding x1.5, fontSize x1.25
    - Ekran główny: 3 duże kafle (Projekty, Kalendarz, Wiadomości)
    - Proste modalne potwierdzenia przed akcjami (Alert.confirm)
    - Uproszczony język: słownik simplified-terms.json

- [ ] **US-NH-22:** Powiadomienia email - konfiguracja
  - Pliki: `app/settings/NotificationSettingsScreen.tsx`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Checkbox "Otrzymuj powiadomienia email"
    - Sekcja z checkboxami per typ: wiadomości, wydarzenia, materiały

### Sprint 6 (2026-05-29 do 2026-06-12)

#### Priorytet Średni
- [ ] **US-NH-03:** Quizy edukacyjne w mobile
  - Pliki: `features/materials/QuizListScreen.tsx`, `features/materials/QuizRunnerScreen.tsx`, `features/materials/QuizResultScreen.tsx`
  - Czas: 3 dni
  - Kryteria akceptacji:
    - QuizListScreen: lista quizów z badge'em postępu
    - QuizRunnerScreen: pytania prezentowane pojedynczo, progress bar
    - QuizResultScreen: wynik, status, historia podejść
    - Obsługa offline: quizy buforowane lokalnie

- [ ] **US-NH-04:** Odznaki w mobile
  - Pliki: `features/profile/BadgesScreen.tsx`, `features/profile/BadgeCard.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Widok "Moje odznaki" z dwiema sekcjami
    - Animacja confetti przy zdobyciu nowej odznaki (react-native-confetti)
    - Tooltip z warunkiem zdobycia

- [ ] **US-NH-05:** Propozycja zmiany terminu w mobile
  - Pliki: `features/calendar/EventDetailScreen.tsx`, `features/calendar/RescheduleRequestModal.tsx`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Przycisk "Zaproponuj inny termin" w EventDetailScreen
    - Modal z DatePicker, TimePicker, TextInput (powód)
    - Walidacja: 24h przed, max 3 próby

---

## DEVOPS ENGINEER - Lista Zadań

### Sprint 4 (2026-05-01 do 2026-05-14)

#### Priorytet Wysoki
- [ ] **HIS Mock:** Rozszerzenie o endpoint weryfikacji z numerem kartoteki
  - Pliki: `devops/his-mock/src/main.py`, `docker-compose.yml`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Endpoint `POST /api/v1/his/verify` akceptuje JSON: { pesel, medicalRecordNumber }
    - Response 200: { patientId, firstName, lastName, pesel, dateOfBirth }
    - Response 404: { error: "Patient not found" }
    - Logowanie wszystkich zapytań do pliku logs/his-mock.log

- [ ] **CI/CD:** Pipeline dla nowych funkcji
  - Pliki: `.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Backend: testy jednostkowe dla MessagePriority, AdminActions
    - Frontend: testy E2E dla central inbox
    - Failure notification na Slack

- [ ] **Monitoring:** Dashboard dla priorytetów wiadomości
  - Pliki: `devops/grafana/dashboards/messages.json`, `devops/prometheus/rules/messages.yml`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Panel: liczba wiadomości per priorytet (24h, 7d)
    - Panel: średni czas reakcji na wiadomości PILNE
    - Alert: czas reakcji >2h dla wiadomości PILNE

### Sprint 5 (2026-05-15 do 2026-05-28)

#### Priorytet Wysoki
- [ ] **SMTP Configuration:** Konfiguracja serwera email
  - Pliki: `docker-compose.yml`, `.env.example`, `devops/docker/backend/Dockerfile`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Dev: kontener Mailhog (port 1025 SMTP, 8025 UI)
    - Prod: zmienne środowiskowe dla SendGrid/Mailgun
    - Health check: endpoint `/actuator/health/email`

- [ ] **PDF Generation:** Usługa do generowania PDF
  - Pliki: `docker-compose.yml`, `devops/docker/pdf-service/Dockerfile`, `devops/docker/pdf-service/app.py`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Kontener z wkhtmltopdf lub Puppeteer
    - Endpoint `POST /generate` akceptuje HTML, zwraca PDF
    - Integracja z backendem przez HTTP

- [ ] **Security Audit:** Przegląd nowych funkcji
  - Pliki: `docs/security/audit-sprint5.md`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Analiza ryzyka biometrii (key storage, replay attacks)
    - Analiza powiadomień email (spam, rate limiting)
    - Rekomendacje konfiguracji rate limiting

### Sprint 6 (2026-05-29 do 2026-06-12)

#### Priorytet Średni
- [ ] **Database Migrations:** Nowe tabele dla Phase 2
  - Pliki: `backend/src/main/resources/db/migration/Vxx__quiz_tables.sql`, `Vxx__stages_tables.sql`, `Vxx__badges_tables.sql`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Migracje testowane na lokalnej bazie
    - Rollback migrations przygotowane
    - Dokumentacja zmian w schemacie

- [ ] **Performance Testing:** Testy obciążeniowe dla nowych funkcji
  - Pliki: `tests/performance/quiz-load-test.jmx`, `devops/jmeter/`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Symulacja 1000 jednoczesnych podejść do quizów
    - Symulacja 500 event listenerów odznak
    - Raport: response time p95, error rate

---

## TECHNICAL WRITER - Lista Zadań

### Sprint 4 (2026-05-01 do 2026-05-14)

#### Priorytet Wysoki
- [ ] **Dokumentacja użytkownika:** Aktualizacja o nowe funkcje
  - Pliki: `docs/user-guide/his-verification.md`, `docs/user-guide/message-priorities.md`, `docs/user-guide/central-inbox.md`, `docs/user-guide/admin-tools.md`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Rozdział: Weryfikacja HIS (krok po kroku z screenshotami)
    - Rozdział: Priorytety wiadomości (kiedy używać każdego)
    - Rozdział: Central inbox (filtrowanie, delegowanie)
    - Rozdział: Narzędzia administratora (reset hasła, clear 2FA)

- [ ] **Release Notes:** Sprint 4
  - Pliki: `CHANGELOG.md`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Lista zmian: Added, Changed, Fixed
    - Instrukcja migracji (jeśli dotyczy)
    - Linki do dokumentacji

### Sprint 5 (2026-05-15 do 2026-05-28)

#### Priorytet Wysoki
- [ ] **Dokumentacja użytkownika:** Nowe rozdziały
  - Pliki: `docs/user-guide/biometrics.md`, `docs/user-guide/simplified-mode.md`, `docs/user-guide/email-notifications.md`, `docs/user-guide/material-versioning.md`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Rozdział: Biometria (aktywacja, użycie, troubleshooting)
    - Rozdział: Tryb uproszczony (dla kogo, jak włączyć)
    - Rozdział: Powiadomienia email (konfiguracja, szablony)
    - Rozdział: Wersjonowanie materiałów (historia zmian, przywracanie)

- [ ] **Dokumentacja administratora:** Kody aktywacyjne
  - Pliki: `docs/admin-guide/activation-codes.md`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Jak generować kody
    - Jak drukować instrukcje
    - Zarządzanie wygaśnięciami
    - Troubleshooting

- [ ] **Release Notes:** Sprint 5
  - Pliki: `CHANGELOG.md`
  - Czas: 1 dzień

### Sprint 6 (2026-05-29 do 2026-06-12)

#### Priorytet Średni
- [ ] **Dokumentacja użytkownika:** Phase 2
  - Pliki: `docs/user-guide/phase2/quizzes.md`, `docs/user-guide/phase2/therapy-stages.md`, `docs/user-guide/phase2/badges.md`, `docs/user-guide/phase2/rescheduling.md`
  - Czas: 2 dni
  - Kryteria akceptacji:
    - Rozdział: Quizy (rozwiązywanie, wyniki)
    - Rozdział: Etapy terapii (nawigacja, struktura)
    - Rozdział: Odznaki (zdobywanie, przeglądanie)
    - Rozdział: Propozycja zmiany terminu (workflow)

- [ ] **Release Notes:** Sprint 6
  - Pliki: `CHANGELOG.md`
  - Czas: 1 dzień

- [ ] **Phase 2 Summary:** Raport z wdrożenia
  - Pliki: `docs/reports/phase2-summary.md`
  - Czas: 1 dzień
  - Kryteria akceptacji:
    - Lista funkcji Phase 2
    - Metryki adoptowania (jeśli dostępne)
    - Rekomendacje na przyszłość

---

## ARCHITEKT - Lista Zadań

### Wszystkie Sprinty

#### Nadzór Techniczny
- [ ] **Code Review:** Przegląd krytycznych zmian
  - Weryfikacja: zgodność z architekturą, wzorce projektowe, bezpieczeństwo
  - Czas: 2 dni/sprint

- [ ] **Design Review:** Przegląd projektów UX/UI
  - Weryfikacja: spójność z design system, dostępność WCAG
  - Czas: 1 dzień/sprint

- [ ] **Decyzje Techniczne:** Rozstrzyganie wątpliwości
  - Dokumentacja ADR dla kluczowych decyzji
  - Czas: 1 dzień/sprint

- [ ] **Mentoring:** Wsparcie zespołu
  - Pair programming dla złożonych zadań
  - Konsultacje techniczne
  - Czas: 1 dzień/sprint

---

## Podsumowanie Przydziału Zadań

| Rola | Sprint 4 | Sprint 5 | Sprint 6 | Razem Dni |
|------|----------|----------|----------|-----------|
| **BACKEND DEV** | 12 dni | 9 dni | 17 dni | 38 dni |
| **FRONTEND DEV** | 11 dni | 10 dni | 13 dni | 34 dni |
| **MOBILE DEV** | 8 dni | 9 dni | 9 dni | 26 dni |
| **DEVOPS** | 4 dni | 5 dni | 4 dni | 13 dni |
| **TECHNICAL WRITER** | 3 dni | 4 dni | 4 dni | 11 dni |
| **ARCHITEKT** | 5 dni | 5 dni | 5 dni | 15 dni |

---

## Kryteria Akceptacji Sprintów

### Sprint 4 - Gotowość do Produkcji
- [ ] Wszystkie zadania Priorytet Wysoki ukończone
- [ ] Testy E2E przechodzą w 100%
- [ ] Brak bugów krytycznych (P0, P1)
- [ ] Dokumentacja zaktualizowana
- [ ] CI/CD pipeline zielone

### Sprint 5 - Funkcje Should Have
- [ ] Biometria przetestowana na urządzeniach iOS i Android
- [ ] Tryb uproszczony przetestowany z użytkownikami (testy użyteczności)
- [ ] Powiadomienia email działają z wszystkimi szablonami
- [ ] Wersjonowanie materiałów z testami wydajnościowymi

### Sprint 6 - Phase 2 Features
- [ ] Quizy z walidacją na backendzie
- [ ] Etapy terapii z automatycznym odblokowywaniem
- [ ] Odznaki przyznawane automatycznie
- [ ] Propozycja zmiany terminu z pełnym workflow

---

**Autor:** ARCHITEKT (Lead)
**Data:** 2026-04-24
**Wersja:** 1.0
