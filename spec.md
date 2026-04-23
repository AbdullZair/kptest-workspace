# Historie użytkownika — zakres zgodny ze specyfikacją klienta

## System Zarządzania Terapią Pacjentów po Implantacji Ślimakowej (IFPS-TMS)

**Zakres dokumentu:** historie użytkownika o priorytecie **Must Have**, których treść jest w 100% zgodna z wymaganiami zawartymi w specyfikacji klienta (`mobile.md` + `portal.md`). Każda historia zawiera bezpośrednie odwołania do numerów wymagań klienta.

---

## 🎯 Kontekst biznesowy

IFPS-TMS to system wspierający długoterminową rehabilitację pacjentów po implantacji ślimakowej. Rozwiązanie składa się z dwóch klientów komunikujących się ze wspólnym backendem:

- **Aplikacja mobilna** — narzędzie pacjenta (iOS + Android), przeznaczone do codziennego korzystania: przegląd harmonogramu, komunikacja z zespołem medycznym, materiały edukacyjne, śledzenie postępów.
- **Portal webowy** — narzędzie personelu medycznego, obsługiwane przez trzy role: **Administrator systemu**, **Koordynator projektu terapeutycznego**, **Lekarz / Terapeuta / inny personel medyczny**. Służy do zarządzania pacjentami, projektami terapeutycznymi, harmonogramem, materiałami edukacyjnymi, komunikacją i monitoringiem.

Pacjenci po implantacji ślimakowej to grupa o szerokim spektrum wiekowym (od dzieci po osoby starsze) z zaburzeniami słuchu — stąd wysoki priorytet wymagań dostępnościowych (WCAG 2.1 AA, zgodność z Material Design / HIG, konfigurowalny rozmiar czcionki, tryb wysokiego kontrastu).

Model terapeutyczny organizuje pracę wokół **projektów terapeutycznych**: pacjent jest przypisywany do jednego lub wielu projektów, w ramach których zespół medyczny prowadzi komunikację, planuje wydarzenia (wizyty, sesje, pomiary, przypomnienia o lekach), udostępnia materiały edukacyjne i monitoruje compliance.

**Integracja z HIS** obejmuje wyłącznie: weryfikację tożsamości pacjenta, pobranie podstawowych danych demograficznych (imię, nazwisko, PESEL, data urodzenia) i walidację istnienia pacjenta w systemie szpitalnym — **nie obejmuje pełnej dokumentacji medycznej**. Ze względu na ryzyko bezpieczeństwa (możliwość weryfikacji przynależności pacjenta do placówki przez osoby niepowołane) weryfikacja HIS w praktyce jest uruchamiana przez pracownika medycznego z portalu, a nie bezpośrednio z aplikacji mobilnej. System działa niezależnie od dostępności HIS po początkowej weryfikacji pacjenta (standalone-first).

Dane wrażliwe są chronione zgodnie z RODO (AES-256 w spoczynku, TLS 1.3 w tranzycie, OWASP Top 10), a wszystkie operacje na danych pacjentów są logowane w audycie.

---

## 👤 Pacjent (aplikacja mobilna)

### US-P-01 — Rejestracja w aplikacji

**Historia:** Jako pacjent, chcę zarejestrować się w aplikacji mobilnej z wykorzystaniem numeru telefonu lub adresu email, aby uzyskać dostęp do swojej terapii cyfrowej.

**Kryteria akceptacji:**
- Formularz rejestracyjny akceptuje numer telefonu LUB adres email jako identyfikator podstawowy.
- Walidacja formatu (email, numer telefonu) wykonywana po stronie aplikacji.
- Użytkownik wyraża zgodę na regulamin i politykę prywatności przed wysłaniem danych.
- Po zarejestrowaniu konto zostaje utworzone w systemie i czeka na weryfikację tożsamości.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.01`

---

### US-P-02 — Weryfikacja tożsamości pacjenta

**Historia:** Jako pacjent, chcę aby moja tożsamość została zweryfikowana przez integrację z systemem HIS podczas rejestracji, aby mieć pewność, że dostęp do mojej terapii uzyskają wyłącznie osoby uprawnione.

**Kryteria akceptacji:**
- Weryfikacja następuje z wykorzystaniem numeru kartoteki pacjenta oraz danych demograficznych z HIS.
- Podczas weryfikacji system pobiera z HIS podstawowe dane demograficzne: imię, nazwisko, PESEL, data urodzenia.
- Po pozytywnej weryfikacji konto pacjenta zostaje aktywowane.
- Aplikacja w żadnych okolicznościach nie pobiera pełnej dokumentacji medycznej z HIS.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.02`, `funk.06`, `funk.47`, `int.01`, `int.02`, `int.03`

---

### US-P-03 — Logowanie z hasłem

**Historia:** Jako pacjent, chcę logować się do aplikacji za pomocą hasła, aby uzyskiwać dostęp do swoich danych.

**Kryteria akceptacji:**
- Ekran logowania z polem identyfikatora (email/telefon) i hasła.
- Hasło musi spełniać wymogi: minimum 10 znaków, wielkie i małe litery, cyfry, znaki specjalne.
- Po 5 nieudanych próbach logowania konto jest blokowane na 15 minut.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.03`, `sec.03`, `sec.04`

---

### US-P-04 — Uwierzytelnianie dwuskładnikowe (2FA)

**Historia:** Jako pacjent, chcę mieć możliwość włączenia uwierzytelniania dwuskładnikowego, aby dodatkowo zabezpieczyć swoje konto.

**Kryteria akceptacji:**
- 2FA jest opcją konfigurowalną przez pacjenta.
- Po włączeniu 2FA logowanie wymaga podania kodu weryfikacyjnego oprócz hasła.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.04`

---

### US-P-05 — Odzyskiwanie dostępu do konta

**Historia:** Jako pacjent, chcę zresetować hasło w przypadku jego zapomnienia poprzez email lub SMS, aby szybko odzyskać dostęp do konta.

**Kryteria akceptacji:**
- Opcja "Zapomniałem hasła" dostępna na ekranie logowania.
- Wybór kanału odzyskiwania: email lub SMS (spośród kanałów ustawionych w profilu).
- Po weryfikacji — ekran ustawienia nowego hasła z walidacją siły.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.05`

---

### US-P-06 — Przeglądanie profilu

**Historia:** Jako pacjent, chcę przeglądać swoje dane profilu (osobowe i kontaktowe), aby mieć świadomość, jakie informacje system o mnie przechowuje.

**Kryteria akceptacji:**
- Ekran "Mój profil" prezentuje dane osobowe (imię, nazwisko, PESEL, data urodzenia) oraz dane kontaktowe (email, telefon, adres).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.08`

