import React from 'react';
import { 
  MapPin, 
  Satellite, 
  Compass, 
  CloudRain, 
  Sun, 
  Waves,
  Layers
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const StylizedFarmMap: React.FC = () => {
  const { selectedLocation, selectedCrop, farmerName } = useAdvisory();

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-agri-100 text-agri-800">
            <Satellite className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            Farm Plot & Micro-Terrain Map
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-moss-500 font-mono">
          <span>Weather Grid: Open-Meteo NWP (~1.1km) • Plot: GPS Coordinates</span>
        </div>
      </div>

      {/* Stylized Vector Map Canvas */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b3d2b] via-[#24523b] to-[#142e20] border border-agri-700/40 select-none">
        
        {/* Agricultural plot grids & road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <pattern id="farm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#74C69D" strokeWidth="0.75" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#farm-grid)" />
          
          {/* Stylized contour canal line */}
          <path d="M 0,100 Q 150,180 300,120 T 600,200" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="6,4" />
          
          {/* Plot boundaries */}
          <rect x="120" y="40" width="160" height="120" fill="#52B788" fillOpacity="0.15" stroke="#74C69D" strokeWidth="1.5" />
          <rect x="300" y="70" width="140" height="110" fill="#DDA15E" fillOpacity="0.12" stroke="#DDA15E" strokeWidth="1.5" />
        </svg>

        {/* Animated radar wave sweep */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-agri-400/25 animate-ping pointer-events-none" />

        {/* Center Farm Marker & Overlay Box */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 pointer-events-none">
          
          {/* Top telemetry badges */}
          <div className="flex items-center justify-between">
            <div className="bg-moss-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-500/30 text-[11px] text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{selectedLocation.city} Agricultural Sector</span>
            </div>

            <div className="bg-moss-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-500/30 text-[11px] text-canvas-200 flex items-center gap-1.5 font-mono">
              <Compass className="w-3.5 h-3.5 text-agri-300" />
              <span>Elev: 560m</span>
            </div>
          </div>

          {/* Central Farm Pin */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-agri-400/40 animate-ping" />
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-agri-400 to-agri-600 text-moss-950 flex items-center justify-center shadow-glow-agri border-2 border-white text-lg font-bold">
                📍
              </div>
            </div>

            {/* Farm Tag */}
            <div className="mt-2 bg-white text-agri-950 px-3 py-1.5 rounded-xl shadow-md border border-agri-300 text-center">
              <p className="text-xs font-black leading-tight">{farmerName}'s Farm Plot</p>
              <p className="text-[10px] text-agri-700 font-semibold">{selectedCrop} • 3.5 Acres</p>
            </div>
          </div>

          {/* Bottom weather condition mini pill */}
          <div className="flex items-center justify-between">
            <div className="bg-moss-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-500/30 text-[10px] text-agri-200 flex items-center gap-2">
              <CloudRain className="w-3.5 h-3.5 text-skyalt-300" />
              <span>Rain Probability: <strong>{selectedLocation.rainProbPct}%</strong> ({selectedLocation.tempC}°C)</span>
            </div>

            <span className="text-[10px] font-mono text-moss-400 bg-moss-950/80 px-2 py-1 rounded-lg border border-moss-800">
              Micro-Zone Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
