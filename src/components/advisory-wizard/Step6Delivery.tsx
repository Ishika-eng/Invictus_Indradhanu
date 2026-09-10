import React, { useState } from 'react';
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
  Clock,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdvisory, DeliveryChannelChoice } from '../../context/AdvisoryContext';
import { Toast } from '../common/Toast';

export const Step6Delivery: React.FC = () => {
  const { 
    selectedDeliveryChannel, 
    setSelectedDeliveryChannel, 
    deliveryState, 
    sendAdvisoryDelivery, 
    farmerName, 
    farmerPhone, 
    selectedLocation, 
    selectedCrop, 
    selectedLanguage,
    setDemoStep,
    resetDemoFlow,
    setActiveTab
  } = useAdvisory();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const deliveryOptions: { id: DeliveryChannelChoice; title: string; desc: string; icon: React.FC<{ className?: string }>; tag: string }[] = [
    {
      id: 'voice',
      title: 'VOICE CALL',
      desc: "Read the advisory in the farmer's language",
      icon: PhoneCall,
      tag: 'Zero Literacy Needed'
    },
    {
      id: 'sms',
      title: 'SMS',
      desc: 'Send a short advisory',
      icon: MessageSquare,
      tag: 'Basic Feature Phone'
    },
    {
      id: 'mobile',
      title: 'MOBILE',
      desc: 'Send to the farmer app',
      icon: Smartphone,
      tag: 'Farmer Smartphone / WA'
    },
  ];

  // Multilingual voice scripts
  const voiceScripts = {
    mr: `नमस्कार ${farmerName} साहेब. इंद्रधनुष हवामान कृषी सेवेतून बोलत आहोत. आपल्या ${selectedLocation.city} परिसरात पुढील २४ तासांत पाऊस होण्याची शक्यता असून जमिनीत पुरेसा ओलावा आहे. ${selectedCrop} पिकाला पाणी देणे २४ तास थांबवा. उद्या सकाळी पुन्हा परिस्थिती तपासा. धन्यवाद.`,
    hi: `नमस्ते ${farmerName} जी। इंद्रधनुष किसान सेवा से यह जरूरी मौसम सलाह है। आपके क्षेत्र ${selectedLocation.city} में अगले 24 घंटों में बारिश की संभावना है और मिट्टी में नमी पर्याप्त है। कृपया ${selectedCrop} में 24 घंटे तक सिंचाई टालें। धन्यवाद।`,
    te: `నమస్కారం ${farmerName} గారు. ఇంద్రధనుష్ వ్యవసాయ సలహా. ${selectedLocation.city} ప్రాంతంలో రాగల 24 గంటల్లో వర్షం కురిసే అవకాశం ఉంది. దయచేసి ${selectedCrop} పంటకు 24 గంటల పాటు నీటిపారుదలని నిలిపివేయండి. ధన్యవాదాలు.`,
    sw: `Hujambo ${farmerName}. Huu ni ushauri muhimu kutoka Indradhanu. Katika eneo lako la ${selectedLocation.city}, mvua inatarajiwa ndani ya saa 24 zijazo. Tafadhali sitisha umwagiliaji wa ${selectedCrop} kwa saa 24. Asante sana.`,
    en: `Hello ${farmerName}. This is your Indradhanu climate assistant. In ${selectedLocation.city}, rain is expected in the next 24 hours and soil moisture is adequate. Please delay irrigation for your ${selectedCrop} crop for 24 hours. Reassess tomorrow morning. Thank you.`
  };

  const smsTexts = {
    mr: `इंद्रधनुष कृषी: ${farmerName} जी, ${selectedLocation.city} मध्ये उद्या पाऊस अपेक्षित. ${selectedCrop} पिकाला २४ तास पाणी देणे पुढे ढकला. टोल-फ्री: 1800-INDRA`,
    hi: `इंद्रधनुष कृषि सलाह: ${farmerName} जी, ${selectedLocation.city} में कल बारिश का अनुमान है। ${selectedCrop} में 24 घंटे तक सिंचाई रोकें। हेल्पलाइन: 1800-INDRA`,
    te: `ఇంద్రధనుష్ సలహా: ${farmerName} గారు, రేపు వర్షం కురిసే అవకాశం ఉంది. ${selectedCrop} కు 24 గంటలు నీరు పెట్టవద్దు.`,
    sw: `USHAURI WA INDRADHANU: ${farmerName}, mvua inatarajiwa kesho. USIMWAGILIE ${selectedCrop} kwa saa 24.`,
    en: `INDRADHANU ADVISORY: ${farmerName}, rain expected tomorrow in ${selectedLocation.city}. Delay irrigation for ${selectedCrop} by 24 hours. Helpline: 1800-INDRA`
  };

  const currentVoiceScript = voiceScripts[selectedLanguage] || voiceScripts.en;
  const currentSmsText = smsTexts[selectedLanguage] || smsTexts.en;

  const handleSendClick = async () => {
    await sendAdvisoryDelivery();
    setShowToast(true);
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.8 },
        colors: ['#52B788', '#2D6A4F', '#DDA15E', '#0284C7']
      });
    } catch (e) {
      // safe fallback
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
          message={`Advisory successfully dispatched to ${farmerName} via ${selectedDeliveryChannel.toUpperCase()}`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200">
            Step 6 of 6 • Last-Mile Delivery
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-moss-900 tracking-tight mt-1">
            Deliver Advisory to Farmer
          </h2>
          <p className="text-xs text-moss-500 mt-0.5">
            Deliver the localized advice directly to {farmerName} ({farmerPhone}) in their native dialect.
          </p>
        </div>
      </div>

      {/* "How should we reach the farmer?" Question & 3 Large Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block">
          How should we reach the farmer?
        </label>

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
                  <p className="text-xs text-moss-600 mt-1 font-medium leading-relaxed">
                    "{opt.desc}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-canvas-200/80">
                  <span className="text-[10px] font-bold text-agri-800 bg-agri-100/80 px-2 py-0.5 rounded border border-agri-200">
                    {opt.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Send Advisory CTA Button */}
      <div className="p-5 rounded-3xl bg-white border border-canvas-300 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-extrabold text-sm sm:text-base text-moss-900">
              Ready to Dispatch to {farmerName}
            </h4>
            <p className="text-xs text-moss-500">
              Target Channel: <strong className="text-agri-900">{selectedDeliveryChannel.toUpperCase()}</strong> • Recipient: <strong className="text-agri-900">{farmerPhone}</strong> • Language: <strong className="text-agri-900">{selectedLanguage.toUpperCase()}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendClick}
            disabled={deliveryState === 'sending'}
            className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-soft active:scale-95 ${
              deliveryState === 'delivered'
                ? 'bg-emerald-600 text-white shadow-glow-agri'
                : deliveryState === 'sending'
                ? 'bg-moss-700 text-canvas-200 cursor-wait'
                : 'bg-agri-700 hover:bg-agri-800 text-white hover:shadow-glow-agri'
            }`}
          >
            {deliveryState === 'delivered' ? (
              <>
                <CheckCheck className="w-5 h-5 text-emerald-200" />
                <span>Advisory Delivered!</span>
              </>
            ) : deliveryState === 'sending' ? (
              <>
                <Radio className="w-5 h-5 animate-spin text-agri-300" />
                <span>Transmitting via Carrier...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Advisory</span>
              </>
            )}
          </button>
        </div>

        {/* Delivery Progression Checklist */}
        {(deliveryState === 'sending' || deliveryState === 'delivered') && (
          <div className="mt-4 pt-4 border-t border-canvas-200 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-agri-50 border border-agri-200 flex items-center gap-2 text-agri-950 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ Advisory generated</span>
              </div>

              <div className="p-2.5 rounded-xl bg-agri-50 border border-agri-200 flex items-center gap-2 text-agri-950 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ Translated to {selectedLanguage.toUpperCase()}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold ${
                deliveryState === 'delivered' ? 'bg-agri-50 border-agri-200 text-agri-950' : 'bg-canvas-100 border-canvas-200 text-moss-500'
              }`}>
                {deliveryState === 'delivered' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 text-agri-600 animate-pulse shrink-0" />
                )}
                <span>{deliveryState === 'delivered' ? '✓ Sent to farmer' : 'Transmitting payload...'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FINAL LAST-MILE RECEIPT CALLOUT (Crucial for presentation demo) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-moss-900 to-agri-950 text-white border-2 border-agri-500/40 shadow-soft-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-moss-800">
          <div className="flex items-center gap-2 text-agri-300 text-xs font-bold uppercase tracking-wider">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>✓ ADVISORY DELIVERED TO FARMER</span>
          </div>

          <span className="text-[10px] font-mono bg-agri-600/50 text-agri-200 px-2 py-0.5 rounded border border-agri-400/30">
            Zero Internet Needed
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
          <span className="font-mono text-agri-300">Impact: ~3,200L water saved</span>
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
                  Automated Voice Call (GSM IVR)
                </h4>
                <p className="text-[11px] text-moss-400">
                  Recipient: {farmerName} ({farmerPhone}) • Dialect: {selectedLanguage.toUpperCase()}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono bg-agri-700/60 text-agri-200 px-2.5 py-1 rounded-lg border border-agri-500/30">
              Call Active
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
                <p className="font-bold text-xs text-white">Spoken Advisory Voice Note</p>
                <p className="text-[10px] text-moss-400 flex items-center gap-1.5 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-agri-400" />
                  <span>Regional Agronomist Audio Track (00:24)</span>
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
                Direct SMS Feature Phone Preview
              </h4>
              <p className="text-xs text-moss-500">
                Delivered without internet to basic keypad handsets (JioBharat, Nokia 105).
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
              <span>Jio GSM Network</span>
              <span className="font-mono text-agri-300">12:04 PM</span>
            </div>

            <div className="my-4">
              <div className="p-4 rounded-2xl rounded-tl-sm bg-agri-800 text-canvas-50 border border-agri-600/50 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-agri-300 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>INDRADHANU KRISHI</span>
                </div>
                <p className="text-xs leading-relaxed font-sans">
                  {currentSmsText}
                </p>
                <div className="mt-2 text-right text-[10px] text-agri-300/80 font-mono">
                  12:04 PM • Delivered
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-moss-400 font-mono">
              Sent to {farmerPhone} ({farmerName})
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Push / App Card */}
      {selectedDeliveryChannel === 'mobile' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
            <div>
              <h4 className="font-display font-extrabold text-sm sm:text-base text-moss-900">
                Mobile Push & WhatsApp Notification
              </h4>
              <p className="text-xs text-moss-500">
                Rich interactive notification delivered to smartphone or WhatsApp.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
              Push Active
            </span>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#0b141a] text-white border border-[#202c33] shadow-soft-lg">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#202c33]">
              <span className="text-base">🌈</span>
              <div>
                <p className="font-bold text-xs text-[#e9edef]">Indradhanu Kisan Notification</p>
                <p className="text-[10px] text-[#8696a0]">Weather Advisory • Just now</p>
              </div>
            </div>

            <div className="my-3 p-3 rounded-xl bg-[#202c33] text-xs text-[#e9edef] space-y-2">
              <p className="font-bold text-amber-400">
                ⚠️ Advisory for {selectedCrop}: Delay irrigation for 24h
              </p>
              <p className="text-[11px] text-[#8696a0] leading-relaxed">
                Rain is likely in {selectedLocation.city} within 24h. Reassess tomorrow morning.
              </p>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 py-1.5 rounded-lg bg-agri-700 hover:bg-agri-600 text-white text-[11px] font-bold text-center">
                  Listen to Audio (24s)
                </button>
              </div>
            </div>
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
