/**
 * RODO - Data Processing Activities Tests (US-A-13)
 *
 * Tests for data processing registry (RODO Art. 30):
 * - CRUD operations for DataProcessingActivity
 * - Filter by legalBasis
 * - Non-admin user gets 403
 *
 * @module tests/rodo/data-processing-activities.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('RODO - Data Processing Activities (US-A-13)', () => {
  let adminAuthToken: string;
  let patientAuthToken: string;
  let createdActivityId: string;

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
    }
  });

  test.describe('Create DataProcessingActivity', () => {
    test('Admin creates DataProcessingActivity successfully', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const uniqueName = generateUniqueIdentifier('DPA');
      
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Test processing activity for E2E tests',
            legalBasis: 'CONSENT',
            categories: ['patient_data', 'medical_records'],
            recipients: ['internal_staff'],
            retentionPeriod: '5 years',
            securityMeasures: 'Encryption, access control, audit logging',
            dataController: 'KPTEST Sp. z o.o.',
            dataProcessor: null,
          },
        }
      );

      expect(createResponse.status()).toBe(httpStatus.CREATED);
      const body = await createResponse.json();
      expect(body.id).toBeDefined();
      expect(body.name).toBe(uniqueName);
      expect(body.legalBasis).toBe('CONSENT');
      
      createdActivityId = body.id;
    });

    test('Create with legalBasis CONTRACT', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const uniqueName = generateUniqueIdentifier('DPA-CONTRACT');
      
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Processing based on contract',
            legalBasis: 'CONTRACT',
            categories: ['user_accounts'],
            recipients: ['internal_staff'],
            retentionPeriod: 'contract duration + 3 years',
            securityMeasures: 'Standard security measures',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      expect(createResponse.status()).toBe(httpStatus.CREATED);
      const body = await createResponse.json();
      expect(body.legalBasis).toBe('CONTRACT');
    });

    test('Create with legalBasis LEGAL_OBLIGATION', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const uniqueName = generateUniqueIdentifier('DPA-LEGAL');
      
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Legal obligation compliance',
            legalBasis: 'LEGAL_OBLIGATION',
            categories: ['tax_records', 'audit_logs'],
            recipients: ['government_authorities'],
            retentionPeriod: '10 years',
            securityMeasures: 'Enhanced security',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      expect(createResponse.status()).toBe(httpStatus.CREATED);
      const body = await createResponse.json();
      expect(body.legalBasis).toBe('LEGAL_OBLIGATION');
    });

    test('Create with legalBasis LEGITIMATE_INTEREST', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const uniqueName = generateUniqueIdentifier('DPA-LEGITIMATE');
      
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Legitimate interest processing',
            legalBasis: 'LEGITIMATE_INTEREST',
            categories: ['analytics'],
            recipients: ['internal_analytics_team'],
            retentionPeriod: '2 years',
            securityMeasures: 'Standard security',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      expect(createResponse.status()).toBe(httpStatus.CREATED);
      const body = await createResponse.json();
      expect(body.legalBasis).toBe('LEGITIMATE_INTEREST');
    });

    test('Create without required fields fails validation', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            purpose: 'Missing name field',
          },
        }
      );

      expect(createResponse.status()).toBe(httpStatus.BAD_REQUEST);
    });

    test('Non-admin user gets 403 when creating activity', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${patientAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: 'Unauthorized Activity',
            purpose: 'This should fail',
            legalBasis: 'CONSENT',
          },
        }
      );

      expect(createResponse.status()).toBe(httpStatus.FORBIDDEN);
    });
  });

  test.describe('Read DataProcessingActivity', () => {
    test('Admin lists all DataProcessingActivities', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(listResponse.status()).toBe(httpStatus.OK);
      const body = await listResponse.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('Admin gets DataProcessingActivity by ID', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // First create an activity
      const uniqueName = generateUniqueIdentifier('DPA-GET');
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Test get by ID',
            legalBasis: 'CONSENT',
            categories: ['test_data'],
            recipients: ['test_recipients'],
            retentionPeriod: '1 year',
            securityMeasures: 'Test security',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      const created = await createResponse.json();
      const activityId = created.id;

      // Get by ID
      const getResponse = await request.get(
        `http://localhost:8080/api/v1/admin/data-processing-activities/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(getResponse.status()).toBe(httpStatus.OK);
      const body = await getResponse.json();
      expect(body.id).toBe(activityId);
      expect(body.name).toBe(uniqueName);
    });

    test('Get non-existent activity returns 404', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const getResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities/non-existent-id',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(getResponse.status()).toBe(httpStatus.NOT_FOUND);
    });

    test('Non-admin user gets 403 when listing activities', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${patientAuthToken}`,
          },
        }
      );

      expect(listResponse.status()).toBe(httpStatus.FORBIDDEN);
    });
  });

  test.describe('Filter DataProcessingActivity by legalBasis', () => {
    test('Filter activities by legalBasis CONSENT', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities?legalBasis=CONSENT',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(listResponse.status()).toBe(httpStatus.OK);
      const body = await listResponse.json();
      expect(Array.isArray(body)).toBe(true);
      
      for (const activity of body) {
        expect(activity.legalBasis).toBe('CONSENT');
      }
    });

    test('Filter activities by legalBasis CONTRACT', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities?legalBasis=CONTRACT',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(listResponse.status()).toBe(httpStatus.OK);
      const body = await listResponse.json();
      expect(Array.isArray(body)).toBe(true);
      
      for (const activity of body) {
        expect(activity.legalBasis).toBe('CONTRACT');
      }
    });

    test('Filter activities by legalBasis LEGAL_OBLIGATION', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities?legalBasis=LEGAL_OBLIGATION',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(listResponse.status()).toBe(httpStatus.OK);
      const body = await listResponse.json();
      expect(Array.isArray(body)).toBe(true);
      
      for (const activity of body) {
        expect(activity.legalBasis).toBe('LEGAL_OBLIGATION');
      }
    });

    test('Filter activities by legalBasis LEGITIMATE_INTEREST', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities?legalBasis=LEGITIMATE_INTEREST',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(listResponse.status()).toBe(httpStatus.OK);
      const body = await listResponse.json();
      expect(Array.isArray(body)).toBe(true);
      
      for (const activity of body) {
        expect(activity.legalBasis).toBe('LEGITIMATE_INTEREST');
      }
    });

    test('Filter by invalid legalBasis returns empty or error', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities?legalBasis=INVALID_BASIS',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.BAD_REQUEST].includes(listResponse.status())).toBe(true);
      
      if (listResponse.status() === httpStatus.OK) {
        const body = await listResponse.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
      }
    });
  });

  test.describe('Update DataProcessingActivity', () => {
    test('Admin updates DataProcessingActivity successfully', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // First create an activity
      const uniqueName = generateUniqueIdentifier('DPA-UPDATE');
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Original purpose',
            legalBasis: 'CONSENT',
            categories: ['original_category'],
            recipients: ['original_recipients'],
            retentionPeriod: '1 year',
            securityMeasures: 'Original security',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      const created = await createResponse.json();
      const activityId = created.id;

      // Update the activity
      const updateResponse = await request.put(
        `http://localhost:8080/api/v1/admin/data-processing-activities/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'Updated purpose',
            legalBasis: 'CONTRACT',
            categories: ['updated_category'],
            recipients: ['updated_recipients'],
            retentionPeriod: '2 years',
            securityMeasures: 'Updated security',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      expect(updateResponse.status()).toBe(httpStatus.OK);
      const body = await updateResponse.json();
      expect(body.id).toBe(activityId);
      expect(body.purpose).toBe('Updated purpose');
      expect(body.legalBasis).toBe('CONTRACT');
    });

    test('Update non-existent activity returns 404', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const updateResponse = await request.put(
        'http://localhost:8080/api/v1/admin/data-processing-activities/non-existent-id',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: 'Updated Name',
          },
        }
      );

      expect(updateResponse.status()).toBe(httpStatus.NOT_FOUND);
    });

    test('Non-admin user gets 403 when updating activity', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      const updateResponse = await request.put(
        'http://localhost:8080/api/v1/admin/data-processing-activities/some-id',
        {
          headers: {
            'Authorization': `Bearer ${patientAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: 'Unauthorized Update',
          },
        }
      );

      expect(updateResponse.status()).toBe(httpStatus.FORBIDDEN);
    });
  });

  test.describe('Delete DataProcessingActivity', () => {
    test('Admin deletes DataProcessingActivity successfully', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // First create an activity
      const uniqueName = generateUniqueIdentifier('DPA-DELETE');
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: uniqueName,
            purpose: 'To be deleted',
            legalBasis: 'CONSENT',
            categories: ['test'],
            recipients: ['test'],
            retentionPeriod: '1 year',
            securityMeasures: 'test',
            dataController: 'KPTEST Sp. z o.o.',
          },
        }
      );

      const created = await createResponse.json();
      const activityId = created.id;

      // Delete the activity
      const deleteResponse = await request.delete(
        `http://localhost:8080/api/v1/admin/data-processing-activities/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NO_CONTENT].includes(deleteResponse.status())).toBe(true);

      // Verify deletion
      const getResponse = await request.get(
        `http://localhost:8080/api/v1/admin/data-processing-activities/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(getResponse.status()).toBe(httpStatus.NOT_FOUND);
    });

    test('Delete non-existent activity returns 404', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const deleteResponse = await request.delete(
        'http://localhost:8080/api/v1/admin/data-processing-activities/non-existent-id',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(deleteResponse.status()).toBe(httpStatus.NOT_FOUND);
    });

    test('Non-admin user gets 403 when deleting activity', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      const deleteResponse = await request.delete(
        'http://localhost:8080/api/v1/admin/data-processing-activities/some-id',
        {
          headers: {
            'Authorization': `Bearer ${patientAuthToken}`,
          },
        }
      );

      expect(deleteResponse.status()).toBe(httpStatus.FORBIDDEN);
    });
  });

  test.describe('Provider user authorization', () => {
    test('Provider user gets 403 for all DPA operations', async ({ request }) => {
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

      // List
      const listResponse = await request.get(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${providerAuthToken}`,
          },
        }
      );
      expect(listResponse.status()).toBe(httpStatus.FORBIDDEN);

      // Create
      const createResponse = await request.post(
        'http://localhost:8080/api/v1/admin/data-processing-activities',
        {
          headers: {
            'Authorization': `Bearer ${providerAuthToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: 'Unauthorized',
            purpose: 'Test',
            legalBasis: 'CONSENT',
          },
        }
      );
      expect(createResponse.status()).toBe(httpStatus.FORBIDDEN);

      // Update
      const updateResponse = await request.put(
        'http://localhost:8080/api/v1/admin/data-processing-activities/some-id',
        {
          headers: {
            'Authorization': `Bearer ${providerAuthToken}`,
          },
        }
      );
      expect(updateResponse.status()).toBe(httpStatus.FORBIDDEN);

      // Delete
      const deleteResponse = await request.delete(
        'http://localhost:8080/api/v1/admin/data-processing-activities/some-id',
        {
          headers: {
            'Authorization': `Bearer ${providerAuthToken}`,
          },
        }
      );
      expect(deleteResponse.status()).toBe(httpStatus.FORBIDDEN);
    });
  });
});
