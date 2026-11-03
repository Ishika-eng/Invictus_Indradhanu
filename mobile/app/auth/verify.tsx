import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyRound, CheckCircle } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { FarmerButton } from '../../src/components/FarmerButton';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, sendOtp } = useAuth();
  const { t } = useLanguage();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerify = async () => {
    if (otpCode.trim().length !== 6) {
      setErrorMsg(t('invalidOtp') || 'Please enter the 6-digit code received');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyOtp(phone || '', otpCode.trim());
      if (res.success) {
        if (res.isNewUser) {
          router.replace('/auth/register');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setErrorMsg(res.error || 'Incorrect OTP code. Please try again.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'OTP verification error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to resend OTP');
      }
    } finally {
      setResending(false);
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
            <KeyRound color={COLORS.primary} size={36} />
          </View>
          <Text style={styles.title}>{t('verifyOtpTitle') || 'Enter Verification Code'}</Text>
          <Text style={styles.subtitle}>
            {t('otpSentTo') || 'Sent to'} <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="• • • • • •"
            placeholderTextColor={COLORS.textMuted}
            value={otpCode}
            onChangeText={(val) => {
              setOtpCode(val);
              if (errorMsg) setErrorMsg('');
            }}
            autoFocus
          />

          {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
          {resendSuccess ? (
            <View style={styles.successBanner}>
              <CheckCircle color={COLORS.primary} size={16} />
              <Text style={styles.successText}>{t('otpResent') || 'New OTP sent to your phone!'}</Text>
            </View>
          ) : null}

          <View style={styles.resendArea}>
            <Text style={styles.resendPrompt}>{t('noOtpReceived') || "Didn't receive code?"}</Text>
            <FarmerButton
              title={t('resendOtp') || 'Resend OTP'}
              variant="outline"
              onPress={handleResend}
              loading={resending}
              style={styles.resendBtn}
              textStyle={styles.resendBtnText}
            />
          </View>
        </View>

        <View style={styles.footerArea}>
          <FarmerButton
            title={t('verifyAndProceed') || 'Verify & Login'}
            onPress={handleVerify}
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
  },
  phoneHighlight: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  inputArea: {
    marginVertical: 24,
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 14,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
    color: COLORS.textDark,
  },
  errorText: {
    color: COLORS.riskCritical,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  successText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  resendArea: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  resendPrompt: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  resendBtn: {
    minHeight: 44,
    paddingHorizontal: 24,
  },
  resendBtnText: {
    fontSize: 14,
  },
  footerArea: {
    marginBottom: 16,
  },
});
