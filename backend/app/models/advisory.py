import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Float, ForeignKey, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farmer import Farmer
    from app.models.farm import Farm
    from app.models.crop import Crop, CropGrowthStage
    from app.models.risk import RiskAssessment
    from app.models.delivery import DeliveryLog
    from app.models.audit import AdvisoryAuditLog


class Advisory(Base, TimestampMixin):
    """Actionable climate and crop recommendation entity."""

    __tablename__ = "advisories"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farmers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    crop_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("crops.id", ondelete="CASCADE"), index=True, nullable=False
    )
    growth_stage_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("crop_growth_stages.id", ondelete="SET NULL"), nullable=True
    )
    risk_assessment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("risk_assessments.id", ondelete="SET NULL"), index=True, nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20), default="GENERATED", index=True, nullable=False
    )
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    confidence_pct: Mapped[float] = mapped_column(Float, default=94.0, nullable=False)

    # Core Action Directives
    immediate_action: Mapped[str] = mapped_column(Text, nullable=False)
    why_it_matters: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_timing: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_if_ignored: Mapped[str] = mapped_column(String(500), nullable=False)
    projected_impact: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Structured arrays and multilingual dictionary payloads
    action_steps: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    scientific_reasoning: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    supporting_evidence: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    translations: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Compliance, Safety & Data Transparency
    data_limitations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(
        String(100), default="rule_engine+gemini-1.5-flash", nullable=True
    )
    disclaimer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    needs_expert_review: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Stage 7 Admin & Audit Governance
    action_status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False, index=True
    )  # PENDING, APPLIED, PARTIALLY_APPLIED, IGNORED, EXPIRED
    farmer_feedback: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    operator_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="advisories", lazy="selectin")
    farm: Mapped["Farm"] = relationship("Farm", back_populates="advisories", lazy="selectin")
    crop: Mapped["Crop"] = relationship("Crop", lazy="selectin")
    growth_stage: Mapped[Optional["CropGrowthStage"]] = relationship("CropGrowthStage", lazy="selectin")
    risk_assessment: Mapped[Optional["RiskAssessment"]] = relationship(
        "RiskAssessment", back_populates="advisory", lazy="selectin"
    )
    delivery_logs: Mapped[List["DeliveryLog"]] = relationship(
        "DeliveryLog", back_populates="advisory", cascade="all, delete-orphan", lazy="selectin"
    )
    audit_logs: Mapped[List["AdvisoryAuditLog"]] = relationship(
        "AdvisoryAuditLog", back_populates="advisory", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Advisory(id={self.id}, farmer_id={self.farmer_id}, crop_id={self.crop_id}, status='{self.status}')>"

