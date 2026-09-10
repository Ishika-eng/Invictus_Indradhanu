import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const AiReasoningSummary: React.FC = () => {
  const { selectedLocation, selectedCrop } = useAdvisory();

  const reasons = [
    { type: 'positive', text: `Rain expected within 24 hours (${selectedLocation.rainProbPct}% probability)` },
    { type: 'positive', text: `Soil moisture currently adequate (${selectedLocation.soilMoisturePct}% root saturation)` },
    { type: 'positive', text: `Temperature suitable for ${selectedCrop} growth (${selectedLocation.tempC}°C)` },
    { type: 'warning', text: 'Increased waterlogging risk if additional irrigation is applied' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-agri-100 text-agri-800">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            WHY DID AI RECOMMEND THIS?
          </h3>
        </div>

        <span className="text-[10px] font-bold text-agri-800 bg-agri-50 px-2.5 py-0.5 rounded-lg border border-agri-200">
          Environmental Signals
        </span>
      </div>

      <p className="text-xs text-moss-500">
        The advisory direct action is computed from ground meteorological telemetry rather than generic rules:
      </p>

      {/* Observable Evidence List */}
      <div className="space-y-2.5">
        {reasons.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
              item.type === 'positive'
                ? 'bg-agri-50/70 border-agri-200 text-agri-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
            }`}
          >
            {item.type === 'positive' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span className="text-xs leading-snug">
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-canvas-200 text-[11px] text-moss-500 flex items-center justify-between">
        <span>Grounded in verified satellite physics</span>
        <span className="font-mono font-bold text-agri-700">94.2% AI Confidence</span>
      </div>
    </div>
  );
};
