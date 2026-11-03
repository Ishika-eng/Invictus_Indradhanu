import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_client_build';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://demo-project.supabase.co'
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Request a 6-digit SMS OTP from Supabase Auth for an Indian or international mobile number.
 */
export async function sendPhoneOtp(phone: string): Promise<{ error: Error | null }> {
  try {
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim().replace(/^0+/, '')}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: 'sms',
      },
    });
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Verify a received 6-digit SMS OTP token with Supabase Auth.
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string
): Promise<{ session: any; user: any; error: Error | null }> {
  try {
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim().replace(/^0+/, '')}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'sms',
    });
    return {
      session: data?.session || null,
      user: data?.user || null,
      error,
    };
  } catch (err: any) {
    return { session: null, user: null, error: err };
  }
}

/**
 * Sign out from Supabase Auth.
 */
export async function signOutUser(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

