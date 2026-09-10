import React from 'react';
import { 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Radio, 
  TrendingUp, 
  Droplet,
  ShieldCheck 
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const MetricCards: React.FC = () => {
  const { metrics } = useAdvisory();

  const cards = [
    {
      title: 'Total Farmers Served',
      value: metrics.totalFarmersServed.toLocaleString(),
      subtitle: '+124 onboarded this week',
      icon: Users,
      color: 'agri',
      badge: '98.4% Active',
      accent: 'border-agri-500/30 bg-agri-50/50',
      iconBg: 'bg-agri-600 text-white',
    },
    {
      title: 'Active Advisories',
      value: metrics.activeAdvisoriesCount.toLocaleString(),
      subtitle: 'Synchronized with live satellite radar',
      icon: Sparkles,
      color: 'skyalt',
      badge: 'Real-time',
      accent: 'border-skyalt-500/30 bg-skyalt-50/50',
      iconBg: 'bg-skyalt-600 text-white',
    },
    {
      title: 'Climate Risks Detected',
      value: metrics.climateRisksDetected.toString(),
      subtitle: 'Heat stress, rain front & blight alert',
      icon: AlertTriangle,
      color: 'earth',
      badge: '12 Urgent',
      accent: 'border-earth-500/30 bg-earth-50/50',
      iconBg: 'bg-earth-500 text-white',
    },
    {
      title: 'Advisories Delivered',
      value: metrics.advisoriesDeliveredCount.toLocaleString(),
      subtitle: 'Via SMS, GSM IVR & WhatsApp',
      icon: Radio,
      color: 'agri',
      badge: '99.1% Delivery Rate',
      accent: 'border-agri-500/30 bg-agri-50/50',
      iconBg: 'bg-agri-700 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${card.accent} shadow-soft hover:shadow-soft-lg transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/90 border border-canvas-300 text-moss-700 shadow-soft-sm">
                {card.badge}
              </span>
            </div>
            
            <p className="text-xs font-semibold text-moss-600 uppercase tracking-wider">
              {card.title}
            </p>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-moss-900 tracking-tight mt-1">
              {card.value}
            </h3>
            <p className="text-xs text-moss-500 mt-1.5 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-agri-600 shrink-0" />
              <span>{card.subtitle}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};
