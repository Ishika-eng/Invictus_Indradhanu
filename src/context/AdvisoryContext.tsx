import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  FarmerProfile, 
  CropType, 
  GrowthStage, 
  SoilType, 
  IrrigationType, 
  AIAdvisory, 
  Language, 
  MetricSummary,
  WeatherCondition,
  SoilMoistureDepth,
  DayForecast
} from '../types/advisory';
import { 
  SAMPLE_FARMERS, 
  MOCK_WEATHER_CURRENT, 
  MOCK_SOIL_DEPTHS, 
  MOCK_FORECAST_7DAY, 
  MOCK_DEFAULT_ADVISORY, 
  INITIAL_METRICS 
} from '../data/mockData';
import { BackendAdvisory, generateFarmAdvisory } from '../services/api';
import { useAuth } from './AuthContext';

export type DemoStep = 1 | 2 | 3 | 4 | 5 | 6;
export type DeliveryChannelChoice = 'sms' | 'voice' | 'mobile';

export interface LocationOption {
  city: string;
  state: string;
  country: string;
  tempC: number;
  humidityPct: number;
  rainProbPct: number;
  windKmh: number;
  soilMoisturePct: number;
  soilTempC: number;
  soilStatus: 'Adequate' | 'Elevated' | 'Dry' | 'Saturated';
}

export const PRESET_LOCATIONS: LocationOption[] = [
  {
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    tempC: 28,
    humidityPct: 72,
    rainProbPct: 68,
    windKmh: 14,
    soilMoisturePct: 74,
    soilTempC: 24,
    soilStatus: 'Elevated'
  },
  {
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    tempC: 29,
    humidityPct: 75,
    rainProbPct: 78,
    windKmh: 18,
    soilMoisturePct: 76,
    soilTempC: 25,
    soilStatus: 'Elevated'
  },
  {
    city: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    tempC: 32,
    humidityPct: 68,
    rainProbPct: 45,
    windKmh: 12,
    soilMoisturePct: 58,
    soilTempC: 28,
    soilStatus: 'Adequate'
  },
  {
    city: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    tempC: 34,
    humidityPct: 52,
    rainProbPct: 20,
    windKmh: 10,
    soilMoisturePct: 48,
    soilTempC: 29,
    soilStatus: 'Adequate'
  },
  {
    city: 'Kisumu',
    state: 'Western Province',
    country: 'Kenya',
    tempC: 26,
    humidityPct: 80,
    rainProbPct: 72,
    windKmh: 16,
    soilMoisturePct: 80,
    soilTempC: 22,
    soilStatus: 'Saturated'
  }
];

export type SimplifiedGrowthStage = 
  | 'Preparing land'
  | 'Planting'
  | 'Growing'
  | 'Flowering'
  | 'Harvesting'
  | string;

export type ActiveTab = 'advisory-wizard' | 'overview' | 'climate-hub' | 'advisory-result' | 'farmers' | 'history';

