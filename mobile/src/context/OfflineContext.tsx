import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncService } from '../services/sync';
import { StorageService } from '../services/storage';

interface OfflineContextType {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  pendingSyncCount: 0,
  isSyncing: false,
  syncNow: async () => {},
});

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const checkQueue = async () => {
    const queue = await StorageService.getSyncQueue();
    setPendingSyncCount(queue.length);
  };

  useEffect(() => {
    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(!!state.isConnected);
      checkQueue();
    });

    // Subscriptions
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      setIsOnline(online);
      if (online) {
        syncNow();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await SyncService.processOfflineQueue();
      await checkQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSyncCount, isSyncing, syncNow }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
