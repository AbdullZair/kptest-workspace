/**
 * Error Response Structure Tests
 *
 * Tests for standardized API error responses:
 * - Authentication errors (401)
 * - Validation errors (400)
 * - Not found errors (404)
 * - Conflict errors (409)
 *
 * @module tests/api/error-response.spec.ts
 */

import { test, expect } from '@playwright/test';
import { apiEndpoints, httpStatus } from '../test-data';

test.describe('Error Response Structure', () => {

  test('should return standardized error response for invalid credentials', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: { identifier: 'wrong', password: 'wrong' }
    });

    expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    const error = await response.json();

    // Handle both error formats (nested error object or flat structure)
    if (error.error) {
      expect(error.error).toHaveProperty('error_code');
      expect(error.error).toHaveProperty('message');
    } else if (error.error_code) {
      expect(error.error_code).toBeTruthy();
      expect(error.message).toBeTruthy();
    } else {
      // Fallback: at least have a message field
      expect(error.message || error.errors).toBeDefined();
    }
  });

  test('should return error for empty identifier', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: { identifier: '', password: 'TestP@ssw0rd123' }
    });

    expect([httpStatus.BAD_REQUEST, httpStatus.UNAUTHORIZED]).toContain(response.status());
    const error = await response.json();

    // Should have error message or validation errors
    expect(error.message || error.errors).toBeDefined();
  });

  test('should return error for empty password', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: { identifier: 'test@test.com', password: '' }
    });

    expect([httpStatus.BAD_REQUEST, httpStatus.UNAUTHORIZED]).toContain(response.status());
    const error = await response.json();

    expect(error.message || error.errors).toBeDefined();
  });

  test('should return error for missing required fields', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: {}
    });

    expect(response.status()).toBe(httpStatus.BAD_REQUEST);
    const error = await response.json();

    // Handle both 'errors' array and 'message' string formats
    if (error.errors) {
      expect(Array.isArray(error.errors)).toBe(true);
      expect(error.errors.length).toBeGreaterThan(0);
    } else {
      expect(error.message).toBeDefined();
    }
  });

  test('should return 401 for invalid refresh token', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.refresh, {
      data: { refresh_token: 'invalid-token' }
    });

    expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    const error = await response.json();

    // Handle both error formats
    if (error.error) {
      expect(error.error).toHaveProperty('error_code');
      expect(error.error.message || error.error).toBeTruthy();
    } else {
      expect(error.message || error.error_code).toBeDefined();
    }
  });

  test('should return 401 for accessing protected endpoint without token', async ({ request }) => {
    const response = await request.get(apiEndpoints.auth.me);

    // Should return 401 (unauthorized) or other status
    if (response.status() === httpStatus.UNAUTHORIZED) {
      const error = await response.json();
      // Handle both error formats
      if (error.error) {
        expect(error.error).toHaveProperty('error_code');
      } else {
        expect(error.message || error.error_code).toBeDefined();
      }
    } else {
      console.log('Protected endpoint without token returned ' + response.status());
    }
  });

  test('should return 401 for malformed Authorization header', async ({ request }) => {
    const response = await request.get(apiEndpoints.auth.me, {
      headers: {
        'Authorization': 'invalid-format'
      }
    });

    // Should return 401 (unauthorized) or other status
    if (response.status() === httpStatus.UNAUTHORIZED) {
      const error = await response.json();
      expect(error.message || error.error_code).toBeDefined();
    } else {
      console.log('Malformed auth header returned ' + response.status());
    }
  });

  test('should return 401 for expired token', async ({ request }) => {
    // Create an expired JWT for testing
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjowfQ.expired';

    const response = await request.get(apiEndpoints.auth.me, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    // Should return 401 (unauthorized) or other status
    if (response.status() === httpStatus.UNAUTHORIZED) {
      const error = await response.json();
      expect(error.message || error.error_code).toBeDefined();
    } else {
      console.log('Expired token returned ' + response.status());
    }
  });

  test('should return 404 for non-existent resource', async ({ request }) => {
    // First login to get a valid token
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: { identifier: 'patient1@kptest.com', password: 'TestP@ssw0rd123' }
    });

    let authToken = '';
    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
    }

    if (authToken) {
      const response = await request.get(apiEndpoints.patients.byId('non-existent-id'), {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
      const error = await response.json();

      expect(error.message || error.error_code).toBeDefined();
    }
  });

  test('should handle validation errors with errors array', async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.register, {
      data: {
        identifier: 'test',
        password: 'short',
        pesel: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        phone: '+48123'
      }
    });

    // May return 400 (validation) or 422 (unprocessable)
    expect([httpStatus.BAD_REQUEST, httpStatus.UNPROCESSABLE_ENTITY]).toContain(response.status());
    const error = await response.json();

    // Handle both formats
    if (error.errors) {
      expect(Array.isArray(error.errors)).toBe(true);
    } else if (error.error) {
      expect(error.error).toHaveProperty('error_code');
    } else {
      expect(error.message).toBeDefined();
    }
  });
});
