import React from 'react';
import { 
  Satellite, 
  Database, 
  Radio, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export const DataSourcesTransparency: React.FC = () => {
  const sources = [
    {
      name: 'Open-Meteo',
      type: 'High-Res Numerical Weather Grid (0.05°)',
      status: 'LIVE DATA',
      lastSync: 'Updated 4m ago',
      icon: Satellite,
      color: 'text-skyalt-600 bg-skyalt-50 border-skyalt-200'
    },
    {
      name: 'NASA POWER',
      type: 'Solar Radiation & Agro-Climatology',
      status: 'LIVE DATA',
      lastSync: 'Updated 12m ago',
      icon: Database,
      color: 'text-agri-600 bg-agri-50 border-agri-200'
    },
    {
      name: 'Local Weather Data',
      type: 'Ground Doppler & Soil Moisture Nodes',
      status: 'ACTIVE SENSORS',
      lastSync: 'Updated 1m ago',
      icon: Radio,
      color: 'text-earth-600 bg-earth-50 border-earth-200'
    },
    {
      name: 'AI Advisory Engine',
      type: 'Crop-Soil Phenology Formula Matrix v2.4',
      status: 'CALIBRATED',
      lastSync: 'Ready for Dispatch',
      icon: Cpu,
      color: 'text-moss-700 bg-canvas-200 border-canvas-300'
    },
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-agri-100 text-agri-800">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            Data Source Transparency & Integrity
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-agri-800 font-semibold bg-agri-50 px-2.5 py-1 rounded-xl border border-agri-200 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-Time Ingestion</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sources.map((src) => {
          const Icon = src.icon;
          return (
            <div
              key={src.name}
              className="p-3.5 rounded-2xl bg-canvas-100/70 border border-canvas-200 hover:border-agri-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${src.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-canvas-300 text-moss-700">
                    {src.status}
                  </span>
                </div>

                <h4 className="font-display font-extrabold text-xs text-moss-900">
                  {src.name}
                </h4>
                <p className="text-[10px] text-moss-500 mt-0.5 leading-snug">
                  {src.type}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-canvas-200/80 text-[10px] text-agri-700 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-agri-600" />
                <span>{src.lastSync}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
