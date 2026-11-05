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
import { TRANSLATIONS } from '../../utils/translations';

export const Topbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedLanguage, 
    setSelectedLanguage,
    isPresentationMode,
    togglePresentationMode
  } = useAdvisory();

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
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
    <header className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 transition-all">
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
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('advisory-wizard')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white font-bold shadow-soft">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Indradhanu</span>
            <span className="text-[10px] font-mono bg-agri-50 text-agri-700 px-2 py-0.5 rounded-full border border-agri-200 font-bold hidden sm:inline">
              Climate AI
            </span>
          </div>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium ml-2">
            <span>/</span>
            <span className="font-bold text-slate-700 capitalize bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
              {activeTab === 'advisory-wizard' ? t.navAdvisoryFlow : activeTab.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* USER AUTH STATUS OR LOGIN BUTTON */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-agri-50 border border-agri-200 px-3 py-1.5 rounded-2xl shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-agri-700 shrink-0" />
              <span className="text-xs font-bold text-agri-900 hidden sm:inline max-w-[120px] truncate">
                {farmer ? farmer.full_name : (user.email || user.phone || 'Farmer')}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 text-agri-600" />
              <span className="hidden sm:inline">{t.navSignIn}</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          {/* PRESENTATION MODE TOGGLE BUTTON */}
          <button
            onClick={togglePresentationMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border shadow-2xs active:scale-95 ${
              isPresentationMode
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-glow-amber ring-2 ring-amber-400/40'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Toggle Clean Full-Width Presentation View"
          >
            {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Presentation className="w-3.5 h-3.5 text-agri-700" />}
            <span className="hidden sm:inline">{isPresentationMode ? t.navExitDemo : t.navPresentation}</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* CUSTOM INTERACTIVE LANGUAGE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-2xs active:scale-95"
              aria-expanded={languageDropdownOpen}
            >
              <Globe2 className="w-3.5 h-3.5 text-agri-600 shrink-0" />
              <span>{currentLang.native}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {languageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Select Delivery Language
                </div>

                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLang(lang.code)}
                      className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-agri-50 text-agri-900 font-extrabold border-l-4 border-agri-600' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.native}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
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
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-agri-600 via-agri-700 to-agri-800 text-white text-xs sm:text-sm font-extrabold shadow-soft hover:shadow-glow-agri transition-all active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">{t.navAdvisoryDemo}</span>
            <span className="sm:hidden">Advisory</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 pt-2 px-4 border-t border-slate-200 flex flex-col gap-1 pb-3 bg-white">
          {[
            { id: 'advisory-wizard' as ActiveTab, label: t.navAdvisoryFlow },
            { id: 'overview' as ActiveTab, label: t.navOverview },
            { id: 'climate-hub' as ActiveTab, label: t.navClimateHub },
            { id: 'farmers' as ActiveTab, label: t.navFarmers },
            { id: 'history' as ActiveTab, label: t.navHistory },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === tab.id ? 'bg-agri-700 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
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
