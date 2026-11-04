import React from 'react';
import { Tabs } from 'expo-router';
import { FileText, CloudSun, AlertTriangle, Tractor, User } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useLanguage } from '../../src/context/LanguageContext';

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('advisories') || 'Advisory',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="climate"
        options={{
          title: t('climate') || 'Climate',
          tabBarIcon: ({ color, size }) => <CloudSun color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="risk"
        options={{
          title: t('risks') || 'Risk',
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: t('farms') || 'Farms',
          tabBarIcon: ({ color, size }) => <Tractor color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile') || 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

