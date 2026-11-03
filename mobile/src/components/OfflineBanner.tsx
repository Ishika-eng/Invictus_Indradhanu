import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingSyncCount, isSyncing, syncNow } = useOffline();
  const { t } = useLanguage();

  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, !isOnline ? styles.offlineBg : styles.syncingBg]}>
      <View style={styles.leftRow}>
        <WifiOff color={COLORS.white} size={18} />
        <Text style={styles.text}>
          {!isOnline
            ? t('offlineMode') || 'Offline Mode (Saved Data)'
            : `${pendingSyncCount} ${t('pendingUpdates') || 'pending updates'}`}
        </Text>
      </View>

      {isOnline && pendingSyncCount > 0 && (
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={syncNow}
          disabled={isSyncing}
        >
          <RefreshCw color={COLORS.primary} size={16} />
          <Text style={styles.syncBtnText}>
            {isSyncing ? '...' : t('sync') || 'Sync'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offlineBg: {
    backgroundColor: '#DC2626',
  },
  syncingBg: {
    backgroundColor: '#D97706',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  syncBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
