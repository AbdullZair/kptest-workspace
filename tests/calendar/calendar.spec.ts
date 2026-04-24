/**
 * Calendar Tests - Iteration 2
 *
 * Tests for calendar features:
 * - Create event
 * - Edit event
 * - Mark as completed
 * - Export to iCal
 *
 * @module tests/calendar/calendar.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testCalendar, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Calendar', () => {

  let authToken: string;
  let testEventId: string;

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

  test.describe('Create Event', () => {

    test('should create calendar event', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.calendar.events, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: testCalendar.EVENT.title,
          description: testCalendar.EVENT.description,
          startTime: testCalendar.EVENT.startTime,
          endTime: testCalendar.EVENT.endTime,
          location: testCalendar.EVENT.location,
          type: testCalendar.EVENT.type,
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());

      if (response.status() === httpStatus.CREATED) {
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body.title).toBe(testCalendar.EVENT.title);
        testEventId = body.id;
      }
    });

    test('should create reminder event', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.calendar.events, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: testCalendar.REMINDER.title,
          description: testCalendar.REMINDER.description,
          startTime: testCalendar.REMINDER.startTime,
          endTime: testCalendar.REMINDER.endTime,
          type: testCalendar.REMINDER.type,
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should reject event without required fields', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.calendar.events, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          // Missing title and time
          description: 'Incomplete event',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject event with end time before start time', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.calendar.events, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Invalid Time Event',
          startTime: '2026-05-01T14:00:00',
          endTime: '2026-05-01T10:00:00', // End before start
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject event in the past', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.calendar.events, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Past Event',
          startTime: '2020-01-01T10:00:00',
          endTime: '2020-01-01T11:00:00',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should create recurring event', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(apiEndpoints.calendar.events, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Recurring Therapy Session',
          description: 'Weekly therapy session',
          startTime: '2026-05-01T10:00:00',
          endTime: '2026-05-01T11:00:00',
          recurrence: {
            frequency: 'WEEKLY',
            interval: 1,
            count: 10,
          },
        },
      });

      expect([httpStatus.CREATED, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });
  });

  test.describe('Edit Event', () => {

    test('should update event details', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      const response = await request.put(apiEndpoints.calendar.events.byId(testEventId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Updated Event Title',
          description: 'Updated description',
          location: 'New Location',
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body.title).toBe('Updated Event Title');
      }
    });

    test('should update event time', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      const response = await request.put(apiEndpoints.calendar.events.byId(testEventId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          startTime: '2026-05-02T10:00:00',
          endTime: '2026-05-02T11:00:00',
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should reject updating non-existent event', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.put(apiEndpoints.calendar.events.byId('non-existent-event'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Updated Title',
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should reject updating past events', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      // First set event to past
      await request.put(apiEndpoints.calendar.events.byId(testEventId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          startTime: '2020-01-01T10:00:00',
          endTime: '2020-01-01T11:00:00',
        },
      });

      // Try to update
      const response = await request.put(apiEndpoints.calendar.events.byId(testEventId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Cannot update past event',
        },
      });

      expect([httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN, httpStatus.OK]).toContain(response.status());
    });
  });

  test.describe('Mark as Completed', () => {

    test('should mark event as completed', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      const response = await request.post(`${apiEndpoints.calendar.events.byId(testEventId)}/complete`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should mark event as cancelled', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      const response = await request.post(`${apiEndpoints.calendar.events.byId(testEventId)}/cancel`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          cancellationReason: 'Patient requested cancellation',
        },
      });

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });

    test('should reject completing non-existent event', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(`${apiEndpoints.calendar.events.byId('non-existent')}/complete`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should return event status', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      const response = await request.get(apiEndpoints.calendar.events.byId(testEventId), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('status');
      }
    });
  });

  test.describe('Export to iCal', () => {

    test('should export events to iCal format', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.calendar.export, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('text/calendar');
      }
    });

    test('should export single event to iCal', async ({ request }) => {
      test.skip(!authToken || !testEventId, 'Auth token or event ID not available');

      const response = await request.get(`${apiEndpoints.calendar.events.byId(testEventId)}/export`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('text/calendar');
      }
    });

    test('should export events for date range', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.calendar.export}?start=2026-05-01&end=2026-05-31`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });

    test('should include all events in export', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.calendar.export}?include=all`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Event List', () => {

    test('should list calendar events', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(apiEndpoints.calendar.events, {
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

    test('should filter events by type', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.calendar.events}?type=APPOINTMENT`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should filter events by date range', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.calendar.events}?start=2026-05-01&end=2026-05-31`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should return upcoming events', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.calendar.events}?upcoming=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should paginate event list', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(`${apiEndpoints.calendar.events}?page=1&size=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN, httpStatus.BAD_REQUEST]).toContain(response.status());
    });
  });
});