---

### US-P-07 — Aktualizacja danych kontaktowych

**Historia:** Jako pacjent, chcę aktualizować swoje dane kontaktowe (email, telefon, adres), aby zapewnić, że zespół medyczny posiada aktualne informacje.

**Kryteria akceptacji:**
- Możliwość edycji pól email, telefon, adres w profilu.
- Walidacja formatu (email, telefon) po stronie aplikacji.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.09`

---

### US-P-08 — Kontakt awaryjny

**Historia:** Jako pacjent, chcę dodać kontakt awaryjny do swojego profilu, aby zespół medyczny mógł skontaktować się z bliską osobą w sytuacji krytycznej.

**Kryteria akceptacji:**
- Możliwość dodania kontaktu awaryjnego (dane osoby + numer telefonu) w profilu.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.10`

---

### US-P-09 — Zmiana hasła

**Historia:** Jako pacjent, chcę zmienić hasło dostępu do konta w dowolnym momencie, aby utrzymać jego bezpieczeństwo.

**Kryteria akceptacji:**
- Formularz zmiany hasła wymaga podania obecnego i nowego hasła.
- Nowe hasło musi spełniać wymogi polityki bezpieczeństwa (min. 10 znaków, wielkie/małe litery, cyfry, znaki specjalne).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.11`, `sec.03`

---

### US-P-10 — Lista projektów terapeutycznych

**Historia:** Jako pacjent, chcę widzieć listę aktywnych projektów terapeutycznych, do których jestem przypisany, wraz z kluczowymi informacjami o każdym projekcie, aby zrozumieć kontekst mojej terapii.

**Kryteria akceptacji:**
- Lista prezentuje tylko projekty, do których pacjent jest przypisany.
- Dla każdego projektu widoczne: nazwa, opis celów terapii, data rozpoczęcia, przewidywany czas trwania, zespół medyczny opiekujący się pacjentem.
- System wyświetla osobne widoki dla różnych projektów, aby rozdzielić konteksty terapii.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.12`, `funk.13`, `funk.14`, `funk.16`

---

### US-P-11 — Historia zakończonych projektów

**Historia:** Jako pacjent, chcę mieć dostęp do historii zakończonych projektów terapeutycznych, aby móc wracać do informacji z wcześniejszych etapów leczenia.

**Kryteria akceptacji:**
- Dedykowany widok "Historia" zawiera listę projektów zakończonych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.15`

---

### US-P-12 — Wysyłanie wiadomości do zespołu medycznego

**Historia:** Jako pacjent, chcę wysyłać wiadomości tekstowe do zespołu medycznego w ramach konkretnego projektu terapeutycznego, aby komunikować się z osobami prowadzącymi moją terapię.

**Kryteria akceptacji:**
- Możliwość napisania i wysłania wiadomości z poziomu projektu.
- Każdy projekt ma osobny wątek konwersacji.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.17`, `funk.18`

---

### US-P-13 — Odbiór wiadomości od zespołu medycznego

**Historia:** Jako pacjent, chcę otrzymywać zarówno wiadomości kierowane indywidualnie do mnie, jak i wiadomości grupowe od zespołu medycznego, aby być informowanym o wszystkich istotnych kwestiach terapii.

**Kryteria akceptacji:**
- Aplikacja wyświetla wiadomości otrzymane od zespołu, oznaczając je jako indywidualne lub grupowe.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.24`

---

### US-P-14 — Historia korespondencji

**Historia:** Jako pacjent, chcę widzieć chronologiczną historię korespondencji z zespołem, statusy wiadomości (przeczytane/nieprzeczytane, doręczenie) oraz móc wyszukiwać w historii, aby sprawnie odnajdować wcześniejsze ustalenia.

**Kryteria akceptacji:**
- Wiadomości sortowane chronologicznie.
- Oznaczenia: przeczytana / nieprzeczytana.
- Status doręczenia wiadomości widoczny przy każdej wysłanej wiadomości.
- Dostępne pole wyszukiwania w historii konwersacji.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.20`, `funk.21`, `funk.22`, `funk.23`

---

### US-P-15 — Przeglądanie materiałów edukacyjnych

**Historia:** Jako pacjent, chcę przeglądać materiały edukacyjne przypisane do moich projektów terapeutycznych w różnych formatach, aby móc aktywnie uczestniczyć w procesie rehabilitacji.

**Kryteria akceptacji:**
- Lista materiałów filtrowalna według projektu.
- Materiały pogrupowane według projektów terapeutycznych.
- Wsparcie formatów: artykuły tekstowe, dokumenty PDF, obrazy/infografiki, video/audio, linki do filmów instruktażowych.
- Dostępny widok historii materiałów edukacyjnych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.25`, `funk.26`, `funk.27`, `funk.30`

---

### US-P-16 — Oznaczanie statusu materiału

**Historia:** Jako pacjent, chcę oznaczać materiały jako przeczytane lub do przeczytania, aby śledzić postęp edukacyjny.

**Kryteria akceptacji:**
- Przy każdym materiale dostępne są oznaczenia "przeczytane" / "do przeczytania".

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.28`

---

### US-P-17 — Pobieranie materiałów offline

**Historia:** Jako pacjent, chcę pobrać materiały do pamięci urządzenia, aby móc z nich korzystać bez połączenia internetowego (tryb offline / tylko do poglądu).

**Kryteria akceptacji:**
- Przy każdym materiale dostępny przycisk "Pobierz na urządzenie".
- Pobrane materiały dostępne bez połączenia internetowego.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.29`

---

### US-P-18 — Kalendarz wydarzeń terapeutycznych

**Historia:** Jako pacjent, chcę widzieć swoje wydarzenia terapeutyczne w kalendarzu w widokach dziennym, tygodniowym i miesięcznym, z wizualnym oznaczeniem statusu, aby planować swoją aktywność.

**Kryteria akceptacji:**
- Kalendarz zawiera zaplanowane wydarzenia terapeutyczne dla pacjenta.
- Wsparcie typów wydarzeń: wizyty kontrolne, sesje terapeutyczne, przypomnienia o lekach, procedury/ćwiczenia, pomiary parametrów zdrowotnych, inne niestandardowe.
- Widoki: dzienny, tygodniowy, miesięczny.
- Wizualne oznaczenie statusów: zaplanowane, przeterminowane, wykonane.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.31`, `funk.32`, `funk.33`, `funk.37`

---

### US-P-19 — Szczegóły wydarzenia i oznaczanie wykonania

