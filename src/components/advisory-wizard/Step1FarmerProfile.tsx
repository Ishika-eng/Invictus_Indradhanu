import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Navigation, 
  Search, 
  Thermometer, 
  CloudRain, 
  Droplets, 
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
  CheckCircle2,
  Lock,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useAdvisory, PRESET_LOCATIONS, LocationOption } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
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
    setDemoStep,
    setAcreage,
    acreage,
    setSelectedSoilType,
    selectedSoilType,
    setSelectedIrrigation,
    selectedIrrigation
  } = useAdvisory();

  const {
    user,
    farmer,
    farms,
    selectedFarm,
    setSelectedFarm,
    isRegistered,
    setAuthModalOpen,
    detectBrowserGps,
    registerNewFarmer,
    refreshProfile,
  } = useAuth();

  const [locationSearch, setLocationSearch] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState<{ lat: number; lng: number } | null>(null);

  // New Farmer Registration Form state (when phone or email is authenticated but profile not completed)
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLanguage, setRegLanguage] = useState<Language>('mr');
  const [regVillage, setRegVillage] = useState('Baramati');
  const [regDistrict, setRegDistrict] = useState('Pune');
  const [regState, setRegState] = useState('Maharashtra');
  const [regFarmName, setRegFarmName] = useState('Main Plot');
  const [regAcreage, setRegAcreage] = useState(2.5);
  const [regSoilType, setRegSoilType] = useState('Black Cotton Soil');
  const [regIrrigation, setRegIrrigation] = useState('Drip Irrigation');
  const [regLat, setRegLat] = useState(18.5204);
  const [regLng, setRegLng] = useState(73.8567);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  // Sync state if farmer is logged in and registered
  useEffect(() => {
    if (user?.phone) {
      setRegPhone(user.phone);
    } else if (user?.user_metadata?.phone_number) {
      setRegPhone(user.user_metadata.phone_number);
    }
  }, [user]);

  useEffect(() => {
    if (farmer) {
      setFarmerName(farmer.full_name);
      setFarmerPhone(farmer.phone_number);
      if (['mr', 'hi', 'te', 'sw', 'en'].includes(farmer.preferred_language)) {
        setSelectedLanguage(farmer.preferred_language as Language);
      }
      if (selectedFarm) {
        setAcreage(selectedFarm.acreage);
        setGpsCaptured({ lat: selectedFarm.latitude, lng: selectedFarm.longitude });
        setSelectedLocation({
          city: farmer.village,
          state: farmer.state,
          country: farmer.country,
          tempC: 28,
          feelsLikeC: 31,
          forecastPeakC: 30.1,
          humidityPct: 72,
          rainProbPct: 68,
          windKmh: 14,
          soilMoisturePct: 74,
          soilTempC: 24,
          soilStatus: 'Elevated',
        });
      }
    }
  }, [farmer, selectedFarm]);

  const filteredLocations = PRESET_LOCATIONS.filter(l => 
    l.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
    l.state.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    const coords = await detectBrowserGps();
    setIsDetectingLocation(false);

    if (coords) {
      setGpsCaptured({ lat: coords.latitude, lng: coords.longitude });
      setRegLat(coords.latitude);
      setRegLng(coords.longitude);
      setSelectedLocation({
        ...selectedLocation,
        city: 'GPS Field Location',
        state: `${coords.latitude.toFixed(2)}°N, ${coords.longitude.toFixed(2)}°E`,
      });
    } else {
      // Fallback if browser permission is blocked or cancelled
      setSelectedLocation(PRESET_LOCATIONS[0]);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    setRegError(null);

    const contactPhone = regPhone.trim() || user?.phone || user?.user_metadata?.phone_number;
    if (!contactPhone) {
      setRegError('Please provide a contact phone number for climate advisory dispatches.');
      setIsSubmittingReg(false);
      return;
    }

    const formattedPhone = contactPhone.startsWith('+')
      ? contactPhone
      : `+91${contactPhone.replace(/\D/g, '')}`;

    const result = await registerNewFarmer({
      full_name: regFullName,
      phone_number: formattedPhone,
      preferred_language: regLanguage,
      village: regVillage,
      district: regDistrict,
      state: regState,
      farm_name: regFarmName,
      farm_acreage: Number(regAcreage),
      soil_type: regSoilType,
      irrigation_source: regIrrigation,
      latitude: regLat,
      longitude: regLng,
    });

    setIsSubmittingReg(false);
    if (!result.success) {
      setRegError(result.error || 'Registration failed');
    } else {
      setFarmerName(regFullName);
      setFarmerPhone(formattedPhone);
      setSelectedLanguage(regLanguage);
      await refreshProfile();
    }
  };

  const handleProceed = () => {
    setDemoStep(2);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Auth Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-canvas-200 gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
            Step 1 of 6
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Farmer Profile & Farm Location
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Identify the smallholder farmer and connect their field coordinates with live weather feeds.
          </p>
        </div>

        {/* Auth Badge or Action */}
        <div className="flex items-center gap-2">
          {user && isRegistered ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-agri-50 border border-agri-200 text-xs font-bold text-agri-800 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
              <span>Verified: {farmer?.full_name || farmer?.phone_number || farmer?.email}</span>
            </div>
          ) : user && !isRegistered ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Authenticated • Complete Profile Setup</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-soft transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Farmer Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Unregistered Flow: Complete Registration Form */}
      {user && !isRegistered ? (
        <div className="p-6 rounded-2xl bg-white border border-agri-200 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-agri-700" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-moss-900">
                Complete Farmer & Farm Registration
              </h3>
              <p className="text-xs text-moss-500">
                Your account <strong className="text-moss-900">{user.email || user.phone || 'active'}</strong> is authenticated with Supabase. Save your profile and farm plot to activate localized advisories.
              </p>
            </div>
          </div>

          {regError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold">Registration Notice: </span>
                <span>{regError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Preferred Dialect / Language *
                </label>
                <select
                  value={regLanguage}
                  onChange={(e) => setRegLanguage(e.target.value as Language)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Village *
                </label>
                <input
                  type="text"
                  value={regVillage}
                  onChange={(e) => setRegVillage(e.target.value)}
                  placeholder="e.g. Baramati"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  District *
                </label>
                <input
                  type="text"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  placeholder="e.g. Pune"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Initial Farm Name
                </label>
                <input
                  type="text"
                  value={regFarmName}
                  onChange={(e) => setRegFarmName(e.target.value)}
                  placeholder="e.g. Main Plot"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Farm Acreage (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={regAcreage}
                  onChange={(e) => setRegAcreage(parseFloat(e.target.value) || 2.5)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Soil Type
                </label>
                <select
                  value={regSoilType}
                  onChange={(e) => setRegSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                >
                  <option value="Black Cotton Soil">Black Cotton Soil (Vertisol)</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Red Loamy Soil">Red Loamy Soil</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                  Irrigation System
                </label>
                <select
                  value={regIrrigation}
                  onChange={(e) => setRegIrrigation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-moss-900 focus:outline-none focus:border-agri-600"
                >
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler System">Sprinkler System</option>
                  <option value="Canal / Flood">Canal / Flood</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
            </div>

            {/* GPS Capture inside registration */}
            <div className="p-3.5 rounded-xl bg-agri-50 border border-agri-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-agri-900 block">
                  PostGIS Geographical Coordinates
                </span>
                <span className="text-[11px] font-mono text-agri-700">
                  Latitude: {regLat.toFixed(4)}° N, Longitude: {regLng.toFixed(4)}° E
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-sm"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Reading GPS...' : 'Detect Field GPS'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmittingReg || !regFullName.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all"
            >
              {isSubmittingReg ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span>Save Profile & Farm Coordinates</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Standard / Presentation & Verified Farmer View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Multi-Farm Switcher if registered farmer has multiple farms */}
            {farms.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-canvas-100 border border-canvas-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-moss-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-agri-600" />
                    <span>Your Registered Farm Plots ({farms.length})</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {farms.map((f) => {
                    const isSelected = selectedFarm?.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFarm(f);
                          setGpsCaptured({ lat: f.latitude, lng: f.longitude });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                            : 'bg-white text-moss-700 border-canvas-300 hover:bg-canvas-200'
                        }`}
                      >
                        🌾 {f.name} ({f.acreage} ac)
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  Farm Location & GPS
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingLocation}
                  className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1.5 hover:underline"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-agri-600' : 'text-agri-600'}`} />
                  <span>{isDetectingLocation ? 'Reading GPS Sensor...' : 'Use Current GPS Location'}</span>
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

              {/* Quick Location / Preset Region Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {filteredLocations.map((loc) => {
                  const isSelected = selectedLocation.city === loc.city;
                  return (
                    <button
                      key={loc.city}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc);
                        setGpsCaptured(null);
                      }}
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
                  {gpsCaptured ? 'Live GPS Sensor Node' : 'Satellite Grid Node'}
                </span>
                <span className="text-[10px] text-canvas-300 font-mono">
                  {gpsCaptured 
                    ? `${gpsCaptured.lat.toFixed(4)}° N, ${gpsCaptured.lng.toFixed(4)}° E`
                    : '18.5204° N, 73.8567° E'}
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
                      {selectedLocation.country} • PostGIS EPSG:4326 Node
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Conditions Mini Visual Callout */}
              <div className="relative z-10 mt-4 pt-3 border-t border-moss-700/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-agri-300 block mb-2">
                  Current Local Conditions (Live Weather Feed)
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
      )}

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
