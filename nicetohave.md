# Historie użytkownika — zakres poszerzony i kwestie do dyskusji

## System Zarządzania Terapią Pacjentów po Implantacji Ślimakowej (IFPS-TMS)

**Zakres dokumentu:** historie użytkownika wykraczające poza literalną treść specyfikacji klienta (`mobile.md` + `portal.md`) oraz kwestie wymagające decyzji biznesowej przed rozpoczęciem fazy projektowej lub implementacji. Dokument zawiera:

- **Poszerzenia funkcjonalne** — funkcje nieobecne w specyfikacji, które podnoszą wartość produktową, ale wymagają formalnej akceptacji klienta (aneksu zakresu).
- **Historie o niższym priorytecie** (Should Have / Could Have / Won't Have w MVP) — wartościowe, ale nieblokujące dostarczenia minimalnego produktu.
- **Alternatywne workflow** doprecyzowujące sposób realizacji wymagań klienta (np. bezpieczny model weryfikacji HIS).
- **Kwestie otwarte do dyskusji** — decyzje kliniczne, prawne, UX i technologiczne.

---

## 🎯 Kontekst biznesowy

IFPS-TMS to system wspierający długoterminową rehabilitację pacjentów po implantacji ślimakowej. Specyfikacja klienta definiuje zestaw wymagań, które stanowią zakres obowiązkowy (opisany w dokumencie `spec.md`). Jednocześnie w trakcie analizy biznesowej pojawił się szereg obszarów, w których:

- Literalne wymaganie klienta ma istotne implikacje bezpieczeństwa, które sugerują inny sposób realizacji niż pierwsze odczytanie (np. weryfikacja HIS po stronie portalu, nie aplikacji mobilnej — ochrona przed enumeracją pacjentów placówki na podstawie PESEL-u).
- Istnieją uzasadnione kliniczne i produktowe poszerzenia (np. quizy edukacyjne, odznaki motywacyjne, tryb uproszczony UI dla seniorów i pacjentów z niską biegłością cyfrową, biometria jako alternatywa dla hasła), które zwiększają adherencję terapeutyczną, ale nie zostały wskazane w specyfikacji.
- Pojawiają się funkcje, które naturalnie uzupełniają workflow personelu (np. delegowanie wątków z komentarzem wewnętrznym, propozycja zmiany terminu przez pacjenta, model etapów terapii z automatycznym odblokowywaniem po quizie).
- Występują kwestie technologiczne i prawne wymagające decyzji przed rozpoczęciem implementacji (wybór frameworka mobilnego, design system, dostawca SMS, zgodność z MDR / AI Act).

Wszystkie poniższe historie i kwestie wymagają decyzji klienta **przed włączeniem do MVP** lub przeniesienia do faz późniejszych. Dokument ma służyć jako materiał do warsztatu z zespołem Zamawiającego (IFPS).

---

## 🔐 Sekcja 1 — Alternatywny workflow weryfikacji pacjenta (krytyczne uzupełnienie)

### US-NH-01 — Weryfikacja HIS wykonywana przez personel z portalu

**Historia:** Jako pacjent, chcę aby weryfikacja mojej tożsamości przez HIS odbywała się po stronie personelu medycznego (z portalu), a nie była uruchamiana z poziomu aplikacji mobilnej, aby żadna osoba niepowołana nie mogła wykorzystać aplikacji do potwierdzania przynależności konkretnych osób do placówki.

**Kryteria akceptacji:**
- Aplikacja mobilna nie odpytuje HIS bezpośrednio — żadne pole w aplikacji nie akceptuje numeru kartoteki HIS.
- Po rejestracji w aplikacji pacjent otrzymuje status "oczekuje na autoryzację przez zespół medyczny" z informacją, w jakim czasie zwykle odbywa się weryfikacja oraz numerem kontaktowym koordynatora.
- W tym statusie pacjent nie ma dostępu do funkcji terapeutycznych (projekty, materiały, kalendarz, wiadomości) — widoczny jest wyłącznie ekran statusu i profil z podstawowymi danymi.
- Personel (koordynator / lekarz) w portalu widzi listę oczekujących i dla każdego zgłoszenia wykonuje weryfikację HIS (wprowadza PESEL + nr kartoteki, porównuje dane z HIS ze zgłoszeniem pacjenta) lub akceptuje ręcznie (bez HIS) z wymaganym uzasadnieniem.
- Po pozytywnej weryfikacji konto zostaje aktywowane; pacjent otrzymuje powiadomienie i uzyskuje pełny dostęp.
- W przypadku odrzucenia pacjent otrzymuje ogólny komunikat (bez ujawniania przyczyny — ochrona informacji operacyjnej placówki) z prośbą o kontakt z koordynatorem.
- Wszystkie decyzje autoryzacyjne (zatwierdzenie, odrzucenie, zapytanie HIS) są zapisywane w audycie z polem `reason`.

**Priorytet:** Must Have (realizuje wymagania weryfikacji HIS, ale jako alternatywny workflow względem literalnego brzmienia)  
**Numer specyfikacji klienta:** `funk.02`, `funk.06`, `int.01`, `int.02`, `int.04`, `ww.22`, `ww.59`, `ww.60`, `ww.61`, `ww-nf-int.01`

**Uwagi / Ryzyka:** 
- Wymaga rozszerzenia modelu danych o status konta `pending_staff_verification` oraz pól weryfikacyjnych (`verification_method`, `verified_by`, `verified_at`, `verification_reason`).
- Wymaga nowego widoku "Oczekujące autoryzacje" na pulpicie personelu.
- Transparentność wobec pacjenta przy odmowie — intencjonalnie nieinformatywna; wymaga odpowiedniego zapisu w polityce prywatności.
- **Kwestia do decyzji klienta:** akceptacja tego workflow jako formalnego sposobu realizacji `funk.02` i `funk.06`.

---

### US-NH-02 — Dodawanie pacjenta przez personel z fallbackiem manualnym

**Historia:** Jako koordynator, chcę mieć możliwość dodania pacjenta do systemu manualnie (bez weryfikacji HIS) nawet gdy integracja HIS jest aktywna, aby obsługiwać przypadki pacjentów zewnętrznych, niedostępności HIS lub testów systemu.

**Kryteria akceptacji:**
- Formularz "Dodaj pacjenta" zawsze pozwala na ręczne wprowadzenie wszystkich danych, niezależnie od tego, czy integracja HIS jest aktywna.
- Gdy HIS aktywny — dostępny dodatkowo tryb "Import z HIS" (równoprawny, nie wymuszony).
- Przy awarii HIS — automatyczne przełączenie na tryb manualny z zachowaniem wpisanych danych.
- Ręczne dodanie pacjenta oznaczane jako `source_system = MANUAL`; import z HIS oznaczany jako `source_system = HIS_SYNC`.

**Priorytet:** Must Have (uzupełnienie realizacji wymagań dodawania pacjenta)  
**Numer specyfikacji klienta:** `funk.01`, `funk.06`, `ww.10`, `ww.59`, `ww-nf-int.04`

**Uwagi:** Umożliwia zachowanie działania standalone w pierwszym etapie wdrożenia — system gotowy do pełnej integracji z HIS, ale nie uzależniony od niej operacyjnie.

---

## 🎓 Sekcja 2 — Poszerzenia funkcjonalne — edukacja i zaangażowanie pacjenta

### US-NH-03 — Quizy edukacyjne z weryfikacją wiedzy

**Historia:** Jako pacjent, chcę rozwiązywać quizy edukacyjne powiązane z materiałami i etapami terapii, aby aktywnie weryfikować zdobytą wiedzę i motywować się do nauki.

**Kryteria akceptacji:**
- Quiz zawiera zestaw pytań (single choice, multi choice, true/false).
- Po ukończeniu pacjent widzi wynik (punkty + procent) i status zaliczenia (próg konfigurowalny per quiz).
- Historia podejść zachowana.
- Quizy rozwiązywane online — walidacja na backendzie.
- Quiz może być powiązany z etapem programu (odblokowanie kolejnego etapu po zaliczeniu) — patrz US-NH-06.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi / Ryzyka:** 
- **Do decyzji klienta:** czy quizy mają być częścią MVP? Wsparcie: quizy są typowym elementem DTx (Digital Therapeutics) i znacznie wspierają adherencję, szczególnie u pacjentów po implancie (nauka zrozumiałości mowy, ćwiczenia słuchowe).
- Kwestia kliniczna: pokazywanie poprawnych odpowiedzi po zakończeniu (rekomendacja: tak — wartość edukacyjna).

---

### US-NH-04 — Odznaki i gamifikacja

**Historia:** Jako pacjent, chcę zdobywać odznaki za realizację celów terapeutycznych (np. ukończenie 10 wydarzeń, utrzymanie compliance >80%, zaliczenie quizu), aby być motywowanym do regularnego zaangażowania.

**Kryteria akceptacji:**
- Katalog odznak definiowany przez administratora w portalu.
- Odznaki przyznawane automatycznie po spełnieniu warunków; bez retroaktywnego przyznawania (tylko za zdarzenia po dodaniu odznaki).
- Pacjent ma dedykowany widok "Moje odznaki" z oznaczeniem: zdobyte (z datą) i dostępne do zdobycia (z opisem warunku).
- Powiadomienie push przy zdobyciu nowej odznaki.

**Priorytet:** Could Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** czy gamifikacja jest odpowiednia dla profilu pacjentów IFPS (szczególnie seniorów i dzieci)?
- **Do dyskusji:** jakie dodatkowe elementy gamifikacji poza odznakami? ("streaki" aktywności, konfetti przy osiągnięciu) — rankingi społecznościowe odradzamy ze względów RODO i ryzyka negatywnego porównywania się.

---

### US-NH-05 — Propozycja zmiany terminu wydarzenia przez pacjenta

**Historia:** Jako pacjent, chcę zaproponować nowy termin zaplanowanego wydarzenia (z ograniczeniami: min. 24h przed, max 3 próby na wydarzenie), aby dostosować harmonogram bez telefonu do rejestracji.

**Kryteria akceptacji:**
- W szczegółach wydarzenia przycisk "Zaproponuj inny termin".
- Walidacja: min. 24h przed oryginalnym terminem, max 3 próby (parametry konfigurowalne).
- Pole "Powód" (opcjonalne).
- Personel otrzymuje powiadomienie, akceptuje lub odrzuca z komentarzem.
- Pacjent otrzymuje push po decyzji personelu.
- Historia wszystkich propozycji (również odrzuconych) zapisana w szczegółach wydarzenia.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** czy pacjent wybiera swobodnie (z walidacją), czy system pokazuje sloty dostępności personelu? Rekomendacja dla MVP: swobodny wybór z walidacją (prostsze); sloty w fazie 2.
- Współpracuje z US-NH-18 (akceptacja/odrzucenie po stronie koordynatora).

---

### US-NH-06 — Etapy terapii z automatycznym odblokowywaniem

**Historia:** Jako koordynator, chcę definiować etapy w ramach projektu terapeutycznego z trybem odblokowywania (ręcznie lub automatycznie po zaliczeniu quizu) oraz zmieniać ich kolejność metodą drag & drop, aby strukturyzować ścieżkę terapeutyczną.

**Kryteria akceptacji:**
- Każdy projekt ma listę uporządkowanych etapów.
- Dla każdego etapu: nazwa, opis, tryb odblokowywania (`MANUAL` / `AUTO_QUIZ`), powiązany quiz (jeśli `AUTO_QUIZ`).
- Drag & drop do zmiany kolejności.
- Pacjent widzi tylko materiały z ukończonych lub aktualnego etapu; etapy zablokowane oznaczone graficznie.
- Historia przejść pacjenta między etapami zapisana.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** wymaganie `ww.31` (materiały) wspomina o "konkretnych etapach terapii" — pośrednie uzasadnienie.

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** czy etapy jako formalna encja są potrzebne w MVP, czy wystarczy proste oznaczenie etapu na materiale?
- Zależność: współpracuje z US-NH-03 (quizy) oraz US-NH-07 (przenoszenie pacjenta między etapami).

---

### US-NH-07 — Przenoszenie pacjenta między etapami terapii

**Historia:** Jako lekarz/terapeuta, chcę przenieść pacjenta na inny etap terapii (ręcznie lub automatycznie po zaliczeniu quizu) z uzasadnieniem, aby odzwierciedlać rzeczywisty postęp rehabilitacji.

**Kryteria akceptacji:**
- Dla etapu `MANUAL` — przenoszenie ręczne z wyborem etapu i podaniem przyczyny.
- Dla etapu `AUTO_QUIZ` — automatyczne przejście po zaliczeniu quizu; ręczne nadpisanie możliwe (oznaczone jako "manual override" w historii).
- Historia przejść zapisana (kto, kiedy, powód, trigger).

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie, powiązane z US-NH-06)

