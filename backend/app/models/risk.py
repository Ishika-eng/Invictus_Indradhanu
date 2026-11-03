from datetime import datetime, timezone
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.crop import Crop, CropGrowthStage
    from app.models.advisory import Advisory


class RiskAssessment(Base, TimestampMixin):
    """Evaluated agronomic risk score and multi-factor vulnerability assessment."""

    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    crop_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True
    )
    growth_stage_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("crop_growth_stages.id", ondelete="SET NULL"), nullable=True
    )
    assessment_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, nullable=False
    )

    # Composite & Granular Factor Scores (0 - 100 scale)
    overall_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    overall_risk_level: Mapped[str] = mapped_column(
        String(20), default="WATCH", nullable=False, index=True
    )
    rainfall_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    soil_moisture_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    temperature_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    wind_risk_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Structured factor bullets
    risk_factors: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Relationships
    farm: Mapped["Farm"] = relationship("Farm")
    crop: Mapped[Optional["Crop"]] = relationship("Crop")
    growth_stage: Mapped[Optional["CropGrowthStage"]] = relationship("CropGrowthStage")
    advisory: Mapped[Optional["Advisory"]] = relationship(
        "Advisory", back_populates="risk_assessment", uselist=False
    )

    def __repr__(self) -> str:
        return f"<RiskAssessment(id={self.id}, farm_id={self.farm_id}, score={self.overall_risk_score}, level='{self.overall_risk_level}')>"

