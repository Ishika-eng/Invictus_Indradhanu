import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RiskAssessmentBase(BaseModel):
    overall_risk_score: float = Field(..., ge=0.0, le=100.0, json_schema_extra={"example": 68.5})
    overall_risk_level: str = Field(..., json_schema_extra={"example": "HIGH"})
    rainfall_risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    heat_risk_score: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    cold_risk_score: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    humidity_disease_risk_score: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    wind_risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    soil_moisture_risk_score: Optional[float] = None
    confidence_level: str = "HIGH"
    scoring_methodology: str = "ICAR_FAO_MULTI_CRITERIA_RISK_V1"
    risk_factors: Optional[List[str]] = None


class RiskAssessmentCreate(RiskAssessmentBase):
    farm_id: uuid.UUID
    crop_id: Optional[uuid.UUID] = None
    growth_stage_id: Optional[uuid.UUID] = None


class RiskAssessmentResponse(RiskAssessmentBase):
    id: uuid.UUID
    farm_id: uuid.UUID
    crop_id: Optional[uuid.UUID] = None
    growth_stage_id: Optional[uuid.UUID] = None
    assessment_time: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Comprehensive Stage 4 Risk Assessment Schemas
# ==============================================================================

class CategoryRiskItem(BaseModel):
    category_name: str
    score: Optional[float] = None
    level: str
    is_available: bool = True
    driver_factors: List[str] = []
    explanation: str
    recommendation_hint: Optional[str] = None


class DailyRiskTimelineItem(BaseModel):
    day_number: int
    date: str
    overall_score: float
    overall_level: str
    primary_risk_category: str
    rainfall_risk_score: float
    heat_risk_score: float
    cold_risk_score: float
    wind_risk_score: float
    weather_condition: str
    weather_icon: str


class RiskCategoryScores(BaseModel):
    rainfall: float = 0.0
    heat: float = 0.0
    cold: float = 0.0
    disease: float = 0.0
    wind: float = 0.0
    soil_moisture: Optional[float] = None


class DetailedRiskAssessmentResponse(BaseModel):
    assessment_id: Optional[str] = None
    farm_id: str
    farm_name: Optional[str] = None
    overall_risk_score: float
    overall_risk_level: str
    confidence_level: str
    scoring_methodology: str
    crop_evaluated: str
    growth_stage_evaluated: str
    assessment_timestamp: str
    category_scores: RiskCategoryScores
    categories: Optional[Dict[str, CategoryRiskItem]] = None
    contributing_factors: List[str] = []
    daily_timeline: List[DailyRiskTimelineItem] = []
    input_snapshot: Optional[Dict[str, Any]] = None


class RiskEvaluationRequest(BaseModel):
    crop_id: Optional[uuid.UUID] = None
    stage_id: Optional[uuid.UUID] = None
