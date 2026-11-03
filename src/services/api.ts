const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface FarmerRegistrationPayload {
  full_name: string;
  preferred_language: string;
  village: string;
  district: string;
  state: string;
  country?: string;
  farm_name: string;
  farm_acreage: number;
  soil_type: string;
  irrigation_source: string;
  latitude: number;
  longitude: number;
  elevation_meters?: number;
}

export interface FarmPayload {
  name: string;
  latitude: number;
  longitude: number;
  acreage: number;
  soil_type: string;
  irrigation_source: string;
  elevation_meters?: number;
  micro_zone_name?: string;
}

export interface BackendFarm {
  id: string;
  farmer_id: string;
  name: string;
  latitude: number;
  longitude: number;
  acreage: number;
  soil_type: string;
  irrigation_source: string;
  elevation_meters?: number;
  micro_zone_name?: string;
}

export interface BackendFarmer {
  id: string;
  supabase_user_id?: string;
  full_name: string;
  phone_number: string;
  preferred_language: string;
  village: string;
  district: string;
  state: string;
  country: string;
  trust_score: number;
  is_active: boolean;
  farms: BackendFarm[];
}

export interface AuthMeResponse {
  authenticated: boolean;
  supabase_user_id: string;
  phone_number?: string;
  is_registered: boolean;
  farmer?: BackendFarmer | null;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchMyAuthState(token: string): Promise<AuthMeResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Auth check failed with status: ${res.status}`);
  }
  return res.json();
}

export async function registerFarmerProfile(
  payload: FarmerRegistrationPayload,
  token: string
): Promise<BackendFarmer> {
  const res = await fetch(`${API_BASE_URL}/auth/register-farmer`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.detail || 'Farmer registration failed');
  }
  return res.json();
}

export async function fetchMyFarmer(token: string): Promise<BackendFarmer> {
  const res = await fetch(`${API_BASE_URL}/farmers/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch farmer profile: ${res.status}`);
  }
  return res.json();
}

export async function updateMyFarmerProfile(
  payload: Partial<BackendFarmer>,
  token: string
): Promise<BackendFarmer> {
  const res = await fetch(`${API_BASE_URL}/farmers/me`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to update farmer profile');
  }
  return res.json();
}

export async function fetchMyFarms(token: string): Promise<BackendFarm[]> {
  const res = await fetch(`${API_BASE_URL}/farms/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch farms');
  }
  return res.json();
}

export async function addMyFarm(
  payload: FarmPayload,
  token: string
): Promise<BackendFarm> {
  const res = await fetch(`${API_BASE_URL}/farms/me`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to create farm');
  }
  return res.json();
}

export async function updateMyFarm(
  farmId: string,
  payload: Partial<FarmPayload>,
  token: string
): Promise<BackendFarm> {
  const res = await fetch(`${API_BASE_URL}/farms/me/${farmId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to update farm');
  }
  return res.json();
}

