import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  Globe2
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';

export const VoiceCallSimulator: React.FC = () => {
  const { activeAdvisory, selectedLanguage, selectedFarmer, farmerName, farmerPhone } = useAdvisory();
  const { farmer } = useAuth();
  
  const recipientName = farmer?.full_name || farmerName || selectedFarmer.name;
  const recipientPhone = farmer?.phone_number || farmerPhone || selectedFarmer.phone;
  const activeLang = (farmer?.preferred_language && ['mr', 'hi', 'te', 'sw', 'en'].includes(farmer.preferred_language)
    ? farmer.preferred_language
    : selectedLanguage) as 'mr' | 'hi' | 'te' | 'sw' | 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSec, setPlaybackSec] = useState(0);
  const totalDuration = activeAdvisory.channels.voice.callDurationSec || 42;
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25>(1);

  // Active translation voice script
  const activeScript = activeAdvisory.translations[activeLang]?.voiceScript || activeAdvisory.translations[selectedLanguage]?.voiceScript || activeAdvisory.translations.en.voiceScript;

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackSec((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalDuration, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackSec(0);
  };

  return (
    <div className="rounded-3xl bg-moss-900 text-white border border-agri-600/40 p-6 sm:p-7 shadow-soft-lg relative overflow-hidden">
      
      {/* Background radial aura */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-agri-500/15 blur-3xl pointer-events-none" />

      {/* Header bar: Phone Call Simulation Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-moss-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white shadow-glow-agri">
            <PhoneCall className="w-5 h-5 animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-extrabold text-base text-white">
                Automated Regional Voice IVR Broadcast
              </h4>
              <span className="text-[10px] font-mono uppercase bg-agri-700/60 text-agri-200 px-2 py-0.5 rounded border border-agri-500/30">
                GSM Call Active
              </span>
            </div>
            <p className="text-xs text-moss-400 mt-0.5">
              Dialing <strong className="text-canvas-200">{recipientPhone}</strong> ({recipientName}) • Tone: {activeAdvisory.channels.voice.voiceTone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-moss-800/80 px-3 py-1.5 rounded-xl border border-moss-700 text-xs flex items-center gap-2 font-mono text-agri-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>00:{playbackSec < 10 ? `0${playbackSec}` : playbackSec} / 00:{totalDuration}</span>
          </div>
        </div>
      </div>

      {/* Interactive Audio Waveform Player */}
      <div className="my-6 p-5 rounded-2xl bg-moss-950/70 border border-agri-500/20 relative z-10">
        
        {/* Waveform Visualizer Bars */}
        <div className="h-16 flex items-center justify-between gap-1 sm:gap-1.5 px-2 my-2 overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => {
            const isBarActive = (i / 36) * totalDuration <= playbackSec;
            // Height formula with varying rhythm
            const baseHeight = [16, 28, 44, 32, 56, 40, 24, 48, 60, 36, 50, 28, 42, 58, 30, 46, 62, 38, 52, 26, 44, 56, 32, 48, 60, 36, 50, 28, 42, 58, 30, 46, 62, 38, 52, 26][i % 36];
            
            return (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-200 ${
                  isBarActive
                    ? 'bg-gradient-to-t from-agri-500 to-agri-300 shadow-glow-agri'
                    : isPlaying
                    ? 'bg-agri-800/60 animate-wave'
                    : 'bg-moss-800'
                }`}
                style={{
                  height: isPlaying && isBarActive ? `${baseHeight}px` : `${Math.max(8, baseHeight * 0.4)}px`,
                  animationDelay: `${(i % 10) * 0.1}s`,
                }}
              />
            );
          })}
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-moss-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-2xl bg-agri-400 hover:bg-agri-300 text-moss-950 flex items-center justify-center shadow-glow-agri transition-all active:scale-95"
              aria-label={isPlaying ? "Pause Voice Advisory" : "Play Voice Advisory"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-moss-800/80 hover:bg-moss-700 text-moss-300 hover:text-white transition-colors"
              title="Restart Audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-moss-400">
              <Volume2 className="w-4 h-4 text-agri-400" />
              <span>Natural Neural Voice ({selectedLanguage.toUpperCase()})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-moss-400">Speed:</span>
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.25 : 1)}
              className="px-2.5 py-1 rounded-lg bg-moss-800 hover:bg-moss-700 text-xs font-mono font-bold text-agri-300 border border-moss-700"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Live Voice Script Teleprompter */}
      <div className="p-4 rounded-2xl bg-moss-800/60 border border-moss-700/60 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-agri-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Spoken Dialect Transcript ({selectedLanguage.toUpperCase()})</span>
          </span>
          <span className="text-[10px] text-moss-400 font-mono">
            GSM Codec: AMR-WB
          </span>
        </div>
        
        <p className="text-sm font-medium text-canvas-100 leading-relaxed italic font-serif">
          "{activeScript}"
        </p>

        {selectedLanguage !== 'en' && (
          <div className="mt-3 pt-2.5 border-t border-moss-700/40 text-[11px] text-moss-400">
            <strong>English Reference:</strong> "{activeAdvisory.translations.en.voiceScript}"
          </div>
        )}
      </div>
    </div>
  );
};
