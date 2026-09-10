import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Globe2, 
  Navigation, 
  Search, 
  Thermometer, 
  CloudRain, 
  Droplets, 
  Check, 
  ArrowRight,
  Compass,
  Sparkles
} from 'lucide-react';
import { useAdvisory, PRESET_LOCATIONS, LocationOption } from '../../context/AdvisoryContext';
import { Language } from '../../types/advisory';

export const Step1FarmerProfile: React.FC = () => {
  const { 
    farmerName, 
    setFarmerName, 
    farmerPhone, 
    setFarmerPhone, 
    selectedLocation, 
    setSelectedLocation, 
    selectedLanguage, 
    setSelectedLanguage,
    setDemoStep 
  } = useAdvisory();

  const [locationSearch, setLocationSearch] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  const filteredLocations = PRESET_LOCATIONS.filter(l => 
    l.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
    l.state.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleUseCurrentLocation = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setSelectedLocation(PRESET_LOCATIONS[0]); // Pune, Maharashtra
      setIsDetectingLocation(false);
    }, 600);
  };

  const handleProceed = () => {
    setDemoStep(2);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
            Step 1 of 6
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Farmer Profile & Location
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Identify the smallholder farmer and connect their field coordinates with live weather feeds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Farmer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1.5">
                Farmer Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1.5">
                Mobile / Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  placeholder="e.g. +91 98234 11209"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Location Search & GPS Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700">
                Farm Location
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1.5 hover:underline"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-agri-600' : 'text-agri-600'}`} />
                <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use Current Location'}</span>
              </button>
            </div>

            <div className="relative mb-2">
              <Search className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search village, district, or region..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-semibold text-moss-900 focus:outline-none focus:border-agri-600"
              />
            </div>

            {/* Quick Location Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation.city === loc.city;
                return (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                        : 'bg-canvas-100 text-moss-700 border-canvas-300 hover:bg-canvas-200'
                    }`}
                  >
                    📍 {loc.city}, {loc.state}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Delivery Dialect */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-2">
              Preferred Language for Voice & SMS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                        : 'bg-canvas-100/70 text-moss-800 border-canvas-300 hover:bg-canvas-200'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{lang.native}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-agri-200' : 'text-moss-500'}`}>
                      {lang.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Location & Live Conditions Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* Map-Style Visual Preview Card */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-moss-900 to-agri-950 text-white p-4 border border-agri-600/30 shadow-soft">
            
            {/* Topographic grid */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(167, 243, 208, 0.4) 1px, transparent 0)`,
                backgroundSize: '16px 16px'
              }}
            />

            <div className="relative z-10 flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase bg-agri-600/60 text-agri-200 px-2 py-0.5 rounded border border-agri-400/30">
                Satellite Grid Node
              </span>
              <span className="text-[10px] text-canvas-300 font-mono">
                18.52° N, 73.85° E
              </span>
            </div>

            {/* Selected Location Details */}
            <div className="relative z-10 my-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-agri-500 text-moss-950 flex items-center justify-center font-bold shadow-glow-agri">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base sm:text-lg text-white leading-tight">
                    {selectedLocation.city}, {selectedLocation.state}
                  </h4>
                  <p className="text-[11px] text-agri-200">
                    {selectedLocation.country} • Micro-Zone Sector
                  </p>
                </div>
              </div>
            </div>

            {/* Current Conditions Mini Visual Callout */}
            <div className="relative z-10 mt-4 pt-3 border-t border-moss-700/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-agri-300 block mb-2">
                Current Local Conditions (Live)
              </span>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Thermometer className="w-3.5 h-3.5 text-earth-300 mx-auto mb-0.5" />
                  <p className="font-display font-extrabold text-sm text-white">{selectedLocation.tempC}°C</p>
                  <p className="text-[9px] text-canvas-300">Temp</p>
                </div>

                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Droplets className="w-3.5 h-3.5 text-skyalt-300 mx-auto mb-0.5" />
                  <p className="font-display font-extrabold text-sm text-white">{selectedLocation.humidityPct}%</p>
                  <p className="text-[9px] text-canvas-300">Humidity</p>
                </div>

                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <CloudRain className="w-3.5 h-3.5 text-skyalt-400 mx-auto mb-0.5" />
                  <p className="font-display font-extrabold text-sm text-white">{selectedLocation.rainProbPct}%</p>
                  <p className="text-[9px] text-canvas-300">Chance of Rain</p>
                </div>
              </div>
            </div>
          </div>

          {/* Soil Status Callout */}
          <div className="p-3 rounded-xl bg-agri-50 border border-agri-200 text-xs text-agri-950 flex items-center justify-between">
            <span className="font-semibold">Soil Moisture:</span>
            <span className="font-bold font-mono text-agri-800 bg-agri-100 px-2 py-0.5 rounded">
              {selectedLocation.soilStatus} ({selectedLocation.soilMoisturePct}%)
            </span>
          </div>
        </div>
      </div>

      {/* CTA Next Step */}
      <div className="flex justify-end pt-4 border-t border-canvas-200">
        <button
          type="button"
          onClick={handleProceed}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
        >
          <span>Continue to Step 2 — Crop Selection</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
