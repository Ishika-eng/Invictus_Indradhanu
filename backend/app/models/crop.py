import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.farm_crop import FarmCrop
    from app.models.advisory import Advisory


class Crop(Base, TimestampMixin):
    """Crop catalog entity with phenology profiles and agronomic environmental requirements."""

    __tablename__ = "crops"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    scientific_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # Agronomic environmental & growing requirements
    temp_min_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_max_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_optimal_min_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_optimal_max_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    water_demand: Mapped[str] = mapped_column(
        String(50), default="Moderate", nullable=False
    )
    water_requirement_mm_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    water_requirement_mm_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rainfall_min_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rainfall_max_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ideal_soil: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    soil_ph_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_ph_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    growing_season: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    root_depth_cm: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    agronomic_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    growth_stages: Mapped[List["CropGrowthStage"]] = relationship(
        "CropGrowthStage",
        back_populates="crop",
        cascade="all, delete-orphan",
        order_by="CropGrowthStage.stage_order",
        lazy="selectin",
    )
    farm_crops: Mapped[List["FarmCrop"]] = relationship(
        "FarmCrop",
        back_populates="crop",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Crop(id={self.id}, name='{self.name}', category='{self.category}')>"


class CropGrowthStage(Base, TimestampMixin):
    """Phenological growth stage associated with a crop."""

    __tablename__ = "crop_growth_stages"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    crop_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("crops.id", ondelete="CASCADE"), index=True, nullable=False
    )
    stage_name: Mapped[str] = mapped_column(String(100), nullable=False)
    stage_order: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    cumulative_start_day: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cumulative_end_day: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    water_sensitivity: Mapped[str] = mapped_column(
        String(50), default="Moderate", nullable=False
    )
    temp_critical_min_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_critical_max_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    vulnerability_notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    crop: Mapped["Crop"] = relationship("Crop", back_populates="growth_stages")
    farm_crops: Mapped[List["FarmCrop"]] = relationship(
        "FarmCrop",
        back_populates="current_stage",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<CropGrowthStage(id={self.id}, crop_id={self.crop_id}, stage='{self.stage_name}')>"