**Uwagi:** Zależność od US-NH-06.

---

## 💬 Sekcja 3 — Poszerzenia w komunikacji

### US-NH-08 — Priorytet wiadomości pacjenta (INFO / PYTANIE / PILNE)

**Historia:** Jako pacjent, chcę ustawić priorytet wysyłanej wiadomości (Informacja / Pytanie / Pilne), aby zespół medyczny wiedział, jakie sprawy wymagają szybszej reakcji.

**Kryteria akceptacji:**
- Przed wysłaniem wiadomości pacjent wybiera jeden z trzech priorytetów (domyślnie "Informacja").
- Koordynator widzi priorytet w inboxie z wizualnym wyróżnieniem (kolor, ikona).
- Sortowanie w inboxie koordynatora: Pilne → Pytanie → Informacja.
- Widoczne informacje dla pacjenta: "Wiadomości 'Pilne' są priorytetowo obsługiwane przez koordynatora".

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** czy priorytet wymaga dodatkowych mechanizmów (SMS alert do koordynatora przy "Pilne") czy wystarczy sortowanie w inboxie?
- **Kwestia kliniczno-prawna:** przy wiadomościach "Pilne" warto pokazać pacjentowi przypomnienie "Jeśli to nagły przypadek, zadzwoń 112 lub na infolinię placówki" (odpowiedzialność prawna placówki).

