import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ClimateObservationBase(BaseModel):
    source: str = Field("OPEN_METEO", json_schema_extra={"example": "OPEN_METEO"})
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    temperature_c: float = Field(..., example=31.4)
    relative_humidity_pct: float = Field(..., example=78.2)
    precipitation_prob_pct: float = Field(..., example=84.0)
    precipitation_amount_mm: float = Field(..., example=24.5)
    wind_speed_kmh: float = Field(..., example=14.8)
    uv_index: Optional[float] = Field(None, example=6.2)
    evapotranspiration_mm: Optional[float] = Field(None, example=4.1)
    solar_radiation_mj: Optional[float] = Field(None, example=19.5)
    dew_point_c: Optional[float] = Field(None, example=24.0)

    # 3-depth Root-Zone Soil Hydration & Temperature
    soil_moisture_0_7cm: Optional[float] = Field(None, example=34.2)
    soil_moisture_7_28cm: Optional[float] = Field(None, example=41.5)
    soil_moisture_28_100cm: Optional[float] = Field(None, example=46.8)
    soil_temperature_0_7cm: Optional[float] = Field(None, example=28.1)
    soil_temperature_7_28cm: Optional[float] = Field(None, example=27.3)


class ClimateObservationCreate(ClimateObservationBase):
    farm_id: uuid.UUID
    raw_payload: Optional[dict] = None


class ClimateObservationResponse(ClimateObservationBase):
    id: uuid.UUID
    farm_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
