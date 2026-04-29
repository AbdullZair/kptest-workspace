# KPTEST Portal - Plan Testów E2E

**Data:** 2026-04-28  
**Wersja:** 1.0  
**Status:** ✅ Gotowy do wykonania

---

## 📊 PRZEGLĄD WYMAGAŃ

### Wymagania Funkcjonalne (Must Have)

| ID | Wymaganie | Priorytet | Status Testu |
|----|-----------|-----------|--------------|
| **WF-01** | Logowanie do systemu | 🔴 Wysoki | ⏳ Do testu |
| **WF-02** | Rejestracja pacjenta | 🔴 Wysoki | ⏳ Do testu |
| **WF-03** | Nawigacja po dashboardzie | 🟠 Średni | ⏳ Do testu |
| **WF-04** | Zarządzanie pacjentami (CRUD) | 🟠 Średni | ⏳ Do testu |
| **WF-05** | Zarządzanie projektami | 🟠 Średni | ⏳ Do testu |
| **WF-06** | Kalendarz wydarzeń | 🟢 Niski | ⏳ Do testu |
| **WF-07** | Panel administratora (RODO) | 🟠 Średni | ⏳ Do testu |
| **WF-08** | i18n (PL/EN) | 🟢 Niski | ⏳ Do testu |

---

## 📝 PRZYPADKI TESTOWE (TC)

### TC-01: Logowanie - Sukces

**Wymaganie:** WF-01  
**Priorytet:** 🔴 Wysoki

**Kroki:**
1. Otwórz stronę logowania: `http://localhost:3000/login`
2. Wprowadź email: `admin@kptest.com`
3. Wprowadź hasło: `TestP@ssw0rd123`
4. Kliknij przycisk "Zaloguj się"
5. Zweryfikuj przekierowanie do dashboardu

**Oczekiwany rezultat:**
- ✅ Przekierowanie na `/dashboard`
- ✅ Widoczne powitanie użytkownika
- ✅ Menu nawigacyjne widoczne

**Screenshot:** `TC01_logowanie_success.png`

---

### TC-02: Logowanie - Błędne Hasło

**Wymaganie:** WF-01  
**Priorytet:** 🔴 Wysoki

**Kroki:**
1. Otwórz stronę logowania: `http://localhost:3000/login`
2. Wprowadź email: `admin@kptest.com`
3. Wprowadź błędne hasło: `WrongPassword`
4. Kliknij przycisk "Zaloguj się"
5. Zweryfikuj komunikat błędu

**Oczekiwany rezultat:**
- ✅ Widoczny komunikat błędu
- ✅ Brak przekierowania
- ✅ Pole hasła podświetlone na czerwono

**Screenshot:** `TC02_logowanie_bledne_haslo.png`

---

### TC-03: Rejestracja Pacjenta - Sukces

**Wymaganie:** WF-02  
**Priorytet:** 🔴 Wysoki

**Kroki:**
1. Otwórz stronę rejestracji: `http://localhost:3000/register`
2. Wypełnij formularz:
   - Email: `test.pacjent@email.com`
   - PESEL: `98765432109`
   - Imię: `Test`
   - Nazwisko: `Pacjent`
   - Hasło: `TestP@ssw0rd123`
   - Powtórz hasło: `TestP@ssw0rd123`
3. Zaakceptuj regulamin
4. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Komunikat sukcesu
- ✅ Przekierowanie do logowania

**Screenshot:** `TC03_rejestracja_sukces.png`

---

### TC-04: Nawigacja - Dashboard

**Wymaganie:** WF-03  
**Priorytet:** 🟠 Średni

**Kroki:**
1. Zaloguj się jako admin
2. Sprawdź widoczność dashboardu
3. Kliknij każdy element menu:
   - Dashboard
   - Pacjenci
   - Projekty
   - Kalendarz
   - Administrator (tylko dla Admin)
4. Zweryfikuj przekierowanie

**Oczekiwany rezultat:**
- ✅ Wszystkie linki działają
- ✅ Prawidłowe przekierowania
- ✅ Aktywny element menu podświetlony

**Screenshot:** `TC04_nawigacja_dashboard.png`

---

### TC-05: Formularz - Walidacja Pól

**Wymaganie:** WF-04  
**Priorytet:** 🟠 Średni

**Kroki:**
1. Otwórz formularz dodawania pacjenta
2. Pozostaw pola puste
3. Spróbuj zapisać
4. Wypełnij niepoprawne dane (zły email, za krótkie hasło)
5. Spróbuj zapisać ponownie

**Oczekiwany rezultat:**
- ✅ Widoczne komunikaty walidacji
- ✅ Pola błędów podświetlone na czerwono
- ✅ Blokada zapisu przy błędach

**Screenshot:** `TC05_formularz_walidacja.png`

---

### TC-06: Responsywność - Mobile

**Wymaganie:** WF-08  
**Priorytet:** 🟢 Niski

**Kroki:**
1. Otwórz aplikację w trybie mobile (375x667)
2. Zaloguj się
3. Sprawdź układ strony
4. Przetestuj menu hamburger