---

### US-NH-09 — Notatki wewnętrzne personelu w konwersacji

**Historia:** Jako koordynator, chcę dodawać notatki wewnętrzne w wątku konwersacji z pacjentem, widoczne tylko dla personelu, aby przekazywać kontekst medyczny przy delegacji wątku lub konsultacjach między członkami zespołu.

**Kryteria akceptacji:**
- W wątku konwersacji personel może dodać notatkę wewnętrzną.
- Pacjent **w żadnych okolicznościach** nie widzi notatek wewnętrznych (filtrowanie na poziomie API).
- Notatki mogą być dodawane automatycznie przy delegowaniu wątku do innego członka zespołu.
- Notatki wewnętrzne nie są eksportowane do standardowego PDF dokumentacji konwersacji; osobny eksport (z wyraźnym oznaczeniem celu) dostępny wyłącznie dla personelu.
- Soft-delete notatek z zachowaniem historii audytu.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** czy notatki wewnętrzne są pożądane w MVP?
- Wrażliwość RODO: ujawnienie przez eksport musi być ściśle kontrolowane — osobny endpoint, wyraźne audytowanie.

---

## 📱 Sekcja 4 — Poszerzenia UX aplikacji mobilnej

### US-NH-10 — Tryb uproszczony UI dla seniorów i pacjentów z niską biegłością cyfrową

