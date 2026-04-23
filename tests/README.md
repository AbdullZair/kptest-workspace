# KPTEST Integration Tests

Kompleksowe testy integracyjne dla systemu KPTEST (System Zarządzania Terapią Pacjentów po Implantacji Ślimakowej).

## 📋 Zawartość

```
tests/
├── playwright.config.ts          # Konfiguracja Playwright
├── package.json                   # Dependencje i skrypty
├── tsconfig.json                  # Konfiguracja TypeScript
├── test-data.ts                   # Dane testowe (pacjenci, endpointy)
├── auth/
│   ├── register.spec.ts           # Testy rejestracji pacjenta
│   └── login.spec.ts              # Testy logowania i 2FA
└── api/
    └── auth.api.spec.ts           # Testy REST API (tokeny, profil)
```

## 🚀 Uruchomienie

### Wymagania wstępne

- **Node.js** >= 18.0.0
- **Backend KPTEST** uruchomiony na `http://localhost:8080`
- **HIS Mock** (opcjonalnie) dla testów weryfikacji pacjenta

### 1. Instalacja zależności

```bash
cd tests
npm install
```

### 2. Instalacja przeglądarki Playwright

```bash
npx playwright install chromium
```

Lub wszystkie przeglądarki:

```bash
npx playwright install
```

### 3. Uruchomienie backendu

Upewnij się, że backend jest uruchomiony:

```bash
# Z poziomu głównego katalogu projektu
cd ..
docker-compose up backend postgres redis his-mock
```

Lub z env:

```bash
cd backend
./gradlew bootRun
```

### 4. Uruchomienie testów

**Wszystkie testy:**
```bash
npm test
```

**Testy auth (rejestracja + logowanie):**
```bash
npm run test:auth
```

**Testy API (tokeny, refresh, profil):**
```bash
npm run test:api
```

**Tryb z przeglądarką (headed):**
```bash
npm run test:headed
```

**Tryb debugowania:**
```bash
npm run test:debug
```

**Tryb UI:**
```bash
npm run test:ui
```

## 📊 Raporty

Po uruchomieniu testów wygenerowany zostanie raport HTML:

```bash
npm run test:report
```

Raport otworzy się w domyślnej przeglądarce pod `http://localhost:9323`.

## 🧪 Scenariusze testowe

### Test 1: Rejestracja Pacjenta (`auth/register.spec.ts`)

| Scenariusz | Opis | Status |
|------------|------|--------|
| Walidacja email | Odrzucenie nieprawidłowego formatu email | ✅ |
| Walidacja phone | Odrzucenie nieprawidłowego formatu telefonu | ✅ |
| Walidacja PESEL | Odrzucenie nieprawidłowego PESEL | ✅ |
| Walidacja hasła | Wymagania: 10+ znaków, wielkie/małe litery, cyfry, znaki specjalne | ✅ |
| Rejestracja z email | Pomyślna rejestracja z identyfikatorem email | ✅ |
| Rejestracja z phone | Pomyślna rejestracja z identyfikatorem telefonu | ✅ |
| Duplicate email | Odrzucenie duplikatu email | ✅ |
| Duplicate PESEL | Odrzucenie duplikatu PESEL | ✅ |
| Status konta | Weryfikacja statusu PENDING_VERIFICATION | ✅ |
| Response structure | Weryfikacja struktury odpowiedzi API (201 Created) | ✅ |

### Test 2: Logowanie (`auth/login.spec.ts`)

| Scenariusz | Opis | Status |
|------------|------|--------|
| Logowanie | Pomyślne logowanie z email/hasło | ✅ |
| JWT structure | Weryfikacja struktury JWT (header, payload, signature) | ✅ |
| Token expiration | Weryfikacja czasu wygaśnięcia tokena | ✅ |
| Invalid credentials | Odrzucenie nieprawidłowych danych | ✅ |
| Account lockout | Blokada po 5 nieudanych próbach (⚠️ skipped) | ⏸️ |
| 2FA flow | Logowanie z kodem TOTP (⚠️ skipped) | ⏸️ |
| Protected endpoint | Dostęp z Bearer token | ✅ |
| No token | Odrzucenie bez tokena (401) | ✅ |
| Invalid token | Odrzucenie z nieprawidłowym tokenem (401) | ✅ |

### Test 3: Authenticated Request (`api/auth.api.spec.ts`)

