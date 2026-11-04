import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Crosshair, Tractor, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { LocationService } from '../../src/services/location';
import { ApiService } from '../../src/services/api';
import { FarmerButton } from '../../src/components/FarmerButton';

const SOIL_TYPES = ['Black Cotton (काळी माती)', 'Red Loam (तांबडी माती)', 'Alluvial (गाळाची माती)', 'Clay (चिकणमाती)', 'Sandy Loam'];

export default function AddFarmScreen() {
  const router = useRouter();
  const { refreshData } = useAuth();
  const { t } = useLanguage();

  const [farmName, setFarmName] = useState('');
  const [sizeAcres, setSizeAcres] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [soilType, setSoilType] = useState('Black Cotton (काळी माती)');
  const [capturingGps, setCapturingGps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCaptureGps = async () => {
    setCapturingGps(true);
    setErrorMsg('');
    try {
      const res = await LocationService.getCurrentLocation();
      if (res.coordinates) {
        setLatitude(res.coordinates.latitude.toString());
        setLongitude(res.coordinates.longitude.toString());
      } else {
        setErrorMsg(res.error || 'Failed to capture GPS. Enter coordinates manually.');
      }
    } finally {
      setCapturingGps(false);
    }
  };

  const handleSaveFarm = async () => {
    if (!farmName.trim()) {
      setErrorMsg(t('enterFarmName') || 'Please enter a farm name (e.g. South Plot)');
      return;
    }
    const acresNum = parseFloat(sizeAcres);
    if (isNaN(acresNum) || acresNum <= 0) {
      setErrorMsg(t('enterValidAcres') || 'Please enter valid acres (e.g. 2.5)');
      return;
    }
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lonNum)) {
      setErrorMsg(t('captureGpsPrompt') || 'Please capture or enter GPS latitude and longitude');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await ApiService.createFarm({
        farm_name: farmName.trim(),
        latitude: latNum,
        longitude: lonNum,
        size_acres: acresNum,
        soil_type: soilType,
      });

      if (res.data) {
        await refreshData();
        Alert.alert(t('success') || 'Success', t('farmSavedSuccess') || 'Farm registered successfully!');
        router.back();
      } else {
        setErrorMsg(res.error || 'Failed to create farm');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error registering farm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Tractor color={COLORS.primary} size={32} />
        </View>
        <Text style={styles.title}>{t('addFarmTitle') || 'Register Farm Plot'}</Text>
        <Text style={styles.subtitle}>
          {t('addFarmDesc') || 'Accurate GPS coordinates enable Open-Meteo and NASA POWER climate risk modeling.'}
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>{t('farmName') || 'Farm Name (शेताचे नाव)'} *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Baramati Main Plot / गट नं १२"
          placeholderTextColor={COLORS.textMuted}
          value={farmName}
          onChangeText={setFarmName}
        />

        <Text style={styles.label}>{t('sizeAcres') || 'Area in Acres (क्षेत्रफळ एकर)'} *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 3.5"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="decimal-pad"
          value={sizeAcres}
          onChangeText={setSizeAcres}
        />

        {/* GPS Capture Button */}
        <Text style={styles.label}>{t('farmLocation') || 'GPS Location (स्थान)'} *</Text>
        <FarmerButton
          title={capturingGps ? t('detectingGps') || 'Capturing GPS...' : t('captureGps') || '📍 Capture GPS Location'}
          variant="secondary"
          onPress={handleCaptureGps}
          loading={capturingGps}
          icon={<Crosshair color={COLORS.white} size={20} />}
          style={{ marginVertical: 8 }}
        />

        <View style={styles.coordsRow}>
          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>{t('latitude') || 'Latitude'}</Text>
            <TextInput
              style={styles.coordInput}
              placeholder="e.g. 18.1519"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              value={latitude}
              onChangeText={setLatitude}
            />
          </View>

          <View style={styles.coordCol}>
            <Text style={styles.coordLabel}>{t('longitude') || 'Longitude'}</Text>
            <TextInput
              style={styles.coordInput}
              placeholder="e.g. 74.5772"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              value={longitude}
              onChangeText={setLongitude}
            />
          </View>
        </View>

        <Text style={styles.label}>{t('soilType') || 'Soil Type (मातीचा प्रकार)'}</Text>
        <View style={styles.soilGrid}>
          {SOIL_TYPES.map((type) => {
            const isSelected = soilType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.soilChip, isSelected && styles.soilChipSelected]}
                onPress={() => setSoilType(type)}
              >
                <Text style={[styles.soilChipText, isSelected && styles.soilChipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
      </View>

      <View style={styles.footer}>
        <FarmerButton
          title={t('saveFarm') || 'Save Farm Plot'}
          onPress={handleSaveFarm}
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
    paddingHorizontal: 16,
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
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  coordCol: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  coordInput: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  soilGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  soilChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  soilChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  soilChipText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  soilChipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
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

