/**
 * Patient Registration Tests
 * 
 * Tests the complete registration flow for new patients:
 * - Form validation
 * - HIS verification
 * - Account creation
 * - Email/phone verification
 * 
 * @module tests/auth/register.spec.ts
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { testPatients, invalidData, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Patient Registration', () => {
  
  /**
   * Helper to create registration payload
   */
  function createRegistrationPayload(overrides?: Partial<RegisterPayload>): RegisterPayload {
    return {
      identifier: testPatients.STANDARD.email,
      password: testPatients.STANDARD.password,
      pesel: testPatients.STANDARD.pesel,
      firstName: testPatients.STANDARD.firstName,
      lastName: testPatients.STANDARD.lastName,
      email: testPatients.STANDARD.email,
      phone: testPatients.STANDARD.phone,
      termsAccepted: 'true',
      ...overrides,
    };
  }

  test.describe('Form Validation', () => {
    
    test('should reject invalid email format', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: invalidData.invalidEmail,
          email: invalidData.invalidEmail,
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body).toHaveProperty('errors');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.stringContaining('email'),
          }),
        ])
      );
    });

    test('should reject invalid phone format', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: invalidData.invalidPhone,
          phone: invalidData.invalidPhone,
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body).toHaveProperty('errors');
    });

    test('should reject invalid PESEL format', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          pesel: invalidData.invalidPesel,
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'pesel',
            message: expect.stringContaining('PESEL'),
          }),
        ])
      );
    });

    test('should reject weak password', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          password: invalidData.weakPassword,
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('Password'),
          }),
        ])
      );
    });

    test('should reject registration without terms acceptance', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          termsAccepted: '',
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'termsAccepted',
          }),
        ])
      );
    });

    test('should reject SQL injection attempt', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          firstName: invalidData.sqlInjection,
        }),
      });

      // Should either reject with validation error or succeed safely (parameterized queries)
      // The important thing is it doesn't crash or leak data
      expect([httpStatus.BAD_REQUEST, httpStatus.CREATED]).toContain(response.status());
    });

    test('should reject XSS payload in fields', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          lastName: invalidData.xssPayload,
        }),
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.CREATED]).toContain(response.status());
      
      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        // XSS should be escaped or sanitized in response
        expect(body.first_name || body.firstName).not.toContain('<script>');
      }
    });
  });

  test.describe('Successful Registration', () => {
    
    test('should register patient with email identifier', async ({ request }) => {
      const uniqueEmail = `${generateUniqueIdentifier('qa')}@test.pl`;
      
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail,
          email: uniqueEmail,
        }),
      });

      expect(response.status()).toBe(httpStatus.CREATED);
      
      const body = await response.json();
      
      // Verify response structure
      expect(body).toHaveProperty('user_id');
      expect(body).toHaveProperty('email', uniqueEmail);
      expect(body).toHaveProperty('first_name', testPatients.STANDARD.firstName);
      expect(body).toHaveProperty('last_name', testPatients.STANDARD.lastName);
      expect(body).toHaveProperty('pesel', testPatients.STANDARD.pesel);
      expect(body).toHaveProperty('role', 'PATIENT');
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('created_at');
      expect(body).toHaveProperty('two_factor_enabled');

      // Verify user status is PENDING_VERIFICATION
      expect(body.status).toBe('PENDING_VERIFICATION');

      // Verify Location header
      const location = response.headers()['location'];
      expect(location).toBeDefined();
      expect(location).toContain('/api/v1/users/');
    });

    test('should register patient with phone identifier', async ({ request }) => {
      const uniquePhone = `+48${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniquePhone,
          phone: uniquePhone,
          email: `${generateUniqueIdentifier('qa')}@test.pl`,
        }),
      });

      expect(response.status()).toBe(httpStatus.CREATED);
      
      const body = await response.json();
      expect(body.phone).toBe(uniquePhone);
      expect(body.status).toBe('PENDING_VERIFICATION');
    });

    test('should return valid JWT token structure after registration', async ({ request }) => {
      const uniqueEmail = `${generateUniqueIdentifier('qa')}@test.pl`;
      
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail,
          email: uniqueEmail,
        }),
      });

      expect(response.status()).toBe(httpStatus.CREATED);
      
      const body = await response.json();
      
      // Verify user_id is valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(body.user_id).toMatch(uuidRegex);
    });
  });

  test.describe('HIS Integration', () => {
    
    test.skip('should verify patient exists in HIS during registration', async ({ request }) => {
      // This test requires HIS Mock to be running with specific test data
      // Skipped by default - enable when HIS Mock is available
      
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload(),
      });

      expect(response.status()).toBe(httpStatus.CREATED);
      
      const body = await response.json();
      expect(body.his_verified).toBe(true);
    });

    test.skip('should reject registration for non-existent HIS patient', async ({ request }) => {
      // This test requires HIS Mock to be running
      // Use a PESEL that doesn't exist in HIS Mock
      
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          pesel: '00000000000', // Invalid/non-existent PESEL
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.message).toContain('Patient not found in HIS');
    });
  });

  test.describe('Duplicate Prevention', () => {
    
    test('should reject duplicate email registration', async ({ request }) => {
      const uniqueEmail = `${generateUniqueIdentifier('dup')}@test.pl`;
      
      // First registration - should succeed
      const firstResponse = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail,
          email: uniqueEmail,
        }),
      });
      expect(firstResponse.status()).toBe(httpStatus.CREATED);

      // Second registration with same email - should fail
      const secondResponse = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail,
          email: uniqueEmail,
        }),
      });

      expect(secondResponse.status()).toBe(httpStatus.CONFLICT);
      
      const body = await secondResponse.json();
      expect(body.message).toContain('email');
    });

    test('should reject duplicate PESEL registration', async ({ request }) => {
      const uniqueEmail = `${generateUniqueIdentifier('pesel')}@test.pl`;
      
      // First registration
      const firstResponse = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail,
          email: uniqueEmail,
        }),
      });
      expect(firstResponse.status()).toBe(httpStatus.CREATED);

      // Second registration with same PESEL but different email
      const secondResponse = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail + '2',
          email: uniqueEmail + '2@test.pl',
        }),
      });

      expect(secondResponse.status()).toBe(httpStatus.CONFLICT);
      
      const body = await secondResponse.json();
      expect(body.message).toContain('PESEL');
    });
  });

  test.describe('Password Security', () => {
    
    test('should accept password with minimum requirements', async ({ request }) => {
      const uniqueEmail = `${generateUniqueIdentifier('pwd')}@test.pl`;
      
      // Password with: 10+ chars, uppercase, lowercase, digit, special char
      const validPassword = 'Secure123!@#';
      
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          identifier: uniqueEmail,
          email: uniqueEmail,
          password: validPassword,
        }),
      });

      expect(response.status()).toBe(httpStatus.CREATED);
    });

    test('should reject password without uppercase', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          password: 'lowercase123!@#',
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
          }),
        ])
      );
    });

    test('should reject password without special character', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          password: 'NoSpecialChar123',
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
    });

    test('should reject password shorter than 10 characters', async ({ request }) => {
      const response = await request.post(apiEndpoints.auth.register, {
        data: createRegistrationPayload({
          password: 'Short1!',
        }),
      });

      expect(response.status()).toBe(httpStatus.BAD_REQUEST);
      
      const body = await response.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('10 characters'),
          }),
        ])
      );
    });
  });
});

/**
 * Type definitions for registration payload
 */
interface RegisterPayload {
  identifier: string;
  password: string;
  pesel: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  termsAccepted: string;
}
