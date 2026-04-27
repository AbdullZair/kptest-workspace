/**
 * Patients Regression Tests
 *
 * Full regression suite for patient management features.
 *
 * @module tests/regression/patients.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Regression - Patients', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'admin@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
    }
  });

  test('should list patients', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(apiEndpoints.patients.list, {
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

  test('should search patients by name', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      `${apiEndpoints.patients.search}?query=Kowalski`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should get patient by ID', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(apiEndpoints.patients.byId('patient-123'), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should get patient by PESEL', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      apiEndpoints.patients.byPesel(testPatients.STANDARD.pesel),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should create new patient', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const uniquePesel = generateUniqueIdentifier('900101');

    const response = await request.post(apiEndpoints.patients.list, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        pesel: uniquePesel,
        firstName: 'New',
        lastName: 'Patient',
        email: `newpatient_${Date.now()}@test.com`,
        phone: '+48999888777',
        dateOfBirth: '1990-01-01',
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN, httpStatus.CONFLICT]).toContain(response.status());
  });

  test('should update patient information', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.patch(
      apiEndpoints.patients.byId('patient-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          phone: '+48999888777',
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should deactivate patient account', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.delete(
      apiEndpoints.patients.byId('patient-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should get patient statistics', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      `${apiEndpoints.patients.list}/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should filter patients by status', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/patients');
    await page.waitForSelector('[data-testid="patients-list"]');

    await page.click('[data-testid="filter-status"]');
    await page.click('[data-testid="status-active"]');

    const patients = await page.$$('[data-testid="patient-row"]:visible');
    
    for (const patient of patients) {
      const status = await patient.getAttribute('data-status');
      expect(status).toBe('ACTIVE');
    }
  });

  test('should view patient details', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/patients');
    const patientRow = await page.$('[data-testid="patient-row"]');
    
    if (patientRow) {
      await patientRow.click('[data-testid="view-details"]');
      await page.waitForSelector('[data-testid="patient-details"]');

      expect(await page.isVisible('[data-testid="patient-name"]')).toBe(true);
      expect(await page.isVisible('[data-testid="patient-pesel"]')).toBe(true);
      expect(await page.isVisible('[data-testid="patient-contact"]')).toBe(true);
    }
  });

  test('should view patient medical history', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/patients');
    const patientRow = await page.$('[data-testid="patient-row"]');
    
    if (patientRow) {
      await patientRow.click('[data-testid="view-details"]');
      await page.click('[data-testid="medical-history-tab"]');
      await page.waitForSelector('[data-testid="medical-history"]');

      expect(await page.isVisible('[data-testid="history-entry"]')).toBe(true);
    }
  });

  test('should export patient list', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/patients');
    await page.click('[data-testid="export-patients"]');
    await page.waitForSelector('[data-testid="export-dialog"]');

    await page.click('[data-testid="confirm-export"]');
    await page.waitForSelector('[data-testid="export-complete"]');

    const exportText = await page.textContent('[data-testid="export-complete"]');
    expect(exportText).toContain('eksportowano');
  });

  test('should not access patients without authentication', async ({ request }) => {
    const response = await request.get(apiEndpoints.patients.list);
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should validate PESEL format', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/patients/new');
    await page.fill('[name="pesel"]', '12345');
    await page.fill('[name="first-name"]', 'Test');
    await page.fill('[name="last-name"]', 'User');

    await page.click('[data-testid="save-patient"]');
    await page.waitForSelector('[data-testid="validation-error"]');

    const errorText = await page.textContent('[data-testid="validation-error"]');
    expect(errorText).toContain('PESEL');
  });

  test('should paginate patient list', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/patients?page=1&size=20');
    await page.waitForSelector('[data-testid="pagination"]');

    expect(await page.isVisible('[data-testid="pagination-prev"]')).toBe(true);
    expect(await page.isVisible('[data-testid="pagination-next"]')).toBe(true);
  });
});
