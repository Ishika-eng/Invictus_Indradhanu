import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Float, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.advisory import Advisory
    from app.models.delivery import DeliveryLog


class Farmer(Base, TimestampMixin):
    """Smallholder farmer profile entity."""

    __tablename__ = "farmers"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    supabase_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )
    full_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    phone_number: Mapped[str] = mapped_column(
        String(24), unique=True, index=True, nullable=False
    )
    preferred_language: Mapped[str] = mapped_column(
        String(10), default="en", nullable=False
    )
    village: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    trust_score: Mapped[float] = mapped_column(Float, default=95.0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Multichannel preferences and consent tracking
    preferred_channel: Mapped[str] = mapped_column(
        String(20), default="SMS", nullable=False
    )  # SMS, VOICE_IVR, WHATSAPP, ALL
    is_opted_in: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    opt_out_reason: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    farms: Mapped[List["Farm"]] = relationship(
        "Farm", back_populates="farmer", cascade="all, delete-orphan", lazy="selectin"
    )
    advisories: Mapped[List["Advisory"]] = relationship(
        "Advisory", back_populates="farmer", cascade="all, delete-orphan", lazy="selectin"
    )
    delivery_logs: Mapped[List["DeliveryLog"]] = relationship(
        "DeliveryLog", back_populates="farmer", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Farmer(id={self.id}, name='{self.full_name}', phone='{self.phone_number}')>"

