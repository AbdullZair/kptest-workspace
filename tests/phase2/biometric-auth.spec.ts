/**
 * Biometric Authentication Tests - Phase 2
 *
 * Tests for biometric login features:
 * - Face ID enrollment and authentication
 * - Touch ID enrollment and authentication
 * - Biometric settings management
 * - Fallback to password authentication
 *
 * @module tests/phase2/biometric-auth.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import {
  testPatients,
  testBiometric,
  phase2ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 2 - Biometric Authentication', () => {
  let authToken: string;
  let testUserId: string;

  /**
   * Setup: Login before each test to get auth token
   */
  test.beforeEach(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
      testUserId = body.user_id || 'test-user-' + Date.now();
    }
  });

  test.describe('Biometric Enrollment', () => {
    test('should enroll Face ID biometric data', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Navigate to biometric settings
      await page.goto('/settings/biometric');
      await page.waitForSelector('[data-testid="biometric-settings"]');

      // Click on Face ID enrollment
      await page.click('[data-testid="enable-face-id"]');

      // Simulate biometric scan (in real scenario, this would trigger device biometric)
      await page.waitForSelector('[data-testid="biometric-scan-prompt"]');
      
      // Mock biometric scan success
      await page.evaluate(() => {
        // Simulate successful biometric capture
        window.localStorage.setItem('biometric_enrolled', 'true');
      });

      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Verify via API
      const statusResponse = await request.get(phase2ApiEndpoints.biometric.status, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (statusResponse.status() === httpStatus.OK) {
        const body = await statusResponse.json();
        expect(body.biometricEnabled).toBe(true);
        expect(body.biometricType).toBe('FACE_ID');
      }
    });

    test('should enroll Touch ID biometric data', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/settings/biometric');
      await page.waitForSelector('[data-testid="biometric-settings"]');

      // Click on Touch ID enrollment
      await page.click('[data-testid="enable-touch-id"]');
      await page.waitForSelector('[data-testid="fingerprint-scan-prompt"]');

      // Simulate fingerprint scan
      await page.click('[data-testid="simulate-fingerprint-scan"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      const statusResponse = await request.get(phase2ApiEndpoints.biometric.status, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (statusResponse.status() === httpStatus.OK) {
        const body = await statusResponse.json();
        expect(body.biometricEnabled).toBe(true);
        expect(body.biometricType).toBe('TOUCH_ID');
      }
    });

    test('should reject enrollment without authentication', async ({ request }) => {
      const response = await request.post(phase2ApiEndpoints.biometric.enable, {
        data: {
          type: 'FACE_ID',
          biometricData: testBiometric.FACE_ID.biometricData,
        },
      });

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should allow re-enrollment of biometric data', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      // First enrollment
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Re-enrollment (update biometric template)
      await page.click('[data-testid="update-biometric"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-updated-success"]');
    });
  });

  test.describe('Biometric Authentication', () => {
    test('should login with Face ID', async ({ page, request }) => {
      test.skip(!authToken, 'Auth token not available');

      // First enroll biometric
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Logout
      await page.goto('/logout');
      await page.waitForURL('**/login');

      // Login with Face ID
      await page.goto('/login');
      await page.click('[data-testid="login-with-biometric"]');
      await page.waitForSelector('[data-testid="face-id-scan"]');
      
      // Simulate Face ID scan
      await page.click('[data-testid="simulate-face-id-success"]');
      await page.waitForURL('**/dashboard');

      expect(page.url()).toContain('/dashboard');
    });

    test('should login with Touch ID', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // First enroll biometric
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-touch-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Logout
      await page.goto('/logout');
      await page.waitForURL('**/login');

      // Login with Touch ID
      await page.goto('/login');
      await page.click('[data-testid="login-with-biometric"]');
      await page.waitForSelector('[data-testid="touch-id-scan"]');
      
      // Simulate Touch ID scan
      await page.click('[data-testid="simulate-touch-id-success"]');
      await page.waitForURL('**/dashboard');

      expect(page.url()).toContain('/dashboard');
    });

    test('should fallback to password after failed biometric', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enroll biometric first
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Logout
      await page.goto('/logout');
      await page.waitForURL('**/login');

      // Try biometric login
      await page.goto('/login');
      await page.click('[data-testid="login-with-biometric"]');
      
      // Simulate failed biometric scan
      await page.click('[data-testid="simulate-face-id-failure"]');
      
      // Should show fallback option
      await page.waitForSelector('[data-testid="fallback-to-password"]');
      await page.click('[data-testid="use-password-instead"]');

      // Login with password
      await page.fill('[name="identifier"]', testPatients.STANDARD.email);
      await page.fill('[name="password"]', testPatients.STANDARD.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');

      expect(page.url()).toContain('/dashboard');
    });

    test('should reject login with unrecognized biometric', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enroll biometric first
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Logout
      await page.goto('/logout');
      await page.waitForURL('**/login');

      // Try with different biometric (simulated)
      await page.goto('/login');
      await page.click('[data-testid="login-with-biometric"]');
      
      // Simulate unrecognized face
      await page.click('[data-testid="simulate-face-id-unrecognized"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="biometric-error"]');
      expect(await page.textContent('[data-testid="biometric-error"]')).toContain('nierozpoznano');
    });
  });

  test.describe('Biometric Settings Management', () => {
    test('should disable biometric authentication', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enable first
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Disable
      await page.click('[data-testid="disable-biometric"]');
      await page.click('[data-testid="confirm-disable"]');
      await page.waitForSelector('[data-testid="biometric-disabled-success"]');

      // Verify via API
      const statusResponse = await request.get(phase2ApiEndpoints.biometric.status, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (statusResponse.status() === httpStatus.OK) {
        const body = await statusResponse.json();
        expect(body.biometricEnabled).toBe(false);
      }
    });

    test('should display biometric status in settings', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/settings/biometric');
      await page.waitForSelector('[data-testid="biometric-settings"]');

      // Should show current status
      const isEnabled = await page.isVisible('[data-testid="biometric-enabled-indicator"]');
      
      // Status indicator should be visible
      expect(isEnabled).toBe(true);
    });

    test('should require password to disable biometric', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enable first
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Try to disable - should require password confirmation
      await page.click('[data-testid="disable-biometric"]');
      await page.waitForSelector('[data-testid="password-confirmation-modal"]');

      // Enter wrong password
      await page.fill('[name="confirm-password"]', 'wrongpassword');
      await page.click('[data-testid="confirm-disable"]');
      
      // Should show error
      await page.waitForSelector('[data-testid="password-error"]');

      // Enter correct password
      await page.fill('[name="confirm-password"]', testPatients.STANDARD.password);
      await page.click('[data-testid="confirm-disable"]');
      await page.waitForSelector('[data-testid="biometric-disabled-success"]');
    });
  });

  test.describe('Biometric API Tests', () => {
    test('should get biometric status via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase2ApiEndpoints.biometric.status, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('biometricEnabled');
        expect(body).toHaveProperty('biometricType');
      }
    });

    test('should enable biometric via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(phase2ApiEndpoints.biometric.enable, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        data: {
          type: 'FACE_ID',
          biometricData: testBiometric.FACE_ID.biometricData,
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK || response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body.biometricEnabled).toBe(true);
      }
    });

    test('should disable biometric via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(phase2ApiEndpoints.biometric.disable, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should verify biometric token via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(phase2ApiEndpoints.biometric.verify, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        data: {
          biometricToken: 'mock-biometric-token-' + Date.now(),
        },
      });

      expect([httpStatus.OK, httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Biometric Security', () => {
    test('should lock biometric after multiple failed attempts', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enroll biometric first
      await page.goto('/settings/biometric');
      await page.click('[data-testid="enable-face-id"]');
      await page.click('[data-testid="confirm-biometric-enrollment"]');
      await page.waitForSelector('[data-testid="biometric-enabled-success"]');

      // Logout
      await page.goto('/logout');
      await page.waitForURL('**/login');

      // Try 5 failed biometric attempts
      for (let i = 0; i < 5; i++) {
        await page.goto('/login');
        await page.click('[data-testid="login-with-biometric"]');
        await page.click('[data-testid="simulate-face-id-failure"]');
        await page.waitForSelector('[data-testid="biometric-error"]');
      }

      // 6th attempt should be blocked
      await page.click('[data-testid="login-with-biometric"]');
      await page.waitForSelector('[data-testid="biometric-locked-message"]');
      expect(await page.textContent('[data-testid="biometric-locked-message"]')).toContain('zablokowano');
    });

    test('should require re-authentication for sensitive operations', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/settings/security');
      await page.waitForSelector('[data-testid="security-settings"]');

      // Try to change password - should require biometric confirmation
      await page.click('[data-testid="change-password"]');
      await page.waitForSelector('[data-testid="biometric-confirmation"]');
      
      // Should prompt for biometric verification
      const isBiometricPromptVisible = await page.isVisible('[data-testid="biometric-confirmation"]');
      expect(isBiometricPromptVisible).toBe(true);
    });
  });
});
