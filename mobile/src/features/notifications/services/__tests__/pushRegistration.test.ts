import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Mock modules
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('expo-secure-store');
jest.mock('expo-constants');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'ios',
    },
  };
});

// Import after mocks
import {
  registerForPushAsync,
  unregisterPushAsync,
  setupNotificationNavigationListener,
} from '../pushRegistration';

describe('pushRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      expires: 'never',
      canAlert: true,
      canBadge: true,
      canSound: true,
    });

    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      canShowBadge: true,
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldShowBanner: true,
    });

    (Device.isDevice as jest.Mock).mockReturnValue(true);

    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: 'ExponentPushToken[abc123xyz]',
    });

    (Constants.expoConfig as jest.Mock).mockReturnValue({
      extra: {
        eas: {
          projectId: 'test-project-id',
        },
      },
    });

    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('ExponentPushToken[abc123xyz]');
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  describe('registerForPushAsync', () => {
    it('should request notification permissions', async () => {
      await registerForPushAsync();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return early if permissions are not granted', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
        expires: 'never',
        canAlert: false,
        canBadge: false,
        canSound: false,
      });

      await registerForPushAsync();

      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should return early if not on a physical device', async () => {
      (Device.isDevice as jest.Mock).mockReturnValue(false);

      await registerForPushAsync();

      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should get Expo push token with correct project ID', async () => {
      await registerForPushAsync();

      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'test-project-id',
      });
    });

    it('should register token with backend', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await registerForPushAsync();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.kptest.com/api/v1/notifications/devices/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: 'ExponentPushToken[abc123xyz]',
            platform: 'ios',
          }),
        }
      );
    });

    it('should persist token in SecureStore', async () => {
      await registerForPushAsync();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'expo_push_token',
        'ExponentPushToken[abc123xyz]'
      );
    });

    it('should handle backend registration failure gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(registerForPushAsync()).resolves.not.toThrow();

      // Should still persist token
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should handle missing token data gracefully', async () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: null,
      });

      await registerForPushAsync();

      expect(fetch).not.toHaveBeenCalled();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('unregisterPushAsync', () => {
    it('should get token from SecureStore', async () => {
      await unregisterPushAsync();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('expo_push_token');
    });

    it('should return early if no token found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await unregisterPushAsync();

      expect(fetch).not.toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('should unregister token from backend', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await unregisterPushAsync();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.kptest.com/api/v1/notifications/devices/ExponentPushToken[abc123xyz]',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should remove token from SecureStore', async () => {
      await unregisterPushAsync();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('expo_push_token');
    });

    it('should handle backend unregistration failure gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(unregisterPushAsync()).resolves.not.toThrow();

      // Should still remove from SecureStore
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('setupNotificationNavigationListener', () => {
    let mockSubscription: { remove: jest.Mock };

    beforeEach(() => {
      mockSubscription = { remove: jest.fn() };
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue(
        mockSubscription
      );
    });

    it('should add notification response listener', () => {
      setupNotificationNavigationListener();

      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    it('should handle message notification type', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const subscription = setupNotificationNavigationListener();

      // Get the callback that was registered
      const callback = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock
        .calls[0][0];

      // Simulate a message notification tap
      callback({
        notification: {
          request: {
            content: {
              data: {
                type: 'message',
                id: 'thread-123',
              },
            },
          },
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('Navigate to ConversationScreen:', 'thread-123');

      consoleSpy.mockRestore();
    });

    it('should handle event notification type', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const subscription = setupNotificationNavigationListener();

      const callback = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock
        .calls[0][0];

      callback({
        notification: {
          request: {
            content: {
              data: {
                type: 'event',
                id: 'event-456',
              },
            },
          },
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('Navigate to EventDetailScreen:', 'event-456');

      consoleSpy.mockRestore();
    });

    it('should handle material notification type', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const subscription = setupNotificationNavigationListener();

      const callback = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock
        .calls[0][0];

      callback({
        notification: {
          request: {
            content: {
              data: {
                type: 'material',
                id: 'material-789',
              },
            },
          },
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('Navigate to MaterialDetailScreen:', 'material-789');

      consoleSpy.mockRestore();
    });

    it('should handle unknown notification type', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const subscription = setupNotificationNavigationListener();

      const callback = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock
        .calls[0][0];

      callback({
        notification: {
          request: {
            content: {
              data: {
                type: 'unknown',
                id: 'unknown-999',
              },
            },
          },
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('Unknown notification type:', 'unknown');

      consoleSpy.mockRestore();
    });

    it('should return subscription object', () => {
      const subscription = setupNotificationNavigationListener();

      expect(subscription).toBeDefined();
      expect(subscription.remove).toBeDefined();
    });
  });
});
