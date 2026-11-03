from datetime import datetime, timezone
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm


class ClimateObservation(Base, TimestampMixin):
    """Real-time micro-climate and root-zone sensor telemetry for a farm plot."""

    __tablename__ = "climate_observations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    source: Mapped[str] = mapped_column(
        String(50), default="OPEN_METEO", index=True, nullable=False
    )
    observation_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, nullable=False
    )

    # Atmospheric Metrics
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    feels_like_c: Mapped[float] = mapped_column(Float, nullable=False)
    relative_humidity_pct: Mapped[float] = mapped_column(Float, nullable=False)
    precipitation_probability_pct: Mapped[float] = mapped_column(Float, nullable=False)
    rain_expected_mm: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wind_speed_kmh: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wind_direction_deg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    solar_radiation_wm2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evapotranspiration_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Root-Zone Soil Hydration Metrics
    soil_moisture_0_10cm_pct: Mapped[float] = mapped_column(Float, nullable=False)
    soil_moisture_10_40cm_pct: Mapped[float] = mapped_column(Float, nullable=False)
    soil_moisture_40_100cm_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_temperature_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Ingested raw telemetry payload for auditing
    raw_payload: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationship
    farm: Mapped["Farm"] = relationship("Farm", back_populates="climate_observations")

    def __repr__(self) -> str:
        return f"<ClimateObservation(id={self.id}, farm_id={self.farm_id}, temp={self.temperature_c}C, rain_prob={self.precipitation_probability_pct}%)>"