interface AdvisoryContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  demoStep: DemoStep;
  setDemoStep: (step: DemoStep) => void;
  
  // Step 1: Farmer & Location
  farmerName: string;
  setFarmerName: (name: string) => void;
  farmerPhone: string;
  setFarmerPhone: (phone: string) => void;
  selectedLocation: LocationOption;
  setSelectedLocation: (loc: LocationOption) => void;
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  
  // Step 2: Crop & Stage
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  selectedStage: SimplifiedGrowthStage;
  setSelectedStage: (stage: SimplifiedGrowthStage) => void;
  
  // Step 3: AI Processing Sequence
  isAiProcessing: boolean;
  processingStageIndex: number;
  runAiProcessing: () => Promise<void>;
  
  // Step 6: Delivery
  selectedDeliveryChannel: DeliveryChannelChoice;
  setSelectedDeliveryChannel: (ch: DeliveryChannelChoice) => void;
  deliveryState: 'idle' | 'sending' | 'delivered';
  sendAdvisoryDelivery: () => Promise<void>;
  
  // Presentation Mode Toggle
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean) => void;
  togglePresentationMode: () => void;
  
  // Weather & Soil telemetry
  weatherData: WeatherCondition;
  soilDepths: SoilMoistureDepth[];
  forecast7Day: DayForecast[];
  
  // Supporting attributes
  selectedGrowthStage: GrowthStage;
  setSelectedGrowthStage: (stage: GrowthStage) => void;
  selectedSoilType: SoilType;
  setSelectedSoilType: (soil: SoilType) => void;
  selectedIrrigation: IrrigationType;
  setSelectedIrrigation: (irr: IrrigationType) => void;
  acreage: number;
  setAcreage: (acres: number) => void;
  isGenerating: boolean;
  generationStep: number;
  generationStatusText: string;
  generateAdvisory: () => Promise<void>;
  isSimulatingDispatch: boolean;
  dispatchSuccess: boolean;
  triggerLiveDispatch: (channel: 'sms' | 'voice' | 'all') => void;
  
  // Farmer Directory & Reset
  selectedFarmer: FarmerProfile;
  setSelectedFarmer: (farmer: FarmerProfile) => void;
  activeAdvisory: AIAdvisory;
  resetDemoFlow: () => void;
  metrics: MetricSummary;
  allFarmers: FarmerProfile[];
  addNewFarmer: (farmer: FarmerProfile) => void;
  latestBackendAdvisory: BackendAdvisory | null;
  setLatestBackendAdvisory: (adv: BackendAdvisory | null) => void;
}

const AdvisoryContext = createContext<AdvisoryContextType | undefined>(undefined);

