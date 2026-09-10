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
  AlertTriangle
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const ClimateHeroCard: React.FC = () => {
  const { weatherData, soilDepths, selectedFarmer, setActiveTab } = useAdvisory();

  // Climate Risk Level Configuration
  const riskStatus: 'SAFE' | 'WATCH' | 'HIGH RISK' = 'WATCH';

  const riskBadgeConfig = {
    'SAFE': {
      bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'SAFE CONDITIONS',
      desc: 'Optimal growth window; normal farming activity recommended.',
    },
    'WATCH': {
      bg: 'bg-amber-500/15 text-amber-800 border-amber-500/40',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'CLIMATE WATCH',
      desc: 'High convective rain & saturation alert in next 14-36h. Action required.',
    },
    'HIGH RISK': {
      bg: 'bg-rose-500/15 text-rose-800 border-rose-500/40',
      dot: 'bg-rose-500',
      icon: ShieldAlert,
      label: 'HIGH CLIMATE RISK',
      desc: 'Severe pest infestation window or thermal shock detected.',
    }
  }[riskStatus];

  const RiskIcon = riskBadgeConfig.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-moss-900 via-moss-800 to-agri-900 text-white p-6 sm:p-8 shadow-soft-lg border border-agri-600/30 mb-6">
      
      {/* Subtle background ambient mesh glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-agri-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-earth-500/15 blur-2xl pointer-events-none" />

      {/* Header section: Title + Location + Risk Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-moss-700/60 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-agri-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-agri-400 animate-ping" />
            <span>Hyperlocal Micro-Climate Situation</span>
            <span>•</span>
            <span className="font-mono text-agri-200">{selectedFarmer.location.village}, {selectedFarmer.location.district}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Today's Agro-Weather & Soil Assessment
          </h2>
          <p className="text-xs sm:text-sm text-canvas-300/80 mt-1 max-w-2xl">
            Live satellite radar feed with high-resolution root-zone physics for {selectedFarmer.activeCropId || 'Crop'} cultivation.
          </p>
        </div>

        {/* Climate Risk Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className={`px-4 py-2.5 rounded-2xl border backdrop-blur-md flex items-center gap-2.5 shadow-sm ${riskBadgeConfig.bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${riskBadgeConfig.dot} animate-pulse`} />
            <RiskIcon className="w-4 h-4" />
            <div className="text-left">
              <span className="text-xs font-extrabold tracking-wider block leading-none">
                {riskBadgeConfig.label}
              </span>
              <span className="text-[10px] opacity-85 font-medium mt-0.5 block">
                38mm Thunderstorm Approaching
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Climate Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 my-6 relative z-10">
        
        {/* Temperature */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between text-agri-300 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Air Temp</span>
            <Thermometer className="w-4 h-4 text-earth-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {weatherData.currentTempC}°C
          </div>
          <div className="text-[11px] text-canvas-300 mt-1">
            Feels like <strong className="text-white">{weatherData.feelsLikeC}°C</strong>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between text-skyalt-300 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Rain Chance</span>
            <CloudRain className="w-4 h-4 text-skyalt-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {weatherData.rainProbabilityPct}%
          </div>
          <div className="text-[11px] text-skyalt-200 mt-1 font-medium">
            ~{weatherData.rainExpectedMm} mm in 14h
          </div>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between text-agri-300 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Humidity</span>
            <Droplets className="w-4 h-4 text-agri-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {weatherData.humidityPct}%
          </div>
          <div className="text-[11px] text-canvas-300 mt-1">
            Dew point: {weatherData.dewPointC}°C
          </div>
        </div>

        {/* Wind */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between text-canvas-300 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Wind Vector</span>
            <Wind className="w-4 h-4 text-canvas-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {weatherData.windSpeedKmh} <span className="text-xs font-normal">km/h</span>
          </div>
          <div className="text-[11px] text-canvas-300 mt-1 truncate">
            {weatherData.windDirection}
          </div>
        </div>

        {/* Soil Moisture (Root Zone) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-agri-700/60 to-agri-800/80 backdrop-blur-md border border-agri-400/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-agri-200 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Soil Moisture</span>
            <span className="text-[10px] bg-agri-500/30 px-1.5 py-0.5 rounded text-agri-100 font-mono">10-40cm</span>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {soilDepths[1]?.percentage || 74}%
          </div>
          <div className="text-[11px] text-agri-200 mt-1 font-semibold">
            Status: {soilDepths[1]?.status || 'Saturated'}
          </div>
        </div>
      </div>

      {/* Soil Depth Mini Visualizer + CTA Footer */}
      <div className="pt-5 border-t border-moss-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Soil Depth Bars Preview */}
        <div className="w-full md:w-auto flex-1 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-agri-300 mb-2">
            Multi-Depth Soil Saturation Profile ({selectedFarmer.location.village} Soil)
          </p>
          <div className="space-y-1.5">
            {soilDepths.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-32 text-[11px] text-canvas-300 truncate">{d.depthRange}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      d.percentage > 70 ? 'bg-amber-400' : 'bg-agri-400'
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
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
          >
            Full Weather Hub
          </button>

          <button
            onClick={() => setActiveTab('advisory-wizard')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-agri-400 hover:bg-agri-300 text-moss-900 font-bold text-xs sm:text-sm shadow-glow-agri transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-moss-900" />
            <span>Generate Farmer Advisory</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
