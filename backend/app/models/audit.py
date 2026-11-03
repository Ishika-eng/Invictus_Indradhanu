import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.advisory import Advisory
    from app.models.farmer import Farmer
    from app.models.farm import Farm


class AdvisoryAuditLog(Base):
    """Immutable audit trail for complete advisory generation, risk assessment, and delivery lifecycle."""

    __tablename__ = "advisory_audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    advisory_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("advisories.id", ondelete="CASCADE"), index=True, nullable=False
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farmers.id", ondelete="CASCADE"), index=True, nullable=False
    )

    event_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # ADVISORY_GENERATED, REASSESSMENT_TRIGGERED, NOTIFICATION_DISPATCHED, FEEDBACK_RECORDED, OUTCOME_VERIFIED

    # Snapshot of inputs, models, and outputs
    climate_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    risk_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    advisory_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    delivery_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Farmer Feedback & Impact Tracking (Distinguishing Measured, Reported, Estimated)
    farmer_action: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # APPLIED, PARTIALLY_APPLIED, IGNORED
    farmer_feedback: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    impact_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    scoring_methodology: Mapped[str] = mapped_column(
        String(100), default="AGRONOMIC_MULTI_CRITERIA_V1", nullable=False
    )
    model_version: Mapped[str] = mapped_column(
        String(100), default="rules_engine_v1+gemini-1.5-flash", nullable=False
    )
    operator_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    is_immutable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    advisory: Mapped["Advisory"] = relationship("Advisory", back_populates="audit_logs", lazy="selectin")
    farmer: Mapped["Farmer"] = relationship("Farmer", lazy="selectin")
    farm: Mapped["Farm"] = relationship("Farm", lazy="selectin")

    def __repr__(self) -> str:
        return f"<AdvisoryAuditLog(id={self.id}, advisory_id={self.advisory_id}, event='{self.event_type}')>"

