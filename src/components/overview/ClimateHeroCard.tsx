import React from 'react';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Compass,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const ClimateHeroCard: React.FC = () => {
  const { weatherData, soilDepths, selectedFarmer, setActiveTab } = useAdvisory();

  // Climate Risk Level Configuration
  const riskStatus: 'SAFE' | 'WATCH' | 'HIGH RISK' = 'WATCH';

  const riskBadgeConfig = {
    'SAFE': {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      dot: 'bg-emerald-400',
      icon: CheckCircle2,
      label: 'SAFE CONDITIONS',
      desc: 'Optimal growth window; normal farming activity recommended.',
    },
    'WATCH': {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: 'CLIMATE WATCH',
      desc: 'High convective rain & saturation alert in next 14-36h. Action required.',
    },
    'HIGH RISK': {
      bg: 'bg-rose-500/25 text-rose-300 border-rose-400/40',
      dot: 'bg-rose-400',
      icon: ShieldAlert,
      label: 'HIGH CLIMATE RISK',
      desc: 'Severe pest infestation window or thermal shock detected.',
    }
  }[riskStatus];

  const RiskIcon = riskBadgeConfig.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1A12] via-[#0F261A] to-[#0A1A12] text-white p-6 sm:p-8 shadow-soft-lg border border-agri-600/40 mb-6">
      
      {/* Subtle top border highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-agri-400/30 to-transparent" />

      {/* Header section: Title + Location + Risk Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-agri-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-agri-400 animate-ping" />
            <span className="font-bold">Hyperlocal Micro-Climate Situation</span>
            <span>•</span>
            <span className="font-mono text-agri-200 bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-agri-300" />
              {selectedFarmer.location.village}, {selectedFarmer.location.district}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Today's Agro-Weather & Root Soil Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Live atmospheric radar stream and root-zone sensor telemetry for active <strong className="text-white">{selectedFarmer.activeCropId || 'Crop'}</strong> cultivation.
          </p>
        </div>

        {/* Climate Risk Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className={`px-4 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 shadow-soft-sm ${riskBadgeConfig.bg}`}>
            <span className={`w-3 h-3 rounded-full ${riskBadgeConfig.dot} animate-pulse shrink-0`} />
            <RiskIcon className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-black tracking-wider block leading-none">
                {riskBadgeConfig.label}
              </span>
              <span className="text-[11px] opacity-90 font-medium mt-1 block">
                38mm Thunderstorm Approaching
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Climate Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 my-6 relative z-10">
        
        {/* Temperature */}
        <div className="p-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 transition-all group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Air Temp</span>
            <Thermometer className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {weatherData.currentTempC}°C
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between">
            <span>Feels like</span>
            <strong className="text-amber-200 font-mono font-bold">{weatherData.feelsLikeC}°C</strong>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="p-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 transition-all group">
          <div className="flex items-center justify-between text-sky-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Rain Chance</span>
            <CloudRain className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {weatherData.rainProbabilityPct}%
          </div>
          <div className="text-[11px] text-sky-200 mt-1 font-medium flex items-center justify-between">
            <span>Forecast:</span>
            <strong className="text-sky-300 font-mono">~{weatherData.rainExpectedMm} mm in 14h</strong>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 transition-all group">
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Humidity</span>
            <Droplets className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {weatherData.humidityPct}%
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between">
            <span>Dew point:</span>
            <strong className="text-emerald-200 font-mono font-bold">{weatherData.dewPointC}°C</strong>
          </div>
        </div>

        {/* Wind */}
        <div className="p-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 transition-all group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Wind Vector</span>
            <Wind className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {weatherData.windSpeedKmh} <span className="text-xs font-normal text-slate-300 font-sans">km/h</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 truncate">
            {weatherData.windDirection}
          </div>
        </div>

        {/* Soil Moisture (Root Zone) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-agri-700/70 to-agri-900/90 backdrop-blur-md border border-agri-400/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-agri-200 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Soil Telemetry</span>
            <span className="text-[10px] bg-agri-500/40 px-2 py-0.5 rounded-full text-agri-100 font-mono font-bold">In-Situ</span>
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Sensor Offline
          </div>
          <div className="text-[11px] text-agri-200 mt-1 font-medium">
            Weight Reallocated to NWP
          </div>
        </div>
      </div>

      {/* Soil Depth Mini Visualizer + CTA Footer */}
      <div className="pt-5 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        
        {/* Soil Depth Bars Preview */}
        <div className="w-full md:w-auto flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-agri-300">
              Multi-Depth Root-Zone Moisture ({selectedFarmer.location.village} Soil)
            </p>
            <span className="text-[10px] font-mono text-slate-400">0 - 100 cm</span>
          </div>
          <div className="space-y-2">
            {soilDepths.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-28 text-[11px] text-slate-300 truncate font-medium">{d.depthRange}</span>
                <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      d.percentage > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-[11px] font-bold text-white">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Advisory Primary CTA */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveTab('climate-hub')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all active:scale-95"
          >
            Full Climate Hub
          </button>

          <button
            onClick={() => setActiveTab('advisory-wizard')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-agri-400 to-emerald-400 hover:from-agri-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-glow-agri transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Farmer Advisory</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
