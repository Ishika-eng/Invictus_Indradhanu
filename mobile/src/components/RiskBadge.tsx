import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface RiskBadgeProps {
  level: string; // 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, label, size = 'md' }) => {
  const norm = (level || 'LOW').toUpperCase();

  let bg = COLORS.riskLow;
  let text = COLORS.riskLowDark;
  let defaultLabel = 'LOW RISK';

  if (norm === 'MODERATE') {
    bg = COLORS.riskMod;
    text = COLORS.riskModDark;
    defaultLabel = 'MODERATE';
  } else if (norm === 'HIGH') {
    bg = COLORS.riskHigh;
    text = COLORS.riskHighDark;
    defaultLabel = 'HIGH RISK';
  } else if (norm === 'CRITICAL') {
    bg = COLORS.riskCritical;
    text = COLORS.white;
    defaultLabel = 'CRITICAL';
  }

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        isLg && styles.badgeLg,
        isSm && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          isLg && styles.textLg,
          isSm && styles.textSm,
        ]}
      >
        {label || defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeLg: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 11,
    fontWeight: '700',
  },
  textLg: {
    fontSize: 16,
    fontWeight: '800',
  },
});
