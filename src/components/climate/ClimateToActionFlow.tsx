import React from 'react';
import { 
  CloudRain, 
  ShieldAlert, 
  Sprout, 
  Lightbulb, 
  ArrowRight, 
  ArrowDown, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const ClimateToActionFlow: React.FC = () => {
  const { selectedLocation, selectedCrop } = useAdvisory();

  const steps = [
    {
      label: 'WEATHER SIGNAL',
      sub: `Rain probability ${selectedLocation.rainProbPct}% ↑`,
      desc: '38mm convective storm approaching in next 24 hours',
      icon: CloudRain,
      bg: 'bg-skyalt-50 text-skyalt-900 border-skyalt-200',
      iconBg: 'bg-skyalt-600 text-white',
      arrowColor: 'text-skyalt-600'
    },
    {
      label: 'CLIMATE RISK',
      sub: 'Waterlogging & Hypoxia ↑',
      desc: `Soil moisture already at ${selectedLocation.soilMoisturePct}% (saturated)`,
      icon: ShieldAlert,
      bg: 'bg-amber-50 text-amber-950 border-amber-200',
      iconBg: 'bg-amber-600 text-white',
      arrowColor: 'text-amber-600'
    },
    {
      label: 'CROP IMPACT',
      sub: 'Irrigation Unnecessary',
      desc: `Flooding will trigger blossom abortion in ${selectedCrop}`,
      icon: Sprout,
      bg: 'bg-earth-50 text-earth-950 border-earth-200',
      iconBg: 'bg-earth-600 text-white',
      arrowColor: 'text-earth-600'
    },
    {
      label: 'RECOMMENDED ACTION',
      sub: 'Delay Irrigation 24h',
      desc: 'Saves 3,200L water & protects root respiration',
      icon: Lightbulb,
      bg: 'bg-agri-700 text-white border-agri-600 shadow-soft',
      iconBg: 'bg-white text-agri-900',
      arrowColor: 'text-agri-600'
    }
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-agri-100 text-agri-800">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            Climate → Action Intelligence Transformation
          </h3>
        </div>

        <span className="text-[10px] font-mono text-moss-500">
          Reasoning Pipeline
        </span>
      </div>

      <p className="text-xs text-moss-500">
        How raw atmospheric variables are processed by AI into a precise smallholder decision:
      </p>

      {/* 4 Pipeline Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={st.label} className="relative flex flex-col justify-between">
              <div className={`p-4 rounded-2xl border ${st.bg} flex-1 flex flex-col justify-between space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">
                    {st.label}
                  </span>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${st.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-sm leading-tight">
                    {st.sub}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-1 leading-snug">
                    {st.desc}
                  </p>
                </div>

                <div className="text-[9px] font-mono opacity-60">
                  Stage {idx + 1} of 4
                </div>
              </div>

              {/* Arrow divider for desktop */}
              {!isLast && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-canvas-300 items-center justify-center text-moss-400 shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5 text-agri-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
