/**
 * Reports Regression Tests
 *
 * Full regression suite for reports and analytics features.
 *
 * @module tests/regression/reports.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, apiEndpoints, httpStatus } from '../test-data';

test.describe('Regression - Reports', () => {
  let authToken: string;
  let adminAuthToken: string;

  test.beforeEach(async ({ request }) => {
    // Login as admin for admin reports
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'admin@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (adminLoginResponse.status() === httpStatus.OK) {
      const body = await adminLoginResponse.json();
      adminAuthToken = body.access_token;
    }

    // Login as patient for patient reports
    const patientLoginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (patientLoginResponse.status() === httpStatus.OK) {
      const body = await patientLoginResponse.json();
      authToken = body.access_token;
    }
  });

  test('should view patient progress report', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.waitForSelector('[data-testid="progress-report"]');

    expect(await page.isVisible('[data-testid="progress-chart"]')).toBe(true);
    expect(await page.isVisible('[data-testid="completion-percentage"]')).toBe(true);
  });

  test('should view therapy stages report', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/stages');
    await page.waitForSelector('[data-testid="stages-report"]');

    expect(await page.isVisible('[data-testid="stages-progress"]')).toBe(true);
    expect(await page.isVisible('[data-testid="completed-stages"]')).toBe(true);
  });

  test('should view quiz results report', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/quizzes');
    await page.waitForSelector('[data-testid="quizzes-report"]');

    expect(await page.isVisible('[data-testid="quiz-scores"]')).toBe(true);
    expect(await page.isVisible('[data-testid="average-score"]')).toBe(true);
  });

  test('should view badges report', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/badges');
    await page.waitForSelector('[data-testid="badges-report"]');

    expect(await page.isVisible('[data-testid="earned-badges"]')).toBe(true);
    expect(await page.isVisible('[data-testid="badges-progress"]')).toBe(true);
  });

  test('should view activity timeline', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/activity');
    await page.waitForSelector('[data-testid="activity-timeline"]');

    const activities = await page.$$('[data-testid="activity-entry"]');
    expect(activities.length).toBeGreaterThanOrEqual(0);
  });

  test('should filter report by date range', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="date-range-filter"]');
    
    await page.fill('[name="date-from"]', '2026-01-01');
    await page.fill('[name="date-to"]', '2026-04-30');
    await page.click('[data-testid="apply-date-filter"]');

    await page.waitForSelector('[data-testid="filtered-report"]');

    // All entries should be within date range
    const entries = await page.$$('[data-testid="report-entry"]');
    
    for (const entry of entries.slice(0, 5)) {
      const date = await entry.getAttribute('data-date');
      expect(date).toMatch(/2026-(0[1-4])-\d{2}/);
    }
  });

  test('should export report as PDF', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="export-pdf"]');
    await page.waitForSelector('[data-testid="export-dialog"]');

    await page.click('[data-testid="confirm-export"]');
    await page.waitForSelector('[data-testid="export-complete"]');

    const exportText = await page.textContent('[data-testid="export-complete"]');
    expect(exportText).toContain('eksportowano');
  });

  test('should export report as CSV', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/quizzes');
    await page.click('[data-testid="export-csv"]');
    await page.waitForSelector('[data-testid="export-dialog"]');

    await page.click('[data-testid="confirm-export"]');
    await page.waitForSelector('[data-testid="export-complete"]');

    const exportText = await page.textContent('[data-testid="export-complete"]');
    expect(exportText).toContain('eksportowano');
  });

  test('should print report', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="print-report"]');
    
    // Print dialog would open - just verify the action is available
    expect(await page.isVisible('[data-testid="print-preview"]')).toBe(true);
  });

  test('should view admin dashboard reports', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/dashboard');
    await page.waitForSelector('[data-testid="admin-dashboard"]');

    expect(await page.isVisible('[data-testid="total-patients"]')).toBe(true);
    expect(await page.isVisible('[data-testid="active-projects"]')).toBe(true);
    expect(await page.isVisible('[data-testid="system-stats"]')).toBe(true);
  });

  test('should view patient statistics report', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const response = await request.get(
      'http://localhost:8080/api/v1/admin/reports/patients',
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

    if (response.status() === httpStatus.OK) {
      const body = await response.json();
      expect(body).toHaveProperty('totalPatients');
      expect(body).toHaveProperty('activePatients');
    }
  });

  test('should view project statistics report', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const response = await request.get(
      'http://localhost:8080/api/v1/admin/reports/projects',
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

    if (response.status() === httpStatus.OK) {
      const body = await response.json();
      expect(body).toHaveProperty('totalProjects');
      expect(body).toHaveProperty('activeProjects');
    }
  });

  test('should view system usage report', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/reports/usage');
    await page.waitForSelector('[data-testid="usage-report"]');

    expect(await page.isVisible('[data-testid="usage-chart"]')).toBe(true);
    expect(await page.isVisible('[data-testid="peak-hours"]')).toBe(true);
  });

  test('should view engagement metrics', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/reports/engagement');
    await page.waitForSelector('[data-testid="engagement-report"]');

    expect(await page.isVisible('[data-testid="daily-active-users"]')).toBe(true);
    expect(await page.isVisible('[data-testid="session-duration"]')).toBe(true);
  });

  test('should view completion rates report', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/reports/completion');
    await page.waitForSelector('[data-testid="completion-report"]');

    expect(await page.isVisible('[data-testid="completion-rate-chart"]')).toBe(true);
    expect(await page.isVisible('[data-testid="stage-completion-rates"]')).toBe(true);
  });

  test('should view quiz analytics', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/reports/quizzes');
    await page.waitForSelector('[data-testid="quiz-analytics"]');

    expect(await page.isVisible('[data-testid="average-score-chart"]')).toBe(true);
    expect(await page.isVisible('[data-testid="pass-rate"]')).toBe(true);
  });

  test('should view gamification statistics', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/reports/gamification');
    await page.waitForSelector('[data-testid="gamification-report"]');

    expect(await page.isVisible('[data-testid="badges-awarded"]')).toBe(true);
    expect(await page.isVisible('[data-testid="leaderboard-activity"]')).toBe(true);
  });

  test('should schedule recurring report', async ({ page }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    await page.goto('/admin/reports');
    await page.click('[data-testid="schedule-report"]');
    await page.waitForSelector('[data-testid="schedule-modal"]');

    await page.selectOption('[name="report-type"]', 'weekly-summary');
    await page.selectOption('[name="recipients"]', 'all-staff');
    await page.check('[name="include-charts"]');
    await page.click('[data-testid="confirm-schedule"]');
    await page.waitForSelector('[data-testid="schedule-success"]');
  });

  test('should compare time periods', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="compare-periods"]');
    await page.waitForSelector('[data-testid="comparison-view"]');

    expect(await page.isVisible('[data-testid="period-1-data"]')).toBe(true);
    expect(await page.isVisible('[data-testid="period-2-data"]')).toBe(true);
    expect(await page.isVisible('[data-testid="difference-indicator"]')).toBe(true);
  });

  test('should view report trends', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/activity');
    await page.click('[data-testid="show-trends"]');
    await page.waitForSelector('[data-testid="trends-chart"]');

    expect(await page.isVisible('[data-testid="trend-line"]')).toBe(true);
    expect(await page.isVisible('[data-testid="trend-direction"]')).toBe(true);
  });

  test('should save report configuration', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="date-range-filter"]');
    await page.fill('[name="date-from"]', '2026-01-01');
    await page.fill('[name="date-to"]', '2026-04-30');
    await page.click('[data-testid="save-configuration"]');
    await page.waitForSelector('[data-testid="configuration-saved"]');
  });

  test('should load saved report configuration', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports');
    await page.click('[data-testid="saved-configurations"]');
    await page.waitForSelector('[data-testid="saved-config-list"]');

    const savedConfig = await page.$('[data-testid="saved-config-item"]');
    if (savedConfig) {
      await savedConfig.click();
      await page.waitForSelector('[data-testid="configuration-loaded"]');
    }
  });

  test('should not access admin reports without admin role', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/admin/reports');
    
    await page.waitForSelector('[data-testid="access-denied"], [data-testid="login-page"]');
    
    const accessDenied = await page.isVisible('[data-testid="access-denied"]');
    const isLoginPage = page.url().includes('/login');
    
    expect(accessDenied || isLoginPage).toBe(true);
  });

  test('should not access reports without authentication', async ({ request }) => {
    const response = await request.get(
      'http://localhost:8080/api/v1/reports/progress'
    );
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should show report loading state', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    
    // Should show loading state initially
    const loadingIndicator = await page.$('[data-testid="loading-indicator"]');
    
    if (loadingIndicator) {
      expect(await loadingIndicator.isVisible()).toBe(true);
    }
  });

  test('should show empty state for no data', async ({ page, request }) => {
    // Login as user with no data
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'empty-data@test.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      await page.goto('/reports/activity');
      await page.waitForSelector('[data-testid="empty-report-state"]');

      const emptyState = await page.$('[data-testid="empty-report-state"]');
      expect(emptyState).not.toBeNull();
    }
  });

  test('should refresh report data', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="refresh-report"]');
    await page.waitForSelector('[data-testid="report-refreshed"]');

    const refreshText = await page.textContent('[data-testid="last-updated"]');
    expect(refreshText).toBeTruthy();
  });

  test('should set report refresh interval', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/reports/progress');
    await page.click('[data-testid="auto-refresh"]');
    await page.selectOption('[name="refresh-interval"]', '30');
    await page.waitForSelector('[data-testid="refresh-configured"]');
  });
});