**Historia:** Jako starszy pacjent lub osoba z ograniczoną biegłością cyfrową, chcę korzystać z trybu uproszczonego UI (większe elementy, mniej ekranów, wyraźne potwierdzenia, proste ekranu główne z 3 kafelkami), aby obsługiwać aplikację bez frustracji.

**Kryteria akceptacji:**
- Tryb włączany przez personel przy tworzeniu konta (checkbox w portalu) lub samodzielnie przez pacjenta w ustawieniach.
- Ustawienie synchronizowane między urządzeniami pacjenta (zapis po stronie backendu).
- W trybie uproszczonym: większe touch targets, tekst skalowany do 125%, 3 duże kafle na ekranie głównym, wyraźne modalne potwierdzenia przed każdą akcją modyfikującą.
- Uproszczony język komunikatów (np. "Wykonaj" zamiast "Oznacz jako wykonane").

**Priorytet:** Should Have (silnie uzasadniony klinicznie profilem pacjentów IFPS)  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** jaki jest profil wiekowy pacjentów IFPS (R-CLN-01)? Jeśli znaczący odsetek to osoby starsze — tryb uproszczony jest praktycznie niezbędny.

---

### US-NH-11 — Biometria jako alternatywa dla hasła

**Historia:** Jako pacjent, chcę używać Face ID / odcisku palca zamiast hasła przy logowaniu do aplikacji mobilnej, aby szybciej i wygodniej z niej korzystać.

**Kryteria akceptacji:**
- Aktywacja opcjonalna po pierwszym zalogowaniu hasłem.
- Klucze autoryzacyjne przechowywane w bezpiecznym natywnym storage (Keychain / Keystore).
- Fallback na hasło przy niepowodzeniu biometrii.
- Wymóg ponownej weryfikacji biometrii po powrocie aplikacji z tła po określonym czasie (konfigurowalne).

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne, wzmocnienie `funk.04`)

**Uwagi:** Standard w aplikacjach zdrowotnych, dobry dla pacjentów starszych (krótsze hasła + biometria szybciej).

---

### US-NH-12 — Filtrowanie materiałów per etap terapii w aplikacji mobilnej

**Historia:** Jako pacjent, chcę widzieć materiały filtrowane wg etapu terapii, na którym aktualnie jestem, aby nie być przytłoczonym treściami jeszcze dla mnie niedostępnymi.

**Kryteria akceptacji:**
- Lista materiałów filtrowana wg etapu pacjenta w projekcie.
- Materiały z przyszłych etapów wyświetlane jako "zablokowane" (z informacją "Ukończ poprzedni etap, aby odblokować").

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK bezpośredniego wymagania (rozszerzenie w oparciu o `funk.25` z uwzględnieniem US-NH-06).

---

## 🧑‍💼 Sekcja 5 — Poszerzenia workflow personelu

### US-NH-13 — Centralny inbox koordynatora z delegowaniem

**Historia:** Jako koordynator, chcę mieć centralny inbox wiadomości od pacjentów z wszystkich projektów, z filtrowaniem (priorytet, status, projekt, przypisanie) i możliwością delegowania wątków, aby efektywnie zarządzać komunikacją.

