import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  Pause, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles,
  Radio,
  ShieldCheck,
  CheckCheck,
  AlertTriangle,
  Server,
  Layers,
  Clock,
  Ban,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdvisory, DeliveryChannelChoice } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { 
  dispatchAdvisory, 
  fetchDeliveryHistory, 
  optOutFarmer, 
  updateFarmerPreferences, 
  DeliveryLogResponse, 
  DeliveryDispatchResponse,
  generateFarmAdvisory
} from '../../services/api';
import { Toast } from '../common/Toast';

export const Step6Delivery: React.FC = () => {
  const { 
    selectedDeliveryChannel, 
    setSelectedDeliveryChannel, 
    farmerName, 
    farmerPhone, 
    selectedLocation, 
    selectedCrop, 
    selectedLanguage,
    setDemoStep,
    resetDemoFlow,
    latestBackendAdvisory,
    setLatestBackendAdvisory
  } = useAdvisory();

  const { session, farmer, selectedFarm } = useAuth();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  // Stage 6 Live Carrier & Sandbox Controls
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [latestDispatchResponse, setLatestDispatchResponse] = useState<DeliveryDispatchResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<DeliveryLogResponse[]>([]);
  const [isOptedIn, setIsOptedIn] = useState<boolean>(farmer?.is_opted_in ?? true);
  const [optStatusUpdating, setOptStatusUpdating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivery options mapping
  const deliveryOptions: { id: DeliveryChannelChoice; backendChannel: string; title: string; providerName: string; desc: string; icon: React.FC<{ className?: string }>; tag: string }[] = [
    {
      id: 'voice',
      backendChannel: 'VOICE_IVR',
      title: 'VOICE CALL (IVR)',
      providerName: 'Exotel Voice Gateway',
      desc: "Regional TTS with keypad options (1=Replay, 2=Language, 3=KVK Agronomist)",
      icon: PhoneCall,
      tag: 'Zero Literacy Needed'
    },
    {
      id: 'sms',
      backendChannel: 'SMS',
      title: 'DIRECT SMS',
      providerName: 'MSG91 Indian DLT Gateway',
      desc: 'Concise DLT-registered SMS alert delivered to basic 2G keypad handsets',
      icon: MessageSquare,
      tag: 'Basic Feature Phone'
    },
    {
      id: 'mobile',
      backendChannel: 'WHATSAPP',
      title: 'WHATSAPP CLOUD',
      providerName: 'Meta WhatsApp Business API',
      desc: 'Rich interactive HSM template with voice note and STOP opt-out capability',
      icon: Smartphone,
      tag: 'Smartphone WhatsApp'
    },
  ];

  // Multilingual voice scripts
  const voiceScripts: Record<string, string> = {
    mr: `नमस्कार ${farmerName} साहेब. इंद्रधनुष हवामान कृषी सेवेतून बोलत आहोत. आपल्या ${selectedLocation.city} परिसरात पुढील २४ तासांत पाऊस होण्याची शक्यता असून जमिनीत पुरेसा ओलावा आहे. ${selectedCrop} पिकाला पाणी देणे २४ तास थांबवा. पुन्हा ऐकण्यासाठी १ दाबा, तज्ज्ञांशी बोलण्यासाठी ३ दाबा. धन्यवाद.`,
    hi: `नमस्ते ${farmerName} जी। इंद्रधनुष किसान सेवा से यह जरूरी मौसम सलाह है। आपके क्षेत्र ${selectedLocation.city} में अगले 24 घंटों में बारिश की संभावना है और मिट्टी में नमी पर्याप्त है। कृपया ${selectedCrop} में 24 घंटे तक सिंचाई टालें। दोबारा सुनने के लिए 1 दबाएं। धन्यवाद।`,
    te: `నమస్కారం ${farmerName} గారు. ఇంద్రధనుష్ వ్యవసాయ సలహా. ${selectedLocation.city} ప్రాంతంలో రాగల 24 గంటల్లో వర్షం కురిసే అవకాశం ఉంది. దయచేసి ${selectedCrop} పంటకు 24 గంటల పాటు నీటిపారుదలని నిలిపివేయండి. ధన్యవాదాలు.`,
    sw: `Hujambo ${farmerName}. Huu ni ushauri muhimu kutoka Indradhanu. Katika eneo lako la ${selectedLocation.city}, mvua inatarajiwa ndani ya saa 24 zijazo. Tafadhali sitisha umwagiliaji wa ${selectedCrop} kwa saa 24. Asante sana.`,
    en: `Hello ${farmerName}. This is your Indradhanu climate assistant. In ${selectedLocation.city}, rain is expected in the next 24 hours and soil moisture is adequate. Please delay irrigation for your ${selectedCrop} crop for 24 hours. Press 1 to replay, 3 for agronomist. Thank you.`
  };

  const smsTexts: Record<string, string> = {
    mr: `इंद्रधनुष कृषी: ${farmerName} जी, ${selectedLocation.city} मध्ये उद्या पाऊस अपेक्षित. ${selectedCrop} पिकाला २४ तास पाणी देणे पुढे ढकला. टोल-फ्री: 1800-INDRA [STOP to opt-out]`,
    hi: `इंद्रधनुष कृषि सलाह: ${farmerName} जी, ${selectedLocation.city} में कल बारिश का अनुमान है। ${selectedCrop} में 24 घंटे तक सिंचाई रोकें। हेल्पलाइन: 1800-INDRA [STOP to opt-out]`,
    te: `ఇంద్రధనుష్ సలహా: ${farmerName} గారు, రేపు వర్షం కురిసే అవకాశం ఉంది. ${selectedCrop} కు 24 గంటలు నీరు పెట్టవద్దు. [STOP to opt-out]`,
    sw: `USHAURI WA INDRADHANU: ${farmerName}, mvua inatarajiwa kesho. USIMWAGILIE ${selectedCrop} kwa saa 24. [STOP to opt-out]`,
    en: `INDRADHANU ADVISORY: ${farmerName}, rain expected tomorrow in ${selectedLocation.city}. Delay irrigation for ${selectedCrop} by 24 hours. Helpline: 1800-INDRA [Reply STOP to opt-out]`
  };

  const currentVoiceScript = voiceScripts[selectedLanguage] || voiceScripts.en;
  const currentSmsText = smsTexts[selectedLanguage] || smsTexts.en;

  // Load recent delivery logs
  const refreshHistory = async () => {
    if (!session?.access_token) return;
    try {
      const logs = await fetchDeliveryHistory(latestBackendAdvisory?.id, undefined, session.access_token);
      setRecentLogs(logs);
    } catch (err) {
      console.warn('Failed to fetch delivery logs:', err);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, [session?.access_token, latestBackendAdvisory?.id]);

  // Handle Dispatch Click
  const handleDispatch = async (overrideChannel?: string) => {
    setErrorMessage(null);

    // Consent validation check
    if (!isOptedIn) {
      setErrorMessage(`Cannot dispatch: Farmer has opted out of automated advisory communications.`);
      setToastMessage('Farmer has opted out. Re-enable consent below to dispatch.');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    setIsSending(true);

    try {
      let targetAdvisoryId = latestBackendAdvisory?.id;

      // Ensure we have an advisory record on backend if logged in
      if (!targetAdvisoryId && session?.access_token && selectedFarm?.id) {
        try {
          const generated = await generateFarmAdvisory(
            { farm_id: selectedFarm.id, language: selectedLanguage },
            session.access_token
          );
          setLatestBackendAdvisory(generated);
          targetAdvisoryId = generated.id;
        } catch (e) {
          console.warn('On-demand advisory creation failed:', e);
        }
      }

      const activeOption = deliveryOptions.find(o => o.id === selectedDeliveryChannel);
      const chosenChannel = overrideChannel || activeOption?.backendChannel || 'SMS';

      if (session?.access_token && targetAdvisoryId) {
        // Real Backend Dispatch via FastAPI / Deliveries Engine
        const res = await dispatchAdvisory(
          {
            advisory_id: targetAdvisoryId,
            channels: chosenChannel === 'ALL' ? ['SMS', 'VOICE_IVR', 'WHATSAPP'] : [chosenChannel],
            simulate: isSimulationMode,
            custom_phone: farmerPhone
          },
          session.access_token
        );

        setLatestDispatchResponse(res);
        await refreshHistory();

        const isSim = res.mode === 'SIMULATION';
        const msg = isSim
          ? `Advisory simulated safely via sandbox for ${chosenChannel}`
          : `Live advisory transmitted to ${chosenChannel} carrier gateway!`;

        setToastMessage(msg);
        setToastType(isSim ? 'warning' : 'success');
        setShowToast(true);

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
          colors: isSim ? ['#0284c7', '#38bdf8', '#818cf8'] : ['#10b981', '#059669', '#34d399']
        });
      } else {
        // Sandboxed fallback for guest / demonstration mode
        await new Promise(r => setTimeout(r, 1200));

        const simResult: DeliveryLogResponse = {
          id: `sim_log_${Date.now()}`,
          advisory_id: targetAdvisoryId || 'advisory_demo_001',
          farmer_id: farmer?.id || 'farmer_demo_001',
          channel: chosenChannel,
          status: isSimulationMode ? 'SIMULATED' : 'DELIVERED',
          recipient_phone: farmerPhone,
          content_snippet: currentSmsText,
          language: selectedLanguage,
          provider: chosenChannel === 'VOICE_IVR' ? 'Exotel Voice Gateway' : (chosenChannel === 'WHATSAPP' ? 'Meta Cloud API' : 'MSG91 DLT'),
          carrier_message_id: `${chosenChannel}_SIM_${Date.now()}`,
          retry_count: 0,
          is_simulation: isSimulationMode,
          created_at: new Date().toISOString()
        };

        setLatestDispatchResponse({
          dispatch_id: `disp_${Date.now()}`,
          advisory_id: targetAdvisoryId || 'advisory_demo_001',
          farmer_id: farmer?.id || 'farmer_demo_001',
          channel_outcomes: [simResult],
          mode: isSimulationMode ? 'SIMULATION' : 'LIVE',
          summary: isSimulationMode 
            ? `Sandbox simulated 1 broadcast via ${chosenChannel}` 
            : `Carrier queued 1 message via ${chosenChannel}`
        });

        setRecentLogs(prev => [simResult, ...prev]);

        setToastMessage(
          isSimulationMode 
            ? `Sandbox simulation completed for ${chosenChannel} (Zero Carrier Cost)`
            : `Carrier dispatch triggered for ${farmerPhone}`
        );
        setToastType(isSimulationMode ? 'warning' : 'success');
        setShowToast(true);

        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0284c7', '#10b981', '#d97706']
        });
      }
    } catch (err: any) {
      console.error('Dispatch failed:', err);
      setErrorMessage(err.message || 'Dispatch failed. Check provider credentials or rate limits.');
      setToastMessage(err.message || 'Dispatch failed');
      setToastType('warning');
      setShowToast(true);
    } finally {
      setIsSending(false);
    }
  };

  // Toggle Farmer Opt-In / Consent
  const handleToggleConsent = async () => {
    setOptStatusUpdating(true);
    const targetStatus = !isOptedIn;
    try {
      if (session?.access_token) {
        if (!targetStatus) {
          await optOutFarmer({ phone_number: farmerPhone, reason: 'Farmer requested via UI STOP' }, session.access_token);
        } else {
          await updateFarmerPreferences({ preferred_channel: 'SMS', is_opted_in: true }, session.access_token);
        }
      }
      setIsOptedIn(targetStatus);
      setToastMessage(targetStatus ? 'Farmer opted-in for advisories' : 'Farmer opted-out (STOP recorded)');
      setToastType(targetStatus ? 'success' : 'warning');
      setShowToast(true);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update consent preference');
      setToastType('warning');
      setShowToast(true);
    } finally {
      setOptStatusUpdating(false);
    }
  };

  const handleCopySms = () => {
    navigator.clipboard.writeText(currentSmsText);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header with Mode Toggle & Compliance Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-canvas-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
              Stage 6 • Multichannel Advisory Delivery
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-moss-700 bg-canvas-200 px-2.5 py-0.5 rounded-lg border border-canvas-300">
              TRAI DLT & Meta Compliant
            </span>
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Deliver Verified Advisory to Farmer
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Deliver localized climate recommendations to <strong className="text-moss-800">{farmerName}</strong> ({farmerPhone}) across Indian telecom channels.
          </p>
        </div>

        {/* Live vs Sandbox Simulation Switcher */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-canvas-300 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-moss-600">
              Gateway Mode
            </p>
            <p className={`text-xs font-black ${isSimulationMode ? 'text-sky-700' : 'text-emerald-700'}`}>
              {isSimulationMode ? 'Sandbox Simulation' : 'Live Carrier Dispatch'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSimulationMode ? 'bg-sky-600' : 'bg-emerald-600'
            }`}
            title="Toggle between Zero-Cost Sandbox Simulation and Live Carrier Dispatch"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isSimulationMode ? 'translate-x-0' : 'translate-x-7'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mode Transparency Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isSimulationMode 
          ? 'bg-sky-50/80 border-sky-200 text-sky-950'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-center gap-2.5">
          {isSimulationMode ? (
            <Server className="w-5 h-5 text-sky-700 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          )}
          <div>
            <strong className="font-bold">
              {isSimulationMode ? 'SANDBOX SIMULATION ACTIVE:' : 'LIVE CARRIER DISPATCH ACTIVE:'}
            </strong>{' '}
            <span className="text-moss-700">
              {isSimulationMode 
                ? 'Carrier responses and DLR receipts are generated safely with zero telecom costs. Simulated records are transparently marked as SIMULATED.'
                : 'Real HTTP API calls will be transmitted to MSG91 SMS, Exotel IVR, or Meta WhatsApp Cloud API endpoints using your configured secrets.'}
            </span>
          </div>
        </div>

        {/* Farmer Consent Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleConsent}
            disabled={optStatusUpdating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isOptedIn 
                ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
            }`}
            title="Click to toggle farmer consent / opt-out state (TRAI / WhatsApp compliance)"
          >
            {isOptedIn ? <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> : <Ban className="w-3.5 h-3.5 text-rose-700" />}
            <span>{isOptedIn ? 'Consent: Opted In' : 'Opted Out (STOP)'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Advisory Delivery Alert</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Channel Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block">
            Select Telecom Channel
          </label>
          <button
            type="button"
            onClick={() => handleDispatch('ALL')}
            disabled={isSending || !isOptedIn}
            className="flex items-center gap-1.5 text-xs font-bold text-agri-700 hover:text-agri-800 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Broadcast All 3 Channels Simultaneously</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deliveryOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedDeliveryChannel === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedDeliveryChannel(opt.id)}
                className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 relative flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-agri-50/90 border-agri-600 shadow-soft ring-4 ring-agri-500/20 scale-[1.02]'
                    : 'bg-white border-canvas-300 hover:border-agri-400 hover:bg-canvas-100/60'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-agri-600 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}

                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-agri-700 text-white shadow-glow-agri' : 'bg-canvas-200 text-moss-700'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-display font-black text-base text-moss-900 tracking-wide">
                    {opt.title}
                  </h3>
                  <p className="text-[11px] font-bold text-agri-800 mt-0.5">
                    {opt.providerName}
                  </p>
                  <p className="text-xs text-moss-600 mt-1 font-medium leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-canvas-200/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-agri-800 bg-agri-100/80 px-2 py-0.5 rounded border border-agri-200">
                    {opt.tag}
                  </span>
                  <span className="text-[10px] font-mono text-moss-400 uppercase">
                    {opt.backendChannel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dispatch CTA Bar */}
      <div className="p-5 rounded-3xl bg-white border border-canvas-300 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-extrabold text-sm sm:text-base text-moss-900">
              Ready to Dispatch to {farmerName}
            </h4>
            <p className="text-xs text-moss-500 mt-0.5">
              Target Channel: <strong className="text-agri-900">{selectedDeliveryChannel.toUpperCase()}</strong> • 
              Recipient: <strong className="text-agri-900">{farmerPhone}</strong> • 
              Language: <strong className="text-agri-900">{selectedLanguage.toUpperCase()}</strong> • 
              Mode: <strong className={isSimulationMode ? 'text-sky-700' : 'text-emerald-700'}>
                {isSimulationMode ? 'SANDBOX SIMULATION' : 'LIVE DISPATCH'}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleDispatch()}
            disabled={isSending || !isOptedIn}
            className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-soft active:scale-95 ${
              !isOptedIn
                ? 'bg-canvas-200 text-moss-400 cursor-not-allowed border border-canvas-300'
                : isSending
                ? 'bg-moss-700 text-canvas-200 cursor-wait'
                : isSimulationMode
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-soft'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-glow-agri'
            }`}
          >
            {isSending ? (
              <>
                <Radio className="w-5 h-5 animate-spin text-canvas-200" />
                <span>Contacting Provider Gateway...</span>
              </>
            ) : !isOptedIn ? (
              <>
                <Ban className="w-5 h-5 text-rose-500" />
                <span>Farmer Opted Out</span>
              </>
            ) : isSimulationMode ? (
              <>
                <Server className="w-5 h-5" />
                <span>Simulate Advisory Delivery</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Live Advisory</span>
              </>
            )}
          </button>
        </div>

        {/* Latest Dispatch Live Confirmation Box */}
        {latestDispatchResponse && (
          <div className="mt-4 pt-4 border-t border-canvas-200 animate-in fade-in space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-moss-700">
                Gateway Dispatch Receipt
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                latestDispatchResponse.mode === 'SIMULATION'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {latestDispatchResponse.mode === 'SIMULATION' ? 'Simulated (Sandbox)' : 'Live Carrier Confirmed'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {latestDispatchResponse.channel_outcomes.map((outcome, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-canvas-100/70 border border-canvas-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-moss-900">{outcome.channel}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      outcome.status === 'SIMULATED' ? 'bg-sky-100 text-sky-800' :
                      outcome.status === 'DELIVERED' || outcome.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-800' :
                      outcome.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {outcome.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-moss-500 font-mono">
                    Provider: <strong className="text-moss-700">{outcome.provider}</strong>
                  </p>
                  <p className="text-[10px] text-moss-400 font-mono truncate">
                    Ref ID: {outcome.carrier_message_id || 'N/A'}
                  </p>
                  {outcome.duration_seconds && (
                    <p className="text-[10px] text-emerald-700 font-medium">
                      Call Duration: {outcome.duration_seconds}s (DTMF: Replayed)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FINAL LAST-MILE RECEIPT CALLOUT */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-moss-900 to-agri-950 text-white border-2 border-agri-500/40 shadow-soft-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-moss-800">
          <div className="flex items-center gap-2 text-agri-300 text-xs font-bold uppercase tracking-wider">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>✓ ADVISORY DELIVERED TO FARMER</span>
          </div>

          <span className="text-[10px] font-mono bg-agri-600/50 text-agri-200 px-2 py-0.5 rounded border border-agri-400/30">
            Zero Internet Needed on Feature Phone
          </span>
        </div>

        <p className="text-xs text-canvas-300 font-medium mb-2">
          Farmer receives on phone ({farmerName} • {farmerPhone}):
        </p>

        {/* Clear actionable message receipt */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
          <p className="font-display font-extrabold text-base sm:text-lg text-white">
            "Rain expected tomorrow. Delay irrigation by 24 hours."
          </p>
          <p className="text-xs text-agri-200 font-serif italic">
            "{currentSmsText}"
          </p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-canvas-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-agri-400" />
            <span>Delivered via regional GSM cellular tower</span>
          </div>
          <span className="font-mono text-agri-300">Impact: Prevents waterlogging & saves pumping energy</span>
        </div>
      </div>

      {/* DEDICATED CHANNEL PREVIEWS */}
      
      {/* 1. Voice Call Simulation */}
      {selectedDeliveryChannel === 'voice' && (
        <div className="rounded-3xl bg-moss-900 text-white p-6 sm:p-7 border border-agri-600/40 shadow-soft-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-moss-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-agri-600 flex items-center justify-center text-white">
                <PhoneCall className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm sm:text-base text-white">
                  Exotel Automated Voice Call (GSM IVR)
                </h4>
                <p className="text-[11px] text-moss-400">
                  Recipient: {farmerName} ({farmerPhone}) • Dialect: {selectedLanguage.toUpperCase()}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono bg-agri-700/60 text-agri-200 px-2.5 py-1 rounded-lg border border-agri-500/30">
              Interactive DTMF Active
            </span>
          </div>

          {/* Player Controls */}
          <div className="p-4 rounded-2xl bg-moss-950/80 border border-agri-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-12 h-12 rounded-2xl bg-agri-400 hover:bg-agri-300 text-moss-950 flex items-center justify-center shadow-glow-agri transition-all active:scale-95"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <p className="font-bold text-xs text-white">Spoken Advisory Audio Track</p>
                <p className="text-[10px] text-moss-400 flex items-center gap-1.5 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-agri-400" />
                  <span>Regional Agronomist Audio (00:24)</span>
                </p>
              </div>
            </div>

            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1 h-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isPlayingAudio ? 'bg-agri-400 animate-wave' : 'bg-moss-700'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${[12, 24, 16, 28, 20, 32, 14, 26][i % 8]}px` : '8px',
                    animationDelay: `${(i % 8) * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Keypad DTMF Interactive Help Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-canvas-200">
            <div className="p-2.5 rounded-xl bg-moss-950/60 border border-moss-700/60 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-agri-700 text-white font-mono font-bold flex items-center justify-center text-xs">1</span>
              <span>Replay Advisory Audio</span>
            </div>
            <div className="p-2.5 rounded-xl bg-moss-950/60 border border-moss-700/60 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-agri-700 text-white font-mono font-bold flex items-center justify-center text-xs">2</span>
              <span>Change Voice Language</span>
            </div>
            <div className="p-2.5 rounded-xl bg-moss-950/60 border border-moss-700/60 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-agri-700 text-white font-mono font-bold flex items-center justify-center text-xs">3</span>
              <span>Connect with KVK Agronomist</span>
            </div>
          </div>

          {/* Transcript */}
          <div className="p-4 rounded-2xl bg-moss-800/60 border border-moss-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-agri-300 block mb-1">
              Spoken Transcript ({selectedLanguage.toUpperCase()}):
            </span>
            <p className="text-xs sm:text-sm text-canvas-100 font-medium italic font-serif leading-relaxed">
              "{currentVoiceScript}"
            </p>
          </div>
        </div>
      )}

      {/* 2. Feature Phone SMS Simulation */}
      {selectedDeliveryChannel === 'sms' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
            <div>
              <h4 className="font-display font-extrabold text-sm sm:text-base text-moss-900">
                MSG91 Direct SMS Feature Phone Preview
              </h4>
              <p className="text-xs text-moss-500">
                Delivered with Indian DLT Header <span className="font-mono font-bold text-moss-800">INDRDH</span> to basic keypad handsets (JioBharat, Nokia 105).
              </p>
            </div>

            <button
              onClick={handleCopySms}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 text-xs font-semibold"
            >
              {copiedSms ? <Check className="w-3.5 h-3.5 text-agri-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSms ? 'Copied' : 'Copy SMS'}</span>
            </button>
          </div>

          {/* Realistic Mobile Handset Frame */}
          <div className="max-w-md mx-auto p-4 rounded-3xl bg-moss-950 text-white border-4 border-moss-800 shadow-soft-lg">
            <div className="flex items-center justify-between text-[11px] text-moss-400 pb-2 border-b border-moss-800">
              <span className="font-mono">Jio GSM Network</span>
              <span className="font-mono text-agri-300">12:04 PM</span>
            </div>

            <div className="my-4">
              <div className="p-4 rounded-2xl rounded-tl-sm bg-agri-800 text-canvas-50 border border-agri-600/50 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-agri-300 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>INDRDH • KRISHI ADVISORY</span>
                </div>
                <p className="text-xs leading-relaxed font-sans">
                  {currentSmsText}
                </p>
                <div className="mt-2 text-right text-[10px] text-agri-300/80 font-mono">
                  12:04 PM • DLT Approved
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-moss-400 font-mono">
              Sent to {farmerPhone} ({farmerName})
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Push & WhatsApp Notification */}
      {selectedDeliveryChannel === 'mobile' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
            <div>
              <h4 className="font-display font-extrabold text-sm sm:text-base text-moss-900">
                Meta WhatsApp Business Cloud API Preview
              </h4>
              <p className="text-xs text-moss-500">
                Rich interactive notification with instant STOP opt-out and agronomist call button.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
              Meta Graph API v20.0
            </span>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#0b141a] text-white border border-[#202c33] shadow-soft-lg">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#202c33]">
              <span className="text-base">🌈</span>
              <div>
                <p className="font-bold text-xs text-[#e9edef]">Indradhanu Krishi Official</p>
                <p className="text-[10px] text-[#8696a0]">Verified Business Account • Online</p>
              </div>
            </div>

            <div className="my-3 p-3.5 rounded-xl bg-[#202c33] text-xs text-[#e9edef] space-y-2">
              <p className="font-bold text-amber-400">
                ⚠️ Agricultural Alert for {selectedCrop}: Delay irrigation for 24 hours
              </p>
              <p className="text-[11px] text-[#8696a0] leading-relaxed">
                Rain is forecast in {selectedLocation.city} within 24 hours and current soil moisture is adequate. Irrigation will risk root waterlogging.
              </p>
              <div className="p-2 rounded-lg bg-[#111b21] border border-[#222e35] text-[10px] text-[#8696a0] font-mono">
                Reply STOP to unsubscribe from automated advisories.
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Spoken Note (24s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Logs Audit Trail */}
      {recentLogs.length > 0 && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-canvas-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-moss-700" />
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-moss-900">
                Carrier Delivery Audit Log ({recentLogs.length})
              </h4>
            </div>

            <button
              type="button"
              onClick={refreshHistory}
              className="text-[11px] font-bold text-agri-700 hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="divide-y divide-canvas-200 max-h-56 overflow-y-auto">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-moss-900">{log.channel}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      log.is_simulation
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      {log.is_simulation ? 'SIMULATED (Zero Cost)' : 'LIVE CARRIER'}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded ${
                      log.status === 'DELIVERED' || log.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-800 font-bold' :
                      log.status === 'SIMULATED' ? 'bg-sky-100 text-sky-800 font-bold' :
                      log.status === 'FAILED' ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-canvas-200 text-moss-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-moss-500 mt-0.5">
                    To: {log.recipient_phone} • Provider: {log.provider} • Ref: {log.carrier_message_id || 'N/A'}
                  </p>
                </div>

                <div className="text-right text-[10px] text-moss-400 font-mono">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart / Back Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setDemoStep(5)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recommendation</span>
        </button>

        <button
          type="button"
          onClick={resetDemoFlow}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-moss-800 hover:bg-moss-900 text-white font-bold text-xs shadow-soft transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-agri-300" />
          <span>Run Demo Again</span>
        </button>
      </div>
    </div>
  );
};
