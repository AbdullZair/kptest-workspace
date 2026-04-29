import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  
  // Folder na screenshoty
  outputDir: 'printscreeny',
  
  // Timeout na test
  timeout: 30 * 1000,
  
  // Timeout na oczekiwanie
  expect: {
    timeout: 5000
  },
  
  // Uruchamiaj testy równolegle
  fullyParallel: true,
  
  // Liczba workerów
  workers: 2,
  
  // Retry przy błędzie
  retries: 1,
  
  // Reporterzy
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  // Ustawienia dla wszystkich testów
  use: {
    // Base URL aplikacji
    baseURL: 'http://localhost:3000',
    
    // Zbieraj screenshoty przy błędzie
    screenshot: 'only-on-failure',
    
    // Zbieraj video przy błędzie
    video: 'retain-on-failure',
    
    // Trace dla debugowania
    trace: 'retain-on-failure',
  },
  
  // Konfiguracja przeglądarek
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Uruchom lokalny serwer jeśli potrzebny
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
