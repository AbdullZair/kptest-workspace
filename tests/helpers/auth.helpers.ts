import { Page } from '@playwright/test';

export async function loginAsPatient(page: Page, email: string, password: string = 'TestP@ssw0rd123') {
  await page.goto('/login');
  await page.fill('[name="identifier"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout"]');
  await page.waitForURL('**/login');
}

export async function loginAsProvider(page: Page, email: string, password: string = 'TestP@ssw0rd123') {
  await page.goto('/login');
  await page.fill('[name="identifier"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function loginAsAdmin(page: Page, email: string, password: string = 'TestP@ssw0rd123') {
  await page.goto('/login');
  await page.fill('[name="identifier"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}
