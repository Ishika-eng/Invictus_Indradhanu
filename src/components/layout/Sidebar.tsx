import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  CloudSun, 
  Users, 
  History, 
  Radio, 
  ShieldCheck, 
  Leaf,
  ChevronRight,
  Play,
  MapPin
} from 'lucide-react';
import { useAdvisory, ActiveTab } from '../../context/AdvisoryContext';
import { TRANSLATIONS } from '../../utils/translations';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, selectedFarmer, farmerName, selectedLocation, selectedCrop, selectedLanguage } = useAdvisory();
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string; isHero?: boolean }[] = [
    { id: 'advisory-wizard', label: t.navAdvisoryFlow, icon: Sparkles, badge: 'Hero Demo', isHero: true },
    { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
    { id: 'climate-hub', label: t.navClimateHub, icon: CloudSun },
    { id: 'farmers', label: t.navFarmers, icon: Users },
    { id: 'history', label: t.navHistory, icon: History, badge: 'Audit Trail' },
  ];

  return (
    <aside className="w-68 bg-slate-950 text-slate-100 flex flex-col justify-between border-r border-slate-800/80 shadow-soft hidden lg:flex select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-agri-400 via-agri-500 to-emerald-600 flex items-center justify-center shadow-glow-agri text-white font-bold text-xl">
              <Leaf className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-white">
                  Indradhanu
                </span>
                <span className="text-[10px] font-mono uppercase bg-agri-500/20 text-agri-300 px-2 py-0.5 rounded-full tracking-wider border border-agri-400/30 font-bold">
                  AI Krishi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Hyperlocal Climate Intelligence
              </p>
            </div>
          </div>

          {/* Telemetry live status indicator */}
          <div className="mt-4 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-slate-300 font-medium text-[11px]">NASA & Open-Meteo Live</span>
            </div>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'advisory-wizard' && activeTab === 'advisory-result');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-agri-600 text-white shadow-soft font-bold border border-agri-400/40'
                    : item.isHero
                    ? 'text-agri-300 bg-agri-950/40 hover:bg-slate-800 border border-agri-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.isHero ? 'text-agri-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : 'bg-agri-500/20 text-agri-300 border-agri-400/30'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Context Card */}
        <div className="px-4 py-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Active Micro-Zone</span>
              <span className="text-agri-400 font-mono text-[10px] font-bold bg-agri-950 px-1.5 py-0.5 rounded border border-agri-500/30">18.52°N</span>
            </div>
            <div className="font-semibold text-xs text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedLocation.city}, {selectedLocation.state}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between pt-1.5 border-t border-slate-800/80">
              <span>Farmer: <strong className="text-agri-200 font-medium">{farmerName}</strong></span>
              <span className="text-amber-300 font-medium font-mono">{selectedCrop}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] leading-tight">6-Step Storyline Presentation Ready</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>v2.0 Modern Edition</span>
          <span className="text-emerald-400/90 font-bold">Indradhanu AI</span>
        </div>
      </div>
    </aside>
  );
};
