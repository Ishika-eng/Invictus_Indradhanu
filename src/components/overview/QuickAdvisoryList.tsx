import React from 'react';
import { 
  Radio, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { HISTORICAL_ADVISORIES } from '../../data/mockData';

export const QuickAdvisoryList: React.FC = () => {
  const { setActiveTab } = useAdvisory();

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-skyalt-100 text-skyalt-800">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
              Live Regional Advisory Broadcasts
            </h3>
          </div>
          <p className="text-xs text-moss-500 mt-0.5">
            Automated hyper-targeted dispatches delivered to smallholders via Voice IVR & SMS
          </p>
        </div>

        <button
          onClick={() => setActiveTab('history')}
          className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1 hover:underline"
        >
          <span>View All Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {HISTORICAL_ADVISORIES.map((adv) => {
          const isHighRisk = adv.riskLevel === 'HIGH RISK';
          const isWatch = adv.riskLevel === 'WATCH';

          return (
            <div
              key={adv.id}
              className="p-4 rounded-2xl bg-canvas-100/70 hover:bg-canvas-200/80 border border-canvas-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-canvas-300 flex items-center justify-center text-base shadow-sm shrink-0 mt-0.5">
                  {adv.crop === 'Tomato' ? '🍅' : adv.crop === 'Cotton' ? '☁️' : adv.crop === 'Wheat' ? '🌾' : '🌽'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-moss-900">{adv.farmerName}</span>
                    <span className="text-[11px] text-moss-500">({adv.village})</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isHighRisk 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : isWatch 
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {adv.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-agri-800 mt-1">
                    {adv.adviceType}
                  </p>
                  <p className="text-[11px] text-moss-600 mt-0.5 font-medium line-clamp-1">
                    {adv.outcome}
                  </p>
                </div>
              </div>

              {/* Delivery Channel Badge & Status */}
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-canvas-300 text-xs font-medium text-moss-700 shadow-soft-sm">
                  {adv.channelDelivered.includes('Voice') ? (
                    <PhoneCall className="w-3.5 h-3.5 text-agri-600" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-skyalt-600" />
                  )}
                  <span className="text-[11px] font-semibold">{adv.channelDelivered}</span>
                </div>
                
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Acted Upon</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
