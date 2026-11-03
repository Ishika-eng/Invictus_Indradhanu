from datetime import datetime, date
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, JSON, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm


class ClimateObservation(Base, TimestampMixin):
    """Real-time micro-climate, forecasted weather, and historical agroclimatology for a farm plot."""

    __tablename__ = "climate_observations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    source: Mapped[str] = mapped_column(
        String(50), default="OPEN_METEO", index=True, nullable=False
    )  # 'OPEN_METEO', 'NASA_POWER', 'IOT_SENSOR'
    
    # Classification: 'current', 'forecast', 'historical', 'sensor'
    observation_type: Mapped[str] = mapped_column(
        String(30), default="current", index=True, nullable=False
    )
    observation_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, nullable=False
    )
    retrieval_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Forecast-specific metadata
    forecast_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    forecast_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1 to 7

    # Atmospheric Metrics
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    temp_min_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_max_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feels_like_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    relative_humidity_pct: Mapped[float] = mapped_column(Float, nullable=False)
    precipitation_probability_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rain_expected_mm: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wind_speed_kmh: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wind_direction_deg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    solar_radiation_wm2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evapotranspiration_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weather_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    weather_condition: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # In-Situ Physical Sensor Telemetry vs Modeled Satellite data
    is_in_situ_sensor: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sensor_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Root-Zone Soil Hydration Metrics (Nullable when physical probe is not installed)
    soil_moisture_0_10cm_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_moisture_10_40cm_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_moisture_40_100cm_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_temperature_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Ingested raw telemetry / forecast payload for auditing
    raw_payload: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationship
    farm: Mapped["Farm"] = relationship("Farm", back_populates="climate_observations")

    def __repr__(self) -> str:
        return (
            f"<ClimateObservation(id={self.id}, farm_id={self.farm_id}, "
            f"type={self.observation_type}, temp={self.temperature_c}C, source={self.source})>"
        )
