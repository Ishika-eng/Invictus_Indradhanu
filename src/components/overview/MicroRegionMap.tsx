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
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-agri-100 text-agri-800">
              <Satellite className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
              Regional Satellite & Agro-Radar Micro-Zone
            </h3>
          </div>
          <p className="text-xs text-moss-500 mt-0.5">
            Real-time Doppler precipitation & root-hydration thermal telemetry (NASA / IMD grid)
          </p>
        </div>

        {/* Map Layers Switcher */}
        <div className="flex items-center gap-1.5 bg-canvas-100 p-1 rounded-xl border border-canvas-300 self-start sm:self-auto">
          {[
            { id: 'radar' as const, label: 'Rain Doppler', icon: CloudRain },
            { id: 'moisture' as const, label: 'Soil Hydration', icon: Waves },
            { id: 'temperature' as const, label: 'Thermal Index', icon: Satellite },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setMapLayer(l.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapLayer === l.id
                  ? 'bg-agri-700 text-white shadow-soft-sm'
                  : 'text-moss-600 hover:text-moss-900 hover:bg-canvas-200'
              }`}
            >
              <l.icon className="w-3 h-3" />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulated High-Res Agro Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b3b2b] via-[#244f3b] to-[#12281d] border border-agri-700/40 select-none">
        
        {/* Topographic grid pattern */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(167, 243, 208, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Doppler Radar Sweep & Cloud Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Radar sweep line */}
          <div className="absolute w-[600px] h-[600px] -top-24 -left-24 rounded-full border border-agri-400/20 animate-spin" style={{ animationDuration: '14s' }}>
            <div className="w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-agri-400/10 to-agri-400/30 rounded-tl-full" />
          </div>

          {/* Animated Rain Storm Front */}
          {mapLayer === 'radar' && (
            <div className="absolute top-10 right-14 w-64 h-48 rounded-full bg-skyalt-500/30 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          )}

          {/* Soil Moisture Heatmap */}
          {mapLayer === 'moisture' && (
            <div className="absolute inset-x-8 top-12 bottom-12 rounded-3xl bg-emerald-500/20 blur-xl" />
          )}

          {/* Thermal Layer */}
          {mapLayer === 'temperature' && (
            <div className="absolute inset-x-12 top-8 bottom-16 rounded-full bg-amber-500/25 blur-2xl" />
          )}
        </div>

        {/* Micro-Zone Location Pins for Farmers */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          
          {/* Top telemetry badges */}
          <div className="flex items-center justify-between z-10">
            <div className="bg-moss-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-500/30 text-[11px] text-canvas-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-agri-300">Coverage: 1km² Micro-Grid</span>
              <span className="text-moss-400">|</span>
              <span className="font-mono">Lat: {selectedFarmer.location.coordinates[0]}° N</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-moss-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-500/30 text-[11px] text-canvas-100">
              <Compass className="w-3.5 h-3.5 text-earth-300" />
              <span>Elevation: <strong>{selectedFarmer.location.elevationMeters}m</strong></span>
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
                    isSelected ? 'scale-110 z-20' : 'opacity-75 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {/* Glowing halo */}
                  {isSelected && (
                    <div className="absolute -inset-3 rounded-full bg-agri-400/40 animate-ping" />
                  )}

                  {/* Marker Pin */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border text-sm transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-agri-400 to-agri-600 text-white border-white ring-4 ring-agri-400/30 shadow-glow-agri'
                      : 'bg-moss-800 text-canvas-200 border-moss-600 hover:border-agri-400'
                  }`}>
                    {f.avatar || '📍'}
                  </div>

                  {/* Marker Label Tag */}
                  <div className={`mt-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-bold border transition-all shadow-md ${
                    isSelected 
                      ? 'bg-white text-agri-950 border-agri-300 ring-2 ring-agri-500/20' 
                      : 'bg-moss-900/90 text-canvas-200 border-moss-700'
                  }`}>
                    <p className="leading-tight">{f.location.village}</p>
                    <p className="text-[9px] font-normal text-moss-500">{f.activeCropId || 'Crop'}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom legend and active zone telemetry */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-10">
            <div className="bg-moss-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-600/30 text-[11px] text-canvas-200">
              <span className="text-agri-300 font-semibold">Active Sector: </span>
              <span>{selectedFarmer.location.microZoneName}</span>
            </div>

            {/* Radar scale legend */}
            <div className="flex items-center gap-2 bg-moss-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agri-600/30 text-[10px] text-canvas-300">
              <span className="font-semibold text-white">Intensity:</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Low Rain" />
                <span>Light</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title="Moderate" />
                <span>Mod</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" title="Convective Storm" />
                <span className="text-rose-300 font-bold">Storm (38mm)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
