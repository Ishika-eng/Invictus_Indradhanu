import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.services.climate.wmo_codes import decode_wmo_code


class OpenMeteoService:
    """Handles external API communication with Open-Meteo for high-resolution micro-climate forecasting."""

    BASE_URL = getattr(settings, "OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1")

    @classmethod
    async def fetch_weather(
        cls,
        latitude: float,
        longitude: float,
        retries: int = 2,
        timeout_seconds: float = 10.0,
    ) -> Dict[str, Any]:
        """Fetches current, hourly, and 7-day daily forecasts for coordinates."""
        endpoint = f"{cls.BASE_URL}/forecast"
        params = {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "current": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m"
            ),
            "daily": (
                "weather_code,temperature_2m_max,temperature_2m_min,"
                "apparent_temperature_max,apparent_temperature_min,"
                "precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
            ),
            "hourly": (
                "temperature_2m,relative_humidity_2m,precipitation_probability,"
                "precipitation,weather_code,wind_speed_10m,direct_normal_irradiance"
            ),
            "timezone": "auto",
            "forecast_days": 7,
        }

        last_error: Optional[Exception] = None
        for attempt in range(1, retries + 2):
            try:
                async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                    response = await client.get(endpoint, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        return cls._normalize_payload(data, latitude, longitude)
                    elif response.status_code == 429:
                        logger.warning(f"Open-Meteo rate limit hit (attempt {attempt}). Backing off.")
                        await asyncio.sleep(1.0 * attempt)
                    else:
                        response.raise_for_status()
            except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                last_error = e
                logger.warning(f"Open-Meteo attempt {attempt} failed for ({latitude}, {longitude}): {e}")
                if attempt <= retries:
                    await asyncio.sleep(0.5 * attempt)

        logger.error(f"Failed to fetch Open-Meteo weather after {retries + 1} attempts: {last_error}")
        raise RuntimeError(f"Open-Meteo weather service unavailable: {last_error}")

    @classmethod
    def _normalize_payload(cls, raw: Dict[str, Any], lat: float, lon: float) -> Dict[str, Any]:
        """Transforms and normalizes Open-Meteo API response."""
        current = raw.get("current", {})
        daily = raw.get("daily", {})
        hourly = raw.get("hourly", {})

        wmo = current.get("weather_code", 0)
        desc, condition, icon = decode_wmo_code(wmo)

        # 1. Normalized Current Weather
        current_normalized = {
            "temperature_c": float(current.get("temperature_2m", 0.0)),
            "feels_like_c": float(current.get("apparent_temperature", current.get("temperature_2m", 0.0))),
            "relative_humidity_pct": float(current.get("relative_humidity_2m", 0.0)),
            "precipitation_mm": float(current.get("precipitation", 0.0)),
            "wind_speed_kmh": float(current.get("wind_speed_10m", 0.0)),
            "wind_direction_deg": float(current.get("wind_direction_10m", 0.0)),
            "weather_code": int(wmo),
            "weather_condition": condition,
            "weather_description": desc,
            "weather_icon": icon,
            "timestamp": current.get("time", datetime.now(timezone.utc).isoformat()),
        }

        # 2. Normalized 7-Day Forecast
        daily_forecast: List[Dict[str, Any]] = []
        dates = daily.get("time", [])
        temp_maxs = daily.get("temperature_2m_max", [])
        temp_mins = daily.get("temperature_2m_min", [])
        rain_sums = daily.get("precipitation_sum", [])
        rain_probs = daily.get("precipitation_probability_max", [])
        wind_maxs = daily.get("wind_speed_10m_max", [])
        wmo_codes = daily.get("weather_code", [])

        for idx, date_str in enumerate(dates):
            w_code = int(wmo_codes[idx]) if idx < len(wmo_codes) else 0
            d_desc, d_cond, d_icon = decode_wmo_code(w_code)
            daily_forecast.append({
                "day_number": idx + 1,
                "date": date_str,
                "temp_max_c": float(temp_maxs[idx]) if idx < len(temp_maxs) else 0.0,
                "temp_min_c": float(temp_mins[idx]) if idx < len(temp_mins) else 0.0,
                "precipitation_mm": float(rain_sums[idx]) if idx < len(rain_sums) else 0.0,
                "precipitation_probability_pct": float(rain_probs[idx]) if idx < len(rain_probs) else 0.0,
                "wind_speed_max_kmh": float(wind_maxs[idx]) if idx < len(wind_maxs) else 0.0,
                "weather_code": w_code,
                "weather_condition": d_cond,
                "weather_icon": d_icon,
            })

        # Today's rain probability from day 1
        current_normalized["rain_probability_pct"] = (
            daily_forecast[0]["precipitation_probability_pct"] if daily_forecast else 0.0
        )

        # 3. Next 24 Hours Forecast
        hourly_times = hourly.get("time", [])
        hourly_temps = hourly.get("temperature_2m", [])
        hourly_hum = hourly.get("relative_humidity_2m", [])
        hourly_prob = hourly.get("precipitation_probability", [])
        hourly_precip = hourly.get("precipitation", [])
        hourly_solar = hourly.get("direct_normal_irradiance", [])

        hourly_forecast: List[Dict[str, Any]] = []
        for i in range(min(24, len(hourly_times))):
            hourly_forecast.append({
                "time": hourly_times[i],
                "temperature_c": float(hourly_temps[i]) if i < len(hourly_temps) else 0.0,
                "humidity_pct": float(hourly_hum[i]) if i < len(hourly_hum) else 0.0,
                "precipitation_probability_pct": float(hourly_prob[i]) if i < len(hourly_prob) else 0.0,
                "precipitation_mm": float(hourly_precip[i]) if i < len(hourly_precip) else 0.0,
                "solar_radiation_wm2": float(hourly_solar[i]) if i < len(hourly_solar) else 0.0,
            })

        return {
            "source": "OPEN_METEO",
            "latitude": lat,
            "longitude": lon,
            "elevation": raw.get("elevation"),
            "timezone": raw.get("timezone"),
            "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
            "current": current_normalized,
            "daily_forecast": daily_forecast,
            "hourly_24h": hourly_forecast,
            "raw_payload": raw,
        }

