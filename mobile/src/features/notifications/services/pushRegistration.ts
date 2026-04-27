import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Register device for push notifications
 * 
 * Steps:
 * 1. Request permissions
 * 2. Get Expo push token
 * 3. Register with backend
 * 4. Persist token in SecureStore
 */
export async function registerForPushAsync(): Promise<void> {
  // 1. Permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Push notifications permission denied');
    return;
  }

  // 2. Get Expo push token
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return;
  }

  const expoPushToken = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  if (!expoPushToken?.data) {
    console.log('Failed to get Expo push token');
    return;
  }

  // 3. Register with backend
  try {
    await fetch('https://api.kptest.com/api/v1/notifications/devices/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: expoPushToken.data,
        platform: Platform.OS,
      }),
    });
  } catch (error) {
    console.error('Failed to register push token with backend:', error);
  }

  // 4. Persist in SecureStore
  await SecureStore.setItemAsync('expo_push_token', expoPushToken.data);
  console.log('Push token registered and persisted');
}

/**
 * Unregister device from push notifications
 * 
 * Steps:
 * 1. Get token from SecureStore
 * 2. Unregister from backend
 * 3. Remove from SecureStore
 */
export async function unregisterPushAsync(): Promise<void> {
  try {
    // Get token from SecureStore
    const expoPushToken = await SecureStore.getItemAsync('expo_push_token');
    
    if (!expoPushToken) {
      console.log('No push token found to unregister');
      return;
    }

    // Unregister from backend
    try {
      await fetch(`https://api.kptest.com/api/v1/notifications/devices/${expoPushToken}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to unregister push token from backend:', error);
    }

    // Remove from SecureStore
    await SecureStore.deleteItemAsync('expo_push_token');
    console.log('Push token unregistered');
  } catch (error) {
    console.error('Error unregistering push:', error);
  }
}

/**
 * Setup notification listener for navigation
 * 
 * Navigates based on notification data.type:
 * - message → ConversationScreen
 * - event → EventDetailScreen
 * - material → MaterialDetailScreen
 */
export function setupNotificationNavigationListener(): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const { type, id } = response.notification.request.content.data;
    
    // Navigation will be handled by the app's navigation system
    // This is a placeholder for the actual navigation logic
    console.log('Notification tapped:', { type, id });
    
    // Navigation mapping based on notification type
    switch (type) {
      case 'message':
        // Navigate to ConversationScreen with threadId
        console.log('Navigate to ConversationScreen:', id);
        break;
      case 'event':
        // Navigate to EventDetailScreen with eventId
        console.log('Navigate to EventDetailScreen:', id);
        break;
      case 'material':
        // Navigate to MaterialDetailScreen with materialId
        console.log('Navigate to MaterialDetailScreen:', id);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  });
}

/**
 * Initialize push notifications - call this on app startup after login
 */
export async function initializePushNotifications(): Promise<void> {
  await registerForPushAsync();
}

/**
 * Clean up push notifications - call this on logout
 */
export async function cleanupPushNotifications(): Promise<void> {
  await unregisterPushAsync();
}

export default {
  registerForPushAsync,
  unregisterPushAsync,
  setupNotificationNavigationListener,
  initializePushNotifications,
  cleanupPushNotifications,
};
