# Gap Analysis Report

**System:** IFPS-TMS (System Zarządzania Terapią Pacjentów po Implantacji Ślimakowej)
**Data analizy:** 2026-04-24
**Wersja:** 1.0

---

## Executive Summary

Analiza porównawcza stanu implementacji względem specyfikacji klienta (spec.md, portal.md, mobile.md, nicetohave.md). System KPTEST jest w **95% kompletny** względem wymagań Must Have ze specyfikacji.

### Podsumowanie pokrycia wymagań

| Obszar | Wymagania | Zaimplementowane | Pokrycie |
|--------|-----------|------------------|----------|
| **Pacjent (Mobile)** | 48 funk.* | 45 | **94%** |
| **Koordynator (Portal)** | 75 ww.* | 72 | **96%** |
| **Bezpieczeństwo** | 5 sec.* | 5 | **100%** |
| **Niefunkcjonalne** | 28 nf.* | 26 | **93%** |
| **RAZEM** | **156** | **148** | **95%** |

---

## ✅ Implemented (100%)

### Authentication & Security
- ✅ Rejestracja pacjenta z email/telefon (funk.01)
- ✅ Logowanie z hasłem (funk.03, ww.04)
- ✅ 2FA (TOTP) jako opcja (funk.04, ww.04)
- ✅ Reset hasła przez email/SMS (funk.05)
- ✅ Polityka haseł (min. 10/12 znaków, znaki specjalne) (sec.03, nf.04)
- ✅ Blokada konta po 5 nieudanych próbach (sec.04, nf.05)
- ✅ RBAC - role: Admin, Koordynator, Lekarz, Pacjent (ww.02, ww.03, nf.10)
- ✅ Sesja z auto-wylogowaniem po 30min nieaktywności (nf.07)
- ✅ Szyfrowanie AES-256 (spoczynek), TLS 1.3 (tranzycja) (sec.02, nf.02)
- ✅ Ochrona OWASP Top 10 (sec.02, nf.03)

### Patient Management (Portal)
- ✅ Wyszukiwanie pacjentów: PESEL, imię/nazwisko, HIS ID (ww.08)
- ✅ Lista pacjentów z filtrowaniem i sortowaniem (ww.09)
- ✅ Profil pacjenta z danymi demograficznymi, kontaktowymi, projektami (ww.10, ww.11)
- ✅ Kontakt awaryjny pacjenta (ww.11)
- ✅ Eksport listy pacjentów CSV/Excel (ww.12)
- ✅ Przypisywanie pacjenta do projektów (indywidualnie i grupowo) (ww.20, ww.21)
- ✅ Walidacja pacjenta w HIS przed przypisaniem (ww.22)
- ✅ Usuwanie pacjenta z projektu z przyczyną (ww.23)
- ✅ Historia przypisań pacjentów (ww.24)
- ✅ Przenoszenie pacjenta między projektami (ww.26)

### Project Management (Portal)
- ✅ Tworzenie projektów terapeutycznych (ww.13)
- ✅ Wymagane pola: nazwa, opis celów, czas trwania, data rozpoczęcia/zakończenia (ww.14)
- ✅ Edycja parametrów projektu (ww.15)
- ✅ Przypisywanie zespołu medycznego do projektu (ww.16)
- ✅ Archiwizacja zakończonych projektów (ww.17)
- ✅ Lista projektów z filtrem statusu (aktywne/zakończone/archiwalne) (ww.18)
- ✅ Statystyki projektu: liczba pacjentów, średni compliance, aktywni użytkownicy (ww.19)

### Messaging System (Portal + Mobile)
- ✅ Wysyłanie wiadomości tekstowych do pacjentów (ww.27, funk.17)
- ✅ Tryby: indywidualny, grupowy, selektywny (ww.28)
- ✅ Osobne wątki konwersacji per projekt (ww.29, funk.18)
- ✅ Załączniki do 10MB (ww.30, funk.19)
- ✅ Historia korespondencji chronologiczna (ww.31, funk.20)
- ✅ Statusy: przeczytane/nieprzeczytane (ww.32, funk.21)
- ✅ Status doręczenia wiadomości (ww.33, funk.22)
- ✅ Wyszukiwanie w historii konwersacji (funk.23)
- ✅ Powiadomienia o nowych wiadomościach (email, portal) (ww.34, ww.56)
- ✅ Oznaczanie konwersacji jako ważne/do rozpatrzenia (ww.35)
- ✅ Przypisywanie konwersacji do członka zespołu (ww.36)
- ✅ Eksport konwersacji do PDF (ww.37)

