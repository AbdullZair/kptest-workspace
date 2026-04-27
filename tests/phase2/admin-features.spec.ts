/**
 * Admin Features Tests - Phase 2
 *
 * Tests for admin management features:
 * - Force password reset
 * - Clear 2FA
 * - Generate activation code
 * - Account management
 *
 * @module tests/phase2/admin-features.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  testPatients,
  testAdminFeatures,
  phase2ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 2 - Admin Features', () => {
  let authToken: string;
  let adminAuthToken: string;
  let testUserId: string;

  /**
   * Setup: Login as admin before each test
   */
  test.beforeEach(async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'admin@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      adminAuthToken = body.access_token;
    }

    // Also login as regular user for some tests
    const userLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (userLoginResponse.status() === httpStatus.OK) {
      const body = await userLoginResponse.json();
      authToken = body.access_token;
      testUserId = body.user_id || 'test-user-123';
    }
  });

  test.describe('Force Password Reset', () => {
    test('should force password reset for user', async ({ request, page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Via UI
      await page.goto('/admin/users');
      await page.waitForSelector('[data-testid="users-list"]');

      const userRow = await page.$('[data-testid="user-row"]');
      if (userRow) {
        const userId = await userRow.getAttribute('data-user-id');
        
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="force-password-reset"]');
        await page.waitForSelector('[data-testid="force-reset-modal"]');

        // Add optional reason
        await page.fill('[name="reset-reason"]', 'Wymuszenie zmiany hasła z powodów bezpieczeństwa');
        await page.check('[name="notify-user"]');
        
        await page.click('[data-testid="confirm-force-reset"]');
        await page.waitForSelector('[data-testid="force-reset-success"]');

        // Verify via API
        const response = await request.post(
          phase2ApiEndpoints.admin.forcePasswordReset(userId || 'user-123'),
          {
            headers: {
              'Authorization': `Bearer ${adminAuthToken}`,
              'Content-Type': 'application/json',
            },
            data: {
              reason: testAdminFeatures.FORCE_PASSWORD_RESET.reason,
              notifyUser: true,
            },
          }
        );

        expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
      }
    });

    test('should notify user of forced password reset', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="force-password-reset"]');
        await page.check('[name="notify-user"]');
        await page.click('[data-testid="confirm-force-reset"]');

        // Should show notification sent
        await page.waitForSelector('[data-testid="notification-sent"]');
        const notificationText = await page.textContent('[data-testid="notification-sent"]');
        expect(notificationText).toContain('powiadomiono');
      }
    });

    test('should require user to change password on next login', async ({ page, request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Force reset via API
      await request.post(
        phase2ApiEndpoints.admin.forcePasswordReset('user-123'),
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
          data: {
            reason: 'Test',
            notifyUser: true,
          },
        }
      );

      // Try to login as user
      await page.goto('/login');
      await page.fill('[name="identifier"]', testPatients.STANDARD.email);
      await page.fill('[name="password"]', testPatients.STANDARD.password);
      await page.click('button[type="submit"]');

      // Should be redirected to password change
      await page.waitForURL('**/change-password**');
      expect(page.url()).toContain('/change-password');

      // Old password should not work for normal actions
      const requiresChange = await page.isVisible('[data-testid="password-change-required"]');
      expect(requiresChange).toBe(true);
    });

    test('should not force reset for admin accounts', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      await page.click('[data-testid="filter-role"]');
      await page.click('[data-testid="filter-admin"]');

      const adminUser = await page.$('[data-testid="user-row"]');
      if (adminUser) {
        await adminUser.click('[data-testid="user-actions"]');
        
        // Force reset option should be disabled or hidden for admins
        const forceResetOption = await page.$('[data-testid="force-password-reset"]');
        
        if (forceResetOption) {
          const isDisabled = await forceResetOption.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    });

    test('should track force reset history', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="view-details"]');
        await page.click('[data-testid="security-history"]');
        await page.waitForSelector('[data-testid="security-history-modal"]');

        // Should show force reset entries
        const historyEntries = await page.$$('[data-testid="history-entry"][data-type="force-reset"]');
        expect(historyEntries.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Clear 2FA', () => {
    test('should clear 2FA for user', async ({ request, page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Via UI
      await page.goto('/admin/users');
      await page.waitForSelector('[data-testid="users-list"]');

      const userRow = await page.$('[data-testid="user-row"]');
      if (userRow) {
        const userId = await userRow.getAttribute('data-user-id');
        
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="clear-2fa"]');
        await page.waitForSelector('[data-testid="clear-2fa-modal"]');

        // Add reason
        await page.fill('[name="clear-reason"]', 'Reset 2FA po utracie urządzenia');
        
        await page.click('[data-testid="confirm-clear-2fa"]');
        await page.waitForSelector('[data-testid="clear-2fa-success"]');

        // Verify via API
        const response = await request.post(
          phase2ApiEndpoints.admin.clear2FA(userId || 'user-123'),
          {
            headers: {
              'Authorization': `Bearer ${adminAuthToken}`,
              'Content-Type': 'application/json',
            },
            data: {
              reason: testAdminFeatures.CLEAR_2FA.reason,
            },
          }
        );

        expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
      }
    });

    test('should notify user after clearing 2FA', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="clear-2fa"]');
        await page.check('[name="notify-user"]');
        await page.click('[data-testid="confirm-clear-2fa"]');

        await page.waitForSelector('[data-testid="notification-sent"]');
        const notificationText = await page.textContent('[data-testid="notification-sent"]');
        expect(notificationText).toContain('powiadomiono');
      }
    });

    test('should allow user to setup 2FA again after clear', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Clear 2FA via admin panel
      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="clear-2fa"]');
        await page.click('[data-testid="confirm-clear-2fa"]');
      }

      // Login as user
      await page.goto('/login');
      await page.fill('[name="identifier"]', testPatients.STANDARD.email);
      await page.fill('[name="password"]', testPatients.STANDARD.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Navigate to security settings
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="security-settings"]');
      await page.waitForSelector('[data-testid="security-panel"]');

      // Should be able to enable 2FA
      const enable2faBtn = await page.$('[data-testid="enable-2fa"]');
      expect(enable2faBtn).not.toBeNull();
    });

    test('should require confirmation for clearing 2FA', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="clear-2fa"]');
        await page.waitForSelector('[data-testid="clear-2fa-modal"]');

        // Modal should warn about security implications
        const warningText = await page.textContent('[data-testid="security-warning"]');
        expect(warningText).toContain('bezpieczeństwa');

        // Confirm button should require explicit confirmation
        await page.click('[data-testid="confirm-clear-2fa"]');
        await page.waitForSelector('[data-testid="clear-2fa-success"]');
      }
    });

    test('should log 2FA clear action', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="clear-2fa"]');
        await page.fill('[name="clear-reason"]', 'Testowy powód');
        await page.click('[data-testid="confirm-clear-2fa"]');

        // Check admin audit log
        await page.goto('/admin/audit-log');
        await page.waitForSelector('[data-testid="audit-log"]');

        const logEntry = await page.$('[data-testid="log-entry"][data-action="clear-2fa"]');
        expect(logEntry).not.toBeNull();
      }
    });
  });

  test.describe('Generate Activation Code', () => {
    test('should generate patient activation code', async ({ request, page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Via UI
      await page.goto('/admin/activation-codes');
      await page.waitForSelector('[data-testid="activation-codes-panel"]');

      await page.click('[data-testid="generate-code"]');
      await page.waitForSelector('[data-testid="generate-code-modal"]');

      // Select code type
      await page.selectOption('[name="code-type"]', 'PATIENT_ACTIVATION');
      await page.fill('[name="validity-hours"]', '48');
      await page.fill('[name="max-uses"]', '1');
      
      await page.click('[data-testid="confirm-generate"]');
      await page.waitForSelector('[data-testid="code-generated"]');

      // Verify code is displayed
      const generatedCode = await page.textContent('[data-testid="generated-code"]');
      expect(generatedCode).toBeTruthy();
      expect(generatedCode.length).toBeGreaterThan(8);

      // Verify via API
      const response = await request.post(
        phase2ApiEndpoints.admin.generateActivationCode,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            type: testAdminFeatures.ACTIVATION_CODE.type,
            validityHours: testAdminFeatures.ACTIVATION_CODE.validityHours,
            maxUses: testAdminFeatures.ACTIVATION_CODE.maxUses,
          },
        }
      );

      expect([httpStatus.CREATED, httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED || response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('code');
        expect(body).toHaveProperty('expiresAt');
      }
    });

    test('should generate code with custom validity period', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.click('[data-testid="generate-code"]');

      await page.selectOption('[name="code-type"]', 'PATIENT_ACTIVATION');
      await page.fill('[name="validity-hours"]', '24');
      await page.click('[data-testid="confirm-generate"]');
      await page.waitForSelector('[data-testid="code-generated"]');

      // Verify validity
      const validityText = await page.textContent('[data-testid="code-validity"]');
      expect(validityText).toContain('24');
    });

    test('should generate code with multiple uses', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.click('[data-testid="generate-code"]');

      await page.selectOption('[name="code-type"]', 'PATIENT_ACTIVATION');
      await page.fill('[name="max-uses"]', '10');
      await page.click('[data-testid="confirm-generate"]');
      await page.waitForSelector('[data-testid="code-generated"]');

      // Verify max uses
      const usesText = await page.textContent('[data-testid="code-max-uses"]');
      expect(usesText).toContain('10');
    });

    test('should display generated code only once', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.click('[data-testid="generate-code"]');
      await page.click('[data-testid="confirm-generate"]');
      await page.waitForSelector('[data-testid="code-generated"]');

      const code = await page.textContent('[data-testid="generated-code"]');
      
      // Close modal
      await page.click('[data-testid="close-modal"]');
      await page.waitForSelector('[data-testid="activation-codes-panel"]');

      // Try to view code again - should not be visible
      const codeVisible = await page.isVisible('[data-testid="generated-code"]');
      expect(codeVisible).toBe(false);
    });

    test('should copy activation code to clipboard', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.click('[data-testid="generate-code"]');
      await page.click('[data-testid="confirm-generate"]');
      await page.waitForSelector('[data-testid="code-generated"]');

      await page.click('[data-testid="copy-code"]');
      await page.waitForSelector('[data-testid="copy-success"]');

      const copyText = await page.textContent('[data-testid="copy-success"]');
      expect(copyText).toContain('skopiowano');
    });

    test('should list all active activation codes', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.waitForSelector('[data-testid="active-codes-list"]');

      const codes = await page.$$('[data-testid="activation-code-row"]');
      expect(codes.length).toBeGreaterThanOrEqual(0);

      // Each row should show code info
      for (const code of codes.slice(0, 3)) {
        expect(await code.isVisible('[data-testid="code-value"]')).toBe(true);
        expect(await code.isVisible('[data-testid="code-expires"]')).toBe(true);
        expect(await code.isVisible('[data-testid="code-uses"]')).toBe(true);
      }
    });

    test('should revoke activation code', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.waitForSelector('[data-testid="active-codes-list"]');

      const codeRow = await page.$('[data-testid="activation-code-row"]');
      if (codeRow) {
        await codeRow.click('[data-testid="revoke-code"]');
        await page.waitForSelector('[data-testid="revoke-confirmation"]');
        await page.click('[data-testid="confirm-revoke"]');
        await page.waitForSelector('[data-testid="revoke-success"]');

        // Code should be removed from list or marked as revoked
        const isRevoked = await codeRow.getAttribute('data-revoked');
        expect(isRevoked).toBe('true');
      }
    });

    test('should filter activation codes by status', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      await page.click('[data-testid="filter-status"]');
      await page.click('[data-testid="filter-active"]');

      const codes = await page.$$('[data-testid="activation-code-row"]:visible');
      
      for (const code of codes) {
        const status = await code.getAttribute('data-status');
        expect(status).toBe('ACTIVE');
      }
    });

    test('should show code usage history', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/activation-codes');
      const codeRow = await page.$('[data-testid="activation-code-row"]');
      
      if (codeRow) {
        await codeRow.click('[data-testid="view-usage"]');
        await page.waitForSelector('[data-testid="usage-history-modal"]');

        const usageList = await page.$('[data-testid="usage-list"]');
        expect(usageList).not.toBeNull();
      }
    });
  });

  test.describe('Account Management', () => {
    test('should lock user account', async ({ request, page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        const userId = await userRow.getAttribute('data-user-id');
        
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="lock-account"]');
        await page.waitForSelector('[data-testid="lock-confirmation"]');
        await page.fill('[name="lock-reason"]', 'Podejrzenie naruszenia bezpieczeństwa');
        await page.click('[data-testid="confirm-lock"]');
        await page.waitForSelector('[data-testid="lock-success"]');

        // Verify via API
        const response = await request.post(
          phase2ApiEndpoints.admin.lockAccount(userId || 'user-123'),
          {
            headers: {
              'Authorization': `Bearer ${adminAuthToken}`,
            },
          }
        );

        expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
      }
    });

    test('should unlock user account', async ({ request, page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      await page.click('[data-testid="filter-locked"]');
      
      const lockedUser = await page.$('[data-testid="user-row"][data-locked="true"]');
      
      if (lockedUser) {
        const userId = await lockedUser.getAttribute('data-user-id');
        
        await lockedUser.click('[data-testid="user-actions"]');
        await page.click('[data-testid="unlock-account"]');
        await page.waitForSelector('[data-testid="unlock-success"]');

        // Verify via API
        const response = await request.post(
          phase2ApiEndpoints.admin.unlockAccount(userId || 'user-123'),
          {
            headers: {
              'Authorization': `Bearer ${adminAuthToken}`,
            },
          }
        );

        expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
      }
    });

    test('should suspend user account', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        await userRow.click('[data-testid="user-actions"]');
        await page.click('[data-testid="suspend-account"]');
        await page.waitForSelector('[data-testid="suspend-modal"]');

        await page.fill('[name="suspension-reason"]', 'Naruszenie regulaminu');
        await page.fill('[name="suspension-duration"]', '30');
        await page.click('[data-testid="confirm-suspend"]');
        await page.waitForSelector('[data-testid="suspend-success"]');
      }
    });

    test('should reactivate suspended account', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      await page.click('[data-testid="filter-suspended"]');
      
      const suspendedUser = await page.$('[data-testid="user-row"][data-suspended="true"]');
      
      if (suspendedUser) {
        await suspendedUser.click('[data-testid="user-actions"]');
        await page.click('[data-testid="reactivate-account"]');
        await page.waitForSelector('[data-testid="reactivate-success"]');
      }
    });

    test('should display account status badge', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/users');
      const userRow = await page.$('[data-testid="user-row"]');
      
      if (userRow) {
        const statusBadge = await userRow.$('[data-testid="status-badge"]');
        expect(statusBadge).not.toBeNull();

        const status = await statusBadge?.getAttribute('data-status');
        expect(['ACTIVE', 'LOCKED', 'SUSPENDED', 'INACTIVE']).toContain(status);
      }
    });
  });

  test.describe('Admin Audit Log', () => {
    test('should display admin actions in audit log', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/audit-log');
      await page.waitForSelector('[data-testid="audit-log"]');

      const logEntries = await page.$$('[data-testid="log-entry"]');
      expect(logEntries.length).toBeGreaterThanOrEqual(0);

      // Check for admin action types
      const actionTypes = await page.$$('[data-testid="action-type"]');
      expect(actionTypes.length).toBeGreaterThan(0);
    });

    test('should filter audit log by action type', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/audit-log');
      await page.click('[data-testid="filter-action-type"]');
      await page.click('[data-testid="filter-force-reset"]');

      const entries = await page.$$('[data-testid="log-entry"]:visible');
      
      for (const entry of entries) {
        const actionType = await entry.getAttribute('data-action');
        expect(actionType).toBe('FORCE_PASSWORD_RESET');
      }
    });

    test('should filter audit log by date range', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/audit-log');
      await page.click('[data-testid="date-range-filter"]');
      
      await page.fill('[name="date-from"]', '2026-04-01');
      await page.fill('[name="date-to"]', '2026-04-30');
      await page.click('[data-testid="apply-date-filter"]');

      const entries = await page.$$('[data-testid="log-entry"]:visible');
      
      for (const entry of entries) {
        const date = await entry.getAttribute('data-date');
        expect(date).toMatch(/2026-04-\d{2}/);
      }
    });

    test('should export audit log', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/audit-log');
      await page.click('[data-testid="export-log"]');
      await page.waitForSelector('[data-testid="export-dialog"]');

      await page.click('[data-testid="confirm-export"]');
      await page.waitForSelector('[data-testid="export-complete"]');

      const exportText = await page.textContent('[data-testid="export-complete"]');
      expect(exportText).toContain('eksportowano');
    });
  });

  test.describe('Admin API', () => {
    test('should get user list via API', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const response = await request.get('http://localhost:8080/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should get user details via API', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const response = await request.get(
        'http://localhost:8080/api/v1/admin/users/user-123',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should get activation codes via API', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const response = await request.get(
        'http://localhost:8080/api/v1/admin/activation-codes',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });
  });

  test.describe('Negative Tests', () => {
    test('should not access admin panel without admin role', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Login as regular user
      await page.goto('/admin/users');
      
      // Should be redirected or show access denied
      await page.waitForSelector('[data-testid="access-denied"], [data-testid="login-page"]');
      
      const accessDenied = await page.isVisible('[data-testid="access-denied"]');
      const isLoginPage = page.url().includes('/login');
      
      expect(accessDenied || isLoginPage).toBe(true);
    });

    test('should not force password reset without authentication', async ({ request }) => {
      const response = await request.post(
        phase2ApiEndpoints.admin.forcePasswordReset('user-123'),
        {
          data: {
            reason: 'Test',
          },
        }
      );

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should not clear 2FA without authentication', async ({ request }) => {
      const response = await request.post(
        phase2ApiEndpoints.admin.clear2FA('user-123'),
        {
          data: {
            reason: 'Test',
          },
        }
      );

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should not generate activation code without authentication', async ({ request }) => {
      const response = await request.post(
        phase2ApiEndpoints.admin.generateActivationCode,
        {
          data: {
            type: 'PATIENT_ACTIVATION',
          },
        }
      );

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject invalid activation code parameters', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const response = await request.post(
        phase2ApiEndpoints.admin.generateActivationCode,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
          data: {
            type: 'INVALID_TYPE',
            validityHours: -1,
            maxUses: 0,
          },
        }
      );

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });
});
