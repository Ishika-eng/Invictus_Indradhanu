import React, { useState } from 'react';
import { 
  MapPin, 
  Radio, 
  Layers, 
  Satellite, 
  CloudRain, 
  Maximize2, 
  Compass,
  Waves,
  Eye
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const MicroRegionMap: React.FC = () => {
  const { selectedFarmer, setSelectedFarmer, allFarmers } = useAdvisory();
  const [mapLayer, setMapLayer] = useState<'radar' | 'moisture' | 'temperature'>('radar');

  return (
    <div className="card-modern p-6 bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Satellite className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Satellite Radar & Micro-Zone Spatial Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Doppler precipitation & root-hydration thermal telemetry (NASA / Open-Meteo grid)
          </p>
        </div>

        {/* Map Layers Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          {[
            { id: 'radar' as const, label: 'Rain Doppler', icon: CloudRain },
            { id: 'moisture' as const, label: 'Soil Hydration', icon: Waves },
            { id: 'temperature' as const, label: 'Thermal Index', icon: Satellite },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setMapLayer(l.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapLayer === l.id
                  ? 'bg-agri-700 text-white shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <l.icon className="w-3.5 h-3.5" />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulated High-Res Agro Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c2217] via-[#163827] to-[#081810] border border-agri-600/30 select-none shadow-inner">
        
        {/* Topographic grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(167, 243, 208, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Doppler Radar Sweep & Cloud Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Radar sweep line */}
          <div className="absolute w-[600px] h-[600px] -top-24 -left-24 rounded-full border border-emerald-400/20 animate-spin" style={{ animationDuration: '14s' }}>
            <div className="w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-emerald-400/10 to-emerald-400/25 rounded-tl-full" />
          </div>

          {/* Animated Rain Storm Front */}
          {mapLayer === 'radar' && (
            <div className="absolute top-10 right-14 w-64 h-48 rounded-full bg-sky-500/25 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          )}

          {/* Soil Moisture Heatmap */}
          {mapLayer === 'moisture' && (
            <div className="absolute inset-x-8 top-12 bottom-12 rounded-3xl bg-emerald-500/25 blur-xl" />
          )}

          {/* Thermal Layer */}
          {mapLayer === 'temperature' && (
            <div className="absolute inset-x-12 top-8 bottom-16 rounded-full bg-amber-500/25 blur-2xl" />
          )}
        </div>

        {/* Micro-Zone Location Pins for Farmers */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          
          {/* Top telemetry badges */}
          <div className="flex items-center justify-between z-10">
            <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-[11px] text-white flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-300">Coverage: 1km² Micro-Grid</span>
              <span className="text-slate-500">|</span>
              <span className="font-mono text-slate-300">Lat: {selectedFarmer.location.coordinates[0]}° N</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-[11px] text-white shadow-sm">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Elevation: <strong className="font-mono">{selectedFarmer.location.elevationMeters}m</strong></span>
            </div>
          </div>

          {/* Interactive Farmer Village Markers on Map */}
          <div className="relative w-full h-full my-auto flex items-center justify-around z-10">
            {allFarmers.map((f) => {
              const isSelected = f.id === selectedFarmer.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFarmer(f)}
                  className={`group relative flex flex-col items-center transition-all ${
                    isSelected ? 'scale-115 z-20' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {/* Glowing halo */}
                  {isSelected && (
                    <div className="absolute -inset-3 rounded-full bg-emerald-400/40 animate-ping" />
                  )}

                  {/* Marker Pin */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border text-base transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-400 to-agri-600 text-white border-white ring-4 ring-emerald-400/40 shadow-glow-agri'
                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-emerald-400'
                  }`}>
                    {f.avatar || '📍'}
                  </div>

                  {/* Marker Label Tag */}
                  <div className={`mt-2 px-3 py-1 rounded-xl backdrop-blur-md text-[11px] font-bold border transition-all shadow-md ${
                    isSelected 
                      ? 'bg-white text-slate-950 border-emerald-300 ring-2 ring-emerald-500/20' 
                      : 'bg-slate-900/90 text-slate-200 border-slate-800'
                  }`}>
                    <p className="leading-tight">{f.location.village}</p>
                    <p className="text-[9px] font-medium text-slate-400">{f.activeCropId || 'Crop'}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom legend and active zone telemetry */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-10">
            <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-[11px] text-slate-200">
              <span className="text-emerald-300 font-bold">Active Sector: </span>
              <span className="font-medium">{selectedFarmer.location.microZoneName}</span>
            </div>

            {/* Radar scale legend */}
            <div className="flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-[10px] text-slate-300">
              <span className="font-bold text-white">Intensity:</span>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Light</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Mod</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-rose-300 font-bold">Storm (38mm)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
