import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Globe2, 
  Droplet, 
  Flame,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { Language } from '../../types/advisory';
import { WorkflowProgress } from '../layout/WorkflowProgress';
import { ChannelDeliveryPreview } from './ChannelDeliveryPreview';

export const ActionableAdviceCard: React.FC = () => {
  const { 
    activeAdvisory, 
    selectedLanguage, 
    setSelectedLanguage, 
    selectedFarmer, 
    setActiveTab 
  } = useAdvisory();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  const currentTranslation = activeAdvisory.translations[selectedLanguage] || activeAdvisory.translations.en;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Workflow Pipe Stage */}
      <WorkflowProgress currentStage="recommendation" />

      {/* Main Action Hero Recommendation Card */}
      <div className="rounded-3xl bg-white border-2 border-agri-600/50 shadow-soft-lg p-6 sm:p-8 relative overflow-hidden">
        
        {/* Top Accent Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-canvas-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-agri-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-agri-800 bg-agri-100/70 px-2.5 py-0.5 rounded-md border border-agri-300">
                Action Directive • {activeAdvisory.cropName} ({activeAdvisory.growthStage})
              </span>
              <span className="text-xs font-mono text-moss-500">
                ID: {activeAdvisory.id}
              </span>
            </div>
            
            <h1 className="font-display font-black text-2xl sm:text-3xl text-moss-900 tracking-tight">
              WHAT SHOULD THE FARMER DO?
            </h1>
            <p className="text-xs text-moss-500 mt-1">
              Customized for {selectedFarmer.name} • {selectedFarmer.location.village}, {selectedFarmer.location.district}
            </p>
          </div>

          {/* Regional Dialect Switcher Pill */}
          <div className="flex items-center gap-1.5 bg-canvas-100 p-1.5 rounded-2xl border border-canvas-300 self-start md:self-auto">
            <Globe2 className="w-4 h-4 text-agri-700 ml-1.5" />
            <div className="flex items-center gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedLanguage === lang.code
                      ? 'bg-agri-700 text-white shadow-soft-sm'
                      : 'text-moss-700 hover:bg-canvas-200'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Giant Immediate Action Directive Banner */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-agri-800 via-agri-700 to-moss-900 text-white shadow-soft relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-agri-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400 fill-current" />
              <span>Immediate Action Required</span>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-display font-extrabold text-canvas-50 leading-snug">
              "{currentTranslation.immediateAction}"
            </p>
          </div>
        </div>

        {/* 3 Pillars: Why It Matters, Recommended Timing, Impact Potential */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          
          {/* Why It Matters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-earth-50/60 border border-earth-200">
            <div className="flex items-center gap-2 text-earth-800 text-xs font-bold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-earth-600" />
              <span>Why It Matters</span>
            </div>
            <p className="text-xs sm:text-sm text-moss-800 font-medium leading-relaxed">
              {currentTranslation.whyItMatters}
            </p>
          </div>

          {/* Recommended Timing */}
          <div className="p-4 sm:p-5 rounded-2xl bg-skyalt-50/60 border border-skyalt-200">
            <div className="flex items-center gap-2 text-skyalt-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-skyalt-600" />
              <span>Recommended Timing</span>
            </div>
            <p className="text-xs sm:text-sm text-moss-800 font-semibold leading-relaxed">
              {currentTranslation.recommendedTiming}
            </p>
            <div className="mt-2 text-[10px] text-skyalt-800 font-mono bg-skyalt-100/80 px-2 py-0.5 rounded inline-block">
              Window Closes: Friday 08:00 AM
            </div>
          </div>

          {/* Impact Potential */}
          <div className="p-4 sm:p-5 rounded-2xl bg-agri-50/70 border border-agri-200">
            <div className="flex items-center gap-2 text-agri-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-agri-700" />
              <span>Projected Impact</span>
            </div>
            <p className="text-xs sm:text-sm text-moss-800 font-semibold leading-relaxed">
              {activeAdvisory.impactPotential}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-agri-800 font-bold">
              <Droplet className="w-3 h-3 text-skyalt-600" />
              <span>Optimizes Pumping & Prevents Waterlogging</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Action Checklist */}
        <div className="pt-4 border-t border-canvas-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-moss-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-agri-700" />
            <span>Step-by-Step Farm Execution Plan</span>
          </h4>
          <div className="space-y-2.5">
            {activeAdvisory.actionSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-canvas-100/80 border border-canvas-200 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-agri-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs font-semibold text-moss-800 leading-snug">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Channels Engine */}
      <ChannelDeliveryPreview />
    </div>
  );
};
