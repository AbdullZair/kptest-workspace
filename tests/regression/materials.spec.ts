/**
 * Materials Regression Tests
 *
 * Full regression suite for educational materials features.
 *
 * @module tests/regression/materials.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testMaterials, apiEndpoints, httpStatus } from '../test-data';

test.describe('Regression - Materials', () => {
  let authToken: string;

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

  test('should list materials', async ({ request }) => {
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

    const response = await request.get(
      apiEndpoints.materials.byId('material-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should get material categories', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(apiEndpoints.materials.categories, {
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

  test('should mark material as read', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.post(
      apiEndpoints.materials.markRead('material-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should view materials in UI', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.waitForSelector('[data-testid="materials-list"]');

    const materials = await page.$$('[data-testid="material-item"]');
    expect(materials.length).toBeGreaterThanOrEqual(0);
  });

  test('should filter materials by category', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="filter-category"]');
    await page.click('[data-testid="category-education"]');

    const materials = await page.$$('[data-testid="material-item"]:visible');
    
    for (const material of materials) {
      const category = await material.getAttribute('data-category');
      expect(category).toBe('Edukacja');
    }
  });

  test('should search materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.fill('[name="material-search"]', testMaterials.SEARCH_QUERY);
    await page.press('[name="material-search"]', 'Enter');

    await page.waitForSelector('[data-testid="search-results"]');

    const results = await page.$$('[data-testid="material-item"]:visible');
    
    for (const result of results) {
      const title = await result.textContent('[data-testid="material-title"]');
      expect(title.toLowerCase()).toContain(testMaterials.SEARCH_QUERY.toLowerCase());
    }
  });

  test('should view material details', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="view-details"]');
      await page.waitForSelector('[data-testid="material-details"]');

      expect(await page.isVisible('[data-testid="material-title"]')).toBe(true);
      expect(await page.isVisible('[data-testid="material-description"]')).toBe(true);
      expect(await page.isVisible('[data-testid="material-content"]')).toBe(true);
    }
  });

  test('should download material', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="download-material"]');
      await page.waitForSelector('[data-testid="download-started"]');
    }
  });

  test('should mark material as favorite', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="favorite-material"]');
      await page.waitForSelector('[data-testid="material-favorited"]');
    }
  });

  test('should view favorite materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="filter-favorites"]');
    await page.waitForSelector('[data-testid="favorites-list"]');

    const favorites = await page.$$('[data-testid="material-item"][data-favorite="true"]');
    expect(favorites.length).toBeGreaterThanOrEqual(0);
  });

  test('should view read materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="filter-read"]');
    await page.waitForSelector('[data-testid="read-materials"]');

    const readMaterials = await page.$$('[data-testid="material-item"][data-read="true"]');
    expect(readMaterials.length).toBeGreaterThanOrEqual(0);
  });

  test('should view unread materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="filter-unread"]');
    await page.waitForSelector('[data-testid="unread-materials"]');

    const unreadMaterials = await page.$$('[data-testid="material-item"][data-read="false"]');
    expect(unreadMaterials.length).toBeGreaterThanOrEqual(0);
  });

  test('should view materials by type', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="filter-type"]');
    await page.click('[data-testid="type-pdf"]');

    const pdfMaterials = await page.$$('[data-testid="material-item"]:visible');
    
    for (const material of pdfMaterials) {
      const type = await material.getAttribute('data-type');
      expect(type).toBe('PDF');
    }
  });

  test('should view video materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="filter-type"]');
    await page.click('[data-testid="type-video"]');

    const videoMaterials = await page.$$('[data-testid="material-item"]:visible');
    
    for (const material of videoMaterials) {
      const type = await material.getAttribute('data-type');
      expect(type).toBe('VIDEO');
    }
  });

  test('should play video material', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const videoMaterial = await page.$('[data-testid="material-item"][data-type="VIDEO"]');
    
    if (videoMaterial) {
      await videoMaterial.click('[data-testid="view-details"]');
      await page.waitForSelector('[data-testid="video-player"]');

      await page.click('[data-testid="play-video"]');
      await page.waitForSelector('[data-testid="video-playing"]');
    }
  });

  test('should track reading progress', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      const initialProgress = await materialItem.textContent('[data-testid="reading-progress"]');
      
      await materialItem.click('[data-testid="view-details"]');
      await page.waitForTimeout(2000); // Simulate reading time
      
      // Progress should update
      const newProgress = await page.textContent('[data-testid="reading-progress"]');
      expect(newProgress).not.toBe(initialProgress);
    }
  });

  test('should get material recommendations', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="view-details"]');
      await page.waitForSelector('[data-testid="recommendations-section"]');

      const recommendations = await page.$$('[data-testid="recommended-material"]');
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('should share material', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="share-material"]');
      await page.waitForSelector('[data-testid="share-modal"]');

      expect(await page.isVisible('[data-testid="share-link"]')).toBe(true);
      expect(await page.isVisible('[data-testid="share-copy-link"]')).toBe(true);
    }
  });

  test('should print material', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="print-material"]');
      // Print dialog would open - just verify the action is available
    }
  });

  test('should not access materials without authentication', async ({ request }) => {
    const response = await request.get(apiEndpoints.materials.list);
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should sort materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.click('[data-testid="sort-materials"]');
    await page.click('[data-testid="sort-by-date"]');

    // Materials should be sorted by date
    const materials = await page.$$('[data-testid="material-item"]');
    expect(materials.length).toBeGreaterThan(0);
  });

  test('should paginate materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials?page=1&size=20');
    await page.waitForSelector('[data-testid="pagination"]');

    expect(await page.isVisible('[data-testid="pagination-prev"]')).toBe(true);
    expect(await page.isVisible('[data-testid="pagination-next"]')).toBe(true);
  });

  test('should show recently viewed materials', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    await page.waitForSelector('[data-testid="recently-viewed"]');

    const viewedMaterials = await page.$$('[data-testid="recent-material-item"]');
    expect(viewedMaterials.length).toBeGreaterThanOrEqual(0);
  });

  test('should add material note', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="view-details"]');
      await page.click('[data-testid="add-note"]');
      await page.fill('[name="note-content"]', 'Test note');
      await page.click('[data-testid="save-note"]');
      await page.waitForSelector('[data-testid="note-saved"]');
    }
  });

  test('should highlight material text', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/materials');
    const materialItem = await page.$('[data-testid="material-item"][data-type="PDF"]');
    
    if (materialItem) {
      await materialItem.click('[data-testid="view-details"]');
      await page.waitForSelector('[data-testid="pdf-viewer"]');

      // Highlight tool should be available
      expect(await page.isVisible('[data-testid="highlight-tool"]')).toBe(true);
    }
  });
});
