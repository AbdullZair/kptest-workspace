# KPTEST Mobile E2E Tests (Maestro)

Niniejszy katalog zawiera scenariusze End-to-End dla aplikacji mobilnej KPTEST
(React Native + Expo SDK 50, target `com.kptest.mobile`). Narzędzie:
[Maestro](https://maestro.mobile.dev/) — wybrane zamiast Detox-a (patrz
`docs/architecture/adr/ADR-006.md`) ze względu na lepsze wsparcie Expo,
deklaratywny YAML i mniejszy narzut konfiguracyjny.

## Wymagania

- **Maestro CLI** (>= 1.36):
  ```bash
  curl -Ls "https://get.maestro.mobile.dev" | bash
  export PATH="$PATH:$HOME/.maestro/bin"
  maestro --version
  ```
- **Emulator Android** (Android Studio AVD, API 33+) **albo** **iOS Simulator**
  (Xcode 15+ na macOS).
- **Backend** uruchomiony lokalnie na `http://localhost:8080`
  (z emulatora Android dostępny pod `http://10.0.2.2:8080`).
- **HIS-mock**, Postgres, Redis (zgodnie z `docker-compose.yml` w repo root).

## Uruchomienie środowiska

```bash
# 1. Backend + zależności (root repo)
docker compose up -d backend his-mock postgres redis

# 2. Build & install aplikacji w emulatorze
cd mobile
npx expo run:android        # ALBO: npx expo run:ios

# 3. Aplikacja powinna być zainstalowana jako com.kptest.mobile
adb shell pm list packages | grep kptest    # weryfikacja Android
```

## Uruchomienie testów

```bash
# pojedynczy flow
maestro test maestro/flows/p01-register.yaml

# cała seria zaimplementowanych flow'ów
maestro test maestro/flows/

# z npm script (alias)
npm run test:e2e
npm run test:e2e:single
```

Maestro Studio (interaktywny inspektor UI hierarchy):

```bash
maestro studio
```

## Struktura katalogu

```
maestro/
├── config.yaml          # appId + lista flow folders
├── README.md            # ten plik
└── flows/
    ├── _todo.md         # macierz US-P-01..23 (5 done, 18 TODO)
    ├── p01-register.yaml
    ├── p03-login.yaml
    ├── p10-projects.yaml
    ├── p15-materials.yaml
    └── p18-calendar.yaml
```

## Zaimplementowane scenariusze (5/23)

| US     | Plik                       | Opis                                      |
|--------|----------------------------|-------------------------------------------|
| US-P-01 | `p01-register.yaml`        | Rejestracja nowego pacjenta (email, PESEL, hasło, RODO) |
| US-P-03 | `p03-login.yaml`           | Logowanie email + hasło, walidacja błędów |
| US-P-10 | `p10-projects.yaml`        | Lista aktywnych projektów terapeutycznych |
| US-P-15 | `p15-materials.yaml`       | Przeglądanie biblioteki materiałów        |
| US-P-18 | `p18-calendar.yaml`        | Kalendarz wydarzeń (day/week/month)       |

Pozostałe 18 historii (US-P-02, P-04..P-09, P-11..P-14, P-16, P-17, P-19..P-23)
mają placeholdery i opis kroków w `flows/_todo.md`.

## Konwencje (do uzupełnienia w aplikacji)

Do pełnej stabilności scenariuszy ekrany powinny eksponować `testID` dla
kluczowych elementów (`email-input`, `password-input`, `submit-button`,
`projects-list`, `material-card-{id}` itd.). Aktualnie scenariusze
opierają się o:

- `text:` — etykiety widoczne (PL: "Zaloguj się", "Hasło", ...),
- `id:` — `testID` tam gdzie istnieje (`AccessibleButton testID`),
- `accessibilityLabel` — Maestro mapuje na `id` na obu platformach.

Każdy nowy ekran musi dostarczać `testID` zgodnie z RT memo
`mobile/CLAUDE.md` (sekcja "Testy"). Issue tracking w `flows/_todo.md`.

## Debug / artefakty

```bash
# zapisz screen recording z lokalnym przebiegiem
maestro test --format junit --output build/maestro-junit.xml flows/

# screenshoty per krok
maestro test --debug-output build/maestro-debug flows/p01-register.yaml
```

Wynik JUnit może być publikowany w pipeline (target follow-up CI: GitHub Actions
job `mobile-e2e-android` z `reactivecircus/android-emulator-runner`).
