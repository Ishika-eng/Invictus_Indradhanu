from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farm import Farm
from app.models.crop import Crop
from app.models.farm_crop import FarmCrop
from app.models.climate import ClimateObservation
from app.core.exceptions import EntityNotFoundException
from app.core.logging import logger
from app.services.climate.open_meteo_service import OpenMeteoService
from app.services.climate.nasa_power_service import NASAPowerService
from app.services.climate.climate_cache_service import climate_cache
from app.services.climate.gdd_service import GDDService


class ClimateAggregationService:
    """Orchestrates live Open-Meteo forecasting, NASA POWER historical observations, and GDD analysis."""

    @staticmethod
    async def get_farm(db: AsyncSession, farm_id: uuid.UUID) -> Farm:
        result = await db.execute(
            select(Farm)
            .options(
                selectinload(Farm.active_crop),
                selectinload(Farm.active_stage),
                selectinload(Farm.farm_crops).selectinload(FarmCrop.crop),
            )
            .where(Farm.id == farm_id)
        )
        farm = result.scalar_one_or_none()
        if not farm:
            raise EntityNotFoundException(f"Farm plot with id '{farm_id}' not found.")
        return farm

    @classmethod
    async def _fetch_and_cache_weather(
        cls,
        db: AsyncSession,
        farm: Farm,
        bypass_cache: bool = False,
    ) -> Tuple[Dict[str, Any], bool]:
        """Retrieves weather data from cache or Open-Meteo, persisting observations on fresh fetch only."""
        cache_key = f"weather:{round(farm.latitude, 3)}:{round(farm.longitude, 3)}"
        cached_data = None if bypass_cache else climate_cache.get(cache_key)
        if cached_data:
            return cached_data, True

        weather_data = await OpenMeteoService.fetch_weather(farm.latitude, farm.longitude)
        climate_cache.set(cache_key, weather_data, ttl_seconds=1800)  # 30 min TTL

        # Persist fresh observations to database in a single transaction
        try:
            current = weather_data["current"]
            obs_curr = ClimateObservation(
                farm_id=farm.id,
                source="OPEN_METEO",
                observation_type="current",
                observation_time=datetime.now(timezone.utc),
                retrieval_timestamp=datetime.now(timezone.utc),
                temperature_c=current["temperature_c"],
                feels_like_c=current.get("feels_like_c"),
                temp_min_c=current.get("temperature_c"),
                temp_max_c=current.get("temperature_c"),
                relative_humidity_pct=current["relative_humidity_pct"],
                precipitation_probability_pct=current.get("rain_probability_pct", 0.0),
                rain_expected_mm=current.get("precipitation_mm", 0.0),
                wind_speed_kmh=current.get("wind_speed_kmh", 0.0),
                wind_direction_deg=current.get("wind_direction_deg"),
                weather_code=current.get("weather_code"),
                weather_condition=current.get("weather_condition"),
                is_in_situ_sensor=False,
                soil_moisture_0_10cm_pct=None,
                soil_moisture_10_40cm_pct=None,
                raw_payload={"current": current},
            )
            db.add(obs_curr)

            daily_list = weather_data.get("daily_forecast", [])
            for day in daily_list:
                f_date = datetime.strptime(day["date"], "%Y-%m-%d").date()
                obs_fore = ClimateObservation(
                    farm_id=farm.id,
                    source="OPEN_METEO",
                    observation_type="forecast",
                    observation_time=datetime.now(timezone.utc),
                    retrieval_timestamp=datetime.now(timezone.utc),
                    forecast_date=f_date,
                    forecast_day=day.get("day_number"),
                    temperature_c=(day["temp_max_c"] + day["temp_min_c"]) / 2.0,
                    temp_min_c=day.get("temp_min_c"),
                    temp_max_c=day.get("temp_max_c"),
                    relative_humidity_pct=current["relative_humidity_pct"],
                    precipitation_probability_pct=day.get("precipitation_probability_pct", 0.0),
                    rain_expected_mm=day.get("precipitation_mm", 0.0),
                    wind_speed_kmh=day.get("wind_speed_max_kmh", 0.0),
                    weather_code=day.get("weather_code"),
                    weather_condition=day.get("weather_condition"),
                    is_in_situ_sensor=False,
                    raw_payload={"daily": day},
                )
                db.add(obs_fore)

            await db.commit()
        except Exception as e:
            logger.warning(f"Could not persist climate observations: {e}")
            await db.rollback()

        return weather_data, False

    @classmethod
    def _format_current_response(cls, farm: Farm, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Formats the current micro-climate response dictionary."""
        return {
            "farm_id": str(farm.id),
            "farm_name": farm.name,
            "latitude": farm.latitude,
            "longitude": farm.longitude,
            "data_source": "Open-Meteo v1 (WMO-standard NWP)",
            "observation_type": "current_weather",
            "last_updated": weather_data.get("retrieval_timestamp"),
            "current": weather_data["current"],
            "soil_sensor": {
                "installed": False,
                "sensor_id": None,
                "status": "UNAVAILABLE",
                "in_situ_moisture_pct": None,
                "notice": (
                    "No physical IoT capacitive probe installed on this plot. "
                    "Physical in-situ root hydration telemetry is marked as unavailable."
                ),
            },
        }

    @classmethod
    def _format_forecast_response(cls, farm: Farm, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Formats the 7-day forecast response dictionary."""
        return {
            "farm_id": str(farm.id),
            "farm_name": farm.name,
            "latitude": farm.latitude,
            "longitude": farm.longitude,
            "data_source": "Open-Meteo v1 (High-Resolution NWP)",
            "observation_type": "7_day_forecast",
            "last_updated": weather_data.get("retrieval_timestamp"),
            "daily_forecast": weather_data.get("daily_forecast", []),
            "hourly_24h": weather_data.get("hourly_24h", []),
        }

    @classmethod
    async def get_current_weather(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
        bypass_cache: bool = False,
    ) -> Dict[str, Any]:
        """Returns current micro-climate for a farm with IoT sensor status and Open-Meteo readings."""
        farm = await cls.get_farm(db, farm_id)
        weather_data, _ = await cls._fetch_and_cache_weather(db, farm, bypass_cache=bypass_cache)
        return cls._format_current_response(farm, weather_data)

    @classmethod
    async def get_forecast(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
        bypass_cache: bool = False,
    ) -> Dict[str, Any]:
        """Returns 7-day daily forecast and 24-hour hourly trend for a farm plot."""
        farm = await cls.get_farm(db, farm_id)
        weather_data, _ = await cls._fetch_and_cache_weather(db, farm, bypass_cache=bypass_cache)
        return cls._format_forecast_response(farm, weather_data)

    @classmethod
    async def get_current_and_forecast(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
        bypass_cache: bool = False,
        farm: Optional[Farm] = None,
    ) -> Tuple[Dict[str, Any], Dict[str, Any], Farm]:
        """Fetches current and 7-day forecast concurrently with unified cache and single farm lookup."""
        if farm is None:
            farm = await cls.get_farm(db, farm_id)
        weather_data, _ = await cls._fetch_and_cache_weather(db, farm, bypass_cache=bypass_cache)
        current_data = cls._format_current_response(farm, weather_data)
        forecast_data = cls._format_forecast_response(farm, weather_data)
        return current_data, forecast_data, farm

    @classmethod
    async def get_historical_climate(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
        days: int = 30,
        bypass_cache: bool = False,
    ) -> Dict[str, Any]:
        """Fetches historical agroclimatology from NASA POWER and computes GDD accumulation."""
        farm = await cls.get_farm(db, farm_id)
        days = max(7, min(days, 90))

        end_d = date.today() - timedelta(days=2)
        start_d = end_d - timedelta(days=days)

        cache_key = f"nasa:{round(farm.latitude, 3)}:{round(farm.longitude, 3)}:{start_d}:{end_d}"
        history = None if bypass_cache else climate_cache.get(cache_key)

        if not history:
            history = await NASAPowerService.fetch_historical(
                farm.latitude, farm.longitude, start_date=start_d, end_date=end_d
            )
            if history.get("status") == "success":
                climate_cache.set(cache_key, history, ttl_seconds=86400)  # 24 hours

        # Active crop detection for GDD calculation
        active_crop_name = None
        sowing_d = None
        if farm.active_crop:
            active_crop_name = farm.active_crop.name
        elif farm.farm_crops:
            active_farm_crop = next((fc for fc in farm.farm_crops if fc.status == "active"), None)
            if active_farm_crop and active_farm_crop.crop:
                active_crop_name = active_farm_crop.crop.name
                sowing_d = active_farm_crop.sowing_date

        # GDD Analysis if active crop exists
        gdd_analysis = None
        if active_crop_name and history.get("records"):
            gdd_analysis = GDDService.calculate_accumulated_gdd(
                crop_name=active_crop_name,
                daily_observations=history["records"],
                sowing_date=sowing_d,
            )

        return {
            "farm_id": str(farm.id),
            "farm_name": farm.name,
            "latitude": farm.latitude,
            "longitude": farm.longitude,
            "data_source": "NASA POWER Agroclimatology (Daily Satellite/Reanalysis)",
            "observation_type": "historical_climate",
            "start_date": start_d.isoformat(),
            "end_date": end_d.isoformat(),
            "days_analyzed": days,
            "summary": history.get("summary", {}),
            "daily_records": history.get("records", []),
            "growing_degree_days": gdd_analysis,
        }

    @classmethod
    async def refresh_climate_data(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """Forces an explicit refresh by bypassing external cache."""
        current = await cls.get_current_weather(db, farm_id, bypass_cache=True)
        forecast = await cls.get_forecast(db, farm_id, bypass_cache=True)
        return {
            "status": "refreshed",
            "refreshed_at": datetime.now(timezone.utc).isoformat(),
            "current": current["current"],
            "daily_forecast": forecast["daily_forecast"],
        }

