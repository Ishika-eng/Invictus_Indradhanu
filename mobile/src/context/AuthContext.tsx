import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

export interface FarmerProfile {
  id: string;
  auth_user_id: string;
  phone_number: string;
  full_name: string;
  village: string;
  district: string;
  state: string;
  preferred_language: string;
  role: string;
  trust_score?: number;
}

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  latitude: number;
  longitude: number;
  size_acres: number;
  soil_type?: string;
  created_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userPhone: string | null;
  farmerProfile: FarmerProfile | null;
  farms: Farm[];
  activeFarm: Farm | null;
  setActiveFarm: (farm: Farm) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  registerProfile: (data: {
    full_name: string;
    village: string;
    district: string;
    state?: string;
    preferred_language: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userPhone: null,
  farmerProfile: null,
  farms: [],
  activeFarm: null,
  setActiveFarm: () => {},
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  registerProfile: async () => ({ success: false }),
  refreshData: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarmState] = useState<Farm | null>(null);

  const refreshData = async () => {
    try {
      const profileRes = await ApiService.getFarmerProfile();
      if (profileRes.data) {
        setFarmerProfile(profileRes.data);
        setIsAuthenticated(true);

        const farmsRes = await ApiService.getFarms();
        if (farmsRes.data && farmsRes.data.length > 0) {
          setFarms(farmsRes.data);
          const savedActiveId = await StorageService.getActiveFarmId();
          const match = farmsRes.data.find((f: Farm) => f.id === savedActiveId);
          setActiveFarmState(match || farmsRes.data[0]);
        } else {
          setFarms([]);
          setActiveFarmState(null);
        }
      } else {
        setFarmerProfile(null);
      }
    } catch {
      // Offline or network error
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await AuthService.getSession();
        if (session) {
          setUserPhone(session.user?.phone || null);
          await refreshData();
        }
      } catch (e) {
        console.warn('Auth init failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setActiveFarm = async (farm: Farm) => {
    setActiveFarmState(farm);
    await StorageService.saveActiveFarmId(farm.id);
  };

  const sendOtp = async (phone: string) => {
    const res = await AuthService.signInWithOtp(phone);
    if (res.success) {
      setUserPhone(phone);
    }
    return res;
  };

  const verifyOtp = async (phone: string, token: string) => {
    const res = await AuthService.verifyOtp(phone, token);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    setUserPhone(phone);
    setIsAuthenticated(true);

    // Try fetching farmer profile
    const profileRes = await ApiService.getFarmerProfile();
    if (profileRes.data) {
      setFarmerProfile(profileRes.data);
      await refreshData();
      return { success: true, isNewUser: false };
    } else {
      // Farmer profile doesn't exist yet -> Needs registration
      return { success: true, isNewUser: true };
    }
  };

  const registerProfile = async (data: {
    full_name: string;
    village: string;
    district: string;
    state?: string;
    preferred_language: string;
  }) => {
    const res = await ApiService.registerFarmer(data);
    if (res.data) {
      setFarmerProfile(res.data);
      await refreshData();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to create profile' };
  };

  const logout = async () => {
    await AuthService.signOut();
    setIsAuthenticated(false);
    setUserPhone(null);
    setFarmerProfile(null);
    setFarms([]);
    setActiveFarmState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userPhone,
        farmerProfile,
        farms,
        activeFarm,
        setActiveFarm,
        sendOtp,
        verifyOtp,
        registerProfile,
        refreshData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

