export type Language = 'en' | 'hi' | 'mr' | 'te' | 'sw';

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  location: {
    village: string;
    district: string;
    state: string;
    country: string;
    coordinates: [number, number]; // [lat, lng]
    elevationMeters: number;
    microZoneName: string;
  };
  preferredLanguage: Language;
  landHoldingAcres: number;
  cropHistory: string[];
  activeCropId?: string;
  lastAdvisoryDate?: string;
  trustScore: number; // 0-100
}

export type CropType = 
  | 'Wheat'
  | 'Paddy (Rice)'
  | 'Rice (Paddy)'
  | 'Cotton'
  | 'Tomato'
  | 'Sugarcane'
  | 'Maize'
  | 'Maize (Corn)'
  | 'Mustard'
  | 'Coffee'
  | 'Soybean'
  | 'Chickpea'
  | string;

export type GrowthStage = 
  | 'Germination & Emergence'
  | 'Vegetative / Tillering'
  | 'Flowering & Booting'
  | 'Pod / Grain Filling'
  | 'Maturity & Ripening'
  | 'Harvest Ready'
  | string;

export type SoilType = 
  | 'Black Clay Soil (Vertisol)'
  | 'Alluvial Loam'
  | 'Red Sandy Loam'
  | 'Laterite / Volcanic Soil'
  | 'Clay Loam';

export type IrrigationType = 
  | 'Rainfed Only'
  | 'Drip Irrigation'
  | 'Canal / Flood Irrigation'
  | 'Tube Well / Sprinkler';

export type RiskLevel = 'SAFE' | 'WATCH' | 'HIGH RISK';

export interface SoilMoistureDepth {
  depthRange: string; // "0-10cm (Surface)", "10-40cm (Root-Zone)", "40-100cm (Subsoil)"
  percentage: number;
  status: 'Deficit' | 'Optimal' | 'Saturated' | 'Waterlogged';
  idealRange: [number, number];
}

export interface WeatherCondition {
  currentTempC: number;
  feelsLikeC: number;
  rainProbabilityPct: number;
  humidityPct: number;
  windSpeedKmh: number;
  windDirection: string;
  solarRadiationWm2: number;
  evapotranspirationMm: number;
  nextRainExpectedInHours: number | null;
  rainExpectedMm: number;
  summary: string;
  uvIndex: number;
  dewPointC: number;
}

export interface DayForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  rainMm: number;
  weatherCode: 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'partly-cloudy';
  riskTag: 'Optimal' | 'Irrigate' | 'Hold Spray' | 'Pest Risk' | 'Rain Alert';
}

export interface AIAdvisory {
  id: string;
  farmerId: string;
  farmerName: string;
  cropName: CropType;
  growthStage: GrowthStage;
  soilType: SoilType;
  irrigationType: IrrigationType;
  createdAt: string;
  riskLevel: RiskLevel;
  confidencePct: number;
  
  // Hero actionable advice
  immediateAction: string;
  whyItMatters: string;
  recommendedTiming: string;
  riskIfIgnored?: string;
  impactPotential: string;
  
  // Multi-lingual translations
  translations: {
    [key in Language]: {
      immediateAction: string;
      whyItMatters: string;
      recommendedTiming: string;
      smsBody: string;
      voiceScript: string;
    };
  };

  // Step-by-step agronomic details
  actionSteps: string[];
  scientificReasoning: string[];
  climateTriggers: {
    title: string;
    value: string;
    trend: 'rising' | 'falling' | 'stable';
    severity: 'normal' | 'caution' | 'critical';
  }[];

  // Delivery payload
  channels: {
    sms: {
      sent: boolean;
      deliveredAt?: string;
      carrier: string;
      characterCount: number;
      body: string;
    };
    voice: {
      sent: boolean;
      callDurationSec: number;
      answeredAt?: string;
      audioUrl?: string;
      voiceTone: 'Friendly Regional Agronomist' | 'Urgent Weather Broadcast';
      transcript: string;
    };
    whatsapp: {
      sent: boolean;
      deliveredAt?: string;
      readAt?: string;
    };
  };
}

export interface MetricSummary {
  totalFarmersServed: number;
  activeAdvisoriesCount: number;
  climateRisksDetected: number;
  advisoriesDeliveredCount: number;
  waterSavedLiters: number;
  pesticideSavedPct: number;
}
