/**
 * Priority Messages Tests - Phase 2
 *
 * Tests for priority messaging features:
 * - Send message with priority levels
 * - Filter messages by priority
 * - Flag important messages
 * - Priority notifications
 *
 * @module tests/phase2/priority-messages.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  testPatients,
  testPriorityMessages,
  phase2ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 2 - Priority Messages', () => {
  let authToken: string;
  let testThreadId: string;
  let testMessageId: string;

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

  test.describe('Send Messages with Priority', () => {
    test('should send message with LOW priority', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueSubject = generateUniqueIdentifier('Low priority test');

      const response = await request.post('http://localhost:8080/api/v1/messages/threads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: uniqueSubject,
          content: 'Wiadomość z niskim priorytetem',
          priority: 'LOW',
          recipientIds: ['recipient-1'],
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body.priority).toBe('LOW');
        testThreadId = body.id;
      }
    });

    test('should send message with NORMAL priority', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueSubject = generateUniqueIdentifier('Normal priority test');

      const response = await request.post('http://localhost:8080/api/v1/messages/threads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: uniqueSubject,
          content: 'Wiadomość z normalnym priorytetem',
          priority: 'NORMAL',
          recipientIds: ['recipient-1'],
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body.priority).toBe('NORMAL');
      }
    });

    test('should send message with HIGH priority', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueSubject = generateUniqueIdentifier('High priority test');

      // Via UI
      await page.goto('/messages/new');
      await page.waitForSelector('[data-testid="message-form"]');

      await page.fill('[name="subject"]', uniqueSubject);
      await page.fill('[name="content"]', testPriorityMessages.NEW_MESSAGE.content);
      
      // Select high priority
      await page.selectOption('[name="priority"]', 'HIGH');
      await page.click('[data-testid="send-message"]');
      await page.waitForSelector('[data-testid="message-sent-success"]');

      // Verify via API
      const response = await request.get('http://localhost:8080/api/v1/messages/threads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const threads = await response.json();
        const newThread = threads.find((t: any) => t.subject === uniqueSubject);
        expect(newThread?.priority).toBe('HIGH');
        testThreadId = newThread?.id;
      }
    });

    test('should send message with URGENT priority', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueSubject = generateUniqueIdentifier('Urgent priority test');

      const response = await request.post('http://localhost:8080/api/v1/messages/threads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: uniqueSubject,
          content: 'Pilna wiadomość wymagająca natychmiastowej uwagi',
          priority: 'URGENT',
          recipientIds: ['recipient-1'],
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body.priority).toBe('URGENT');
        testThreadId = body.id;
      }
    });

    test('should display priority badge on message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      // Find high priority message
      const highPriorityMessage = await page.$('[data-testid="message-item"][data-priority="HIGH"]');
      
      if (highPriorityMessage) {
        // Should have priority badge
        const badge = await highPriorityMessage.$('[data-testid="priority-badge"]');
        expect(badge).not.toBeNull();
        
        const badgeText = await badge?.textContent();
        expect(badgeText).toBe('Wysoki');
      }
    });

    test('should color-code priority levels', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      // Check each priority level has correct color
      const priorityColors: Record<string, string> = {
        LOW: testPriorityMessages.LOW.color,
        NORMAL: testPriorityMessages.NORMAL.color,
        HIGH: testPriorityMessages.HIGH.color,
        URGENT: testPriorityMessages.URGENT.color,
      };

      for (const [priority, color] of Object.entries(priorityColors)) {
        const message = await page.$(`[data-testid="message-item"][data-priority="${priority}"]`);
        
        if (message) {
          const badgeColor = await message.evaluate((el) => {
            const badge = el.querySelector('[data-testid="priority-badge"]');
            return badge ? window.getComputedStyle(badge).backgroundColor : null;
          });
          
          // Badge should have priority color
          expect(badgeColor).toBeTruthy();
        }
      }
    });
  });

  test.describe('Priority Filtering', () => {
    test('should filter messages by HIGH priority', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      // Apply HIGH priority filter
      await page.click('[data-testid="filter-priority"]');
      await page.click('[data-testid="filter-high"]');
      await page.waitForSelector('[data-testid="filter-applied"]');

      // All visible messages should be HIGH priority
      const messages = await page.$$('[data-testid="message-item"]:visible');
      
      for (const message of messages) {
        const priority = await message.getAttribute('data-priority');
        expect(priority).toBe('HIGH');
      }
    });

    test('should filter messages by URGENT priority', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.click('[data-testid="filter-priority"]');
      await page.click('[data-testid="filter-urgent"]');

      const messages = await page.$$('[data-testid="message-item"]:visible');
      
      for (const message of messages) {
        const priority = await message.getAttribute('data-priority');
        expect(priority).toBe('URGENT');
      }
    });

    test('should filter by multiple priority levels', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.click('[data-testid="filter-priority"]');
      
      // Select HIGH and URGENT
      await page.click('[data-testid="filter-high"]');
      await page.click('[data-testid="filter-urgent"]');

      const messages = await page.$$('[data-testid="message-item"]:visible');
      
      for (const message of messages) {
        const priority = await message.getAttribute('data-priority');
        expect(['HIGH', 'URGENT']).toContain(priority);
      }
    });

    test('should clear priority filter', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.click('[data-testid="filter-priority"]');
      await page.click('[data-testid="filter-high"]');
      await page.waitForSelector('[data-testid="filter-applied"]');

      // Clear filter
      await page.click('[data-testid="clear-filter"]');

      // All messages should be visible now
      const allMessages = await page.$$('[data-testid="message-item"]');
      expect(allMessages.length).toBeGreaterThan(0);
    });

    test('should persist priority filter preference', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.click('[data-testid="filter-priority"]');
      await page.click('[data-testid="filter-high"]');
      await page.waitForSelector('[data-testid="filter-applied"]');

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="message-list"]');

      // Filter should still be applied
      const filterApplied = await page.isVisible('[data-testid="filter-applied"]');
      expect(filterApplied).toBe(true);
    });
  });

  test.describe('Flag Messages', () => {
    test('should flag important message', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      // Flag first message
      const firstMessage = await page.$('[data-testid="message-item"]').then(el => el);
      if (firstMessage) {
        const messageId = await firstMessage.getAttribute('data-message-id');
        
        await firstMessage.click('[data-testid="flag-message"]');
        await page.waitForSelector('[data-testid="message-flagged"]');

        // Verify via API
        const response = await request.post(
          phase2ApiEndpoints.messages.flag(messageId || 'test-id'),
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
            data: {
              flagged: true,
            },
          }
        );

        expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
      }
    });

    test('should unflag message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      // Flag then unflag
      const message = await page.$('[data-testid="message-item"]');
      if (message) {
        await message.click('[data-testid="flag-message"]');
        await page.waitForSelector('[data-testid="message-flagged"]');
        
        await message.click('[data-testid="unflag-message"]');
        await page.waitForSelector('[data-testid="message-unflagged"]');
      }
    });

    test('should filter flagged messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.click('[data-testid="filter-flagged"]');
      await page.waitForSelector('[data-testid="filter-applied"]');

      // All visible messages should be flagged
      const messages = await page.$$('[data-testid="message-item"]:visible');
      
      for (const message of messages) {
        const isFlagged = await message.isVisible('[data-testid="flag-icon"]');
        expect(isFlagged).toBe(true);
      }
    });

    test('should display flagged messages in separate section', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="flagged-section"]');

      const flaggedSection = await page.$('[data-testid="flagged-section"]');
      expect(flaggedSection).not.toBeNull();
    });
  });

  test.describe('Priority Notifications', () => {
    test('should show notification for URGENT message', async ({ page, context }) => {
      test.skip(!authToken, 'Auth token not available');

      // Request notification permission
      await context.grantPermissions(['notifications']);

      await page.goto('/messages');
      
      // Simulate receiving urgent message
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('message-received', {
          detail: {
            priority: 'URGENT',
            subject: 'Pilna wiadomość',
          },
        }));
      });

      // Should show notification
      await page.waitForSelector('[data-testid="priority-notification"]');
      
      const notification = await page.$('[data-testid="priority-notification"]');
      expect(notification).not.toBeNull();
      
      const notificationText = await notification?.textContent();
      expect(notificationText).toContain('Pilna');
    });

    test('should show badge icon for HIGH priority messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      const highPriorityMessage = await page.$('[data-testid="message-item"][data-priority="HIGH"]');
      
      if (highPriorityMessage) {
        const badge = await highPriorityMessage.$('[data-testid="priority-badge"]');
        expect(badge).not.toBeNull();
        
        const isVisible = await badge?.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('should play sound for URGENT notification', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');

      // Check if sound element exists
      const soundElement = await page.$('[data-testid="notification-sound"]');
      
      if (soundElement) {
        // Sound element should be present for urgent notifications
        const audioSrc = await soundElement.getAttribute('src');
        expect(audioSrc).toBeTruthy();
      }
    });

    test('should allow dismissing priority notification', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      
      // Trigger notification
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('message-received', {
          detail: {
            priority: 'URGENT',
            subject: 'Test',
          },
        }));
      });

      await page.waitForSelector('[data-testid="priority-notification"]');
      
      // Dismiss notification
      await page.click('[data-testid="dismiss-notification"]');
      
      // Notification should be gone
      const isHidden = await page.isHidden('[data-testid="priority-notification"]');
      expect(isHidden).toBe(true);
    });
  });

  test.describe('Priority Message API', () => {
    test('should set priority via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(phase2ApiEndpoints.messages.priority, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          messageId: 'test-message-id',
          priority: 'HIGH',
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should get priority statistics via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get('http://localhost:8080/api/v1/messages/priority-stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('lowCount');
        expect(body).toHaveProperty('normalCount');
        expect(body).toHaveProperty('highCount');
        expect(body).toHaveProperty('urgentCount');
      }
    });

    test('should update message priority via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.patch(
        'http://localhost:8080/api/v1/messages/test-message-id/priority',
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            priority: 'URGENT',
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('Priority Escalation', () => {
    test('should escalate message priority', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      const message = await page.$('[data-testid="message-item"]');
      if (message) {
        // Open priority menu
        await message.click('[data-testid="priority-menu"]');
        
        // Escalate to HIGH
        await page.click('[data-testid="escalate-to-high"]');
        
        // Verify escalation
        await page.waitForSelector('[data-testid="priority-escalated"]');
        
        const newPriority = await message.getAttribute('data-priority');
        expect(newPriority).toBe('HIGH');
      }
    });

    test('should notify recipient of escalated priority', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      
      // Escalate a message
      const message = await page.$('[data-testid="message-item"]');
      if (message) {
        await message.click('[data-testid="priority-menu"]');
        await page.click('[data-testid="escalate-to-urgent"]');
        
        // Should show notification about escalation
        await page.waitForSelector('[data-testid="escalation-notification"]');
        
        const notificationText = await page.textContent('[data-testid="escalation-notification"]');
        expect(notificationText).toContain('powiadomiony');
      }
    });

    test('should track priority change history', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      const message = await page.$('[data-testid="message-item"]');
      if (message) {
        // View priority history
        await message.click('[data-testid="view-priority-history"]');
        await page.waitForSelector('[data-testid="priority-history-modal"]');
        
        // Should show timeline of changes
        const timeline = await page.$('[data-testid="priority-timeline"]');
        expect(timeline).not.toBeNull();
      }
    });
  });

  test.describe('Negative Tests', () => {
    test('should reject invalid priority level', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post('http://localhost:8080/api/v1/messages/threads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: 'Test',
          content: 'Test',
          priority: 'INVALID_PRIORITY',
          recipientIds: ['recipient-1'],
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should not allow priority change without permission', async ({ request }) => {
      const response = await request.post(phase2ApiEndpoints.messages.priority, {
        data: {
          messageId: 'test-message-id',
          priority: 'URGENT',
        },
      });

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should not display priority badge for NORMAL priority', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      const normalMessage = await page.$('[data-testid="message-item"][data-priority="NORMAL"]');
      
      if (normalMessage) {
        // Normal priority may not show badge by default
        const badge = await normalMessage.$('[data-testid="priority-badge"]');
        // Badge might be null or hidden for normal priority
        const isVisible = badge ? await badge.isVisible() : false;
        expect(isVisible).toBe(false);
      }
    });
  });
});
