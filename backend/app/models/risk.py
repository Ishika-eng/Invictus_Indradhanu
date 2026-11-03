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
        String(20), default="LOW", nullable=False, index=True
    )  # 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    
    # 7 Core Risk Category Scores
    rainfall_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    waterlogging_risk_score: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    heat_risk_score: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    cold_risk_score: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    temperature_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    humidity_disease_risk_score: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    wind_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    soil_moisture_risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Null if sensor unavailable

    # Meta, confidence, and methodology tracking
    confidence_level: Mapped[str] = mapped_column(
        String(20), default="HIGH", nullable=False
    )  # 'HIGH', 'MEDIUM', 'LOW'
    scoring_methodology: Mapped[str] = mapped_column(
        String(100), default="AGRONOMIC_MULTI_CRITERIA_V1", nullable=False
    )

    # Structured factor breakdowns & daily projections
    risk_factors: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    daily_timeline: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    input_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    farm: Mapped["Farm"] = relationship("Farm", back_populates="risk_assessments")
    crop: Mapped[Optional["Crop"]] = relationship("Crop", lazy="selectin")
    growth_stage: Mapped[Optional["CropGrowthStage"]] = relationship("CropGrowthStage", lazy="selectin")
    advisory: Mapped[Optional["Advisory"]] = relationship(
        "Advisory", back_populates="risk_assessment", uselist=False
    )

    def __repr__(self) -> str:
        return f"<RiskAssessment(id={self.id}, farm_id={self.farm_id}, score={self.overall_risk_score}, level='{self.overall_risk_level}')>"
