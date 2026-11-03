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
  Play
} from 'lucide-react';
import { useAdvisory, ActiveTab } from '../../context/AdvisoryContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, selectedFarmer, farmerName, selectedLocation, selectedCrop } = useAdvisory();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string; isHero?: boolean }[] = [
    { id: 'advisory-wizard', label: 'Farmer Advisory Flow', icon: Sparkles, badge: 'Hero Demo', isHero: true },
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'climate-hub', label: 'Climate Intelligence', icon: CloudSun },
    { id: 'farmers', label: 'Farmers Directory', icon: Users },
    { id: 'history', label: 'Advisory & Audit Logs', icon: History, badge: 'Audit Trail' },
  ];

  return (
    <aside className="w-64 bg-moss-900 text-canvas-100 flex flex-col justify-between border-r border-moss-800 shadow-soft hidden lg:flex select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-moss-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-400 via-agri-600 to-earth-500 flex items-center justify-center shadow-glow-agri text-white font-bold text-xl">
              <Leaf className="w-5 h-5 text-canvas-50" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-white">
                  Indradhanu
                </span>
                <span className="text-[10px] font-mono uppercase bg-agri-700/70 text-agri-200 px-1.5 py-0.5 rounded tracking-wider border border-agri-500/30">
                  AI Krishi
                </span>
              </div>
              <p className="text-[11px] text-moss-500 font-medium tracking-wide">
                Hyperlocal Climate Intelligence
              </p>
            </div>
          </div>

          {/* Telemetry live status indicator */}
          <div className="mt-4 px-3 py-2 rounded-lg bg-moss-800/60 border border-moss-700/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-agri-400"></span>
              </span>
              <span className="text-agri-300 font-medium text-[11px]">NASA & Open-Meteo Live</span>
            </div>
            <Radio className="w-3.5 h-3.5 text-agri-400 animate-pulse" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-moss-500">
            Hackathon Presentation
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
                    ? 'bg-agri-700 text-white shadow-soft font-bold border border-agri-500/30'
                    : item.isHero
                    ? 'text-agri-200 bg-moss-800/40 hover:bg-moss-800 border border-agri-600/30'
                    : 'text-moss-400 hover:text-white hover:bg-moss-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-agri-300' : item.isHero ? 'text-agri-400' : 'text-moss-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isActive ? 'bg-agri-500/30 text-white border-white/30' : 'bg-agri-500/20 text-agri-300 border-agri-400/30'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-agri-300" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Context Card */}
        <div className="px-4 py-2">
          <div className="p-3.5 rounded-xl bg-moss-800/40 border border-moss-700/50">
            <div className="flex items-center justify-between text-[11px] text-moss-400 mb-1.5">
              <span>Active Micro-Zone</span>
              <span className="text-agri-400 font-mono">18.52°N</span>
            </div>
            <div className="font-semibold text-sm text-canvas-100 flex items-center gap-1.5">
              <span>📍 {selectedLocation.city}, {selectedLocation.state}</span>
            </div>
            <div className="text-[11px] text-moss-400 mt-1 flex items-center justify-between">
              <span>Farmer: <strong className="text-agri-200 font-medium">{farmerName}</strong></span>
              <span className="text-earth-300">{selectedCrop}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-moss-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs text-moss-400 bg-moss-800/30 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-agri-400 shrink-0" />
          <span className="text-[11px] leading-tight">6-Step Storyline Presentation Ready</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-moss-500 px-1 font-mono">
          <span>v2.0 Hero Edition</span>
          <span className="text-agri-400/80">Indradhanu AI</span>
        </div>
      </div>
    </aside>
  );
};
