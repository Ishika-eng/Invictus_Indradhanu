import React from 'react';
import { 
  Satellite, 
  Database, 
  Radio, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DataSourcesTransparency: React.FC = () => {
  const sources = [
    {
      name: 'Open-Meteo',
      type: 'High-Res Numerical Weather Grid (0.05° resolution)',
      status: 'LIVE NWP',
      lastSync: 'Real-Time Sync (<30m TTL)',
      icon: Satellite,
      color: 'text-skyalt-600 bg-skyalt-50 border-skyalt-200'
    },
    {
      name: 'NASA POWER',
      type: 'Solar Radiation & Agro-Climatology Daily Time-Series',
      status: 'LIVE ARCHIVE',
      lastSync: 'Daily Archive Sync',
      icon: Database,
      color: 'text-agri-600 bg-agri-50 border-agri-200'
    },
    {
      name: 'In-Situ IoT Soil Probe',
      type: 'Capacitive / FDR Ground Telemetry (0-40cm depth)',
      status: 'AWAITING PROBE',
      lastSync: 'No Fake Data Allowed',
      icon: Radio,
      color: 'text-earth-600 bg-earth-50 border-earth-200'
    },
    {
      name: 'Thermal GDD Engine',
      type: 'Crop-Specific Growing Degree Day Heat Unit Accumulation',
      status: 'ACTIVE MODEL',
      lastSync: 'Dynamic Thermal Calc',
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
          const isAwaiting = src.status === 'AWAITING PROBE';

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
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                    isAwaiting 
                      ? 'bg-slate-100 text-slate-700 border-slate-300' 
                      : 'bg-white border-canvas-300 text-moss-700'
                  }`}>
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

              <div className="mt-3 pt-2 border-t border-canvas-200/80 text-[10px] font-mono flex items-center gap-1">
                {isAwaiting ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-600">{src.lastSync}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-agri-600" />
                    <span className="text-agri-700">{src.lastSync}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
