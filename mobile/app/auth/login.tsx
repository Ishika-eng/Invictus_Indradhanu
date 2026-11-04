import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { FarmerButton } from '../../src/components/FarmerButton';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthAction = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup') {
      const cleaned = phoneNumber.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number for advisories');
        return;
      }
    }

    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.success) {
          if (res.isNewUser) {
            router.push('/auth/register');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          setErrorMsg(res.error || 'Login failed. Please check your credentials.');
        }
      } else {
        const formattedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;
        const res = await signUpWithEmail(email, password, formattedPhone);
        if (res.success) {
          router.push({
            pathname: '/auth/register',
            params: { phone: formattedPhone, email: email.trim() },
          });
        } else {
          setErrorMsg(res.error || 'Registration failed. Please try again.');
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Authentication error');
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
            <Mail color={COLORS.primary} size={36} />
          </View>
          <Text style={styles.title}>
            {mode === 'signin' ? 'Farmer Sign In' : 'Create Farm Account'}
          </Text>
          <Text style={styles.subtitle}>
            Development Mode: Supabase email authentication is enabled for testing.
          </Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'signin' && styles.tabButtonActive]}
            onPress={() => {
              setMode('signin');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'signup' && styles.tabButtonActive]}
            onPress={() => {
              setMode('signup');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputArea}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <View style={styles.inputRow}>
            <Mail color={COLORS.textMuted} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="kisan@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errorMsg) setErrorMsg('');
              }}
            />
          </View>

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Password *</Text>
          <View style={styles.inputRow}>
            <Lock color={COLORS.textMuted} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              secureTextEntry
              placeholder="Min 6 characters"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errorMsg) setErrorMsg('');
              }}
            />
          </View>

          {mode === 'signup' && (
            <>
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Contact Mobile Number *</Text>
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
                />
              </View>
              <Text style={styles.helpText}>
                Required for SMS, Voice IVR and WhatsApp climate alert delivery.
              </Text>
            </>
          )}

          {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

          <View style={styles.privacyNote}>
            <ShieldCheck color={COLORS.primary} size={18} />
            <Text style={styles.privacyText}>
              Credentials are secured via Supabase Auth with encrypted tokens and session persistence.
            </Text>
          </View>
        </View>

        <View style={styles.footerArea}>
          <FarmerButton
            title={mode === 'signin' ? 'Sign In to Account' : 'Create & Continue'}
            onPress={handleAuthAction}
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
    marginTop: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
  },
  inputArea: {
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 52,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    backgroundColor: '#F1F5F9',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: 12,
    letterSpacing: 1,
  },
  helpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: COLORS.riskCritical,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.primaryDark,
    marginLeft: 8,
    lineHeight: 16,
  },
  footerArea: {
    marginBottom: 16,
  },
});