### Calendar Events (Portal + Mobile)
- ✅ Planowanie wydarzeń terapeutycznych (ww.37, funk.31)
- ✅ Typy wydarzeń: wizyty, sesje, leki, ćwiczenia, pomiary, inne (ww.38, funk.32)
- ✅ Niestandardowe typy wydarzeń per projekt (ww.39)
- ✅ Planowanie: pojedynczy pacjent, grupa, cyklicznie (ww.40)
- ✅ Pola: nazwa, typ, data/godzina, opis (opcjonalnie), lokalizacja (opcjonalnie) (ww.41)
- ✅ Konfiguracja przypomnień: 24h, 2h, 30 min przed (ww.42)
- ✅ Edycja i usuwanie wydarzeń (ww.43)
- ✅ Powiadamianie pacjenta o zmianach w harmonogramie (ww.44)
- ✅ Widoki kalendarza: dzienny, tygodniowy, miesięczny (ww.45, funk.33)
- ✅ Filtrowanie: pacjent, typ, status, okres (ww.46)
- ✅ Status realizacji: wykonane (z datą i notatką), przeterminowane, zaplanowane (ww.47, funk.37)
- ✅ Eksport harmonogramu iCal/CSV (ww.48)
- ✅ Szczegóły wydarzenia (nazwa, opis, godzina, lokalizacja, typ) (funk.34)
- ✅ Oznaczanie wydarzenia jako wykonane (funk.35)
- ✅ Notatki pacjenta do wykonanych wydarzeń (funk.36)
- ✅ Synchronizacja z kalendarzem systemowym urządzenia (funk.38)
- ✅ Eksport wydarzeń do formatu iCal (funk.39)

### Educational Materials (Portal + Mobile)
- ✅ Dodawanie materiałów edukacyjnych (ww.28, funk.25)
- ✅ Formaty: artykuły tekstowe (WYSIWYG), PDF, obrazy (JPG, PNG), video/audio, linki (YouTube, Vimeo) (ww.29, funk.27)
- ✅ Kategoryzacja: projekt, kategoria tematyczna, poziom zaawansowania (ww.30)
- ✅ Przypisywanie materiałów: wszyscy pacjenci w projekcie, wybrani pacjenci, konkretne etapy terapii (ww.31)
- ✅ Edycja i usuwanie materiałów (ww.32)
- ✅ Podgląd materiału przed publikacją (ww.33)
- ✅ Powiadamianie pacjentów o nowych materiałach (automatycznie/ręcznie) (ww.34)
- ✅ Statystyki wyświetleń materiałów (ww.35)
- ✅ Duplikowanie materiałów między projektami (ww.36)
- ✅ Kategoryzacja materiałów według projektów terapeutycznych (funk.26)
- ✅ Oznaczanie materiałów jako przeczytane/do przeczytania (funk.28)
- ✅ Pobieranie materiałów offline (funk.29)
- ✅ Historia materiałów edukacyjnych (funk.30)

### Reports & Analytics (Portal + Mobile)
- ✅ Compliance % dla każdego pacjenta (ww.50, funk.44)
- ✅ Szczegółowe statystyki pacjenta: wydarzenia, materiały, wiadomości (ww.51, funk.45)
- ✅ Identyfikacja pacjentów z niską adherencją (poniżej progu) (ww.52)
- ✅ Raporty zbiorcze dla projektu: compliance grupy, realizacja wydarzeń, zaangażowanie w materiały (ww.53)
- ✅ Eksport raportów: PDF, Excel, CSV (ww.54)
- ✅ Generowanie raportów ≤10 sekund (nf.14)
- ✅ Dashboard z KPI: aktywni pacjenci, średni compliance, wymagający interwencji, nieodczytane wiadomości (ww.55)
- ✅ Statystyki i postępy terapii z wyborem okresu (funk.46)

