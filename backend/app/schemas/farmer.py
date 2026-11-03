import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.farm import FarmResponse


class FarmerBase(BaseModel):
    full_name: str = Field(..., example="Ramesh Patil")
    phone_number: str = Field(..., example="+919876543210")
    preferred_language: str = Field("mr", example="mr")
    village: str = Field(..., example="Baramati")
    district: str = Field(..., example="Pune")
    state: str = Field(..., example="Maharashtra")
    country: str = Field("India", example="India")
    trust_score: float = Field(default=95.0, ge=0.0, le=100.0)
    is_active: bool = True


class FarmerCreate(FarmerBase):
    pass


class FarmerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    trust_score: Optional[float] = None
    is_active: Optional[bool] = None


class FarmerResponse(FarmerBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class FarmerDetailResponse(FarmerResponse):
    farms: List[FarmResponse] = []

    model_config = ConfigDict(from_attributes=True)

