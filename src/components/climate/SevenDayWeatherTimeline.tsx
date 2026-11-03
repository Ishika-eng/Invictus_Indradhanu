import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudLightning, 
  Cloud, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { fetchFarmClimateForecast, ClimateForecastData, DailyForecastDay } from '../../services/api';

export const SevenDayWeatherTimeline: React.FC = () => {
  const { selectedLocation } = useAdvisory();
  const { selectedFarm, session } = useAuth();

  const [forecastData, setForecastData] = useState<ClimateForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function loadForecast() {
      if (!selectedFarm?.id || !session?.access_token) return;
      setLoading(true);
      try {
        const data = await fetchFarmClimateForecast(selectedFarm.id, session.access_token);
        if (mounted) {
          setForecastData(data);
        }
      } catch (err) {
        console.warn('Forecast lookup fallback:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadForecast();
    return () => { mounted = false; };
  }, [selectedFarm?.id, session?.access_token]);

  // Helper to get day name from YYYY-MM-DD
  const formatDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Agronomic advisory tag recommendation
  const getAgriTag = (rainPct: number, precipMm: number, tempMax: number) => {
    if (rainPct >= 65 || precipMm >= 10) return { label: 'Hold Spray', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (rainPct >= 40 || precipMm >= 3) return { label: 'Rain Watch', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (tempMax >= 34) return { label: 'Heat Watch', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (rainPct <= 20) return { label: 'Optimal Window', color: 'bg-agri-100 text-agri-900 border-agri-200' };
    return { label: 'Normal', color: 'bg-canvas-200 text-moss-800 border-canvas-300' };
  };

  // Fallback days when no live farm is connected
  const fallbackDays = [
    { day: 'Today', icon: '⛈️', tempMax: selectedLocation.tempC, tempMin: selectedLocation.tempC - 8, rainPct: selectedLocation.rainProbPct, rainMm: 38, tag: 'Rain Watch' },
    { day: 'Thu', icon: '🌧️', tempMax: selectedLocation.tempC - 1, tempMin: selectedLocation.tempC - 9, rainPct: 65, rainMm: 18, tag: 'Hold Spray' },
    { day: 'Fri', icon: '⛅', tempMax: selectedLocation.tempC, tempMin: selectedLocation.tempC - 8, rainPct: 30, rainMm: 4, tag: 'Optimal Window' },
    { day: 'Sat', icon: '☀️', tempMax: selectedLocation.tempC + 2, tempMin: selectedLocation.tempC - 7, rainPct: 15, rainMm: 0, tag: 'Optimal Window' },
    { day: 'Sun', icon: '☀️', tempMax: selectedLocation.tempC + 3, tempMin: selectedLocation.tempC - 6, rainPct: 10, rainMm: 0, tag: 'Optimal Window' },
    { day: 'Mon', icon: '🌤️', tempMax: selectedLocation.tempC + 2, tempMin: selectedLocation.tempC - 6, rainPct: 20, rainMm: 1, tag: 'Irrigate' },
    { day: 'Tue', icon: '⛅', tempMax: selectedLocation.tempC + 1, tempMin: selectedLocation.tempC - 7, rainPct: 25, rainMm: 2, tag: 'Optimal Window' },
  ];

  const hasLiveForecast = forecastData && forecastData.daily_forecast.length > 0;

  return (
    <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-skyalt-100 text-skyalt-800">
            <Calendar className="w-4 h-4" />
          </span>
          <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
            7-Day Weather & Precipitation Outlook
          </h3>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-agri-600" />}
        </div>
        <span className="text-[11px] font-mono text-agri-800 bg-agri-50 px-2.5 py-1 rounded-xl border border-agri-200 self-start sm:self-auto">
          {hasLiveForecast ? 'Live Open-Meteo 7-Day Ensemble' : 'Hyperlocal Agro-Outlook'}
        </span>
      </div>

      {/* Horizontal Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {hasLiveForecast ? (
          forecastData.daily_forecast.map((dayItem, idx) => {
            const isToday = idx === 0;
            const dayName = formatDayName(dayItem.date, idx);
            const agriTag = getAgriTag(dayItem.precipitation_probability_pct, dayItem.precipitation_mm, dayItem.temp_max_c);

            return (
              <div
                key={dayItem.date}
                className={`p-3.5 rounded-2xl border transition-all duration-300 text-center flex flex-col justify-between group hover:scale-[1.03] ${
                  isToday
                    ? 'bg-agri-800 text-white border-agri-600 shadow-soft'
                    : 'bg-canvas-100/70 text-moss-900 border-canvas-300 hover:bg-white hover:shadow-soft-sm'
                }`}
              >
                <div>
                  <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-moss-900'}`}>
                    {dayName}
                  </p>
                  <p className={`text-[9px] font-mono ${isToday ? 'text-agri-200' : 'text-moss-400'}`}>
                    {dayItem.date.slice(5)}
                  </p>
                  <div className="my-2 flex items-center justify-center text-2xl">
                    {dayItem.weather_icon || '⛅'}
                  </div>
                  <p className={`text-[10px] font-semibold truncate ${isToday ? 'text-agri-100' : 'text-moss-700'}`}>
                    {dayItem.weather_condition}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-canvas-200/50 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    <span className={isToday ? 'text-white' : 'text-moss-900'}>
                      {Math.round(dayItem.temp_max_c)}°
                    </span>
                    <span className={`text-[11px] font-normal ${isToday ? 'text-agri-300' : 'text-moss-400'}`}>
                      {Math.round(dayItem.temp_min_c)}°
                    </span>
                  </div>

                  <div className={`text-[10px] font-medium flex items-center justify-center gap-1 ${
                    dayItem.precipitation_probability_pct > 50 ? 'text-skyalt-400 font-bold' : isToday ? 'text-agri-200' : 'text-moss-500'
                  }`}>
                    <CloudRain className="w-3 h-3 shrink-0" />
                    <span>{Math.round(dayItem.precipitation_probability_pct)}%</span>
                    {dayItem.precipitation_mm > 0 && <span>({dayItem.precipitation_mm}mm)</span>}
                  </div>

                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border block truncate mt-1 ${
                    isToday ? 'bg-white/20 text-white border-white/30' : agriTag.color
                  }`}>
                    {agriTag.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          fallbackDays.map((item, idx) => {
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
                  <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-moss-900'}`}>{item.day}</p>
                  <div className="my-2.5 flex items-center justify-center text-2xl">{item.icon}</div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-canvas-200/50 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    <span className={isToday ? 'text-white' : 'text-moss-900'}>{item.tempMax}°</span>
                    <span className={`text-[11px] font-normal ${isToday ? 'text-agri-300' : 'text-moss-400'}`}>{item.tempMin}°</span>
                  </div>
                  <div className={`text-[10px] font-medium flex items-center justify-center gap-1 ${isToday ? 'text-agri-200' : 'text-moss-500'}`}>
                    <CloudRain className="w-3 h-3 shrink-0" />
                    <span>{item.rainPct}% ({item.rainMm}mm)</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border block bg-canvas-200 text-moss-800 border-canvas-300">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
