import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RiskAssessmentBase(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0, example=78.5)
    risk_level: str = Field(..., example="HIGH_RISK")  # SAFE, WATCH, HIGH_RISK
    fungal_disease_risk: float = Field(default=0.0, ge=0.0, le=100.0)
    waterlogging_risk: float = Field(default=0.0, ge=0.0, le=100.0)
    heat_stress_risk: float = Field(default=0.0, ge=0.0, le=100.0)
    pest_pressure_risk: float = Field(default=0.0, ge=0.0, le=100.0)
    identified_factors: Optional[List[str]] = None
    summary_notes: Optional[str] = None


class RiskAssessmentCreate(RiskAssessmentBase):
    farm_id: uuid.UUID
    climate_observation_id: Optional[uuid.UUID] = None


class RiskAssessmentResponse(RiskAssessmentBase):
    id: uuid.UUID
    farm_id: uuid.UUID
    climate_observation_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)