**Kryteria akceptacji:**
- Inbox agreguje wiadomości ze wszystkich projektów koordynatora.
- Filtry: priorytet (jeśli dostępny — patrz US-NH-08), status, projekt, przypisanie.
- Możliwość delegowania wątku do konkretnego członka zespołu (z opcjonalną notatką wewnętrzną — patrz US-NH-09).
- Status wątku: Nowy / W toku / Rozwiązany / Zamknięty.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** kierunkowo zgodne z `ww.34`, `ww.35`, `ww.36` — specyfikacja wymaga przypisywania i oznaczania, ale nie definiuje szczegółowego UX inboxa.

**Uwagi:** Dobry kandydat do MVP ze względu na ogólne wymogi specyfikacji — wymaga akceptacji szczegółowego projektu UX.

---

### US-NH-14 — Dashboard koordynatora z widżetami i konfigurowalnym układem

**Historia:** Jako koordynator, chcę mieć konfigurowalny pulpit z widżetami (inbox, pacjenci wymagający interwencji, prośby o zmianę terminu, nadchodzące wydarzenia, KPI programów), aby codziennie rozpoczynać pracę od pełnego obrazu sytuacji.

**Kryteria akceptacji:**
- Domyślny zestaw widżetów dostosowany do roli.
- Możliwość ukrycia/pokazania/przesunięcia widżetów (ustawienia zapisywane per użytkownik).

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** `ww.55` wymaga dashboardu z KPI — konkretny układ widżetów to poszerzenie projektowe.

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** szablony pulpitów i domyślne widżety wymagają warsztatu z przedstawicielami każdej roli.

---

### US-NH-15 — Dashboard lekarza i widok wydarzeń do oceny

**Historia:** Jako lekarz, chcę mieć dedykowany pulpit pokazujący moich pacjentów, wiadomości delegowane do mnie, moje nadchodzące wydarzenia i wydarzenia oznaczone przez pacjentów jako wykonane z notatkami wymagającymi oceny, aby skupić się wyłącznie na zadaniach klinicznych.

**Kryteria akceptacji:**
- Widżety: Moi pacjenci, Wiadomości delegowane, Nadchodzące wydarzenia prowadzone przez lekarza, Wydarzenia do oceny (wykonane z notatką), Prośby o zmianę terminu moich wydarzeń.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK bezpośredniego wymagania szczegółowego UX pulpitu lekarza.

**Uwagi:** Kierunkowo zgodne z intencją specyfikacji dotyczącą roli lekarza.

---

### US-NH-16 — Wersjonowanie materiałów edukacyjnych

**Historia:** Jako lekarz/terapeuta, chcę aby każda edycja materiału tworzyła nową wersję z zachowaniem historii, aby pacjenci widzieli materiał w wersji przypisanej im w momencie wyświetlenia, a statystyki były spójne.

**Kryteria akceptacji:**
- Każda edycja tworzy nową wersję materiału.
- Personel widzi historię wersji.
- Pacjent widzi wersję aktualnie przypisaną.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (poszerzenie analityczne)

**Uwagi:** Przydatne dla audytu i spójności raportów klinicznych.

---

### US-NH-17 — Wymuszenie resetu hasła przez administratora

**Historia:** Jako administrator, chcę wymusić reset hasła dowolnemu użytkownikowi personelu z podaniem przyczyny, aby reagować na incydenty bezpieczeństwa (kompromitacja, odejście pracownika).

**Kryteria akceptacji:**
- Operacja dostępna tylko dla roli Administrator.
- Obecne hasło użytkownika zostaje unieważnione, wszystkie aktywne sesje wylogowane.
- Użytkownik przy kolejnym logowaniu musi ustawić nowe hasło.
- Operacja wymaga wpisania uzasadnienia — logowane w audycie.
- Niedostępne dla kont pacjentów (pacjent używa standardowego "Zapomniałem hasła" — `funk.05`).

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK wprost (poszerzenie wynikające z `ww.65` i dobrych praktyk administracji IT).

---

### US-NH-18 — Wyczyszczenie konfiguracji 2FA użytkownika przez administratora

**Historia:** Jako administrator, chcę wyczyścić konfigurację 2FA użytkownika w przypadkach zgubienia urządzenia z aplikacją authenticator lub kompromitacji, aby odblokować dostęp minimalizując ryzyko.

**Kryteria akceptacji:**
- Operacja usuwa sekret 2FA i kody zapasowe; ustawia `two_factor_enabled = false`.
- Wszystkie aktywne sesje użytkownika wylogowane.
- Operacja wymaga uzasadnienia — logowane w audycie (szczególnie wrażliwy wpis).
- Dla ról wymagających 2FA (np. Administrator) — konto w statusie "wymaga rekonfiguracji 2FA" przy kolejnym logowaniu.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK wprost (poszerzenie).

---

### US-NH-19 — Akceptacja/odrzucenie propozycji zmiany terminu przez koordynatora

