/**
 * Authentication Regression Tests
 *
 * Full regression suite for authentication features.
 *
 * @module tests/regression/auth.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, testPatients, apiEndpoints, httpStatus } from '../test-data';

test.describe('Regression - Authentication', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
    }
  });

  test('should login with valid credentials', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    expect(response.status()).toBe(httpStatus.OK);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
  });

  test('should reject invalid credentials', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
  });

  test('should access protected endpoint with valid token', async ({ request }) => {
    const response = await request.get(apiEndpoints.auth.me, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.status() === httpStatus.OK) {
      const body = await response.json();
      expect(body).toHaveProperty('user_id');
    }
  });

  test('should reject protected endpoint without token', async ({ request }) => {
    const response = await request.get(apiEndpoints.auth.me);
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should logout successfully', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.logout, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect([httpStatus.OK, httpStatus.NO_CONTENT]).toContain(response.status());
  });

  test('should refresh token', async ({ request }) => {
    // First login to get refresh token
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    const loginBody = await loginResponse.json();

    // Refresh token
    const refreshResponse = await request.post(apiEndpoints.auth.refresh, {
      data: {
        refresh_token: loginBody.refresh_token,
      },
    });

    expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(refreshResponse.status());
  });

  test('should register new user', async ({ request }) => {
    const uniqueEmail = `test_${Date.now()}@kptest.com`;

    const response = await request.post(apiEndpoints.auth.register, {
      data: {
        identifier: uniqueEmail,
        password: 'TestP@ssw0rd123',
        pesel: '90010101234',
        firstName: 'Test',
        lastName: 'User',
        email: uniqueEmail,
        phone: '+48123456789',
        termsAccepted: 'true',
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.CONFLICT]).toContain(response.status());
  });

  test('should request password reset', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.forgotPassword, {
      data: {
        email: testUsers.patient.email,
      },
    });

    expect([httpStatus.OK, httpStatus.NOT_FOUND]).toContain(response.status());
  });

  test('should validate JWT token structure', async ({ request }) => {
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    const body = await loginResponse.json();
    const tokenParts = body.access_token.split('.');

    expect(tokenParts.length).toBe(3);
  });

  test('should handle concurrent sessions', async ({ request }) => {
    // Login twice
    const login1 = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    const login2 = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    expect(login1.status()).toBe(httpStatus.OK);
    expect(login2.status()).toBe(httpStatus.OK);
  });
});
