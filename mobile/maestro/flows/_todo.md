# US-P-01..23 — Macierz pokrycia E2E (Maestro)

Status na 2026-04-29 — **5/23 done (22 %)**, 18 do zaimplementowania.
Każdy TODO scenariusz musi przed implementacją uzyskać stabilne `testID`
w odpowiednim ekranie (`mobile/src/features/<feature>/screens/...`).

## Podsumowanie

| Done | TODO | Razem |
|------|------|-------|
| 5    | 18   | 23    |

## Macierz US-P-01..23

| US      | Tytuł historii                              | Status | Plik / TODO szkic                                                                                                                                        |
|---------|---------------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-P-01 | Rejestracja konta pacjenta                  | DONE   | `p01-register.yaml`                                                                                                                                      |
| US-P-02 | Weryfikacja danych w HIS (status pending)   | TODO   | After register -> assert "Weryfikacja w toku" -> backend webhook HIS callback -> reopen app -> assert account active                                     |
| US-P-03 | Logowanie email + hasło                     | DONE   | `p03-login.yaml`                                                                                                                                         |
| US-P-04 | Logowanie 2FA (TOTP)                        | TODO   | Login flow -> assert TwoFa screen -> input code (env `TOTP_CODE`) -> assert Home. Mock TOTP w testach przez seed-2fa-disabled lub stub `getTotpCode()`.  |
| US-P-05 | Odzyskiwanie hasła (reset)                  | TODO   | Tap "Nie pamiętasz hasła?" -> input email -> assert "Wysłaliśmy link". Backend: weryfikacja tokenu reset.                                                |
| US-P-06 | Profil pacjenta (read)                      | TODO   | Login -> open Profile screen -> assert imie/nazwisko/email/PESEL                                                                                         |
| US-P-07 | Aktualizacja danych kontaktowych            | TODO   | Profile -> Edit -> change phone -> save -> assert toast "Zapisano"                                                                                       |
| US-P-08 | Kontakt awaryjny                            | TODO   | Settings -> EmergencyContact -> dodaj imię + telefon + relację -> save -> assert lista                                                                   |
| US-P-09 | Zmiana hasła                                | TODO   | Settings -> ChangePassword -> old + new + confirm -> assert success + force re-login                                                                     |
| US-P-10 | Lista projektów terapeutycznych             | DONE   | `p10-projects.yaml`                                                                                                                                      |
| US-P-11 | Historia projektów (zakończone)             | TODO   | Projects -> filter "Zakończone" -> assert lista projektów ze statusem `COMPLETED`                                                                        |
| US-P-12 | Wysyłanie wiadomości do terapeuty           | TODO   | Messages -> NewMessage -> wybór adresata + treść -> Send -> assert thread w Inbox                                                                        |
| US-P-13 | Odbiór wiadomości (inbox)                   | TODO   | Messages -> open thread -> assert ostatnia wiadomość widoczna -> mark as read                                                                            |
| US-P-14 | Historia korespondencji (archiwum)          | TODO   | Messages -> filter "Archiwum" -> assert wątki zarchiwizowane                                                                                             |
| US-P-15 | Przeglądanie materiałów                     | DONE   | `p15-materials.yaml`                                                                                                                                     |
| US-P-16 | Status materiału (zaczęty/ukończony)        | TODO   | Material detail -> tap "Oznacz ukończone" -> assert status badge "Ukończony"                                                                             |
| US-P-17 | Pobieranie materiału offline                | TODO   | Material detail -> tap "Pobierz offline" -> set device offline -> reopen -> assert plik dostępny w viewerze                                              |
| US-P-18 | Kalendarz wydarzeń                          | DONE   | `p18-calendar.yaml`                                                                                                                                      |
| US-P-19 | Szczegóły wydarzenia + propozycja zmiany    | TODO   | Calendar -> tap event -> tap "Zaproponuj zmianę" -> wybór nowej daty -> reason -> Send -> assert "Propozycja wysłana"                                    |
| US-P-20 | Sync z iCal / Google Calendar               | TODO   | Settings -> Calendar sync -> tap "Połącz" -> handle deep link -> assert "Połączono". Wymaga mock OAuth w devie.                                          |
| US-P-21 | Powiadomienia push (odbiór)                 | TODO   | Login -> trigger backend `POST /push/test` -> assert local notification visible (Maestro `assertVisible` na heads-up). Wymaga `expo-notifications` mock. |
| US-P-22 | Konfiguracja powiadomień (kategorie)        | TODO   | Settings -> NotificationPreferences -> toggle "Wydarzenia" off -> save -> assert toggle stan persisted po restart                                        |
| US-P-23 | Compliance (statystyki + accept/decline)    | TODO   | Settings -> ComplianceStats -> assert progress + listę zadań -> tap "Akceptuj" na zadaniu -> assert badge zaktualizowany                                 |

## Konwencja dodawania kolejnych

1. Dodać `testID` w ekranie (`mobile/src/features/<feature>/screens/...`)
   spójnie z `mobile/CLAUDE.md` (sekcja "Testy" — naming kebab-case).
2. Skopiować szablon (np. `p10-projects.yaml`) do nowego pliku
   `pNN-<slug>.yaml`.
3. Użyć `runFlow: file: p03-login.yaml` jako prelude (chyba że scenariusz
   testuje sam auth).
4. Zaktualizować tę tabelę (DONE) + macierz w `mobile/maestro/README.md`.
5. Uruchomić lokalnie:
   ```bash
   maestro test maestro/flows/pNN-<slug>.yaml
   ```
6. Dołożyć do CI po stabilizacji (target: GitHub Actions
   `mobile-e2e-android` z `reactivecircus/android-emulator-runner`).

## Backlog ulepszeń platformy testowej

- [ ] Dodać `testID` do `LoginScreen`, `RegisterScreen`, `ProjectsScreen`,
      `MaterialsScreen`, `CalendarScreen` (issue: M-TEST-001).
- [ ] Seed danych przed E2E — `backend/sql/seed-e2e.sql`
      (pacjent demo, projekt aktywny, materiał, wydarzenie kalendarza).
- [ ] CI: matrix Android (API 33) + iOS (Xcode 15) w GitHub Actions.
- [ ] Reporter: `--format junit` + upload do Allure (zgodnie z
      `tests/test-results.xml` setup w Playwright).
