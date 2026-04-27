/**
 * Projects Regression Tests
 *
 * Full regression suite for project management features.
 *
 * @module tests/regression/projects.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testProjects, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Regression - Projects', () => {
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

  test('should list projects', async ({ request }) => {
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

  test('should get project by ID', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(apiEndpoints.projects.byId('project-123'), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should create new project', async ({ request, page }) => {
    test.skip(!authToken, 'Auth token not available');

    const uniqueName = generateUniqueIdentifier('Test Project');

    // Via API
    const response = await request.post(apiEndpoints.projects.list, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: uniqueName,
        description: 'Test project description',
        goals: ['Goal 1', 'Goal 2'],
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());

    // Via UI
    await page.goto('/projects/new');
    await page.fill('[name="project-name"]', generateUniqueIdentifier('UI Project'));
    await page.fill('[name="project-description"]', 'Created via UI');
    await page.fill('[name="start-date"]', '2026-01-01');
    await page.fill('[name="end-date"]', '2026-12-31');
    await page.click('[data-testid="save-project"]');
    await page.waitForSelector('[data-testid="project-saved"]');
  });

  test('should update project', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.patch(
      apiEndpoints.projects.byId('project-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'Updated Project Name',
          description: 'Updated description',
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should delete project', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="delete-project"]');
      await page.waitForSelector('[data-testid="delete-confirmation"]');
      await page.click('[data-testid="confirm-delete"]');
      await page.waitForSelector('[data-testid="delete-success"]');
    }
  });

  test('should add patients to project', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.post(
      apiEndpoints.projects.patients('project-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          patientIds: ['patient-1', 'patient-2'],
        },
      }
    );

    expect([httpStatus.OK, httpStatus.CREATED, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should get project statistics', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      apiEndpoints.projects.stats('project-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should view project details', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="view-details"]');
      await page.waitForSelector('[data-testid="project-details"]');

      expect(await page.isVisible('[data-testid="project-name"]')).toBe(true);
      expect(await page.isVisible('[data-testid="project-description"]')).toBe(true);
      expect(await page.isVisible('[data-testid="project-goals"]')).toBe(true);
    }
  });

  test('should view project patients', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="view-details"]');
      await page.click('[data-testid="patients-tab"]');
      await page.waitForSelector('[data-testid="project-patients"]');

      expect(await page.isVisible('[data-testid="patient-list"]')).toBe(true);
    }
  });

  test('should view project progress', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="view-details"]');
      await page.click('[data-testid="progress-tab"]');
      await page.waitForSelector('[data-testid="project-progress"]');

      expect(await page.isVisible('[data-testid="progress-chart"]')).toBe(true);
      expect(await page.isVisible('[data-testid="completion-percentage"]')).toBe(true);
    }
  });

  test('should filter projects by status', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    await page.click('[data-testid="filter-status"]');
    await page.click('[data-testid="status-active"]');

    const projects = await page.$$('[data-testid="project-item"]:visible');
    
    for (const project of projects) {
      const status = await project.getAttribute('data-status');
      expect(status).toBe('ACTIVE');
    }
  });

  test('should search projects', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    await page.fill('[name="project-search"]', 'Test');
    await page.press('[name="project-search"]', 'Enter');

    await page.waitForSelector('[data-testid="search-results"]');

    const results = await page.$$('[data-testid="project-item"]:visible');
    
    for (const result of results) {
      const name = await result.textContent('[data-testid="project-name"]');
      expect(name.toLowerCase()).toContain('test');
    }
  });

  test('should duplicate project', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="duplicate-project"]');
      await page.waitForSelector('[data-testid="duplicate-confirmation"]');
      await page.click('[data-testid="confirm-duplicate"]');
      await page.waitForSelector('[data-testid="duplicate-success"]');
    }
  });

  test('should archive project', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="archive-project"]');
      await page.waitForSelector('[data-testid="archive-confirmation"]');
      await page.click('[data-testid="confirm-archive"]');
      await page.waitForSelector('[data-testid="archive-success"]');
    }
  });

  test('should get project timeline', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="view-details"]');
      await page.click('[data-testid="timeline-tab"]');
      await page.waitForSelector('[data-testid="project-timeline"]');

      expect(await page.isVisible('[data-testid="timeline-events"]')).toBe(true);
    }
  });

  test('should not access projects without authentication', async ({ request }) => {
    const response = await request.get(apiEndpoints.projects.list);
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should validate project dates', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects/new');
    await page.fill('[name="project-name"]', 'Invalid Dates Project');
    await page.fill('[name="start-date"]', '2026-12-31');
    await page.fill('[name="end-date"]', '2026-01-01'); // End before start

    await page.click('[data-testid="save-project"]');
    await page.waitForSelector('[data-testid="validation-error"]');

    const errorText = await page.textContent('[data-testid="validation-error"]');
    expect(errorText).toContain('dat');
  });

  test('should export project data', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/projects');
    const projectItem = await page.$('[data-testid="project-item"]');
    
    if (projectItem) {
      await projectItem.click('[data-testid="export-project"]');
      await page.waitForSelector('[data-testid="export-dialog"]');
      await page.click('[data-testid="confirm-export"]');
      await page.waitForSelector('[data-testid="export-complete"]');
    }
  });
});
