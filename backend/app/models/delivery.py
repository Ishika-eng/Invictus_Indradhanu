import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.advisory import Advisory
    from app.models.farmer import Farmer


class DeliveryLog(Base, TimestampMixin):
    """Last-mile advisory transmission log across SMS, Voice IVR, or WhatsApp."""

    __tablename__ = "delivery_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    advisory_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("advisories.id", ondelete="CASCADE"), index=True, nullable=False
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("farmers.id", ondelete="CASCADE"), index=True, nullable=False
    )

    channel: Mapped[str] = mapped_column(
        String(20), default="SMS", index=True, nullable=False
    )  # SMS, VOICE_IVR, WHATSAPP
    status: Mapped[str] = mapped_column(
        String(20), default="QUEUED", index=True, nullable=False
    )  # QUEUED, SENT, DELIVERED, FAILED, ANSWERED
    recipient_phone: Mapped[str] = mapped_column(
        String(24), index=True, nullable=False
    )
    content_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    carrier_message_id: Mapped[Optional[str]] = mapped_column(
        String(120), index=True, nullable=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivery_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    advisory: Mapped["Advisory"] = relationship("Advisory", back_populates="delivery_logs")
    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="delivery_logs")

    def __repr__(self) -> str:
        return f"<DeliveryLog(id={self.id}, channel='{self.channel}', status='{self.status}', recipient='{self.recipient_phone}')>"

