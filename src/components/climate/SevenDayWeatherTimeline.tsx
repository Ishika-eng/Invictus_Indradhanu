import React from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudLightning, 
  Cloud, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const SevenDayWeatherTimeline: React.FC = () => {
  const { selectedLocation } = useAdvisory();

  const days = [
    { day: 'Today', icon: CloudLightning, tempMax: selectedLocation.tempC, tempMin: selectedLocation.tempC - 8, rainPct: selectedLocation.rainProbPct, rainMm: 38, tag: 'Rain Watch' },
    { day: 'Thu', icon: CloudRain, tempMax: selectedLocation.tempC - 1, tempMin: selectedLocation.tempC - 9, rainPct: 65, rainMm: 18, tag: 'Hold Spray' },
    { day: 'Fri', icon: Cloud, tempMax: selectedLocation.tempC, tempMin: selectedLocation.tempC - 8, rainPct: 30, rainMm: 4, tag: 'Optimal' },
    { day: 'Sat', icon: Sun, tempMax: selectedLocation.tempC + 2, tempMin: selectedLocation.tempC - 7, rainPct: 15, rainMm: 0, tag: 'Optimal' },
    { day: 'Sun', icon: Sun, tempMax: selectedLocation.tempC + 3, tempMin: selectedLocation.tempC - 6, rainPct: 10, rainMm: 0, tag: 'Optimal' },
    { day: 'Mon', icon: Sun, tempMax: selectedLocation.tempC + 2, tempMin: selectedLocation.tempC - 6, rainPct: 20, rainMm: 1, tag: 'Irrigate' },
    { day: 'Tue', icon: Cloud, tempMax: selectedLocation.tempC + 1, tempMin: selectedLocation.tempC - 7, rainPct: 25, rainMm: 2, tag: 'Optimal' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-skyalt-100 text-skyalt-800">
            <Calendar className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            7-Day Weather & Precipitation Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-agri-800 bg-agri-50 px-2.5 py-1 rounded-xl border border-agri-200 self-start sm:self-auto">
          Hyperlocal Agro-Outlook
        </span>
      </div>

      {/* Horizontal Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((item, idx) => {
          const Icon = item.icon;
          const isToday = idx === 0;

          return (
            <div
              key={item.day}
              className={`p-3.5 rounded-2xl border transition-all duration-300 text-center flex flex-col justify-between group hover:scale-[1.03] ${
                isToday
                  ? 'bg-agri-800 text-white border-agri-600 shadow-soft'
                  : 'bg-canvas-100/70 text-moss-900 border-canvas-300 hover:bg-white hover:shadow-soft-sm'
              }`}
            >
              <div>
                <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-moss-900'}`}>
                  {item.day}
                </p>
                <div className="my-2.5 flex items-center justify-center">
                  <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isToday ? 'text-amber-300 animate-pulse' : 'text-skyalt-600'}`} />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <span>{item.tempMax}°</span>
                  <span className={`text-[10px] ${isToday ? 'text-agri-300' : 'text-moss-400'}`}>
                    {item.tempMin}°
                  </span>
                </div>
              </div>

              {/* Rain Probability Animated Bar */}
              <div className="my-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span className={isToday ? 'text-skyalt-200' : 'text-skyalt-700'}>💧 {item.rainPct}%</span>
                  {item.rainMm > 0 && (
                    <span className={`text-[9px] font-mono ${isToday ? 'text-agri-300' : 'text-moss-500'}`}>{item.rainMm}mm</span>
                  )}
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isToday ? 'bg-white/20' : 'bg-canvas-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.rainPct > 50 ? 'bg-skyalt-400' : isToday ? 'bg-agri-400' : 'bg-agri-600'
                    }`}
                    style={{ width: `${item.rainPct}%` }}
                  />
                </div>
              </div>

              {/* Day Action Tag */}
              <div className="pt-1.5 border-t border-canvas-200/30">
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md inline-block ${
                  item.tag === 'Rain Watch'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    : item.tag === 'Hold Spray'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : item.tag === 'Irrigate'
                    ? 'bg-skyalt-500/20 text-skyalt-300 border border-skyalt-400/30'
                    : isToday
                    ? 'bg-agri-700 text-agri-200'
                    : 'bg-white text-moss-700 border border-canvas-300'
                }`}>
                  {item.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
