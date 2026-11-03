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

// ============================================================================
// Stage 2: Crop Catalog & Farm Crop Management APIs
// ============================================================================

export interface BackendCropGrowthStage {
  id: string;
  crop_id: string;
  stage_name: string;
  stage_order: number;
  duration_days: number;
  cumulative_start_day: number;
  cumulative_end_day: number;
  water_sensitivity: string;
  temp_critical_min_c?: number;
  temp_critical_max_c?: number;
  vulnerability_notes?: string;
  description?: string;
}

export interface BackendCrop {
  id: string;
  name: string;
  scientific_name?: string;
  category: string;
  temp_min_c?: number;
  temp_max_c?: number;
  temp_optimal_min_c?: number;
  temp_optimal_max_c?: number;
  water_demand: string;
  water_requirement_mm_min?: number;
  water_requirement_mm_max?: number;
  rainfall_min_mm?: number;
  rainfall_max_mm?: number;
  ideal_soil?: string;
  soil_ph_min?: number;
  soil_ph_max?: number;
  growing_season?: string;
  root_depth_cm?: string;
  icon?: string;
  agronomic_reference?: string;
  description?: string;
  growth_stages: BackendCropGrowthStage[];
}

export interface BackendFarmCrop {
  id: string;
  farm_id: string;
  crop_id: string;
  variety?: string;
  cultivated_acreage: number;
  sowing_date: string;
  expected_harvest_date?: string;
  current_stage_id?: string;
  current_stage_name?: string;
  status: string;
  notes?: string;
  crop?: BackendCrop;
  current_stage?: BackendCropGrowthStage;
}

export interface FarmCropPayload {
  crop_id: string;
  variety?: string;
  cultivated_acreage: number;
  sowing_date: string;
  expected_harvest_date?: string;
  current_stage_id?: string;
  status?: string;
  notes?: string;
}

export interface StageEstimationResponse {
  crop_id: string;
  crop_name: string;
  sowing_date: string;
  days_since_sowing: number;
  suggested_stage_id?: string;
  suggested_stage_name?: string;
  suggested_stage_order?: number;
  water_sensitivity?: string;
  vulnerability_notes?: string;
  advice: string;
}

export async function fetchCrops(): Promise<BackendCrop[]> {
  const res = await fetch(`${API_BASE_URL}/crops/`);
  if (!res.ok) {
    throw new Error('Failed to fetch crops catalog');
  }
  return res.json();
}

export async function fetchCropDetails(cropId: string): Promise<BackendCrop> {
  const res = await fetch(`${API_BASE_URL}/crops/${cropId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch crop details');
  }
  return res.json();
}

export async function estimateCropGrowthStage(
  cropId: string,
  sowingDate: string
): Promise<StageEstimationResponse> {
  const res = await fetch(
    `${API_BASE_URL}/crops/${cropId}/estimate-stage?sowing_date=${sowingDate}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.detail || 'Stage estimation failed');
  }
  return res.json();
}

export async function fetchFarmCrops(
  farmId: string,
  token: string
): Promise<BackendFarmCrop[]> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/crops`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch crops for this farm plot');
  }
  return res.json();
}

export async function addCropToFarm(
  farmId: string,
  payload: FarmCropPayload,
  token: string
): Promise<BackendFarmCrop> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/crops`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.detail || 'Failed to add crop to farm');
  }
  return res.json();
}

export async function updateFarmCrop(
  farmId: string,
  farmCropId: string,
  payload: Partial<FarmCropPayload>,
  token: string
): Promise<BackendFarmCrop> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/crops/${farmCropId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.detail || 'Failed to update cultivated crop');
  }
  return res.json();
}

export async function deleteFarmCrop(
  farmId: string,
  farmCropId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/crops/${farmCropId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to remove crop from farm plot');
  }
  return res.json();
}

// ==============================================================================
// Stage 3: Climate Integration APIs (Open-Meteo & NASA POWER)
// ==============================================================================

export interface CurrentClimateData {
  farm_id: string;
  farm_name: string;
  latitude: number;
  longitude: number;
  data_source: string;
  observation_type: string;
  last_updated: string;
  current: {
    temperature_c: number;
    feels_like_c: number;
    relative_humidity_pct: number;
    precipitation_mm: number;
    rain_probability_pct: number;
    wind_speed_kmh: number;
    wind_direction_deg: number;
    weather_code: number;
    weather_condition: string;
    weather_description: string;
    weather_icon: string;
    timestamp: string;
  };
  soil_sensor: {
    installed: boolean;
    sensor_id?: string | null;
    status: string;
    in_situ_moisture_pct?: number | null;
    notice: string;
  };
}

export interface DailyForecastDay {
  day_number: number;
  date: string;
  temp_max_c: number;
  temp_min_c: number;
  precipitation_mm: number;
  precipitation_probability_pct: number;
  wind_speed_max_kmh: number;
  weather_code: number;
  weather_condition: string;
  weather_icon: string;
}

export interface ClimateForecastData {
  farm_id: string;
  farm_name: string;
  latitude: number;
  longitude: number;
  data_source: string;
  observation_type: string;
  last_updated: string;
  daily_forecast: DailyForecastDay[];
  hourly_24h: Array<{
    time: string;
    temperature_c: number;
    humidity_pct: number;
    precipitation_probability_pct: number;
    precipitation_mm: number;
    solar_radiation_wm2: number;
  }>;
}

export interface HistoricalClimateData {
  farm_id: string;
  farm_name: string;
  latitude: number;
  longitude: number;
  data_source: string;
  start_date: string;
  end_date: string;
  days_analyzed: number;
  summary: {
    avg_temp_c?: number | null;
    total_precipitation_mm: number;
    avg_relative_humidity_pct?: number | null;
    avg_solar_radiation_mj_m2?: number | null;
  };
  daily_records: Array<{
    date: string;
    temperature_avg_c?: number | null;
    temperature_max_c?: number | null;
    temperature_min_c?: number | null;
    precipitation_mm: number;
    relative_humidity_pct?: number | null;
    solar_radiation_mj_m2?: number | null;
  }>;
  growing_degree_days?: {
    crop_name: string;
    supported: boolean;
    t_base_c?: number;
    accumulated_gdd?: number;
    target_maturity_gdd?: number;
    thermal_maturity_pct?: number;
    days_evaluated: number;
    summary_note: string;
  } | null;
}

export async function fetchFarmCurrentClimate(
  farmId: string,
  token: string
): Promise<CurrentClimateData> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/climate/current`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch real-time climate data');
  }
  return res.json();
}

export async function fetchFarmClimateForecast(
  farmId: string,
  token: string
): Promise<ClimateForecastData> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/climate/forecast`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch weather forecast');
  }
  return res.json();
}

export async function fetchFarmClimateHistory(
  farmId: string,
  token: string,
  days: number = 30
): Promise<HistoricalClimateData> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/climate/history?days=${days}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch historical agroclimatology');
  }
  return res.json();
}

export async function refreshFarmClimate(
  farmId: string,
  token: string
): Promise<{ status: string; refreshed_at: string; current: any; daily_forecast: any[] }> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/climate/refresh`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Failed to refresh climate observations');
  }
  return res.json();
}

