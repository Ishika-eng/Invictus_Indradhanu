import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Bug, 
  ThermometerSnowflake, 
  CloudRain, 
  Wind, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { fetchLatestFarmRisk, RiskAssessmentData } from '../../services/api';

export const ClimateRiskMatrix: React.FC = () => {
  const { activeAdvisory, selectedCrop, selectedLocation } = useAdvisory();
  const { selectedFarm, session } = useAuth();

  const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadRisk() {
      if (!selectedFarm?.id || !session?.access_token) return;
      try {
        const data = await fetchLatestFarmRisk(selectedFarm.id, session.access_token);
        if (mounted) setRiskData(data);
      } catch (err) {
        console.warn('Risk matrix API fallback:', err);
      }
    }
    loadRisk();
    return () => { mounted = false; };
  }, [selectedFarm?.id, session?.access_token]);

  const scores = riskData?.category_scores;
  const categories = riskData?.categories;

  // Baseline category scores derived from selectedLocation to remain strictly consistent with ClimateRiskScoreCard
  const baselineRainScore = selectedLocation.rainProbPct >= 65 
    ? Math.min(100, Math.round(65 + (selectedLocation.rainProbPct - 65) * 1.5))
    : selectedLocation.rainProbPct >= 40 ? 45 : 20;
  const baselineHeatScore = selectedLocation.tempC >= 35 
    ? Math.min(100, Math.round(60 + (selectedLocation.tempC - 35) * 5))
    : selectedLocation.tempC >= 30 ? 30 : 10;
  const baselineDiseaseScore = selectedLocation.humidityPct >= 75 && selectedLocation.tempC >= 20 ? 65 : 25;
  const baselineWindScore = selectedLocation.windKmh >= 25 ? 70 : selectedLocation.windKmh >= 15 ? 35 : 15;

  const currentRainfallScore = scores?.rainfall ?? baselineRainScore;
  const currentDiseaseScore = scores?.disease ?? baselineDiseaseScore;
  const currentHeatScore = scores?.heat ?? baselineHeatScore;
  const currentWindScore = scores?.wind ?? baselineWindScore;

  // Build dynamic triggers from backend categories or fallback
  const rainItem = categories?.rainfall_waterlogging;
  const diseaseItem = categories?.humidity_disease;
  const heatItem = categories?.heat_stress;
  const windItem = categories?.high_wind;

  const getSeverity = (score: number | null | undefined): 'critical' | 'caution' | 'normal' => {
    if (!score) return 'normal';
    if (score >= 70) return 'critical';
    if (score >= 40) return 'caution';
    return 'normal';
  };

  const riskTriggers = [
    {
      title: 'Convective Rain & Waterlogging',
      value: `${currentRainfallScore}/100 (${selectedLocation.rainProbPct}% chance)`,
      severity: getSeverity(currentRainfallScore),
      desc: rainItem?.explanation || 'Severe root hypoxia & blossom drop risk if flooded during vegetative canopy growth.',
      icon: CloudRain,
      driver: rainItem?.driver_factors?.[0],
    },
    {
      title: 'Fungal Blight & Spore Incubation',
      value: `${currentDiseaseScore}/100 (${selectedLocation.humidityPct}% RH)`,
      severity: getSeverity(currentDiseaseScore),
      desc: diseaseItem?.explanation || 'High relative humidity combined with warm temperatures accelerates pathogen germination.',
      icon: Bug,
      driver: diseaseItem?.driver_factors?.[0],
    },
    {
      title: 'Heat Stress / Thermal Shock',
      value: `${currentHeatScore}/100 (Peak ${selectedLocation.forecastPeakC}°C)`,
      severity: getSeverity(currentHeatScore),
      desc: heatItem?.explanation || 'Temperature remains within safe agronomic parameters for current growth phase.',
      icon: ThermometerSnowflake,
      driver: heatItem?.driver_factors?.[0],
    },
    {
      title: 'Wind Gust & Lodging Hazard',
      value: `${currentWindScore}/100 (${selectedLocation.windKmh} km/h)`,
      severity: getSeverity(currentWindScore),
      desc: windItem?.explanation || 'Foliar spray drift hazard; spray operations should only be executed in calm conditions.',
      icon: Wind,
      driver: windItem?.driver_factors?.[0],
    }
  ];

  const reasoningChain = riskData?.contributing_factors && riskData.contributing_factors.length > 0
    ? riskData.contributing_factors
    : activeAdvisory.scientificReasoning;

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-100 text-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
              Crop-Specific Climate Risk Engine & Reasoning
            </h3>
          </div>
          <p className="text-xs text-moss-500 mt-0.5">
            ICAR & FAO phenological thresholds mapped to live farm weather telemetry ({riskData?.crop_evaluated || selectedCrop})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-agri-50 px-3 py-1 rounded-xl border border-agri-200 text-xs font-bold text-agri-800">
            <Cpu className="w-3.5 h-3.5 text-agri-600" />
            <span>Confidence: {riskData?.confidence_level || 'HIGH'}</span>
          </div>
        </div>
      </div>

      {/* 4 Risk Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
        {riskTriggers.map((risk, idx) => {
          const Icon = risk.icon;
          const isCrit = risk.severity === 'critical';
          const isCaut = risk.severity === 'caution';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isCrit
                  ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                  : isCaut
                  ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                  : 'bg-canvas-100/70 border-canvas-200 hover:bg-canvas-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCrit ? 'bg-rose-600 text-white' : isCaut ? 'bg-amber-600 text-white' : 'bg-agri-700 text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-moss-900 leading-tight">{risk.title}</h4>
                    <span className="text-[10px] font-semibold text-moss-500">{risk.value}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isCrit
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : isCaut
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {risk.severity}
                </span>
              </div>

              <p className="text-[11px] text-moss-600 mt-2 leading-relaxed">
                {risk.desc}
              </p>

              {risk.driver && (
                <div className="mt-2 pt-2 border-t border-canvas-200/60 text-[10px] font-medium text-moss-700 flex items-center gap-1">
                  <span className="text-agri-600 font-bold">•</span>
                  <span>{risk.driver}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scientific Synthesis Bulletpoints */}
      <div className="mt-4 p-4 rounded-2xl bg-moss-900 text-canvas-100 border border-agri-700/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-agri-300 mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scientific Risk Drivers & Methodology ({riskData?.scoring_methodology || 'ICAR_FAO_MULTI_CRITERIA_RISK_V1'})</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-canvas-200/90 font-mono text-[11px]">
          {reasoningChain.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-agri-400 font-bold">[{i+1}]</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
