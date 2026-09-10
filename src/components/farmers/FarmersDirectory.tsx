import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Globe2,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { FarmerProfile } from '../../types/advisory';

export const FarmersDirectory: React.FC = () => {
  const { allFarmers, setSelectedFarmer, setSelectedLanguage, setActiveTab } = useAdvisory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFarmers = allFarmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.activeCropId && f.activeCropId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectFarmer = (farmer: FarmerProfile) => {
    setSelectedFarmer(farmer);
    setSelectedLanguage(farmer.preferredLanguage);
    setActiveTab('advisory-wizard');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-agri-100 text-agri-800">
                <Users className="w-4 h-4" />
              </span>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900">
                Smallholder Farmers Directory
              </h2>
            </div>
            <p className="text-xs text-moss-500 mt-0.5">
              Registered smallholders with micro-zone satellite linkages and language channel mappings.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, village, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-canvas-100 border border-canvas-300 text-xs focus:outline-none focus:border-agri-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFarmers.map((farmer) => (
          <div
            key={farmer.id}
            className="rounded-3xl bg-white border border-canvas-300 shadow-soft hover:shadow-soft-lg transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-canvas-200 border border-canvas-300 flex items-center justify-center text-2xl">
                    {farmer.avatar || '👨🏽‍🌾'}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-moss-900">
                      {farmer.name}
                    </h3>
                    <p className="text-xs text-moss-500 flex items-center gap-1 font-medium mt-0.5">
                      <MapPin className="w-3 h-3 text-agri-600" />
                      <span>{farmer.location.village}, {farmer.location.district}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-agri-50 text-agri-800 border border-agri-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-agri-600" />
                  <span>{farmer.trustScore}%</span>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-2 py-2 border-y border-canvas-200 text-xs">
                <div className="flex items-center justify-between text-moss-600">
                  <span className="text-[11px]">Active Crop:</span>
                  <span className="font-bold text-agri-900 flex items-center gap-1">
                    <Sprout className="w-3 h-3 text-agri-600" />
                    {farmer.activeCropId || 'Tomato'} ({farmer.landHoldingAcres} ac)
                  </span>
                </div>
                <div className="flex items-center justify-between text-moss-600">
                  <span className="text-[11px]">Dialect Channel:</span>
                  <span className="font-semibold uppercase text-earth-800 bg-earth-50 px-2 py-0.5 rounded text-[10px] border border-earth-200">
                    {farmer.preferredLanguage.toUpperCase()} GSM Voice & SMS
                  </span>
                </div>
                <div className="flex items-center justify-between text-moss-600">
                  <span className="text-[11px]">Micro-Sector:</span>
                  <span className="font-mono text-[10px] text-moss-500 truncate max-w-[150px]">
                    {farmer.location.microZoneName}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 pt-2">
              <button
                onClick={() => handleSelectFarmer(farmer)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-soft transition-all active:scale-95 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-agri-300 group-hover:rotate-12 transition-transform" />
                <span>Formulate Climate Advisory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
