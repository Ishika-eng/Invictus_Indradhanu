import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AuthProvider } from '../src/context/AuthContext';
import { OfflineProvider } from '../src/context/OfflineContext';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { COLORS } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <OfflineProvider>
            <StatusBar style="light" backgroundColor={COLORS.primaryDark} />
            <OfflineBanner />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                contentStyle: { backgroundColor: COLORS.background },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ title: 'Login / लॉगिन' }} />
              <Stack.Screen name="auth/verify" options={{ title: 'Verify OTP / पडताळणी' }} />
              <Stack.Screen name="auth/register" options={{ title: 'Farmer Profile' }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="farms/add" options={{ title: 'Add New Farm / शेत जोडा' }} />
              <Stack.Screen name="crops/add" options={{ title: 'Register Crop / पीक जोडा' }} />
              <Stack.Screen name="crops/[id]/stage" options={{ title: 'Growth Stage / वाढीचा टप्पा' }} />
              <Stack.Screen name="advisories/history" options={{ title: 'Advisory History / सल्ला इतिहास' }} />
              <Stack.Screen name="settings/notifications" options={{ title: 'Alert Settings / सूचना' }} />
            </Stack>
          </OfflineProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
