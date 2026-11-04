import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'indradhanu_jwt_token';
const REFRESH_TOKEN_KEY = 'indradhanu_refresh_token';
const LANGUAGE_KEY = 'indradhanu_language';
const OFFLINE_ADVISORIES_KEY = 'indradhanu_offline_advisories';
const OFFLINE_QUEUE_KEY = 'indradhanu_sync_queue';
const ACTIVE_FARM_KEY = 'indradhanu_active_farm_id';

export const StorageService = {
  // Secure tokens (JWT)
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },

  // Language preference
  async saveLanguage(lang: string): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  },

  async getLanguage(): Promise<string | null> {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  },

  // Active Farm Plot
  async saveActiveFarmId(farmId: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_FARM_KEY, farmId);
  },

  async getActiveFarmId(): Promise<string | null> {
    return await AsyncStorage.getItem(ACTIVE_FARM_KEY);
  },

  // Offline Cached Advisories
  async saveCachedAdvisories(advisories: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_ADVISORIES_KEY, JSON.stringify(advisories));
    } catch (e) {
      console.warn('Failed to cache advisories offline:', e);
    }
  },

  async getCachedAdvisories(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_ADVISORIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Offline Sync Queue (Actions taken while disconnected)
  async addToSyncQueue(action: { type: string; payload: any; timestamp: number }): Promise<void> {
    try {
      const current = await this.getSyncQueue();
      current.push(action);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to add to sync queue:', e);
    }
  },

  async getSyncQueue(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async clearSyncQueue(): Promise<void> {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  async clearAllSession(): Promise<void> {
    await this.removeToken();
    await AsyncStorage.removeItem(ACTIVE_FARM_KEY);
  }
};

