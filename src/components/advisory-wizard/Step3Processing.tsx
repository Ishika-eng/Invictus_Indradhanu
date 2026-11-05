import React from 'react';
import { 
  Sparkles, 
  Satellite, 
  CloudRain, 
  Waves, 
  Cpu, 
  Lightbulb, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Radio
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const Step3Processing: React.FC = () => {
  const { 
    farmerName, 
    selectedLocation, 
    selectedCrop, 
    selectedStage, 
    selectedLanguage,
    isAiProcessing, 
    processingStageIndex, 
    runAiProcessing, 
    setDemoStep 
  } = useAdvisory();

  // Polished 4-phase loading text
  const stagesList = [
    { num: 0, text: 'Collecting climate data from satellites and local sensors', icon: Satellite },
    { num: 1, text: `Analyzing conditions for ${selectedLocation.city} micro-zone`, icon: CloudRain },
    { num: 2, text: `Assessing crop risk for ${selectedCrop} (${selectedStage})`, icon: Cpu },
    { num: 3, text: `Preparing recommendation in ${selectedLanguage.toUpperCase()} dialect`, icon: Lightbulb },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
            Step 3 of 6
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Generate Climate Advisory
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Turn live weather and soil data into clear, actionable advice for {farmerName}.
          </p>
        </div>
      </div>

      {/* Selected Summary Pill Badges */}
      <div className="p-4 rounded-2xl bg-canvas-100/70 border border-canvas-300 shadow-soft-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white border border-canvas-200">
          <span className="text-[10px] font-bold text-moss-500 uppercase block">Farmer</span>
          <p className="font-bold text-xs text-moss-900 mt-0.5 truncate">{farmerName}</p>
          <p className="text-[10px] text-moss-500 truncate">📍 {selectedLocation.city}, {selectedLocation.state}</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-canvas-200">
          <span className="text-[10px] font-bold text-moss-500 uppercase block">Crop & Stage</span>
          <p className="font-bold text-xs text-agri-900 mt-0.5 truncate">{selectedCrop}</p>
          <p className="text-[10px] text-moss-500 truncate">{selectedStage} Stage</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-canvas-200">
          <span className="text-[10px] font-bold text-moss-500 uppercase block">Live Conditions</span>
          <p className="font-bold text-xs text-moss-900 mt-0.5 truncate">{selectedLocation.tempC}°C • {selectedLocation.rainProbPct}% Chance of Rain</p>
          <p className="text-[10px] text-moss-500 truncate">Soil: {selectedLocation.soilStatus}</p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-canvas-200">
          <span className="text-[10px] font-bold text-moss-500 uppercase block">Language Dialect</span>
          <p className="font-bold text-xs text-earth-800 uppercase mt-0.5 truncate">{selectedLanguage} Dialect</p>
          <p className="text-[10px] text-moss-500 truncate">Voice Call + SMS</p>
        </div>
      </div>

      {/* Main Interactive CTA Card */}
      <div className="rounded-3xl bg-gradient-to-br from-moss-900 via-moss-800 to-agri-950 text-white p-6 sm:p-10 border border-agri-600/30 shadow-soft-lg text-center relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(82,183,136,0.18)_0,transparent_70%)] pointer-events-none" />

        {!isAiProcessing ? (
          <div className="relative z-10 max-w-lg mx-auto py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agri-400 to-agri-600 text-moss-950 mx-auto flex items-center justify-center shadow-glow-agri mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Ready to Generate Advisory
            </h3>
            <p className="text-xs sm:text-sm text-canvas-200/90 mt-2 leading-relaxed">
              The AI engine will evaluate live rainfall forecasts, soil moisture sensors, and {selectedCrop} vulnerability to produce tailored farming advice.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDemoStep(2)}
                disabled={isAiProcessing}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Change Crop
              </button>

              <button
                type="button"
                onClick={() => runAiProcessing()}
                disabled={isAiProcessing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-agri-400 via-agri-300 to-agri-400 hover:from-agri-300 hover:to-agri-200 text-moss-950 font-black text-sm sm:text-base shadow-glow-agri hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 text-moss-950 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{isAiProcessing ? 'Generating Advice...' : 'Generate Advice'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Real-time 4-Stage Progressive Pipeline Feedback */
          <div className="relative z-10 max-w-lg mx-auto py-4">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-agri-400/30 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-agri-800 border-2 border-agri-400 flex items-center justify-center shadow-glow-agri">
                <Cpu className="w-9 h-9 text-agri-300 animate-pulse" />
              </div>
            </div>

            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Analyzing Farm Conditions...
            </h3>
            <p className="text-xs text-agri-300 font-mono mt-1 animate-pulse">
              {stagesList[Math.min(stagesList.length - 1, processingStageIndex)]?.text}
            </p>

            {/* Sequence Progress Items */}
            <div className="mt-6 space-y-2.5 text-left bg-moss-950/70 p-4 rounded-2xl border border-agri-500/20">
              {stagesList.map((st) => {
                const Icon = st.icon;
                const isPassed = processingStageIndex > st.num;
                const isCurrent = processingStageIndex === st.num;

                return (
                  <div
                    key={st.num}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                      isCurrent
                        ? 'bg-agri-800/90 text-white border border-agri-400/40 shadow-sm'
                        : isPassed
                        ? 'text-agri-300 opacity-90'
                        : 'text-moss-600 opacity-40'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      isPassed ? 'bg-agri-400 text-moss-950 font-bold' : isCurrent ? 'bg-agri-600 text-white animate-pulse' : 'bg-moss-800 text-moss-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : st.num + 1}
                    </div>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold truncate">{st.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
