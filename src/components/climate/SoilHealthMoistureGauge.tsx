import React from 'react';
import { 
  Waves, 
  Droplet, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Radio,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';

export const SoilHealthMoistureGauge: React.FC = () => {
  const { selectedLocation, selectedCrop } = useAdvisory();
  const { selectedFarm } = useAuth();

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-earth-100 text-earth-800">
            <Waves className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            Soil Hydration & IoT Sensor Telemetry
          </h3>
        </div>

        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Sensor Unavailable
        </span>
      </div>

      {/* Visual Sensor Telemetry Status */}
      <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-earth-100 border border-earth-200 flex items-center justify-center text-earth-800 shrink-0">
            <Cpu className="w-5 h-5 text-earth-700" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-xs sm:text-sm text-moss-900">
                In-Situ Ground Sensor Probe: Not Installed
              </h4>
              <span className="text-[9px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                No Telemetry
              </span>
            </div>
            <p className="text-[11px] text-moss-600 leading-relaxed">
              To preserve scientific integrity, physical soil moisture requires an in-situ capacitive or FDR probe on {selectedFarm ? selectedFarm.name : 'this plot'}. Modelled satellite weather data is <strong>never</strong> substituted or misrepresented as physical ground sensor readings.
            </p>
          </div>
        </div>

        {/* 3-Depth Sensor Readiness Matrix */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-canvas-200/80 text-center">
          <div className="p-2 rounded-xl bg-white border border-canvas-200">
            <span className="text-[9px] font-bold uppercase text-moss-500 block">Topsoil (0-10cm)</span>
            <span className="font-mono text-xs font-bold text-slate-400 block my-0.5">-- %</span>
            <span className="text-[9px] text-slate-400">Offline</span>
          </div>

          <div className="p-2 rounded-xl bg-white border border-canvas-200">
            <span className="text-[9px] font-bold uppercase text-moss-500 block">Root-Zone (10-40cm)</span>
            <span className="font-mono text-xs font-bold text-slate-400 block my-0.5">-- %</span>
            <span className="text-[9px] text-slate-400">Offline</span>
          </div>

          <div className="p-2 rounded-xl bg-white border border-canvas-200">
            <span className="text-[9px] font-bold uppercase text-moss-500 block">Deep Subsoil (&gt;40cm)</span>
            <span className="font-mono text-xs font-bold text-slate-400 block my-0.5">-- %</span>
            <span className="text-[9px] text-slate-400">Offline</span>
          </div>
        </div>
      </div>

      {/* IoT Architecture Architecture Readiness Notice */}
      <div className="p-3 rounded-xl bg-skyalt-50 border border-skyalt-200 flex items-center justify-between text-xs text-skyalt-900">
        <div className="flex items-center gap-2 text-[11px]">
          <Radio className="w-4 h-4 text-skyalt-600 shrink-0" />
          <span>Architecture ready for <strong>LoRaWAN / GSM ESP32 Soil Sensor Uplinks</strong></span>
        </div>
        <span className="text-[10px] font-mono text-skyalt-700 bg-skyalt-100 px-2 py-0.5 rounded font-bold">
          API Ready
        </span>
      </div>
    </div>
  );
};
