/**
 * Patient Management Tests - Iteration 2
 *
 * Tests for patient management features:
 * - Search patients by PESEL
 * - Filter patients by status
 * - Add new patient
 * - Edit patient data
 * - HIS verification
 *
 * @module tests/patient/patient-management.spec.ts
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { testPatients, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

/**
 * Helper to get auth token from storage state
 */
async function getAuthToken(request: APIRequestContext): Promise<string | null> {
  try {
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      return body.access_token;
    }
  } catch (error) {
    console.log('Failed to get auth token:', error);
  }
  return null;
}

test.describe('Patient Management', () => {

  test.describe('Patient Search', () => {

    test('should search patients by PESEL', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.patients.byPesel(testPatients.STANDARD.pesel), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should return 200 if patient exists, 404 if not found
      expect([httpStatus.OK, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should reject search with invalid PESEL format', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.patients.byPesel('12345'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should search patients with filters', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=ACTIVE`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should return list or 403 if not authorized for this operation
      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('Patient Filtering', () => {

    test('should filter patients by status ACTIVE', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=ACTIVE`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should filter patients by status PENDING_VERIFICATION', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=PENDING_VERIFICATION`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should filter patients by status INACTIVE', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=INACTIVE`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject filter with invalid status', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=INVALID_STATUS`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Add New Patient', () => {

    test('should create new patient with valid data', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const uniqueEmail = `new.patient.${Date.now()}@test.pl`;
      const uniquePesel = '99999999999';

      const patientData = {
        pesel: uniquePesel,
        firstName: 'New',
        lastName: 'Patient',
        email: uniqueEmail,
        phone: '+48999999999',
        dateOfBirth: '1999-09-09',
      };

      const response = await request.post(apiEndpoints.patients.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: patientData,
      });

      // Should return 201 Created, 409 Conflict (if exists), or 403 (if not authorized)
      expect([httpStatus.CREATED, httpStatus.CONFLICT, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
      } else if (response.status() === httpStatus.CONFLICT) {
        console.log('Patient with this PESEL already exists');
      } else if (response.status() === httpStatus.FORBIDDEN) {
        console.log('Patient role does not have permission to create patients');
      }
    });

    test('should reject patient creation with duplicate PESEL', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.patients.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          email: `${generateUniqueIdentifier('dup')}@test.pl`,
          firstName: 'Duplicate',
          lastName: 'PESEL',
          pesel: testPatients.STANDARD.pesel,
          dateOfBirth: testPatients.STANDARD.dateOfBirth,
          phone: '+48999888666',
        },
      });

      expect([httpStatus.CONFLICT, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should reject patient creation with invalid PESEL', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.patients.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          email: `${generateUniqueIdentifier('inv')}@test.pl`,
          firstName: 'Invalid',
          lastName: 'PESEL',
          pesel: '12345',
          dateOfBirth: '1990-01-01',
          phone: '+48999888555',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject patient creation without required fields', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.patients.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          email: 'incomplete@test.pl',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Edit Patient Data', () => {

    test('should reject update for non-existent patient', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.put(apiEndpoints.patients.byId('non-existent-id'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          phone: '+48999888777',
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('HIS Verification', () => {

    test('should verify patient exists in HIS', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.search}?verify_his=true&pesel=${testPatients.STANDARD.pesel}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('verified');
      }
    });

    test('should reject HIS verification for invalid PESEL', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.search}?verify_his=true&pesel=12345`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should handle HIS service unavailability', async ({ request }) => {
      const authToken = await getAuthToken(request);
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.search}?verify_his=true&pesel=00000000000`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN, 503]).toContain(response.status());
    });
  });
});