**Historia:** Jako pacjent, chcę zobaczyć szczegóły wydarzenia oraz oznaczyć je jako wykonane z opcjonalną notatką, aby dokumentować swój udział w terapii.

**Kryteria akceptacji:**
- Szczegóły wydarzenia zawierają: nazwę, opis, godzinę, lokalizację, typ.
- Funkcja oznaczenia wydarzenia jako wykonanego.
- Możliwość dodania notatki pacjenta przy oznaczeniu wykonania.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.34`, `funk.35`, `funk.36`

---

### US-P-20 — Synchronizacja z kalendarzem systemowym i eksport iCal

**Historia:** Jako pacjent, chcę synchronizować wydarzenia z kalendarzem systemowym urządzenia oraz eksportować je do formatu iCal, aby integrować swój harmonogram terapii z narzędziami, których używam na co dzień.

**Kryteria akceptacji:**
- Opcjonalna synchronizacja z kalendarzem systemowym urządzenia.
- Funkcja eksportu wydarzeń do formatu iCal.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.38`, `funk.39`

---

### US-P-21 — Powiadomienia push

**Historia:** Jako pacjent, chcę otrzymywać powiadomienia push o nowych wiadomościach, zbliżających się wydarzeniach, nowych materiałach i zmianach w harmonogramie, aby nie przegapić ważnych informacji.

**Kryteria akceptacji:**
- Powiadomienia push wysyłane dla: nowych wiadomości od zespołu, zbliżających się wydarzeń (24h, 2h, 30 min przed — zgodnie ze zdefiniowanymi parametrami), nowych materiałów edukacyjnych, zmian w harmonogramie terapii.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.40`

---

### US-P-22 — Konfiguracja preferencji powiadomień

**Historia:** Jako pacjent, chcę skonfigurować preferencje powiadomień (typ wydarzenia, godziny ciszy, włączanie/wyłączanie kategorii), aby nie być przytłoczonym komunikatami.

**Kryteria akceptacji:**
- Ustawienia powiadomień pozwalają: wybrać typ wydarzenia, ustawić godziny ciszy, włączać/wyłączać powiadomienia dla konkretnych kategorii.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.41`

---

### US-P-23 — Compliance i statystyki terapii

**Historia:** Jako pacjent, chcę widzieć swój współczynnik compliance oraz statystyki postępów (zrealizowane wydarzenia, przeczytane materiały) w wybranym okresie czasu, aby mieć wgląd we własne zaangażowanie terapeutyczne.

**Kryteria akceptacji:**
- Wyświetlany współczynnik compliance w procentach.
- Statystyki: liczba zrealizowanych wydarzeń terapeutycznych, liczba przeczytanych materiałów edukacyjnych.
- Możliwość wyboru okresu czasu do przeglądu historii postępów.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `fuk.44`, `fuk.45`, `fuk.46`

---

## 🧑‍💼 Koordynator projektu terapeutycznego (portal webowy)

### US-K-01 — Wyszukiwanie pacjentów

**Historia:** Jako koordynator, chcę wyszukać pacjenta po numerze PESEL, imieniu i nazwisku lub identyfikatorze z systemu HIS, aby szybko odnaleźć osobę, z którą pracuję.

**Kryteria akceptacji:**
- Wyszukiwarka obsługuje kryteria: PESEL, imię i nazwisko, ID pacjenta z HIS.
- Czas zwrócenia wyniku wyszukiwania: poniżej 1 sekundy.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.08`, `nf.16`

---

### US-K-02 — Lista pacjentów z filtrowaniem i sortowaniem

**Historia:** Jako koordynator, chcę przeglądać listę wszystkich pacjentów z możliwością filtrowania i sortowania, aby pracować na odpowiednim podzbiorze danych.

**Kryteria akceptacji:**
- Lista pacjentów z możliwością filtrowania i sortowania.
- Ładowanie listy do 1000 rekordów: poniżej 3 sekund.
- Dostępny eksport listy do formatu CSV/Excel.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.09`, `ww.12`, `nf.15`

---

### US-K-03 — Profil pacjenta z podstawowymi informacjami

**Historia:** Jako koordynator, chcę zobaczyć podstawowe informacje o pacjencie (dane demograficzne, kontaktowe, lista projektów, status aktywności, kontakt awaryjny), aby mieć pełen kontekst przed interakcją.

**Kryteria akceptacji:**
- Widok pacjenta zawiera: dane demograficzne (pobrane z HIS), dane kontaktowe, listę projektów terapeutycznych, status aktywności w aplikacji.
- Dostępny widok kontaktu awaryjnego pacjenta.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.10`, `ww.11`

---

### US-K-04 — Przypisywanie pacjenta do projektów

**Historia:** Jako koordynator, chcę przypisać pacjenta do jednego lub wielu projektów terapeutycznych, z walidacją istnienia pacjenta w HIS przed przypisaniem, aby włączyć pacjenta we właściwe ścieżki terapii.

**Kryteria akceptacji:**
- Możliwość przypisania do jednego lub wielu projektów.
- System waliduje istnienie pacjenta w HIS przed przypisaniem.
- Pacjent otrzymuje powiadomienie o przypisaniu do nowego projektu.
- Historia przypisań zostaje zachowana.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.20`, `ww.22`, `ww.24`, `ww.25`, `ww.60`

---

### US-K-05 — Grupowe przypisywanie pacjentów

**Historia:** Jako koordynator, chcę przypisać wielu pacjentów do projektu jednocześnie (indywidualnie lub grupowo z importem listy), aby przyspieszyć onboarding grup.

**Kryteria akceptacji:**
- Dwa tryby: przypisanie indywidualne oraz grupowe z importu listy.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.21`

---

### US-K-06 — Usunięcie i przeniesienie pacjenta między projektami

**Historia:** Jako koordynator, chcę usunąć pacjenta z projektu (z podaniem przyczyny) lub przenieść go między projektami, zachowując historię, aby elastycznie zarządzać przebiegiem terapii.

**Kryteria akceptacji:**
- Usunięcie pacjenta z projektu wymaga podania przyczyny.
- Operacja przenoszenia pacjenta między projektami.
- Historia przypisań zachowana również po usunięciu/przeniesieniu.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.23`, `ww.24`, `ww.26`

---

### US-K-07 — Tworzenie i edycja projektu terapeutycznego

**Historia:** Jako koordynator, chcę stworzyć nowy projekt terapeutyczny z wymaganymi atrybutami, przypisać do niego zespół medyczny i edytować parametry, aby uruchomić terapię dla grupy pacjentów.

