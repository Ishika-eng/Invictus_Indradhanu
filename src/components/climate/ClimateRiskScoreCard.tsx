import React from 'react';
import { 
  ShieldAlert, 
  CloudRain, 
  Thermometer, 
  Waves, 
  Wind, 
  AlertTriangle 
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const ClimateRiskScoreCard: React.FC = () => {
  const { selectedCrop } = useAdvisory();

  const riskFactors = [
    { title: 'Rainfall Risk', score: 78, level: 'High', color: 'bg-rose-500', icon: CloudRain },
    { title: 'Soil Moisture Risk', score: 64, level: 'Moderate', color: 'bg-amber-500', icon: Waves },
    { title: 'Temperature Risk', score: 32, level: 'Low', color: 'bg-emerald-500', icon: Thermometer },
    { title: 'Wind Gust Risk', score: 28, level: 'Low', color: 'bg-emerald-500', icon: Wind },
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-amber-100 text-amber-800">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            Crop Climate Risk Score
          </h3>
        </div>

        <span className="text-[10px] font-mono text-moss-500">
          Composite Index
        </span>
      </div>

      {/* Score Hero */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
            Overall Crop Risk Index
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-black text-3xl sm:text-4xl text-amber-950">
              62
            </span>
            <span className="text-xs font-bold text-amber-800 font-mono">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-amber-500 text-white shadow-sm">
            MODERATE RISK
          </span>
          <p className="text-[10px] text-amber-900 font-medium mt-1">
            Precautionary pause needed
          </p>
        </div>
      </div>

      {/* 4 Factor Breakdown Bars */}
      <div className="space-y-3">
        {riskFactors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-moss-800 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-moss-500" />
                  <span>{f.title}</span>
                </span>
                <span className="font-mono font-bold text-[11px] text-moss-700">
                  {f.score}% ({f.level})
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${f.color}`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
