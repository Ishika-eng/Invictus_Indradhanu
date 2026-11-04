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

