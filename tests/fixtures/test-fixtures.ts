import { test as base } from '@playwright/test';
import { Page } from '@playwright/test';

export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Automatyczne logowanie przed każdym testem
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="identifier"]', 'patient1@kptest.com');
    await page.fill('[name="password"]', 'TestP@ssw0rd123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await use(page);
  },
});

export { expect } from '@playwright/test';
