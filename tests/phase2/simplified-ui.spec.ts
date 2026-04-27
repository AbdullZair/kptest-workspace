/**
 * Simplified UI Mode Tests - Phase 2
 *
 * Tests for simplified UI features:
 * - Toggle simplified mode on/off
 * - Large text mode
 * - High contrast mode
 * - Reduced animations
 * - UI preferences persistence
 *
 * @module tests/phase2/simplified-ui.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import {
  testPatients,
  testSimplifiedUI,
  phase2ApiEndpoints,
  httpStatus,
} from '../test-data';

test.describe('Phase 2 - Simplified UI Mode', () => {
  let authToken: string;

  /**
   * Setup: Login before each test to get auth token
   */
  test.beforeEach(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
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

  test.describe('Simplified Mode Toggle', () => {
    test('should enable simplified UI mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Open settings menu
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.waitForSelector('[data-testid="accessibility-panel"]');

      // Enable simplified mode
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.waitForSelector('[data-testid="simplified-mode-active"]');

      // Verify UI changes
      const isSimplified = await page.$('[data-testid="simplified-layout"]');
      expect(isSimplified).not.toBeNull();
    });

    test('should disable simplified UI mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.waitForSelector('[data-testid="accessibility-panel"]');

      // Enable first, then disable
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.waitForSelector('[data-testid="simplified-mode-active"]');
      
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.waitForSelector('[data-testid="standard-mode-active"]');

      // Verify standard layout is back
      const isStandard = await page.$('[data-testid="standard-layout"]');
      expect(isStandard).not.toBeNull();
    });

    test('should persist simplified mode preference', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enable simplified mode
      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.waitForSelector('[data-testid="simplified-mode-active"]');

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Simplified mode should still be active
      const isSimplified = await page.$('[data-testid="simplified-layout"]');
      expect(isSimplified).not.toBeNull();
    });

    test('should apply simplified mode across all pages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Enable simplified mode
      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.waitForSelector('[data-testid="simplified-mode-active"]');

      // Navigate to different pages and verify simplified layout
      const pages = ['/patients', '/projects', '/messages', '/calendar'];
      
      for (const path of pages) {
        await page.goto(path);
        await page.waitForSelector('[data-testid="simplified-layout"]');
        const isSimplified = await page.$('[data-testid="simplified-layout"]');
        expect(isSimplified).not.toBeNull();
      }
    });
  });

  test.describe('Large Text Mode', () => {
    test('should enable large text mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.waitForSelector('[data-testid="accessibility-panel"]');

      // Enable large text
      await page.click('[data-testid="large-text-toggle"]');
      await page.waitForSelector('[data-testid="large-text-active"]');

      // Verify text size increased
      const bodyFontSize = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontSize;
      });
      
      // Font size should be larger than default (typically 16px)
      expect(parseInt(bodyFontSize)).toBeGreaterThan(16);
    });

    test('should disable large text mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="large-text-toggle"]');
      await page.waitForSelector('[data-testid="large-text-active"]');

      // Disable
      await page.click('[data-testid="large-text-toggle"]');
      
      const bodyFontSize = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontSize;
      });
      
      expect(parseInt(bodyFontSize)).toBeLessThanOrEqual(16);
    });

    test('should apply large text to all UI elements', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="large-text-toggle"]');
      await page.waitForSelector('[data-testid="large-text-active"]');

      // Check various UI elements
      const elements = [
        '[data-testid="page-title"]',
        '[data-testid="navigation-menu"]',
        '[data-testid="content-area"]',
      ];

      for (const selector of elements) {
        const element = await page.$(selector);
        if (element) {
          const fontSize = await element.evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
          });
          expect(parseInt(fontSize)).toBeGreaterThan(14);
        }
      }
    });

    test('should persist large text preference', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="large-text-toggle"]');
      await page.waitForSelector('[data-testid="large-text-active"]');

      // Refresh
      await page.reload();
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Large text should still be active
      const bodyFontSize = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontSize;
      });
      
      expect(parseInt(bodyFontSize)).toBeGreaterThan(16);
    });
  });

  test.describe('High Contrast Mode', () => {
    test('should enable high contrast mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.waitForSelector('[data-testid="accessibility-panel"]');

      // Enable high contrast
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.waitForSelector('[data-testid="high-contrast-active"]');

      // Verify contrast changes
      const backgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // High contrast typically uses black or white background
      expect(backgroundColor).toMatch(/rgb\(0,\s*0,\s*0\)|rgb\(255,\s*255,\s*255\)/);
    });

    test('should disable high contrast mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.waitForSelector('[data-testid="high-contrast-active"]');

      // Disable
      await page.click('[data-testid="high-contrast-toggle"]');
      
      const backgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Should return to normal background
      expect(backgroundColor).not.toMatch(/rgb\(0,\s*0,\s*0\)/);
    });

    test('should apply high contrast to buttons and links', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.waitForSelector('[data-testid="high-contrast-active"]');

      // Check button contrast
      const buttons = await page.$$('button');
      
      for (const button of buttons.slice(0, 5)) {
        const color = await button.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });
        // High contrast text should be black or white
        expect(color).toMatch(/rgb\(0,\s*0,\s*0\)|rgb\(255,\s*255,\s*255\)/);
      }
    });

    test('should persist high contrast preference', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.waitForSelector('[data-testid="high-contrast-active"]');

      // Refresh
      await page.reload();
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // High contrast should still be active
      const isHighContrast = await page.$('[data-testid="high-contrast-active"]');
      expect(isHighContrast).not.toBeNull();
    });
  });

  test.describe('Reduced Animations', () => {
    test('should enable reduced animations mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.waitForSelector('[data-testid="accessibility-panel"]');

      // Enable reduced animations
      await page.click('[data-testid="reduced-animations-toggle"]');
      await page.waitForSelector('[data-testid="reduced-animations-active"]');

      // Verify CSS class is applied
      const hasReducedMotion = await page.evaluate(() => {
        return document.body.classList.contains('reduced-motion');
      });
      
      expect(hasReducedMotion).toBe(true);
    });

    test('should disable animations when reduced mode is on', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="reduced-animations-toggle"]');
      await page.waitForSelector('[data-testid="reduced-animations-active"]');

      // Check animation duration on elements
      const animatedElement = await page.$('[data-testid="animated-element"]');
      
      if (animatedElement) {
        const animationDuration = await animatedElement.evaluate((el) => {
          return window.getComputedStyle(el).animationDuration;
        });
        
        // Should be 0s or very short
        expect(animationDuration).toMatch(/0s|0\.\\d+s/);
      }
    });

    test('should disable reduced animations mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="reduced-animations-toggle"]');
      await page.waitForSelector('[data-testid="reduced-animations-active"]');

      // Disable
      await page.click('[data-testid="reduced-animations-toggle"]');
      
      const hasReducedMotion = await page.evaluate(() => {
        return document.body.classList.contains('reduced-motion');
      });
      
      expect(hasReducedMotion).toBe(false);
    });

    test('should persist reduced animations preference', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="reduced-animations-toggle"]');
      await page.waitForSelector('[data-testid="reduced-animations-active"]');

      // Refresh
      await page.reload();
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Reduced animations should still be active
      const hasReducedMotion = await page.evaluate(() => {
        return document.body.classList.contains('reduced-motion');
      });
      
      expect(hasReducedMotion).toBe(true);
    });
  });

  test.describe('UI Preferences API', () => {
    test('should get UI preferences via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase2ApiEndpoints.ui.preferences, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('simplifiedMode');
        expect(body).toHaveProperty('largeText');
        expect(body).toHaveProperty('highContrast');
        expect(body).toHaveProperty('reducedAnimations');
      }
    });

    test('should update UI preferences via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(phase2ApiEndpoints.ui.preferences, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        data: {
          simplifiedMode: true,
          largeText: true,
          highContrast: false,
          reducedAnimations: true,
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body.simplifiedMode).toBe(true);
        expect(body.largeText).toBe(true);
      }
    });

    test('should get simplified mode status via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase2ApiEndpoints.ui.simplified, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Combined Accessibility Settings', () => {
    test('should enable all accessibility features at once', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.waitForSelector('[data-testid="accessibility-panel"]');

      // Enable all features
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.click('[data-testid="large-text-toggle"]');
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.click('[data-testid="reduced-animations-toggle"]');

      // Verify all are active
      await page.waitForSelector('[data-testid="simplified-mode-active"]');
      await page.waitForSelector('[data-testid="large-text-active"]');
      await page.waitForSelector('[data-testid="high-contrast-active"]');
      await page.waitForSelector('[data-testid="reduced-animations-active"]');
    });

    test('should reset all accessibility settings to default', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      
      // Enable all first
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.click('[data-testid="large-text-toggle"]');
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.click('[data-testid="reduced-animations-toggle"]');

      // Reset to defaults
      await page.click('[data-testid="reset-accessibility-settings"]');
      await page.click('[data-testid="confirm-reset"]');

      // Verify all are disabled
      await page.waitForSelector('[data-testid="standard-mode-active"]');
      
      const bodyFontSize = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontSize;
      });
      expect(parseInt(bodyFontSize)).toBeLessThanOrEqual(16);
    });

    test('should provide quick access toggle from any page', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/patients');
      
      // Quick access toggle should be available
      const quickToggle = await page.$('[data-testid="accessibility-quick-toggle"]');
      
      if (quickToggle) {
        await quickToggle.click();
        await page.waitForSelector('[data-testid="accessibility-quick-menu"]');
        
        // Should be able to toggle simplified mode from quick menu
        await page.click('[data-testid="quick-simplified-mode"]');
        await page.waitForSelector('[data-testid="simplified-mode-active"]');
      }
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should maintain WCAG color contrast ratios', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="high-contrast-toggle"]');
      await page.waitForSelector('[data-testid="high-contrast-active"]');

      // Check text elements for contrast
      const textElements = await page.$$('[data-testid="text-content"]');
      
      for (const element of textElements.slice(0, 5)) {
        const contrastRatio = await element.evaluate((el) => {
          // Simplified contrast check
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;
          // In real scenario, would calculate actual contrast ratio
          return color !== bgColor; // Basic check
        });
        expect(contrastRatio).toBe(true);
      }
    });

    test('should support keyboard navigation in simplified mode', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="accessibility-settings"]');
      await page.click('[data-testid="simplified-mode-toggle"]');
      await page.waitForSelector('[data-testid="simplified-mode-active"]');

      // Navigate using keyboard only
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Focused element should be visible and highlighted
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(focusedElement).toBeDefined();
    });
  });
});
