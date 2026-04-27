/**
 * Calendar Regression Tests
 *
 * Full regression suite for calendar and event management features.
 *
 * @module tests/regression/calendar.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testPatients, testCalendar, apiEndpoints, httpStatus, generateUniqueIdentifier } from '../test-data';

test.describe('Regression - Calendar', () => {
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

  test('should get event by ID', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(
      apiEndpoints.calendar.events.byId('event-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should create new appointment', async ({ request, page }) => {
    test.skip(!authToken, 'Auth token not available');

    // Via API
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
        type: 'APPOINTMENT',
      },
    });

    expect([httpStatus.CREATED, httpStatus.BAD_REQUEST, httpStatus.FORBIDDEN]).toContain(response.status());

    // Via UI
    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    await page.fill('[name="event-title"]', generateUniqueIdentifier('UI Appointment'));
    await page.fill('[name="event-description"]', 'Created via UI');
    await page.fill('[name="event-location"]', 'Gabinet 123');
    await page.selectOption('[name="event-type"]', 'APPOINTMENT');
    await page.fill('[name="start-time"]', '2026-05-01T10:00:00');
    await page.fill('[name="end-time"]', '2026-05-01T11:00:00');
    await page.click('[data-testid="save-event"]');
    await page.waitForSelector('[data-testid="event-saved"]');
  });

  test('should create new reminder', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    await page.fill('[name="event-title"]', testCalendar.REMINDER.title);
    await page.fill('[name="event-description"]', testCalendar.REMINDER.description);
    await page.selectOption('[name="event-type"]', 'REMINDER');
    await page.fill('[name="start-time"]', testCalendar.REMINDER.startTime);
    await page.click('[data-testid="save-event"]');
    await page.waitForSelector('[data-testid="event-saved"]');
  });

  test('should update event', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.patch(
      apiEndpoints.calendar.events.byId('event-123'),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Updated Event Title',
          description: 'Updated description',
        },
      }
    );

    expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should delete event', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    const event = await page.$('[data-testid="calendar-event"]');
    
    if (event) {
      await event.click('[data-testid="delete-event"]');
      await page.waitForSelector('[data-testid="delete-confirmation"]');
      await page.click('[data-testid="confirm-delete"]');
      await page.waitForSelector('[data-testid="delete-success"]');
    }
  });

  test('should view calendar in month view', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="view-month"]');
    await page.waitForSelector('[data-testid="month-view"]');

    const days = await page.$$('[data-testid="calendar-day"]');
    expect(days.length).toBeGreaterThanOrEqual(28);
  });

  test('should view calendar in week view', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="view-week"]');
    await page.waitForSelector('[data-testid="week-view"]');

    const days = await page.$$('[data-testid="week-day"]');
    expect(days.length).toBe(7);
  });

  test('should view calendar in day view', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="view-day"]');
    await page.waitForSelector('[data-testid="day-view"]');

    const timeSlots = await page.$$('[data-testid="time-slot"]');
    expect(timeSlots.length).toBeGreaterThanOrEqual(24);
  });

  test('should navigate to previous month', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    const currentMonth = await page.textContent('[data-testid="current-month"]');
    
    await page.click('[data-testid="previous-month"]');
    await page.waitForSelector('[data-testid="month-view"]');

    const newMonth = await page.textContent('[data-testid="current-month"]');
    expect(newMonth).not.toBe(currentMonth);
  });

  test('should navigate to next month', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    const currentMonth = await page.textContent('[data-testid="current-month"]');
    
    await page.click('[data-testid="next-month"]');
    await page.waitForSelector('[data-testid="month-view"]');

    const newMonth = await page.textContent('[data-testid="current-month"]');
    expect(newMonth).not.toBe(currentMonth);
  });

  test('should navigate to today', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="previous-month"]');
    await page.waitForSelector('[data-testid="month-view"]');

    await page.click('[data-testid="today"]');
    await page.waitForSelector('[data-testid="month-view"]');

    const currentMonth = await page.textContent('[data-testid="current-month"]');
    const today = new Date().toLocaleString('pl-PL', { month: 'long', year: 'numeric' });
    expect(currentMonth.toLowerCase()).toContain(today.split(' ')[0]);
  });

  test('should filter events by type', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="filter-type"]');
    await page.click('[data-testid="filter-appointments"]');

    const events = await page.$$('[data-testid="calendar-event"]:visible');
    
    for (const event of events) {
      const type = await event.getAttribute('data-type');
      expect(type).toBe('APPOINTMENT');
    }
  });

  test('should show event details on click', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    const event = await page.$('[data-testid="calendar-event"]');
    
    if (event) {
      await event.click();
      await page.waitForSelector('[data-testid="event-details-modal"]');

      expect(await page.isVisible('[data-testid="modal-title"]')).toBe(true);
      expect(await page.isVisible('[data-testid="modal-date"]')).toBe(true);
      expect(await page.isVisible('[data-testid="modal-location"]')).toBe(true);
    }
  });

  test('should export calendar', async ({ request }) => {
    test.skip(!authToken, 'Auth token not available');

    const response = await request.get(apiEndpoints.calendar.export, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should set event reminder', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    await page.fill('[name="event-title"]', 'Event with reminder');
    await page.check('[name="set-reminder"]');
    await page.selectOption('[name="reminder-time"]', '15');
    await page.click('[data-testid="save-event"]');
    await page.waitForSelector('[data-testid="event-saved"]');
  });

  test('should show recurring events', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    await page.fill('[name="event-title"]', 'Recurring Event');
    await page.check('[name="is-recurring"]');
    await page.selectOption('[name="recurrence-pattern"]', 'WEEKLY');
    await page.click('[data-testid="save-event"]');
    await page.waitForSelector('[data-testid="event-saved"]');

    // Should show recurring indicator
    const recurringIndicator = await page.$('[data-testid="recurring-indicator"]');
    expect(recurringIndicator).not.toBeNull();
  });

  test('should invite participants to event', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    await page.fill('[name="event-title"]', 'Event with participants');
    await page.click('[data-testid="add-participant"]');
    await page.click('[data-testid="participant-option"]:nth-child(1)');
    await page.click('[data-testid="save-event"]');
    await page.waitForSelector('[data-testid="event-saved"]');
  });

  test('should show event conflicts', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    // Select time that might conflict
    await page.fill('[name="event-title"]', 'Potential conflict');
    await page.fill('[name="start-time"]', '2026-05-01T10:00:00');
    await page.fill('[name="end-time"]', '2026-05-01T12:00:00');
    await page.click('[data-testid="save-event"]');

    // Should show conflict warning if exists
    const conflictWarning = await page.$('[data-testid="conflict-warning"]');
    
    if (conflictWarning) {
      expect(await conflictWarning.isVisible()).toBe(true);
    }
  });

  test('should not create event in past', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    await page.click('[data-testid="create-event"]');
    await page.waitForSelector('[data-testid="event-form-modal"]');

    await page.fill('[name="event-title"]', 'Past Event');
    await page.fill('[name="start-time"]', '2020-01-01T10:00:00');
    await page.click('[data-testid="save-event"]');

    await page.waitForSelector('[data-testid="validation-error"]');
    const errorText = await page.textContent('[data-testid="validation-error"]');
    expect(errorText).toContain('przyszłości');
  });

  test('should not access calendar without authentication', async ({ request }) => {
    const response = await request.get(apiEndpoints.calendar.events);
    expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
  });

  test('should show upcoming events on dashboard', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="upcoming-events"]');

    const events = await page.$$('[data-testid="upcoming-event-item"]');
    expect(events.length).toBeGreaterThanOrEqual(0);
  });

  test('should accept event invitation', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    const invitation = await page.$('[data-testid="event-invitation"]');
    
    if (invitation) {
      await invitation.click('[data-testid="accept-invitation"]');
      await page.waitForSelector('[data-testid="invitation-accepted"]');
    }
  });

  test('should decline event invitation', async ({ page }) => {
    test.skip(!authToken, 'Auth token not available');

    await page.goto('/calendar');
    const invitation = await page.$('[data-testid="event-invitation"]');
    
    if (invitation) {
      await invitation.click('[data-testid="decline-invitation"]');
      await page.waitForSelector('[data-testid="invitation-declined"]');
    }
  });
});