**Oczekiwany rezultat:**
- ✅ Układ dostosowany do mobile
- ✅ Menu hamburger działa
- ✅ Treść czytelna

**Screenshot:** `TC06_responsywnosc_mobile.png`

---

### TC-07: Panel RODO - Eksport Danych

**Wymaganie:** WF-07  
**Priorytet:** 🟠 Średni

**Kroki:**
1. Zaloguj się jako admin
2. Przejdź do: Administrator → RODO
3. Wybierz pacjenta
4. Kliknij "Eksportuj dane"
5. Wybierz format JSON
6. Pobierz plik

**Oczekiwany rezultat:**
- ✅ Modal eksportu widoczny
- ✅ Plik pobrany poprawnie
- ✅ JSON zawiera dane pacjenta

**Screenshot:** `TC07_rodo_eksport.png`

---

### TC-08: i18n - Zmiana Języka

**Wymaganie:** WF-08  
**Priorytet:** 🟢 Niski

**Kroki:**
1. Zaloguj się
2. Przejdź do ustawień
3. Zmień język z PL na EN
4. Zweryfikuj tłumaczenie menu
5. Zmień z powrotem na PL

**Oczekiwany rezultat:**
- ✅ Język zmienia się natychmiast
- ✅ Wszystkie etykiety przetłumaczone
- ✅ Wybór zapamiętany

**Screenshot:** `TC08_i18n_zmiana_jezyka.png`

---

## 🗺️ MAPA WYMAGAŃ

| TC | WF-01 | WF-02 | WF-03 | WF-04 | WF-05 | WF-06 | WF-07 | WF-08 |
|----|-------|-------|-------|-------|-------|-------|-------|-------|
| TC-01 | ✅ | | | | | | | |
| TC-02 | ✅ | | | | | | | |
| TC-03 | | ✅ | | | | | | |
| TC-04 | | | ✅ | | | | | |
| TC-05 | | | | ✅ | | | | |
| TC-06 | | | | | | | | ✅ |
| TC-07 | | | | | | | ✅ | |
| TC-08 | | | | | | | | ✅ |

---

## 📊 KRYTERIA AKCEPTACJI

### Must Pass (🔴 Wysoki Priorytet)
- [ ] TC-01: Logowanie - Sukces
- [ ] TC-02: Logowanie - Błędne Hasło
- [ ] TC-03: Rejestracja Pacjenta - Sukces

### Should Pass (🟠 Średni Priorytet)
- [ ] TC-04: Nawigacja - Dashboard
- [ ] TC-05: Formularz - Walidacja Pól
- [ ] TC-07: Panel RODO - Eksport Danych

### Nice to Have (🟢 Niski Priorytet)
- [ ] TC-06: Responsywność - Mobile
- [ ] TC-08: i18n - Zmiana Języka

---

## 🛠️ KONFIGURACJA ŚRODOWISKA

### Wymagania
- Node.js 20+
- Playwright
- Docker (backend uruchomiony)

### Instalacja
```bash
cd /home/user1/KPTESTPRO/testy_all
npm init -y
npm install @playwright/test
npx playwright install chromium
```

### Uruchomienie Testów
```bash
# Wszystkie testy
npx playwright test

# Konkretne testy
npx playwright test --grep "TC-01"

# Z screenshotami
npx playwright test --screenshot=on

# Raport HTML
npx playwright show-report
```

---

## 📸 SCREENSHOTY

**Folder:** `testy_all/printscreeny/`

**Konwencja nazewnictwa:**
```
{TC_ID}_{nazwa_testu}_{status}.png
Przykład: TC01_logowanie_success.png
```

**Automatyczne screenshoty:**
- Po każdym teście (success/failure)
- Przy błędzie walidacji
- Przy zmianie widoku

---

## 📝 RAPORT KOŃCOWY

**Szablon raportu:**

```markdown
# KPTEST Portal - Raport z Testów E2E

**Data wykonania:** YYYY-MM-DD
**Wykonawca:** Agent Wykonawca
**Wersja aplikacji:** 1.0

## Podsumowanie

| Status | Liczba | Procent |
|--------|--------|---------|
| ✅ Passed | X/8 | XX% |
| ❌ Failed | X/8 | XX% |
| ⏭️ Skipped | X/8 | XX% |

## Szczegóły

### Testy Udane
- TC-01: Logowanie - Sukces ✅
- TC-02: Logowanie - Błędne Hasło ✅
- ...

### Testy Nieudane
- TC-XX: Nazwa testu ❌
  - **Powód:** Opis błędu
  - **Screenshot:** printscreeny/TCXX_nazwa_bledu.png

## Rekomendacje
1. Naprawić walidację formularza X
2. Dodać komunikaty błędów w języku Y
3. Poprawić responsywność na mobile

## Załączniki
- Wszystkie screenshoty w folderze: `printscreeny/`
- Raport HTML: `playwright-report/index.html`
```

---

**Last Updated:** 2026-04-28  
**Author:** KPTEST QA Team  
**Version:** 1.0