**Kryteria akceptacji:**
- Tworzenie projektu z polami: nazwa, opis celów terapii, przewidywany czas trwania, data rozpoczęcia, data zakończenia (opcjonalna).
- Możliwość edycji parametrów projektu.
- Przypisywanie zespołu medycznego (koordynator, lekarze, terapeuci).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.13`, `ww.14`, `ww.15`, `ww.16`

---

### US-K-08 — Archiwizacja zakończonych projektów

**Historia:** Jako koordynator, chcę zarchiwizować zakończony projekt, aby utrzymywać uporządkowaną listę aktywnej pracy.

**Kryteria akceptacji:**
- Funkcja archiwizacji dostępna dla projektów zakończonych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.17`

---

### US-K-09 — Lista projektów z filtrowaniem wg statusu

**Historia:** Jako koordynator, chcę przeglądać listę wszystkich projektów z filtrem statusu (aktywne / zakończone / archiwalne), aby szybko znaleźć właściwy projekt.

**Kryteria akceptacji:**
- Tabela projektów z filtrem wg statusu.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.18`

---

### US-K-10 — Statystyki projektu

**Historia:** Jako koordynator, chcę widzieć statystyki projektu (liczba przypisanych pacjentów, średni compliance, liczba aktywnych użytkowników), aby monitorować jego zdrowie operacyjne.

**Kryteria akceptacji:**
- Wyświetlane statystyki: liczba przypisanych pacjentów, średni współczynnik compliance, liczba aktywnych użytkowników.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.19`

---

### US-K-11 — Wysyłanie wiadomości do pacjentów

**Historia:** Jako koordynator, chcę wysyłać wiadomości tekstowe do pacjentów w trzech trybach (indywidualnym, grupowym, selektywnym) w ramach wątku projektu, z możliwością załączania plików, aby efektywnie komunikować się z pacjentami.

**Kryteria akceptacji:**
- Wysyłanie wiadomości tekstowych do pacjentów.
- Trzy tryby komunikacji: indywidualna, grupowa (wszyscy w projekcie), selektywna (wybrana grupa).
- Osobne wątki konwersacji per projekt.
- Załączniki do wiadomości — maksymalnie 10MB na plik.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.27`, `ww.28`, `ww.29`, `ww.30`

---

### US-K-12 — Historia korespondencji i statusy wiadomości

**Historia:** Jako koordynator, chcę widzieć chronologiczną historię korespondencji z pacjentem wraz ze statusami wiadomości, aby prowadzić komunikację w oparciu o pełen kontekst.

**Kryteria akceptacji:**
- Historia korespondencji w układzie chronologicznym.
- Oznaczenia: przeczytane / nieprzeczytane przez pacjenta.
- Status doręczenia wiadomości.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.31`, `ww.32`, `ww.33`

---

### US-K-13 — Powiadomienia o nowych wiadomościach od pacjentów

**Historia:** Jako członek personelu medycznego, chcę otrzymywać powiadomienia (email, notyfikacja w portalu) o nowych wiadomościach od pacjentów, aby nie przegapić ważnych zgłoszeń.

**Kryteria akceptacji:**
- Powiadomienia email.
- Powiadomienia in-portal o nowych wiadomościach.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.34`, `ww.56`

---

### US-K-14 — Oznaczanie i przypisywanie konwersacji

**Historia:** Jako koordynator, chcę oznaczać konwersacje jako ważne/do rozpatrzenia oraz przypisywać je do konkretnego członka zespołu, aby efektywnie rozdzielać pracę.

**Kryteria akceptacji:**
- Oznaczenie konwersacji jako ważna/do rozpatrzenia.
- Przypisanie konwersacji do konkretnego członka zespołu medycznego.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.35`, `ww.36`

---

### US-K-15 — Eksport konwersacji do PDF

**Historia:** Jako koordynator, chcę wyeksportować historię konwersacji z pacjentem do pliku PDF, aby dołączyć ją do dokumentacji.

**Kryteria akceptacji:**
- Funkcja eksportu konwersacji do PDF.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.37`

---

### US-K-16 — Planowanie wydarzeń terapeutycznych

**Historia:** Jako koordynator, chcę planować wydarzenia terapeutyczne (indywidualne, grupowe lub cykliczne) z odpowiednimi atrybutami, aby prowadzić harmonogram terapii.

**Kryteria akceptacji:**
- Planowanie wydarzeń dla pojedynczego pacjenta, grupy pacjentów lub cyklicznie (np. co tydzień, co miesiąc).
- Wsparcie typów wydarzeń: wizyty kontrolne, sesje terapeutyczne, przypomnienia o lekach, procedury/ćwiczenia, pomiary, inne niestandardowe.
- Możliwość definiowania niestandardowych typów wydarzeń specyficznych dla projektu.
- Dla każdego wydarzenia wymagane pola: nazwa, typ, data i godzina; opcjonalne: opis, lokalizacja.
- Konfiguracja przypomnień: 24h, 2h, 30 min przed wydarzeniem.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.37` (wydarzenia), `ww.38`, `ww.39`, `ww.40`, `ww.41`, `ww.42`

---

### US-K-17 — Edycja, usunięcie i powiadamianie o zmianach wydarzeń

**Historia:** Jako koordynator, chcę edytować lub usuwać zaplanowane wydarzenia, a system powinien automatycznie informować pacjenta o zmianach, aby harmonogram odzwierciedlał aktualny stan.

**Kryteria akceptacji:**
- Edycja i usuwanie zaplanowanych wydarzeń.
- Powiadomienie pacjenta o nowych wydarzeniach i zmianach w harmonogramie.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.43`, `ww.44`

---

### US-K-18 — Kalendarz w widokach dzienny/tygodniowy/miesięczny

**Historia:** Jako koordynator, chcę przeglądać kalendarz wydarzeń w widokach dziennym, tygodniowym i miesięcznym, aby pracować w perspektywie czasowej odpowiedniej do zadania.

**Kryteria akceptacji:**
- Kalendarz wspiera widoki: dzienny, tygodniowy, miesięczny.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.45`

---

### US-K-19 — Filtrowanie wydarzeń i status realizacji

**Historia:** Jako koordynator, chcę filtrować wydarzenia wg pacjenta, typu, statusu i okresu oraz widzieć status realizacji przez pacjenta (wykonane z datą i notatką, przeterminowane, zaplanowane), aby monitorować adherencję.

**Kryteria akceptacji:**
- Filtry: pacjent, typ wydarzenia, status (zaplanowane / wykonane / przeterminowane), okres czasu.
- Wyświetlanie statusu: wykonane (z datą i notatką pacjenta), przeterminowane, zaplanowane.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.46`, `ww.47`

---

### US-K-20 — Eksport harmonogramu

**Historia:** Jako koordynator, chcę wyeksportować harmonogram do iCal lub CSV, aby integrować go z narzędziami zewnętrznymi.

**Kryteria akceptacji:**
- Eksport harmonogramu do formatu iCal lub CSV.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.48`

