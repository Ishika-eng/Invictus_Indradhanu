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
  Sparkles,
  MapPin,
  TrendingDown
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { HISTORICAL_ADVISORIES } from '../../data/mockData';

export const QuickAdvisoryList: React.FC = () => {
  const { setActiveTab } = useAdvisory();

  return (
    <div className="card-modern p-6 bg-white space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Live Regional Advisory Broadcasts
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated hyper-targeted dispatches delivered to smallholders via Voice IVR & SMS
          </p>
        </div>

        <button
          onClick={() => setActiveTab('history')}
          className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agri-50 hover:bg-agri-100 border border-agri-200/80 transition-all shrink-0"
        >
          <span>Audit Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advisory Cards List */}
      <div className="space-y-3">
        {HISTORICAL_ADVISORIES.map((adv) => {
          const isHighRisk = adv.riskLevel === 'HIGH RISK';
          const isWatch = adv.riskLevel === 'WATCH';

          return (
            <div
              key={adv.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                isHighRisk 
                  ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300 hover:shadow-soft-sm' 
                  : isWatch 
                  ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300 hover:shadow-soft-sm'
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-emerald-300 hover:shadow-soft-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Crop Emoji Avatar */}
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-xs shrink-0 mt-0.5">
                  {adv.crop === 'Tomato' ? '🍅' : adv.crop === 'Cotton' ? '☁️' : adv.crop === 'Wheat' ? '🌾' : adv.crop === 'Sugarcane' ? '🎋' : '🌽'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900">{adv.farmerName}</span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {adv.village}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isHighRisk 
                        ? 'bg-rose-100 text-rose-800 border-rose-300' 
                        : isWatch 
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {adv.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-agri-900">
                    {adv.adviceType}
                  </p>

                  <p className="text-[11px] text-slate-600 font-medium line-clamp-1 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{adv.outcome}</span>
                  </p>
                </div>
              </div>

              {/* Delivery Channel Badge & Status */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                  {adv.channelDelivered.includes('Voice') ? (
                    <PhoneCall className="w-3.5 h-3.5 text-agri-600" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  )}
                  <span className="text-[11px]">{adv.channelDelivered}</span>
                </div>
                
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Delivered & Acted</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
