/**
 * Authentication API Tests
 * 
 * REST API tests for authentication endpoints:
 * - Token refresh flow
 * - User profile retrieval
 * - Token lifecycle management
 * 
 * @module tests/api/auth.api.spec.ts
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { testUsers, apiEndpoints, httpStatus, decodeJwt, timeouts } from '../test-data';

test.describe('Authentication API', () => {

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  /**
   * Helper to create login payload
   */
  function createLoginPayload(overrides?: Partial<LoginPayload>): LoginPayload {
    return {
      identifier: testUsers.patient.email,
      password: testUsers.patient.password,
      ...overrides,
    };
  }

  /**
   * Setup: Login before each test
   */
  test.beforeEach(async ({ request }) => {
    const response = await request.post(apiEndpoints.auth.login, {
      data: createLoginPayload(),
    });
    
    expect(response.status()).toBe(httpStatus.OK);
    
    const body = await response.json();
    accessToken = body.access_token;
    refreshToken = body.refresh_token;
    userId = body.user_id;
  });

  test.describe('Token Refresh', () => {
    
    test('should refresh access token with valid refresh token', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {
          refresh_token: refreshToken,
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const body = await response.json();
      
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');
      expect(body.token_type).toBe('Bearer');
      expect(body.expires_in).toBeGreaterThan(0);
      expect(body.requires2fa).toBe(false);
    });

    test('should return new refresh token different from old one', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {
          refresh_token: refreshToken,
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const body = await response.json();
      
      // Refresh token should be rotated for security
      expect(body.refresh_token).not.toBe(refreshToken);
    });

    test('should return valid JWT in refreshed access token', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {
          refresh_token: refreshToken,
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const body = await response.json();
      const decoded = decodeJwt(body.access_token);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.payload).toHaveProperty('sub');
      expect(decoded?.payload).toHaveProperty('exp');
      
      // New token should have future expiration
      const now = Math.floor(Date.now() / 1000);
      expect(decoded!.payload.exp).toBeGreaterThan(now);
    });

    test('should reject refresh with invalid token', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {
          refresh_token: 'invalid-refresh-token',
        },
      });

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
      
      const body = await response.json();
      expect(body.message).toContain('Invalid refresh token');
    });

    test('should reject refresh with expired token', async ({ request }) => {
      // Create an expired refresh token scenario
      // In real test, you'd need to wait for token expiration or use mocked tokens
      
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjowfQ.expired';
      
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {
          refresh_token: expiredToken,
        },
      });

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    });

    test('should reject refresh with empty token', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {
          refresh_token: '',
        },
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
    });

    test('should reject refresh without token field', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: {},
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.errors).toBeDefined();
    });

    test('should revoke old refresh token after refresh (token rotation)', async ({ request }) => {
      // First refresh
      const refresh1 = await request.post(apiEndpoints.auth.refresh, {
        data: { refresh_token: refreshToken },
      });
      const body1 = await refresh1.json();

      // Try to use old refresh token again
      const refresh2 = await request.post(apiEndpoints.auth.refresh, {
        data: { refresh_token: refreshToken },
      });

      expect(refresh2.status()).toBe(httpStatus.UNAUTHORIZED);
      
      const body2 = await refresh2.json();
      expect(body2.message).toContain('Refresh token used');
    });

    test('should allow access with new access token after refresh', async ({ request }) => {
      // Refresh tokens
      const refreshResponse = await request.post(apiEndpoints.auth.refresh, {
        data: { refresh_token: refreshToken },
      });
      const refreshBody = await refreshResponse.json();

      // Access protected endpoint with new token
      const profileResponse = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${refreshBody.access_token}`,
        },
      });

      expect(profileResponse.status()).toBe(httpStatus.OK);
      
      const profile = await profileResponse.json();
      expect(profile.user_id).toBe(userId);
    });
  });

  test.describe('User Profile', () => {
    
    test('should retrieve user profile with valid token', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const profile = await response.json();
      
      expect(profile).toHaveProperty('user_id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('role');
      expect(profile).toHaveProperty('status');
      expect(profile).toHaveProperty('first_name');
      expect(profile).toHaveProperty('last_name');
      expect(profile).toHaveProperty('pesel');
      expect(profile).toHaveProperty('created_at');
      expect(profile).toHaveProperty('two_factor_enabled');
    });

    test('should return correct user data', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const profile = await response.json();
      
      expect(profile.email).toBe(testPatients.STANDARD.email);
      expect(profile.first_name).toBe(testPatients.STANDARD.firstName);
      expect(profile.last_name).toBe(testPatients.STANDARD.lastName);
      expect(profile.pesel).toBe(testPatients.STANDARD.pesel);
    });

    test('should return user role as PATIENT', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const profile = await response.json();
      expect(profile.role).toBe('PATIENT');
    });

    test('should reject profile access without token', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me);

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    });

    test('should reject profile access with invalid token', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    });

    test('should reject profile access with malformed Authorization header', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': accessToken, // Missing 'Bearer ' prefix
        },
      });

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    });

    test('should reject profile access with wrong token type prefix', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Basic ${accessToken}`,
        },
      });

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  test.describe('Token Validation', () => {
    
    test('should include user ID in JWT subject claim', async ({ request }) => {
      const decoded = decodeJwt(accessToken);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.payload.sub).toBe(userId);
    });

    test('should have valid token structure', async ({ request }) => {
      const decoded = decodeJwt(accessToken);

      expect(decoded?.header.alg).toMatch(/HS|RS|ES/);
      // JWT header 'typ' is optional - some implementations omit it
      if (decoded?.header.typ !== undefined) {
        expect(decoded?.header.typ).toBe('JWT');
      }
    });

    test('should have future expiration time', async ({ request }) => {
      const decoded = decodeJwt(accessToken);
      const now = Math.floor(Date.now() / 1000);

      expect(decoded!.payload.exp).toBeGreaterThan(now);
    });

    test('should have issued-at time in past', async ({ request }) => {
      const decoded = decodeJwt(accessToken);
      const now = Math.floor(Date.now() / 1000);
      
      expect(decoded!.payload.iat).toBeLessThanOrEqual(now);
    });

    test('should have reasonable token lifetime', async ({ request }) => {
      const decoded = decodeJwt(accessToken);
      const lifetime = decoded!.payload.exp - decoded!.payload.iat;
      
      // Access token should be between 5 minutes and 1 hour
      expect(lifetime).toBeGreaterThanOrEqual(300); // 5 minutes
      expect(lifetime).toBeLessThanOrEqual(3600); // 1 hour
    });
  });

  test.describe('Token Expiration', () => {
    
    test.skip('should reject expired access token', async ({ request }) => {
      // This test requires waiting for token expiration or time mocking
      // Skipped by default
      
      test.setTimeout(timeouts.TEST + 20000);
      
      // Wait for token to expire (would need short-lived test token)
      await new Promise(resolve => setTimeout(resolve, 16000));
      
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(response.status()).toBe(httpStatus.UNAUTHORIZED);
      
      const body = await response.json();
      expect(body.message).toContain('expired');
    });

    test('should allow token refresh before expiration', async ({ request }) => {
      // Refresh immediately - should succeed
      const response = await request.post(apiEndpoints.auth.refresh, {
        data: { refresh_token: refreshToken },
      });

      expect(response.status()).toBe(httpStatus.OK);
    });
  });

  test.describe('Security Headers', () => {
    
    test('should return CORS headers', async ({ request }) => {
      const response = await request.get(apiEndpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Origin': 'http://localhost:3000',
        },
      });

      expect(response.status()).toBe(httpStatus.OK);
      
      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeDefined();
    });

    test('should set secure cookie flags if using cookies', async ({ request }) => {
      // If the API sets authentication cookies, they should have secure flags
      // This test depends on implementation - adjust as needed
      
      const response = await request.post(apiEndpoints.auth.login, {
        data: createLoginPayload(),
      });

      const headers = response.headers();
      
      // If set-cookie is present, check for secure flags
      if (headers['set-cookie']) {
        expect(headers['set-cookie']).toContain('Secure');
        expect(headers['set-cookie']).toContain('HttpOnly');
        expect(headers['set-cookie']).toContain('SameSite');
      }
    });
  });

  test.describe('Rate Limiting', () => {
    
    test.skip('should rate limit excessive refresh requests', async ({ request }) => {
      // This test may be slow - skipped by default
      // Depends on rate limiter configuration
      
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          request.post(apiEndpoints.auth.refresh, {
            data: { refresh_token: refreshToken },
          })
        );
      }

      const responses = await Promise.all(requests);
      const statusCodes = responses.map(r => r.status());
      
      // Should have at least one 429 Too Many Requests
      expect(statusCodes).toContain(httpStatus.TOO_MANY_REQUESTS);
    });
  });

  test.describe('Logout (Token Invalidation)', () => {
    
    test.skip('should invalidate tokens on logout', async ({ request }) => {
      // Depends on logout endpoint implementation
      // Skipped if logout not implemented
      
      const logoutResponse = await request.post(apiEndpoints.auth.logout, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        data: {
          refresh_token: refreshToken,
        },
      });

      expect(logoutResponse.status()).toBe(httpStatus.OK);

      // Try to use invalidated refresh token
      const refreshResponse = await request.post(apiEndpoints.auth.refresh, {
        data: { refresh_token: refreshToken },
      });

      expect(refreshResponse.status()).toBe(httpStatus.UNAUTHORIZED);
    });
  });
});

/**
 * Type definitions
 */
interface LoginPayload {
  identifier: string;
  password: string;
  totpCode?: string;
}

interface RefreshPayload {
  refresh_token: string;
}
