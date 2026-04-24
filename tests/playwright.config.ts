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
 *   npx playwright test --headed           # Run with browser UI
 *   npx playwright test --ui               # Open UI mode
 */
export default defineConfig({
  testDir: '.',

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./global-setup'),

  // Timeout for individual tests
  timeout: 30 * 1000,

  // Timeout for expect assertions
  expect: {
    timeout: 5000,
  },

  // Ignore HMR overlay errors
  use: {
    ignoreHTTPSErrors: true,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests
  workers: 1,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for API requests
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',

    // Base URL for web UI (if testing portal)
    // baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',

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
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // E2E browser tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
