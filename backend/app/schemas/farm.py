import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class FarmBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "North Field"})
    latitude: float = Field(..., ge=-90.0, le=90.0, json_schema_extra={"example": 18.5204})
    longitude: float = Field(..., ge=-180.0, le=180.0, json_schema_extra={"example": 73.8567})
    elevation_meters: Optional[float] = Field(None, json_schema_extra={"example": 560.0})
    acreage: float = Field(default=2.5, gt=0, json_schema_extra={"example": 2.5})
    soil_type: str = Field(default="Black Cotton Soil", json_schema_extra={"example": "Black Cotton Soil"})
    irrigation_source: str = Field(default="Drip Irrigation", json_schema_extra={"example": "Drip Irrigation"})
    micro_zone_name: Optional[str] = Field(None, json_schema_extra={"example": "Baramati Micro-Zone 18.52N"})
    active_crop_id: Optional[uuid.UUID] = None
    active_stage_id: Optional[uuid.UUID] = None


class FarmCreate(FarmBase):
    farmer_id: uuid.UUID


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    elevation_meters: Optional[float] = None
    acreage: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    micro_zone_name: Optional[str] = None
    active_crop_id: Optional[uuid.UUID] = None
    active_stage_id: Optional[uuid.UUID] = None


class FarmResponse(FarmBase):
    id: uuid.UUID
    farmer_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
