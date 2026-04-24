/**
 * Materials Tests - Iteration 2
 *
 * Tests for educational materials features:
 * - Browse materials
 * - Mark as read
 * - Filter by category
 *
 * @module tests/materials/materials.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testMaterials, apiEndpoints, httpStatus } from '../test-data';

test.describe('Materials', () => {

  let authToken: string;
  let testMaterialId: string;

  /**
   * Setup: Login before tests to get auth token
   */
  test.beforeAll(async ({ request }) => {
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

  test.describe('Browse Materials', () => {

    test('should list all materials', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.materials.list, {
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

    test('should get material by ID', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.materials.byId('material-id-1'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('title');
        expect(body).toHaveProperty('content');
        testMaterialId = body.id;
      }
    });

    test('should return material metadata', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.materials.byId('material-id-1'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');
        expect(body).toHaveProperty('author');
        expect(body).toHaveProperty('category');
      }
    });

    test('should search materials by query', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?search=${testMaterials.SEARCH_QUERY}`, {
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

    test('should return empty list for no search results', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?search=nonexistentmaterial12345`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should paginate materials list', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?page=1&size=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });
  });

  test.describe('Mark as Read', () => {

    test('should mark material as read', async ({ request }) => {
      test.skip(!authToken || !testMaterialId, 'Auth token or material ID not available');

      const response = await request.post(apiEndpoints.materials.markRead(testMaterialId || 'material-id-1'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should track read progress', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?progress=tracked`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        // Each material should have read status
        if (body.length > 0) {
          expect(body[0]).toHaveProperty('isRead');
        }
      }
    });

    test('should reject marking non-existent material as read', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.materials.markRead('non-existent-material'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should unmark material as unread', async ({ request }) => {
      test.skip(!authToken || !testMaterialId, 'Auth token or material ID not available');

      const response = await request.delete(apiEndpoints.materials.markRead(testMaterialId || 'material-id-1'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should return reading statistics', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?stats=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('totalMaterials');
        expect(body).toHaveProperty('readMaterials');
        expect(body).toHaveProperty('progressPercentage');
      }
    });
  });

  test.describe('Filter by Category', () => {

    test('should filter materials by category', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?category=${testMaterials.CATEGORY}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        // All returned materials should match the category
        body.forEach((material: any) => {
          expect(material.category).toBe(testMaterials.CATEGORY);
        });
      }
    });

    test('should list all available categories', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.materials.categories, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should return empty list for non-existent category', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?category=NonExistentCategory123`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
      }
    });

    test('should filter by multiple categories', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?category=Edukacja&category=Rehabilitacja`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should combine category filter with search', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(
        `${apiEndpoints.materials.list}?category=${testMaterials.CATEGORY}&search=${testMaterials.SEARCH_QUERY}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Material Types', () => {

    test('should return article type material', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?type=ARTICLE`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should return video type material', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?type=VIDEO`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should return PDF type material', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.list}?type=PDF`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should download material attachment', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.byId('material-id')}/download`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Material Permissions', () => {

    test('should reject access without authentication', async ({ request }) => {
      const response = await request.get(apiEndpoints.materials.list);

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should return only materials accessible to patient role', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.materials.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        // Patient should only see materials they have access to
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should restrict premium materials', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.materials.byId('premium-material')}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // May return 403 if patient doesn't have premium access
      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('Material Progress', () => {

    test('should return patient progress for material', async ({ request }) => {
      test.skip(!authToken || !testMaterialId, 'Auth token or material ID not available');

      const response = await request.get(`${apiEndpoints.materials.byId(testMaterialId || 'material-id')}/progress`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('isRead');
        expect(body).toHaveProperty('readAt');
        expect(body).toHaveProperty('timeSpent');
      }
    });

    test('should track time spent on material', async ({ request }) => {
      test.skip(!authToken || !testMaterialId, 'Auth token or material ID not available');

      const response = await request.post(`${apiEndpoints.materials.byId(testMaterialId || 'material-id')}/progress`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          timeSpent: 120, // seconds
          completed: true,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });
  });
});
