import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles,
  Info,
  Layers,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Trash2,
  Plus,
  Compass,
  Thermometer,
  Droplets
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchCrops, 
  estimateCropGrowthStage, 
  fetchFarmCrops, 
  addCropToFarm, 
  deleteFarmCrop,
  BackendCrop, 
  BackendCropGrowthStage,
  BackendFarmCrop,
  StageEstimationResponse
} from '../../services/api';

// Fallback catalog in case backend is starting up
const FALLBACK_CROPS_CATALOG: Array<Partial<BackendCrop> & { icon: string; accent: string }> = [
  { id: '1', name: 'Tomato', scientific_name: 'Solanum lycopersicum', category: 'Vegetable / Solanaceous', water_demand: 'Sensitive', root_depth_cm: 'Medium (30-60cm)', icon: '🍅', accent: 'from-rose-500/20 to-red-500/20' },
  { id: '2', name: 'Rice (Paddy)', scientific_name: 'Oryza sativa', category: 'Cereal Grain', water_demand: 'High Water', root_depth_cm: 'Shallow (20-40cm)', icon: '🌾', accent: 'from-emerald-500/20 to-teal-500/20' },
  { id: '3', name: 'Wheat', scientific_name: 'Triticum aestivum', category: 'Rabi Cereal', water_demand: 'Moderate', root_depth_cm: 'Medium (40-60cm)', icon: '🌱', accent: 'from-amber-500/20 to-yellow-500/20' },
  { id: '4', name: 'Cotton', scientific_name: 'Gossypium hirsutum', category: 'Fiber Commercial', water_demand: 'Moderate', root_depth_cm: 'Deep (80-120cm)', icon: '☁️', accent: 'from-slate-500/20 to-sky-500/20' },
  { id: '5', name: 'Maize (Corn)', scientific_name: 'Zea mays', category: 'Kharif Coarse Grain', water_demand: 'Moderate', root_depth_cm: 'Medium (50-80cm)', icon: '🌽', accent: 'from-amber-500/20 to-orange-500/20' },
  { id: '6', name: 'Sugarcane', scientific_name: 'Saccharum officinarum', category: 'Cash Crop / Perennial', water_demand: 'Very High', root_depth_cm: 'Deep (90-150cm)', icon: '🎋', accent: 'from-green-500/20 to-emerald-500/20' },
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

  const { farmer, farms, selectedFarm, setSelectedFarm, session, isRegistered } = useAuth();

  // Crops catalog state
  const [crops, setCrops] = useState<BackendCrop[]>([]);
  const [loadingCrops, setLoadingCrops] = useState<boolean>(true);
  const [activeCropRecord, setActiveCropRecord] = useState<BackendCrop | null>(null);

  // Cultivation form fields
  const [variety, setVariety] = useState<string>('Hybrid F1');
  const [cultivatedAcreage, setCultivatedAcreage] = useState<number>(2.0);
  const [sowingDate, setSowingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 40); // default ~40 days ago
    return d.toISOString().split('T')[0];
  });
  const [activeStageId, setActiveStageId] = useState<string>('');

  // Estimation state
  const [estimation, setEstimation] = useState<StageEstimationResponse | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);

  // Farm crops on current plot
  const [plotCrops, setPlotCrops] = useState<BackendFarmCrop[]>([]);
  const [loadingPlotCrops, setLoadingPlotCrops] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Load Crop Catalog from Backend
  useEffect(() => {
    let mounted = true;
    async function loadCrops() {
      setLoadingCrops(true);
      try {
        const data = await fetchCrops();
        if (mounted && data.length > 0) {
          setCrops(data);
          // Set initial crop selection to first crop or currently selected crop
          const matched = data.find(c => c.name.toLowerCase().includes(selectedCrop.toLowerCase())) || data[0];
          setActiveCropRecord(matched);
          setSelectedCrop(matched.name);
          if (matched.growth_stages.length > 0) {
            const currentStageObj = matched.growth_stages.find(s => s.stage_name === selectedStage) || matched.growth_stages[0];
            setActiveStageId(currentStageObj.id);
            setSelectedStage(currentStageObj.stage_name);
          }
        }
      } catch (err) {
        console.warn('Using local crop fallback:', err);
      } finally {
        if (mounted) setLoadingCrops(false);
      }
    }
    loadCrops();
    return () => { mounted = false; };
  }, []);

  // 2. Load Cultivated Crops on Selected Farm Plot
  useEffect(() => {
    let mounted = true;
    async function loadFarmCrops() {
      if (!selectedFarm?.id || !session?.access_token) return;
      setLoadingPlotCrops(true);
      try {
        const data = await fetchFarmCrops(selectedFarm.id, session.access_token);
        if (mounted) {
          setPlotCrops(data);
        }
      } catch (err) {
        console.warn('Failed to fetch plot crops:', err);
      } finally {
        if (mounted) setLoadingPlotCrops(false);
      }
    }
    loadFarmCrops();
    return () => { mounted = false; };
  }, [selectedFarm?.id, session?.access_token]);

  // 3. Compute Remaining Farm Plot Capacity
  const allocatedAcreage = useMemo(() => {
    return plotCrops
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.cultivated_acreage || 0), 0);
  }, [plotCrops]);

  const totalFarmAcreage = selectedFarm?.acreage || 2.5;
  const availableAcreage = Math.max(0, Number((totalFarmAcreage - allocatedAcreage).toFixed(2)));

  // 4. Update stage when a crop is selected
  const handleSelectCrop = (crop: BackendCrop) => {
    setActiveCropRecord(crop);
    setSelectedCrop(crop.name);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (crop.growth_stages.length > 0) {
      // Pick middle stage (e.g., Vegetative/Growing) or first stage
      const defaultStage = crop.growth_stages.find(s => s.stage_order === 3) || crop.growth_stages[0];
      setActiveStageId(defaultStage.id);
      setSelectedStage(defaultStage.stage_name);
    }
  };

  // 5. Query Stage Estimation whenever sowingDate or activeCropRecord changes
  useEffect(() => {
    if (!activeCropRecord?.id || !sowingDate) return;
    let mounted = true;

    async function estimate() {
      setEstimating(true);
      try {
        const est = await estimateCropGrowthStage(activeCropRecord!.id, sowingDate);
        if (mounted) {
          setEstimation(est);
        }
      } catch (err) {
        console.warn('Stage estimation check:', err);
        if (mounted) setEstimation(null);
      } finally {
        if (mounted) setEstimating(false);
      }
    }

    const timer = setTimeout(estimate, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [activeCropRecord?.id, sowingDate]);

  // Apply suggested stage without automatic overwriting
  const applySuggestedStage = () => {
    if (!estimation?.suggested_stage_id || !activeCropRecord) return;
    const stage = activeCropRecord.growth_stages.find(s => s.id === estimation.suggested_stage_id);
    if (stage) {
      setActiveStageId(stage.id);
      setSelectedStage(stage.stage_name);
      setSuccessMessage(`Stage updated to '${stage.stage_name}' based on planting date.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // 6. Handle Manual Stage Selection
  const handleSelectStage = (stage: BackendCropGrowthStage) => {
    setActiveStageId(stage.id);
    setSelectedStage(stage.stage_name);
  };

  // 7. Save Crop to Farm Plot and Continue
  const handleSaveAndContinue = async () => {
    setErrorMessage(null);

    // Validate acreage
    if (cultivatedAcreage <= 0) {
      setErrorMessage('Cultivated acreage must be greater than zero.');
      return;
    }

    // Check acreage capacity
    if (cultivatedAcreage > availableAcreage + 0.05) {
      setErrorMessage(
        `Cultivated acreage (${cultivatedAcreage} acres) exceeds available plot capacity (${availableAcreage} acres available on ${selectedFarm?.name || 'this plot'}).`
      );
      return;
    }

    // If authenticated and has a registered farm, persist to backend
    if (isRegistered && selectedFarm?.id && session?.access_token && activeCropRecord?.id) {
      setIsSubmitting(true);
      try {
        await addCropToFarm(
          selectedFarm.id,
          {
            crop_id: activeCropRecord.id,
            variety: variety.trim() || undefined,
            cultivated_acreage: Number(cultivatedAcreage),
            sowing_date: sowingDate,
            current_stage_id: activeStageId || undefined,
            status: 'active',
          },
          session.access_token
        );
        setSuccessMessage(`Crop '${activeCropRecord.name}' registered to ${selectedFarm.name}!`);
        // Refresh farm plot crops
        const updatedPlotCrops = await fetchFarmCrops(selectedFarm.id, session.access_token);
        setPlotCrops(updatedPlotCrops);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to register crop to farm plot.');
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Advance to Step 3
    setDemoStep(3);
  };

  // Remove existing crop from plot
  const handleDeleteCropRecord = async (cropRecordId: string) => {
    if (!selectedFarm?.id || !session?.access_token) return;
    try {
      await deleteFarmCrop(selectedFarm.id, cropRecordId, session.access_token);
      const updated = await fetchFarmCrops(selectedFarm.id, session.access_token);
      setPlotCrops(updated);
      setSuccessMessage('Crop record removed from farm plot.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove crop.');
    }
  };

  // Selected stage object for displaying agronomic metadata
  const currentStageDetails = useMemo(() => {
    if (!activeCropRecord) return null;
    return activeCropRecord.growth_stages.find(s => s.id === activeStageId) || activeCropRecord.growth_stages[0];
  }, [activeCropRecord, activeStageId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-canvas-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-earth-700 bg-earth-50 px-2.5 py-1 rounded-lg border border-earth-200">
            Step 2 of 6
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Crop Type & Growth Stage
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Configure {farmerName}'s crop on {selectedFarm ? selectedFarm.name : selectedLocation.city} to activate crop-specific climate risk thresholds.
          </p>
        </div>

        {/* Farm Plot Badge & Selector */}
        {farms && farms.length > 0 && (
          <div className="flex items-center gap-2 bg-moss-50 border border-moss-200 px-3 py-1.5 rounded-xl text-xs">
            <Compass className="w-4 h-4 text-agri-700 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-moss-500 uppercase font-bold block">Farm Plot</span>
              <select
                value={selectedFarm?.id || ''}
                onChange={(e) => {
                  const target = farms.find(f => f.id === e.target.value);
                  if (target) setSelectedFarm(target);
                }}
                className="bg-transparent font-bold text-moss-900 text-xs focus:outline-none cursor-pointer"
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.acreage} ac)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-agri-50 border border-agri-200 flex items-center gap-2 text-xs text-agri-900 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Visual Crop Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700">
            Select Supported Crop
          </label>
          {loadingCrops && (
            <span className="text-[10px] text-agri-700 flex items-center gap-1 font-semibold">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading agronomic catalog...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(crops.length > 0 ? crops : FALLBACK_CROPS_CATALOG).map((crop) => {
            const isSelected = activeCropRecord?.name === crop.name || selectedCrop === crop.name;
            const icon = crop.icon || '🌱';
            const category = crop.category || 'Crop';
            const waterDemand = crop.water_demand || 'Moderate';

            return (
              <button
                key={crop.id || crop.name}
                type="button"
                onClick={() => crop.id && crops.length > 0 && handleSelectCrop(crop as BackendCrop)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-300 relative flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-agri-50/90 border-agri-600 shadow-soft ring-4 ring-agri-500/20 scale-[1.03]'
                    : 'bg-white border-canvas-300 hover:border-agri-400 hover:bg-canvas-100/60 hover:scale-[1.01]'
                }`}
              >
                {/* Active check bubble */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-agri-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                )}

                <div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-agri-500/20 to-teal-500/20 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  
                  <h4 className="font-display font-extrabold text-sm text-moss-900 leading-tight">
                    {crop.name}
                  </h4>
                  {crop.scientific_name && (
                    <p className="text-[10px] text-moss-500 italic mt-0.5 truncate">
                      {crop.scientific_name}
                    </p>
                  )}
                  <p className="text-[10px] text-agri-700 font-semibold mt-0.5">
                    {category}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-canvas-200 text-[10px] flex items-center justify-between text-moss-600">
                  <span className="font-semibold text-agri-800">{waterDemand}</span>
                  {crop.temp_optimal_min_c && crop.temp_optimal_max_c && (
                    <span className="text-moss-400">{crop.temp_optimal_min_c}-{crop.temp_optimal_max_c}°C</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cultivation Details Panel (Variety, Acreage, Planting Date) */}
      <div className="p-4 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between border-b border-canvas-200 pb-2">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-agri-700" />
            <h3 className="font-display font-bold text-sm text-moss-900">
              Cultivation Details & Sowing Timeline
            </h3>
          </div>
          {selectedFarm && (
            <span className="text-[11px] font-medium text-moss-600">
              Plot capacity: <strong className="text-agri-800">{availableAcreage} acres</strong> available of {totalFarmAcreage} acres
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Variety */}
          <div>
            <label className="text-[11px] font-bold text-moss-700 uppercase tracking-wider block mb-1">
              Crop Variety / Hybrid
            </label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="e.g. Abhinav F1, Basmati 1121"
              className="w-full px-3 py-2 text-xs rounded-xl border border-canvas-300 focus:outline-none focus:ring-2 focus:ring-agri-500 bg-canvas-50"
            />
          </div>

          {/* Cultivated Acreage */}
          <div>
            <label className="text-[11px] font-bold text-moss-700 uppercase tracking-wider block mb-1">
              Cultivated Acreage (Acres)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max={totalFarmAcreage}
              value={cultivatedAcreage}
              onChange={(e) => setCultivatedAcreage(parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 bg-canvas-50 ${
                cultivatedAcreage > availableAcreage + 0.05
                  ? 'border-rose-400 focus:ring-rose-400 text-rose-900 bg-rose-50'
                  : 'border-canvas-300 focus:ring-agri-500 text-moss-900'
              }`}
            />
            {cultivatedAcreage > availableAcreage + 0.05 && (
              <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                Exceeds remaining plot acreage ({availableAcreage} ac)
              </span>
            )}
          </div>

          {/* Sowing Date */}
          <div>
            <label className="text-[11px] font-bold text-moss-700 uppercase tracking-wider block mb-1">
              Sowing / Transplanting Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-canvas-300 focus:outline-none focus:ring-2 focus:ring-agri-500 bg-canvas-50"
              />
            </div>
          </div>
        </div>

        {/* AI Stage Estimation Banner */}
        {estimation && (
          <div className="p-3 rounded-xl bg-agri-50/70 border border-agri-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-agri-950">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-agri-900">
                  {estimation.advice}
                </p>
                <p className="text-[11px] text-agri-700 mt-0.5">
                  Water sensitivity: <strong>{estimation.water_sensitivity}</strong> | Stage Phase {estimation.suggested_stage_order}
                </p>
              </div>
            </div>

            {estimation.suggested_stage_name && estimation.suggested_stage_name !== selectedStage && (
              <button
                type="button"
                onClick={applySuggestedStage}
                className="self-start sm:self-auto shrink-0 px-3 py-1.5 bg-agri-700 hover:bg-agri-800 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
              >
                Apply Suggested Stage
              </button>
            )}
          </div>
        )}
      </div>

      {/* Crop-Specific Growth Stage Selector & Timeline */}
      <div className="p-5 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-moss-700">
              Phenological Growth Stage
            </label>
            <p className="text-xs text-moss-500 mt-0.5">
              Specific to {activeCropRecord?.name || 'crop'}. Select the confirmed growth stage on your field.
            </p>
          </div>
          <span className="text-[11px] font-bold text-agri-800 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
            Selected: {selectedStage}
          </span>
        </div>

        {/* Stage Timeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3">
          {(activeCropRecord?.growth_stages || []).map((stage) => {
            const isSelected = activeStageId === stage.id || selectedStage === stage.stage_name;
            const sensitivityColor = 
              stage.water_sensitivity.toLowerCase().includes('critical') ? 'bg-rose-100 text-rose-800 border-rose-300' :
              stage.water_sensitivity.toLowerCase().includes('high') ? 'bg-amber-100 text-amber-800 border-amber-300' :
              'bg-teal-100 text-teal-800 border-teal-300';

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleSelectStage(stage)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                    : 'bg-canvas-100 text-moss-700 border-canvas-300 hover:bg-canvas-200 hover:border-agri-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={`font-bold ${isSelected ? 'text-agri-200' : 'text-moss-500'}`}>
                      Phase {stage.stage_order}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      isSelected ? 'bg-white/20 text-white border-white/30' : sensitivityColor
                    }`}>
                      {stage.water_sensitivity}
                    </span>
                  </div>

                  <h5 className={`font-display font-bold text-xs leading-tight ${isSelected ? 'text-white' : 'text-moss-900'}`}>
                    {stage.stage_name}
                  </h5>
                </div>

                <div className={`mt-2 pt-1.5 border-t text-[10px] flex items-center justify-between ${
                  isSelected ? 'border-white/20 text-agri-100' : 'border-canvas-200 text-moss-500'
                }`}>
                  <span>~{stage.duration_days} days</span>
                  <span>Days {stage.cumulative_start_day}-{stage.cumulative_end_day}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phenology Context & Vulnerability Warning Box */}
      {currentStageDetails && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-agri-50 to-moss-50 border border-agri-200 flex items-start gap-3 text-xs text-agri-950">
          <Info className="w-5 h-5 text-agri-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-agri-900">
              Phenology Context: {activeCropRecord?.name} — {currentStageDetails.stage_name}
            </p>
            <p className="text-[11px] leading-relaxed text-moss-700">
              {currentStageDetails.vulnerability_notes || currentStageDetails.description}
            </p>
            {activeCropRecord?.agronomic_reference && (
              <p className="text-[9px] text-moss-400 italic pt-1">
                Reference: {activeCropRecord.agronomic_reference}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Existing Cultivated Crops on this Farm Plot */}
      {plotCrops.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-canvas-300 shadow-soft-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-moss-700 mb-2.5">
            Active Plantings on {selectedFarm?.name || 'This Plot'}
          </h4>

          <div className="divide-y divide-canvas-200">
            {plotCrops.map((pc) => (
              <div key={pc.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{pc.crop?.icon || '🌱'}</span>
                  <div>
                    <strong className="text-moss-900 font-display">{pc.crop?.name}</strong>
                    {pc.variety && <span className="text-moss-500 text-[11px] ml-1.5 font-normal">({pc.variety})</span>}
                    <div className="text-[10px] text-moss-500 flex items-center gap-2 mt-0.5">
                      <span>{pc.cultivated_acreage} acres</span>
                      <span>•</span>
                      <span className="text-agri-700 font-semibold">{pc.current_stage_name || 'Active'}</span>
                      <span>•</span>
                      <span>Sown: {pc.sowing_date}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCropRecord(pc.id)}
                  title="Remove crop record"
                  className="p-1.5 text-canvas-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation & Action Buttons */}
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
          disabled={isSubmitting}
          onClick={handleSaveAndContinue}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Crop to Farm...</span>
            </>
          ) : (
            <>
              <span>Save & Continue to Step 3 — Generate Advisory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
