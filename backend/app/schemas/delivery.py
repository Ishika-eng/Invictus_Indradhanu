import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DeliveryLogBase(BaseModel):
    channel: str = Field("SMS", example="SMS")
    status: str = Field("QUEUED", example="DELIVERED")
    recipient_phone: str = Field(..., example="+919876543210")
    content_snippet: Optional[str] = None
    language: str = Field("mr", example="mr")
    duration_seconds: Optional[int] = None
    carrier_message_id: Optional[str] = None
    error_message: Optional[str] = None
    delivery_metadata: Optional[dict] = None


class DeliveryLogCreate(DeliveryLogBase):
    advisory_id: uuid.UUID
    farmer_id: uuid.UUID


class DeliveryLogResponse(DeliveryLogBase):
    id: uuid.UUID
    advisory_id: uuid.UUID
    farmer_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