---

### US-K-21 — Compliance i szczegółowe statystyki pacjenta

**Historia:** Jako koordynator, chcę widzieć współczynnik compliance oraz szczegółowe statystyki każdego pacjenta (zrealizowane wydarzenia, przeczytane materiały, wysłane wiadomości), aby oceniać jego zaangażowanie.

**Kryteria akceptacji:**
- Wyświetlany współczynnik compliance dla każdego pacjenta.
- Szczegółowe statystyki: liczba zrealizowanych wydarzeń terapeutycznych, liczba przeczytanych materiałów edukacyjnych, liczba wysłanych wiadomości.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.50`, `ww.51`

---

### US-K-22 — Identyfikacja pacjentów z niską adherencją

**Historia:** Jako koordynator, chcę automatycznie otrzymywać listę pacjentów z compliance poniżej zdefiniowanego progu, aby skupić uwagę na osobach wymagających interwencji.

**Kryteria akceptacji:**
- System identyfikuje pacjentów z niską adherencją (poniżej progu).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.52`

---

### US-K-23 — Raporty zbiorcze

**Historia:** Jako koordynator, chcę wygenerować raporty zbiorcze dla projektu (compliance grupy, realizacja wydarzeń, zaangażowanie w materiały) i wyeksportować je do PDF, Excel lub CSV, aby przedstawiać wyniki interesariuszom.

**Kryteria akceptacji:**
- Raporty: compliance całej grupy, realizacja wydarzeń, zaangażowanie w materiały edukacyjne.
- Eksport do formatów: PDF, Excel, CSV.
- Generowanie standardowych raportów: poniżej 10 sekund.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.53`, `ww.54`, `nf.14`

---

### US-K-24 — Dashboard KPI projektu

**Historia:** Jako koordynator, chcę mieć dashboard z kluczowymi wskaźnikami projektu, aby codziennie rozpoczynać pracę od aktualnego obrazu sytuacji.

**Kryteria akceptacji:**
- Dashboard pokazuje: liczbę aktywnych pacjentów, średni compliance, liczbę pacjentów wymagających interwencji, liczbę nieodczytanych wiadomości od pacjentów.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.55`

---

### US-K-25 — Powiadomienia o zbliżających się wizytach

**Historia:** Jako członek personelu medycznego, chcę otrzymywać powiadomienia email o zbliżających się wizytach kontrolnych, aby być przygotowanym do ich prowadzenia.

**Kryteria akceptacji:**
- Powiadomienia email o zbliżających się wizytach kontrolnych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.56`

---

### US-K-26 — Konfiguracja preferencji powiadomień personelu

**Historia:** Jako członek personelu medycznego, chcę skonfigurować preferencje powiadomień, aby dopasować komunikację z systemem do własnych przyzwyczajeń.

**Kryteria akceptacji:**
- Dostępny ekran konfiguracji preferencji powiadomień użytkownika.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.57`

---

## 👨‍⚕️ Lekarz / Terapeuta / inny personel medyczny (portal webowy)

### US-L-01 — Dodawanie i formaty materiałów edukacyjnych

**Historia:** Jako lekarz/terapeuta, chcę dodawać materiały edukacyjne dla pacjentów w różnych formatach, aby dostarczać im treści dopasowane do procesu terapeutycznego.

**Kryteria akceptacji:**
- Dodawanie materiałów edukacyjnych dla pacjentów.
- Wsparcie formatów: artykuły tekstowe (edytor WYSIWYG), dokumenty PDF, obrazy/infografiki (JPG, PNG), linki do filmów (YouTube, Vimeo), pliki do pobrania.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.28` (materiały), `ww.29` (materiały)

---

### US-L-02 — Kategoryzacja materiałów

**Historia:** Jako lekarz/terapeuta, chcę kategoryzować materiały wg projektu, tematyki i poziomu zaawansowania, aby utrzymywać porządek w bibliotece treści.

**Kryteria akceptacji:**
- Kategoryzacja wg: projektu terapeutycznego, kategorii tematycznej, poziomu zaawansowania (podstawowy / średni / zaawansowany).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.30` (materiały)

---

### US-L-03 — Przypisywanie materiałów do pacjentów

**Historia:** Jako lekarz/terapeuta, chcę przypisywać materiały do wszystkich pacjentów w projekcie, wybranych pacjentów lub konkretnych etapów terapii, aby personalizować ścieżkę edukacyjną.

**Kryteria akceptacji:**
- Przypisywanie materiałów do: wszystkich pacjentów w projekcie, wybranych pacjentów, konkretnych etapów terapii.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.31` (materiały)

---

### US-L-04 — Edycja, usuwanie i podgląd materiałów

**Historia:** Jako lekarz/terapeuta, chcę edytować, usuwać oraz oglądać podgląd materiału przed publikacją, aby mieć kontrolę jakości nad dostarczanymi treściami.

**Kryteria akceptacji:**
- Edycja i usuwanie materiałów edukacyjnych.
- Funkcja podglądu materiału przed publikacją.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.32` (materiały), `ww.33` (materiały)

---

### US-L-05 — Powiadamianie pacjentów o nowych materiałach

**Historia:** Jako lekarz/terapeuta, chcę powiadomić pacjentów (automatycznie lub ręcznie) o nowych materiałach, aby zachęcać ich do regularnego angażowania się.

**Kryteria akceptacji:**
- Możliwość automatycznego lub ręcznego powiadamiania pacjentów o nowych materiałach.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.34` (materiały)

---

### US-L-06 — Statystyki wyświetleń materiałów

**Historia:** Jako lekarz/terapeuta, chcę widzieć statystyki wyświetleń materiałów, aby oceniać ich skuteczność.

**Kryteria akceptacji:**
- Wyświetlanie statystyk wyświetleń materiałów.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.35` (materiały)

---

### US-L-07 — Duplikowanie materiałów między projektami

**Historia:** Jako lekarz/terapeuta, chcę zduplikować materiał do innego projektu, aby nie tworzyć tych samych treści od zera.

**Kryteria akceptacji:**
- Funkcja duplikowania materiałów między projektami.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.36` (materiały)

---

## ⚙️ Administrator systemu (portal webowy)

### US-A-01 — Zarządzanie kontami personelu

**Historia:** Jako administrator, chcę tworzyć i dezaktywować konta personelu medycznego oraz zarządzać ich danymi profilu, aby kontrolować dostęp do systemu.

**Kryteria akceptacji:**
- Tworzenie kont dla personelu medycznego przez administratora.
- Zarządzanie danymi profilu personelu (dane osobowe, specjalizacja, dane kontaktowe).
- Dezaktywacja kont bez usuwania historii działań.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.01`, `ww.05`, `ww.06`

