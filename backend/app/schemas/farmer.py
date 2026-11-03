import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.farm import FarmResponse


class FarmerBase(BaseModel):
    full_name: str = Field(..., json_schema_extra={"example": "Ramesh Patil"})
    phone_number: str = Field(..., json_schema_extra={"example": "+919876543210"})
    preferred_language: str = Field("mr", json_schema_extra={"example": "mr"})
    village: str = Field(..., json_schema_extra={"example": "Baramati"})
    district: str = Field(..., json_schema_extra={"example": "Pune"})
    state: str = Field(..., json_schema_extra={"example": "Maharashtra"})
    country: str = Field("India", json_schema_extra={"example": "India"})
    trust_score: float = Field(default=95.0, ge=0.0, le=100.0)
    is_active: bool = True
    supabase_user_id: Optional[str] = None


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


class FarmerRegistrationRequest(BaseModel):
    """Payload submitted right after phone OTP verification to register profile & initial farm."""
    full_name: str = Field(..., min_length=2, max_length=120, json_schema_extra={"example": "Ramesh Patil"})
    preferred_language: str = Field("mr", json_schema_extra={"example": "mr"})
    village: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Baramati"})
    district: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Pune"})
    state: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Maharashtra"})
    country: str = Field("India", json_schema_extra={"example": "India"})
    
    # Initial Farm Details
    farm_name: str = Field(default="Main Plot", min_length=2, max_length=120)
    farm_acreage: float = Field(default=2.5, gt=0, le=5000.0)
    soil_type: str = Field(default="Black Cotton Soil")
    irrigation_source: str = Field(default="Drip Irrigation")
    latitude: float = Field(..., ge=-90.0, le=90.0, json_schema_extra={"example": 18.5204})
    longitude: float = Field(..., ge=-180.0, le=180.0, json_schema_extra={"example": 73.8567})
    elevation_meters: Optional[float] = None


class AuthMeResponse(BaseModel):
    """Current authenticated user state."""
    authenticated: bool
    supabase_user_id: str
    phone_number: Optional[str] = None
    is_registered: bool
    farmer: Optional[FarmerDetailResponse] = None
