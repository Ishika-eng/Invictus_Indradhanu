import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Tractor, MapPin, Plus, CheckCircle2, ChevronRight, Sprout } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { FarmerButton } from '../../src/components/FarmerButton';

export default function FarmsListScreen() {
  const router = useRouter();
  const { farms, activeFarm, setActiveFarm } = useAuth();
  const { t } = useLanguage();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>{t('myFarms') || 'My Registered Farms'}</Text>
        <TouchableOpacity
          style={styles.addBtnSmall}
          onPress={() => router.push('/farms/add')}
        >
          <Plus color={COLORS.white} size={18} />
          <Text style={styles.addBtnSmallText}>{t('addPlot') || 'Add Plot'}</Text>
        </TouchableOpacity>
      </View>

      {farms.length === 0 ? (
        <View style={styles.emptyCard}>
          <Tractor color={COLORS.textMuted} size={48} />
          <Text style={styles.emptyTitle}>{t('noFarmsRegistered') || 'No farm plots found'}</Text>
          <Text style={styles.emptyDesc}>
            {t('registerFarmPrompt') || 'Register your first farm plot with GPS location to start receiving advisories.'}
          </Text>
          <FarmerButton
            title={t('addFarm') || 'Add New Farm'}
            onPress={() => router.push('/farms/add')}
            style={{ marginTop: 16, width: '100%' }}
          />
        </View>
      ) : (
        farms.map((farm) => {
          const isActive = activeFarm?.id === farm.id;
          return (
            <TouchableOpacity
              key={farm.id}
              style={[styles.farmCard, isActive && styles.farmCardActive]}
              onPress={() => setActiveFarm(farm)}
              activeOpacity={0.8}
            >
              <View style={styles.farmCardHeader}>
                <View style={styles.farmTitleRow}>
                  <Text style={styles.farmName}>{farm.farm_name}</Text>
                  {isActive && (
                    <View style={styles.activeTag}>
                      <CheckCircle2 color={COLORS.primary} size={14} />
                      <Text style={styles.activeTagText}>{t('active') || 'Active'}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.farmSize}>{farm.size_acres} {t('acres') || 'Acres'}</Text>
              </View>

              <View style={styles.locationRow}>
                <MapPin color={COLORS.textMuted} size={14} />
                <Text style={styles.locationText}>
                  {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cropActionBtn}
                  onPress={() => router.push('/crops/add')}
                >
                  <Sprout color={COLORS.primary} size={16} />
                  <Text style={styles.cropActionText}>{t('addCrop') || '+ Add Crop'}</Text>
                </TouchableOpacity>

                <ChevronRight color={COLORS.textMuted} size={20} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addBtnSmallText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  farmCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7FEFA',
  },
  farmCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  farmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  farmSize: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  cropActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cropActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

