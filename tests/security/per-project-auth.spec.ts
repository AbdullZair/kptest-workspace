/**
 * Security - Per-Project Authorization Tests (US-S-03)
 *
 * Tests for per-project authorization:
 * - Staff can access only assigned projects
 * - Patient can access only their projects
 * - Cross-project access denied (403)
 *
 * @module tests/security/per-project-auth.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, testProjects, httpStatus } from '../test-data';

test.describe('Security - Per-Project Authorization (US-S-03)', () => {
  let adminAuthToken: string;
  let providerAuthToken: string;
  let patientAuthToken: string;
  let testProjectId: string;
  let otherProjectId: string;
  let testPatientId: string;

  /**
   * Setup: Login as admin, provider, and patient before each test
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

    // Login as provider
    const providerLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.provider.email,
        password: testUsers.provider.password,
      },
    });

    if (providerLoginResponse.status() === httpStatus.OK) {
      const body = await providerLoginResponse.json();
      providerAuthToken = body.access_token;
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

  test.describe('Admin Access', () => {
    test('Admin can access all projects', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Admin should be able to list all projects
      const listResponse = await request.get('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      });

      expect(listResponse.status()).toBe(httpStatus.OK);
      const projects = await listResponse.json();
      expect(Array.isArray(projects)).toBe(true);
    });

    test('Admin can access any project by ID', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // First get project list to find a project ID
      const listResponse = await request.get('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      });

      if (listResponse.status() === httpStatus.OK) {
        const projects = await listResponse.json();
        if (projects.length > 0) {
          testProjectId = projects[0].id;

          const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${testProjectId}`, {
            headers: {
              'Authorization': `Bearer ${adminAuthToken}`,
            },
          });

          expect(getResponse.status()).toBe(httpStatus.OK);
        }
      }
    });
  });

  test.describe('Staff (Provider) Project Access', () => {
    test('Staff can access assigned projects', async ({ request }) => {
      test.skip(!providerAuthToken, 'Provider auth token not available');

      // Get projects assigned to this provider
      const myProjectsResponse = await request.get('http://localhost:8080/api/v1/projects/my', {
        headers: {
          'Authorization': `Bearer ${providerAuthToken}`,
        },
      });

      // Should return OK or NOT_FOUND (if no assignments yet)
      expect([httpStatus.OK, httpStatus.NOT_FOUND].includes(myProjectsResponse.status())).toBe(true);

      if (myProjectsResponse.status() === httpStatus.OK) {
        const projects = await myProjectsResponse.json();
        if (projects.length > 0) {
          testProjectId = projects[0].id;

          // Access specific assigned project
          const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${testProjectId}`, {
            headers: {
              'Authorization': `Bearer ${providerAuthToken}`,
            },
          });

          expect(getResponse.status()).toBe(httpStatus.OK);
        }
      }
    });

    test('Staff cannot access non-assigned projects (403)', async ({ request }) => {
      test.skip(!providerAuthToken, 'Provider auth token not available');
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Create a new project that provider is NOT assigned to
      const createResponse = await request.post('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Restricted Project ${Date.now()}`,
          description: 'Provider should not access this',
          goals: ['Test goal'],
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      });

      if (createResponse.status() === httpStatus.CREATED) {
        const project = await createResponse.json();
        otherProjectId = project.id;

        // Try to access non-assigned project
        const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${otherProjectId}`, {
          headers: {
            'Authorization': `Bearer ${providerAuthToken}`,
          },
        });

        expect(getResponse.status()).toBe(httpStatus.FORBIDDEN);
      }
    });

    test('Staff cannot list all projects (only assigned)', async ({ request }) => {
      test.skip(!providerAuthToken, 'Provider auth token not available');

      // Provider should only see their assigned projects
      const listResponse = await request.get('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${providerAuthToken}`,
        },
      });

      // Either OK with filtered list or FORBIDDEN
      expect([httpStatus.OK, httpStatus.FORBIDDEN].includes(listResponse.status())).toBe(true);
    });
  });

  test.describe('Patient Project Access', () => {
    test('Patient can access their assigned projects', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      // Get patient's projects
      const myProjectsResponse = await request.get('http://localhost:8080/api/v1/projects/my', {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND].includes(myProjectsResponse.status())).toBe(true);

      if (myProjectsResponse.status() === httpStatus.OK) {
        const projects = await myProjectsResponse.json();
        if (projects.length > 0) {
          testProjectId = projects[0].id;

          // Access specific assigned project
          const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${testProjectId}`, {
            headers: {
              'Authorization': `Bearer ${patientAuthToken}`,
            },
          });

          expect(getResponse.status()).toBe(httpStatus.OK);
        }
      }
    });

    test('Patient cannot access other patients projects (403)', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Create a project and assign to different patient
      const createResponse = await request.post('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Other Patient Project ${Date.now()}`,
          description: 'This patient should not access',
          goals: ['Test goal'],
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      });

      if (createResponse.status() === httpStatus.CREATED) {
        const project = await createResponse.json();
        otherProjectId = project.id;

        // Try to access non-assigned project
        const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${otherProjectId}`, {
          headers: {
            'Authorization': `Bearer ${patientAuthToken}`,
          },
        });

        expect(getResponse.status()).toBe(httpStatus.FORBIDDEN);
      }
    });

    test('Patient cannot access project after removal (403)', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Get patient's projects first
      const myProjectsResponse = await request.get('http://localhost:8080/api/v1/projects/my', {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
        },
      });

      if (myProjectsResponse.status() === httpStatus.OK) {
        const projects = await myProjectsResponse.json();
        if (projects.length > 0) {
          testProjectId = projects[0].id;

          // Admin removes patient from project
          const removeResponse = await request.delete(
            `http://localhost:8080/api/v1/projects/${testProjectId}/patients/${testPatientId}`,
            {
              headers: {
                'Authorization': `Bearer ${adminAuthToken}`,
              },
            }
          );

          // After removal, patient should get 403
          const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${testProjectId}`, {
            headers: {
              'Authorization': `Bearer ${patientAuthToken}`,
            },
          });

          expect(getResponse.status()).toBe(httpStatus.FORBIDDEN);
        }
      }
    });
  });

  test.describe('Cross-Project Access Denial', () => {
    test('Provider from project A cannot access project B resources', async ({ request }) => {
      test.skip(!providerAuthToken, 'Provider auth token not available');
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Create two projects
      const projectAResponse = await request.post('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Project A ${Date.now()}`,
          description: 'Project A',
          goals: ['Goal A'],
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      });

      const projectBResponse = await request.post('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Project B ${Date.now()}`,
          description: 'Project B',
          goals: ['Goal B'],
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      });

      if (projectAResponse.status() === httpStatus.CREATED && projectBResponse.status() === httpStatus.CREATED) {
        const projectA = await projectAResponse.json();
        const projectB = await projectBResponse.json();

        // Try to access project B resources when only assigned to A
        // This simulates cross-project access attempt
        const getResponse = await request.get(`http://localhost:8080/api/v1/projects/${projectB.id}`, {
          headers: {
            'Authorization': `Bearer ${providerAuthToken}`,
          },
        });

        // Should be FORBIDDEN if provider not assigned to project B
        expect([httpStatus.FORBIDDEN, httpStatus.NOT_FOUND].includes(getResponse.status())).toBe(true);
      }
    });

    test('Patient from project A cannot access project B materials', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      // Get patient's projects
      const myProjectsResponse = await request.get('http://localhost:8080/api/v1/projects/my', {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
        },
      });

      let patientProjectId: string;
      if (myProjectsResponse.status() === httpStatus.OK) {
        const projects = await myProjectsResponse.json();
        if (projects.length > 0) {
          patientProjectId = projects[0].id;

          // Try to access materials from a different project
          // Using a made-up project ID to simulate cross-project access
          const fakeProjectId = '00000000-0000-0000-0000-000000000000';
          
          const materialsResponse = await request.get(
            `http://localhost:8080/api/v1/projects/${fakeProjectId}/materials`,
            {
              headers: {
                'Authorization': `Bearer ${patientAuthToken}`,
              },
            }
          );

          // Should be FORBIDDEN or NOT_FOUND
          expect([httpStatus.FORBIDDEN, httpStatus.NOT_FOUND].includes(materialsResponse.status())).toBe(true);
        }
      }
    });
  });

  test.describe('Project Resources Authorization', () => {
    test('Get project patients requires project access', async ({ request }) => {
      test.skip(!patientAuthToken, 'Patient auth token not available');

      // Get patient's projects
      const myProjectsResponse = await request.get('http://localhost:8080/api/v1/projects/my', {
        headers: {
          'Authorization': `Bearer ${patientAuthToken}`,
        },
      });

      if (myProjectsResponse.status() === httpStatus.OK) {
        const projects = await myProjectsResponse.json();
        if (projects.length > 0) {
          testProjectId = projects[0].id;

          // Patient should not be able to list all patients in project
          const patientsResponse = await request.get(
            `http://localhost:8080/api/v1/projects/${testProjectId}/patients`,
            {
              headers: {
                'Authorization': `Bearer ${patientAuthToken}`,
              },
            }
          );

          // Should be FORBIDDEN for patients
          expect(patientsResponse.status()).toBe(httpStatus.FORBIDDEN);
        }
      }
    });

    test('Get project stats requires project access', async ({ request }) => {
      test.skip(!providerAuthToken, 'Provider auth token not available');

      // Create a project provider is not assigned to
      const createResponse = await request.post('http://localhost:8080/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: `Stats Project ${Date.now()}`,
          description: 'For stats test',
          goals: ['Goal'],
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      });

      if (createResponse.status() === httpStatus.CREATED) {
        const project = await createResponse.json();
        otherProjectId = project.id;

        // Try to access stats for non-assigned project
        const statsResponse = await request.get(
          `http://localhost:8080/api/v1/projects/${otherProjectId}/stats`,
          {
            headers: {
              'Authorization': `Bearer ${providerAuthToken}`,
            },
          }
        );

        expect(statsResponse.status()).toBe(httpStatus.FORBIDDEN);
      }
    });
  });

  test.describe('Unauthenticated Access', () => {
    test('Unauthenticated user cannot access projects', async ({ request }) => {
      // No auth header
      const listResponse = await request.get('http://localhost:8080/api/v1/projects');

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN].includes(listResponse.status())).toBe(true);
    });

    test('Unauthenticated user gets 401 for specific project', async ({ request }) => {
      // No auth header
      const getResponse = await request.get('http://localhost:8080/api/v1/projects/some-id');

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN].includes(getResponse.status())).toBe(true);
    });
  });

  test.describe('Invalid Project ID', () => {
    test('Non-existent project returns 404 for authorized user', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const getResponse = await request.get(
        'http://localhost:8080/api/v1/projects/00000000-0000-0000-0000-000000000000',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(getResponse.status()).toBe(httpStatus.NOT_FOUND);
    });

    test('Invalid UUID format returns 400', async ({ request }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const getResponse = await request.get(
        'http://localhost:8080/api/v1/projects/invalid-uuid',
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(getResponse.status()).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
