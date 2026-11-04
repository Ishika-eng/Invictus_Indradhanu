import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../constants/config';
import { StorageService } from './storage';

// Initialize Supabase Client for React Native
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key: string) => StorageService.getToken(),
      setItem: (key: string, value: string) => StorageService.saveToken(value),
      removeItem: (key: string) => StorageService.removeToken(),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const AuthService = {
  /**
   * Sign in using email and password
   */
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.session) {
        return { success: false, error: error?.message || 'Invalid email or password' };
      }

      await StorageService.saveToken(data.session.access_token);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Email login failed' };
    }
  },

  /**
   * Sign up using email and password with optional phone number in metadata
   */
  async signUpWithEmail(
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; session?: any; needsEmailConfirmation?: boolean; error?: string; message?: string }> {
    try {
      const formattedPhone = phone?.trim()
        ? (phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim().replace(/\D/g, '')}`)
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: formattedPhone ? { phone_number: formattedPhone } : {},
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        await StorageService.saveToken(data.session.access_token);
        return { success: true, session: data.session, needsEmailConfirmation: false };
      }

      return {
        success: true,
        session: null,
        needsEmailConfirmation: true,
        message: 'Account created! Please check your email inbox to verify your email address before signing in.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Account creation failed' };
    }
  },

  /**
   * Resend confirmation email for unverified farmer accounts
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend verification email' };
    }
  },

  /**
   * Request OTP for a phone number in international format (+91...)
   */
  async signInWithOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error requesting OTP' };
    }
  },

  /**
   * Verify 6-digit OTP code received by phone
   */
  async verifyOtp(phone: string, token: string): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms',
      });

      if (error || !data.session) {
        return { success: false, error: error?.message || 'Invalid or expired OTP code' };
      }

      // Persist access token
      await StorageService.saveToken(data.session.access_token);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed' };
    }
  },

  /**
   * Get current active session
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Sign out and clear stored session
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    await StorageService.clearAllSession();
  }
};

