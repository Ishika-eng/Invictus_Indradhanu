import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { FarmerButton } from '../../src/components/FarmerButton';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const { t } = useLanguage();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setErrorMsg(t('invalidPhone') || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const formatted = `+91${cleaned}`;
      const res = await sendOtp(formatted);
      if (res.success) {
        router.push({
          pathname: '/auth/verify',
          params: { phone: formatted },
        });
      } else {
        setErrorMsg(res.error || 'Failed to send OTP. Please check the number.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerArea}>
          <View style={styles.iconCircle}>
            <Phone color={COLORS.primary} size={36} />
          </View>
          <Text style={styles.title}>{t('enterMobileNumber') || 'Enter Mobile Number'}</Text>
          <Text style={styles.subtitle}>
            {t('otpSentInstruction') || 'We will send a 6-digit OTP code to verify your farm account.'}
          </Text>
        </View>

        <View style={styles.inputArea}>
          <Text style={styles.inputLabel}>{t('mobileNumber') || 'Mobile Number'}</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBadge}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneTextInput}
              keyboardType="phone-pad"
              placeholder="9876543210"
              placeholderTextColor={COLORS.textMuted}
              maxLength={10}
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(val);
                if (errorMsg) setErrorMsg('');
              }}
              autoFocus
            />
          </View>

          {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

          <View style={styles.privacyNote}>
            <ShieldCheck color={COLORS.primary} size={18} />
            <Text style={styles.privacyText}>
              {t('otpPrivacyNote') || 'Your number is used strictly for climate advisories and OTP security.'}
            </Text>
          </View>
        </View>

        <View style={styles.footerArea}>
          <FarmerButton
            title={t('sendOtp') || 'Send OTP'}
            onPress={handleSendOtp}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  inputArea: {
    marginVertical: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 14,
    height: 60,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    backgroundColor: '#F1F5F9',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: 14,
    letterSpacing: 2,
  },
  errorText: {
    color: COLORS.riskCritical,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    marginLeft: 8,
  },
  footerArea: {
    marginBottom: 16,
  },
});

