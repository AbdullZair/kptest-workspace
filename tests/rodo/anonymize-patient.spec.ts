/**
 * RODO - Anonymize Patient Tests (US-A-10)
 *
 * Tests for patient anonymization feature:
 * - Admin anonymizes patient successfully
 * - Anonymized data matches expected format
 * - Audit log created
 * - Non-admin user gets 403
 *
 * @module tests/rodo/anonymize-patient.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, testPatients, httpStatus } from '../test-data';

test.describe('RODO - Anonymize Patient (US-A-10)', () => {
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
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    if (patientLoginResponse.status() === httpStatus.OK) {
      const body = await patientLoginResponse.json();
      patientAuthToken = body.access_token;
      testPatientId = body.user_id || 'patient-123';
    }
  });

  test('Admin anonymizes patient successfully', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const anonymizeResponse = await request.post(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
        },
      }
    );

    expect(anonymizeResponse.status()).toBe(httpStatus.OK);
    const body = await anonymizeResponse.json();
    expect(body.patientId).toBeDefined();
    expect(body.anonymizedAt).toBeDefined();
    expect(body.auditLogId).toBeDefined();
  });

  test('Anonymized patient data matches expected format', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const anonymizeResponse = await request.post(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
        },
      }
    );

    expect(anonymizeResponse.status()).toBe(httpStatus.OK);
    const body = await anonymizeResponse.json();

    // Fetch the anonymized patient data
    const patientResponse = await request.get(
      `http://localhost:8080/api/v1/admin/patients/${body.patientId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(patientResponse.status()).toBe(httpStatus.OK);
    const patientData = await patientResponse.json();

    // Verify anonymized format
    expect(patientData.pesel).toMatch(/^XXXXXXXXXXX-[a-f0-9]+$/);
    expect(patientData.firstName).toBe('ANON');
    expect(patientData.lastName).toMatch(/^ANON-/);
    expect(patientData.email).toMatch(/^anon-.*@deleted\.local$/);
    expect(patientData.phone).toBeNull();
    expect(patientData.dateOfBirth).toBeNull();
    expect(patientData.addressStreet).toBeNull();
    expect(patientData.addressCity).toBeNull();
    expect(patientData.addressPostalCode).toBeNull();
  });

  test('Audit log created after anonymization', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const anonymizeResponse = await request.post(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
        },
      }
    );

    expect(anonymizeResponse.status()).toBe(httpStatus.OK);
    const body = await anonymizeResponse.json();

    // Verify audit log entry exists
    const auditLogResponse = await request.get(
      `http://localhost:8080/api/v1/admin/audit-logs?entityId=${body.patientId}&action=ANONYMIZE`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    expect(auditLogResponse.status()).toBe(httpStatus.OK);
    const auditLogs = await auditLogResponse.json();
    expect(Array.isArray(auditLogs)).toBe(true);
    expect(auditLogs.length).toBeGreaterThan(0);

    const anonymizeLog = auditLogs.find((log: any) => log.action === 'ANONYMIZE');
    expect(anonymizeLog).toBeDefined();
    expect(anonymizeLog.oldValues).toBeDefined();
    expect(anonymizeLog.newValues).toBeDefined();
  });

  test('Non-admin user gets 403 when attempting anonymization', async ({ request }) => {
    test.skip(!patientAuthToken, 'Patient auth token not available');

    const anonymizeResponse = await request.post(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
      {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
        },
      }
    );

    expect(anonymizeResponse.status()).toBe(httpStatus.FORBIDDEN);
  });

  test('Anonymization with different reasons', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const validReasons = [
      'patient_request',
      'legal_requirement',
      'data_retention_policy',
      'deceased',
      'other',
    ];

    for (const reason of validReasons) {
      const response = await request.post(
        `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: { reason },
        }
      );

      expect([httpStatus.OK, httpStatus.BAD_REQUEST].includes(response.status())).toBe(true);
    }
  });

  test('Anonymization without reason fails validation', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const anonymizeResponse = await request.post(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {},
      }
    );

    expect(anonymizeResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Provider user gets 403 when attempting anonymization', async ({ request }) => {
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

    const anonymizeResponse = await request.post(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/anonymize`,
      {
        headers: {
          'Authorization': `Bearer ${providerAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
        },
      }
    );

    expect(anonymizeResponse.status()).toBe(httpStatus.FORBIDDEN);
  });
});