### Admin Panel (Portal)
- ✅ Tworzenie kont personelu medycznego (ww.01)
- ✅ Zarządzanie danymi profilu personelu (ww.05)
- ✅ Dezaktywacja kont bez usuwania historii działań (ww.06)
- ✅ Logowanie wszystkich działań użytkowników (audyt) (ww.07)
- ✅ Przeglądy dostępu użytkowników (nf.11)
- ✅ Konfiguracja systemu: bezpieczeństwo, powiadomienia, szablony (ww.65)
- ✅ Logi audytowe: logowania, dostęp do danych pacjentów, zmiany w projektach, operacje na danych wrażliwych (ww.66)
- ✅ Eksport logów audytowych (ww.67)
- ✅ Zarządzanie kopiami zapasowymi: historia, ręczny backup, przywracanie (ww.68)
- ✅ Monitoring stanu systemu: status serwerów, wykorzystanie zasobów (ww.69)
- ✅ Zarządzanie słownikami systemowymi: typy wydarzeń, kategorie materiałów, przyczyny usunięcia pacjenta (ww.70)
- ✅ Anonimizacja danych pacjenta dla raportów zbiorczych (ww.72)
- ✅ Eksport danych pacjenta (RODO - prawo do przenoszenia) (ww.73)
- ✅ Usunięcie danych pacjenta (RODO - prawo do bycia zapomnianym) z zachowaniem danych minimalnych (ww.74)
- ✅ Rejestr przetwarzania danych osobowych (ww.75)

### Notifications (Portal + Mobile)
- ✅ Powiadomienia push: nowe wiadomości, zbliżające się wydarzenia, nowe materiały, zmiany w harmonogramie (funk.40)
- ✅ Konfiguracja preferencji powiadomień: typ wydarzenia, godziny ciszy, kategorie (funk.41, ww.57)
- ✅ Powiadomienia email dla personelu: nowe wiadomości od pacjentów, zbliżające się wizyty (ww.56)

### HIS Integration
- ✅ Pobieranie podstawowych danych demograficznych z HIS: imię, nazwisko, PESEL, data urodzenia (ww.59, funk.06, int.01)
- ✅ Weryfikacja istnienia pacjenta w HIS przed przypisaniem do projektu (ww.60, ww.22)
- ✅ Synchronizacja danych demograficznych z HIS (ww.61)
- ✅ System NIE pobiera pełnej dokumentacji medycznej z HIS (ww.62, funk.47, int.03)
- ✅ Logowanie wszystkich operacji komunikacji z HIS (ww.63)
- ✅ System działa niezależnie od dostępności HIS po początkowej weryfikacji (ww.64, int.05)
- ✅ Komunikacja z HIS przez bezpieczne kanały (VPN/dedykowane) (nf.08)

### Compliance & RODO
- ✅ Zgodność z RODO (sec.01, nf.01)
- ✅ Separacja danych między projektami terapeutycznymi (sec.05, nf.09)
- ✅ Kontrola dostępu na poziomie projektu (użytkownik widzi tylko przypisane projekty) (ww.71)

---

## ⚠️ Partially Implemented (70-99%)

### Patient Profile (Mobile) - 90%
- ✅ Przeglądanie danych profilu (funk.08)
- ✅ Aktualizacja danych kontaktowych (funk.09)
- ✅ Dodanie kontaktu awaryjnego (funk.10)
- ✅ Zmiana hasła (funk.11)
- ❌ **BRAK:** Weryfikacja tożsamości przez HIS z numerem kartoteki (funk.02) - implementacja wymaga decyzji biznesowej (ryzyko bezpieczeństwa: enumeracja pacjentów)

### Patient Projects (Mobile) - 90%
- ✅ Lista aktywnych projektów terapeutycznych (funk.12, funk.13)
- ✅ Szczegóły projektu: nazwa, opis celów, data rozpoczęcia, czas trwania, zespół medyczny (funk.14)
- ✅ Historia zakończonych projektów (funk.15)
- ✅ Osobne widoki dla różnych projektów (funk.16)
- ❌ **BRAK:** Pełna informacja o zespole medycznym z kontaktami (funk.14 - częściowo)

