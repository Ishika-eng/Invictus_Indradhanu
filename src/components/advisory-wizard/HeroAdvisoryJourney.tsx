import React from 'react';
import { 
  User, 
  Sprout, 
  Sparkles, 
  CloudSun, 
  Lightbulb, 
  Radio, 
  CheckCircle2, 
  RotateCcw,
  Leaf,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAdvisory, DemoStep } from '../../context/AdvisoryContext';
import { Step1FarmerProfile } from './Step1FarmerProfile';
import { Step2CropSelection } from './Step2CropSelection';
import { Step3Processing } from './Step3Processing';
import { Step4ClimateIntelligence } from './Step4ClimateIntelligence';
import { Step5Recommendation } from './Step5Recommendation';
import { Step6Delivery } from './Step6Delivery';

export const HeroAdvisoryJourney: React.FC = () => {
  const { 
    demoStep, 
    setDemoStep, 
    farmerName, 
    selectedCrop, 
    selectedLocation, 
    resetDemoFlow 
  } = useAdvisory();

  const stepsMeta: { num: DemoStep; label: string; icon: React.FC<{ className?: string }>; sub: string }[] = [
    { num: 1, label: 'Farmer Profile', sub: 'Location & Phone', icon: User },
    { num: 2, label: 'Crop & Stage', sub: 'Field Context', icon: Sprout },
    { num: 3, label: 'AI Processing', sub: 'Data Reasoning', icon: Sparkles },
    { num: 4, label: 'Climate Intel', sub: 'Weather & Soil', icon: CloudSun },
    { num: 5, label: 'Recommendation', sub: '"What to do?"', icon: Lightbulb },
    { num: 6, label: 'Delivery', sub: 'Voice & SMS', icon: Radio },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Header & Value Proposition Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-moss-900 via-agri-950 to-moss-900 text-white p-6 sm:p-8 border border-agri-600/30 shadow-soft-lg relative overflow-hidden">
        
        {/* Ambient mesh background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-agri-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-agri-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-agri-300 bg-agri-800/80 px-2.5 py-0.5 rounded-full border border-agri-500/30">
                Interactive Farm Demonstration
              </span>
            </div>

            {/* Required Hero Headline */}
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              Climate Intelligence.<br />
              <span className="text-agri-300">Delivered to Every Farmer.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-canvas-200/90 mt-2.5 leading-relaxed">
              Turn live weather and environmental data into simple, actionable farming advice — delivered over accessible Voice IVR, SMS, and WhatsApp.
            </p>

            {/* Quick 10-Second Visual Value Badges */}
            <div className="flex items-center gap-2 sm:gap-3 mt-4 flex-wrap text-[11px] font-semibold text-canvas-300">
              <span className="bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
                <span>👨🏽‍🌾</span>
                <strong className="text-white">Smallholder Farmers</strong>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
                <span>🛰️</span>
                <strong className="text-white">Open-Meteo & Soil Radar</strong>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
                <span>📞</span>
                <strong className="text-white">Regional Voice & SMS</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={resetDemoFlow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-agri-300" />
              <span>Restart Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Step Visual Journey Stepper */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-canvas-300 shadow-soft-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isCurrent = demoStep === s.num;
            const isCompleted = demoStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setDemoStep(s.num)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-agri-800 text-white border-agri-700 shadow-soft font-bold'
                    : isCompleted
                    ? 'bg-agri-50/90 text-agri-950 border-agri-200 hover:bg-agri-100'
                    : 'bg-canvas-100/70 text-moss-500 border-canvas-300 hover:bg-canvas-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    isCurrent ? 'bg-agri-500 text-white' : isCompleted ? 'bg-agri-200 text-agri-800' : 'bg-canvas-200 text-moss-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-agri-700" /> : s.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-agri-300' : isCompleted ? 'text-agri-600' : 'text-moss-400'}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold leading-tight line-clamp-1 ${isCurrent ? 'text-white' : 'text-moss-900'}`}>
                    {s.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 leading-tight line-clamp-1 ${isCurrent ? 'text-agri-200' : 'text-moss-500'}`}>
                    {s.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step Container Card */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-8">
        {demoStep === 1 && <Step1FarmerProfile />}
        {demoStep === 2 && <Step2CropSelection />}
        {demoStep === 3 && <Step3Processing />}
        {demoStep === 4 && <Step4ClimateIntelligence />}
        {demoStep === 5 && <Step5Recommendation />}
        {demoStep === 6 && <Step6Delivery />}
      </div>
    </div>
  );
};
