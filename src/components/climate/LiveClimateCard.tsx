import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudLightning, 
  Droplets, 
  Wind, 
  Thermometer, 
  Compass,
  MapPin,
  Sparkles,
  RefreshCw,
  Loader2,
  Radio
} from 'lucide-react';
import { useAdvisory } from '../../context/AdvisoryContext';
import { useAuth } from '../../context/AuthContext';
import { fetchFarmCurrentClimate, refreshFarmClimate, CurrentClimateData } from '../../services/api';

export const LiveClimateCard: React.FC = () => {
  const { selectedLocation, selectedCrop } = useAdvisory();
  const { selectedFarm, session } = useAuth();

  const [liveClimate, setLiveClimate] = useState<CurrentClimateData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadCurrentWeather() {
      if (!selectedFarm?.id || !session?.access_token) return;
      setLoading(true);
      try {
        const data = await fetchFarmCurrentClimate(selectedFarm.id, session.access_token);
        if (mounted) {
          setLiveClimate(data);
          setLastRefreshedAt(data.last_updated);
        }
      } catch (err) {
        console.warn('Live climate lookup fallback to preset:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCurrentWeather();
    return () => { mounted = false; };
  }, [selectedFarm?.id, session?.access_token]);

  const handleManualRefresh = async () => {
    if (!selectedFarm?.id || !session?.access_token) return;
    setRefreshing(true);
    try {
      await refreshFarmClimate(selectedFarm.id, session.access_token);
      const data = await fetchFarmCurrentClimate(selectedFarm.id, session.access_token);
      setLiveClimate(data);
      setLastRefreshedAt(data.last_updated);
    } catch (err) {
      console.warn('Climate refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Values from live API or preset fallback
  const tempC = liveClimate ? liveClimate.current.temperature_c : selectedLocation.tempC;
  const feelsLikeC = liveClimate ? liveClimate.current.feels_like_c : selectedLocation.tempC + 3;
  const rainProb = liveClimate ? liveClimate.current.rain_probability_pct : selectedLocation.rainProbPct;
  const precipMm = liveClimate ? liveClimate.current.precipitation_mm : 38;
  const humidity = liveClimate ? liveClimate.current.relative_humidity_pct : selectedLocation.humidityPct;
  const windKmh = liveClimate ? liveClimate.current.wind_speed_kmh : selectedLocation.windKmh;
  const windDir = liveClimate ? liveClimate.current.wind_direction_deg : 210;
  const condition = liveClimate ? liveClimate.current.weather_condition : (rainProb > 50 ? 'Convective Rain Front Expected' : 'Clear / Mild Humidity');
  const weatherIcon = liveClimate ? liveClimate.current.weather_icon : (rainProb > 50 ? '🌧️' : '☀️');
  const dataSource = liveClimate ? liveClimate.data_source : 'NWP Synthetic Baseline';
  const locationLabel = selectedFarm ? `${selectedFarm.name} (${selectedLocation.city})` : `${selectedLocation.city}, ${selectedLocation.state}`;

  const isRainy = rainProb > 50;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-moss-900 via-moss-800 to-agri-950 text-white p-6 sm:p-7 border border-agri-600/30 shadow-soft-lg">
      
      {/* Dynamic Environmental Weather Animation Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-4 left-10 w-48 h-20 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-16 right-20 w-60 h-24 bg-skyalt-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

        {isRainy && (
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] bg-gradient-to-b from-transparent via-skyalt-300 to-transparent rounded-full animate-pulse"
                style={{
                  height: `${24 + (i % 5) * 8}px`,
                  left: `${(i * 5.8)}%`,
                  top: `${(i % 4) * 20}%`,
                  animationDuration: `${1.2 + (i % 3) * 0.4}s`,
                  animationDelay: `${(i % 6) * 0.2}s`,
                  transform: 'rotate(15deg)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-moss-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white shadow-glow-agri shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-lg text-white">
                {locationLabel}
              </h3>
              <span className="text-[10px] font-mono uppercase bg-agri-600/50 text-agri-200 px-2 py-0.5 rounded border border-agri-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live NWP Telemetry
              </span>
            </div>
            <p className="text-xs text-moss-400 mt-0.5">
              Micro-climate monitoring for <strong className="text-agri-200">{selectedCrop}</strong> field
              {selectedFarm && (
                <span className="ml-2 font-mono text-[10px] text-moss-400">
                  [{selectedFarm.latitude.toFixed(4)}°N, {selectedFarm.longitude.toFixed(4)}°E]
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Condition Pill & Refresh Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-moss-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-moss-700 text-xs font-semibold text-agri-200">
            <span className="text-base">{weatherIcon}</span>
            <span>{condition}</span>
          </div>

          {selectedFarm && (
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Force refresh weather data bypassing cache"
              className="p-2 rounded-xl bg-moss-800/80 hover:bg-moss-700 border border-moss-700 text-agri-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-agri-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Temperature & Metrics Hero */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
        
        {/* Temperature Card */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-agri-300 font-semibold uppercase">
            <span>Air Temp</span>
            <Thermometer className="w-4 h-4 text-earth-300" />
          </div>
          <div className="my-1.5">
            <span className="font-display font-black text-3xl sm:text-4xl text-white">
              {tempC}°C
            </span>
          </div>
          <span className="text-[10px] text-canvas-300">Feels like {feelsLikeC}°C</span>
        </div>

        {/* Rain Probability */}
        <div className="p-4 rounded-2xl bg-skyalt-950/40 backdrop-blur-md border border-skyalt-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-skyalt-300 font-semibold uppercase">
            <span>Rain Prob</span>
            <CloudRain className="w-4 h-4 text-skyalt-400" />
          </div>
          <div className="my-1.5">
            <span className="font-display font-black text-3xl sm:text-4xl text-skyalt-200">
              {rainProb}%
            </span>
          </div>
          <span className="text-[10px] text-skyalt-300 font-medium">{precipMm} mm expected in 24h</span>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-agri-300 font-semibold uppercase">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-agri-300" />
          </div>
          <div className="my-1.5">
            <span className="font-display font-black text-3xl sm:text-4xl text-white">
              {humidity}%
            </span>
          </div>
          <span className="text-[10px] text-canvas-300">Relative Humidity</span>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-canvas-300 font-semibold uppercase">
            <span>Wind Speed</span>
            <Wind className="w-4 h-4 text-canvas-300" />
          </div>
          <div className="my-1.5">
            <span className="font-display font-black text-3xl sm:text-4xl text-white">
              {windKmh} <span className="text-xs font-normal">km/h</span>
            </span>
          </div>
          <span className="text-[10px] text-canvas-300">Bearing: {windDir}°</span>
        </div>
      </div>

      {/* Atmospheric Insight Footer */}
      <div className="relative z-10 pt-3 border-t border-moss-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-canvas-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>Source: <strong>{dataSource}</strong></span>
        </div>
        {lastRefreshedAt && (
          <span className="font-mono text-agri-300 text-[10px]">
            Retrieved: {new Date(lastRefreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
