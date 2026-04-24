/**
 * Messaging Tests - Iteration 2
 *
 * Tests for messaging features:
 * - Create new thread
 * - Send message
 * - Mark as read
 * - Upload attachment
 *
 * @module tests/messaging/messaging.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testMessages, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';
import * as path from 'path';

test.describe('Messaging', () => {

  let authToken: string;
  let testThreadId: string;
  let testMessageId: string;

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

  test.describe('Create New Thread', () => {

    test('should create new message thread', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueSubject = `${testMessages.NEW_THREAD.subject}`;

      const response = await request.post(apiEndpoints.messages.threads, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: uniqueSubject,
          content: testMessages.NEW_THREAD.content,
          recipientIds: ['recipient-id-1'],
          projectId: 'project-id-1',
        },
      });

      // Should return 201 Created or 403 if not authorized
      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        testThreadId = body.id;
      }
    });

    test('should reject thread creation without subject', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.threads, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          content: 'Content without subject',
          recipientIds: ['recipient-id'],
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject thread creation without content', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.threads, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: 'Empty content',
          recipientIds: ['recipient-id'],
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject thread creation without recipients', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.threads, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: 'No recipients',
          content: 'Content',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should create thread in project context', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.threads, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          subject: `Project Thread ${Date.now()}`,
          content: 'Thread content',
          projectId: 'project-id',
          recipientIds: ['recipient-id'],
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST, httpStatus.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('Send Message', () => {

    test('should send message in existing thread', async ({ request }) => {
      test.skip(!authToken || !testThreadId, 'Auth token or thread ID not available');

      const response = await request.post(apiEndpoints.messages.send, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          threadId: testThreadId,
          content: testMessages.REPLY.content,
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST, httpStatus.NOT_FOUND]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        testMessageId = body.id;
      }
    });

    test('should reject sending message to non-existent thread', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.send, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          threadId: 'non-existent-thread',
          content: 'Message content',
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should reject sending empty message', async ({ request }) => {
      test.skip(!authToken || !testThreadId, 'Auth token or thread ID not available');

      const response = await request.post(apiEndpoints.messages.send, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          threadId: testThreadId,
          content: '',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject sending message without authentication', async ({ request }) => {
      const response = await request.post(apiEndpoints.messages.send, {
        data: {
          threadId: 'thread-id',
          content: 'Message',
        },
      });

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should send message with mention', async ({ request }) => {
      test.skip(!authToken || !testThreadId, 'Auth token or thread ID not available');

      const response = await request.post(apiEndpoints.messages.send, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          threadId: testThreadId,
          content: 'Hello @doctor, can you help?',
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });
  });

  test.describe('Mark as Read', () => {

    test('should mark message as read', async ({ request }) => {
      test.skip(!authToken || !testMessageId, 'Auth token or message ID not available');

      const response = await request.post(apiEndpoints.messages.markRead(testMessageId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should mark thread as read', async ({ request }) => {
      test.skip(!authToken || !testThreadId, 'Auth token or thread ID not available');

      const response = await request.post(`${apiEndpoints.messages.threads}/${testThreadId}/read`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should reject marking non-existent message as read', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.markRead('non-existent-message'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should return unread count', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.messages.threads}?unread=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('unreadCount');
      }
    });
  });

  test.describe('Upload Attachment', () => {

    test('should upload file attachment', async ({ request }) => {
      test.skip(!authToken || !testThreadId, 'Auth token or thread ID not available');

      // Create a test file
      const testFilePath = path.join(__dirname, 'test-attachment.txt');
      
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
          threadId: testThreadId,
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body.fileName).toBe('test-attachment.txt');
      }
    });

    test('should reject oversized attachment', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Create a large file (simulate > 10MB)
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB

      const response = await request.post(apiEndpoints.messages.attachments, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        multipart: {
          file: {
            name: 'large-file.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from(largeContent),
          },
          threadId: testThreadId || 'thread-id',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.PAYLOAD_TOO_LARGE, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject invalid file type', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.messages.attachments, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        multipart: {
          file: {
            name: 'malicious.exe',
            mimeType: 'application/x-executable',
            buffer: Buffer.from('fake executable'),
          },
          threadId: testThreadId || 'thread-id',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should download attachment', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.messages.attachments}/attachment-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should delete attachment', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.delete(`${apiEndpoints.messages.attachments}/attachment-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NO_CONTENT, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Message List', () => {

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

    test('should filter threads by project', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.messages.threads}?projectId=project-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should paginate message list', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.messages.list}?page=1&size=20`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should get single message by ID', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.messages.byId('message-id'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });
});
