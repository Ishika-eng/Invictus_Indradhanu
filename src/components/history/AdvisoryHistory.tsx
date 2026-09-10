import React from 'react';
import { 
  History, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { HISTORICAL_ADVISORIES } from '../../data/mockData';

export const AdvisoryHistory: React.FC = () => {
  const { metrics, setActiveTab } = useAdvisory();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & High-Level Impact Summary */}
      <div className="rounded-3xl bg-gradient-to-br from-moss-900 via-agri-900 to-moss-950 text-white border border-agri-600/30 shadow-soft-lg p-6 sm:p-8">
        <div className="flex items-center gap-2 text-agri-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <History className="w-4 h-4" />
          <span>Historical Advisory Audit Trail</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          Advisory Impact & Ground Truth Verification
        </h2>
        <p className="text-xs sm:text-sm text-canvas-300/80 mt-1 max-w-2xl">
          Every generated climate advisory is evaluated post-event against actual rainfall precipitation, ground soil sensors, and farmer harvest outcomes.
        </p>

        {/* Impact Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-moss-800">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-bold text-agri-300 uppercase block">Total Water Conserved</span>
            <p className="text-xl font-display font-extrabold text-white mt-0.5">
              {(metrics.waterSavedLiters / 1000000).toFixed(1)} Million Liters
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-bold text-skyalt-300 uppercase block">Forecast Ground Accuracy</span>
            <p className="text-xl font-display font-extrabold text-white mt-0.5">
              93.8% Verified
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-earth-300 uppercase block">Pesticide Spray Saved</span>
            <p className="text-xl font-display font-extrabold text-white mt-0.5">
              {metrics.pesticideSavedPct}% Less Chemical
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Feed List */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
        <h3 className="font-display font-extrabold text-base text-moss-900 mb-4">
          Detailed Dispatch & Outcome Logs
        </h3>

        <div className="space-y-3.5">
          {HISTORICAL_ADVISORIES.map((log) => {
            const isHighRisk = log.riskLevel === 'HIGH RISK';
            const isWatch = log.riskLevel === 'WATCH';

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-2xl bg-canvas-100/70 border border-canvas-300 hover:border-agri-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {log.crop === 'Tomato' ? '🍅' : log.crop === 'Cotton' ? '☁️' : log.crop === 'Wheat' ? '🌾' : '🌽'}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-sm text-moss-900">
                        {log.farmerName} • <span className="font-normal text-moss-500">{log.village}</span>
                      </h4>
                      <p className="text-[11px] text-moss-500 font-mono">
                        {log.date} • {log.crop} Crop
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isHighRisk 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : isWatch 
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {log.riskLevel}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-canvas-300 text-xs font-medium text-moss-700">
                      {log.channelDelivered.includes('Voice') ? (
                        <PhoneCall className="w-3 h-3 text-agri-600" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-skyalt-600" />
                      )}
                      <span className="text-[10px] font-bold">{log.channelDelivered}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-canvas-200 text-xs">
                  <p className="font-bold text-agri-900 mb-0.5">
                    Action Advised: {log.adviceType}
                  </p>
                  <p className="text-moss-600 leading-relaxed font-medium">
                    Ground Truth Outcome: {log.outcome}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
