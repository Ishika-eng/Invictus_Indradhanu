import React from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudLightning, 
  Cloud, 
  Droplets, 
  Wind, 
  Thermometer, 
  Eye, 
  ArrowDown, 
  ArrowUp,
  Sparkles
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';

export const WeatherConditions: React.FC = () => {
  const { weatherData, forecast7Day, selectedFarmer } = useAdvisory();

  const getWeatherIcon = (code: string) => {
    switch (code) {
      case 'storm':
        return <CloudLightning className="w-6 h-6 text-amber-500 animate-pulse" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-skyalt-500" />;
      case 'sunny':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-moss-500" />;
      default:
        return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Micro-Station Atmospheric Bar */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-skyalt-500 animate-pulse" />
              <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
                Live Micro-Zone Atmosphere ({selectedFarmer.location.village})
              </h3>
            </div>
            <p className="text-xs text-moss-500 mt-0.5">
              Source: Open-Meteo High-Resolution Ensemble (0.05° grid)
            </p>
          </div>
          
          <div className="bg-skyalt-50 text-skyalt-800 border border-skyalt-200 px-3 py-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            14h Convective Window
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-canvas-100/70 border border-canvas-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-moss-500 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-earth-600" />
              <span>Solar Radiation</span>
            </span>
            <p className="text-xl font-display font-extrabold text-moss-900 mt-1">
              {weatherData.solarRadiationWm2} <span className="text-xs font-normal text-moss-600">W/m²</span>
            </p>
            <p className="text-[10px] text-moss-500 mt-0.5">Photosynthetic active</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-canvas-100/70 border border-canvas-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-moss-500 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-skyalt-600" />
              <span>Evapotranspiration</span>
            </span>
            <p className="text-xl font-display font-extrabold text-moss-900 mt-1">
              {weatherData.evapotranspirationMm} <span className="text-xs font-normal text-moss-600">mm/day</span>
            </p>
            <p className="text-[10px] text-moss-500 mt-0.5">Crop water loss speed</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-canvas-100/70 border border-canvas-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-moss-500 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-agri-600" />
              <span>Wind Direction</span>
            </span>
            <p className="text-xl font-display font-extrabold text-moss-900 mt-1">
              {weatherData.windSpeedKmh} <span className="text-xs font-normal text-moss-600">km/h</span>
            </p>
            <p className="text-[10px] text-moss-500 mt-0.5">{weatherData.windDirection}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-canvas-100/70 border border-canvas-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-moss-500 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>UV Index</span>
            </span>
            <p className="text-xl font-display font-extrabold text-moss-900 mt-1">
              {weatherData.uvIndex} <span className="text-xs font-normal text-amber-700 font-semibold">(High)</span>
            </p>
            <p className="text-[10px] text-moss-500 mt-0.5">Peak noon radiation</p>
          </div>
        </div>
      </div>

      {/* 7-Day Agro-Meteorological Forecast Cards */}
      <div className="rounded-3xl bg-white border border-canvas-300 shadow-soft p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-moss-900">
              7-Day Agro-Meteorological Outlook
            </h3>
            <p className="text-xs text-moss-500 mt-0.5">
              Daily precipitation, thermal swings, and actionable farm risk tags
            </p>
          </div>
          <span className="text-[11px] font-semibold text-agri-800 bg-agri-100/60 px-2.5 py-1 rounded-xl border border-agri-200">
            Open-Meteo High-Res
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {forecast7Day.map((day, idx) => {
            const isToday = idx === 0;
            return (
              <div
                key={day.day}
                className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                  isToday
                    ? 'bg-agri-800 text-white border-agri-600 shadow-soft'
                    : 'bg-canvas-100/70 text-moss-900 border-canvas-300 hover:bg-canvas-200/80'
                }`}
              >
                <div>
                  <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-moss-900'}`}>
                    {day.day}
                  </p>
                  <p className={`text-[10px] ${isToday ? 'text-agri-200' : 'text-moss-500'}`}>
                    {day.date}
                  </p>

                  <div className="my-3 flex items-center justify-center">
                    {getWeatherIcon(day.weatherCode)}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    <span>{day.tempMax}°</span>
                    <span className={`text-[10px] ${isToday ? 'text-agri-300' : 'text-moss-400'}`}>
                      {day.tempMin}°
                    </span>
                  </div>

                  <div className={`mt-2 text-[10px] font-semibold ${
                    day.rainChance > 50 
                      ? isToday ? 'text-skyalt-300 font-bold' : 'text-skyalt-700 font-bold'
                      : isToday ? 'text-canvas-300' : 'text-moss-500'
                  }`}>
                    💧 {day.rainChance}% ({day.rainMm}mm)
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-canvas-200/40">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md inline-block ${
                    day.riskTag === 'Rain Alert'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : day.riskTag === 'Hold Spray'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : day.riskTag === 'Irrigate'
                      ? 'bg-skyalt-500/20 text-skyalt-300 border border-skyalt-400/30'
                      : isToday
                      ? 'bg-agri-700 text-agri-200'
                      : 'bg-white text-moss-700 border border-canvas-300'
                  }`}>
                    {day.riskTag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
