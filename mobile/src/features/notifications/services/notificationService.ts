import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { NotificationPermission, NotificationChannel } from './api/types';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<NotificationPermission> {
  if (!Device.isDevice) {
    return {
      status: 'undetermined',
      canShowBadge: false,
      canPlaySound: false,
      canAlert: false,
      canShowBanner: false,
    };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  const permissions = await Notifications.getPermissionsAsync();

  return {
    status: finalStatus,
    canShowBadge: permissions?.canShowBadge ?? false,
    canPlaySound: permissions?.shouldPlaySound ?? false,
    canAlert: permissions?.shouldShowAlert ?? false,
    canShowBanner: permissions?.shouldShowBanner ?? false,
  };
}

/**
 * Get Expo push token for device
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return expoPushToken;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Set application badge count
 */
export async function setBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Get current badge count
 */
export async function getBadgeCountAsync(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Create notification channels for Android
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    const channels: NotificationChannel[] = [
      {
        id: 'messages',
        name: 'Wiadomości',
        description: 'Powiadomienia o nowych wiadomościach',
        importance: 'high',
        sound: 'default',
        vibration: true,
      },
      {
        id: 'calendar',
        name: 'Kalendarz',
        description: 'Przypomnienia o wydarzeniach',
        importance: 'high',
        sound: 'default',
        vibration: true,
      },
      {
        id: 'materials',
        name: 'Materiały',
        description: 'Nowe materiały edukacyjne',
        importance: 'default',
        sound: 'default',
      },
      {
        id: 'reminders',
        name: 'Przypomnienia',
        description: 'Przypomnienia o lekach i ćwiczeniach',
        importance: 'high',
        sound: 'default',
        vibration: true,
      },
      {
        id: 'system',
        name: 'Systemowe',
        description: 'Ważne ogłoszenia systemowe',
        importance: 'high',
        sound: 'default',
        vibration: true,
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: getImportanceValue(channel.importance),
        sound: channel.sound || 'default',
        vibrationPattern: channel.vibration ? [0, 250, 250, 250] : undefined,
        lightColor: channel.light ? '#4F46E5' : undefined,
      });
    }
  }
}

function getImportanceValue(importance: string): number {
  switch (importance) {
    case 'high':
      return Notifications.AndroidImportance.HIGH;
    case 'default':
      return Notifications.AndroidImportance.DEFAULT;
    case 'low':
      return Notifications.AndroidImportance.LOW;
    default:
      return Notifications.AndroidImportance.DEFAULT;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification({
  title,
  body,
  data,
  triggerSeconds,
  channelId,
}: {
  title: string;
  body: string;
  data?: Record<string, string>;
  triggerSeconds: number;
  channelId?: string;
}): Promise<string> {
  const triggerId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      ...(channelId && Platform.OS === 'android' && { channelId }),
    },
    trigger: {
      seconds: triggerSeconds,
    },
  });

  return triggerId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(triggerId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(triggerId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotificationsAsync() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Handle notification tap
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Handle notification received while app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Initialize notifications - call this on app startup
 */
export async function initializeNotifications(): Promise<{
  permission: NotificationPermission;
  pushToken: string | null;
}> {
  // Setup channels
  await setupNotificationChannels();

  // Request permissions
  const permission = await requestNotificationPermissions();

  // Get push token
  const pushToken = permission.status === 'granted' ? await getExpoPushToken() : null;

  return { permission, pushToken };
}

export default {
  requestNotificationPermissions,
  getExpoPushToken,
  setBadgeCountAsync,
  getBadgeCountAsync,
  setupNotificationChannels,
  scheduleLocalNotification,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
  getScheduledNotificationsAsync,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  initializeNotifications,
};
