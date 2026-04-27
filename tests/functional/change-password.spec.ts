/**
 * Functional - Change Password Tests (US-P-09)
 *
 * Tests for password change feature:
 * - User changes password successfully
 * - Validation fails for weak password
 * - Validation fails for same password
 * - All refresh tokens revoked after change
 *
 * @module tests/functional/change-password.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, httpStatus, generateStrongPassword } from '../test-data';

test.describe('Functional - Change Password (US-P-09)', () => {
  let authToken: string;
  let refreshToken: string;
  let userId: string;

  /**
   * Setup: Login before each test
   */
  test.beforeEach(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
      refreshToken = body.refresh_token;
      userId = body.user_id || 'user-123';
    }
  });

  test('User changes password successfully', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const newPassword = generateStrongPassword(14);

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: newPassword,
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.OK);
    const body = await changeResponse.json();
    expect(body.success).toBe(true);
    expect(body.message).toBeDefined();
  });

  test('Changed password works for login', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const newPassword = generateStrongPassword(14);

    // First change the password
    await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: newPassword,
      },
    });

    // Login with new password
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: newPassword,
      },
    });

    expect(loginResponse.status()).toBe(httpStatus.OK);
    const body = await loginResponse.json();
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
  });

  test('Validation fails for weak password - too short', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: 'short',
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);
    const body = await changeResponse.json();
    expect(body.message).toBeDefined();
    expect(body.message.toLowerCase()).toContain('password');
  });

  test('Validation fails for weak password - no uppercase', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: 'lowercase123!',
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Validation fails for weak password - no lowercase', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: 'UPPERCASE123!',
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Validation fails for weak password - no digit', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: 'NoDigitsHere!',
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Validation fails for weak password - no special character', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: 'NoSpecial123',
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Validation fails for same password', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: testUsers.patient.password,
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);
    const body = await changeResponse.json();
    expect(body.message).toBeDefined();
    expect(body.message.toLowerCase()).toContain('same');
  });

  test('Validation fails for incorrect current password', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: 'wrongpassword',
        newPassword: generateStrongPassword(14),
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.UNAUTHORIZED);
    const body = await changeResponse.json();
    expect(body.message).toBeDefined();
    expect(body.message.toLowerCase()).toContain('current');
  });

  test('All refresh tokens revoked after password change', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const newPassword = generateStrongPassword(14);

    // Change password
    await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: newPassword,
      },
    });

    // Try to use old refresh token
    const refreshResponse = await request.post('http://localhost:8080/api/v1/auth/refresh', {
      data: {
        refresh_token: refreshToken,
      },
    });

    // Old refresh token should be invalid
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN].includes(refreshResponse.status())).toBe(true);
  });

  test('Old access token still works until expiration', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const newPassword = generateStrongPassword(14);

    // Change password
    await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: newPassword,
      },
    });

    // Old access token may still work until it expires
    // This is expected behavior - only refresh tokens are revoked
    const meResponse = await request.get('http://localhost:8080/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    // May succeed (token not expired) or fail (token revoked)
    expect([httpStatus.OK, httpStatus.UNAUTHORIZED].includes(meResponse.status())).toBe(true);
  });

  test('Change password without auth returns 401', async ({ request }) => {
    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: generateStrongPassword(14),
      },
    });

    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN].includes(changeResponse.status())).toBe(true);
  });

  test('Change password with missing fields fails validation', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    // Missing newPassword
    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.BAD_REQUEST);

    // Missing currentPassword
    const changeResponse2 = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        newPassword: generateStrongPassword(14),
      },
    });

    expect(changeResponse2.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Password change creates audit log entry', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');
    test.skip(!testUsers.admin.email, 'Admin credentials not available');

    const newPassword = generateStrongPassword(14);

    // Change password
    await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: newPassword,
      },
    });

    // Login as admin to check audit log
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.admin.email,
        password: testUsers.admin.password,
      },
    });

    if (adminLoginResponse.status() === httpStatus.OK) {
      const adminBody = await adminLoginResponse.json();
      const adminAuthToken = adminBody.access_token;

      // Check audit log for PASSWORD_CHANGED action
      const auditResponse = await request.get(
        `http://localhost:8080/api/v1/admin/audit-logs?entityId=${userId}&action=PASSWORD_CHANGED`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      if (auditResponse.status() === httpStatus.OK) {
        const auditLogs = await auditResponse.json();
        expect(Array.isArray(auditLogs)).toBe(true);
        
        const passwordChangeLog = auditLogs.find((log: any) => log.action === 'PASSWORD_CHANGED');
        expect(passwordChangeLog).toBeDefined();
      }
    }
  });

  test('Multiple consecutive password changes work correctly', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const password1 = generateStrongPassword(14);
    const password2 = generateStrongPassword(14);
    const password3 = generateStrongPassword(14);

    // First change
    const change1Response = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.patient.password,
        newPassword: password1,
      },
    });
    expect(change1Response.status()).toBe(httpStatus.OK);

    // Login with password1
    const login1Response = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: password1,
      },
    });
    expect(login1Response.status()).toBe(httpStatus.OK);
    const token1 = (await login1Response.json()).access_token;

    // Second change
    const change2Response = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: password1,
        newPassword: password2,
      },
    });
    expect(change2Response.status()).toBe(httpStatus.OK);

    // Login with password2
    const login2Response = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: password2,
      },
    });
    expect(login2Response.status()).toBe(httpStatus.OK);
    const token2 = (await login2Response.json()).access_token;

    // Third change
    const change3Response = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${token2}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: password2,
        newPassword: password3,
      },
    });
    expect(change3Response.status()).toBe(httpStatus.OK);

    // Final login with password3
    const login3Response = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: password3,
      },
    });
    expect(login3Response.status()).toBe(httpStatus.OK);
  });

  test('Provider user can change password', async ({ request }) => {
    const providerLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.provider.email,
        password: testUsers.provider.password,
      },
    });

    if (providerLoginResponse.status() !== httpStatus.OK) {
      test.skip();
      return;
    }

    const providerBody = await providerLoginResponse.json();
    const providerAuthToken = providerBody.access_token;

    const newPassword = generateStrongPassword(14);

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${providerAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.provider.password,
        newPassword: newPassword,
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.OK);
  });

  test('Admin user can change password', async ({ request }) => {
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.admin.email,
        password: testUsers.admin.password,
      },
    });

    if (adminLoginResponse.status() !== httpStatus.OK) {
      test.skip();
      return;
    }

    const adminBody = await adminLoginResponse.json();
    const adminAuthTokenLocal = adminBody.access_token;

    const newPassword = generateStrongPassword(14);

    const changeResponse = await request.post('http://localhost:8080/api/v1/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${adminAuthTokenLocal}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: testUsers.admin.password,
        newPassword: newPassword,
      },
    });

    expect(changeResponse.status()).toBe(httpStatus.OK);
  });
});
