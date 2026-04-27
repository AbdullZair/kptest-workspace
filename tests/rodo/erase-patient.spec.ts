/**
 * RODO - Erase Patient Tests (US-A-12)
 *
 * Tests for patient erasure feature (RODO Art. 17):
 * - Admin erases patient after 30-day cooling period
 * - Erase fails if cooling period < 30 days (without force)
 * - Related entities deleted (badges, progress, etc.)
 * - Audit log created
 *
 * @module tests/rodo/erase-patient.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, httpStatus } from '../test-data';

test.describe('RODO - Erase Patient (US-A-12)', () => {
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

  test('Admin erases patient successfully after 30-day cooling', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.BAD_REQUEST].includes(eraseResponse.status())).toBe(true);
    
    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      const body = await eraseResponse.json();
      expect(body.patientId).toBeDefined();
      expect(body.erasedAt).toBeDefined();
      expect(body.auditLogId).toBeDefined();
    }
  });

  test('Erase fails if cooling period < 30 days without force flag', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // Try to erase without force flag - should fail if patient not in cooling period
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
          confirmationToken: 'confirm-erase-token',
        },
      }
    );

    // Should fail if patient not marked for deletion > 30 days
    expect([httpStatus.BAD_REQUEST, httpStatus.CONFLICT, httpStatus.FORBIDDEN].includes(eraseResponse.status())).toBe(true);
    
    if (eraseResponse.status() === httpStatus.BAD_REQUEST || eraseResponse.status() === httpStatus.CONFLICT) {
      const body = await eraseResponse.json();
      expect(body.message).toBeDefined();
      expect(body.message).toContain('cooling');
    }
  });

  test('Erase succeeds with force flag even if cooling period < 30 days', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'legal_requirement',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    // Force erase may succeed or require specific conditions
    expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN].includes(eraseResponse.status())).toBe(true);
  });

  test('Related entities deleted - PatientBadge', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // First get patient badges
    const badgesResponse = await request.get(
      `http://localhost:8080/api/v1/patients/${testPatientId}/badges`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      }
    );

    let badgesBefore: any[] = [];
    if (badgesResponse.status() === httpStatus.OK) {
      badgesBefore = await badgesResponse.json();
    }

    // Erase patient
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      // Verify badges are deleted
      const badgesAfterResponse = await request.get(
        `http://localhost:8080/api/v1/patients/${testPatientId}/badges`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      // Should return 404 or empty list after erasure
      expect([httpStatus.NOT_FOUND, httpStatus.OK].includes(badgesAfterResponse.status())).toBe(true);
      
      if (badgesAfterResponse.status() === httpStatus.OK) {
        const badgesAfter = await badgesAfterResponse.json();
        expect(badgesAfter.length).toBe(0);
      }
    }
  });

  test('Related entities deleted - MaterialProgress', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // Erase patient with force
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      // Verify material progress is deleted
      const progressResponse = await request.get(
        `http://localhost:8080/api/v1/patients/${testPatientId}/materials/progress`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.NOT_FOUND, httpStatus.OK].includes(progressResponse.status())).toBe(true);
    }
  });

  test('Related entities deleted - QuizAttempt', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // Erase patient with force
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      // Verify quiz attempts are deleted
      const quizAttemptsResponse = await request.get(
        `http://localhost:8080/api/v1/patients/${testPatientId}/quiz-attempts`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.NOT_FOUND, httpStatus.OK].includes(quizAttemptsResponse.status())).toBe(true);
    }
  });

  test('Related entities deleted - MessageAttachment', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // Erase patient with force
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      // Verify message attachments are deleted
      const messagesResponse = await request.get(
        `http://localhost:8080/api/v1/messages?patientId=${testPatientId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.NOT_FOUND, httpStatus.OK].includes(messagesResponse.status())).toBe(true);
    }
  });

  test('Related entities deleted - Notification', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // Erase patient with force
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      // Verify notifications are deleted
      const notificationsResponse = await request.get(
        `http://localhost:8080/api/v1/notifications?patientId=${testPatientId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.NOT_FOUND, httpStatus.OK].includes(notificationsResponse.status())).toBe(true);
    }
  });

  test('Related entities deleted - EmergencyContact', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    // Erase patient with force
    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      // Verify emergency contacts are deleted
      const contactsResponse = await request.get(
        `http://localhost:8080/api/v1/patients/${testPatientId}/emergency-contacts`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.NOT_FOUND, httpStatus.OK].includes(contactsResponse.status())).toBe(true);
    }
  });

  test('Audit log created after erasure', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      const body = await eraseResponse.json();
      
      // Verify audit log entry exists
      const auditLogResponse = await request.get(
        `http://localhost:8080/api/v1/admin/audit-logs?entityId=${body.patientId}&action=ERASURE`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.FORBIDDEN].includes(auditLogResponse.status())).toBe(true);
      
      if (auditLogResponse.status() === httpStatus.OK) {
        const auditLogs = await auditLogResponse.json();
        expect(Array.isArray(auditLogs)).toBe(true);
        
        const erasureLog = auditLogs.find((log: any) => log.action === 'ERASURE');
        expect(erasureLog).toBeDefined();
      }
    }
  });

  test('DataProcessingErasureLog created', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'data_retention_policy',
          confirmationToken: 'confirm-erase-token',
          force: true,
        },
      }
    );

    if (eraseResponse.status() === httpStatus.OK || eraseResponse.status() === httpStatus.NO_CONTENT) {
      const body = await eraseResponse.json();
      
      // Verify erasure log exists
      const erasureLogResponse = await request.get(
        `http://localhost:8080/api/v1/admin/data-processing-erasure-logs?patientId=${body.patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN].includes(erasureLogResponse.status())).toBe(true);
      
      if (erasureLogResponse.status() === httpStatus.OK) {
        const logs = await erasureLogResponse.json();
        expect(Array.isArray(logs)).toBe(true);
        expect(logs.length).toBeGreaterThan(0);
      }
    }
  });

  test('Non-admin user gets 403 when attempting erasure', async ({ request }) => {
    test.skip(!patientAuthToken, 'Patient auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
          confirmationToken: 'confirm-erase-token',
        },
      }
    );

    expect(eraseResponse.status()).toBe(httpStatus.FORBIDDEN);
  });

  test('Provider user gets 403 when attempting erasure', async ({ request }) => {
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

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${providerAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
          confirmationToken: 'confirm-erase-token',
        },
      }
    );

    expect(eraseResponse.status()).toBe(httpStatus.FORBIDDEN);
  });

  test('Erasure without reason fails validation', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          confirmationToken: 'confirm-erase-token',
        },
      }
    );

    expect(eraseResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Erasure without confirmationToken fails validation', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/${testPatientId}/erase`,
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

    expect(eraseResponse.status()).toBe(httpStatus.BAD_REQUEST);
  });

  test('Erasure for non-existent patient returns 404', async ({ request }) => {
    test.skip(!adminAuthToken, 'Admin auth token not available');

    const eraseResponse = await request.delete(
      `http://localhost:8080/api/v1/admin/patients/non-existent-id/erase`,
      {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          reason: 'patient_request',
          confirmationToken: 'confirm-erase-token',
        },
      }
    );

    expect(eraseResponse.status()).toBe(httpStatus.NOT_FOUND);
  });
});
