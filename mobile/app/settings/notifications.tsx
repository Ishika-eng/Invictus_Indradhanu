import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MessageSquare, PhoneCall, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useLanguage } from '../../src/context/LanguageContext';
import { ApiService } from '../../src/services/api';
import { FarmerButton } from '../../src/components/FarmerButton';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [preferredChannel, setPreferredChannel] = useState('SMS');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getDeliveryPreferences().then((res) => {
      if (res.data) {
        setPreferredChannel(res.data.preferred_channel || 'SMS');
        setSmsEnabled(res.data.sms_enabled ?? true);
        setVoiceEnabled(res.data.voice_enabled ?? true);
        setWhatsappEnabled(res.data.whatsapp_enabled ?? false);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await ApiService.updateDeliveryPreferences({
        preferred_channel: preferredChannel,
        sms_enabled: smsEnabled,
        voice_enabled: voiceEnabled,
        whatsapp_enabled: whatsappEnabled,
      });

      if (res.data) {
        Alert.alert(t('success') || 'Success', t('prefsUpdatedSuccess') || 'Communication preferences updated.');
        router.back();
      } else {
        Alert.alert('Error', res.error || 'Failed to update preferences');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Bell color={COLORS.primary} size={32} />
        </View>
        <Text style={styles.title}>{t('channelPreferences') || 'Alert Channels & Consent'}</Text>
        <Text style={styles.subtitle}>
          {t('channelPreferencesDesc') || 'Choose how you receive urgent climate risks and weather advisories.'}
        </Text>
      </View>

      {/* Primary Delivery Channel */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('preferredChannel') || 'Preferred Delivery Channel'}</Text>
        <View style={styles.channelRow}>
          {[
            { id: 'SMS', label: 'SMS', icon: MessageSquare },
            { id: 'VOICE', label: 'Voice IVR', icon: PhoneCall },
            { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
          ].map((item) => {
            const isSelected = preferredChannel === item.id;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.channelChoice, isSelected && styles.channelChoiceSelected]}
                onPress={() => setPreferredChannel(item.id)}
              >
                <Icon color={isSelected ? COLORS.primaryDark : COLORS.textMuted} size={20} />
                <Text style={[styles.channelChoiceText, isSelected && styles.channelChoiceTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Channel Toggles */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('activeChannels') || 'Active Channels'}</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <MessageSquare color={COLORS.primary} size={20} />
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>SMS Advisories</Text>
              <Text style={styles.switchSubtitle}>Fast text alerts delivered via MSG91</Text>
            </View>
          </View>
          <Switch
            value={smsEnabled}
            onValueChange={setSmsEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={smsEnabled ? COLORS.primary : '#F1F5F9'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <PhoneCall color={COLORS.accent} size={20} />
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Voice IVR Automated Calls</Text>
              <Text style={styles.switchSubtitle}>Spoken call in your language via Exotel</Text>
            </View>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={setVoiceEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={voiceEnabled ? COLORS.primary : '#F1F5F9'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <MessageCircle color="#25D366" size={20} />
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>WhatsApp Business Notifications</Text>
              <Text style={styles.switchSubtitle}>Rich media cards & audio via Meta Cloud API</Text>
            </View>
          </View>
          <Switch
            value={whatsappEnabled}
            onValueChange={setWhatsappEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={whatsappEnabled ? COLORS.primary : '#F1F5F9'}
          />
        </View>
      </View>

      {/* Consent & Opt-Out Notice */}
      <View style={styles.consentCard}>
        <ShieldCheck color={COLORS.primaryDark} size={18} />
        <Text style={styles.consentText}>
          {t('consentNotice') || 'By enabling alerts, you provide explicit consent to receive weather advisories. You can opt out at any time by replying STOP to SMS or turning off switches.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <FarmerButton
          title={t('savePreferences') || 'Save Notification Settings'}
          onPress={handleSave}
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
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  channelChoice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  channelChoiceSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  channelChoiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  channelChoiceTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    paddingRight: 10,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  switchSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  consentCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 18,
  },
  footer: {
    marginBottom: 24,
  },
});
