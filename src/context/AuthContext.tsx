import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supabase, 
  sendPhoneOtp, 
  verifyPhoneOtp, 
  signOutUser,
  signInWithEmail,
  signUpWithEmail,
  resendVerificationEmail
} from '../services/supabase';
import {
  fetchMyAuthState,
  registerFarmerProfile,
  BackendFarmer,
  BackendFarm,
  FarmerRegistrationPayload,
} from '../services/api';

interface AuthContextType {
  user: any | null;
  session: any | null;
  farmer: BackendFarmer | null;
  farms: BackendFarm[];
  selectedFarm: BackendFarm | null;
  setSelectedFarm: (farm: BackendFarm | null) => void;
  isAuthLoading: boolean;
  isRegistered: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  confirmationNotice: string | null;
  setConfirmationNotice: (notice: string | null) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, phone?: string) => Promise<{
    success: boolean;
    session?: any;
    needsEmailConfirmation?: boolean;
    error?: string;
    message?: string;
  }>;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerNewFarmer: (payload: FarmerRegistrationPayload) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  detectBrowserGps: () => Promise<{ latitude: number; longitude: number; altitude?: number } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [farmer, setFarmer] = useState<BackendFarmer | null>(null);
  const [farms, setFarms] = useState<BackendFarm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<BackendFarm | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  // Sync Supabase Auth session on mount and listen to changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // Handle PKCE auth code in URL query string if redirected: ?code=...
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
            if (data?.session && mounted) {
              setSession(data.session);
              setUser(data.session.user);
              setConfirmationNotice('Email confirmed successfully! Your farm session is active.');
              await loadBackendProfile(data.session.access_token);
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }
          } catch (codeErr) {
            console.warn('PKCE auth code exchange error:', codeErr);
          }
        }

        // Check if redirected via implicit token hash (#access_token=...&type=signup)
        const hasAuthHash = typeof window !== 'undefined' && (
          window.location.hash.includes('access_token=') ||
          window.location.hash.includes('type=signup') ||
          window.location.hash.includes('type=recovery')
        );

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          if (hasAuthHash) {
            setConfirmationNotice('Email verified successfully! Welcome to Indradhanu.');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          await loadBackendProfile(initialSession.access_token);
        }
      } catch (err) {
        console.warn('Initial session lookup:', err);
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (event === 'SIGNED_IN' && currentSession?.access_token) {
        if (typeof window !== 'undefined' && (window.location.hash.includes('type=signup') || window.location.search.includes('code='))) {
          setConfirmationNotice('Email verified successfully! Welcome to Indradhanu.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        await loadBackendProfile(currentSession.access_token);
      } else if (currentSession?.access_token) {
        await loadBackendProfile(currentSession.access_token);
      } else {
        setFarmer(null);
        setFarms([]);
        setSelectedFarm(null);
        setIsRegistered(false);
      }
      setIsAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadBackendProfile(token: string) {
    try {
      const state = await fetchMyAuthState(token);
      setIsRegistered(state.is_registered);
      if (state.farmer) {
        setFarmer(state.farmer);
        const farmerFarms = state.farmer.farms || [];
        setFarms(farmerFarms);
        if (farmerFarms.length > 0) {
          setSelectedFarm(farmerFarms[0]);
        }
      } else {
        setFarmer(null);
        setFarms([]);
        setSelectedFarm(null);
      }
    } catch (err) {
      console.warn('Backend profile fetch (offline or not registered yet):', err);
      setIsRegistered(false);
      setFarmer(null);
    }
  }

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { session: loggedSession, error } = await signInWithEmail(email, password);
    if (error || !loggedSession) {
      return { success: false, error: error?.message || 'Login failed. Please verify credentials.' };
    }
    setSession(loggedSession);
    setUser(loggedSession.user);
    await loadBackendProfile(loggedSession.access_token);
    return { success: true };
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    phone?: string
  ): Promise<{
    success: boolean;
    session?: any;
    needsEmailConfirmation?: boolean;
    error?: string;
    message?: string;
  }> => {
    const { session: registeredSession, error } = await signUpWithEmail(
      email,
      password,
      phone
    );
    if (error) {
      return { success: false, error: error.message };
    }

    // Outcome 1: Session is returned immediately (email confirmation disabled or already confirmed)
    if (registeredSession) {
      setSession(registeredSession);
      setUser(registeredSession.user);
      await loadBackendProfile(registeredSession.access_token);
      return {
        success: true,
        session: registeredSession,
        needsEmailConfirmation: false,
        message: 'Account created and authenticated successfully!',
      };
    }

    // Outcome 2: User created without session (email confirmation required)
    return {
      success: true,
      session: null,
      needsEmailConfirmation: true,
      message: `Verification email sent! Please check ${email} and confirm your address before signing in.`,
    };
  };

  const resendConfirmation = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await resendVerificationEmail(email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await sendPhoneOtp(phone);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const verifyOtp = async (phone: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const { session: verifiedSession, error } = await verifyPhoneOtp(phone, token);
    if (error || !verifiedSession) {
      return { success: false, error: error?.message || 'Verification failed. Please check the OTP.' };
    }
    setSession(verifiedSession);
    setUser(verifiedSession.user);
    await loadBackendProfile(verifiedSession.access_token);
    return { success: true };
  };

  const logout = async () => {
    await signOutUser();
    setSession(null);
    setUser(null);
    setFarmer(null);
    setFarms([]);
    setSelectedFarm(null);
    setIsRegistered(false);
  };

  const registerNewFarmer = async (
    payload: FarmerRegistrationPayload
  ): Promise<{ success: boolean; error?: string }> => {
    if (!session?.access_token) {
      return { success: false, error: 'Please sign in first before registering.' };
    }
    // Idempotency check: if farmer profile is already confirmed in context, avoid redundant network calls
    if (isRegistered && farmer) {
      return { success: true };
    }

    try {
      const registered = await registerFarmerProfile(payload, session.access_token);
      setFarmer(registered);
      setIsRegistered(true);
      const registeredFarms = registered.farms || [];
      setFarms(registeredFarms);
      if (registeredFarms.length > 0) {
        setSelectedFarm(registeredFarms[0]);
      }
      return { success: true };
    } catch (err: any) {
      // If registration failed because account is already registered (network retry scenario),
      // recover gracefully by synchronizing profile from backend
      if (err.message && (err.message.includes('already registered') || err.message.includes('409'))) {
        await loadBackendProfile(session.access_token);
        return { success: true };
      }
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      await loadBackendProfile(session.access_token);
    }
  };

  const detectBrowserGps = async (): Promise<{ latitude: number; longitude: number; altitude?: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : undefined,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        farmer,
        farms,
        selectedFarm,
        setSelectedFarm,
        isAuthLoading,
        isRegistered,
        authModalOpen,
        setAuthModalOpen,
        confirmationNotice,
        setConfirmationNotice,
        signInWithEmail: loginWithEmail,
        signUpWithEmail: registerWithEmail,
        resendConfirmation,
        sendOtp,
        verifyOtp,
        logout,
        registerNewFarmer,
        refreshProfile,
        detectBrowserGps,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

