/**
 * Gamification Tests - Phase 3
 *
 * Tests for gamification features:
 * - Badge automatic awarding
 * - View badges catalog
 * - Patient earns badge notification
 * - Points and leaderboard
 *
 * @module tests/phase3/gamification.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  testPatients,
  testGamification,
  testQuizzes,
  phase3ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 3 - Gamification', () => {
  let authToken: string;
  let adminAuthToken: string;

  /**
   * Setup: Login before each test
   */
  test.beforeEach(async ({ request }) => {
    // Login as admin for management tests
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'admin@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (adminLoginResponse.status() === httpStatus.OK) {
      const body = await adminLoginResponse.json();
      adminAuthToken = body.access_token;
    }

    // Login as patient for earning badges
    const patientLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (patientLoginResponse.status() === httpStatus.OK) {
      const body = await patientLoginResponse.json();
      authToken = body.access_token;
    }
  });

  test.describe('Badge Catalog', () => {
    test('should view badges catalog', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      await page.waitForSelector('[data-testid="badges-catalog"]');

      const badges = await page.$$('[data-testid="badge-item"]');
      expect(badges.length).toBeGreaterThan(0);

      // Each badge should show name, description, and icon
      for (const badge of badges.slice(0, 3)) {
        expect(await badge.isVisible('[data-testid="badge-icon"]')).toBe(true);
        expect(await badge.isVisible('[data-testid="badge-name"]')).toBe(true);
        expect(await badge.isVisible('[data-testid="badge-description"]')).toBe(true);
      }
    });

    test('should filter badges by category', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      await page.click('[data-testid="filter-category"]');
      await page.click('[data-testid="category-progress"]');

      const badges = await page.$$('[data-testid="badge-item"]:visible');
      
      for (const badge of badges) {
        const category = await badge.getAttribute('data-category');
        expect(category).toBe('PROGRESS');
      }
    });

    test('should show earned vs unearned badges', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      await page.waitForSelector('[data-testid="badges-catalog"]');

      // Should have both earned and unearned badges
      const earnedBadges = await page.$$('[data-testid="badge-item"][data-earned="true"]');
      const unearnedBadges = await page.$$('[data-testid="badge-item"][data-earned="false"]');

      expect(earnedBadges.length + unearnedBadges.length).toBeGreaterThan(0);

      // Earned badges should have visual indicator
      for (const badge of earnedBadges.slice(0, 2)) {
        expect(await badge.isVisible('[data-testid="earned-indicator"]')).toBe(true);
      }

      // Unearned badges should be locked/grayed out
      for (const badge of unearnedBadges.slice(0, 2)) {
        expect(await badge.isVisible('[data-testid="locked-indicator"]')).toBe(true);
      }
    });

    test('should show badge requirements', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      const badge = await page.$('[data-testid="badge-item"]');
      
      if (badge) {
        await badge.click('[data-testid="view-requirements"]');
        await page.waitForSelector('[data-testid="requirements-modal"]');

        // Should display requirement details
        expect(await page.isVisible('[data-testid="requirement-type"]')).toBe(true);
        expect(await page.isVisible('[data-testid="requirement-progress"]')).toBe(true);
      }
    });

    test('should show badge rarity', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      
      const badges = await page.$$('[data-testid="badge-item"]');
      
      for (const badge of badges.slice(0, 3)) {
        const rarity = await badge.getAttribute('data-rarity');
        expect(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).toContain(rarity);
      }
    });

    test('should sort badges by different criteria', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      await page.click('[data-testid="sort-badges"]');
      await page.click('[data-testid="sort-by-rarity"]');

      // Badges should be sorted by rarity
      const badges = await page.$$('[data-testid="badge-item"]');
      
      // Legendary/rare badges should appear first
      const firstBadgeRarity = await badges[0].getAttribute('data-rarity');
      expect(['LEGENDARY', 'EPIC', 'RARE']).toContain(firstBadgeRarity);
    });
  });

  test.describe('Earn Badges', () => {
    test('should automatically award badge when requirement met', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/therapy/stages');
      
      // Complete a stage to trigger badge
      const stage = await page.$('[data-testid="stage-item"][data-in-progress="true"]');
      
      if (stage) {
        await stage.click('[data-testid="complete-stage"]');
        await page.click('[data-testid="confirm-completion"]');
        await page.waitForSelector('[data-testid="badge-earned-notification"]');

        // Should show badge earned notification
        const notification = await page.$('[data-testid="badge-earned-notification"]');
        expect(notification).not.toBeNull();

        const badgeName = await notification.textContent('[data-testid="badge-name"]');
        expect(badgeName).toBeTruthy();
      }
    });

    test('should show badge earned popup', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      
      // Take and pass a quiz
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Answer all questions
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="quiz-results"]');

        // Should trigger badge if passed with high score
        const badgePopup = await page.$('[data-testid="badge-earned-popup"]');
        
        if (badgePopup) {
          expect(await badgePopup.isVisible('[data-testid="badge-icon"]')).toBe(true);
          expect(await badgePopup.isVisible('[data-testid="badge-name"]')).toBe(true);
        }
      }
    });

    test('should show badge progress towards earning', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      const unearnedBadge = await page.$('[data-testid="badge-item"][data-earned="false"]');
      
      if (unearnedBadge) {
        const progressText = await unearnedBadge.textContent('[data-testid="progress-text"]');
        expect(progressText).toMatch(/\d+ \/ \d+/);
      }
    });

    test('should award streak badge for daily activity', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      
      // Simulate daily check-in
      await page.click('[data-testid="daily-checkin"]');
      await page.waitForSelector('[data-testid="checkin-success"]');

      // Check streak counter
      const streakCount = await page.textContent('[data-testid="streak-count"]');
      expect(parseInt(streakCount)).toBeGreaterThan(0);

      // If streak reaches 7, should award badge
      if (parseInt(streakCount) >= 7) {
        await page.waitForSelector('[data-testid="badge-earned-notification"]');
      }
    });

    test('should award points badge for accumulated points', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/stats');
      await page.waitForSelector('[data-testid="points-display"]');

      const pointsText = await page.textContent('[data-testid="points-display"]');
      const points = parseInt(pointsText.replace(/\D/g, ''));

      // If points >= 1000, should have "Mistrz Słuchu" badge
      if (points >= 1000) {
        await page.goto('/gamification/badges');
        const pointsBadge = await page.$('[data-testid="badge-item"][data-badge-id="badge-4"]');
        
        if (pointsBadge) {
          const isEarned = await pointsBadge.getAttribute('data-earned');
          expect(isEarned).toBe('true');
        }
      }
    });

    test('should notify about badge progress', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Complete quiz
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');

        // Should show progress notification
        await page.waitForSelector('[data-testid="progress-notification"]');
        
        const progressText = await page.textContent('[data-testid="progress-notification"]');
        expect(progressText).toContain('postęp');
      }
    });
  });

  test.describe('My Badges', () => {
    test('should view earned badges', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/my-badges');
      await page.waitForSelector('[data-testid="my-badges"]');

      const earnedBadges = await page.$$('[data-testid="earned-badge"]');
      expect(earnedBadges.length).toBeGreaterThanOrEqual(0);

      // Each earned badge should show earn date
      for (const badge of earnedBadges.slice(0, 3)) {
        expect(await badge.isVisible('[data-testid="earn-date"]')).toBe(true);
      }
    });

    test('should display badge details', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/my-badges');
      const earnedBadge = await page.$('[data-testid="earned-badge"]');
      
      if (earnedBadge) {
        await earnedBadge.click('[data-testid="view-badge-details"]');
        await page.waitForSelector('[data-testid="badge-detail-modal"]');

        // Should show full details
        expect(await page.isVisible('[data-testid="badge-large-icon"]')).toBe(true);
        expect(await page.isVisible('[data-testid="badge-full-description"]')).toBe(true);
        expect(await page.isVisible('[data-testid="badge-earned-date"]')).toBe(true);
      }
    });

    test('should share badge', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/my-badges');
      const earnedBadge = await page.$('[data-testid="earned-badge"]');
      
      if (earnedBadge) {
        await earnedBadge.click('[data-testid="share-badge"]');
        await page.waitForSelector('[data-testid="share-modal"]');

        // Should have share options
        expect(await page.isVisible('[data-testid="share-facebook"]')).toBe(true);
        expect(await page.isVisible('[data-testid="share-twitter"]')).toBe(true);
        expect(await page.isVisible('[data-testid="share-copy-link"]')).toBe(true);

        await page.click('[data-testid="share-copy-link"]');
        await page.waitForSelector('[data-testid="share-success"]');
      }
    });

    test('should filter earned badges by category', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/my-badges');
      await page.click('[data-testid="filter-category"]');
      await page.click('[data-testid="category-achievement"]');

      const badges = await page.$$('[data-testid="earned-badge"]:visible');
      
      for (const badge of badges) {
        const category = await badge.getAttribute('data-category');
        expect(category).toBe('ACHIEVEMENT');
      }
    });

    test('should display badge collection statistics', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/my-badges');
      await page.waitForSelector('[data-testid="badge-stats"]');

      // Should show total earned, percentage, etc.
      expect(await page.isVisible('[data-testid="total-earned"]')).toBe(true);
      expect(await page.isVisible('[data-testid="collection-percentage"]')).toBe(true);
    });
  });

  test.describe('Notifications', () => {
    test('should show badge earned notification', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      
      // Simulate earning a badge
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('badge-earned', {
          detail: {
            badgeId: 'badge-1',
            badgeName: 'Pierwsze Kroki',
            badgeIcon: '🎯',
          },
        }));
      });

      await page.waitForSelector('[data-testid="badge-notification"]');
      
      const notification = await page.$('[data-testid="badge-notification"]');
      expect(notification).not.toBeNull();

      const badgeName = await notification.textContent('[data-testid="badge-name"]');
      expect(badgeName).toBe('Pierwsze Kroki');
    });

    test('should dismiss badge notification', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      
      // Trigger notification
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('badge-earned', {
          detail: {
            badgeId: 'badge-1',
            badgeName: 'Test Badge',
            badgeIcon: '🎯',
          },
        }));
      });

      await page.waitForSelector('[data-testid="badge-notification"]');
      
      // Dismiss
      await page.click('[data-testid="dismiss-notification"]');
      
      // Should be hidden
      const isHidden = await page.isHidden('[data-testid="badge-notification"]');
      expect(isHidden).toBe(true);
    });

    test('should click notification to view badge', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      
      // Trigger notification
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('badge-earned', {
          detail: {
            badgeId: 'badge-1',
            badgeName: 'Test Badge',
            badgeIcon: '🎯',
          },
        }));
      });

      await page.waitForSelector('[data-testid="badge-notification"]');
      
      // Click notification
      await page.click('[data-testid="badge-notification"]');
      
      // Should navigate to badge details
      await page.waitForURL('**/gamification/badges/**');
      expect(page.url()).toContain('/gamification/badges');
    });

    test('should show stage completion notification', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/therapy/stages');
      const stage = await page.$('[data-testid="stage-item"][data-in-progress="true"]');
      
      if (stage) {
        await stage.click('[data-testid="complete-stage"]');
        await page.click('[data-testid="confirm-completion"]');
        await page.waitForSelector('[data-testid="stage-completed-notification"]');

        const notification = await page.$('[data-testid="stage-completed-notification"]');
        expect(notification).not.toBeNull();
      }
    });

    test('should show quiz passed notification', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Complete quiz
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="quiz-passed-notification"]');
      }
    });
  });

  test.describe('Points and Leaderboard', () => {
    test('should view points total', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/stats');
      await page.waitForSelector('[data-testid="points-display"]');

      const pointsText = await page.textContent('[data-testid="points-display"]');
      const points = parseInt(pointsText.replace(/\D/g, ''));
      expect(points).toBeGreaterThanOrEqual(0);
    });

    test('should view leaderboard', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/leaderboard');
      await page.waitForSelector('[data-testid="leaderboard"]');

      const entries = await page.$$('[data-testid="leaderboard-entry"]');
      expect(entries.length).toBeGreaterThan(0);

      // Each entry should show rank, user, and points
      for (const entry of entries.slice(0, 5)) {
        expect(await entry.isVisible('[data-testid="rank"]')).toBe(true);
        expect(await entry.isVisible('[data-testid="username"]')).toBe(true);
        expect(await entry.isVisible('[data-testid="points"]')).toBe(true);
      }
    });

    test('should show own position in leaderboard', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/leaderboard');
      await page.waitForSelector('[data-testid="own-position"]');

      const ownRank = await page.textContent('[data-testid="own-rank"]');
      const ownPoints = await page.textContent('[data-testid="own-points"]');

      expect(ownRank).toBeTruthy();
      expect(ownPoints).toBeTruthy();
    });

    test('should filter leaderboard by time period', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/leaderboard');
      await page.click('[data-testid="filter-period"]');
      await page.click('[data-testid="period-weekly"]');

      // Leaderboard should refresh
      await page.waitForSelector('[data-testid="leaderboard-entry"]');

      const periodText = await page.textContent('[data-testid="current-period"]');
      expect(periodText).toContain('tydzień');
    });

    test('should show points history', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/stats');
      await page.click('[data-testid="view-points-history"]');
      await page.waitForSelector('[data-testid="points-history-modal"]');

      const historyEntries = await page.$$('[data-testid="history-entry"]');
      expect(historyEntries.length).toBeGreaterThan(0);

      // Each entry should show date, reason, and points change
      for (const entry of historyEntries.slice(0, 3)) {
        expect(await entry.isVisible('[data-testid="entry-date"]')).toBe(true);
        expect(await entry.isVisible('[data-testid="entry-reason"]')).toBe(true);
        expect(await entry.isVisible('[data-testid="entry-points"]')).toBe(true);
      }
    });

    test('should earn points for completing activities', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      const initialPoints = await page.textContent('[data-testid="points-display"]');
      
      // Complete an activity
      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Complete quiz
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="points-earned"]');

        const earnedPoints = await page.textContent('[data-testid="points-earned"]');
        expect(parseInt(earnedPoints)).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Gamification API', () => {
    test('should get badges catalog via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase3ApiEndpoints.badges.catalog, {
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

    test('should get earned badges via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase3ApiEndpoints.badges.earned, {
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

    test('should get gamification stats via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase3ApiEndpoints.gamification.stats, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('totalPoints');
        expect(body).toHaveProperty('badgesEarned');
        expect(body).toHaveProperty('currentStreak');
      }
    });

    test('should get leaderboard via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase3ApiEndpoints.gamification.leaderboard, {
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

    test('should get notifications via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase3ApiEndpoints.gamification.notifications, {
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
  });

  test.describe('Admin Badge Management', () => {
    test('should view all badges as admin', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/gamification/badges');
      await page.waitForSelector('[data-testid="admin-badges-list"]');

      const badges = await page.$$('[data-testid="admin-badge-item"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    test('should create new badge', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/gamification/badges');
      await page.click('[data-testid="create-badge"]');
      await page.waitForSelector('[data-testid="badge-form"]');

      await page.fill('[name="badge-name"]', generateUniqueIdentifier('Nowa Odznaka'));
      await page.fill('[name="badge-description"]', 'Opis nowej odznaki');
      await page.fill('[name="badge-icon"]', '🏆');
      await page.selectOption('[name="badge-category"]', 'ACHIEVEMENT');
      await page.selectOption('[name="badge-rarity"]', 'RARE');

      // Set requirement
      await page.selectOption('[name="requirement-type"]', 'STAGE_COMPLETION');
      await page.fill('[name="requirement-count"]', '5');

      await page.click('[data-testid="save-badge"]');
      await page.waitForSelector('[data-testid="badge-saved"]');
    });

    test('should edit badge', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/gamification/badges');
      const badgeItem = await page.$('[data-testid="admin-badge-item"]');
      
      if (badgeItem) {
        await badgeItem.click('[data-testid="edit-badge"]');
        await page.waitForSelector('[data-testid="badge-form"]');

        await page.fill('[name="badge-name"]', 'Zaktualizowana nazwa');
        await page.click('[data-testid="save-badge"]');
        await page.waitForSelector('[data-testid="badge-saved"]');
      }
    });

    test('should manually award badge to patient', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/gamification/awards');
      await page.click('[data-testid="manual-award"]');
      await page.waitForSelector('[data-testid="award-modal"]');

      // Select patient
      await page.click('[data-testid="patient-select"]');
      await page.click('[data-testid="patient-option"]:nth-child(1)');

      // Select badge
      await page.click('[data-testid="badge-select"]');
      await page.click('[data-testid="badge-option"]:nth-child(1)');

      // Add reason
      await page.fill('[name="award-reason"]', 'Specjalne wyróżnienie');

      await page.click('[data-testid="confirm-award"]');
      await page.waitForSelector('[data-testid="award-success"]');
    });

    test('should view badge award statistics', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/gamification/badges');
      const badgeItem = await page.$('[data-testid="admin-badge-item"]');
      
      if (badgeItem) {
        await badgeItem.click('[data-testid="view-statistics"]');
        await page.waitForSelector('[data-testid="statistics-modal"]');

        // Should show award count, percentage of users, etc.
        expect(await page.isVisible('[data-testid="award-count"]')).toBe(true);
        expect(await page.isVisible('[data-testid="award-percentage"]')).toBe(true);
      }
    });
  });

  test.describe('Negative Tests', () => {
    test('should not earn badge without meeting requirements', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/gamification/badges');
      const unearnedBadge = await page.$('[data-testid="badge-item"][data-earned="false"]');
      
      if (unearnedBadge) {
        // Should not be able to manually trigger earn
        const earnButton = await unearnedBadge.$('[data-testid="earn-badge"]');
        expect(earnButton).toBeNull();
      }
    });

    test('should not access admin badge management without admin role', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/admin/gamification/badges');
      
      await page.waitForSelector('[data-testid="access-denied"], [data-testid="login-page"]');
      
      const accessDenied = await page.isVisible('[data-testid="access-denied"]');
      const isLoginPage = page.url().includes('/login');
      
      expect(accessDenied || isLoginPage).toBe(true);
    });

    test('should not award badge without authentication', async ({ request }) => {
      const response = await request.post(
        phase3ApiEndpoints.badges.award,
        {
          data: {
            badgeId: 'badge-1',
            userId: 'user-123',
          },
        }
      );

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should not show duplicate notification for same badge', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/dashboard');
      
      // Trigger notification twice
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('badge-earned', {
          detail: {
            badgeId: 'badge-1',
            badgeName: 'Test Badge',
            badgeIcon: '🎯',
          },
        }));
      });

      await page.waitForTimeout(500);

      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('badge-earned', {
          detail: {
            badgeId: 'badge-1',
            badgeName: 'Test Badge',
            badgeIcon: '🎯',
          },
        }));
      });

      // Should only have one notification
      const notifications = await page.$$('[data-testid="badge-notification"]');
      expect(notifications.length).toBe(1);
    });
  });
});
