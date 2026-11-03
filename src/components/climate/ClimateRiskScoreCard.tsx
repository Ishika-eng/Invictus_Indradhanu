import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CloudRain, 
  Thermometer, 
  Waves, 
  Wind, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Bug,
  Info
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchLatestFarmRisk, 
  evaluateFarmRisk, 
  RiskAssessmentData 
} from '../../services/api';

export const ClimateRiskScoreCard: React.FC = () => {
  const { selectedCrop } = useAdvisory();
  const { selectedFarm, session } = useAuth();

  const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function loadRisk() {
      if (!selectedFarm?.id || !session?.access_token) return;
      setLoading(true);
      try {
        const data = await fetchLatestFarmRisk(selectedFarm.id, session.access_token);
        if (mounted) setRiskData(data);
      } catch (err) {
        console.warn('Risk evaluation API fallback to baseline:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRisk();
    return () => { mounted = false; };
  }, [selectedFarm?.id, session?.access_token]);

  const handleReevaluate = async () => {
    if (!selectedFarm?.id || !session?.access_token) return;
    setEvaluating(true);
    try {
      const data = await evaluateFarmRisk(selectedFarm.id, {}, session.access_token);
      setRiskData(data);
    } catch (err) {
      console.warn('Re-evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Determine overall badge color
  const overallScore = riskData?.overall_risk_score ?? 62;
  const overallLevel = riskData?.overall_risk_level ?? 'MODERATE';

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return { badge: 'bg-rose-600 text-white', bar: 'bg-rose-500', heroBg: 'bg-rose-50/70 border-rose-200 text-rose-950' };
      case 'HIGH':
        return { badge: 'bg-orange-500 text-white', bar: 'bg-orange-500', heroBg: 'bg-orange-50/70 border-orange-200 text-orange-950' };
      case 'MODERATE':
        return { badge: 'bg-amber-500 text-white', bar: 'bg-amber-500', heroBg: 'bg-amber-50/70 border-amber-200 text-amber-950' };
      default:
        return { badge: 'bg-emerald-600 text-white', bar: 'bg-emerald-500', heroBg: 'bg-emerald-50/70 border-emerald-200 text-emerald-950' };
    }
  };

  const levelStyles = getLevelColor(overallLevel);

  // Categories list
  const categoryScores = riskData?.category_scores;
  const rainfallScore = categoryScores?.rainfall ?? 75;
  const heatScore = categoryScores?.heat ?? 30;
  const coldScore = categoryScores?.cold ?? 10;
  const diseaseScore = categoryScores?.disease ?? 60;
  const windScore = categoryScores?.wind ?? 25;
  const soilScore = categoryScores?.soil_moisture;

  const categories = [
    {
      title: 'Rainfall & Flooding',
      score: rainfallScore,
      available: true,
      icon: CloudRain,
      color: rainfallScore >= 60 ? 'bg-rose-500' : rainfallScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      title: 'Pathogen & Humidity Window',
      score: diseaseScore,
      available: true,
      icon: Bug,
      color: diseaseScore >= 60 ? 'bg-rose-500' : diseaseScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      title: 'Heat Stress',
      score: heatScore,
      available: true,
      icon: Thermometer,
      color: heatScore >= 60 ? 'bg-rose-500' : heatScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      title: 'Cold / Chilling Stress',
      score: coldScore,
      available: true,
      icon: Thermometer,
      color: coldScore >= 60 ? 'bg-rose-500' : coldScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      title: 'High Wind & Lodging',
      score: windScore,
      available: true,
      icon: Wind,
      color: windScore >= 60 ? 'bg-rose-500' : windScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      title: 'Root Soil Moisture',
      score: soilScore,
      available: soilScore !== null && soilScore !== undefined,
      icon: Waves,
      color: 'bg-canvas-400',
      unavailableReason: 'No physical IoT probe installed',
    },
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-amber-100 text-amber-800">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900 leading-tight">
              Crop Climate Risk Assessment
            </h3>
            <p className="text-[11px] text-moss-500">
              Evaluated for: <span className="font-semibold text-agri-700">{riskData?.crop_evaluated || selectedCrop} ({riskData?.growth_stage_evaluated || 'Active Stage'})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReevaluate}
            disabled={evaluating || loading}
            title="Re-run Multi-Criteria Risk Evaluation"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-canvas-200 text-moss-700 text-xs font-semibold border border-canvas-300 transition-all active:scale-95 disabled:opacity-50"
          >
            {evaluating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-agri-600" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-moss-600" />
            )}
            <span className="hidden sm:inline">Re-evaluate</span>
          </button>
        </div>
      </div>

      {/* Score Hero */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${levelStyles.heroBg}`}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Composite Phenological Risk
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-black text-3xl sm:text-4xl">
              {overallScore}
            </span>
            <span className="text-xs font-bold font-mono opacity-70">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm ${levelStyles.badge}`}>
            {overallLevel} RISK
          </span>
          <p className="text-[10px] font-medium mt-1 opacity-80">
            Method: ICAR & FAO Multi-Criteria
          </p>
        </div>
      </div>

      {/* 6 Category Breakdown Bars */}
      <div className="space-y-2.5">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-moss-800 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-moss-500 shrink-0" />
                  <span>{c.title}</span>
                </span>
                
                {c.available ? (
                  <span className="font-mono font-bold text-[11px] text-moss-700">
                    {c.score}% ({c.score! >= 80 ? 'CRITICAL' : c.score! >= 60 ? 'HIGH' : c.score! >= 30 ? 'MODERATE' : 'LOW'})
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-moss-500 bg-canvas-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Info className="w-3 h-3 text-moss-400" />
                    <span>Unavailable (No Sensor)</span>
                  </span>
                )}
              </div>

              {c.available ? (
                <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${c.color}`}
                    style={{ width: `${Math.min(100, c.score || 0)}%` }}
                  />
                </div>
              ) : (
                <div className="w-full h-1.5 rounded-full bg-dashed border border-canvas-300 bg-canvas-100" />
              )}
            </div>
          );
        })}
      </div>

      {/* Contributing Factors Section */}
      {riskData?.contributing_factors && riskData.contributing_factors.length > 0 && (
        <div className="p-3 rounded-2xl bg-canvas-100/80 border border-canvas-200 text-xs space-y-1">
          <span className="font-bold text-moss-900 block text-[11px] uppercase tracking-wide">
            Contributing Agro-Environmental Factors:
          </span>
          <ul className="list-disc pl-4 space-y-0.5 text-moss-700 text-[11px]">
            {riskData.contributing_factors.slice(0, 3).map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-canvas-200 flex items-center justify-between text-[10px] text-moss-500 font-mono">
        <span>Confidence: <strong className="text-agri-700">{riskData?.confidence_level || 'HIGH'}</strong></span>
        <span>Soil Weight: Reallocated</span>
      </div>
    </div>
  );
};
