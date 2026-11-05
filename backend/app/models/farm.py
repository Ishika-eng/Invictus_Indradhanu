import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Float, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin
from app.database.spatial import PointGeometry, PolygonGeometry

if TYPE_CHECKING:
    from app.models.farmer import Farmer
    from app.models.crop import Crop, CropGrowthStage
    from app.models.farm_crop import FarmCrop
    from app.models.climate import ClimateObservation
    from app.models.advisory import Advisory


class Farm(Base, TimestampMixin):
    """Farm plot entity. Supports multiple farms per farmer with PostGIS spatial geography."""

    __tablename__ = "farms"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farmers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), default="Main Plot", nullable=False)
    
    # Numeric coordinates for fast querying, indexing, and non-GIS serialization
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)

    # PostGIS Spatial Geometry fields (EPSG:4326)
    location_geom = mapped_column(PointGeometry(srid=4326), nullable=True)
    boundary_geom = mapped_column(PolygonGeometry(srid=4326), nullable=True)

    elevation_meters: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_type: Mapped[str] = mapped_column(
        String(100), default="Black Clay Soil (Vertisol)", nullable=False
    )
    irrigation_source: Mapped[str] = mapped_column(
        String(100), default="Drip Irrigation", nullable=False
    )
    acreage: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    micro_zone_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    # Active cultivation context
    active_crop_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True
    )
    active_stage_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("crop_growth_stages.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="farms")
    farm_crops: Mapped[List["FarmCrop"]] = relationship(
        "FarmCrop",
        back_populates="farm",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    active_crop: Mapped[Optional["Crop"]] = relationship(
        "Crop", foreign_keys=[active_crop_id], lazy="selectin"
    )
    active_stage: Mapped[Optional["CropGrowthStage"]] = relationship(
        "CropGrowthStage", foreign_keys=[active_stage_id], lazy="selectin"
    )
    climate_observations: Mapped[List["ClimateObservation"]] = relationship(
        "ClimateObservation",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    risk_assessments: Mapped[List["RiskAssessment"]] = relationship(
        "RiskAssessment",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    advisories: Mapped[List["Advisory"]] = relationship(
        "Advisory", back_populates="farm", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Farm(id={self.id}, name='{self.name}', farmer_id={self.farmer_id}, lat={self.latitude}, lng={self.longitude})>"

