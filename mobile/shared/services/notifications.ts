import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { setupNotificationNavigationListener } from '../../src/features/notifications/services/pushRegistration';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Setup push notifications for the app
 */
export async function setupNotifications(): Promise<void> {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Get push token (for production, you'd send this to your backend)
    const token = await getPushToken();
    if (token) {
      console.log('Push token:', token);
      // TODO: Send token to backend
    }

    // Setup notification listener for navigation
    setupNotificationNavigationListener();
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
}

/**
 * Get the push token for this device
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id',
    });
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Setup notification event listeners
 */
function setupNotificationListeners(): void {
  // Listener for notifications received while app is foregrounded
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    // Handle notification data
  });

  // Listener for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response:', response);
    // Navigate based on notification data
    const data = response.notification.request.content.data;
    // TODO: Handle navigation based on data
  });

  // Cleanup subscriptions
  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  delaySeconds: number,
  data?: Record<string, string>
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      seconds: delaySeconds,
    },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Send an immediate local notification (for testing)
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
}

export default {
  setupNotifications,
  getPushToken,
  scheduleLocalNotification,
  cancelAllNotifications,
  sendImmediateNotification,
};
