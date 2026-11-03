import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CropGrowthStageBase(BaseModel):
    stage_name: str
    stage_order: int
    duration_days: int
    water_sensitivity: str = "MODERATE"
    heat_sensitivity: str = "MODERATE"
    disease_vulnerability: str = "MODERATE"
    description: Optional[str] = None


class CropGrowthStageResponse(CropGrowthStageBase):
    id: uuid.UUID
    crop_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class CropBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Tomato"})
    scientific_name: Optional[str] = Field(None, json_schema_extra={"example": "Solanum lycopersicum"})
    category: str = Field("Horticulture", json_schema_extra={"example": "Horticulture"})
    water_demand: str = Field("Moderate", json_schema_extra={"example": "Moderate"})
    ideal_soil: Optional[str] = Field("Loamy / Well-drained", json_schema_extra={"example": "Loamy / Well-drained"})
    description: Optional[str] = None
    is_active: bool = True


class CropCreate(CropBase):
    pass


class CropResponse(CropBase):
    id: uuid.UUID
    growth_stages: List[CropGrowthStageResponse] = []

    model_config = ConfigDict(from_attributes=True)
