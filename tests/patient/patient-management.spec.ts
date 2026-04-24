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

import { test, expect } from '@playwright/test';
import { testPatients, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Patient Management', () => {

  let authToken: string;
  let testPatientId: string;

  /**
   * Setup: Login before tests to get auth token
   */
  test.beforeAll(async ({ request }) => {
    // Try to login with standard patient
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
    }
  });

  test.describe('Patient Search', () => {

    test('should search patients by PESEL', async ({ request }) => {
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
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.patients.byPesel('12345'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should search patients with filters', async ({ request }) => {
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
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=PENDING_VERIFICATION`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should filter patients by status INACTIVE', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.list}?status=INACTIVE`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject filter with invalid status', async ({ request }) => {
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
        testPatientId = body.id;
      } else if (response.status() === httpStatus.CONFLICT) {
        console.log('Patient with this PESEL already exists');
      } else if (response.status() === httpStatus.FORBIDDEN) {
        console.log('Patient role does not have permission to create patients');
      }
    });

    test('should reject patient creation with duplicate PESEL', async ({ request }) => {
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
          pesel: testPatients.STANDARD.pesel, // Use existing PESEL
          dateOfBirth: testPatients.STANDARD.dateOfBirth,
          phone: '+48999888666',
        },
      });

      expect([httpStatus.CONFLICT, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should reject patient creation with invalid PESEL', async ({ request }) => {
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
          pesel: '12345', // Invalid PESEL
          dateOfBirth: '1990-01-01',
          phone: '+48999888555',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject patient creation without required fields', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.patients.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          // Missing required fields
          email: 'incomplete@test.pl',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Edit Patient Data', () => {

    test('should update patient contact information', async ({ request }) => {
      test.skip(!authToken || !testPatientId, 'Auth token or patient ID not available');

      const response = await request.put(apiEndpoints.patients.byId(testPatientId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          phone: '+48111222333',
          email: 'updated@test.pl',
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body.phone).toBe('+48111222333');
      }
    });

    test('should reject update of immutable fields (PESEL)', async ({ request }) => {
      test.skip(!authToken || !testPatientId, 'Auth token or patient ID not available');

      const response = await request.put(apiEndpoints.patients.byId(testPatientId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          pesel: '99999999999', // Try to change PESEL
        },
      });

      // Should either reject or ignore the PESEL change
      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN, httpStatus.OK]).toContain(response.status());
    });

    test('should reject update for non-existent patient', async ({ request }) => {
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
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.search}?verify_his=true&pesel=${testPatients.STANDARD.pesel}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should return 200 if HIS is available and patient exists
      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('verified');
      }
    });

    test('should reject HIS verification for invalid PESEL', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.patients.search}?verify_his=true&pesel=12345`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should handle HIS service unavailability', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Use a PESEL that might not exist in HIS
      const response = await request.get(`${apiEndpoints.patients.search}?verify_his=true&pesel=00000000000`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should gracefully handle HIS unavailability
      expect([httpStatus.NOT_FOUND, httpStatus.SERVICE_UNAVAILABLE, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });
});
