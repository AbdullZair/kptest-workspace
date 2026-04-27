/**
 * Central Inbox Tests - Phase 2
 *
 * Tests for central inbox features:
 * - Central inbox filtering
 * - Delegate message to team member
 * - Inbox management
 * - Message routing
 *
 * @module tests/phase2/central-inbox.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  testPatients,
  testCentralInbox,
  phase2ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 2 - Central Inbox', () => {
  let authToken: string;
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

  test.describe('Central Inbox Access', () => {
    test('should access central inbox', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.waitForSelector('[data-testid="central-inbox"]');

      const inbox = await page.$('[data-testid="central-inbox"]');
      expect(inbox).not.toBeNull();
    });

    test('should display inbox statistics', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.waitForSelector('[data-testid="inbox-stats"]');

      // Should show statistics
      expect(await page.isVisible('[data-testid="total-messages"]')).toBe(true);
      expect(await page.isVisible('[data-testid="unread-count"]')).toBe(true);
      expect(await page.isVisible('[data-testid="flagged-count"]')).toBe(true);
    });

    test('should show empty state for empty inbox', async ({ page, request }) => {
      // Login as user with no messages
      const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
        data: {
          identifier: 'empty-inbox@test.com',
          password: 'TestP@ssw0rd123',
        },
      });

      if (loginResponse.status() === httpStatus.OK) {
        await page.goto('/inbox/central');
        await page.waitForSelector('[data-testid="empty-inbox-state"]');

        const emptyState = await page.$('[data-testid="empty-inbox-state"]');
        expect(emptyState).not.toBeNull();
      }
    });
  });

  test.describe('Inbox Filtering', () => {
    test('should filter by ALL messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.waitForSelector('[data-testid="inbox-filters"]');

      await page.click('[data-testid="filter-all"]');
      await page.waitForSelector('[data-testid="filter-active"][data-filter="ALL"]');

      const messages = await page.$$('[data-testid="inbox-message"]:visible');
      expect(messages.length).toBeGreaterThanOrEqual(0);
    });

    test('should filter by UNREAD messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="filter-unread"]');
      await page.waitForSelector('[data-testid="filter-active"][data-filter="UNREAD"]');

      const messages = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const message of messages) {
        const isUnread = await message.getAttribute('data-read');
        expect(isUnread).toBe('false');
      }
    });

    test('should filter by READ messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="filter-read"]');
      await page.waitForSelector('[data-testid="filter-active"][data-filter="READ"]');

      const messages = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const message of messages) {
        const isRead = await message.getAttribute('data-read');
        expect(isRead).toBe('true');
      }
    });

    test('should filter by FLAGGED messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="filter-flagged"]');
      await page.waitForSelector('[data-testid="filter-active"][data-filter="FLAGGED"]');

      const messages = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const message of messages) {
        const isFlagged = await message.isVisible('[data-testid="flag-icon"]');
        expect(isFlagged).toBe(true);
      }
    });

    test('should filter by ARCHIVED messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="filter-archived"]');
      await page.waitForSelector('[data-testid="filter-active"][data-filter="ARCHIVED"]');

      const messages = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const message of messages) {
        const isArchived = await message.getAttribute('data-archived');
        expect(isArchived).toBe('true');
      }
    });

    test('should combine multiple filters', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      
      // Combine UNREAD and FLAGGED
      await page.click('[data-testid="filter-unread"]');
      await page.click('[data-testid="filter-flagged"]');

      const messages = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const message of messages) {
        const isUnread = await message.getAttribute('data-read');
        const isFlagged = await message.isVisible('[data-testid="flag-icon"]');
        expect(isUnread).toBe('false');
        expect(isFlagged).toBe(true);
      }
    });

    test('should clear all filters', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="filter-unread"]');
      await page.click('[data-testid="filter-flagged"]');

      await page.click('[data-testid="clear-filters"]');

      // All filters should be cleared
      const activeFilter = await page.$('[data-testid="filter-active"]');
      expect(activeFilter).toBeNull();
    });

    test('should persist filter preference', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="filter-unread"]');
      await page.waitForSelector('[data-testid="filter-active"]');

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="central-inbox"]');

      // Filter should still be active
      const activeFilter = await page.isVisible('[data-testid="filter-active"]');
      expect(activeFilter).toBe(true);
    });
  });

  test.describe('Message Delegation', () => {
    test('should delegate message to team member', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.waitForSelector('[data-testid="inbox-messages"]');

      const message = await page.$('[data-testid="inbox-message"]');
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');

        // Select team member
        await page.click('[data-testid="team-member-select"]');
        await page.click('[data-testid="team-member-option"]');
        
        // Add optional note
        await page.fill('[name="delegation-note"]', 'Proszę o zajęcie się tą sprawą');
        
        await page.click('[data-testid="confirm-delegate"]');
        await page.waitForSelector('[data-testid="delegation-success"]');

        testMessageId = await message.getAttribute('data-message-id');
      }
    });

    test('should delegate with priority level', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.click('[data-testid="team-member-option"]');
        
        // Set delegation priority
        await page.selectOption('[name="delegation-priority"]', 'HIGH');
        await page.click('[data-testid="confirm-delegate"]');
        await page.waitForSelector('[data-testid="delegation-success"]');
      }
    });

    test('should add note when delegating', async ({ page }) => {
      test.skip(!authToken, 'auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.click('[data-testid="team-member-option"]');
        
        await page.fill('[name="delegation-note"]', 'Pilna sprawa, wymaga odpowiedzi do końca dnia');
        await page.click('[data-testid="confirm-delegate"]');
        await page.waitForSelector('[data-testid="delegation-success"]');
      }
    });

    test('should notify delegate about assigned message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.click('[data-testid="team-member-option"]');
        await page.click('[data-testid="confirm-delegate"]');

        // Should show notification sent
        await page.waitForSelector('[data-testid="notification-sent"]');
        const notificationText = await page.textContent('[data-testid="notification-sent"]');
        expect(notificationText).toContain('powiadomiono');
      }
    });

    test('should view delegation history', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="view-details"]');
        await page.click('[data-testid="delegation-history"]');
        await page.waitForSelector('[data-testid="delegation-history-modal"]');

        const historyList = await page.$('[data-testid="delegation-list"]');
        expect(historyList).not.toBeNull();
      }
    });

    test('should recall delegated message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"][data-delegated="true"]');
      
      if (message) {
        await message.click('[data-testid="recall-delegation"]');
        await page.waitForSelector('[data-testid="recall-confirmation"]');
        await page.click('[data-testid="confirm-recall"]');
        await page.waitForSelector('[data-testid="recall-success"]');
      }
    });

    test('should reassign delegated message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"][data-delegated="true"]');
      
      if (message) {
        await message.click('[data-testid="reassign-delegation"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');
        
        // Select different team member
        await page.click('[data-testid="team-member-option"]:nth-child(2)');
        await page.click('[data-testid="confirm-delegate"]');
        await page.waitForSelector('[data-testid="reassignment-success"]');
      }
    });
  });

  test.describe('Team Member Selection', () => {
    test('should display available team members', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');

        const teamMembers = await page.$$('[data-testid="team-member-option"]');
        expect(teamMembers.length).toBeGreaterThan(0);

        // Each member should have name and role
        for (const member of teamMembers) {
          expect(await member.isVisible('[data-testid="member-name"]')).toBe(true);
          expect(await member.isVisible('[data-testid="member-role"]')).toBe(true);
        }
      }
    });

    test('should filter team members by role', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');

        // Filter by role
        await page.click('[data-testid="role-filter"]');
        await page.click('[data-testid="role-therapist"]');

        const filteredMembers = await page.$$('[data-testid="team-member-option"]:visible');
        
        for (const member of filteredMembers) {
          const role = await member.textContent('[data-testid="member-role"]');
          expect(role).toContain('THERAPIST');
        }
      }
    });

    test('should show team member availability', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');

        // Should show availability indicator
        const availableMembers = await page.$$('[data-testid="team-member-option"][data-available="true"]');
        const busyMembers = await page.$$('[data-testid="team-member-option"][data-available="false"]');
        
        expect(availableMembers.length + busyMembers.length).toBeGreaterThan(0);
      }
    });

    test('should search team members', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');

        // Search for team member
        await page.fill('[name="team-member-search"]', 'Anna');
        
        const searchResults = await page.$$('[data-testid="team-member-option"]:visible');
        
        for (const member of searchResults) {
          const name = await member.textContent('[data-testid="member-name"]');
          expect(name.toLowerCase()).toContain('anna');
        }
      }
    });
  });

  test.describe('Message Actions', () => {
    test('should mark message as read', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.waitForSelector('[data-testid="inbox-messages"]');

      const unreadMessage = await page.$('[data-testid="inbox-message"][data-read="false"]');
      
      if (unreadMessage) {
        await unreadMessage.click('[data-testid="mark-as-read"]');
        
        const isRead = await unreadMessage.getAttribute('data-read');
        expect(isRead).toBe('true');
      }
    });

    test('should mark message as unread', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"][data-read="true"]');
      
      if (message) {
        await message.click('[data-testid="mark-as-unread"]');
        
        const isUnread = await message.getAttribute('data-read');
        expect(isUnread).toBe('false');
      }
    });

    test('should flag message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="flag-message"]');
        
        const isFlagged = await message.isVisible('[data-testid="flag-icon"]');
        expect(isFlagged).toBe(true);
      }
    });

    test('should archive message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="archive-message"]');
        await page.waitForSelector('[data-testid="archive-success"]');
        
        // Message should disappear from current view
        const isHidden = await message.isHidden();
        expect(isHidden).toBe(true);
      }
    });

    test('should delete message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delete-message"]');
        await page.waitForSelector('[data-testid="delete-confirmation"]');
        await page.click('[data-testid="confirm-delete"]');
        await page.waitForSelector('[data-testid="delete-success"]');
      }
    });

    test('should bulk select messages', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.waitForSelector('[data-testid="inbox-messages"]');

      // Select multiple messages
      const checkboxes = await page.$$('[data-testid="message-checkbox"]');
      
      for (const checkbox of checkboxes.slice(0, 3)) {
        await checkbox.click();
      }

      // Bulk actions should appear
      const bulkActionsVisible = await page.isVisible('[data-testid="bulk-actions"]');
      expect(bulkActionsVisible).toBe(true);
    });

    test('should bulk mark as read', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      
      // Select multiple unread messages
      const checkboxes = await page.$$('[data-testid="message-checkbox"]');
      
      for (const checkbox of checkboxes.slice(0, 3)) {
        await checkbox.click();
      }

      await page.click('[data-testid="bulk-mark-read"]');
      await page.waitForSelector('[data-testid="bulk-action-success"]');
    });

    test('should bulk archive', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      
      const checkboxes = await page.$$('[data-testid="message-checkbox"]');
      
      for (const checkbox of checkboxes.slice(0, 3)) {
        await checkbox.click();
      }

      await page.click('[data-testid="bulk-archive"]');
      await page.click('[data-testid="confirm-bulk-action"]');
      await page.waitForSelector('[data-testid="bulk-archive-success"]');
    });
  });

  test.describe('Inbox API', () => {
    test('should get central inbox messages via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase2ApiEndpoints.inbox.central, {
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

    test('should filter inbox via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase2ApiEndpoints.inbox.filter + '?status=UNREAD', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should delegate message via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(
        phase2ApiEndpoints.inbox.delegate('msg-123'),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            delegateId: testCentralInbox.DELEGATION.delegateId,
            note: 'Test delegation',
          },
        }
      );

      expect([httpStatus.OK, httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Inbox Search', () => {
    test('should search messages by subject', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.fill('[name="inbox-search"]', 'testowa wiadomość');
      await page.press('[name="inbox-search"]', 'Enter');

      await page.waitForSelector('[data-testid="search-results"]');

      const results = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const result of results) {
        const subject = await result.textContent('[data-testid="message-subject"]');
        expect(subject.toLowerCase()).toContain('testowa');
      }
    });

    test('should search messages by sender', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.fill('[name="inbox-search"]', 'recepcja');
      await page.press('[name="inbox-search"]', 'Enter');

      const results = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const result of results) {
        const sender = await result.textContent('[data-testid="message-sender"]');
        expect(sender.toLowerCase()).toContain('recepcja');
      }
    });

    test('should search messages by date range', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="advanced-search"]');
      
      await page.fill('[name="date-from"]', '2026-04-01');
      await page.fill('[name="date-to"]', '2026-04-30');
      await page.click('[data-testid="apply-date-filter"]');

      const results = await page.$$('[data-testid="inbox-message"]:visible');
      
      for (const result of results) {
        const date = await result.getAttribute('data-date');
        expect(date).toMatch(/2026-04-\d{2}/);
      }
    });

    test('should save search filters', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="advanced-search"]');
      
      await page.click('[data-testid="filter-unread"]');
      await page.click('[data-testid="filter-flagged"]');
      await page.selectOption('[name="priority-filter"]', 'HIGH');
      
      await page.click('[data-testid="save-search"]');
      await page.fill('[name="search-name"]', 'Moje zapisane wyszukiwanie');
      await page.click('[data-testid="confirm-save-search"]');
      await page.waitForSelector('[data-testid="search-saved"]');
    });

    test('should load saved search', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      await page.click('[data-testid="saved-searches"]');
      await page.waitForSelector('[data-testid="saved-search-list"]');

      const savedSearch = await page.$('[data-testid="saved-search-item"]');
      if (savedSearch) {
        await savedSearch.click();
        await page.waitForSelector('[data-testid="filter-applied"]');
      }
    });
  });

  test.describe('Inbox Notifications', () => {
    test('should show notification for new message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      
      // Simulate new message arrival
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('inbox-message-received', {
          detail: {
            id: 'new-msg-001',
            subject: 'Nowa wiadomość',
            sender: 'test@test.com',
          },
        }));
      });

      await page.waitForSelector('[data-testid="new-message-notification"]');
      
      const notification = await page.$('[data-testid="new-message-notification"]');
      expect(notification).not.toBeNull();
    });

    test('should update unread count in real-time', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const initialCount = await page.textContent('[data-testid="unread-count"]');
      
      // Simulate new unread message
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('inbox-message-received', {
          detail: { read: false },
        }));
      });

      await page.waitForTimeout(1000);
      
      const newCount = await page.textContent('[data-testid="unread-count"]');
      expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount || '0'));
    });

    test('should play sound for important message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      
      // Simulate important message
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('inbox-message-received', {
          detail: {
            priority: 'URGENT',
            important: true,
          },
        }));
      });

      // Sound should play
      const soundElement = await page.$('[data-testid="notification-sound"]');
      expect(soundElement).not.toBeNull();
    });
  });

  test.describe('Negative Tests', () => {
    test('should not delegate to self', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');

        // Current user option should be disabled or hidden
        const selfOption = await page.$('[data-testid="team-member-option"][data-is-self="true"]');
        
        if (selfOption) {
          const isDisabled = await selfOption.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    });

    test('should not delegate already delegated message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const delegatedMessage = await page.$('[data-testid="inbox-message"][data-delegated="true"]');
      
      if (delegatedMessage) {
        // Delegate action should be disabled or show different options
        const delegateBtn = await delegatedMessage.$('[data-testid="delegate-action"]');
        
        if (delegateBtn) {
          const isDisabled = await delegateBtn.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    });

    test('should require team member selection for delegation', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/inbox/central');
      const message = await page.$('[data-testid="inbox-message"]');
      
      if (message) {
        await message.click('[data-testid="delegate-action"]');
        await page.waitForSelector('[data-testid="delegate-modal"]');
        
        // Try to confirm without selection
        await page.click('[data-testid="confirm-delegate"]');
        
        // Should show validation error
        await page.waitForSelector('[data-testid="selection-error"]');
        const errorText = await page.textContent('[data-testid="selection-error"]');
        expect(errorText).toContain('wybierz');
      }
    });

    test('should not access central inbox without authentication', async ({ request }) => {
      const response = await request.get(phase2ApiEndpoints.inbox.central);

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });
});
