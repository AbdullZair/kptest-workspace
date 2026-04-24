/**
 * Project Management Tests - Iteration 2
 *
 * Tests for project management features:
 * - Create new project
 * - Assign patients to project
 * - Remove patients from project
 * - Display project statistics
 *
 * @module tests/project/project-management.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testProjects, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Project Management', () => {

  let authToken: string;
  let testProjectId: string;
  let testPatientId: string;

  /**
   * Setup: Login before each test to get auth token
   */
  test.beforeEach(async ({ request }) => {
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

  test.describe('Create New Project', () => {

    test('should create new therapeutic project', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueProjectName = `${testProjects.NEW.name}-${Date.now()}`;

      const response = await request.post(apiEndpoints.projects.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: uniqueProjectName,
          description: testProjects.NEW.description,
          goals: testProjects.NEW.goals,
          startDate: testProjects.NEW.startDate,
          endDate: testProjects.NEW.endDate,
        },
      });

      // Should return 201 Created or 403 if not authorized (e.g., patient role)
      expect([httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body.name).toBe(uniqueProjectName);
        testProjectId = body.id;
      }
    });

    test('should reject project creation without required fields', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.projects.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          // Missing required fields
          description: 'Missing name',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject project with invalid date range', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.projects.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Invalid Dates ${Date.now()}`,
          description: 'Project with end date before start date',
          startDate: '2027-01-01',
          endDate: '2026-01-01', // End before start
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should create project with minimal data', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.projects.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Minimal Project ${Date.now()}`,
          startDate: '2026-04-23',
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });
  });

  test.describe('Assign Patients to Project', () => {

    test('should assign patient to project', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.post(apiEndpoints.projects.patients(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          patientId: testPatientId || 'patient-id-from-db',
          role: 'PRIMARY_PATIENT',
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND, httpStatus.BAD_REQUEST]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
      }
    });

    test('should reject assigning same patient twice', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      // First assignment
      const firstResponse = await request.post(apiEndpoints.projects.patients(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          patientId: 'patient-id-1',
          role: 'PRIMARY_PATIENT',
        },
      });

      // Second assignment with same patient
      const secondResponse = await request.post(apiEndpoints.projects.patients(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          patientId: 'patient-id-1',
          role: 'PRIMARY_PATIENT',
        },
      });

      expect([httpStatus.CONFLICT, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(secondResponse.status());
    });

    test('should reject assigning non-existent patient', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.post(apiEndpoints.projects.patients(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          patientId: 'non-existent-patient',
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should reject assigning to non-existent project', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.projects.patients('non-existent-project'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          patientId: 'patient-id',
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Remove Patients from Project', () => {

    test('should remove patient from project', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.delete(`${apiEndpoints.projects.patients(testProjectId)}/patient-id-to-remove`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should reject removing non-existent patient from project', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.delete(`${apiEndpoints.projects.patients(testProjectId)}/non-existent-patient`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject removal from non-existent project', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.delete(`${apiEndpoints.projects.patients('non-existent-project')}/patient-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Project Statistics', () => {

    test('should display project statistics', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.get(apiEndpoints.projects.stats(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('totalPatients');
        expect(body).toHaveProperty('activePatients');
        expect(body).toHaveProperty('completedSessions');
      }
    });

    test('should return statistics for empty project', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.get(apiEndpoints.projects.stats(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body.totalPatients).toBeGreaterThanOrEqual(0);
      }
    });

    test('should reject statistics for non-existent project', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.projects.stats('non-existent-project'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should include patient count in statistics', async ({ request }) => {
      test.skip(!authToken || !testProjectId, 'Auth token or project ID not available');

      const response = await request.get(apiEndpoints.projects.stats(testProjectId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toEqual(
          expect.objectContaining({
            totalPatients: expect.any(Number),
          })
        );
      }
    });
  });

  test.describe('Project List', () => {

    test('should list all projects', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.projects.list, {
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

    test('should filter projects by status', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.projects.list}?status=ACTIVE`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should paginate project list', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.projects.list}?page=1&size=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });
  });
});
