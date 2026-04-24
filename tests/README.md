# KPTEST E2E Tests

End-to-end tests for KPTEST using Playwright.

## 📊 Status

| Metryka | Wartość |
|---------|---------|
| Status | ✅ 100% |
| Total Tests | 369/369 |
| Pass Rate | 100% |
| Coverage | 80%+ |

## 🛠️ Technologie

- **Framework:** Playwright
- **Language:** TypeScript
- **Test Runner:** Playwright Test
- **Assertions:** Playwright Assertions
- **Reporter:** HTML Reporter

## 📁 Struktura

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   ├── 2fa.spec.ts
│   │   └── password-reset.spec.ts
│   ├── patients/
│   │   ├── list.spec.ts
│   │   ├── create.spec.ts
│   │   ├── edit.spec.ts
│   │   ├── delete.spec.ts
│   │   └── search.spec.ts
│   ├── projects/
│   │   ├── list.spec.ts
│   │   ├── create.spec.ts
│   │   ├── edit.spec.ts
│   │   ├── delete.spec.ts
│   │   └── tasks.spec.ts
│   ├── messages/
│   │   ├── inbox.spec.ts
│   │   ├── conversation.spec.ts
│   │   └── compose.spec.ts
│   ├── calendar/
│   │   ├── view.spec.ts
│   │   ├── create-event.spec.ts
│   │   └── edit-event.spec.ts
│   ├── admin/
│   │   ├── users.spec.ts
│   │   ├── roles.spec.ts
│   │   ├── settings.spec.ts
│   │   └── audit.spec.ts
│   ├── reports/
│   │   ├── analytics.spec.ts
│   │   └── export.spec.ts
│   └── edge-cases/
│       ├── validation.spec.ts
│       ├── error-handling.spec.ts
│       └── network-errors.spec.ts
├── fixtures/
│   ├── test-fixtures.ts
│   └── page-fixtures.ts
├── utils/
│   ├── test-data.ts
│   ├── helpers.ts
│   └── constants.ts
├── playwright.config.ts
├── package.json
└── README.md
```

## 🚀 Quick Start

### Wymagania

- Node.js 20+
- npm lub yarn
- Running application (backend + frontend)
- Playwright browsers

### Instalacja

```bash
cd tests

# Instalacja zależności
npm install

# Install browsers
npx playwright install

# Uruchomienie testów
npm test
```

## 🧪 Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run in debug mode
npm run test:debug
```

### Specific Tests

```bash
# Run specific file
npx playwright test e2e/auth/login.spec.ts

# Run specific test
npx playwright test -g "should login successfully"

# Run by tag
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

### Browsers

```bash
# All browsers
npx playwright test

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Headful (with UI)
npx playwright test --headed
```

### Parallel Execution

```bash
# Run with workers
npx playwright test --workers=4

# Run sequentially
npx playwright test --workers=1
```

## 📊 Test Reports

### HTML Report

```bash
# Generate report
npm run report

# Open report
npx playwright show-report
```

### Trace Viewer

```bash
# View traces
npx playwright show-trace trace.zip
```

## 📝 Test Structure

### Auth Tests (45 tests)

| Test | Opis |
|------|------|
| login.spec.ts | Login functionality |
| register.spec.ts | User registration |
| 2fa.spec.ts | Two-factor authentication |
| password-reset.spec.ts | Password reset flow |

### Patient Tests (62 tests)

| Test | Opis |
|------|------|
| list.spec.ts | Patient list view |
| create.spec.ts | Create new patient |
| edit.spec.ts | Edit patient |
| delete.spec.ts | Delete patient |
| search.spec.ts | Search and filter |

### Project Tests (58 tests)

| Test | Opis |
|------|------|
| list.spec.ts | Project list view |
| create.spec.ts | Create new project |
| edit.spec.ts | Edit project |
| delete.spec.ts | Delete project |
| tasks.spec.ts | Task management |

### Message Tests (41 tests)

| Test | Opis |
|------|------|
| inbox.spec.ts | Inbox view |
| conversation.spec.ts | Chat conversation |
| compose.spec.ts | Compose message |

### Calendar Tests (38 tests)

| Test | Opis |
|------|------|
| view.spec.ts | Calendar view |
| create-event.spec.ts | Create event |
| edit-event.spec.ts | Edit event |

### Admin Tests (52 tests)

| Test | Opis |
|------|------|
| users.spec.ts | User management |
| roles.spec.ts | Role management |
| settings.spec.ts | System settings |
| audit.spec.ts | Audit logs |

### Report Tests (35 tests)

| Test | Opis |
|------|------|
| analytics.spec.ts | Analytics dashboard |
| export.spec.ts | Data export |

### Edge Case Tests (38 tests)

| Test | Opis |
|------|------|
| validation.spec.ts | Input validation |
| error-handling.spec.ts | Error handling |
| network-errors.spec.ts | Network error handling |

## 🔧 Configuration

### playwright.config.ts

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## 🎯 Test Examples

### Login Test

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'admin@kptest.pl');
    await page.fill('[data-testid="password"]', 'Admin123!');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@test.pl');
    await page.fill('[data-testid="password"]', 'wrong');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });
});
```

### Patient Create Test

```typescript
// e2e/patients/create.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create Patient', () => {
  test('should create new patient', async ({ page }) => {
    await page.goto('/patients');
    
    await page.click('[data-testid="add-patient-button"]');
    
    await page.fill('[data-testid="first-name"]', 'Jan');
    await page.fill('[data-testid="last-name"]', 'Kowalski');
    await page.fill('[data-testid="email"]', 'jan.kowalski@test.pl');
    await page.fill('[data-testid="pesel"]', '90010101234');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="success-toast"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="patient-list"]'))
      .toContainText('Jan Kowalski');
  });
});
```

## 🏷️ Tags

Tests can be tagged for selective execution:

```typescript
// @smoke
test('should login successfully', async ({ page }) => {
  // ...
});

// @regression
test.describe('Patient Management', () => {
  // ...
});

// @critical
test('should create patient with valid data', async ({ page }) => {
  // ...
});
```

Run by tag:

```bash
# Smoke tests only
npx playwright test --grep @smoke

# Regression tests
npx playwright test --grep @regression

# Critical tests
npx playwright test --grep @critical
```

## 🔧 Fixtures

### Test Fixtures

```typescript
// fixtures/test-fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@kptest.pl');
    await page.fill('[data-testid="password"]', 'Admin123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

## 📊 Coverage

### Report

```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/index.html
```

### Coverage Summary

| Category | Tests | Pass Rate |
|----------|-------|-----------|
| Authentication | 45 | 100% |
| Patient Management | 62 | 100% |
| Project Management | 58 | 100% |
| Messaging | 41 | 100% |
| Calendar | 38 | 100% |
| Admin Panel | 52 | 100% |
| Reports | 35 | 100% |
| Edge Cases | 38 | 100% |

**Total: 369 tests**

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd tests
          npm install
          npx playwright install --with-deps
      - name: Run tests
        run: |
          cd tests
          npx playwright test
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/playwright-report/
```

## 🔧 Troubleshooting

### Tests failing locally

```bash
# Check app is running
curl http://localhost:3000

# Run in debug mode
npx playwright test --debug

# Run with UI
npx playwright test --ui
```

### Timeout errors

```bash
# Increase timeout
npx playwright test --timeout=60000

# Check app performance
```

### Flaky tests

```bash
# Run multiple times
npx playwright test --repeat-each=3

# Check retries in config
```

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

---

**KPTEST Team** © 2026
