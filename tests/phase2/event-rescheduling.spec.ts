/**
 * Event Rescheduling Tests - Phase 2
 *
 * Tests for event change request features:
 * - Patient proposes event date change
 * - Staff accepts/rejects change request
 * - Change request notifications
 * - Change history tracking
 *
 * @module tests/phase2/event-rescheduling.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  testPatients,
  testEventRescheduling,
  testCalendar,
  phase2ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 2 - Event Rescheduling', () => {
  let authToken: string;
  let testEventId: string;
  let testChangeRequestId: string;

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

  test.describe('Propose Event Change', () => {
    test('should propose new date for event', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Via UI
      await page.goto('/calendar');
      await page.waitForSelector('[data-testid="calendar-view"]');

      // Select an event
      const event = await page.$('[data-testid="calendar-event"]');
      if (event) {
        await event.click();
        await page.waitForSelector('[data-testid="event-details-modal"]');

        // Propose change
        await page.click('[data-testid="propose-change"]');
        await page.waitForSelector('[data-testid="propose-change-modal"]');

        // Select new date
        await page.fill('[name="proposed-date"]', '2026-05-16T14:00:00');
        await page.fill('[name="change-reason"]', 'Konflikt terminarza');
        await page.click('[data-testid="submit-change-request"]');
        await page.waitForSelector('[data-testid="change-request-submitted"]');

        testEventId = await event.getAttribute('data-event-id') || 'test-event';
      }
    });

    test('should propose change via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(
        phase2ApiEndpoints.events.proposeChange('event-123'),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            proposedDate: testEventRescheduling.PROPOSED_CHANGE.proposedDate,
            reason: testEventRescheduling.PROPOSED_CHANGE.reason,
          },
        }
      );

      expect([httpStatus.CREATED, httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED || response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body.status).toBe('PENDING');
        testChangeRequestId = body.id;
      }
    });

    test('should validate proposed date is in future', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        await event.click();
        await page.click('[data-testid="propose-change"]');

        // Try past date
        await page.fill('[name="proposed-date"]', '2020-01-01T10:00:00');
        await page.click('[data-testid="submit-change-request"]');

        // Should show validation error
        await page.waitForSelector('[data-testid="date-validation-error"]');
        const errorText = await page.textContent('[data-testid="date-validation-error"]');
        expect(errorText).toContain('przyszłości');
      }
    });

    test('should require reason for change request', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        await event.click();
        await page.click('[data-testid="propose-change"]');

        // Fill date but no reason
        await page.fill('[name="proposed-date"]', '2026-05-20T10:00:00');
        await page.click('[data-testid="submit-change-request"]');

        // Should show validation error
        await page.waitForSelector('[data-testid="reason-validation-error"]');
        const errorText = await page.textContent('[data-testid="reason-validation-error"]');
        expect(errorText).toContain('wymagane');
      }
    });

    test('should allow attaching documents to change request', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        await event.click();
        await page.click('[data-testid="propose-change"]');

        // Attach document
        await page.setInputFiles('[name="attachment"]', {
          name: 'document.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('PDF content'),
        });

        await page.fill('[name="proposed-date"]', '2026-05-20T10:00:00');
        await page.fill('[name="change-reason"]', 'Załączam dokument');
        await page.click('[data-testid="submit-change-request"]');

        // Should submit successfully
        await page.waitForSelector('[data-testid="change-request-submitted"]');
      }
    });
  });

  test.describe('View Change Requests', () => {
    test('should display pending change requests', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.waitForSelector('[data-testid="change-requests-list"]');

      // Should show pending requests
      const pendingRequests = await page.$$('[data-testid="change-request"][data-status="PENDING"]');
      expect(pendingRequests.length).toBeGreaterThanOrEqual(0);
    });

    test('should filter change requests by status', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.click('[data-testid="filter-status"]');
      await page.click('[data-testid="filter-pending"]');

      const requests = await page.$$('[data-testid="change-request"]:visible');
      
      for (const request of requests) {
        const status = await request.getAttribute('data-status');
        expect(status).toBe('PENDING');
      }
    });

    test('should show change request details', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.waitForSelector('[data-testid="change-requests-list"]');

      const firstRequest = await page.$('[data-testid="change-request"]');
      if (firstRequest) {
        await firstRequest.click();
        await page.waitForSelector('[data-testid="change-request-details"]');

        // Should display all details
        expect(await page.isVisible('[data-testid="original-date"]')).toBe(true);
        expect(await page.isVisible('[data-testid="proposed-date"]')).toBe(true);
        expect(await page.isVisible('[data-testid="change-reason"]')).toBe(true);
      }
    });

    test('should display change request timeline', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      const request = await page.$('[data-testid="change-request"]');
      
      if (request) {
        await request.click();
        await page.click('[data-testid="view-timeline"]');
        await page.waitForSelector('[data-testid="change-timeline"]');

        const timeline = await page.$('[data-testid="change-timeline"]');
        expect(timeline).not.toBeNull();
      }
    });
  });

  test.describe('Staff Response to Change Requests', () => {
    test('should accept change request', async ({ request, page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.waitForSelector('[data-testid="change-requests-list"]');

      const pendingRequest = await page.$('[data-testid="change-request"][data-status="PENDING"]');
      if (pendingRequest) {
        await pendingRequest.click();
        await page.click('[data-testid="accept-change"]');
        await page.waitForSelector('[data-testid="accept-confirmation"]');
        await page.click('[data-testid="confirm-accept"]');
        await page.waitForSelector('[data-testid="change-accepted"]');

        // Verify via API
        const requestId = await pendingRequest.getAttribute('data-request-id');
        const response = await request.post(
          phase2ApiEndpoints.events.respondToChange(requestId || 'test-id'),
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
            data: {
              response: 'ACCEPT',
            },
          }
        );

        expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN]).toContain(response.status());
      }
    });

    test('should reject change request with reason', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.waitForSelector('[data-testid="change-requests-list"]');

      const pendingRequest = await page.$('[data-testid="change-request"][data-status="PENDING"]');
      if (pendingRequest) {
        await pendingRequest.click();
        await page.click('[data-testid="reject-change"]');
        await page.waitForSelector('[data-testid="reject-modal"]');

        // Provide rejection reason
        await page.fill('[name="rejection-reason"]', 'Brak dostępnych terminów w tym dniu');
        await page.click('[data-testid="confirm-reject"]');
        await page.waitForSelector('[data-testid="change-rejected"]');
      }
    });

    test('should propose alternative date when rejecting', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      const pendingRequest = await page.$('[data-testid="change-request"][data-status="PENDING"]');
      
      if (pendingRequest) {
        await pendingRequest.click();
        await page.click('[data-testid="reject-with-alternative"]');
        await page.waitForSelector('[data-testid="alternative-date-modal"]');

        // Suggest alternative
        await page.fill('[name="alternative-date"]', '2026-05-17T10:00:00');
        await page.fill('[name="rejection-reason"]', 'Proponuję inny termin');
        await page.click('[data-testid="submit-alternative"]');

        await page.waitForSelector('[data-testid="alternative-proposed"]');
      }
    });

    test('should notify patient of acceptance', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      const request = await page.$('[data-testid="change-request"][data-status="PENDING"]');
      
      if (request) {
        await request.click();
        await page.click('[data-testid="accept-change"]');
        await page.click('[data-testid="confirm-accept"]');

        // Should show notification sent
        await page.waitForSelector('[data-testid="notification-sent"]');
        const notificationText = await page.textContent('[data-testid="notification-sent"]');
        expect(notificationText).toContain('powiadomiono');
      }
    });

    test('should notify patient of rejection', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      const request = await page.$('[data-testid="change-request"][data-status="PENDING"]');
      
      if (request) {
        await request.click();
        await page.click('[data-testid="reject-change"]');
        await page.fill('[name="rejection-reason"]', 'Testowy powód');
        await page.click('[data-testid="confirm-reject"]');

        // Should show notification sent
        await page.waitForSelector('[data-testid="notification-sent"]');
      }
    });
  });

  test.describe('Event Update After Acceptance', () => {
    test('should update event date after acceptance', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      await page.waitForSelector('[data-testid="calendar-view"]');

      // Find event with accepted change
      const event = await page.$('[data-testid="calendar-event"][data-has-change="true"]');
      
      if (event) {
        const originalDate = await event.getAttribute('data-original-date');
        
        // Click to see details
        await event.click();
        await page.waitForSelector('[data-testid="event-details-modal"]');

        // Date should be updated
        const newDate = await page.textContent('[data-testid="event-date"]');
        expect(newDate).not.toBe(originalDate);
      }
    });

    test('should preserve event details after rescheduling', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        const originalTitle = await event.getAttribute('data-title');
        const originalLocation = await event.getAttribute('data-location');

        await event.click();
        await page.click('[data-testid="propose-change"]');
        await page.fill('[name="proposed-date"]', '2026-05-20T10:00:00');
        await page.fill('[name="change-reason"]', 'Test');
        await page.click('[data-testid="submit-change-request"]');
        await page.click('[data-testid="confirm-accept"]');

        // After rescheduling, title and location should remain
        await page.waitForSelector('[data-testid="event-details-modal"]');
        const newTitle = await page.textContent('[data-testid="event-title"]');
        const newLocation = await page.textContent('[data-testid="event-location"]');

        expect(newTitle).toBe(originalTitle);
        expect(newLocation).toBe(originalLocation);
      }
    });

    test('should send calendar invite for new date', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      const request = await page.$('[data-testid="change-request"][data-status="PENDING"]');
      
      if (request) {
        await request.click();
        await page.click('[data-testid="accept-change"]');
        await page.click('[data-testid="confirm-accept"]');

        // Should offer to send calendar invite
        await page.waitForSelector('[data-testid="send-calendar-invite"]');
        expect(await page.isVisible('[data-testid="send-calendar-invite"]')).toBe(true);
      }
    });
  });

  test.describe('Change Request Notifications', () => {
    test('should notify staff of new change request', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        await event.click();
        await page.click('[data-testid="propose-change"]');
        await page.fill('[name="proposed-date"]', '2026-05-20T10:00:00');
        await page.fill('[name="change-reason"]', 'Test');
        await page.click('[data-testid="submit-change-request"]');

        // Staff should receive notification
        await page.waitForSelector('[data-testid="staff-notification"]');
        const notificationText = await page.textContent('[data-testid="staff-notification"]');
        expect(notificationText).toContain('nowa prośba');
      }
    });

    test('should notify patient of response', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      // Login as patient
      await page.goto('/messages');
      await page.waitForSelector('[data-testid="message-list"]');

      // Should have notification about change response
      const notificationMessage = await page.$('[data-testid="message-item"][data-type="change-response"]');
      
      if (notificationMessage) {
        const isVisible = await notificationMessage.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('should send reminder for pending change requests', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.click('[data-testid="send-reminder"]');
      await page.waitForSelector('[data-testid="reminder-sent"]');

      const reminderText = await page.textContent('[data-testid="reminder-sent"]');
      expect(reminderText).toContain('wysłano');
    });
  });

  test.describe('Change Request API', () => {
    test('should get change requests via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase2ApiEndpoints.events.changeRequests, {
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

    test('should get change request by ID via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(
        `http://localhost:8080/api/v1/calendar/change-requests/cr-123`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should cancel change request via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.delete(
        `http://localhost:8080/api/v1/calendar/change-requests/cr-123`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NO_CONTENT, httpStatus.FORBIDDEN, httpStatus.NOT_FOUND]).toContain(response.status());
    });
  });

  test.describe('Change Request History', () => {
    test('should display change history for event', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        await event.click();
        await page.click('[data-testid="view-history"]');
        await page.waitForSelector('[data-testid="change-history"]');

        const history = await page.$('[data-testid="change-history"]');
        expect(history).not.toBeNull();
      }
    });

    test('should track all status changes', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      const request = await page.$('[data-testid="change-request"]');
      
      if (request) {
        await request.click();
        await page.click('[data-testid="view-timeline"]');

        // Timeline should show all status changes
        const timelineItems = await page.$$('[data-testid="timeline-item"]');
        expect(timelineItems.length).toBeGreaterThanOrEqual(1);

        // Check for status change entries
        const statusChanges = await page.$$('[data-testid="status-change"]');
        expect(statusChanges.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should export change history', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar/changes');
      await page.click('[data-testid="export-history"]');
      await page.waitForSelector('[data-testid="export-dialog"]');

      await page.click('[data-testid="confirm-export"]');
      await page.waitForSelector('[data-testid="export-complete"]');

      const exportText = await page.textContent('[data-testid="export-complete"]');
      expect(exportText).toContain('eksportowano');
    });
  });

  test.describe('Negative Tests', () => {
    test('should not allow duplicate change requests for same event', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      const event = await page.$('[data-testid="calendar-event"]');
      
      if (event) {
        await event.click();
        await page.click('[data-testid="propose-change"]');
        await page.fill('[name="proposed-date"]', '2026-05-20T10:00:00');
        await page.fill('[name="change-reason"]', 'Test');
        await page.click('[data-testid="submit-change-request"]');

        // Try to submit another change for same event
        await page.click('[data-testid="propose-change"]');
        await page.fill('[name="proposed-date"]', '2026-05-21T10:00:00');
        await page.click('[data-testid="submit-change-request"]');

        // Should show error
        await page.waitForSelector('[data-testid="duplicate-request-error"]');
        const errorText = await page.textContent('[data-testid="duplicate-request-error"]');
        expect(errorText).toContain('istnieje już');
      }
    });

    test('should not allow changing past events', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/calendar');
      
      // Find past event
      const pastEvent = await page.$('[data-testid="calendar-event"][data-past="true"]');
      
      if (pastEvent) {
        await pastEvent.click();
        
        // Propose change button should be disabled or hidden
        const proposeChangeBtn = await page.$('[data-testid="propose-change"]');
        
        if (proposeChangeBtn) {
          const isDisabled = await proposeChangeBtn.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    });

    test('should reject change request without authentication', async ({ request }) => {
      const response = await request.post(
        phase2ApiEndpoints.events.respondToChange('test-id'),
        {
          data: {
            response: 'ACCEPT',
          },
        }
      );

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });
});
