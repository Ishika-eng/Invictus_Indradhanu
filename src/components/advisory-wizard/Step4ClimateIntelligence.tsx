import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { LiveClimateCard } from '../climate/LiveClimateCard';
import { SevenDayWeatherTimeline } from '../climate/SevenDayWeatherTimeline';
import { SoilHealthMoistureGauge } from '../climate/SoilHealthMoistureGauge';
import { ClimateRiskScoreCard } from '../climate/ClimateRiskScoreCard';
import { ClimateToActionFlow } from '../climate/ClimateToActionFlow';
import { AiReasoningSummary } from '../climate/AiReasoningSummary';
import { DataSourcesTransparency } from '../climate/DataSourcesTransparency';
import { StylizedFarmMap } from '../climate/StylizedFarmMap';

export const Step4ClimateIntelligence: React.FC = () => {
  const { setDemoStep } = useAdvisory();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-skyalt-700 bg-skyalt-50 px-2.5 py-1 rounded-lg border border-skyalt-200">
            Step 4 of 6 • Climate Intelligence Layer
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Environmental Telemetry & Decision Physics
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Transparently visualize how atmospheric variables and root hydration translate into farming risk scores.
          </p>
        </div>
      </div>

      {/* 1. Live Dynamic Climate Card */}
      <LiveClimateCard />

      {/* 2. 7-Day Horizontal Weather & Precipitation Timeline */}
      <SevenDayWeatherTimeline />

      {/* 3. Dual Grid: Soil Moisture Gauge & Climate Risk Score (62/100) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SoilHealthMoistureGauge />
        <ClimateRiskScoreCard />
      </div>

      {/* 4. Climate → Action Transformation Decision Flow */}
      <ClimateToActionFlow />

      {/* 5. Dual Grid: AI Reasoning Summary ("Why did AI recommend this?") & Stylized Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiReasoningSummary />
        <StylizedFarmMap />
      </div>

      {/* 6. Data Source Transparency */}
      <DataSourcesTransparency />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-canvas-200">
        <button
          type="button"
          onClick={() => setDemoStep(2)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Selection</span>
        </button>

        <button
          type="button"
          onClick={() => setDemoStep(5)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
        >
          <span>Continue to Step 5 — AI Recommendation</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
