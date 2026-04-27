import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright configuration for KPTEST integration tests.
 *
 * Usage:
 *   npx playwright test                    # Run all tests
 *   npx playwright test auth               # Run auth tests only
 *   npx playwright test patient            # Run patient management tests
 *   npx playwright test project            # Run project management tests
 *   npx playwright test messaging          # Run messaging tests
 *   npx playwright test calendar           # Run calendar tests
 *   npx playwright test materials          # Run materials tests
 *   npx playwright test --grep "Phase 2"   # Run Phase 2 tests only
 *   npx playwright test --grep "Phase 3"   # Run Phase 3 tests only
 *   npx playwright test --grep "Regression" # Run regression tests only
 *   npx playwright test --headed           # Run with browser UI
 *   npx playwright test --ui               # Open UI mode
 */
export default defineConfig({
  testDir: '.',

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./global-setup'),

  // Timeout for individual tests
  timeout: 60 * 1000,

  // Timeout for expect assertions
  expect: {
    timeout: 10000,
  },

  // Ignore HMR overlay errors
  use: {
    ignoreHTTPSErrors: true,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only (increased for flaky tests)
  retries: process.env.CI ? 3 : 1,

  // Parallel execution configuration
  workers: process.env.CI ? 2 : 1,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list', { printSteps: true }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for API requests
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',

    // Base URL for web UI (if testing portal)
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',

    // Storage state for authenticated tests
    storageState: path.join(__dirname, '.auth/user.json'),

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Extra HTTP headers for all requests
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },

  // Test projects configuration
  projects: [
    // API tests
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Phase 2 - Biometry, Admin, Inbox
    {
      name: 'phase2',
      testMatch: /phase2\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      grepInvert: /@skip/,
    },

    // Phase 3 - Quizzes, Stages, Gamification
    {
      name: 'phase3',
      testMatch: /phase3\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      grepInvert: /@skip/,
    },

    // Regression tests
    {
      name: 'regression',
      testMatch: /regression\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      grepInvert: /@skip/,
    },

    // E2E browser tests (all other tests)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: ['phase2/**', 'phase3/**', 'regression/**'],
    },

    // Firefox browser tests
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: ['phase2/**', 'phase3/**', 'regression/**'],
    },

    // WebKit browser tests
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: ['phase2/**', 'phase3/**', 'regression/**'],
    },
  ],

  // Web server configuration for running tests with dev server
});