**Historia:** Jako koordynator, chcę widzieć listę oczekujących propozycji zmiany terminu i akceptować lub odrzucać je z komentarzem, aby sprawnie zarządzać harmonogramem.

**Kryteria akceptacji:**
- Dedykowany widok oczekujących propozycji na pulpicie i w szczegółach wydarzeń.
- Akcje: Akceptuj (z opcjonalnym komentarzem) / Odrzuć (z komentarzem).
- Pacjent otrzymuje powiadomienie po decyzji.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK w specyfikacji (powiązane z US-NH-05).

---

### US-NH-20 — Katalog odznak z konfiguratorem reguł

**Historia:** Jako administrator, chcę definiować odznaki z konfigurowalnymi regułami przyznawania (np. "10 ukończonych wydarzeń", "compliance >80% przez 30 dni", "zaliczenie quizu X"), aby dostosować gamifikację do specyfiki placówki.

**Kryteria akceptacji:**
- Typy reguł: wykonane wydarzenia (z filtrem typu), przeczytane materiały (z filtrem kategorii), compliance powyżej progu (z okresem), dni z rzędu aktywne, zaliczony quiz.
- Podgląd reguły w formie ludzkiej przed zapisem.
- Edycja reguły ma zastosowanie tylko do przyszłych zdarzeń (brak retroaktywnego przyznawania).

**Priorytet:** Could Have (zależny od decyzji o gamifikacji — US-NH-04).

**Numer specyfikacji klienta:** BRAK (powiązane z US-NH-04).

---

### US-NH-21 — Jednorazowy kod aktywacyjny do wydruku

**Historia:** Jako koordynator, chcę wygenerować jednorazowy kod aktywacyjny do wydruku dla pacjenta bez kontaktu elektronicznego, aby umożliwić mu aktywację aplikacji przy wizycie w placówce.

**Kryteria akceptacji:**
- Dostępne, gdy pacjent nie ma emaila ani telefonu.
- System generuje plik PDF z instrukcją krok po kroku i kodem aktywacyjnym ważnym 72h.

**Priorytet:** Should Have  
**Numer specyfikacji klienta:** BRAK (poszerzenie, wspiera realizację `funk.01` dla pacjentów bez kanału elektronicznego).

---

## 📅 Sekcja 6 — Funkcje odłożone poza MVP lub wymagające warunków zewnętrznych

### US-NH-22 — Powiadomienia email jako alternatywny kanał dla pacjenta

**Historia:** Jako pacjent, chcę otrzymywać powiadomienia email jako alternatywny kanał do push, aby nie przegapić istotnych komunikatów.

**Kryteria akceptacji:**
- Dostępne jako opcja w ustawieniach powiadomień pacjenta.
- Obejmuje minimum: nowe wiadomości od zespołu, zbliżające się wydarzenia.

**Priorytet:** Could Have (specyfikacja oznacza jako opcjonalne)  
**Numer specyfikacji klienta:** `funk.42`

**Uwagi:** Literalnie oznaczone w specyfikacji jako opcjonalne.

---

### US-NH-23 — Powiadomienia SMS dla krytycznych przypomnień

**Historia:** Jako pacjent, chcę otrzymywać powiadomienia SMS dla krytycznych przypomnień (np. zbliżająca się wizyta kontrolna), aby mieć niezależny od internetu kanał.

**Kryteria akceptacji:**
- Obejmuje minimum: krytyczne przypomnienia i kody weryfikacyjne.

**Priorytet:** Could Have (specyfikacja oznacza jako opcjonalne)  
**Numer specyfikacji klienta:** `funk.43`

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** wybór dostawcy bramki SMS (SMSAPI, Twilio, operator krajowy, inne) — wpływa na koszty operacyjne.
- Odłożone poza MVP do momentu decyzji o dostawcy.

---

### US-NH-24 — Synchronizacja wydarzeń kalendarzowych z HIS

**Historia:** Jako pacjent, chcę aby wydarzenia kalendarzowe z HIS (np. zaplanowane wizyty szpitalne) były synchronizowane z aplikacją, jeśli HIS udostępnia takie dane, aby mieć jeden spójny harmonogram.

**Kryteria akceptacji:**
- Funkcja warunkowa: tylko gdy integracja HIS aktywna i HIS eksponuje dane kalendarzowe.
- Synchronizacja jednokierunkowa (HIS → system).
- Pobrane wydarzenia oznaczone graficznie jako "z HIS".

**Priorytet:** Could Have (zależne od zakresu danych udostępnianych przez HIS)  
**Numer specyfikacji klienta:** `funk.48` (część dotycząca "Pobieranie wydarzeń kalendarzowe jeżeli system HIS udostępnia")

