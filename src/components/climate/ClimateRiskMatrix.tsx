import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Bug, 
  ThermometerSnowflake, 
  CloudRain, 
  Wind, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const ClimateRiskMatrix: React.FC = () => {
  const { activeAdvisory, selectedCrop, selectedFarmer } = useAdvisory();

  const riskTriggers = [
    {
      title: 'Convective Rain & Waterlogging',
      value: '82% Probability (38.5mm)',
      severity: 'critical' as const,
      trend: 'rising' as const,
      desc: 'Severe root hypoxia & blossom drop risk if flooded.',
      icon: CloudRain,
    },
    {
      title: 'Fungal Blight / Mildew Spore Window',
      value: 'High Spore Index (78% RH)',
      severity: 'caution' as const,
      trend: 'rising' as const,
      desc: 'High relative humidity combined with 30°C temperature triggers spore germination.',
      icon: Bug,
    },
    {
      title: 'Heat Stress / Thermal Shock',
      value: '31.4°C Air / 34.8°C Feels',
      severity: 'normal' as const,
      trend: 'stable' as const,
      desc: 'Within manageable threshold for current vegetative canopy.',
      icon: ThermometerSnowflake,
    },
    {
      title: 'Wind Gust & Lodging Hazard',
      value: '18 km/h Sustained (28km/h Gusts)',
      severity: 'caution' as const,
      trend: 'rising' as const,
      desc: 'Foliar spray drift hazard; spray should only be executed during calm morning hours.',
      icon: Wind,
    }
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-100 text-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
              AI Micro-Climate Risk Engine & Reasoning
            </h3>
          </div>
          <p className="text-xs text-moss-500 mt-0.5">
            Crop-phenology vulnerability formulas mapped to real-time satellite telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-agri-50 px-3 py-1 rounded-xl border border-agri-200 text-xs font-bold text-agri-800">
            <Cpu className="w-3.5 h-3.5 text-agri-600" />
            <span>AI Confidence: {activeAdvisory.confidencePct}%</span>
          </div>
        </div>
      </div>

      {/* 4 Risk Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
        {riskTriggers.map((risk, idx) => {
          const Icon = risk.icon;
          const isCrit = risk.severity === 'critical';
          const isCaut = risk.severity === 'caution';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isCrit
                  ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                  : isCaut
                  ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                  : 'bg-canvas-100/70 border-canvas-200 hover:bg-canvas-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCrit ? 'bg-rose-600 text-white' : isCaut ? 'bg-amber-600 text-white' : 'bg-agri-700 text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-moss-900 leading-tight">{risk.title}</h4>
                    <span className="text-[10px] font-semibold text-moss-500">{risk.value}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isCrit
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : isCaut
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {risk.severity}
                </span>
              </div>

              <p className="text-[11px] text-moss-600 mt-2 leading-relaxed">
                {risk.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scientific Synthesis Bulletpoints */}
      <div className="mt-4 p-4 rounded-2xl bg-moss-900 text-canvas-100 border border-agri-700/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-agri-300 mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Reasoning Chain</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-canvas-200/90 font-mono text-[11px]">
          {activeAdvisory.scientificReasoning.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-agri-400 font-bold">[{i+1}]</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
