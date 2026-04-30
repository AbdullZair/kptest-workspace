# KPTEST — i18n audit report (US-S-17)

Data audytu: 2026-04-29
Skrypt walidacyjny: `frontend/scripts/validate-i18n.ts`
Pliki tlumaczen: `frontend/src/shared/locales/{pl,en}.json`

## Konfiguracja i18n

- Biblioteki: `i18next@26`, `react-i18next@17`, `i18next-browser-languagedetector@8`
- Konfiguracja: `frontend/src/shared/config/i18n.ts`
- Fallback language: `pl`
- Resources: `pl` + `en` (statycznie zaimportowane z lokalnych JSON-ow)
- LanguageSwitcher: `frontend/src/features/settings/ui/LanguageSwitcher.tsx`
  (osadzony tylko na stronie `/settings`, brak globalnego przelacznika
  w headerze ani sidebarze — patrz GAP nizej)

## Wyniki walidacji

```
Total keys PL: 170
Total keys EN: 170
Missing in EN: 0
Missing in PL: 0
Untranslated placeholders (key == value): 69
Result: FAIL (z powodu placeholderow)
```

### Brakujace klucze

- **Missing in EN:** 0 — kompletna parytet kluczy.
- **Missing in PL:** 0 — kompletna parytet kluczy.

Komplet 170 kluczy istnieje w obu jezykach.

### Untranslated placeholders (key == value)

Heurystyka: nazwa lisciowa klucza (po ostatniej kropce) jest rowna tlumaczeniu
(case-insensitive). Czesc z nich to *prawdziwe* dopasowanie miedzy jezykami
(np. enumy ROLES, Email, SMS, Push), wiec nie wszystkie sa bugiem.

Lacznie 69 wpisow:

#### PL (7)
- `auth.login.email = "Email"`
- `auth.register.email = "Email"`
- `settings.email = "Email"`
- `settings.push = "Push"`
- `settings.sms = "SMS"`
- `admin.users.status = "Status"`
- `roles.ADMIN = "ADMIN"`

#### EN (62)
Najwazniejsze kategorie:
- `common.*`: 17 wpisow (save/cancel/delete/confirm/export/back/close/search/filter/sort/error/success/warning/info/user/change/enable)
- `auth.login.*` + `auth.register.*`: 7 (email, password, register, phone, and)
- `dashboard.stats.*` + `dashboard.quickActions.*`: 10 (Patients, Pending, Completed, active, new, days, Schedule, Reports, Users, Settings)
- `settings.*`: 9 (general, security, notifications, language, timezone, theme, password, email, push, sms)
- `admin.users.*`: 9 (role, status, all, page, of, users, previous, next, delete)
- `roles.*`: 6 (ADMIN, COORDINATOR, DOCTOR, THERAPIST, NURSE, PATIENT)
- `accountStatus.*`: 4 (ACTIVE, BLOCKED, REJECTED, DEACTIVATED)

### Werdykt

- **Parytet kluczy: PASS** (170 vs 170, 0 brakujacych w obie strony).
- **Jakosc tlumaczen: NEEDS-WORK** — 69 wpisow gdzie wartosc ~= klucz.
  - Z tego ~30 to legitne (enumy ROLES/STATUS, terminy "Email"/"SMS"/"Push" itp.)
  - Ok. 7 podejrzanych w PL (gdzie polski jezyk powinien miec inne brzmienie,
    np. `admin.users.status` -> "Status" jest OK po polsku, podobnie "Email"
    jest miedzynarodowe; brak realnego buga — heurystyka generuje false positives)
  - W EN — wszystkie pozycje to terminy zapozyczone / common english,
    skrypt traktuje "Save = save" jako placeholder, ale to po prostu zgodnosc
    nazewnicza klucza z tekstem.

**Konkluzja:** Nie ma brakow tlumaczen. Lista "untranslated" ma duzo false
positives — nazwa klucza i wartosc EN czesto sie pokrywaja (poprawnie). Audyt
manualny rekomendowany dla PL placeholderow z listy 7 powyzej, ale wiekszosc
to legitne uzycie (international terms / akronimy / enumy).

## GAP: brak globalnego LanguageSwitchera

LanguageSwitcher istnieje tylko jako komponent w `/settings`. Na pozostalych
trasach (`/dashboard`, `/patients`, `/projects`, `/materials`, `/admin/users`)
nie ma w UI sposobu na zmiane jezyka. Do rozwazenia: dodanie switchera
w komponencie `Header` / `Sidebar`.

## Pliki utworzone w ramach audytu

- `frontend/scripts/validate-i18n.ts` — skrypt walidacyjny (TypeScript / tsx)
- `testy_all/e2e_i18n_switch.spec.ts` — spec Playwright (2 testy: switcher na settings + gap-check na 5 trasach)
- `testy_all/i18n_audit_report.md` — niniejszy raport
