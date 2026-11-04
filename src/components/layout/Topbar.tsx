import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Leaf, 
  Globe2, 
  ChevronDown,
  Presentation,
  Check,
  Minimize2,
  Phone,
  UserCheck,
  LogOut,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { useAdvisory, ActiveTab } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types/advisory';

export const Topbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedLanguage, 
    setSelectedLanguage,
    isPresentationMode,
    togglePresentationMode
  } = useAdvisory();

  const { user, farmer, isRegistered, logout, setAuthModalOpen, confirmationNotice, setConfirmationNotice } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
  ];

  const currentLang = languages.find(l => l.code === selectedLanguage) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLang = (code: Language) => {
    setSelectedLanguage(code);
    setLanguageDropdownOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-canvas-300/80 sticky top-0 z-30 transition-all">
      {confirmationNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{confirmationNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmationNotice(null)}
            className="p-1 hover:bg-emerald-700 rounded text-emerald-200 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
        
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

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('advisory-wizard')}>
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
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* USER AUTH STATUS OR LOGIN BUTTON */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-agri-50 border border-agri-200 px-2.5 py-1.5 rounded-xl shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-agri-700 shrink-0" />
              <span className="text-xs font-bold text-agri-900 hidden sm:inline max-w-[120px] truncate">
                {farmer ? farmer.full_name : (user.email || user.phone || 'Farmer')}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1 rounded text-moss-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-agri-800 bg-canvas-100 hover:bg-canvas-200 border border-canvas-300 shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-agri-600" />
              <span className="hidden sm:inline">Farmer Sign In</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          {/* PRESENTATION MODE TOGGLE BUTTON */}
          <button
            onClick={togglePresentationMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isPresentationMode
                ? 'bg-amber-500 text-moss-950 border-amber-600 shadow-glow-amber ring-2 ring-amber-400/40'
                : 'bg-canvas-100 hover:bg-canvas-200 text-moss-800 border-canvas-300'
            }`}
            title="Toggle Clean Full-Width Presentation View"
          >
            {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Presentation className="w-3.5 h-3.5 text-agri-700" />}
            <span className="hidden sm:inline">{isPresentationMode ? 'Exit Demo' : 'Presentation'}</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* CUSTOM INTERACTIVE LANGUAGE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="flex items-center gap-1.5 bg-canvas-100 hover:bg-canvas-200 px-2.5 sm:px-3 py-1.5 rounded-xl border border-canvas-300 text-xs font-bold text-agri-950 transition-all shadow-sm active:scale-95"
              aria-expanded={languageDropdownOpen}
            >
              <Globe2 className="w-3.5 h-3.5 text-agri-700 shrink-0" />
              <span>{currentLang.native}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-moss-500 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {languageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-canvas-300 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-moss-400 border-b border-canvas-200 mb-1">
                  Select Delivery Language
                </div>

                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLang(lang.code)}
                      className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-agri-50 text-agri-900 font-extrabold border-l-4 border-agri-600' 
                          : 'text-moss-800 hover:bg-canvas-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.native}</span>
                        <span className="text-[10px] text-moss-500 font-normal">({lang.label})</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-agri-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Primary CTA: Farmer Advisory Flow */}
          <button
            onClick={() => setActiveTab('advisory-wizard')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-agri-700 to-agri-800 text-white text-xs sm:text-sm font-extrabold shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-agri-300 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Advisory Demo</span>
            <span className="sm:hidden">Advisory</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-canvas-200 flex flex-col gap-1 pb-2">
          {[
            { id: 'advisory-wizard' as ActiveTab, label: 'Farmer Advisory Flow (Hero Demo)' },
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
