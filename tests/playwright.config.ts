import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for KPTEST integration tests.
 * 
 * Usage:
 *   npx playwright test                    # Run all tests
 *   npx playwright test auth               # Run auth tests only
 *   npx playwright test --headed           # Run with browser UI
 *   npx playwright test --ui               # Open UI mode
 */
export default defineConfig({
  testDir: './tests',
  
  // Timeout for individual tests
  timeout: 30 * 1000,
  
  // Timeout for expect assertions
  expect: {
    timeout: 5000,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests
  workers: process.env.CI ? 1 : undefined,
  
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
  
  // API test configuration
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    
    // E2E browser tests (if testing mobile app via web or portal)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
    },
    
    // Mobile viewport for responsive testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*\.spec\.ts/,
    },
  ],
  
  // Web server configuration (optional - if you need to start backend for tests)
  // webServer: {
  //   command: 'cd ../backend && ./gradlew bootRun',
  //   url: 'http://localhost:8080/api/v1/auth/login',
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