**Uwagi / Ryzyka:**
- **Do decyzji klienta:** czy docelowy HIS placówki udostępnia dane kalendarzowe? Jeśli tak — w jakim formacie? Jeśli nie — funkcję odkładamy do fazy 2 (lub całkowicie rezygnujemy).

---

## ❓ Sekcja 7 — Otwarte kwestie wymagające decyzji przed MVP

### Kwestie kliniczne

**K-1. Profil wiekowy pacjentów IFPS**  
Ilu pacjentów IFPS to osoby <18 lat, 18–65, >65? Wpływ: decyzja o trybie uproszczonym UI (US-NH-10), zakresie gamifikacji (US-NH-04), ewentualnym trybie opiekuna dla dzieci.

**K-2. Tryb opiekuna (Guardian mode) dla dzieci z implantami**  
Czy terapia u dzieci prowadzona jest przez rodzica/opiekuna? Jeśli tak — czy opiekun ma osobne konto powiązane z kontem dziecka, czy loguje się na konto dziecka? Decyzja o trybie opiekuna wpływa na model danych i procesy RODO (zgoda rodzica/opiekuna).

**K-3. Zakres pomiarów wprowadzanych przez pacjenta**  
Czy pacjent wprowadza wyniki pomiarów (audiometryczne, subiektywna ocena słyszenia, poziom zmęczenia) czy tylko oznacza wykonanie wydarzenia z opcjonalną notatką? Dla MVP rekomenduje się wariant prostszy (oznaczenie + notatka), strukturalne formularze w fazie 2.

**K-4. Dyżur koordynatora — 24/7 czy godziny pracy?**  
Jaki jest oczekiwany czas odpowiedzi koordynatora na wiadomości? Czy dyżur obejmuje pełną dobę, czy tylko godziny pracy? Wpływa na komunikat pokazywany pacjentowi przy wysyłaniu wiadomości i odpowiedzialność prawną placówki.

**K-5. Biblioteka startowa materiałów edukacyjnych**  
Czy IFPS dostarcza pre-załadowane materiały startowe (np. "Pierwsze dni z implantem", "Ćwiczenia słuchowe podstawowe")? Jeśli tak — wymagany odrębny etap wdrożenia "import treści".

**K-6. Telefon alarmowy przy wiadomościach "Pilne"**  
Czy w aplikacji przy wyborze priorytetu "Pilne" pokazujemy numer infolinii ratunkowej placówki oraz 112 (ochrona prawna placówki — priorytet wiadomości nie zastępuje zgłoszenia ratunkowego)?

**K-7. Godziny ciszy vs wiadomości "Pilne" od zespołu medycznego**  
Czy wiadomość od zespołu oznaczona jako krytyczna (np. pilna zmiana wizyty, wycofanie leku) przebija godziny ciszy pacjenta? Rekomendacja: tak (bezpieczeństwo pacjenta), ale wymaga decyzji klinicznej.

### Kwestie prawne

**K-8. Zgodność z MDR / AI Act**  
Czy system TMS wymaga klasyfikacji jako wyrób medyczny (DTx)? Czy planowane są funkcje oparte na AI (automatyczne rekomendacje, personalizacja treści)? Decyzja wpływa na projekt architektury i proces certyfikacji — musi być podjęta przed implementacją.

**K-9. Anonimizacja vs usunięcie danych (RODO Art. 17)**  
Specyfikacja (`ww.74`) wymaga "usunięcia danych pacjenta z zachowaniem danych minimalnych wymaganych prawnie". Implementacja może obejmować anonimizację (zachowanie statystyk i logów audytowych z zanonimizowanym identyfikatorem) LUB pełne usunięcie z wyjątkiem danych retencjonowanych prawnie. Konsultacja z prawnikiem compliance wymagana.

**K-10. Retencja danych po zakończeniu terapii**  
Czy pacjent po zakończeniu projektu ma dostęp tylko do odczytu (historii, materiałów) przez określony czas? Na jak długo? Rekomendacja: 12 miesięcy read-only, potem dezaktywacja z możliwością reaktywacji na żądanie; dane retencjonowane 10 lat zgodnie z prawem.

### Kwestie technologiczne

**K-11. Framework aplikacji mobilnej**  
Cross-platform (React Native, Flutter) czy dwie aplikacje natywne (Swift + Kotlin)? Rekomendacja dla tego profilu wymagań: cross-platform — szybsza implementacja MVP, jeden zespół.

**K-12. Design system portalu**  
Gotowa biblioteka UI (Material UI, Ant Design, Chakra, PrimeReact) czy custom design system? Wpływ: czas implementacji, jakość dostępności, spójność wizualna.

**K-13. Edytor WYSIWYG dla artykułów**  
Konkretny wybór (TipTap, Lexical, Quill, CKEditor, Slate) — decyzja w fazie wyboru stosu.