---

### US-A-02 — Role i przypisywanie uprawnień

**Historia:** Jako administrator, chcę definiować role użytkowników i przypisywać uprawnienia na poziomie projektu terapeutycznego, aby wdrożyć kontrolę dostępu opartą na rolach (RBAC).

**Kryteria akceptacji:**
- Wsparcie ról: Administrator systemu, Koordynator projektu terapeutycznego, Lekarz/Terapeuta, Inny personel medyczny.
- Przypisywanie uprawnień na poziomie projektu terapeutycznego.
- Mechanizm kontroli dostępu oparty na rolach (RBAC).
- Kontrola dostępu na poziomie projektu — użytkownik widzi tylko projekty, do których jest przypisany.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.02`, `ww.03`, `ww.71`, `nf.10`

---

### US-A-03 — Logowanie personelu z 2FA

**Historia:** Jako członek personelu, chcę logować się za pomocą hasła oraz mieć opcję 2FA, aby zabezpieczyć konto.

**Kryteria akceptacji:**
- Logowanie hasłem oraz 2FA.
- Hasło musi spełniać wymogi: minimum 12 znaków, wielkie i małe litery, cyfry, znaki specjalne.
- Blokada konta po 5 nieudanych próbach logowania na 15 minut.
- Automatyczne wylogowanie po 30 minutach nieaktywności.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.04`, `nf.04`, `nf.05`, `nf.07`

---

### US-A-04 — Przeglądy dostępu użytkowników

**Historia:** Jako administrator, chcę przeglądać uprawnienia użytkowników (kto ma dostęp do jakich danych), aby przeprowadzać okresowe audyty bezpieczeństwa.

**Kryteria akceptacji:**
- Dostępny widok przeglądu dostępów (użytkownik → projekty → dane).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `nf.11`

---

### US-A-05 — Konfiguracja systemu

**Historia:** Jako administrator, chcę zarządzać konfiguracją systemu (polityka haseł, czas sesji, konfiguracja powiadomień, szablony wiadomości), aby dostosować system do potrzeb placówki.

**Kryteria akceptacji:**
- Zarządzanie: parametrami bezpieczeństwa (polityka haseł, czas sesji), konfiguracją powiadomień, szablonami wiadomości.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.65`

---

### US-A-06 — Logi audytowe

**Historia:** Jako administrator, chcę przeglądać i eksportować logi audytowe obejmujące logowania użytkowników, dostęp do danych pacjentów, zmiany w projektach i operacje na danych wrażliwych, aby spełniać wymogi compliance.

**Kryteria akceptacji:**
- Logowanie wszystkich działań użytkowników w celach audytu.
- System loguje operacje dostępu do danych pacjentów oraz operacje krytyczne (CRUD na projektach, przypisania pacjentów).
- Logowanie operacji komunikacji z HIS.
- Przegląd logów audytowych: logowania, dostęp do danych pacjentów, zmiany w projektach, operacje na danych wrażliwych.
- Eksport logów audytowych.
- Dane komunikacji i raportów przechowywane przez minimum 10 lat.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.07`, `ww.63`, `ww.66`, `ww.67`, `nf.06`, `nf.19`

---

### US-A-07 — Zarządzanie kopiami zapasowymi

**Historia:** Jako administrator, chcę przeglądać historię backupów, ręcznie uruchamiać tworzenie backupu i przywracać dane z backupu, aby zapewniać ciągłość działania.

**Kryteria akceptacji:**
- Przegląd historii backupów.
- Ręczne tworzenie backupu.
- Przywracanie danych z backupu.
- Automatyczny backup co 24 godziny.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.68`, `dos.02`, `nf.18`

---

### US-A-08 — Monitoring stanu systemu

**Historia:** Jako administrator, chcę monitorować stan systemu (status serwerów, wykorzystanie zasobów), aby reagować na problemy operacyjne.

**Kryteria akceptacji:**
- Monitoring: status serwerów, wykorzystanie zasobów.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.69`

---

### US-A-09 — Zarządzanie słownikami systemowymi

**Historia:** Jako administrator, chcę zarządzać słownikami systemowymi (typy wydarzeń, kategorie materiałów, przyczyny usunięcia pacjenta), aby dostosować dane do specyfiki placówki.

**Kryteria akceptacji:**
- Zarządzanie słownikami: typy wydarzeń terapeutycznych, kategorie materiałów edukacyjnych, przyczyny usunięcia pacjenta z projektu.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.70`

---

### US-A-10 — Anonimizacja danych pacjenta do raportowania zbiorczego

**Historia:** Jako administrator, chcę anonimizować dane pacjenta dla celów raportowania zbiorczego, aby spełniać wymogi RODO dotyczące minimalizacji danych.

**Kryteria akceptacji:**
- Funkcja anonimizacji danych pacjenta dla raportów zbiorczych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.72`

---

### US-A-11 — Eksport danych pacjenta (RODO — prawo do przenoszenia)

**Historia:** Jako administrator, chcę wyeksportować dane pacjenta zgodnie z wymogami RODO (prawo do przenoszenia danych), aby realizować prawa osób, których dane dotyczą.

**Kryteria akceptacji:**
- Eksport danych pacjenta zgodnie z wymogami RODO.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.73`

---

### US-A-12 — Usunięcie danych pacjenta (RODO — prawo do bycia zapomnianym)

**Historia:** Jako administrator, chcę usunąć dane pacjenta na żądanie z zachowaniem minimalnych danych wymaganych prawnie, aby realizować prawo do bycia zapomnianym.

**Kryteria akceptacji:**
- Usunięcie danych pacjenta z zachowaniem danych minimalnych wymaganych prawnie.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.74`

---

### US-A-13 — Rejestr przetwarzania danych osobowych

**Historia:** Jako administrator, chcę mieć wgląd w rejestr przetwarzania danych osobowych, aby spełniać obowiązki RODO.

