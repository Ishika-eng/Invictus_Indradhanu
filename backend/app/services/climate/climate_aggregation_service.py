from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
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
    async def get_current_weather(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
        bypass_cache: bool = False,
    ) -> Dict[str, Any]:
        """Returns current micro-climate for a farm with IoT sensor status and Open-Meteo readings."""
        farm = await cls.get_farm(db, farm_id)
        farm_id_val = farm.id
        farm_id_str = str(farm.id)
        farm_name_str = farm.name
        farm_lat = farm.latitude
        farm_lng = farm.longitude
        cache_key = f"current:{round(farm.latitude, 3)}:{round(farm.longitude, 3)}"

        weather_data = None if bypass_cache else climate_cache.get(cache_key)
        if not weather_data:
            weather_data = await OpenMeteoService.fetch_weather(farm_lat, farm_lng)
            climate_cache.set(cache_key, weather_data, ttl_seconds=1800)  # 30 min TTL

        current = weather_data["current"]

        # Persist current observation to database
        try:
            obs = ClimateObservation(
                farm_id=farm_id_val,
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
                soil_moisture_0_10cm_pct=None,  # Explicitly None: No physical IoT sensor
                soil_moisture_10_40cm_pct=None,
                raw_payload={"current": current},
            )
            db.add(obs)
            await db.commit()
        except Exception as e:
            logger.warning(f"Could not persist current climate observation: {e}")
            await db.rollback()

        return {
            "farm_id": farm_id_str,
            "farm_name": farm_name_str,
            "latitude": farm_lat,
            "longitude": farm_lng,
            "data_source": "Open-Meteo v1 (WMO-standard NWP)",
            "observation_type": "current_weather",
            "last_updated": weather_data.get("retrieval_timestamp"),
            "current": current,
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
    async def get_forecast(
        cls,
        db: AsyncSession,
        farm_id: uuid.UUID,
        bypass_cache: bool = False,
    ) -> Dict[str, Any]:
        """Returns 7-day daily forecast and 24-hour hourly trend for a farm plot."""
        farm = await cls.get_farm(db, farm_id)
        farm_id_val = farm.id
        farm_id_str = str(farm.id)
        farm_name_str = farm.name
        farm_lat = farm.latitude
        farm_lng = farm.longitude
        cache_key = f"forecast:{round(farm.latitude, 3)}:{round(farm.longitude, 3)}"

        weather_data = None if bypass_cache else climate_cache.get(cache_key)
        if not weather_data:
            weather_data = await OpenMeteoService.fetch_weather(farm_lat, farm_lng)
            climate_cache.set(cache_key, weather_data, ttl_seconds=1800)

        daily_list = weather_data.get("daily_forecast", [])

        # Persist daily forecasts to database
        try:
            for day in daily_list:
                f_date = datetime.strptime(day["date"], "%Y-%m-%d").date()
                obs = ClimateObservation(
                    farm_id=farm_id_val,
                    source="OPEN_METEO",
                    observation_type="forecast",
                    observation_time=datetime.now(timezone.utc),
                    retrieval_timestamp=datetime.now(timezone.utc),
                    forecast_date=f_date,
                    forecast_day=day.get("day_number"),
                    temperature_c=(day["temp_max_c"] + day["temp_min_c"]) / 2.0,
                    temp_min_c=day.get("temp_min_c"),
                    temp_max_c=day.get("temp_max_c"),
                    relative_humidity_pct=weather_data["current"]["relative_humidity_pct"],
                    precipitation_probability_pct=day.get("precipitation_probability_pct", 0.0),
                    rain_expected_mm=day.get("precipitation_mm", 0.0),
                    wind_speed_kmh=day.get("wind_speed_max_kmh", 0.0),
                    weather_code=day.get("weather_code"),
                    weather_condition=day.get("weather_condition"),
                    is_in_situ_sensor=False,
                    raw_payload={"daily": day},
                )
                db.add(obs)
            await db.commit()
        except Exception as e:
            logger.warning(f"Could not persist forecast observations: {e}")
            await db.rollback()

        return {
            "farm_id": farm_id_str,
            "farm_name": farm_name_str,
            "latitude": farm_lat,
            "longitude": farm_lng,
            "data_source": "Open-Meteo v1 (High-Resolution NWP)",
            "observation_type": "7_day_forecast",
            "last_updated": weather_data.get("retrieval_timestamp"),
            "daily_forecast": daily_list,
            "hourly_24h": weather_data.get("hourly_24h", []),
        }

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

