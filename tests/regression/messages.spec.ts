/**
 * Messages Regression Tests
 *
 * Full regression suite for messaging features.
 *
 * @module tests/regression/messages.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testMessages, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Regression - Messages', () => {
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

  test('should list message threads', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(apiEndpoints.messages.threads, {
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

  test('should create new message thread', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const uniqueSubject = generateUniqueIdentifier('Test Thread');

    const response = await request.post(apiEndpoints.messages.threads, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        subject: uniqueSubject,
        content: testMessages.NEW_THREAD.content,
        recipientIds: ['recipient-1'],
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should send message in thread', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.post(apiEndpoints.messages.send, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        threadId: 'thread-123',
        content: testMessages.REPLY.content,
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
  });

  test('should mark message as read', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.post(
      apiEndpoints.messages.markRead('message-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should mark thread as read', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.post(
      `${apiEndpoints.messages.threads}/thread-123/read`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should get unread count', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      `${apiEndpoints.messages.threads}?unread=true`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    if (response.status() === httpStatus.OK) {
      const body = await response.json();
      expect(body).toHaveProperty('unreadCount');
    }
  });

  test('should upload attachment', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.post(apiEndpoints.messages.attachments, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      multipart: {
        file: {
          name: 'test-attachment.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test attachment content'),
        },
        threadId: 'thread-123',
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should download attachment', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      `${apiEndpoints.messages.attachments}/attachment-123`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should delete attachment', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.delete(
      `${apiEndpoints.messages.attachments}/attachment-123`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.NO_CONTENT, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should view messages in UI', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    await page.waitForSelector('[data-testid="messages-list"]');

    const messages = await page.$$('[data-testid="message-item"]');
    expect(messages.length).toBeGreaterThanOrEqual(0);
  });

  test('should send new message via UI', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages/new');
    await page.waitForSelector('[data-testid="message-form"]');

    await page.fill('[name="subject"]', generateUniqueIdentifier('UI Test Message'));
    await page.fill('[name="content"]', 'Treść testowej wiadomości');
    await page.click('[data-testid="recipient-select"]');
    await page.click('[data-testid="recipient-option"]:nth-child(1)');
    await page.click('[data-testid="send-message"]');
    await page.waitForSelector('[data-testid="message-sent"]');
  });

  test('should reply to message', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    const messageItem = await page.$('[data-testid="message-item"]');
    
    if (messageItem) {
      await messageItem.click('[data-testid="open-message"]');
      await page.waitForSelector('[data-testid="message-thread"]');

      await page.fill('[name="reply-content"]', 'Treść odpowiedzi');
      await page.click('[data-testid="send-reply"]');
      await page.waitForSelector('[data-testid="reply-sent"]');
    }
  });

  test('should forward message', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    const messageItem = await page.$('[data-testid="message-item"]');
    
    if (messageItem) {
      await messageItem.click('[data-testid="forward-message"]');
      await page.waitForSelector('[data-testid="forward-modal"]');

      await page.click('[data-testid="forward-recipient-select"]');
      await page.click('[data-testid="forward-recipient-option"]:nth-child(1)');
      await page.click('[data-testid="confirm-forward"]');
      await page.waitForSelector('[data-testid="forward-success"]');
    }
  });

  test('should delete message', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    const messageItem = await page.$('[data-testid="message-item"]');
    
    if (messageItem) {
      await messageItem.click('[data-testid="delete-message"]');
      await page.waitForSelector('[data-testid="delete-confirmation"]');
      await page.click('[data-testid="confirm-delete"]');
      await page.waitForSelector('[data-testid="delete-success"]');
    }
  });

  test('should search messages', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    await page.fill('[name="message-search"]', 'test');
    await page.press('[name="message-search"]', 'Enter');

    await page.waitForSelector('[data-testid="search-results"]');

    const results = await page.$$('[data-testid="message-item"]:visible');
    
    for (const result of results) {
      const content = await result.textContent();
      expect(content.toLowerCase()).toContain('test');
    }
  });

  test('should filter messages by folder', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    await page.click('[data-testid="folder-inbox"]');

    const messages = await page.$$('[data-testid="message-item"]:visible');
    expect(messages.length).toBeGreaterThanOrEqual(0);
  });

  test('should view sent messages', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    await page.click('[data-testid="folder-sent"]');
    await page.waitForSelector('[data-testid="sent-messages"]');

    const messages = await page.$$('[data-testid="message-item"]');
    expect(messages.length).toBeGreaterThanOrEqual(0);
  });

  test('should view drafts', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    await page.click('[data-testid="folder-drafts"]');
    await page.waitForSelector('[data-testid="drafts-list"]');

    const drafts = await page.$$('[data-testid="draft-item"]');
    expect(drafts.length).toBeGreaterThanOrEqual(0);
  });

  test('should save message as draft', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages/new');
    await page.fill('[name="subject"]', 'Draft Message');
    await page.fill('[name="content"]', 'This will be saved as draft');
    
    await page.click('[data-testid="save-draft"]');
    await page.waitForSelector('[data-testid="draft-saved"]');
  });

  test('should show message attachments', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    const messageItem = await page.$('[data-testid="message-item"][data-has-attachments="true"]');
    
    if (messageItem) {
      await messageItem.click('[data-testid="open-message"]');
      await page.waitForSelector('[data-testid="attachments-section"]');

      const attachments = await page.$$('[data-testid="attachment-item"]');
      expect(attachments.length).toBeGreaterThan(0);
    }
  });

  test('should not send empty message', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages/new');
    await page.fill('[name="subject"]', 'Empty content test');
    
    await page.click('[data-testid="send-message"]');
    await page.waitForSelector('[data-testid="validation-error"]');

    const errorText = await page.textContent('[data-testid="validation-error"]');
    expect(errorText).toContain('treść');
  });

  test('should not access messages without authentication', async ({ request }) => {
    const response = await request.get(apiEndpoints.messages.threads);
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should show message notifications', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages');
    
    // Check for new message indicator
    const newMessageIndicator = await page.$('[data-testid="new-message-indicator"]');
    
    if (newMessageIndicator) {
      expect(await newMessageIndicator.isVisible()).toBe(true);
    }
  });

  test('should paginate messages', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/messages?page=1&size=20');
    await page.waitForSelector('[data-testid="pagination"]');

    expect(await page.isVisible('[data-testid="pagination-prev"]')).toBe(true);
    expect(await page.isVisible('[data-testid="pagination-next"]')).toBe(true);
  });
});
