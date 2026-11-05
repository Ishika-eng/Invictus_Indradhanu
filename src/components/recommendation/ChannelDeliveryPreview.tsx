import React, { useState } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  Copy, 
  Check, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { VoiceCallSimulator } from './VoiceCallSimulator';

export const ChannelDeliveryPreview: React.FC = () => {
  const { 
    activeAdvisory, 
    selectedLanguage, 
    selectedFarmer, 
    farmerName,
    farmerPhone,
    isSimulatingDispatch, 
    dispatchSuccess, 
    triggerLiveDispatch 
  } = useAdvisory();
  const { farmer } = useAuth();

  const recipientName = farmer?.full_name || farmerName || selectedFarmer.name;
  const recipientPhone = farmer?.phone_number || farmerPhone || selectedFarmer.phone;
  const activeLang = (farmer?.preferred_language && ['mr', 'hi', 'te', 'sw', 'en'].includes(farmer.preferred_language)
    ? farmer.preferred_language
    : selectedLanguage) as 'mr' | 'hi' | 'te' | 'sw' | 'en';

  const [activeChannelTab, setActiveChannelTab] = useState<'voice' | 'sms' | 'whatsapp'>('voice');
  const [copied, setCopied] = useState(false);

  // Active translation SMS text
  const currentSmsBody = activeAdvisory.translations[activeLang]?.smsBody || activeAdvisory.translations[selectedLanguage]?.smsBody || activeAdvisory.translations.en.smsBody;

  const handleCopySms = () => {
    navigator.clipboard.writeText(currentSmsBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = (channel: 'sms' | 'voice' | 'all') => {
    triggerLiveDispatch(channel);
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#52B788', '#2D6A4F', '#DDA15E', '#0284C7']
      });
    } catch (e) {
      // safe fallback
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Channel Tabs & Dispatch Trigger Button */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-canvas-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-agri-100 text-agri-800">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
                Smallholder Multi-Channel Delivery Engine
              </h3>
            </div>
            <p className="text-xs text-moss-500 mt-0.5">
              Simulate actual transmission across rural 2G/4G GSM voice networks, SMS, and messaging
            </p>
          </div>

          {/* Quick Dispatch Live Button */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => handleDispatch('all')}
              disabled={isSimulatingDispatch}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-soft active:scale-95 ${
                dispatchSuccess
                  ? 'bg-emerald-600 text-white shadow-glow-agri'
                  : isSimulatingDispatch
                  ? 'bg-moss-700 text-canvas-200 cursor-wait'
                  : 'bg-agri-700 hover:bg-agri-800 text-white hover:shadow-glow-agri'
              }`}
            >
              {dispatchSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Broadcast Dispatched!</span>
                </>
              ) : isSimulatingDispatch ? (
                <>
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Transmitting via Carrier...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simulate All-Channel Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Channel Switcher Tabs */}
        <div className="flex items-center gap-2 pt-4">
          {[
            { id: 'voice' as const, label: 'Voice IVR Call (Simulated)', icon: PhoneCall, count: 'Interactive Waveform' },
            { id: 'sms' as const, label: 'Feature Phone SMS', icon: MessageSquare, count: `${currentSmsBody.length} Chars` },
            { id: 'whatsapp' as const, label: 'WhatsApp / Push Card', icon: Smartphone, count: 'Rich Card' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeChannelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChannelTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  isActive
                    ? 'bg-agri-700 text-white border-agri-700 shadow-soft'
                    : 'bg-canvas-100 text-moss-700 border-canvas-300 hover:bg-canvas-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md hidden md:inline font-mono ${
                  isActive ? 'bg-agri-600 text-agri-100' : 'bg-canvas-200 text-moss-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Voice Call Simulator */}
      {activeChannelTab === 'voice' && (
        <VoiceCallSimulator />
      )}

      {/* Tab 2: Feature Phone SMS Preview */}
      {activeChannelTab === 'sms' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h4 className="font-display font-extrabold text-base text-moss-900">
                Direct GSM SMS Payload ({selectedLanguage.toUpperCase()} Dialect)
              </h4>
              <p className="text-xs text-moss-500 mt-0.5">
                Optimized for basic keypad feature phones (Nokia 105, JioBharat) with zero internet dependency.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono text-moss-600 bg-canvas-100 px-2.5 py-1 rounded-xl border border-canvas-300">
                1 GSM-7 Segment ({currentSmsBody.length}/160)
              </span>
              <button
                onClick={handleCopySms}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-moss-800 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-agri-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SMS'}</span>
              </button>
            </div>
          </div>

          {/* Realistic Mobile Device Phone Frame */}
          <div className="max-w-md mx-auto p-4 sm:p-5 rounded-3xl bg-canvas-900 bg-moss-950 text-white border-4 border-moss-800 shadow-soft-lg">
            
            {/* Phone Screen Header */}
            <div className="flex items-center justify-between text-[11px] text-moss-400 pb-3 border-b border-moss-800">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">4G Jio / Airtel</span>
                <span>•</span>
                <span className="text-[10px]">Indradhanu-Alert</span>
              </div>
              <span className="font-mono text-agri-300">12:04 PM</span>
            </div>

            {/* Message Bubble Container */}
            <div className="my-6 space-y-3">
              <div className="text-center text-[10px] text-moss-500 font-mono">
                Today • SMS Broadcast
              </div>

              {/* SMS Message Bubble */}
              <div className="p-4 rounded-2xl rounded-tl-sm bg-agri-800 text-canvas-50 border border-agri-600/50 shadow-md">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-agri-300 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>INDRADHANU KRISHI ADVISORY</span>
                </div>
                <p className="text-xs sm:text-sm font-sans leading-relaxed">
                  {currentSmsBody}
                </p>
                <div className="mt-2 text-right text-[10px] text-agri-300/80 font-mono flex items-center justify-end gap-1">
                  <span>12:04 PM</span>
                  <CheckCircle2 className="w-3 h-3 text-agri-400" />
                </div>
              </div>
            </div>

            {/* Carrier Gateway Meta Footer */}
            <div className="pt-3 border-t border-moss-800 flex items-center justify-between text-[10px] text-moss-400">
              <span>Recipient: <strong className="text-white">{recipientPhone}</strong> ({recipientName})</span>
              <span className="text-agri-300 font-medium">Delivered via GSM SMPP</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: WhatsApp & Push Preview */}
      {activeChannelTab === 'whatsapp' && (
        <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-6 sm:p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-display font-extrabold text-base text-moss-900">
                WhatsApp Business Cloud API Payload
              </h4>
              <p className="text-xs text-moss-500 mt-0.5">
                Rich interactive message card with audio voice note attachment and quick action buttons.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Verified Green Tick
            </span>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#0b141a] text-white border border-[#202c33] shadow-soft-lg">
            <div className="flex items-center gap-3 pb-3 border-b border-[#202c33]">
              <div className="w-9 h-9 rounded-full bg-agri-600 flex items-center justify-center font-bold text-sm text-white">
                🌈
              </div>
              <div>
                <p className="font-bold text-xs text-[#e9edef] flex items-center gap-1.5">
                  <span>Indradhanu Kisan Seva</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00a884] fill-current" />
                </p>
                <p className="text-[10px] text-[#8696a0]">Official Agri Advisory Bot</p>
              </div>
            </div>

            <div className="my-4 space-y-2">
              <div className="p-3 rounded-xl bg-[#202c33] text-xs text-[#e9edef] space-y-2">
                <p className="font-bold text-[#00a884]">
                  🚨 {activeAdvisory.riskLevel} WEATHER ALERT: {activeAdvisory.cropName} Crop
                </p>
                <p className="text-[12px] leading-relaxed">
                  {currentSmsBody}
                </p>
                <div className="p-2 rounded-lg bg-[#111b21] flex items-center gap-2 text-[11px]">
                  <PhoneCall className="w-3.5 h-3.5 text-[#00a884]" />
                  <span>Voice Note: 42s in {activeLang.toUpperCase()} attached</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-[#00a884] text-center border border-[#374248]">
                  📞 Call Agronomist
                </button>
                <button className="flex-1 py-2 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-[#00a884] text-center border border-[#374248]">
                  ✅ Confirm Received
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
