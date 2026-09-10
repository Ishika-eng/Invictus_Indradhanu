import React from 'react';
import { 
  Sprout, 
  Layers, 
  Droplets, 
  Calendar, 
  Sliders, 
  ArrowLeft, 
  ArrowRight,
  Check
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { CropType, GrowthStage, SoilType, IrrigationType } from '../../types/advisory';
import { CROPS_CONFIG } from '../../data/mockData';

interface StepCropProps {
  onBack: () => void;
  onNext: () => void;
}

export const StepCrop: React.FC<StepCropProps> = ({ onBack, onNext }) => {
  const { 
    selectedCrop, 
    setSelectedCrop, 
    selectedGrowthStage, 
    setSelectedGrowthStage, 
    selectedSoilType, 
    setSelectedSoilType, 
    selectedIrrigation, 
    setSelectedIrrigation,
    acreage,
    setAcreage,
    selectedFarmer
  } = useAdvisory();

  const growthStages: GrowthStage[] = [
    'Germination & Emergence',
    'Vegetative / Tillering',
    'Flowering & Booting',
    'Pod / Grain Filling',
    'Maturity & Ripening',
    'Harvest Ready',
  ];

  const soilTypes: SoilType[] = [
    'Black Clay Soil (Vertisol)',
    'Alluvial Loam',
    'Red Sandy Loam',
    'Laterite / Volcanic Soil',
    'Clay Loam',
  ];

  const irrigationMethods: IrrigationType[] = [
    'Drip Irrigation',
    'Canal / Flood Irrigation',
    'Tube Well / Sprinkler',
    'Rainfed Only',
  ];

  return (
    <div className="space-y-6">
      {/* Header instructions */}
      <div className="bg-earth-50/70 p-4 rounded-2xl border border-earth-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-earth-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sprout className="w-4 h-4 text-canvas-100" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-earth-950">
            Step 2: Crop, Stage & Agronomic Field Context
          </h3>
          <p className="text-xs text-earth-800/90 mt-0.5">
            Crop-specific water thresholds, root vulnerability, and thermal sensitive stages vary dramatically. Providing this allows the AI to calculate precise agronomic risk formulas.
          </p>
        </div>
      </div>

      {/* Visual Crop Selection */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-2.5">
          Select Active Crop
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CROPS_CONFIG.map((crop) => {
            const isSelected = selectedCrop === crop.name;
            return (
              <button
                key={crop.name}
                type="button"
                onClick={() => setSelectedCrop(crop.name as CropType)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative ${
                  isSelected
                    ? 'bg-agri-50/90 border-agri-600 shadow-soft ring-2 ring-agri-500/20'
                    : 'bg-white border-canvas-300 hover:border-agri-300 hover:bg-canvas-100/60'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-agri-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                <span className="text-2xl block mb-1">{crop.icon}</span>
                <p className="font-display font-bold text-xs sm:text-sm text-moss-900 leading-tight">
                  {crop.name}
                </p>
                <span className="text-[10px] text-moss-500 block mt-0.5">
                  Water: {crop.waterDemand}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Farming Growth Stage Pills */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700">
            Current Crop Phenological Growth Stage
          </label>
          <span className="text-[11px] font-semibold text-agri-700 bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
            {selectedGrowthStage}
          </span>
        </div>
        <p className="text-xs text-moss-500 mb-3.5">
          Critical for assessing flower drop, grain shriveling, or harvest rain damage.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {growthStages.map((stage) => {
            const isSelected = selectedGrowthStage === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setSelectedGrowthStage(stage)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  isSelected
                    ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                    : 'bg-canvas-100 text-moss-700 border-canvas-300 hover:bg-canvas-200'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Soil Type & Irrigation Method Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Soil Type */}
        <div className="p-4 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1.5">
            Field Soil Type
          </label>
          <p className="text-[11px] text-moss-500 mb-2.5">
            Governs water percolation speed & moisture retention.
          </p>
          <select
            value={selectedSoilType}
            onChange={(e) => setSelectedSoilType(e.target.value as SoilType)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-semibold text-moss-900 focus:outline-none focus:border-agri-600"
          >
            {soilTypes.map((soil) => (
              <option key={soil} value={soil}>{soil}</option>
            ))}
          </select>
        </div>

        {/* Irrigation Method */}
        <div className="p-4 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1.5">
            Primary Irrigation Source
          </label>
          <p className="text-[11px] text-moss-500 mb-2.5">
            Determines whether advice should advise pump shutoff or furrow ditching.
          </p>
          <select
            value={selectedIrrigation}
            onChange={(e) => setSelectedIrrigation(e.target.value as IrrigationType)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-semibold text-moss-900 focus:outline-none focus:border-agri-600"
          >
            {irrigationMethods.map((irr) => (
              <option key={irr} value={irr}>{irr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Acreage Slider */}
      <div className="p-4 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm flex items-center justify-between gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block">
            Plot Land Size (Acres)
          </label>
          <p className="text-[11px] text-moss-500">
            For {selectedFarmer.name}'s land plot in {selectedFarmer.location.village}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.5"
            max="25"
            step="0.5"
            value={acreage}
            onChange={(e) => setAcreage(parseFloat(e.target.value))}
            className="w-32 sm:w-48 accent-agri-700"
          />
          <span className="font-mono font-bold text-sm bg-canvas-200 px-2.5 py-1 rounded-lg text-agri-900 border border-canvas-300">
            {acreage} Acres
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Farmer Profile</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95"
        >
          <span>Proceed to AI Synthesis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