**K-14. Biblioteka kalendarzowa**  
Konkretny wybór (FullCalendar, react-big-calendar, custom) — z wymogiem wsparcia RRULE dla cykli.

**K-15. Biblioteka wykresów dla raportów**  
Konkretny wybór (Recharts, Chart.js, ApexCharts, ECharts, D3) — decyzja w fazie wyboru stosu.

### Kwestie operacyjne

**K-16. Progi alertów systemowych (CPU, pamięć, dysk, % błędów 5xx)**  
Wartości domyślne do zaproponowania przez zespół DevOps; akceptacja przez klienta.

**K-17. Harmonogram zadań cyklicznych**  
Częstotliwość automatycznej zmiany statusu wydarzenia na "przeterminowane", daily digest powiadomień, okno backupów. Rekomendacje: przeterminowane co godzinę, digest o 07:00 lokalnego czasu, backupy o 02:00 lokalnego czasu.

**K-18. Wersje językowe materiałów edukacyjnych**  
Czy materiały są w obu wersjach (PL + EN), czy tylko PL? Jeśli w obu — każdy materiał jako osobny byt, czy jeden byt z wersjami?

**K-19. Karta magnetyczna / RFID pacjenta**  
Czy IFPS używa fizycznych kart identyfikacyjnych pacjentów? Jeśli tak — rozważyć integrację w fazie 2 (skanowanie karty przez personel zamiast wyszukiwania).

**K-20. Integracja z systemem kolejkowym / rejestracji**  
Czy wizyty w placówce synchronizują się między TMS a systemem rejestracyjnym? W MVP rekomendowane ręczne wprowadzanie — integracja w fazie 2, o ile HIS lub osobny system rejestracyjny udostępnia odpowiednie API.

### Kwestie UX

**K-21. Szablony pulpitów — domyślne układy widżetów**  
Dla każdego z pulpitów (Administrator, Koordynator, Lekarz) wymagany warsztat z przedstawicielami ról, aby zdefiniować kolejność i priorytet widżetów.

**K-22. Komunikat przy utracie połączenia realtime**  
Dyskretna ikona w nagłówku przy chwilowych rozłączeniach vs baner przy dłuższych. Rekomendacja: mieszane — ikona <30s, baner >30s.

**K-23. Obsługa wielu kart/okien portalu przez tego samego użytkownika**  
Czy synchronizujemy stan między kartami, czy każda karta jest niezależna? Rekomendacja: niezależne z wspólnym tokenem sesji (prostsze, mniej konfliktów stanu).

**K-24. Ankiety in-app (NPS, satysfakcja)**  
Kiedy i jak pytać pacjenta o satysfakcję — raz na kwartał, po zakończeniu programu? Decyzja w fazie UX.

**K-25. Pokazywanie odpowiedzi po zakończeniu quizu**  
Czy pacjent widzi, które pytania odpowiedział źle i jakie były poprawne odpowiedzi (wartość edukacyjna)? Rekomendacja: tak.

**K-26. Sloty dostępności personelu przy propozycji zmiany terminu**  
Czy backend eksponuje dostępne sloty personelu, czy pacjent proponuje swobodnie (US-NH-05)? Rekomendacja MVP: swobodny wybór z walidacją; sloty w fazie 2.

**K-27. Zakres gamifikacji wizualnej**  
Poza odznakami (US-NH-04) — czy dodajemy "streaki" aktywności, konfetti przy odznaczeniu, progress bary? Rankingi społecznościowe odradzamy (RODO + ryzyko negatywnego porównywania).

---

## 📊 Podsumowanie

**Liczba historii w niniejszym dokumencie:** 24 (US-NH-01 – US-NH-24)  
**Liczba otwartych kwestii (K-1 – K-27):** 27

| Kategoria | Liczba |
|-----------|--------|
| Must Have (alternatywny workflow realizujący spec) | 2 |
| Should Have (wartościowe poszerzenia) | 15 |
| Could Have (nice-to-have) | 7 |

**Rekomendacje dalszych działań:**
1. **Warsztat z zespołem klienta (IFPS)** dedykowany przeglądowi poszerzeń funkcjonalnych i otwartych kwestii — z priorytetem dla K-1 (profil pacjentów), K-2 (guardian mode), K-8 (MDR/AI Act), K-9 (RODO Art. 17).
2. **Formalna akceptacja poszerzeń w formie aneksu zakresu** — pisemna zgoda klienta na włączenie/wyłączenie poszczególnych poszerzeń do MVP.
3. **Decyzje technologiczne** (K-11 do K-15) — osobna faza wyboru stosu technologicznego przed rozpoczęciem implementacji.
4. **Konsultacja prawna** — kwestie compliance (K-8, K-9, K-10) powinny zostać rozstrzygnięte z prawnikiem specjalizującym się w healthcare IT.
