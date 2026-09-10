import React, { useState } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Leaf, 
  Globe2, 
  ChevronDown,
  Presentation,
  Tv,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAdvisory, ActiveTab } from '../../context/AdvisoryContext';
import { Language } from '../../types/advisory';

export const Topbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedFarmer, 
    allFarmers, 
    setSelectedFarmer, 
    selectedLanguage, 
    setSelectedLanguage,
    isPresentationMode,
    togglePresentationMode
  } = useAdvisory();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [farmerDropdownOpen, setFarmerDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-canvas-300/80 sticky top-0 z-20 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between">
        
        {/* Left: Mobile Brand & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {!isPresentationMode && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-moss-700 hover:bg-canvas-200 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-agri-700 flex items-center justify-center text-white font-bold shadow-sm">
              <Leaf className="w-4 h-4 text-canvas-100" />
            </div>
            <span className="font-display font-black text-lg text-agri-950">Indradhanu</span>
            <span className="text-[10px] font-mono bg-agri-100 text-agri-800 px-1.5 py-0.2 rounded border border-agri-300 font-bold hidden sm:inline">
              Climate AI
            </span>
          </div>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs text-moss-500 font-medium ml-2">
            <span>/</span>
            <span className="font-bold text-moss-800 capitalize">
              {activeTab === 'advisory-wizard' ? 'Hero Demo Flow' : activeTab.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* PRESENTATION MODE TOGGLE BUTTON */}
          <button
            onClick={togglePresentationMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isPresentationMode
                ? 'bg-amber-500 text-moss-950 border-amber-600 shadow-glow-amber ring-2 ring-amber-400/40'
                : 'bg-canvas-100 hover:bg-canvas-200 text-moss-800 border-canvas-300'
            }`}
            title="Toggle Clean Full-Width Hackathon Presentation Screen"
          >
            {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Presentation className="w-3.5 h-3.5 text-agri-700" />}
            <span className="hidden sm:inline">{isPresentationMode ? 'Exit Demo Mode' : 'Presentation Mode'}</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Regional Dialect Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-canvas-100 px-2.5 py-1.5 rounded-xl border border-canvas-300 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-agri-700" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="bg-transparent font-bold text-agri-950 focus:outline-none cursor-pointer text-xs"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Primary CTA: Farmer Advisory Flow */}
          <button
            onClick={() => setActiveTab('advisory-wizard')}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-agri-700 to-agri-800 text-white text-xs sm:text-sm font-extrabold shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-agri-300 group-hover:rotate-12 transition-transform" />
            <span>Advisory Demo</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-canvas-200 flex flex-col gap-1 pb-2">
          {[
            { id: 'advisory-wizard' as ActiveTab, label: 'Farmer Advisory Flow (Demo)' },
            { id: 'overview' as ActiveTab, label: 'Overview Dashboard' },
            { id: 'climate-hub' as ActiveTab, label: 'Climate Intelligence Layer' },
            { id: 'farmers' as ActiveTab, label: 'Farmers Directory' },
            { id: 'history' as ActiveTab, label: 'Advisory History' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab.id ? 'bg-agri-700 text-white font-bold' : 'text-moss-700 hover:bg-canvas-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
