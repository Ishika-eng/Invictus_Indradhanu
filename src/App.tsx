import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { HeroAdvisoryJourney } from './components/advisory-wizard/HeroAdvisoryJourney';
import { ClimateIntelligenceHub } from './components/climate/ClimateIntelligenceHub';
import { FarmersDirectory } from './components/farmers/FarmersDirectory';
import { AdvisoryHistory } from './components/history/AdvisoryHistory';
import { useAdvisory } from './context/AdvisoryContext';
import { Leaf, Presentation, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    activeTab, 
    isPresentationMode, 
    togglePresentationMode, 
    demoStep, 
    setDemoStep 
  } = useAdvisory();

  // Keyboard navigation for presentation mode (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return;
      if (e.key === 'ArrowRight') {
        setDemoStep(Math.min(6, (demoStep + 1) as any) as any);
      } else if (e.key === 'ArrowLeft') {
        setDemoStep(Math.max(1, (demoStep - 1) as any) as any);
      } else if (e.key === 'Escape') {
        togglePresentationMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, demoStep, setDemoStep, togglePresentationMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-moss-900 font-sans">
      
      {/* Desktop Sidebar (hidden when in Presentation Mode) */}
      {!isPresentationMode && <Sidebar />}

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Sticky Topbar */}
        <Topbar />

        {/* Presentation Mode Top Toolbar (Active during presentation) */}
        {isPresentationMode && (
          <div className="bg-moss-900 text-white px-4 py-2.5 border-b border-agri-600/40 sticky top-[57px] z-20 flex items-center justify-between shadow-soft animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-500 text-moss-950 px-2.5 py-0.5 rounded-lg shadow-sm">
                <Presentation className="w-3.5 h-3.5" />
                <span>HACKATHON DEMO MODE</span>
              </span>

              {/* Step Pills */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs">
                {[
                  { num: 1, label: 'Farmer' },
                  { num: 2, label: 'Crop' },
                  { num: 3, label: 'AI Radar' },
                  { num: 4, label: 'Climate Intel' },
                  { num: 5, label: 'Recommendation' },
                  { num: 6, label: 'Delivery' },
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => setDemoStep(s.num as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      demoStep === s.num
                        ? 'bg-agri-600 text-white shadow-sm'
                        : 'text-moss-400 hover:text-white hover:bg-moss-800'
                    }`}
                  >
                    {s.num}. {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Prev / Next Slide & Exit */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDemoStep(Math.max(1, (demoStep - 1) as any) as any)}
                disabled={demoStep === 1}
                className="p-1.5 rounded-lg bg-moss-800 hover:bg-moss-700 disabled:opacity-30 text-white text-xs"
                title="Previous Step (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs text-agri-300 font-bold px-1">
                {demoStep} / 6
              </span>

              <button
                onClick={() => setDemoStep(Math.min(6, (demoStep + 1) as any) as any)}
                disabled={demoStep === 6}
                className="p-1.5 rounded-lg bg-moss-800 hover:bg-moss-700 disabled:opacity-30 text-white text-xs"
                title="Next Step (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={togglePresentationMode}
                className="flex items-center gap-1 ml-2 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                title="Exit Demo Mode (Esc)"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page View */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${isPresentationMode ? 'max-w-6xl mx-auto w-full' : ''}`}>
          {activeTab === 'advisory-wizard' && <HeroAdvisoryJourney />}
          {activeTab === 'overview' && <OverviewDashboard />}
          {activeTab === 'climate-hub' && <ClimateIntelligenceHub />}
          {activeTab === 'advisory-result' && <HeroAdvisoryJourney />}
          {activeTab === 'farmers' && <FarmersDirectory />}
          {activeTab === 'history' && <AdvisoryHistory />}
        </main>

        {/* Footer */}
        {!isPresentationMode && (
          <footer className="px-6 py-4 border-t border-canvas-300/80 bg-white/50 text-xs text-moss-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-agri-900 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-agri-600" />
                <span>Indradhanu</span>
              </span>
              <span>•</span>
              <span>AI Hyperlocal Climate & Crop Advisory for Smallholder Farmers</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-agri-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Open-Meteo & NASA Live Sync
              </span>
              <span>•</span>
              <span>GSM Voice IVR & SMS Ready</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
export default App;
