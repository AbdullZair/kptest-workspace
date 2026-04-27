/**
 * RODO - Export Patient Data Tests (US-A-11)
 *
 * Tests for patient data export feature (RODO Art. 20):
 * - Admin exports patient data as JSON
 * - Admin exports patient data as PDF
 * - Export contains all required sections
 * - Non-admin user gets 403
 *
 * @module tests/rodo/export-patient-data.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, httpStatus } from '../test-data';

test.describe('RODO - Export Patient Data (US-A-11)', () => {
  let adminAuthToken: string;
  let patientAuthToken: string;
  let testPatientId: string;

  /**
   * Setup: Login as admin and patient before each test
   */
  test.beforeEach(async ({ request }) => {
    // Login as admin
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.admin.email,
        password: testUsers.admin.password,
      },
    });

    if (adminLoginResponse.status() === httpStatus.OK) {
      const body = await adminLoginResponse.json();
      adminAuthToken = body.access_token;
    }

    // Login as patient
    const patientLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'patient1@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (patientLoginResponse.status() === httpStatus.OK) {
      const body = await patientLoginResponse.json();
      patientAuthToken = body.access_token;
      testPatientId = body.user_id || 'patient-123';
    }
  });

  test('Admin exports patient data as JSON', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    expect(exportResponse.headers()['content-type']).toContain('application/json');

    const body = await exportResponse.json();
    expect(body.patientId).toBeDefined();
    expect(body.exportedAt).toBeDefined();
    expect(body.data).toBeDefined();
  });

  test('Admin exports patient data as PDF', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=pdf`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    expect(exportResponse.headers()['content-type']).toContain('application/pdf');
    expect(exportResponse.headers()['content-disposition']).toContain('attachment');

    const body = await exportResponse.body();
    expect(body.length).toBeGreaterThan(0);
  });

  test('Export contains all required sections - personal data', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify personal data section
    expect(body.data).toHaveProperty('personalData');
    expect(body.data.personalData).toHaveProperty('pesel');
    expect(body.data.personalData).toHaveProperty('firstName');
    expect(body.data.personalData).toHaveProperty('lastName');
    expect(body.data.personalData).toHaveProperty('email');
    expect(body.data.personalData).toHaveProperty('phone');
    expect(body.data.personalData).toHaveProperty('dateOfBirth');
  });

  test('Export contains all required sections - projects', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify projects section exists
    expect(body.data).toHaveProperty('projects');
    expect(Array.isArray(body.data.projects)).toBe(true);
  });

  test('Export contains all required sections - messages', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify messages section exists
    expect(body.data).toHaveProperty('messages');
    expect(Array.isArray(body.data.messages)).toBe(true);
  });

  test('Export contains all required sections - materials read', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify materials section exists
    expect(body.data).toHaveProperty('materialsRead');
    expect(Array.isArray(body.data.materialsRead)).toBe(true);
  });

  test('Export contains all required sections - events', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify events section exists
    expect(body.data).toHaveProperty('events');
    expect(Array.isArray(body.data.events)).toBe(true);
  });

  test('Export contains all required sections - quiz attempts', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify quiz attempts section exists
    expect(body.data).toHaveProperty('quizAttempts');
    expect(Array.isArray(body.data.quizAttempts)).toBe(true);
  });

  test('Export contains all required sections - badges', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify badges section exists
    expect(body.data).toHaveProperty('badges');
    expect(Array.isArray(body.data.badges)).toBe(true);
  });

  test('Export contains audit log for patient', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.OK);
    const body = await exportResponse.json();

    // Verify audit log section exists
    expect(body.data).toHaveProperty('auditLog');
    expect(Array.isArray(body.data.auditLog)).toBe(true);
  });

  test('Non-admin user gets 403 when exporting patient data', async ({ request }) => {
    test.skip(!patientAuthToken, 'Patient auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.FORBIDDEN);
  });

  test('Provider user gets 403 when exporting patient data', async ({ request }) => {
    const providerLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'provider1@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (providerLoginResponse.status() !== httpStatus.OK) {
      test.skip();
      return;
    }

    const providerBody = await providerLoginResponse.json();
    const providerAuthToken = providerBody.access_token;

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${providerAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.FORBIDDEN);
  });

  test('Export with invalid format returns error', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/export-data?format=xml`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect([httpStatus.BAD_REQUEST, httpStatus.UNPROCESSABLE_ENTITY].includes(exportResponse.status())).toBe(true);
  });

  test('Export for non-existent patient returns 404', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const exportResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/non-existent-id/export-data?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(exportResponse.status()).toBe(httpStatus.NOT_FOUND);
  });
});
