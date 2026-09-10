import React, { useEffect, useState } from 'react';
import { 
  Waves, 
  Droplet, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Thermometer
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const SoilHealthMoistureGauge: React.FC = () => {
  const { selectedLocation, selectedCrop } = useAdvisory();
  const [animatedPct, setAnimatedPct] = useState(0);

  const moisture = selectedLocation.soilMoisturePct;
  const classification = moisture < 45 ? 'LOW' : moisture <= 75 ? 'OPTIMAL' : 'HIGH';

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPct(moisture);
    }, 150);
    return () => clearTimeout(timer);
  }, [moisture]);

  // SVG Gauge calculations (circumference for radius = 64)
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-earth-100 text-earth-800">
            <Waves className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            Soil Health & Root Hydration
          </h3>
        </div>

        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
          classification === 'OPTIMAL'
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
            : classification === 'HIGH'
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-rose-100 text-rose-900 border-rose-300'
        }`}>
          {classification}
        </span>
      </div>

      {/* Circular Gauge Visualization */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#E7EBE0"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={classification === 'OPTIMAL' ? '#52B788' : '#DDA15E'}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display font-black text-3xl text-moss-900 leading-none">
              {animatedPct}%
            </span>
            <span className="text-[10px] font-bold text-moss-500 uppercase tracking-wider mt-0.5">
              Moisture
            </span>
          </div>
        </div>

        {/* Gauge Depth Breakdown */}
        <div className="space-y-2.5 flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-moss-600 font-medium">0-10cm Topsoil:</span>
            <span className="font-bold text-moss-900 font-mono">{moisture - 6}% (Adequate)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-moss-600 font-medium">10-40cm Active Root Zone:</span>
            <span className="font-bold text-agri-900 font-mono">{moisture}% ({classification})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-moss-600 font-medium">Soil Temperature:</span>
            <span className="font-bold text-moss-900 font-mono">{selectedLocation.soilTempC}°C (Optimal)</span>
          </div>
        </div>
      </div>

      {/* Clear Agronomic Explanation */}
      <div className="p-3.5 rounded-2xl bg-agri-50 border border-agri-200 flex items-start gap-2.5 text-xs text-agri-950">
        <CheckCircle2 className="w-4 h-4 text-agri-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Soil moisture is currently adequate</strong> for the selected {selectedCrop} crop. Root-zone pore spaces hold sufficient water reservoir. Additional pumping would saturate air pockets.
        </p>
      </div>
    </div>
  );
};
