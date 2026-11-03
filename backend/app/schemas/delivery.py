import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DeliveryLogBase(BaseModel):
    channel: str = Field("SMS", description="Channel: 'SMS', 'VOICE_IVR', 'WHATSAPP'")
    status: str = Field("QUEUED", description="Status: 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'SIMULATED'")
    recipient_phone: str = Field(..., example="+919876543210")
    content_snippet: Optional[str] = None
    language: str = Field("mr", example="mr")
    duration_seconds: Optional[int] = None
    carrier_message_id: Optional[str] = None
    error_message: Optional[str] = None
    provider: str = Field("SIMULATION", example="MSG91")
    idempotency_key: Optional[str] = None
    retry_count: int = 0
    is_simulation: bool = False
    delivery_metadata: Optional[Dict[str, Any]] = None


class DeliveryLogCreate(DeliveryLogBase):
    advisory_id: uuid.UUID
    farmer_id: uuid.UUID


class DeliveryLogResponse(DeliveryLogBase):
    id: uuid.UUID
    advisory_id: uuid.UUID
    farmer_id: uuid.UUID
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DeliveryDispatchRequest(BaseModel):
    advisory_id: uuid.UUID
    channels: List[str] = Field(default=["SMS"], description="List of channels: ['SMS'], ['VOICE_IVR'], ['WHATSAPP'], or ['ALL']")
    simulate: bool = Field(default=False, description="Set True for sandboxed simulation; False for live dispatch")
    custom_phone: Optional[str] = Field(None, description="Optional override phone number for testing")


class DeliveryDispatchResponse(BaseModel):
    dispatch_id: str
    advisory_id: str
    farmer_id: str
    channel_outcomes: List[DeliveryLogResponse]
    mode: str = Field(..., example="SIMULATION")
    summary: str


class OptOutRequest(BaseModel):
    phone_number: str
    reason: Optional[str] = "STOP"


class ChannelPreferenceUpdate(BaseModel):
    preferred_channel: str = Field("SMS", example="SMS")
    is_opted_in: bool = True