**Kryteria akceptacji:**
- System prowadzi rejestr przetwarzania danych osobowych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww.75`

---

## 🔐 Bezpieczeństwo, RODO i integracja HIS (wymagania systemowe)

### US-S-01 — Zgodność z RODO

**Historia:** Jako placówka medyczna, chcę aby system spełniał wymogi RODO dotyczące przetwarzania danych osobowych i zdrowotnych, aby działać zgodnie z prawem.

**Kryteria akceptacji:**
- System spełnia wymogi RODO dla danych osobowych i zdrowotnych.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `sec.01`, `nf.01`

---

### US-S-02 — Szyfrowanie i ochrona przed OWASP Top 10

**Historia:** Jako placówka medyczna, chcę aby system szyfrował dane w spoczynku i w tranzycie oraz chronił się przed atakami OWASP Top 10, aby minimalizować ryzyko incydentów.

**Kryteria akceptacji:**
- Szyfrowanie w spoczynku: AES-256.
- Szyfrowanie w tranzycie: TLS 1.3.
- Ochrona przed atakami OWASP Top 10.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `sec.02`, `nf.02`, `nf.03`

---

### US-S-03 — Separacja danych między projektami

**Historia:** Jako placówka medyczna, chcę aby system zapewniał separację danych między projektami terapeutycznymi, aby dane jednego projektu nie były dostępne z poziomu innego.

**Kryteria akceptacji:**
- System zapewnia separację danych pomiędzy różnymi projektami terapeutycznymi.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `sec.05`, `nf.09`

---

### US-S-04 — Integracja z HIS — zakres i ograniczenia

**Historia:** Jako placówka medyczna, chcę aby integracja z HIS była ograniczona do weryfikacji tożsamości, pobierania podstawowych danych demograficznych i walidacji istnienia pacjenta w systemie szpitalnym, bez dostępu do pełnej dokumentacji medycznej, aby zachować bezpieczeństwo i prywatność.

**Kryteria akceptacji:**
- Aplikacja/system pobiera z HIS: dane demograficzne (imię, nazwisko, PESEL, data urodzenia) podczas rejestracji, weryfikacji tożsamości, aktualizacji na żądanie.
- System weryfikuje istnienie pacjenta w HIS przed przypisaniem do projektu.
- System synchronizuje dane demograficzne z HIS (PESEL, imię, nazwisko, data urodzenia).
- Aplikacja/system NIE pobiera dokumentacji medycznej z HIS.
- Komunikacja z HIS odbywa się wyłącznie podczas procesu rejestracji (w zakresie aplikacji mobilnej) / w ramach zakresu portalu.
- Po weryfikacji tożsamości aplikacja/system działa niezależnie od dostępności HIS.
- Komunikacja z HIS odbywa się przez bezpieczne kanały VPN lub dedykowane połączenia.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `funk.47`, `funk.48`, `int.01`, `int.02`, `int.03`, `int.04`, `int.05`, `ww.59`, `ww.60`, `ww.61`, `ww.62`, `ww.64`, `ww-nf-int.01`, `ww-nf-int.02`, `ww-nf-int.04`, `nf.08`

---

### US-S-05 — Otwartość na przyszłe rozszerzenia integracji

**Historia:** Jako placówka medyczna, chcę aby system był otwarty na przyszłe rozszerzenia integracji (z HIS oraz innymi systemami), aby móc ewoluować wraz z potrzebami.

**Kryteria akceptacji:**
- Architektura umożliwia przyszłe rozszerzenia integracji z HIS zgodnie z potrzebami Zamawiającego.
- Architektura umożliwia przyszłe integracje z innymi systemami.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `int.06`, `ww-nf-int.03`, `ww-nf-int.08`

---

### US-S-06 — Komunikacja portal ↔ aplikacja mobilna

**Historia:** Jako placówka medyczna, chcę aby portal webowy i aplikacja mobilna komunikowały się przez wspólne API backendu i synchronizowały dane w czasie rzeczywistym, aby zapewnić spójność informacji.

**Kryteria akceptacji:**
- Portal komunikuje się z aplikacją mobilną poprzez wspólne API backendu.
- Synchronizacja w czasie rzeczywistym obejmuje: wiadomości, wydarzenia w harmonogramie, materiały edukacyjne, powiadomienia.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww-nf-int.06`, `ww-nf-int.07`

---

## 📈 Wydajność, dostępność, skalowalność (wymagania systemowe)

### US-S-07 — Czas odpowiedzi

**Historia:** Jako użytkownik, chcę aby system reagował na moje akcje w czasie poniżej 2 sekund (dla 95% przypadków), aby praca była płynna.

**Kryteria akceptacji:**
- Czas odpowiedzi aplikacji mobilnej: ≤ 2s w 95% przypadków.
- Czas odpowiedzi portalu: ≤ 2s w 95% przypadków.
- Wiadomości dostarczane z opóźnieniem ≤ 5s.
- Aplikacja mobilna uruchamia się ≤ 5s.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `wyda.01`, `wyda.03`, `wyda.04`, `nf.12`

---

### US-S-08 — Obsługa jednoczesnych użytkowników

**Historia:** Jako placówka medyczna, chcę aby system obsługiwał jednocześnie co najmniej 5000 użytkowników aplikacji mobilnej oraz 500 użytkowników portalu, aby skalować się do wielu placówek/pacjentów.

**Kryteria akceptacji:**
- Aplikacja mobilna obsługuje min. 5000 jednoczesnych użytkowników.
- Portal obsługuje min. 500 jednoczesnych użytkowników.
- System obsługuje minimum 50 000 pacjentów jednocześnie.
- System obsługuje minimum 200 projektów terapeutycznych jednocześnie.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `wyda.02`, `nf.13`, `nf.26`, `nf.28`

---

### US-S-09 — Wydajność list i raportów w portalu

**Historia:** Jako członek personelu, chcę aby listy i raporty ładowały się w rozsądnym czasie, aby moja praca była efektywna.

**Kryteria akceptacji:**
- Ładowanie listy pacjentów (do 1000 rekordów): ≤ 3s.
- Wyszukiwanie w bazie pacjentów: ≤ 1s.
- Generowanie standardowych raportów: ≤ 10s.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `nf.14`, `nf.15`, `nf.16`

---

### US-S-10 — Dostępność 99.5%

**Historia:** Jako placówka medyczna, chcę aby system zapewniał dostępność na poziomie 99.5% oraz mechanizmy redundancji, aby minimalizować przestoje.

**Kryteria akceptacji:**
- Dostępność aplikacji mobilnej: 99.5% (≤ 3.65h przestoju rocznie).
- Dostępność portalu: 99.5% (≤ 3.65h przestoju rocznie).
- Mechanizmy redundancji dla krytycznych komponentów.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `dos.01`, `nf.17`, `nf.20`

---

### US-S-11 — Automatyczne wznawianie synchronizacji po utracie sieci

**Historia:** Jako pacjent, chcę aby aplikacja automatycznie wznawiała synchronizację danych po przywróceniu połączenia, aby nie tracić wprowadzonych informacji.

