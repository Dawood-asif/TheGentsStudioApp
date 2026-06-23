import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { api } from '../api/client';

export async function registerForPushNotifications(customerId) {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return { registered: false, reason: 'Permission denied' };

    const token = await messaging().getToken();
    if (!token) return { registered: false, reason: 'No FCM token returned' };

    await api.registerPushToken({ customerId, token, platform: Platform.OS, deviceId: `${Platform.OS}-${customerId || 'guest'}` });
    return { registered: true, token };
  } catch (error) {
    return { registered: false, reason: error.message };
  }
}

export function listenForForegroundNotifications(onMessage) {
  return messaging().onMessage(async remoteMessage => {
    onMessage?.(remoteMessage);
  });
}
