import React from 'react';
import { 
  Sparkles, 
  Satellite, 
  Cpu, 
  Waves, 
  Radio, 
  CheckCircle2, 
  ArrowLeft,
  ShieldAlert,
  CloudRain,
  MapPin
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

interface StepGeneratingProps {
  onBack: () => void;
}

export const StepGenerating: React.FC<StepGeneratingProps> = ({ onBack }) => {
  const { 
    selectedFarmer, 
    selectedCrop, 
    selectedGrowthStage, 
    selectedSoilType, 
    selectedIrrigation, 
    acreage,
    selectedLanguage,
    isGenerating, 
    generationStep, 
    generationStatusText, 
    generateAdvisory 
  } = useAdvisory();

  const stepsList = [
    { num: 1, label: 'Connecting to Open-Meteo & NASA POWER Telemetry', icon: Satellite },
    { num: 2, label: `Simulating ${selectedSoilType} Root-Zone Saturation Index`, icon: Waves },
    { num: 3, label: `Evaluating ${selectedCrop} (${selectedGrowthStage}) Micro-Climate Vulnerability`, icon: Cpu },
    { num: 4, label: `Synthesizing Multi-lingual Voice & SMS Payloads (${selectedLanguage.toUpperCase()})`, icon: Radio },
  ];

  return (
    <div className="space-y-6">
      {/* Context Summary Box */}
      <div className="p-5 rounded-2xl bg-white border border-canvas-300 shadow-soft">
        <h4 className="text-xs font-bold uppercase tracking-wider text-moss-600 mb-3 flex items-center justify-between">
          <span>Target Advisory Pipeline Context</span>
          <span className="font-mono text-agri-700 bg-agri-50 px-2 py-0.5 rounded text-[10px] border border-agri-200">
            Micro-Zone Linked
          </span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-canvas-100/80 border border-canvas-200">
            <span className="text-[10px] font-bold text-moss-500 uppercase block">Farmer</span>
            <p className="font-bold text-xs text-moss-900 mt-0.5 truncate">{selectedFarmer.name}</p>
            <p className="text-[10px] text-moss-600 truncate">{selectedFarmer.location.village}, {selectedFarmer.location.district}</p>
          </div>

          <div className="p-3 rounded-xl bg-canvas-100/80 border border-canvas-200">
            <span className="text-[10px] font-bold text-moss-500 uppercase block">Active Crop & Stage</span>
            <p className="font-bold text-xs text-agri-900 mt-0.5 truncate">{selectedCrop} ({acreage} ac)</p>
            <p className="text-[10px] text-moss-600 truncate">{selectedGrowthStage}</p>
          </div>

          <div className="p-3 rounded-xl bg-canvas-100/80 border border-canvas-200">
            <span className="text-[10px] font-bold text-moss-500 uppercase block">Soil & Irrigation</span>
            <p className="font-bold text-xs text-moss-900 mt-0.5 truncate">{selectedSoilType.split(' ')[0]} Soil</p>
            <p className="text-[10px] text-moss-600 truncate">{selectedIrrigation}</p>
          </div>

          <div className="p-3 rounded-xl bg-canvas-100/80 border border-canvas-200">
            <span className="text-[10px] font-bold text-moss-500 uppercase block">Channel Dialect</span>
            <p className="font-bold text-xs text-earth-800 mt-0.5 uppercase">{selectedLanguage} Dialect</p>
            <p className="text-[10px] text-moss-600">GSM Voice + SMS</p>
          </div>
        </div>
      </div>

      {/* Main AI Generation Interactive Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-moss-900 via-agri-900 to-moss-950 text-white border border-agri-600/30 shadow-soft-lg relative overflow-hidden text-center">
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(82,183,136,0.15)_0,transparent_70%)] pointer-events-none" />

        {!isGenerating ? (
          <div className="relative z-10 max-w-xl mx-auto py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agri-400 to-agri-600 text-moss-950 mx-auto flex items-center justify-center shadow-glow-agri mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Ready to Formulate Hyperlocal Advice
            </h3>
            <p className="text-xs sm:text-sm text-canvas-300 mt-2">
              Our AI Agronomy engine will query live radar Doppler indices, calculate soil hydrology physics, and translate actionable directives into {selectedFarmer.name}'s native dialect.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all"
              >
                Modify Crop Details
              </button>

              <button
                type="button"
                onClick={() => generateAdvisory()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-agri-400 via-agri-300 to-agri-400 hover:from-agri-300 hover:to-agri-200 text-moss-950 font-extrabold text-sm sm:text-base shadow-glow-agri hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-moss-950 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Generate Climate Advisory</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live AI Processing Animation */
          <div className="relative z-10 max-w-lg mx-auto py-6">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-agri-400/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-agri-800 border-2 border-agri-400 flex items-center justify-center shadow-glow-agri">
                <Cpu className="w-9 h-9 text-agri-300 animate-pulse" />
              </div>
            </div>

            <h3 className="font-display font-bold text-xl text-white">
              AI Climate Engine In Action...
            </h3>
            <p className="text-xs text-agri-300 font-mono mt-1 animate-pulse">
              {generationStatusText}
            </p>

            {/* Progress Step List */}
            <div className="mt-6 space-y-2.5 text-left bg-moss-950/60 p-4 rounded-2xl border border-agri-500/20">
              {stepsList.map((step) => {
                const Icon = step.icon;
                const isComplete = generationStep > step.num;
                const isCurrent = generationStep === step.num;

                return (
                  <div
                    key={step.num}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-agri-800/80 text-white border border-agri-400/40'
                        : isComplete
                        ? 'text-agri-300'
                        : 'text-moss-600 opacity-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      isComplete ? 'bg-agri-400 text-moss-950 font-bold' : isCurrent ? 'bg-agri-600 text-white' : 'bg-moss-800'
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium truncate">{step.label}</span>
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
