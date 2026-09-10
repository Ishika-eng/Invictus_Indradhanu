import React from 'react';
import { 
  User, 
  MapPin, 
  CloudRain, 
  Cpu, 
  Lightbulb, 
  Radio, 
  ArrowRight,
  CheckCircle2
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
      title: 'Farmer & Crop Context',
      subtitle: 'Location, stage, acreage',
      icon: User,
      targetTab: 'advisory-wizard' as const,
    },
    {
      id: 'climate',
      title: 'Hyperlocal Climate Data',
      subtitle: 'Open-Meteo & NASA POWER',
      icon: CloudRain,
      targetTab: 'climate-hub' as const,
    },
    {
      id: 'analysis',
      title: 'AI Agronomic Reasoning',
      subtitle: 'Soil physics + risk engine',
      icon: Cpu,
      targetTab: 'advisory-wizard' as const,
    },
    {
      id: 'recommendation',
      title: 'Actionable Advice',
      subtitle: '"What should farmer do?"',
      icon: Lightbulb,
      targetTab: 'advisory-result' as const,
    },
    {
      id: 'delivery',
      title: 'Voice & SMS Dispatch',
      subtitle: 'GSM / IVR multi-lingual',
      icon: Radio,
      targetTab: 'advisory-result' as const,
    }
  ];

  const getStageIndex = (stage: string) => {
    return stages.findIndex(s => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full bg-white/70 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-canvas-300 shadow-soft-sm mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-agri-600 animate-pulse"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-moss-700">
            End-to-End Intelligence Pipeline
          </h4>
        </div>
        <span className="text-[11px] font-mono text-agri-700 font-semibold bg-agri-50 px-2 py-0.5 rounded-md border border-agri-200">
          Smallholder Journey
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div
              key={stage.id}
              onClick={() => setActiveTab(stage.targetTab)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-agri-800 text-white border-agri-600 shadow-soft'
                  : isDone
                  ? 'bg-agri-50/80 text-moss-900 border-agri-200 hover:bg-agri-100/60'
                  : 'bg-canvas-100/60 text-moss-500 border-canvas-200 hover:bg-canvas-200/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isCurrent ? 'bg-agri-600 text-white' : isDone ? 'bg-agri-200 text-agri-800' : 'bg-canvas-200 text-moss-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-agri-700" /> : idx + 1}
                </div>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-agri-300' : isDone ? 'text-agri-600' : 'text-moss-400'}`} />
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight line-clamp-1 ${isCurrent ? 'text-white' : 'text-moss-900'}`}>
                  {stage.title}
                </p>
                <p className={`text-[10px] mt-0.5 leading-tight line-clamp-1 ${isCurrent ? 'text-agri-200' : 'text-moss-500'}`}>
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
