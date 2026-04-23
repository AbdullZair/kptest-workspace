

| Lp. | grupa funkcjonalna | numer | Wymagania |
| :---- | :---- | :---- | :---- |
|  | Rejestracja i logowanie pacjenta |  |  |
| 1\. | funk.01 | funk.01 | Aplikacja musi umożliwiać rejestrację pacjenta z wykorzystaniem numeru telefonu pacjenta lub danych email |
| 2\. |  | funk.02 | System musi weryfikować tożsamość pacjenta podczas rejestracji poprzez integrację z systemem HIS (np. podanie i weryfikacja numeru kartoteki pacjenta). |
| 3\. |  | funk.03 | Aplikacja musi umożliwiać logowanie za pomocą hasła. |
| 4\. |  | funk.04 | Aplikacja musi umożliwiać uwierzytelnianie dwuskładnikowe (2FA) jako opcję zabezpieczenia konta. |
| 5\. |  | funk.05 | Aplikacja musi umożliwiać odzyskiwanie dostępu do konta (reset hasła) poprzez email lub SMS. |
| 6\. |  | funk.06 | Aplikacja musi pobierać podstawowe dane demograficzne pacjenta z HIS podczas rejestracji (imię, nazwisko, PESEL, data urodzenia). |
|  |  | funk.07 | Profil pacjenta |
| 7\. |  | funk.08 | Aplikacja musi umożliwiać przeglądanie danych profilu pacjenta (dane osobowe, kontakt). |
| 8\. |  | funk.09 | Aplikacja musi pozwalać na aktualizację danych kontaktowych (email, telefon, adres). |
| 9\. |  | funk.10 | Aplikacja musi umożliwiać dodanie kontaktu awaryjnego. |
| 10\. |  | funk.11 | Aplikacja musi umożliwiać zmianę hasła dostępu. |
| 11\. |  | funk.12 | Aplikacja musi wyświetlać listę projektów terapeutycznych, do których pacjent jest przypisany. |
|  | Moje projekty terapeutyczne |  |  |
| 12\. |  | funk.13 | Aplikacja musi wyświetlać pacjentowi listę aktywnych projektów terapeutycznych, do których jest przypisany. |
| 13\. |  | funk.14 | Aplikacja musi prezentować dla każdego projektu: · Nazwę projektu · Opis celów terapii · Datę rozpoczęcia · Przewidywany czas trwania · Informacje o zespole medycznym opiekującym się pacjentem |
| 14\. |  | funk.15 | Aplikacja musi umożliwiać dostęp do historii zakończonych projektów terapeutycznych. |
| 15\. |  | funk.16 | System musi wyświetlać osobne interfejsy/widoki dla różnych projektów terapeutycznych, aby rozdzielić konteksty terapii. |
|  | Komunikacja z zespołem medycznym |  |  |
| 16\. |  | funk.17 | Aplikacja musi umożliwiać wysyłanie wiadomości tekstowych od pacjenta do zespołu medycznego |
| 17\. |  | funk.18 | System musi zapewniać osobne wątki konwersacji dla każdego projektu terapeutycznego. |
| 18\. |  | funk.19 | Aplikacja opcjonalnie powinna umożliwiać załączanie plików do wiadomości (zdjęcia, dokumenty PDF), maksymalnie 10MB na plik. |
| 19\. |  | funk.20 | Aplikacja musi wyświetlać historię korespondencji z zachowaniem chronologii. |
| 20\. |  | funk.21 | Aplikacja musi oznaczać wiadomości jako przeczytane/nieprzeczytane. |
| 21\. |  | funk.22 | Aplikacja musi wyświetlać status doręczenia wiadomości. |
| 22\. |  | funk.23 | Aplikacja musi umożliwiać wyszukiwanie w historii konwersacji. |
| 23\. |  | funk.24 | Aplikacja musi wyświetlać wiadomości otrzymane od zespołu medycznego (indywidualne i grupowe). |
|  | Materiały edukacyjne i informacyjne |  |  |
| 24\. |  | funk.25 | Aplikacja musi wyświetlać materiały edukacyjne przypisane do projektów terapeutycznych pacjenta. |
| 25\. |  | funk.26 | Aplikacja musi kategoryzować materiały według projektów terapeutycznych. |
| 26\. |  | funk.27 | Aplikacja musi wspierać różne formaty materiałów: · Artykuły tekstowe · Dokumenty PDF · Obrazy/infografiki · Video/audio · Linki do filmów instruktażowych |
| 27\. |  | funk.28 | Aplikacja musi umożliwiać pacjentowi oznaczanie materiałów jako przeczytane/do przeczytania. |
| 28\. |  | funk.29 | Aplikacja musi umożliwiać pobieranie materiałów do pamięci urządzenia (dla dostępu offline/ tryb tylko do poglądu). |
| 29\. |  | funk.30 | Aplikacja musi umożliwiać przeglądanie historii materiałów edukacyjnych. |
|  | Harmonogram terapii (terminarz) |  |  |
| 30\. |  | funk.31 | Aplikacja musi wyświetlać kalendarz z zaplanowanymi wydarzeniami terapeutycznymi dla pacjenta. |
| 31\. |  | funk.32 | Aplikacja musi wspierać następujące typy wydarzeń: · Wizyty kontrolne · Sesje terapeutyczne · Przypomnienia o przyjmowaniu leków · Wykonanie procedur/ćwiczeń · Pomiary parametrów zdrowotnych · Inne wydarzenia niestandardowe |
| 32\. |  | funk.33 | Aplikacja musi wyświetlać wydarzenia w widokach: dziennym, tygodniowym, miesięcznym. |
| 33\. |  | funk.34 | Aplikacja musi wyświetlać szczegóły wydarzenia (nazwa, opis, godzina, lokalizacja, typ). |
| 34\. |  | funk.35 | Aplikacja musi umożliwiać pacjentowi oznaczanie wydarzeń jako wykonane. |
| 35\. |  | funk.36 | Aplikacja musi umożliwiać dodawanie notatek pacjenta do wykonanych wydarzeń. |
| 36\. |  | funk.37 | System musi oznaczać wizualnie status wydarzeń: · Zaplanowane (nadchodzące) · Przeterminowane (niezrealizowane) · Wykonane |
| 37\. |  | funk.38 | Aplikacja musi umożliwiać synchronizację wydarzeń z kalendarzem systemowym urządzenia (opcjonalnie ). |
| 38\. |  | funk.39 | Aplikacja musi umożliwiać eksport wydarzeń do formatu iCal. |
|  | Powiadomienia |  |  |
| 39\. |  | funk.40 | Aplikacja musi wysyłać powiadomienia push o następujących wydarzeniach: · Nowe wiadomości od zespołu medycznego · Zbliżające się wydarzenia w terminarzu (24h, 2h, 30 min przed zgodnie ze zdefiniowanym parametrami) · Nowe materiały edukacyjne · Zmiany w harmonogramie terapii |
| 40\. |  | funk.41 | Aplikacja musi umożliwiać konfigurację preferencji powiadomień systemowych urządzenia użytkownika: · Typ wydarzenia · Godziny ciszy · Włączenie/wyłączenie powiadomień dla konkretnych kategorii |
| 41\. |  | funk.42 | Aplikacja musi wysyłać powiadomienia email jako alternatywny kanał (opcjonalnie). |
| 42\. |  | funk.43 | Aplikacja musi wysyłać powiadomienia SMS dla krytycznych przypomnień (opcjonalnie). |
|  | Postępy w terapii |  |  |
| 43\. |  | fuk.44 | Aplikacja musi wyświetlać współczynnik compliance (% wykonanych zadań) dla pacjenta. |
| 44\. |  | fuk.45 | Aplikacja musi wyświetlać statystyki dotyczące: · Zrealizowanych wydarzeń terapeutycznych · Przeczytanych materiałów edukacyjnych |
| 45\. |  | fuk.46 | Aplikacja musi umożliwiać przeglądanie historii postępów w wybranym okresie czasu. |
|  | Ograniczenia integracji z HIS |  |  |
| 46\. |  | funk.47 | Aplikacja NIE MOŻE pobierać ani wyświetlać pełnej dokumentacji medycznej z HIS. |
| 47\. |  | funk.48 | Komunikacja z HIS musi odbywać się wyłącznie w celu: · Weryfikacji tożsamości podczas rejestracji · Pobrania podstawowych danych demograficznych · Pobieranie wydarzeń kalendarzowe jeżeli system HIS udostępnia. |
|  | Wymagania niefunkcjonalne |  |  |
|  | Bezpieczeństwo |  |  |
| 48\. |  | sec.01 | Aplikacja musi spełniać wymogi RODO dotyczące przetwarzania danych osobowych i zdrowotnych. |
| 49\. |  | sec.02 | Aplikacja musi szyfrować dane w spoczynku (AES-256) oraz w tranzycie (TLS 1.3). Aplikacja musi implementować mechanizmy ochrony przed atakami OWASP Top 10\. |
| 50\. |  | sec.03 | Aplikacja musi wymagać silnego hasła (minimum 10 znaków, wielkie i małe litery, cyfry, znaki specjalne). |
| 51\. |  | sec.04 | Aplikacja musi blokować konto po 5 nieudanych próbach logowania na 15 minut. |
| 52\. |  | sec.05 | Aplikacja musi zapewniać separację danych pomiędzy różnymi projektami terapeutycznymi. |
|  | Wydajność |  |  |
| 53\. |  | wyda.01 | Czas odpowiedzi aplikacji na akcje użytkownika nie może przekraczać 2 sekund w 95% przypadków. |
| 54\. |  | wyda.02 | Aplikacja musi obsługiwać minimum 5 000 jednoczesnych użytkowników. |
| 55\. |  | wyda.03 | Wiadomości muszą być dostarczane z opóźnieniem maksymalnie 5 sekund. |
| 56\. |  | wyda.04 | Aplikacja musi uruchamiać się w czasie nie dłuższym niż 5 sekundy. |
| 57\. |  | wyda.05 | Synchronizacja danych w tle nie może znacząco wpływać na wydajność urządzenia. |
|  | Dostępność i niezawodność |  |  |
| 58\. |  | dos.01 | Aplikacja musi zapewnić dostępność na poziomie 99.5% (nie więcej niż 3.65 godziny przestoju rocznie). |
| 59\. |  | dos.02 | Aplikacja musi posiadać mechanizmy automatycznego backupu danych co 24 godziny. |
| 60\. |  | dos.03 | Aplikacja musi automatycznie wznawiać synchronizację danych po przywróceniu połączenia sieciowego. |
|  | Kompatybilność |  |  |
| 61\. |  | komp.01 | Aplikacja musi być dostępna na iOS. |
| 62\. |  | komp.02 | Aplikacja musi być dostępna na Android. |
| 63\. |  | komp.03 | Aplikacja musi być responsywna i dostosowywać się do różnych rozmiarów ekranów (telefony, tablety). |
| 64\. |  | komp.04 | Aplikacja musi być przygotowana do dystrybucji przez App Store (iOS) oraz Google Play (Android). |
|  | Skalowalność |  |  |
| 65\. |  | sk.01 | Architektura backendu musi umożliwiać skalowanie horyzontalne serwerów aplikacyjnych. |
| 66\. |  | sk.02 | System bazodanowy musi wspierać replikację i partycjonowanie danych. |
| 67\. |  | sk.03 | Aplikacja musi umożliwiać dodawanie nowych projektów terapeutycznych bez zmian w architekturze aplikacji mobilnej. |
|  | Użyteczność |  |  |
| 68\. |  | us.01 | Interfejs aplikacji musi być intuicyjny i zgodny z wytycznymi: · Material Design (Android) · Human Interface Guidelines (iOS) |
| 69\. |  | us.02 | Aplikacja musi wspierać język polski oraz angielski. |
| 70\. |  | us.03 | Aplikacja musi być dostępna dla osób z niepełnosprawnościami zgodnie z WCAG 2.1 poziom AA. |
| 71\. |  | us.04 | Rozmiar czcionki musi być konfigurowalny dla osób słabowidzących. |
| 72\. |  | us.05 | Aplikacja musi wspierać tryb wysokiego kontrastu. |
| 73\. |  | us.06 | Nawigacja w aplikacji musi być prosta i wymagać maksymalnie 3 kliknięć do dotarcia do głównych funkcji. |
|  | Wydajność mobilna |  |  |
| 74\. |  | wyd.01 | Rozmiar aplikacji nie powinien przekraczać 50MB (wersja bazowa bez pobranych materiałów). |
| 75\. |  | wyd.02 | Aplikacja musi być zoptymalizowana pod kątem zużycia baterii urządzenia. |
| 76\. |  | wyd.03 | Aplikacja nie może zużywać więcej niż 100MB RAM w trakcie typowego użytkowania. |
|  | Zakres integracji z systemem HIS |  |  |
| 77\. |  | int.01 | Aplikacja w oparciu o dane udostępnianie przez HIS umożliwia: · Weryfikację tożsamości pacjenta podczas rejestracji · Pobranie podstawowych danych demograficznych (imię, nazwisko, PESEL, data urodzenia itp.). |
| 78\. |  | int.02 | Weryfikacji tożsamości pacjenta podczas rejestracji |
| 79\. |  | int.03 | Aplikacja NIE pobiera dokumentacji medycznej z HIS. |
| 80\. |  | int.04 | Komunikacja z HIS odbywa się wyłącznie podczas procesu rejestracji. |
| 81\. |  | int.05 | Po weryfikacji tożsamości, aplikacja działa niezależnie od HIS. |
| 82\. |  | int.06 | Aplikacja musi być otwarta i umożliwić z przyszłości rozszerzenia zakresu integracji zgodnie z potrzebami Zamawiającego. |

