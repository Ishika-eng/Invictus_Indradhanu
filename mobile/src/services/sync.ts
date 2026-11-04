import NetInfo from '@react-native-community/netinfo';
import { StorageService } from './storage';
import { ApiService } from './api';

export const SyncService = {
  /**
   * Process all queued actions created while offline
   */
  async processOfflineQueue(): Promise<{ processed: number; failed: number }> {
    const queue = await StorageService.getSyncQueue();
    if (!queue || queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return { processed: 0, failed: queue.length };
    }

    let processedCount = 0;
    const remainingQueue: any[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'STAGE_UPDATE') {
          const { farmId, farmCropId, stageName } = item.payload;
          const res = await ApiService.updateCropStage(farmId, farmCropId, stageName);
          if (res.error) {
            remainingQueue.push(item);
          } else {
            processedCount++;
          }
        } else if (item.type === 'ADVISORY_FEEDBACK') {
          const { advisoryId, feedback } = item.payload;
          const res = await ApiService.submitAdvisoryFeedback(advisoryId, feedback);
          if (res.error) {
            remainingQueue.push(item);
          } else {
            processedCount++;
          }
        } else {
          // Unknown item type, drop
        }
      } catch {
        remainingQueue.push(item);
      }
    }

    // Save back any that failed to retry later
    await StorageService.clearSyncQueue();
    for (const remaining of remainingQueue) {
      await StorageService.addToSyncQueue(remaining);
    }

    return { processed: processedCount, failed: remainingQueue.length };
  },

  /**
   * Listen to network status changes and trigger background sync when coming online
   */
  initNetworkListener(onStatusChange?: (isConnected: boolean) => void) {
    return NetInfo.addEventListener((state) => {
      const isOnline = !!state.isConnected && !!state.isInternetReachable;
      if (onStatusChange) {
        onStatusChange(isOnline);
      }
      if (isOnline) {
        // Automatically attempt to drain the queue
        SyncService.processOfflineQueue().catch(console.warn);
      }
    });
  }
};

