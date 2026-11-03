import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.advisory import Advisory


class Crop(Base, TimestampMixin):
    """Crop catalog entity with phenology profiles."""

    __tablename__ = "crops"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    scientific_name: Mapped[str] = mapped_column(String(150), nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    water_demand: Mapped[str] = mapped_column(
        String(50), default="Moderate", nullable=False
    )
    ideal_soil: Mapped[str] = mapped_column(String(150), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    growth_stages: Mapped[List["CropGrowthStage"]] = relationship(
        "CropGrowthStage",
        back_populates="crop",
        cascade="all, delete-orphan",
        order_by="CropGrowthStage.stage_order",
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
    water_sensitivity: Mapped[str] = mapped_column(
        String(50), default="Moderate", nullable=False
    )
    description: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relationship
    crop: Mapped["Crop"] = relationship("Crop", back_populates="growth_stages")

    def __repr__(self) -> str:
        return f"<CropGrowthStage(id={self.id}, crop_id={self.crop_id}, stage='{self.stage_name}')>"

