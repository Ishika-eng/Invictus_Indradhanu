import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CropGrowthStageBase(BaseModel):
    stage_name: str
    stage_order: int
    duration_days: int
    cumulative_start_day: int = 0
    cumulative_end_day: int = 30
    water_sensitivity: str = "Moderate"
    temp_critical_min_c: Optional[float] = None
    temp_critical_max_c: Optional[float] = None
    vulnerability_notes: Optional[str] = None
    description: Optional[str] = None


class CropGrowthStageResponse(CropGrowthStageBase):
    id: uuid.UUID
    crop_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class CropBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Tomato"})
    scientific_name: Optional[str] = Field(None, json_schema_extra={"example": "Solanum lycopersicum"})
    category: str = Field("Vegetable / Solanaceous", json_schema_extra={"example": "Vegetable / Solanaceous"})
    
    # Agronomic environmental profile
    temp_min_c: Optional[float] = 10.0
    temp_max_c: Optional[float] = 35.0
    temp_optimal_min_c: Optional[float] = 18.0
    temp_optimal_max_c: Optional[float] = 27.0
    water_demand: str = Field("Sensitive", json_schema_extra={"example": "Sensitive"})
    water_requirement_mm_min: Optional[float] = 400.0
    water_requirement_mm_max: Optional[float] = 600.0
    rainfall_min_mm: Optional[float] = 400.0
    rainfall_max_mm: Optional[float] = 750.0
    ideal_soil: Optional[str] = "Well-drained sandy loam to clay loam"
    soil_ph_min: Optional[float] = 6.0
    soil_ph_max: Optional[float] = 7.0
    growing_season: Optional[str] = "Kharif / Rabi"
    root_depth_cm: Optional[str] = "Medium (30-60cm)"
    icon: Optional[str] = "🍅"
    agronomic_reference: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


class CropCreate(CropBase):
    pass


class CropResponse(CropBase):
    id: uuid.UUID
    growth_stages: List[CropGrowthStageResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CropSummaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    scientific_name: Optional[str] = None
    category: str
    water_demand: str
    root_depth_cm: Optional[str] = None
    icon: Optional[str] = None
    stages_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class StageEstimationResponse(BaseModel):
    crop_id: uuid.UUID
    crop_name: str
    sowing_date: str
    days_since_sowing: int
    suggested_stage_id: Optional[uuid.UUID] = None
    suggested_stage_name: Optional[str] = None
    suggested_stage_order: Optional[int] = None
    water_sensitivity: Optional[str] = None
    vulnerability_notes: Optional[str] = None
    advice: str
