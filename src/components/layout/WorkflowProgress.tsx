import React from 'react';
import { 
  User, 
  MapPin, 
  CloudRain, 
  Cpu, 
  Lightbulb, 
  Radio, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

interface WorkflowProgressProps {
  currentStage?: 'input' | 'climate' | 'analysis' | 'recommendation' | 'delivery';
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ currentStage = 'input' }) => {
  const { setActiveTab } = useAdvisory();

  const stages = [
    {
      id: 'input',
      title: 'Farmer & Plot Context',
      subtitle: 'GPS, crop & soil',
      icon: User,
      targetTab: 'advisory-wizard' as const,
    },
    {
      id: 'climate',
      title: 'Hyperlocal Climate Data',
      subtitle: 'Open-Meteo & NASA',
      icon: CloudRain,
      targetTab: 'climate-hub' as const,
    },
    {
      id: 'analysis',
      title: 'AI Agronomic Reasoning',
      subtitle: 'Physics & risk engine',
      icon: Cpu,
      targetTab: 'advisory-wizard' as const,
    },
    {
      id: 'recommendation',
      title: 'Actionable Advice',
      subtitle: '"What to do next"',
      icon: Lightbulb,
      targetTab: 'advisory-result' as const,
    },
    {
      id: 'delivery',
      title: 'Voice & SMS Dispatch',
      subtitle: 'GSM IVR multi-lingual',
      icon: Radio,
      targetTab: 'advisory-result' as const,
    }
  ];

  const getStageIndex = (stage: string) => {
    return stages.findIndex(s => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="card-modern p-4 sm:p-5 bg-white space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-agri-600 animate-pulse"></span>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            End-to-End Decision Pipeline
          </h4>
        </div>
        <span className="text-[11px] font-mono text-agri-800 font-bold bg-agri-50 px-2.5 py-0.5 rounded-full border border-agri-200">
          Interactive Journey
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div
              key={stage.id}
              onClick={() => setActiveTab(stage.targetTab)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isCurrent
                  ? 'bg-gradient-to-br from-agri-700 to-agri-900 text-white border-agri-600 shadow-soft'
                  : isDone
                  ? 'bg-agri-50/70 text-slate-900 border-agri-200/80 hover:bg-agri-100/70 hover:border-agri-300'
                  : 'bg-slate-50/80 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                  isCurrent ? 'bg-agri-500 text-white' : isDone ? 'bg-agri-200 text-agri-800' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-agri-700" /> : idx + 1}
                </div>
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isCurrent ? 'text-agri-300' : isDone ? 'text-agri-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight line-clamp-1 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                  {stage.title}
                </p>
                <p className={`text-[10px] mt-0.5 leading-tight line-clamp-1 font-medium ${isCurrent ? 'text-agri-200' : 'text-slate-400'}`}>
                  {stage.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