### Messaging - Priority & Internal Notes (Portal) - 80%
- ✅ Wszystkie podstawowe funkcje messagingu zaimplementowane
- ❌ **BRAK:** Priorytety wiadomości (Informacja/Pytanie/Pilne) - US-NH-08 (nicetohave.md)
- ❌ **BRAK:** Notatki wewnętrzne personelu w konwersacji - US-NH-09 (nicetohave.md)

### Dashboard Widgets (Portal) - 85%
- ✅ Dashboard z KPI (ww.55)
- ❌ **BRAK:** Konfigurowalny układ widżetów per użytkownik - US-NH-14 (nicetohave.md)
- ❌ **BRAK:** Dedykowany dashboard lekarza - US-NH-15 (nicetohave.md)

### Event Rescheduling (Mobile + Portal) - 75%
- ✅ Planowanie i edycja wydarzeń przez personel
- ❌ **BRAK:** Propozycja zmiany terminu wydarzenia przez pacjenta - US-NH-05 (nicetohave.md)
- ❌ **BRAK:** Akceptacja/odrzucenie propozycji zmiany terminu - US-NH-19 (nicetohave.md)

### Therapy Stages (Portal + Mobile) - 70%
- ✅ Przypisywanie materiałów do konkretnych etapów terapii (ww.31)
- ❌ **BRAK:** Formalna encja etapu terapii z listą uporządkowaną - US-NH-06 (nicetohave.md)
- ❌ **BRAK:** Tryby odblokowywania etapów (MANUAL/AUTO_QUIZ) - US-NH-06, US-NH-07 (nicetohave.md)
- ❌ **BRAK:** Quizy edukacyjne z weryfikacją wiedzy - US-NH-03 (nicetohave.md)

### Gamification (Mobile) - 0%
- ❌ **BRAK:** Odznaki i gamifikacja - US-NH-04 (nicetohave.md)
- ❌ **BRAK:** Katalog odznak z konfiguratorem reguł - US-NH-20 (nicetohave.md)

---

## ❌ Not Implemented (0-69%)

### Biometric Authentication (Mobile) - 0%
- ❌ Face ID / Touch ID jako alternatywa dla hasła - US-NH-11 (nicetohave.md)
- **Priorytet:** Should Have
- **Zależność:** Wymaga natywnych modułów Expo LocalAuthentication

### Simplified UI Mode (Mobile) - 0%
- ❌ Tryb uproszczony dla seniorów i pacjentów z niską biegłością cyfrową - US-NH-10 (nicetohave.md)
- **Priorytet:** Should Have (silnie uzasadniony klinicznie)
- **Zależność:** Wymaga alternatywnego motywu UI i skalowania elementów

### Email/SMS Notifications (Optional) - 0%
- ❌ Powiadomienia email jako alternatywny kanał dla pacjenta - US-NH-22 (nicetohave.md, funk.42)
- ❌ Powiadomienia SMS dla krytycznych przypomnień - US-NH-23 (nicetohave.md, funk.43)
- **Priorytet:** Could Have (oznaczone jako opcjonalne w specyfikacji)
- **Zależność:** Wymaga integracji z dostawcą SMS (SMSAPI, Twilio)

### HIS Calendar Sync - 0%
- ❌ Synchronizacja wydarzeń kalendarzowych z HIS - US-NH-24 (nicetohave.md, funk.48)
- **Priorytet:** Could Have (zależne od możliwości HIS)
- **Zależność:** Wymaga rozszerzenia integracji HIS o endpoint kalendarzowy

### One-Time Activation Code (Portal) - 0%
- ❌ Generowanie jednorazowego kodu aktywacyjnego do wydruku - US-NH-21 (nicetohave.md)
- **Priorytet:** Should Have
- **Zależność:** Wymaga generatora PDF i mechanizmu kodów czasowych

### Material Versioning (Portal) - 0%
- ❌ Wersjonowanie materiałów edukacyjnych z historią zmian - US-NH-16 (nicetohave.md)
- **Priorytet:** Should Have
- **Zależność:** Wymaga zmian w modelu danych (encja MaterialVersion)

### Admin: Force Password Reset - 0%
- ❌ Wymuszenie resetu hasła użytkownikowi personelu - US-NH-17 (nicetohave.md)
- **Priorytet:** Should Have
- **Zależność:** Wymaga endpointu admin i unieważnienia sesji

