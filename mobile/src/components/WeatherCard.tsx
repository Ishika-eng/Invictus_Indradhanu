import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CloudRain, Wind, Droplets, Thermometer, Sun } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

interface WeatherCardProps {
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  rainProbability?: number;
  windSpeed?: number;
  weatherCondition?: string;
  sourceNote?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature = 28.5,
  humidity = 65,
  rainProbability = 15,
  windSpeed = 12,
  weatherCondition = 'Partly Cloudy',
  sourceNote = 'Open-Meteo High-Res',
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tempGroup}>
          <Thermometer color={COLORS.primary} size={28} />
          <Text style={styles.temperature}>{temperature}°C</Text>
        </View>
        <View style={styles.conditionBadge}>
          <Sun color={COLORS.accent} size={18} />
          <Text style={styles.conditionText}>{weatherCondition}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <CloudRain color={COLORS.skyBlue} size={20} />
          <Text style={styles.metricLabel}>{t('rainProbability') || 'Rain Prob'}</Text>
          <Text style={styles.metricValue}>{rainProbability}%</Text>
        </View>

        <View style={styles.metricItem}>
          <Droplets color={COLORS.primaryLight} size={20} />
          <Text style={styles.metricLabel}>{t('humidity') || 'Humidity'}</Text>
          <Text style={styles.metricValue}>{humidity}%</Text>
        </View>

        <View style={styles.metricItem}>
          <Wind color={COLORS.textMuted} size={20} />
          <Text style={styles.metricLabel}>{t('windSpeed') || 'Wind'}</Text>
          <Text style={styles.metricValue}>{windSpeed} km/h</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.sourceText}>📡 {sourceNote}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 6,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  footer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  sourceText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

