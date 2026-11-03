import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Globe2, 
  ArrowLeft, 
  ArrowRight,
  Droplet,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Info,
  ListOrdered,
  FileCheck
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types/advisory';
import { 
  fetchLatestFarmAdvisory, 
  generateFarmAdvisory, 
  BackendAdvisory 
} from '../../services/api';

export const Step5Recommendation: React.FC = () => {
  const { 
    selectedLanguage, 
    setSelectedLanguage, 
    farmerName, 
    selectedCrop, 
    selectedLocation,
    setDemoStep 
  } = useAdvisory();
  const { selectedFarm, session } = useAuth();

  const [liveAdvisory, setLiveAdvisory] = useState<BackendAdvisory | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  // Localized fallback content
  const localizedContent = {
    en: {
      action: 'Delay irrigation for 24 hours.',
      why: 'Rain is likely in the next 24 hours and soil moisture is currently adequate. Irrigating now may cause waterlogging.',
      when: 'Reassess tomorrow morning.',
      risk: 'Possible waterlogging and root-zone nutrient loss.',
    },
    hi: {
      action: 'अगले 24 घंटे के लिए सिंचाई टालें।',
      why: 'अगले 24 घंटों में बारिश की पूरी संभावना है और मिट्टी में नमी पर्याप्त है। अभी पानी देने से खेत में जलभराव हो सकता है।',
      when: 'कल सुबह स्थिति का दोबारा आकलन करें।',
      risk: 'जलभराव और जड़ों से पोषक तत्वों का बहाव।',
    },
    mr: {
      action: 'पुढील २४ तास सिंचन पुढे ढकला.',
      why: 'पुढील २४ तासांत पाऊस पडण्याची दाट शक्यता असून जमिनीत ओलावा पुरेसा आहे. आता पाणी दिल्यास शेतात पाणी साचून पिकाचे नुकसान होऊ शकते.',
      when: 'उद्या सकाळी पुन्हा परिस्थिती तपासा.',
      risk: 'पाणी साचणे आणि मुळांमधील पोषक द्रव्ये वाहून जाण्याचा धोका.',
    },
    te: {
      action: '24 గంటల పాటు నీటిపారుదలని నిలిపివేయండి.',
      why: 'రాగల 24 గంటల్లో వర్షం కురిసే అవకాశం ఉంది మరియు నేలలో తగినంత తేమ ఉంది. ఇప్పుడు నీరు పెడితే నీరు నిలిచిపోయే ప్రమాదం ఉంది.',
      when: 'రేపు ఉదయం మళ్ళీ పరిశీలించండి.',
      risk: 'నీరు నిల్వ ఉండటం మరియు పోషకాలు కోల్పోవడం.',
    },
    sw: {
      action: 'Sitisha umwagiliaji kwa saa 24.',
      why: 'Mvua inatarajiwa ndani ya saa 24 zijazo na unyevu wa udongo unatosha. Kumwagilia sasa kunaweza kusababisha mafuriko ya mizizi.',
      when: 'Tathmini upya kesho asubuhi.',
      risk: 'Uwezekano wa mizizi kujaa maji na kupoteza virutubisho.',
    }
  };

  const current = localizedContent[selectedLanguage] || localizedContent.en;

  // Load live advisory from backend when farm or language changes
  useEffect(() => {
    let mounted = true;
    async function loadAdvisory() {
      if (!selectedFarm?.id || !session?.access_token) return;
      setLoading(true);
      try {
        const adv = await fetchLatestFarmAdvisory(
          selectedFarm.id,
          selectedLanguage,
          session.access_token
        );
        if (mounted) setLiveAdvisory(adv);
      } catch (err) {
        console.warn('Live advisory lookup fallback to preset:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAdvisory();
    return () => { mounted = false; };
  }, [selectedFarm?.id, selectedLanguage, session?.access_token]);

  const handleRegenerate = async () => {
    if (!selectedFarm?.id || !session?.access_token) return;
    setRegenerating(true);
    try {
      const adv = await generateFarmAdvisory(
        { farm_id: selectedFarm.id, language: selectedLanguage },
        session.access_token
      );
      setLiveAdvisory(adv);
    } catch (err) {
      console.warn('Regeneration error:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const actionText = liveAdvisory?.immediate_action || current.action;
  const whyText = liveAdvisory?.why_it_matters || current.why;
  const whenText = liveAdvisory?.recommended_timing || current.when;
  const riskText = liveAdvisory?.risk_if_ignored || current.risk;
  const impactText = liveAdvisory?.projected_impact || 'Saves ~3,200L irrigation water & protects flower blossoms';
  const confidenceScore = liveAdvisory?.confidence_pct || 94.0;
  const modelVer = liveAdvisory?.model_version || 'rules_v1+gemini-1.5-flash';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-canvas-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
              Step 5 of 6 • Core Intelligence Output
            </span>
            {liveAdvisory?.needs_expert_review && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                <span>Flagged for Expert Review</span>
              </span>
            )}
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Actionable Farm Recommendation
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Formulated for <strong className="text-moss-800">{farmerName}</strong> ({liveAdvisory?.crop_name || selectedCrop} in {selectedLocation.city}).
          </p>
        </div>

        {/* Dialect Switcher Pill & Regenerate Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-canvas-100 p-1 rounded-2xl border border-canvas-300">
            <Globe2 className="w-3.5 h-3.5 text-agri-700 ml-1.5" />
            <div className="flex items-center gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedLanguage === lang.code
                      ? 'bg-agri-700 text-white shadow-soft-sm'
                      : 'text-moss-700 hover:bg-canvas-200'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={regenerating || loading}
            title="Re-run AI Advisory Engine"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas-100 hover:bg-canvas-200 text-moss-800 text-xs font-bold border border-canvas-300 shadow-soft-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {regenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-agri-600" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-moss-600" />
            )}
            <span className="hidden md:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Main Hero Recommendation Card */}
      <div className="rounded-3xl bg-white border-2 border-agri-600 shadow-soft-lg p-6 sm:p-8 relative overflow-hidden">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-agri-600 animate-ping" />
            <h3 className="font-display font-black text-base sm:text-lg text-agri-950 tracking-wider uppercase">
              YOUR FARMER ADVISORY
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold bg-moss-100 text-moss-800 px-2.5 py-0.5 rounded-md border border-moss-300">
              {modelVer}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-agri-100/80 text-agri-900 px-3 py-1 rounded-full border border-agri-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-agri-700" />
              <span>{Math.round(confidenceScore)}% Confidence</span>
            </div>
          </div>
        </div>

        {/* Primary Action Banner */}
        <div className="my-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-agri-800 via-agri-700 to-moss-900 text-white shadow-soft">
          <div className="flex items-center gap-2 text-agri-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4 text-amber-300 fill-current" />
            <span>Recommended Action</span>
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-canvas-50 tracking-tight leading-snug">
            "{actionText}"
          </p>
        </div>

        {/* Structured 3-Section Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          
          {/* WHY? */}
          <div className="p-4 sm:p-5 rounded-2xl bg-canvas-100/80 border border-canvas-200">
            <div className="flex items-center gap-2 text-moss-700 text-xs font-extrabold uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-lg bg-agri-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>WHY?</span>
            </div>
            <p className="text-xs sm:text-sm text-moss-800 font-medium leading-relaxed">
              {whyText}
            </p>
          </div>

          {/* WHEN? */}
          <div className="p-4 sm:p-5 rounded-2xl bg-skyalt-50/70 border border-skyalt-200">
            <div className="flex items-center gap-2 text-skyalt-800 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-skyalt-600" />
              <span>WHEN?</span>
            </div>
            <p className="text-xs sm:text-sm text-moss-900 font-bold leading-relaxed">
              {whenText}
            </p>
            <div className="mt-2 text-[10px] font-mono text-skyalt-800 bg-white/80 px-2 py-0.5 rounded inline-block border border-skyalt-300">
              Optimal Execution Window
            </div>
          </div>

          {/* RISK IF IGNORED */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-extrabold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>RISK IF IGNORED</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed">
              {riskText}
            </p>
          </div>
        </div>

        {/* Implementation Action Steps (if available) */}
        {liveAdvisory?.action_steps && liveAdvisory.action_steps.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-canvas-50 border border-canvas-200">
            <div className="flex items-center gap-2 text-moss-900 text-xs font-bold uppercase tracking-wider mb-2.5">
              <ListOrdered className="w-4 h-4 text-agri-700" />
              <span>Field Action Steps</span>
            </div>
            <ol className="space-y-1.5 pl-4 list-decimal text-xs text-moss-800">
              {liveAdvisory.action_steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed font-medium">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Supporting Meteorological Evidence */}
        {liveAdvisory?.supporting_evidence && liveAdvisory.supporting_evidence.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-skyalt-50/50 border border-skyalt-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-skyalt-900">
              <FileCheck className="w-4 h-4 text-skyalt-700 shrink-0" />
              <span>Supporting Environmental Facts:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-skyalt-800">
              {liveAdvisory.supporting_evidence.map((ev, i) => (
                <span key={i} className="bg-white/80 px-2 py-0.5 rounded border border-skyalt-300">
                  {ev}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data Limitations Notice (e.g. soil sensor transparency) */}
        {liveAdvisory?.data_limitations && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span><strong>Data Limitation:</strong> {liveAdvisory.data_limitations}</span>
          </div>
        )}

        {/* Projected Value Metric Bar */}
        <div className="mt-6 pt-4 border-t border-canvas-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-agri-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-agri-600 shrink-0" />
            <span>Estimated Benefit: <strong>{impactText}</strong></span>
          </div>

          <span className="text-[11px] font-mono text-moss-500">
            Farmer: {farmerName} ({selectedLanguage.toUpperCase()})
          </span>
        </div>

        {/* Official Safety Disclaimer */}
        <div className="mt-4 pt-3 border-t border-canvas-200 text-[10px] text-moss-500 leading-normal">
          {liveAdvisory?.disclaimer || (
            "Notice: This advisory is an AI-assisted decision support recommendation based on meteorological models and agronomic principles. It is not a substitute for local agricultural extension consultation. Never apply chemical pesticides without consulting your local Krishi Vigyan Kendra (KVK) or extension officer."
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-canvas-200">
        <button
          type="button"
          onClick={() => setDemoStep(4)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Climate Data</span>
        </button>

        <button
          type="button"
          onClick={() => setDemoStep(6)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
        >
          <span>Continue to Step 6 — Last-Mile Delivery</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
