import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiRequest } from '../api/client';

const KEY = 'gents_offline_sync_queue';

export async function enqueueOfflineAction(action) {
  const current = JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');
  const item = { id: `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString(), status: 'pending', ...action };
  await AsyncStorage.setItem(KEY, JSON.stringify([...current, item]));
  return item;
}

export async function getPendingOfflineActions() {
  return JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');
}

export async function syncOfflineQueue() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return { synced: 0, pending: await getPendingOfflineActions() };

  const queue = await getPendingOfflineActions();
  const remaining = [];
  let synced = 0;

  for (const item of queue) {
    try {
      await apiRequest(item.path, { method: item.method || 'POST', body: item.body });
      synced += 1;
    } catch (error) {
      remaining.push({ ...item, lastError: error.message });
    }
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(remaining));
  return { synced, pending: remaining };
}
