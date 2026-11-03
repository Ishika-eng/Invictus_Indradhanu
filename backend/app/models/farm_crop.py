import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Date, Float, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.crop import Crop, CropGrowthStage


class FarmCrop(Base, TimestampMixin):
    """Represents a specific crop cycle or crop cultivation on a farm plot."""

    __tablename__ = "farm_crops"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    crop_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("crops.id", ondelete="RESTRICT"), index=True, nullable=False
    )
    variety: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    cultivated_acreage: Mapped[float] = mapped_column(Float, nullable=False)
    sowing_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_harvest_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    current_stage_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("crop_growth_stages.id", ondelete="SET NULL"), nullable=True, index=True
    )
    current_stage_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False, index=True
    )  # 'active', 'harvested', 'planned', 'fallow'
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    farm: Mapped["Farm"] = relationship("Farm", back_populates="farm_crops")
    crop: Mapped["Crop"] = relationship("Crop", back_populates="farm_crops", lazy="selectin")
    current_stage: Mapped[Optional["CropGrowthStage"]] = relationship(
        "CropGrowthStage", back_populates="farm_crops", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<FarmCrop(id={self.id}, farm_id={self.farm_id}, crop_id={self.crop_id}, status='{self.status}')>"

