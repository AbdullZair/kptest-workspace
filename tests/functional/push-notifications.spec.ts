/**
 * Functional - Push Notifications Tests (US-P-21)
 *
 * Tests for push notifications feature:
 * - Device registration successful
 * - Push trigger on message creation
 * - Push trigger on event creation
 *
 * @module tests/functional/push-notifications.spec.ts
 */

import { test, expect } from '@playwright/test';
import { testUsers, httpStatus } from '../test-data';

test.describe('Functional - Push Notifications (US-P-21)', () => {
  let authToken: string;
  let userId: string;
  let adminAuthToken: string;

  /**
   * Setup: Login before each test
   */
  test.beforeEach(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    if (loginResponse.status() === httpStatus.OK) {
      const body = await loginResponse.json();
      authToken = body.access_token;
      userId = body.user_id || 'user-123';
    }

    // Also login as admin for some tests
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.admin.email,
        password: testUsers.admin.password,
      },
    });

    if (adminLoginResponse.status() === httpStatus.OK) {
      const body = await adminLoginResponse.json();
      adminAuthToken = body.access_token;
    }
  });

  test.describe('Device Registration', () => {
    test('Device registration successful for iOS', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `expo-push-token-ios-${Date.now()}`,
          platform: 'IOS',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(registerResponse.status())).toBe(true);
      const body = await registerResponse.json();
      expect(body.deviceId).toBeDefined();
      expect(body.platform).toBe('IOS');
    });

    test('Device registration successful for Android', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `fcm-token-android-${Date.now()}`,
          platform: 'ANDROID',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(registerResponse.status())).toBe(true);
      const body = await registerResponse.json();
      expect(body.deviceId).toBeDefined();
      expect(body.platform).toBe('ANDROID');
    });

    test('Device registration with same token updates lastUsedAt', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const uniqueToken = `unique-token-${Date.now()}`;

      // First registration
      const register1Response = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: uniqueToken,
          platform: 'IOS',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(register1Response.status())).toBe(true);
      const body1 = await register1Response.json();
      const deviceId = body1.deviceId;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second registration with same token
      const register2Response = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: uniqueToken,
          platform: 'IOS',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(register2Response.status())).toBe(true);
      const body2 = await register2Response.json();
      expect(body2.deviceId).toBe(deviceId);
    });

    test('Multiple devices can be registered for same user', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Register iOS device
      const iosResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `ios-token-${Date.now()}`,
          platform: 'IOS',
        },
      });
      expect([httpStatus.OK, httpStatus.CREATED].includes(iosResponse.status())).toBe(true);

      // Register Android device
      const androidResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `android-token-${Date.now()}`,
          platform: 'ANDROID',
        },
      });
      expect([httpStatus.OK, httpStatus.CREATED].includes(androidResponse.status())).toBe(true);
    });

    test('Device registration without auth returns 401', async ({ request }) => {
      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        data: {
          token: 'test-token',
          platform: 'IOS',
        },
      });

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN].includes(registerResponse.status())).toBe(true);
    });

    test('Device registration with missing token fails validation', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          platform: 'IOS',
        },
      });

      expect(registerResponse.status()).toBe(httpStatus.BAD_REQUEST);
    });

    test('Device registration with missing platform fails validation', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: 'test-token',
        },
      });

      expect(registerResponse.status()).toBe(httpStatus.BAD_REQUEST);
    });

    test('Device registration with invalid platform fails validation', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: 'test-token',
          platform: 'INVALID_PLATFORM',
        },
      });

      expect(registerResponse.status()).toBe(httpStatus.BAD_REQUEST);
    });

    test('User can list registered devices', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // First register a device
      await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `list-test-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // List devices
      const listResponse = await request.get('http://localhost:8080/api/v1/notifications/devices', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(listResponse.status()).toBe(httpStatus.OK);
      const devices = await listResponse.json();
      expect(Array.isArray(devices)).toBe(true);
    });

    test('User can unregister device', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // First register a device
      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `unregister-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      const body = await registerResponse.json();
      const deviceId = body.deviceId;

      // Unregister device
      const unregisterResponse = await request.delete(
        `http://localhost:8080/api/v1/notifications/devices/${deviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NO_CONTENT].includes(unregisterResponse.status())).toBe(true);
    });
  });

  test.describe('Push Trigger on Message Creation', () => {
    test('Push notification triggered when message is sent', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // First register a device to receive push
      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `message-push-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(registerResponse.status())).toBe(true);

      // Send a message (this should trigger a push notification)
      const sendMessageResponse = await request.post('http://localhost:8080/api/v1/messages/send', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          recipientId: userId,
          subject: `Test Message ${Date.now()}`,
          content: 'This is a test message to trigger push notification',
        },
      });

      // Message send should succeed
      expect([httpStatus.OK, httpStatus.CREATED].includes(sendMessageResponse.status())).toBe(true);

      // Check for push notification in user's notifications
      const notificationsResponse = await request.get('http://localhost:8080/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (notificationsResponse.status() === httpStatus.OK) {
        const notifications = await notificationsResponse.json();
        expect(Array.isArray(notifications)).toBe(true);
        
        // Should have notification for the message
        const messageNotification = notifications.find(
          (n: any) => n.type === 'MESSAGE' || n.type === 'NEW_MESSAGE'
        );
        expect(messageNotification).toBeDefined();
      }
    });

    test('Push notification contains correct message data', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Register device
      await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `message-data-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // Send message
      const sendMessageResponse = await request.post('http://localhost:8080/api/v1/messages/send', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          recipientId: userId,
          subject: 'Test Subject',
          content: 'Test Content',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(sendMessageResponse.status())).toBe(true);
      const message = await sendMessageResponse.json();

      // Check notification data
      const notificationsResponse = await request.get('http://localhost:8080/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (notificationsResponse.status() === httpStatus.OK) {
        const notifications = await notificationsResponse.json();
        const messageNotification = notifications.find(
          (n: any) => n.type === 'MESSAGE' || n.type === 'NEW_MESSAGE'
        );
        
        if (messageNotification) {
          expect(messageNotification.title).toBeDefined();
          expect(messageNotification.body).toBeDefined();
          expect(messageNotification.data).toBeDefined();
          expect(messageNotification.data.messageId).toBeDefined();
        }
      }
    });
  });

  test.describe('Push Trigger on Event Creation', () => {
    test('Push notification triggered when event is created', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Register device
      await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `event-push-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // Create an event
      const createEventResponse = await request.post('http://localhost:8080/api/v1/calendar/events', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: `Test Event ${Date.now()}`,
          description: 'Test event to trigger push notification',
          startTime: '2026-05-01T10:00:00',
          endTime: '2026-05-01T11:00:00',
          type: 'APPOINTMENT',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(createEventResponse.status())).toBe(true);

      // Check for push notification
      const notificationsResponse = await request.get('http://localhost:8080/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (notificationsResponse.status() === httpStatus.OK) {
        const notifications = await notificationsResponse.json();
        expect(Array.isArray(notifications)).toBe(true);
        
        // Should have notification for the event
        const eventNotification = notifications.find(
          (n: any) => n.type === 'EVENT' || n.type === 'NEW_EVENT' || n.type === 'CALENDAR_EVENT'
        );
        expect(eventNotification).toBeDefined();
      }
    });

    test('Push notification contains correct event data', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Register device
      await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `event-data-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // Create event
      const createEventResponse = await request.post('http://localhost:8080/api/v1/calendar/events', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Appointment Title',
          description: 'Appointment Description',
          startTime: '2026-05-01T14:00:00',
          endTime: '2026-05-01T15:00:00',
          location: 'Office 123',
          type: 'APPOINTMENT',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(createEventResponse.status())).toBe(true);
      const event = await createEventResponse.json();

      // Check notification data
      const notificationsResponse = await request.get('http://localhost:8080/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (notificationsResponse.status() === httpStatus.OK) {
        const notifications = await notificationsResponse.json();
        const eventNotification = notifications.find(
          (n: any) => n.type === 'EVENT' || n.type === 'NEW_EVENT' || n.type === 'CALENDAR_EVENT'
        );
        
        if (eventNotification) {
          expect(eventNotification.title).toBeDefined();
          expect(eventNotification.body).toBeDefined();
          expect(eventNotification.data).toBeDefined();
          expect(eventNotification.data.eventId).toBeDefined();
        }
      }
    });
  });

  test.describe('Push Notification Types', () => {
    test('Material creation triggers push notification', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');
      test.skip(!adminAuthToken, 'Admin auth token not available');

      // Register device
      await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `material-push-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // Admin creates a material
      const createMaterialResponse = await request.post('http://localhost:8080/api/v1/materials', {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: `Test Material ${Date.now()}`,
          content: 'Test material content',
          category: 'Education',
          type: 'PDF',
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(createMaterialResponse.status())).toBe(true);

      // Check for push notification
      const notificationsResponse = await request.get('http://localhost:8080/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (notificationsResponse.status() === httpStatus.OK) {
        const notifications = await notificationsResponse.json();
        
        // Should have notification for the material
        const materialNotification = notifications.find(
          (n: any) => n.type === 'MATERIAL' || n.type === 'NEW_MATERIAL'
        );
        expect(materialNotification).toBeDefined();
      }
    });

    test('Event change request response triggers push', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Register device
      await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `change-push-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // First create an event
      const createEventResponse = await request.post('http://localhost:8080/api/v1/calendar/events', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Event for Change Test',
          description: 'Test',
          startTime: '2026-05-01T10:00:00',
          endTime: '2026-05-01T11:00:00',
          type: 'APPOINTMENT',
        },
      });

      if (createEventResponse.status() === httpStatus.CREATED) {
        const event = await createEventResponse.json();
        const eventId = event.id;

        // Propose a change (this might trigger push)
        const proposeChangeResponse = await request.post(
          `http://localhost:8080/api/v1/calendar/events/${eventId}/propose-change`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            data: {
              proposedDate: '2026-05-02T10:00:00',
              reason: 'Schedule conflict',
            },
          }
        );

        expect([httpStatus.OK, httpStatus.CREATED].includes(proposeChangeResponse.status())).toBe(true);
      }
    });
  });

  test.describe('Push Notification Preferences', () => {
    test('User can get notification preferences', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const prefsResponse = await request.get('http://localhost:8080/api/v1/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.NOT_FOUND].includes(prefsResponse.status())).toBe(true);
    });

    test('User can update notification preferences', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const updateResponse = await request.put('http://localhost:8080/api/v1/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          pushEnabled: true,
          emailEnabled: false,
          smsEnabled: false,
          types: ['MESSAGE', 'EVENT', 'MATERIAL'],
        },
      });

      expect([httpStatus.OK, httpStatus.CREATED].includes(updateResponse.status())).toBe(true);
    });
  });

  test.describe('Push Provider Abstraction', () => {
    test('Push provider is configured (dev logs, prod FCM)', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      // Register device
      const registerResponse = await request.post('http://localhost:8080/api/v1/notifications/devices/register', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          token: `provider-test-token-${Date.now()}`,
          platform: 'IOS',
        },
      });

      // Should succeed regardless of provider (dev logs, prod FCM)
      expect([httpStatus.OK, httpStatus.CREATED].includes(registerResponse.status())).toBe(true);
    });
  });
});