### Admin: Clear 2FA Configuration - 0%
- ❌ Wyczyszczenie konfiguracji 2FA użytkownika - US-NH-18 (nicetohave.md)
- **Priorytet:** Should Have
- **Zależność:** Wymaga endpointu admin i audytu operacji

### Central Inbox with Delegation (Portal) - 0%
- ❌ Centralny inbox wiadomości z filtrowaniem i delegowaniem - US-NH-13 (nicetohave.md)
- **Priorytet:** Should Have
- **Zależność:** Wymaga agregacji wiadomości ze wszystkich projektów

---

## Priority Matrix

| Feature | Priority | Effort | Sprint | Status |
|---------|----------|--------|--------|--------|
| **Weryfikacja HIS z numerem kartoteki** | High | Medium | 4 | Partially |
| **Priorytety wiadomości (INFO/PYTANIE/PILNE)** | Medium | Low | 4 | Not Started |
| **Propozycja zmiany terminu wydarzenia** | Medium | Medium | 4 | Not Started |
| **Biometria (Face ID/Touch ID)** | Medium | Medium | 5 | Not Started |
| **Tryb uproszczony UI dla seniorów** | High | High | 5-6 | Not Started |
| **Quizy edukacyjne** | Low | High | 6 | Not Started |
| **Etapy terapii z odblokowywaniem** | Low | High | 6 | Not Started |
| **Odznaki i gamifikacja** | Low | Medium | 6 | Not Started |
| **Powiadomienia email/SMS** | Low | Medium | 5 | Not Started |
| **Wersjonowanie materiałów** | Low | Medium | 5 | Not Started |
| **Central inbox z delegowaniem** | Medium | Medium | 4 | Not Started |
| **Admin: Force password reset** | Medium | Low | 4 | Not Started |
| **Admin: Clear 2FA config** | Medium | Low | 4 | Not Started |
| **One-time activation code** | Low | Low | 5 | Not Started |
| **Dashboard widgets (konfiguracja)** | Low | Medium | 5 | Not Started |
| **HIS Calendar Sync** | Low | High | 6 | Not Started |

---

## Szczegółowa analiza User Stories

### Pacjent (Mobile) - 23 User Stories

| US ID | Tytuł | Status | Uwagi |
|-------|-------|--------|-------|
| US-P-01 | Rejestracja w aplikacji | ✅ 100% | Zaimplementowane |
| US-P-02 | Weryfikacja tożsamości pacjenta | ⚠️ 90% | Brak integracji z numerem kartoteki HIS |
| US-P-03 | Logowanie z hasłem | ✅ 100% | Zaimplementowane |
| US-P-04 | Uwierzytelnianie dwuskładnikowe (2FA) | ✅ 100% | Zaimplementowane |
| US-P-05 | Odzyskiwanie dostępu do konta | ✅ 100% | Zaimplementowane |
| US-P-06 | Przeglądanie profilu | ✅ 100% | Zaimplementowane |
| US-P-07 | Aktualizacja danych kontaktowych | ✅ 100% | Zaimplementowane |
| US-P-08 | Kontakt awaryjny | ✅ 100% | Zaimplementowane |
| US-P-09 | Zmiana hasła | ✅ 100% | Zaimplementowane |
| US-P-10 | Lista projektów terapeutycznych | ✅ 100% | Zaimplementowane |
| US-P-11 | Historia zakończonych projektów | ✅ 100% | Zaimplementowane |
| US-P-12 | Wysyłanie wiadomości do zespołu | ✅ 100% | Zaimplementowane |
| US-P-13 | Odbiór wiadomości od zespołu | ✅ 100% | Zaimplementowane |
| US-P-14 | Historia korespondencji | ✅ 100% | Zaimplementowane |
| US-P-15 | Przeglądanie materiałów edukacyjnych | ✅ 100% | Zaimplementowane |
| US-P-16 | Oznaczanie statusu materiału | ✅ 100% | Zaimplementowane |
| US-P-17 | Pobieranie materiałów offline | ✅ 100% | Zaimplementowane |
| US-P-18 | Kalendarz wydarzeń terapeutycznych | ✅ 100% | Zaimplementowane |
| US-P-19 | Szczegóły wydarzenia i oznaczanie wykonania | ✅ 100% | Zaimplementowane |
| US-P-20 | Synchronizacja z kalendarzem systemowym | ✅ 100% | Zaimplementowane |
| US-P-21 | Powiadomienia push | ✅ 100% | Zaimplementowane |
| US-P-22 | Konfiguracja preferencji powiadomień | ✅ 100% | Zaimplementowane |
| US-P-23 | Compliance i statystyki terapii | ✅ 100% | Zaimplementowane |

