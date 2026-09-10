import React from 'react';
import { 
  Sprout, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles,
  Info,
  Layers,
  Calendar
} from 'lucide-react';
import { useAdvisory, SimplifiedGrowthStage } from '../../context/AdvisoryContext';

export interface CropCardItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  accent: string;
  waterDemand: string;
  rootDepth: string;
}

export const CROPS_CATALOG: CropCardItem[] = [
  { id: 'Rice', name: 'Rice (Paddy)', type: 'Cereal Grain', icon: '🌾', accent: 'from-emerald-500/20 to-teal-500/20', waterDemand: 'High Water', rootDepth: 'Shallow (20-40cm)' },
  { id: 'Wheat', name: 'Wheat', type: 'Rabi Cereal', icon: '🌱', accent: 'from-amber-500/20 to-yellow-500/20', waterDemand: 'Moderate', rootDepth: 'Medium (40-60cm)' },
  { id: 'Cotton', name: 'Cotton', type: 'Fiber Commercial', icon: '☁️', accent: 'from-slate-500/20 to-sky-500/20', waterDemand: 'Moderate', rootDepth: 'Deep (80-120cm)' },
  { id: 'Maize', name: 'Maize (Corn)', type: 'Kharif Coarse Grain', icon: '🌽', accent: 'from-amber-500/20 to-orange-500/20', waterDemand: 'Moderate', rootDepth: 'Medium (50-80cm)' },
  { id: 'Tomato', name: 'Tomato', type: 'Vegetable / Solanaceous', icon: '🍅', accent: 'from-rose-500/20 to-red-500/20', waterDemand: 'Sensitive', rootDepth: 'Medium (30-60cm)' },
  { id: 'Sugarcane', name: 'Sugarcane', type: 'Cash Crop / Perennial', icon: '🎋', accent: 'from-green-500/20 to-emerald-500/20', waterDemand: 'Very High', rootDepth: 'Deep (90-150cm)' },
];

export const Step2CropSelection: React.FC = () => {
  const { 
    selectedCrop, 
    setSelectedCrop, 
    selectedStage, 
    setSelectedStage, 
    setDemoStep,
    farmerName,
    selectedLocation
  } = useAdvisory();

  const stages: SimplifiedGrowthStage[] = [
    'Preparing land',
    'Planting',
    'Growing',
    'Flowering',
    'Harvesting',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-earth-700 bg-earth-50 px-2.5 py-1 rounded-lg border border-earth-200">
            Step 2 of 6
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Crop Type & Growth Stage
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Select {farmerName}'s active crop in {selectedLocation.city} to activate crop-specific weather thresholds.
          </p>
        </div>
      </div>

      {/* Visual Crop Cards Grid */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-3">
          Select Crop
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CROPS_CATALOG.map((crop) => {
            const isSelected = selectedCrop === crop.id || selectedCrop.includes(crop.id);
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCrop(crop.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 relative flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-agri-50/90 border-agri-600 shadow-soft ring-4 ring-agri-500/20 scale-[1.03]'
                    : 'bg-white border-canvas-300 hover:border-agri-400 hover:bg-canvas-100/60 hover:scale-[1.01]'
                }`}
              >
                {/* Active check bubble */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-agri-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                )}

                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${crop.accent} flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 transition-transform`}>
                    {crop.icon}
                  </div>
                  
                  <h4 className="font-display font-extrabold text-sm text-moss-900 leading-tight">
                    {crop.name}
                  </h4>
                  <p className="text-[10px] text-moss-500 font-medium mt-0.5">
                    {crop.type}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-canvas-200/80 text-[10px] text-moss-600 flex items-center justify-between">
                  <span className="font-semibold text-agri-800">{crop.waterDemand}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Farming Stage Selector */}
      <div className="p-5 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700">
            Current Farming Stage
          </label>
          <span className="text-[11px] font-bold text-agri-800 bg-agri-50 px-2.5 py-0.5 rounded-lg border border-agri-200">
            Selected: {selectedStage}
          </span>
        </div>
        <p className="text-xs text-moss-500 mb-4">
          Crucial for determining whether the crop is vulnerable to blossom drop, germination rot, or grain lodging.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {stages.map((st, idx) => {
            const isSelected = selectedStage === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStage(st)}
                className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-agri-700 text-white border-agri-700 shadow-soft font-bold'
                    : 'bg-canvas-100 text-moss-700 border-canvas-300 hover:bg-canvas-200'
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-moss-900'}`}>
                  {st}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-agri-200' : 'text-moss-500'}`}>
                  Phase {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agronomic Rule Hint */}
      <div className="p-3.5 rounded-2xl bg-agri-50 border border-agri-200 flex items-start gap-2.5 text-xs text-agri-950">
        <Info className="w-4 h-4 text-agri-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Phenology Context:</strong> <strong>{selectedCrop}</strong> during the <strong>{selectedStage}</strong> stage has low tolerance for waterlogging at root depth. Excessive moisture causes 15-20% premature flower abortion.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-canvas-200">
        <button
          type="button"
          onClick={() => setDemoStep(1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Farmer Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setDemoStep(3)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
        >
          <span>Continue to Step 3 — Generate Advisory</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
