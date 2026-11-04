import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Circle, Clock, ArrowRight, Sprout } from 'lucide-react-native';
import { COLORS } from '../../../src/constants/colors';
import { useAuth } from '../../../src/context/AuthContext';
import { useLanguage } from '../../../src/context/LanguageContext';
import { useOffline } from '../../../src/context/OfflineContext';
import { ApiService } from '../../../src/services/api';
import { StorageService } from '../../../src/services/storage';
import { FarmerButton } from '../../../src/components/FarmerButton';

const DEFAULT_STAGES = [
  { stage_name: 'Nursery / Seedling (रोपवाटिका)', duration: '15-25 days', gdd: '200' },
  { stage_name: 'Transplanting (पुनर्लागवड)', duration: '5-10 days', gdd: '350' },
  { stage_name: 'Vegetative Growth (शाकीय वाढ)', duration: '20-30 days', gdd: '600' },
  { stage_name: 'Flowering (फुलोरा)', duration: '15-20 days', gdd: '900' },
  { stage_name: 'Fruiting / Fruit Setting (फळ धारणा)', duration: '25-35 days', gdd: '1250' },
  { stage_name: 'Harvesting (कापणी / काढणी)', duration: '20-40 days', gdd: '1600' },
];

export default function GrowthStageScreen() {
  const router = useRouter();
  const { id: farmCropId } = useLocalSearchParams<{ id: string }>();
  const { activeFarm } = useAuth();
  const { t } = useLanguage();
  const { isOnline } = useOffline();

  const [stages, setStages] = useState<any[]>(DEFAULT_STAGES);
  const [currentStage, setCurrentStage] = useState('Flowering');
  const [selectedStage, setSelectedStage] = useState('Flowering');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeFarm || !farmCropId) return;

    ApiService.getFarmCrops(activeFarm.id).then((res) => {
      if (res.data) {
        const crop = res.data.find((c: any) => c.id === farmCropId);
        if (crop) {
          setCurrentStage(crop.current_stage_name);
          setSelectedStage(crop.current_stage_name);

          if (crop.crop?.growth_stages && crop.crop.growth_stages.length > 0) {
            setStages(crop.crop.growth_stages);
          }
        }
      }
    });
  }, [activeFarm, farmCropId]);

  const handleUpdateStage = async () => {
    if (!activeFarm || !farmCropId) return;

    setSaving(true);
    try {
      if (!isOnline) {
        // Queue action for offline sync
        await StorageService.addToSyncQueue({
          type: 'STAGE_UPDATE',
          payload: { farmId: activeFarm.id, farmCropId, stageName: selectedStage },
          timestamp: Date.now(),
        });
        setCurrentStage(selectedStage);
        Alert.alert(t('savedOffline') || 'Saved Offline', t('stageOfflineQueued') || 'Stage update queued. Will sync when connection returns.');
        router.back();
        return;
      }

      const res = await ApiService.updateCropStage(activeFarm.id, farmCropId, selectedStage);
      if (res.data) {
        setCurrentStage(selectedStage);
        Alert.alert(t('success') || 'Success', t('stageUpdatedSuccess') || 'Growth stage updated! Climate risks and advisories will reflect this stage.');
        router.back();
      } else {
        Alert.alert('Error', res.error || 'Failed to update stage');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Sprout color={COLORS.primary} size={32} />
        </View>
        <Text style={styles.title}>{t('growthStageManagement') || 'Growth Stage Tracking'}</Text>
        <Text style={styles.subtitle}>
          {t('growthStageDesc') || 'Accurate growth stage ensures weather risk thresholds match current plant vulnerability.'}
        </Text>
      </View>

      <View style={styles.currentCard}>
        <Text style={styles.currentLabel}>{t('activeGrowthStage') || 'Current Active Stage'}:</Text>
        <Text style={styles.currentValue}>{currentStage}</Text>
      </View>

      <Text style={styles.listHeading}>{t('selectCurrentStage') || 'Select Phenological Stage'}</Text>

      <View style={styles.stagesList}>
        {stages.map((stage, idx) => {
          const isSelected = selectedStage === stage.stage_name;
          const isCurrentActive = currentStage === stage.stage_name;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.stageItem,
                isSelected && styles.stageItemSelected,
                isCurrentActive && styles.stageItemActiveBorder,
              ]}
              onPress={() => setSelectedStage(stage.stage_name)}
              activeOpacity={0.8}
            >
              <View style={styles.stageLeft}>
                <View style={styles.stageIndexBadge}>
                  <Text style={styles.stageIndexText}>{idx + 1}</Text>
                </View>
                <View style={styles.stageTextCol}>
                  <Text style={[styles.stageName, isSelected && styles.stageNameSelected]}>
                    {stage.stage_name}
                  </Text>
                  {stage.duration ? (
                    <View style={styles.stageMeta}>
                      <Clock color={COLORS.textMuted} size={12} />
                      <Text style={styles.stageMetaText}>{stage.duration}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {isSelected ? (
                <CheckCircle2 color={COLORS.primary} size={24} />
              ) : (
                <Circle color={COLORS.border} size={24} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <FarmerButton
          title={t('confirmStageUpdate') || 'Update Growth Stage'}
          onPress={handleUpdateStage}
          loading={saving}
          disabled={selectedStage === currentStage}
        />
      </View>
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
  },
  currentCard: {
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 14,
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  listHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  stagesList: {
    gap: 10,
    marginBottom: 20,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  stageItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7FEFA',
  },
  stageItemActiveBorder: {
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  stageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  stageIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIndexText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  stageTextCol: {
    flex: 1,
  },
  stageName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  stageNameSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  stageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stageMetaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footer: {
    marginVertical: 10,
  },
});