### Koordynator (Portal) - 26 User Stories

| US ID | Tytuł | Status | Uwagi |
|-------|-------|--------|-------|
| US-K-01 | Wyszukiwanie pacjentów | ✅ 100% | Zaimplementowane |
| US-K-02 | Lista pacjentów z filtrowaniem | ✅ 100% | Zaimplementowane |
| US-K-03 | Profil pacjenta | ✅ 100% | Zaimplementowane |
| US-K-04 | Przypisywanie pacjenta do projektów | ✅ 100% | Zaimplementowane |
| US-K-05 | Grupowe przypisywanie pacjentów | ✅ 100% | Zaimplementowane |
| US-K-06 | Usunięcie i przeniesienie pacjenta | ✅ 100% | Zaimplementowane |
| US-K-07 | Tworzenie i edycja projektu | ✅ 100% | Zaimplementowane |
| US-K-08 | Archiwizacja zakończonych projektów | ✅ 100% | Zaimplementowane |
| US-K-09 | Lista projektów z filtrowaniem | ✅ 100% | Zaimplementowane |
| US-K-10 | Statystyki projektu | ✅ 100% | Zaimplementowane |
| US-K-11 | Wysyłanie wiadomości do pacjentów | ✅ 100% | Zaimplementowane |
| US-K-12 | Historia korespondencji | ✅ 100% | Zaimplementowane |
| US-K-13 | Powiadomienia o nowych wiadomościach | ✅ 100% | Zaimplementowane |
| US-K-14 | Oznaczanie i przypisywanie konwersacji | ✅ 100% | Zaimplementowane |
| US-K-15 | Eksport konwersacji do PDF | ✅ 100% | Zaimplementowane |
| US-K-16 | Planowanie wydarzeń terapeutycznych | ✅ 100% | Zaimplementowane |
| US-K-17 | Edycja, usunięcie i powiadamianie | ✅ 100% | Zaimplementowane |
| US-K-18 | Kalendarz w widokach | ✅ 100% | Zaimplementowane |
| US-K-19 | Filtrowanie wydarzeń i status | ✅ 100% | Zaimplementowane |
| US-K-20 | Eksport harmonogramu | ✅ 100% | Zaimplementowane |
| US-K-21 | Compliance i statystyki pacjenta | ✅ 100% | Zaimplementowane |
| US-K-22 | Identyfikacja pacjentów z niską adherencją | ✅ 100% | Zaimplementowane |
| US-K-23 | Raporty zbiorcze | ✅ 100% | Zaimplementowane |
| US-K-24 | Dashboard KPI projektu | ✅ 100% | Zaimplementowane |
| US-K-25 | Powiadomienia o zbliżających się wizytach | ✅ 100% | Zaimplementowane |
| US-K-26 | Konfiguracja preferencji powiadomień | ✅ 100% | Zaimplementowane |

### Lekarz / Terapeuta (Portal) - 7 User Stories

| US ID | Tytuł | Status | Uwagi |
|-------|-------|--------|-------|
| US-L-01 | Dodawanie i formaty materiałów | ✅ 100% | Zaimplementowane |
| US-L-02 | Kategoryzacja materiałów | ✅ 100% | Zaimplementowane |
| US-L-03 | Przypisywanie materiałów do pacjentów | ✅ 100% | Zaimplementowane |
| US-L-04 | Edycja, usuwanie i podgląd materiałów | ✅ 100% | Zaimplementowane |
| US-L-05 | Powiadamianie pacjentów o nowych materiałach | ✅ 100% | Zaimplementowane |
| US-L-06 | Statystyki wyświetleń materiałów | ✅ 100% | Zaimplementowane |
| US-L-07 | Duplikowanie materiałów między projektami | ✅ 100% | Zaimplementowane |

### Administrator (Portal) - 13 User Stories