| Scenariusz | Opis | Status |
|------------|------|--------|
| Get profile | Pobranie profilu z Bearer token | ✅ |
| Profile data | Weryfikacja danych profilu | ✅ |
| Refresh token | Odświeżenie tokena dostępu | ✅ |
| Token rotation | Nowy refresh token po odświeżeniu | ✅ |
| Invalid refresh | Odrzucenie nieprawidłowego refresh tokena | ✅ |
| Expired token | Odrzucenie wygasłego tokena (⚠️ skipped) | ⏸️ |
| Token claims | Weryfikacja claims w JWT | ✅ |

## 🔧 Konfiguracja

### Zmienne środowiskowe

```bash
# Adres API backendu
export API_BASE_URL=http://localhost:8080/api/v1

# Tryb CI (retry, workers)
export CI=true
```

### playwright.config.ts

```typescript
export default defineConfig({
  timeout: 30 * 1000,           // Timeout testu
  expect: { timeout: 5000 },    // Timeout asercji
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: ['html', 'list', 'json'],
});
```

## 📦 Dane testowe

W pliku `test-data.ts` zdefiniowano gotowe dane testowe:

```typescript
import { testPatients } from './test-data';

// Standardowy pacjent do testów
testPatients.STANDARD = {
  pesel: '90010101234',
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@test.pl',
  phone: '+48123456789',
  password: 'Test123!@#Secure',
};

// Pacjent z włączonym 2FA
testPatients.WITH_2FA = { ... };
```

## 🔐 Testowanie 2FA

Testy 2FA są domyślnie wyłączone (`test.skip()`). Aby je uruchomić:

1. Skonfiguruj użytkownika z włączonym 2FA w systemie
2. Zaktualizuj `testPatients.WITH_2FA` o poprawne dane
3. Usuń `.skip()` z odpowiednich testów
4. Zaimplementuj generator TOTP lub użyj statycznych kodów testowych

```bash
# Generator TOTP w Node.js
npm install otpauth
```

```typescript
import * as OTPAuth from 'otpauth';

const totp = new OTPAuth.TOTP({
  secret: 'USER_SECRET_KEY',
  digits: 6,
  period: 30,
});
const code = totp.generate();
```

## 🐛 Rozwiązywanie problemów

### Testy nie widzą backendu

```bash
# Sprawdź czy backend działa
curl http://localhost:8080/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test","password":"test"}'

# Sprawdź zmienne środowiskowe
echo $API_BASE_URL
```

### Błędy walidacji

Upewnij się, że dane testowe spełniają wymagania:
- **Hasło**: min. 10 znaków, wielkie litery, małe litery, cyfry, znak specjalny
- **PESEL**: dokładnie 11 cyfr
- **Email**: poprawny format
- **Telefon**: format międzynarodowy `+48...`

### Timeout testów

Jeśli testy przekraczają timeout:
```bash
# Zwiększ timeout w playwright.config.ts
timeout: 60 * 1000,
```

## 📈 Coverage

Raport coverage z backendu:

```bash
cd backend
./gradlew jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

## 🚀 CI/CD

### GitHub Actions

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: kptest
          POSTGRES_USER: kptest
          POSTGRES_PASSWORD: kptest_password
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd tests
          npm ci
          npx playwright install chromium
      
      - name: Run tests
        run: |
          cd tests
          npm test
        env:
          API_BASE_URL: http://localhost:8080/api/v1
      
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/playwright-report/
```

## 📝 Konwencje

### Nazewnictwo testów

```typescript
test.describe('Feature', () => {
  test.describe('Sub-feature', () => {
    test('should do something', async ({ request }) => {
      // ...
    });
    
    test('should reject invalid input', async ({ request }) => {
      // ...
    });
  });
});
```

### Asertcje

```typescript
// Status HTTP
expect(response.status()).toBe(httpStatus.OK);

// Struktura odpowiedzi
expect(body).toHaveProperty('access_token');

// Wartość
expect(body.token_type).toBe('Bearer');

// Tablica
expect(body.errors).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ field: 'email' })
  ])
);
```

## 🔗 Przydatne linki

- [Playwright Docs](https://playwright.dev)
- [API Testing](https://playwright.dev/docs/api-testing)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Test Parameterization](https://playwright.dev/docs/test-parameterize)

---

**Autor:** KPTEST QA Team  
**Wersja:** 1.0.0  
**Ostatnia aktualizacja:** 2026-04-23