export const AdvisoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedFarm, session } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('advisory-wizard');
  const [demoStep, setDemoStep] = useState<DemoStep>(1);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  // Step 1 inputs - Default Language set to 'en' (English)
  const [farmerName, setFarmerName] = useState('Ramesh Patil');
  const [farmerPhone, setFarmerPhone] = useState('+91 98234 11209');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(PRESET_LOCATIONS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  
  // Step 2 inputs
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedStage, setSelectedStage] = useState<SimplifiedGrowthStage>('Flowering');
  
  // Supporting attributes
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<GrowthStage>('Flowering & Booting');
  const [selectedSoilType, setSelectedSoilType] = useState<SoilType>('Black Clay Soil (Vertisol)');
  const [selectedIrrigation, setSelectedIrrigation] = useState<IrrigationType>('Drip Irrigation');
  const [acreage, setAcreage] = useState<number>(3.5);
  
  // Step 3 state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingStageIndex, setProcessingStageIndex] = useState(0);
  
  // Step 6 state
  const [selectedDeliveryChannel, setSelectedDeliveryChannel] = useState<DeliveryChannelChoice>('voice');
  const [deliveryState, setDeliveryState] = useState<'idle' | 'sending' | 'delivered'>('idle');

  // Atmospheric telemetry
  const [weatherData, setWeatherData] = useState<WeatherCondition>(MOCK_WEATHER_CURRENT);
  const [soilDepths, setSoilDepths] = useState<SoilMoistureDepth[]>(MOCK_SOIL_DEPTHS);
  const [forecast7Day, setForecast7Day] = useState<DayForecast[]>(MOCK_FORECAST_7DAY);

  // Farmers list
  const [allFarmers, setAllFarmers] = useState<FarmerProfile[]>(SAMPLE_FARMERS);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerProfile>(SAMPLE_FARMERS[0]);
  const [activeAdvisory, setActiveAdvisory] = useState<AIAdvisory>(MOCK_DEFAULT_ADVISORY);
  const [latestBackendAdvisory, setLatestBackendAdvisory] = useState<BackendAdvisory | null>(null);
  const [metrics, setMetrics] = useState<MetricSummary>(INITIAL_METRICS);

  const togglePresentationMode = () => {
    setIsPresentationMode(prev => !prev);
  };

  const addNewFarmer = (farmer: FarmerProfile) => {
    setAllFarmers(prev => [farmer, ...prev]);
    setSelectedFarmer(farmer);
    setFarmerName(farmer.name);
    setFarmerPhone(farmer.phone);
  };

  const runAiProcessing = async () => {
    // Prevent duplicate concurrent requests
    if (isAiProcessing) return;

    setIsAiProcessing(true);
    setDemoStep(3);
    setProcessingStageIndex(0);

    const startTime = performance.now();

    try {
      // 1. Kick off real backend advisory generation concurrently in the background
      const advisoryPromise = (selectedFarm?.id && session?.access_token)
        ? generateFarmAdvisory(
            { farm_id: selectedFarm.id, language: selectedLanguage },
            session.access_token
          ).catch((err) => {
            console.warn('Real advisory generation fallback:', err);
            return null;
          })
        : Promise.resolve(null);

      // Stage 0: Satellite & sensor telemetry
      setProcessingStageIndex(0);
      await new Promise(r => setTimeout(r, 220));

      // Stage 1: Micro-zone atmospheric analysis
      setProcessingStageIndex(1);
      await new Promise(r => setTimeout(r, 220));

      // Stage 2: Biophysical crop risk evaluation
      setProcessingStageIndex(2);
      await new Promise(r => setTimeout(r, 220));

      // Stage 3: Multi-lingual AI synthesis
      setProcessingStageIndex(3);

      // Await backend advisory generation without blocking the UI
      const generated = await advisoryPromise;
      if (generated) {
        setLatestBackendAdvisory(generated);
      }

      setProcessingStageIndex(4);
      await new Promise(r => setTimeout(r, 140));

      const elapsed = performance.now() - startTime;
      console.log(`[Indradhanu Pipeline] Step 3 Advisory Generation completed in ${elapsed.toFixed(1)}ms`);
    } finally {
      setIsAiProcessing(false);
      setDemoStep(4);
    }
  };

  const sendAdvisoryDelivery = async () => {
    setDeliveryState('sending');
    await new Promise(r => setTimeout(r, 1400));
    setDeliveryState('delivered');
    
    setMetrics(prev => ({
      ...prev,
      advisoriesDeliveredCount: prev.advisoriesDeliveredCount + 1,
      totalFarmersServed: prev.totalFarmersServed + 1
    }));
  };

  const generateAdvisory = async () => {
    await runAiProcessing();
  };

  const triggerLiveDispatch = async (channel: 'sms' | 'voice' | 'all') => {
    setSelectedDeliveryChannel(channel === 'all' ? 'voice' : channel);
    await sendAdvisoryDelivery();
  };

  const resetDemoFlow = () => {
    setDemoStep(1);
    setIsAiProcessing(false);
    setProcessingStageIndex(0);
    setDeliveryState('idle');
  };

  return (
    <AdvisoryContext.Provider value={{
      activeTab,
      setActiveTab,
      demoStep,
      setDemoStep,
      farmerName,
      setFarmerName,
      farmerPhone,
      setFarmerPhone,
      selectedLocation,
      setSelectedLocation,
      selectedLanguage,
      setSelectedLanguage,
      selectedCrop,
      setSelectedCrop,
      selectedStage,
      setSelectedStage,
      selectedGrowthStage,
      setSelectedGrowthStage,
      selectedSoilType,
      setSelectedSoilType,
      selectedIrrigation,
      setSelectedIrrigation,
      acreage,
      setAcreage,
      isAiProcessing,
      processingStageIndex,
      runAiProcessing,
      selectedDeliveryChannel,
      setSelectedDeliveryChannel,
      deliveryState,
      sendAdvisoryDelivery,
      isPresentationMode,
      setIsPresentationMode,
      togglePresentationMode,
      weatherData,
      soilDepths,
      forecast7Day,
      isGenerating: isAiProcessing,
      generationStep: processingStageIndex,
      generationStatusText: 'AI Processing active...',
      generateAdvisory,
      isSimulatingDispatch: deliveryState === 'sending',
      dispatchSuccess: deliveryState === 'delivered',
      triggerLiveDispatch,
      selectedFarmer,
      setSelectedFarmer,
      activeAdvisory,
      resetDemoFlow,
      metrics,
      allFarmers,
      addNewFarmer,
      latestBackendAdvisory,
      setLatestBackendAdvisory,
    }}>
      {children}
    </AdvisoryContext.Provider>
  );
};

export const useAdvisory = () => {
  const context = useContext(AdvisoryContext);
  if (!context) {
    throw new Error('useAdvisory must be used within an AdvisoryProvider');
  }
  return context;
};
