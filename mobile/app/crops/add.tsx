import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Sprout, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { ApiService } from '../../src/services/api';
import { FarmerButton } from '../../src/components/FarmerButton';

const INITIAL_CROPS = [
  { id: 'tomato', name: 'Tomato (टोमॅटो)', scientific: 'Solanum lycopersicum', defaultStage: 'Transplanting' },
  { id: 'rice', name: 'Rice (भात / धान)', scientific: 'Oryza sativa', defaultStage: 'Nursery / Seedling' },
  { id: 'wheat', name: 'Wheat (गहू)', scientific: 'Triticum aestivum', defaultStage: 'Crown Root Initiation' },
  { id: 'cotton', name: 'Cotton (कापूस)', scientific: 'Gossypium hirsutum', defaultStage: 'Squaring' },
  { id: 'maize', name: 'Maize (मका)', scientific: 'Zea mays', defaultStage: 'Vegetative Growth' },
  { id: 'sugarcane', name: 'Sugarcane (ऊस)', scientific: 'Saccharum officinarum', defaultStage: 'Tillering' },
];

export default function AddCropScreen() {
  const router = useRouter();
  const { activeFarm } = useAuth();
  const { t } = useLanguage();

  const [cropsCatalog, setCropsCatalog] = useState<any[]>(INITIAL_CROPS);
  const [selectedCrop, setSelectedCrop] = useState<any>(INITIAL_CROPS[0]);
  const [variety, setVariety] = useState('');
  const [allocatedAcres, setAllocatedAcres] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStageName, setCurrentStageName] = useState('Transplanting');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Attempt fetching live crops catalog from backend
    ApiService.getCropsCatalog().then((res) => {
      if (res.data && res.data.length > 0) {
        setCropsCatalog(res.data);
        setSelectedCrop(res.data[0]);
        if (res.data[0].growth_stages?.[0]) {
          setCurrentStageName(res.data[0].growth_stages[0].stage_name);
        }
      }
    });
  }, []);

  const handleSelectCrop = (crop: any) => {
    setSelectedCrop(crop);
    if (crop.growth_stages && crop.growth_stages.length > 0) {
      setCurrentStageName(crop.growth_stages[0].stage_name);
    } else {
      setCurrentStageName(crop.defaultStage || 'Vegetative');
    }
  };

  const handleRegisterCrop = async () => {
    if (!activeFarm) {
      setErrorMsg('No active farm selected');
      return;
    }
    const acresNum = parseFloat(allocatedAcres);
    if (isNaN(acresNum) || acresNum <= 0) {
      setErrorMsg(t('enterValidAcres') || 'Please enter valid acreage for this crop');
      return;
    }
    if (acresNum > activeFarm.size_acres) {
      setErrorMsg(`Allocated acres (${acresNum}) cannot exceed total farm size (${activeFarm.size_acres} acres).`);
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await ApiService.addFarmCrop(activeFarm.id, {
        crop_id: selectedCrop.id,
        variety: variety.trim() || undefined,
        sowing_date: sowingDate,
        current_stage_name: currentStageName,
        allocated_acres: acresNum,
      });

      if (res.data) {
        Alert.alert(t('success') || 'Success', t('cropAddedSuccess') || 'Crop registered successfully!');
        router.back();
      } else {
        setErrorMsg(res.error || 'Failed to register crop');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error registering crop');
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
        <Text style={styles.title}>{t('selectCrop') || 'Select Crop'}</Text>
        <Text style={styles.subtitle}>
          {t('selectCropDesc') || 'Crop-specific physiological models are used to calculate climate stress.'}
        </Text>
      </View>

      {/* 6 Core Crops Grid */}
      <Text style={styles.sectionTitle}>{t('chooseCrop') || 'Choose Crop (पीक निवडा)'}</Text>
      <View style={styles.cropsGrid}>
        {cropsCatalog.map((crop) => {
          const isSelected = selectedCrop?.id === crop.id;
          return (
            <TouchableOpacity
              key={crop.id}
              style={[styles.cropCard, isSelected && styles.cropCardSelected]}
              onPress={() => handleSelectCrop(crop)}
            >
              <View style={styles.cropCardTop}>
                <Text style={[styles.cropName, isSelected && styles.cropNameSelected]}>
                  {crop.name}
                </Text>
                {isSelected && <CheckCircle2 color={COLORS.primary} size={20} />}
              </View>
              <Text style={styles.cropScientific}>{crop.scientific_name || crop.scientific}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Crop Details Form */}
      <View style={styles.formCard}>
        <Text style={styles.label}>{t('variety') || 'Variety / वाण (Optional)'}</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Vaishali / Abhinav / US-312"
          placeholderTextColor={COLORS.textMuted}
          value={variety}
          onChangeText={setVariety}
        />

        <Text style={styles.label}>{t('allocatedAcres') || 'Area Allocated (एकर)'} *</Text>
        <TextInput
          style={styles.input}
          placeholder={`Max ${activeFarm?.size_acres || 5} acres`}
          placeholderTextColor={COLORS.textMuted}
          keyboardType="decimal-pad"
          value={allocatedAcres}
          onChangeText={setAllocatedAcres}
        />

        <Text style={styles.label}>{t('sowingDate') || 'Sowing / Transplanting Date (पेरणी तारीख)'}</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          value={sowingDate}
          onChangeText={setSowingDate}
        />

        <Text style={styles.label}>{t('currentStage') || 'Current Growth Stage (सध्याचा टप्पा)'}</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Flowering / Vegetative"
          placeholderTextColor={COLORS.textMuted}
          value={currentStageName}
          onChangeText={setCurrentStageName}
        />

        {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
      </View>

      <View style={styles.footer}>
        <FarmerButton
          title={t('confirmCrop') || 'Register Crop & Begin Advisory'}
          onPress={handleRegisterCrop}
          loading={saving}
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
    marginTop: 8,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  cropsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  cropCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cropCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  cropCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cropNameSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  cropScientific: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: COLORS.textDark,
  },
  errorText: {
    color: COLORS.riskCritical,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  footer: {
    marginVertical: 20,
  },
});