**Kryteria akceptacji:**
- Automatyczne wznawianie synchronizacji po przywróceniu sieci.
- Synchronizacja w tle nie wpływa znacząco na wydajność urządzenia.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `dos.03`, `wyda.05`

---

### US-S-12 — Skalowanie horyzontalne i replikacja

**Historia:** Jako placówka medyczna, chcę aby architektura umożliwiała skalowanie horyzontalne serwerów oraz replikację i partycjonowanie bazy, aby system mógł rosnąć razem z obciążeniem.

**Kryteria akceptacji:**
- Skalowanie horyzontalne serwerów aplikacyjnych.
- Baza danych wspiera replikację i partycjonowanie.
- Dodawanie nowych projektów terapeutycznych bez zmian w architekturze.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `sk.01`, `sk.02`, `sk.03`, `nf.24`, `nf.25`, `nf.27`

---

### US-S-13 — Wydajność mobilna

**Historia:** Jako pacjent, chcę aby aplikacja mobilna była mała, wydajna i oszczędna dla baterii, aby komfortowo jej używać.

**Kryteria akceptacji:**
- Rozmiar aplikacji mobilnej (bez pobranych materiałów): ≤ 50MB.
- Optymalizacja zużycia baterii.
- Zużycie RAM: ≤ 100MB.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `wyd.01`, `wyd.02`, `wyd.03`

---

## 💻 Kompatybilność i użyteczność (wymagania systemowe)

### US-S-14 — Platformy mobilne i dystrybucja

**Historia:** Jako pacjent, chcę korzystać z aplikacji na iOS lub Android, zainstalowanej ze sklepu odpowiedniego dla mojej platformy, aby mieć standardowe doświadczenie użytkownika.

**Kryteria akceptacji:**
- Aplikacja dostępna na iOS i Android.
- Responsywność — telefony i tablety.
- Dystrybucja przez App Store (iOS) i Google Play (Android).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `komp.01`, `komp.02`, `komp.03`, `komp.04`

---

### US-S-15 — Kompatybilność portalu

**Historia:** Jako członek personelu, chcę korzystać z portalu w jednej z popularnych przeglądarek, niezależnie od systemu operacyjnego, aby pracować w wybranej konfiguracji.

**Kryteria akceptacji:**
- Portal działa w przeglądarkach: Chrome, Firefox, Edge, Safari (aktualna + 2 poprzednie wersje).
- Responsywność portalu — desktop i tablet.
- Portal działa na Windows, macOS, Linux.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `nf.21`, `nf.22`, `nf.23`

---

### US-S-16 — Zgodność z Material Design / HIG

**Historia:** Jako pacjent, chcę aby interfejs aplikacji był zgodny z wytycznymi platformy, aby nawigacja była dla mnie intuicyjna.

**Kryteria akceptacji:**
- Android: zgodność z Material Design.
- iOS: zgodność z Human Interface Guidelines.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `us.01`

---

### US-S-17 — Wielojęzyczność PL + EN

**Historia:** Jako użytkownik, chcę korzystać z systemu w języku polskim lub angielskim, aby komfortowo go obsługiwać.

**Kryteria akceptacji:**
- Aplikacja mobilna wspiera języki: polski i angielski.
- Portal wspiera języki: polski i angielski.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `us.02`, `ww-nf-us.02`

---

### US-S-18 — Dostępność WCAG 2.1 AA

**Historia:** Jako użytkownik z niepełnosprawnościami, chcę aby system spełniał WCAG 2.1 AA wraz z konfigurowalnym rozmiarem czcionki i trybem wysokiego kontrastu, aby móc z niego korzystać.

**Kryteria akceptacji:**
- Aplikacja mobilna: zgodność z WCAG 2.1 AA.
- Portal: zgodność z WCAG 2.1 AA.
- Konfigurowalny rozmiar czcionki (aplikacja mobilna).
- Wsparcie trybu wysokiego kontrastu (aplikacja mobilna).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `us.03`, `us.04`, `us.05`, `ww-nf-us.03`

---

### US-S-19 — Intuicyjność i 3 kliknięcia do głównych funkcji

**Historia:** Jako użytkownik, chcę aby interfejs był intuicyjny i wymagał maksymalnie 3 kliknięć do dotarcia do głównych funkcji, aby korzystanie było sprawne.

**Kryteria akceptacji:**
- Aplikacja mobilna: prostota nawigacji — max 3 kliknięcia do głównych funkcji.
- Portal: intuicyjny i spójny wizualnie, prostota nawigacji — max 3 kliknięcia do głównych funkcji.

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `us.06`, `ww-nf-us.01`, `ww-nf-us.04`

---

### US-S-20 — Kontekstowa pomoc dla personelu

**Historia:** Jako członek personelu, chcę mieć kontekstową pomoc (dokumentację online) dostępną w portalu, aby szybko wyjaśniać wątpliwości w trakcie pracy.

**Kryteria akceptacji:**
- Portal posiada kontekstową pomoc dla użytkowników (dokumentacja online).

**Priorytet:** Must Have  
**Numer specyfikacji klienta:** `ww-nf-us.05`

---

## 📊 Podsumowanie

Wszystkie historie w tym dokumencie mają priorytet **Must Have** i są **w 100% zgodne** ze specyfikacją klienta (`mobile.md`, `portal.md`).

**Liczba historii:** 69

| Obszar | Liczba historii |
|--------|----------------|
| Pacjent (aplikacja mobilna) | 23 |
| Koordynator projektu | 26 |
| Lekarz / Terapeuta | 7 |
| Administrator systemu | 13 |
| Wymagania systemowe (bezpieczeństwo, HIS, wydajność, użyteczność) | — ujęte w US-S-01 – US-S-20 |

**Pokryte numery specyfikacji:**
- Mobilna: `funk.01` – `funk.48` (z wyłączeniem identyfikatorów przeniesionych do `nicetohave.md`), `sec.01` – `sec.05`, `wyda.01` – `wyda.05`, `dos.01` – `dos.03`, `komp.01` – `komp.04`, `sk.01` – `sk.03`, `us.01` – `us.06`, `wyd.01` – `wyd.03`, `int.01` – `int.06`.
- Portal: `ww.01` – `ww.75` (z wyłączeniem numerów poszerzeń), `nf.01` – `nf.28`, `ww-nf-us.01` – `ww-nf-us.05`, `ww-nf-int.01` – `ww-nf-int.08`.

Historie oznaczone jako poszerzenia analityczne, Should/Could Have, a także kwestie wymagające decyzji klienta znajdują się w osobnym dokumencie `nicetohave.md`.
