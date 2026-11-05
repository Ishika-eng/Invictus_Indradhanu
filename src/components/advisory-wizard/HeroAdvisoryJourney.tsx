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
import { TRANSLATIONS } from '../../utils/translations';

export const HeroAdvisoryJourney: React.FC = () => {
  const { 
    demoStep, 
    setDemoStep, 
    farmerName, 
    selectedCrop, 
    selectedLocation, 
    selectedLanguage,
    resetDemoFlow 
  } = useAdvisory();

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const stepsMeta: { num: DemoStep; label: string; icon: React.FC<{ className?: string }>; sub: string }[] = [
    { num: 1, label: t.step1Label, sub: t.step1Sub, icon: User },
    { num: 2, label: t.step2Label, sub: t.step2Sub, icon: Sprout },
    { num: 3, label: t.step3Label, sub: t.step3Sub, icon: Sparkles },
    { num: 4, label: t.step4Label, sub: t.step4Sub, icon: CloudSun },
    { num: 5, label: t.step5Label, sub: t.step5Sub, icon: Lightbulb },
    { num: 6, label: t.step6Label, sub: t.step6Sub, icon: Radio },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Header & Value Proposition Banner - Solid rich dark green with no fading */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0A1A12] via-[#0F261A] to-[#0A1A12] text-white p-6 sm:p-8 border border-agri-600/40 shadow-soft-lg relative overflow-hidden">
        
        {/* Subtle crisp highlight on top border */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-agri-400/30 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                {t.heroBadge}
              </span>
            </div>

            {/* Hero Headline */}
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              {t.heroTitle1}<br />
              <span className="text-emerald-300">
                {t.heroTitle2}
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed font-normal">
              {t.heroDesc}
            </p>

            {/* 10-Second Visual Value Badges */}
            <div className="flex items-center gap-2 sm:gap-3 mt-4 flex-wrap text-[11px] font-semibold text-slate-200">
              <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-sm">
                <span>👨🏽‍🌾</span>
                <strong className="text-white">{t.heroSmallholders}</strong>
              </span>
              <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-sm">
                <span>🛰️</span>
                <strong className="text-white">{t.heroSatellite}</strong>
              </span>
              <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-sm">
                <span>📞</span>
                <strong className="text-white">{t.heroVoiceSms}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={resetDemoFlow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white border border-white/25 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.heroRestart}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Step Visual Journey Stepper */}
      <div className="card-modern p-4 sm:p-5 bg-white space-y-3.5">
        
        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div 
            className="bg-gradient-to-r from-agri-600 via-agri-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(demoStep / 6) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isCurrent = demoStep === s.num;
            const isCompleted = demoStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setDemoStep(s.num)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                  isCurrent
                    ? 'bg-gradient-to-br from-[#123826] to-[#0A2216] text-white border-agri-500 shadow-soft font-bold ring-2 ring-agri-500/20'
                    : isCompleted
                    ? 'bg-agri-50/90 text-agri-950 border-agri-300 hover:bg-agri-100'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                    isCurrent 
                      ? 'bg-agri-500 text-white' 
                      : isCompleted 
                      ? 'bg-agri-200 text-agri-900 border border-agri-300' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-agri-800" /> : s.num}
                  </span>
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isCurrent ? 'text-emerald-300' : isCompleted ? 'text-agri-700' : 'text-slate-500'
                  }`} />
                </div>
                <div>
                  <p className={`text-xs font-extrabold leading-tight line-clamp-1 ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-agri-950 font-black' : 'text-slate-800 font-bold'
                  }`}>
                    {s.label}
                  </p>
                  <p className={`text-[11px] mt-0.5 leading-tight line-clamp-1 font-medium ${
                    isCurrent ? 'text-emerald-200' : isCompleted ? 'text-agri-700' : 'text-slate-500'
                  }`}>
                    {s.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step Container Card */}
      <div className="card-modern p-6 sm:p-8 bg-white border-slate-200/90 shadow-soft">
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

export default HeroAdvisoryJourney;
