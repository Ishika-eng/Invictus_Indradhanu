import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Globe2, 
  Sparkles, 
  Check, 
  Plus, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { FarmerProfile, Language } from '../../types/advisory';

interface StepFarmerProps {
  onNext: () => void;
}

export const StepFarmer: React.FC<StepFarmerProps> = ({ onNext }) => {
  const { selectedFarmer, setSelectedFarmer, allFarmers, addNewFarmer, selectedLanguage, setSelectedLanguage } = useAdvisory();
  
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customVillage, setCustomVillage] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customVillage) return;

    const newF: FarmerProfile = {
      id: `f-${Date.now().toString().slice(-4)}`,
      name: customName,
      phone: customPhone || '+91 98000 00000',
      avatar: '👨🏽‍🌾',
      location: {
        village: customVillage,
        district: customDistrict || 'Custom District',
        state: 'Custom State',
        country: 'India',
        coordinates: [20.0, 74.0],
        elevationMeters: 450,
        microZoneName: `${customVillage} Micro Agro-Zone`,
      },
      preferredLanguage: selectedLanguage,
      landHoldingAcres: 2.5,
      cropHistory: ['Tomato', 'Wheat'],
      trustScore: 90,
    };

    addNewFarmer(newF);
    setShowCustomModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header instructions */}
      <div className="bg-agri-50/70 p-4 rounded-2xl border border-agri-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-agri-700 text-white flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-canvas-100" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-agri-950">
            Step 1: Select or Register Smallholder Farmer
          </h3>
          <p className="text-xs text-agri-800/90 mt-0.5">
            Identify the farmer and their micro-location to link Open-Meteo & NASA POWER satellite coordinates with their preferred language channel.
          </p>
        </div>
      </div>

      {/* Preset Farmer Profiles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700">
            Select Smallholder Profile
          </label>
          <button
            onClick={() => setShowCustomModal(true)}
            className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Farmer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {allFarmers.map((farmer) => {
            const isSelected = selectedFarmer.id === farmer.id;
            return (
              <div
                key={farmer.id}
                onClick={() => {
                  setSelectedFarmer(farmer);
                  setSelectedLanguage(farmer.preferredLanguage);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-agri-50/90 border-agri-600 shadow-soft'
                    : 'bg-white border-canvas-300 hover:border-agri-300 hover:bg-canvas-100/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-agri-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-canvas-200 border border-canvas-300 flex items-center justify-center text-2xl shrink-0">
                    {farmer.avatar || '👨🏽‍🌾'}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-moss-900">
                      {farmer.name}
                    </h4>
                    <p className="text-xs text-moss-600 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-agri-600 shrink-0" />
                      <span>{farmer.location.village}, {farmer.location.district} ({farmer.location.state})</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-canvas-300 text-moss-700">
                        {farmer.landHoldingAcres} Acres
                      </span>
                      <span className="text-[10px] font-semibold bg-agri-100/80 text-agri-800 px-2 py-0.5 rounded border border-agri-200">
                        {farmer.preferredLanguage.toUpperCase()} Dialect
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Dialect Selection */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-moss-700 mb-2.5 block">
          Preferred Delivery Language / Regional Dialect
        </label>
        <p className="text-xs text-moss-500 mb-3.5">
          Advisories will be synthesized and read out by AI in this native dialect via Phone Voice Call & SMS.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                    : 'bg-canvas-100/60 text-moss-800 border-canvas-300 hover:bg-canvas-200'
                }`}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-agri-900'}`}>
                  {lang.native}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-agri-200' : 'text-moss-500'}`}>
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Step Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95"
        >
          <span>Continue to Crop & Soil Context</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal for adding custom farmer */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-moss-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-canvas-300 shadow-soft-lg">
            <h3 className="font-display font-extrabold text-lg text-moss-900 mb-1">
              Add New Smallholder Farmer
            </h3>
            <p className="text-xs text-moss-500 mb-4">
              Enter farmer contact and village details to pin their satellite micro-grid.
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-moss-700 block mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Shinde"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-canvas-100 border border-canvas-300 text-sm focus:outline-none focus:border-agri-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-moss-700 block mb-1">Village</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Niphad"
                    value={customVillage}
                    onChange={(e) => setCustomVillage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-canvas-100 border border-canvas-300 text-sm focus:outline-none focus:border-agri-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-moss-700 block mb-1">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Nashik"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-canvas-100 border border-canvas-300 text-sm focus:outline-none focus:border-agri-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-moss-700 block mb-1">Mobile / GSM Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98221 00000"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-canvas-100 border border-canvas-300 text-sm focus:outline-none focus:border-agri-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-canvas-200 text-moss-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-agri-700 text-white font-bold text-xs shadow-soft hover:bg-agri-800"
                >
                  Save & Select Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
