import React from 'react';
import { 
  Waves, 
  Layers, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Droplet
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const SoilMoistureChart: React.FC = () => {
  const { soilDepths, selectedSoilType, selectedFarmer } = useAdvisory();

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-earth-100 text-earth-800">
              <Waves className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
              Root-Zone Soil Hydration Profile
            </h3>
          </div>
          <p className="text-xs text-moss-500 mt-0.5">
            Physical percolation telemetry in {selectedFarmer.location.village} ({selectedSoilType})
          </p>
        </div>

        <span className="text-[11px] font-mono text-agri-800 bg-agri-50 px-2.5 py-1 rounded-xl border border-agri-200 self-start sm:self-auto">
          Sensor Depth Model v3.1
        </span>
      </div>

      {/* Moisture Depths Bar Visualizer */}
      <div className="space-y-4 my-4">
        {soilDepths.map((depth, idx) => {
          const isSaturated = depth.percentage >= 70;
          const isDeficit = depth.percentage < 40;

          return (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-canvas-100/70 border border-canvas-200 hover:bg-canvas-100 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white border border-canvas-300 flex items-center justify-center text-xs font-bold text-moss-700">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-moss-900">{depth.depthRange}</h4>
                    <p className="text-[10px] text-moss-500">Ideal vegetative range: {depth.idealRange[0]}% - {depth.idealRange[1]}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isSaturated
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : isDeficit
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {depth.status}
                  </span>
                  <span className="font-mono font-extrabold text-sm sm:text-base text-moss-900">
                    {depth.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with Ideal Zone Notch */}
              <div className="relative w-full h-3 bg-canvas-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isSaturated ? 'bg-gradient-to-r from-agri-500 to-amber-500' : 'bg-gradient-to-r from-agri-400 to-agri-600'
                  }`}
                  style={{ width: `${depth.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Agronomic Insight Callout */}
      <div className="p-3.5 rounded-2xl bg-agri-50/80 border border-agri-200 flex items-start gap-2.5 text-xs text-agri-950">
        <Info className="w-4 h-4 text-agri-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Physics Assessment:</strong> Current moisture at 10-40cm root depth is currently at <strong>74%</strong> (near anaerobic field capacity). Additional 38mm rainfall will saturate root pores, making mechanical irrigation unnecessary and harmful for the next 3 days.
        </p>
      </div>
    </div>
  );
};
