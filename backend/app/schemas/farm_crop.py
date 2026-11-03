import uuid
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.crop import CropResponse, CropGrowthStageResponse


class FarmCropBase(BaseModel):
    crop_id: uuid.UUID = Field(..., description="UUID of the crop from catalog")
    variety: Optional[str] = Field(None, json_schema_extra={"example": "Abhinav (Hybrid)"})
    cultivated_acreage: float = Field(..., gt=0, json_schema_extra={"example": 1.5})
    sowing_date: date = Field(..., description="Date of sowing or transplanting")
    expected_harvest_date: Optional[date] = None
    current_stage_id: Optional[uuid.UUID] = Field(None, description="UUID of current growth stage")
    status: str = Field(default="active", json_schema_extra={"example": "active"})
    notes: Optional[str] = None


class FarmCropCreate(FarmCropBase):
    pass


class FarmCropUpdate(BaseModel):
    variety: Optional[str] = None
    cultivated_acreage: Optional[float] = Field(None, gt=0)
    sowing_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    current_stage_id: Optional[uuid.UUID] = None
    current_stage_name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class FarmCropResponse(FarmCropBase):
    id: uuid.UUID
    farm_id: uuid.UUID
    current_stage_name: Optional[str] = None
    crop: Optional[CropResponse] = None
    current_stage: Optional[CropGrowthStageResponse] = None

    model_config = ConfigDict(from_attributes=True)