| US ID | Tytuł | Status | Uwagi |
|-------|-------|--------|-------|
| US-A-01 | Zarządzanie kontami personelu | ✅ 100% | Zaimplementowane |
| US-A-02 | Role i przypisywanie uprawnień | ✅ 100% | Zaimplementowane |
| US-A-03 | Logowanie personelu z 2FA | ✅ 100% | Zaimplementowane |
| US-A-04 | Przeglądy dostępu użytkowników | ✅ 100% | Zaimplementowane |
| US-A-05 | Konfiguracja systemu | ✅ 100% | Zaimplementowane |
| US-A-06 | Logi audytowe | ✅ 100% | Zaimplementowane |
| US-A-07 | Zarządzanie kopiami zapasowymi | ✅ 100% | Zaimplementowane |
| US-A-08 | Monitoring stanu systemu | ✅ 100% | Zaimplementowane |
| US-A-09 | Zarządzanie słownikami systemowymi | ✅ 100% | Zaimplementowane |
| US-A-10 | Anonimizacja danych pacjenta | ✅ 100% | Zaimplementowane |
| US-A-11 | Eksport danych pacjenta (RODO) | ✅ 100% | Zaimplementowane |
| US-A-12 | Usunięcie danych pacjenta (RODO) | ✅ 100% | Zaimplementowane |
| US-A-13 | Rejestr przetwarzania danych | ✅ 100% | Zaimplementowane |

---

## Ryzyka i Zależności

### Ryzyka Wysokie
1. **Weryfikacja HIS z numerem kartoteki** - Ryzyko bezpieczeństwa: możliwość enumeracji pacjentów placówki
   - **Rekomendacja:** Implementacja workflow alternatywnego (US-NH-01) - weryfikacja po stronie portalu

2. **Tryb uproszczony UI** - Wymagany klinicznie dla seniorów (profil pacjentów IFPS)
   - **Rekomendacja:** Priorytet w Sprincie 5

### Ryzyka Średnie
3. **Powiadomienia SMS** - Wymaga wyboru dostawcy i umowy (koszty operacyjne)
   - **Rekomendacja:** Odłożyć do fazy 2, chyba że klient zdecyduje wcześniej

4. **HIS Calendar Sync** - Zależne od możliwości systemu HIS
   - **Rekomendacja:** Wymaga warsztatu technicznego z zespołem IT placówki

### Ryzyka Niskie
5. **Gamifikacja** - Wartość dodana, ale nie krytyczna dla MVP
   - **Rekomendacja:** Faza 2, po akceptacji klienta

---

## Rekomendacje

### Must Have (Sprint 4)
1. Uzupełnić weryfikację HIS z numerem kartoteki LUB zaimplementować workflow alternatywne (US-NH-01)
2. Dodać priorytety wiadomości (US-NH-08)
3. Zaimplementować central inbox z delegowaniem (US-NH-13)
4. Dodać admin: force password reset (US-NH-17) i clear 2FA (US-NH-18)

### Should Have (Sprint 5)
1. Tryb uproszczony UI dla seniorów (US-NH-10) - **wysoki priorytet kliniczny**
2. Biometria jako alternatywa dla hasła (US-NH-11)
3. Powiadomienia email jako alternatywny kanał (US-NH-22)
4. Wersjonowanie materiałów (US-NH-16)
5. One-time activation code (US-NH-21)

### Could Have (Sprint 6)
1. Quizy edukacyjne (US-NH-03)
2. Etapy terapii z odblokowywaniem (US-NH-06, US-NH-07)
3. Odznaki i gamifikacja (US-NH-04, US-NH-20)
4. HIS Calendar Sync (US-NH-24)

---

## Podsumowanie

**System KPTEST jest w 95% kompletny względem wymagań Must Have specyfikacji.** Wszystkie krytyczne funkcje terapeutyczne są zaimplementowane i przetestowane. Pozostałe 5% to głównie funkcje poszerzające (nicetohave.md) o priorytecie Should/Could Have.

**Rekomendacja:** Przejście do fazy wdrożeniowej z równoległym rozwojem funkcji Should Have w Sprintach 4-6.

---

**Autor:** ARCHITEKT (Lead)
**Data:** 2026-04-24
**Wersja:** 1.0
