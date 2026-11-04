import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { History, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { ApiService } from '../../src/services/api';
import { RiskBadge } from '../../src/components/RiskBadge';
import { AudioPlayer } from '../../src/components/AudioPlayer';

export default function AdvisoryHistoryScreen() {
  const { activeFarm } = useAuth();
  const { t } = useLanguage();

  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const loadHistory = async () => {
    if (!activeFarm) return;
    setLoading(true);

    try {
      const res = await ApiService.getAdvisoriesHistory(activeFarm.id);
      if (res.data) {
        setAdvisories(res.data);
        setIsCached(!!res.isOfflineCache);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeFarm]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <History color={COLORS.primary} size={32} />
        </View>
        <Text style={styles.title}>{t('advisoryHistory') || 'Advisory History'}</Text>
        <Text style={styles.subtitle}>
          {t('historySubtitle') || 'Access past recommendations anytime, even without an active internet connection.'}
        </Text>
      </View>

      {isCached && (
        <View style={styles.cacheNotice}>
          <Text style={styles.cacheNoticeText}>💾 {t('offlineCachedData') || 'Loaded from offline storage'}</Text>
        </View>
      )}

      {advisories.length === 0 ? (
        <View style={styles.emptyCard}>
          <ShieldCheck color={COLORS.textMuted} size={40} />
          <Text style={styles.emptyText}>{t('noAdvisoriesFound') || 'No past advisories found for this farm plot.'}</Text>
        </View>
      ) : (
        advisories.map((adv, idx) => (
          <View key={adv.id || idx} style={styles.historyCard}>
            <View style={styles.cardTop}>
              <RiskBadge level={adv.urgency || 'HIGH'} label={adv.urgency || 'HIGH'} size="sm" />
              <View style={styles.dateRow}>
                <Calendar color={COLORS.textMuted} size={14} />
                <Text style={styles.dateText}>
                  {adv.created_at ? new Date(adv.created_at).toLocaleDateString() : 'Recent'}
                </Text>
              </View>
            </View>

            <Text style={styles.actionTitle}>{adv.immediate_action}</Text>
            <Text style={styles.whyText}>{adv.why_it_matters}</Text>

            {adv.risk_if_ignored ? (
              <View style={styles.riskBox}>
                <Text style={styles.riskText}>⚠️ {adv.risk_if_ignored}</Text>
              </View>
            ) : null}

            <AudioPlayer
              textToSpeak={`${adv.immediate_action}. ${adv.why_it_matters}`}
              label={t('listenAdvisory')}
            />

            {adv.status === 'APPLIED' && (
              <View style={styles.appliedTag}>
                <CheckCircle2 color={COLORS.primary} size={14} />
                <Text style={styles.appliedText}>{t('actionApplied') || 'Action Verified on Farm'}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  cacheNotice: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  cacheNoticeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 10,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 6,
  },
  whyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 8,
  },
  riskBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  riskText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  appliedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});

