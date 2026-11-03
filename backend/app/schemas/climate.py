import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ClimateObservationBase(BaseModel):
    source: str = Field("OPEN_METEO", json_schema_extra={"example": "OPEN_METEO"})
    observation_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    temperature_c: float
    feels_like_c: Optional[float] = None
    relative_humidity_pct: float
    precipitation_probability_pct: float = 0.0
    rain_expected_mm: float = 0.0
    wind_speed_kmh: float = 0.0
    wind_direction_deg: Optional[float] = None
    solar_radiation_wm2: Optional[float] = None
    weather_code: Optional[int] = None
    weather_condition: Optional[str] = None
    is_in_situ_sensor: bool = False
    soil_moisture_0_10cm_pct: Optional[float] = None


class ClimateObservationCreate(ClimateObservationBase):
    farm_id: uuid.UUID
    raw_payload: Optional[dict] = None


class ClimateObservationResponse(ClimateObservationBase):
    id: uuid.UUID
    farm_id: uuid.UUID
    retrieval_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Comprehensive Stage 3 API Responses
# ==============================================================================

class CurrentWeatherMetrics(BaseModel):
    temperature_c: float
    feels_like_c: float
    relative_humidity_pct: float
    precipitation_mm: float
    rain_probability_pct: float
    wind_speed_kmh: float
    wind_direction_deg: float
    weather_code: int
    weather_condition: str
    weather_description: str
    weather_icon: str
    timestamp: str


class SoilSensorStatus(BaseModel):
    installed: bool = False
    sensor_id: Optional[str] = None
    status: str = "UNAVAILABLE"
    in_situ_moisture_pct: Optional[float] = None
    notice: str


class CurrentClimateResponse(BaseModel):
    farm_id: str
    farm_name: str
    latitude: float
    longitude: float
    data_source: str
    observation_type: str
    last_updated: str
    current: CurrentWeatherMetrics
    soil_sensor: SoilSensorStatus


class DailyForecastItem(BaseModel):
    day_number: int
    date: str
    temp_max_c: float
    temp_min_c: float
    precipitation_mm: float
    precipitation_probability_pct: float
    wind_speed_max_kmh: float
    weather_code: int
    weather_condition: str
    weather_icon: str


class HourlyForecastItem(BaseModel):
    time: str
    temperature_c: float
    humidity_pct: float
    precipitation_probability_pct: float
    precipitation_mm: float
    solar_radiation_wm2: float


class ClimateForecastResponse(BaseModel):
    farm_id: str
    farm_name: str
    latitude: float
    longitude: float
    data_source: str
    observation_type: str
    last_updated: str
    daily_forecast: List[DailyForecastItem]
    hourly_24h: List[HourlyForecastItem]


class HistoricalRecordItem(BaseModel):
    date: str
    temperature_avg_c: Optional[float] = None
    temperature_max_c: Optional[float] = None
    temperature_min_c: Optional[float] = None
    precipitation_mm: float = 0.0
    relative_humidity_pct: Optional[float] = None
    solar_radiation_mj_m2: Optional[float] = None


class HistoricalSummary(BaseModel):
    avg_temp_c: Optional[float] = None
    total_precipitation_mm: float = 0.0
    avg_relative_humidity_pct: Optional[float] = None
    avg_solar_radiation_mj_m2: Optional[float] = None


class GDDAnalysisResponse(BaseModel):
    crop_name: str
    supported: bool
    t_base_c: Optional[float] = None
    t_cutoff_c: Optional[float] = None
    accumulated_gdd: Optional[float] = None
    target_maturity_gdd: Optional[float] = None
    thermal_maturity_pct: Optional[float] = None
    days_evaluated: int = 0
    daily_gdd_series: List[Dict[str, Any]] = []
    summary_note: str


class HistoricalClimateResponse(BaseModel):
    farm_id: str
    farm_name: str
    latitude: float
    longitude: float
    data_source: str
    observation_type: str
    start_date: str
    end_date: str
    days_analyzed: int
    summary: HistoricalSummary
    daily_records: List[HistoricalRecordItem]
    growing_degree_days: Optional[GDDAnalysisResponse] = None


class ClimateRefreshResponse(BaseModel):
    status: str
    refreshed_at: str
    current: CurrentWeatherMetrics
    daily_forecast: List[DailyForecastItem]
