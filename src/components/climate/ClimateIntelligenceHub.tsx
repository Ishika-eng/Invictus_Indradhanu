import React from 'react';
import { 
  Satellite, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { LiveClimateCard } from './LiveClimateCard';
import { SevenDayWeatherTimeline } from './SevenDayWeatherTimeline';
import { SoilHealthMoistureGauge } from './SoilHealthMoistureGauge';
import { ClimateRiskScoreCard } from './ClimateRiskScoreCard';
import { ClimateToActionFlow } from './ClimateToActionFlow';
import { AiReasoningSummary } from './AiReasoningSummary';
import { DataSourcesTransparency } from './DataSourcesTransparency';
import { StylizedFarmMap } from './StylizedFarmMap';

export const ClimateIntelligenceHub: React.FC = () => {
  const { selectedFarmer, selectedLocation, selectedCrop, setActiveTab, setDemoStep } = useAdvisory();

  const handleLaunchAdvisory = () => {
    setDemoStep(3);
    setActiveTab('advisory-wizard');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0A1A12] via-[#0F261A] to-[#0A1A12] text-white p-6 sm:p-8 border border-agri-600/40 shadow-soft-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-agri-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Satellite className="w-4 h-4" />
            <span>Open-Meteo & NASA POWER Agrometeorology Hub</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Climate Intelligence & Decision Science Layer
          </h2>
          <p className="text-xs sm:text-sm text-canvas-300/80 mt-1 max-w-2xl">
            Real-time agro-meteorology and root-zone sensor telemetry for {selectedLocation.city} ({selectedCrop} crop).
          </p>
        </div>

        <button
          onClick={handleLaunchAdvisory}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-agri-400 hover:bg-agri-300 text-moss-950 font-bold text-xs sm:text-sm shadow-glow-agri transition-all active:scale-95 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-moss-950" />
          <span>Formulate Farmer Advisory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Live Dynamic Climate Card with environmental animations */}
      <LiveClimateCard />

      {/* 2. 7-Day Weather & Precipitation Timeline */}
      <SevenDayWeatherTimeline />

      {/* 3. Soil Moisture Circular Gauge & Climate Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SoilHealthMoistureGauge />
        <ClimateRiskScoreCard />
      </div>

      {/* 4. Climate → Action Transformation Decision Flow */}
      <ClimateToActionFlow />

      {/* 5. Dual Grid: AI Reasoning Summary & Stylized Farm Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiReasoningSummary />
        <StylizedFarmMap />
      </div>

      {/* 6. Data Source Transparency */}
      <DataSourcesTransparency />
    </div>
  );
};
