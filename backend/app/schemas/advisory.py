import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.delivery import DeliveryLogResponse


class AdvisoryBase(BaseModel):
    immediate_action: str = Field(..., example="Delay irrigation by 24 hours.")
    why_it_matters: str = Field(..., example="Heavy rain expected tomorrow (84% chance, 25mm). Root zone already at 88% capacity.")
    recommended_timing: str = Field(..., example="Next 24 to 48 hours")
    risk_if_ignored: str = Field(..., example="Waterlogging, root rot, and wasted energy expenditure.")
    projected_impact: Optional[str] = Field(None, json_schema_extra={"example": "Conserves irrigation water and pump energy, and protects root aeration."})
    confidence_pct: float = Field(default=94.0, ge=0.0, le=100.0)
    language: str = Field("mr", example="mr")
    status: str = Field("GENERATED", example="GENERATED")
    action_steps: Optional[List[str]] = None
    scientific_reasoning: Optional[List[str]] = None
    supporting_evidence: Optional[List[str]] = None
    data_limitations: Optional[str] = None
    model_version: Optional[str] = "rule_engine+gemini-1.5-flash"
    disclaimer: Optional[str] = None
    needs_expert_review: bool = False
    translations: Optional[Dict[str, Any]] = None


class AdvisoryCreate(AdvisoryBase):
    farmer_id: uuid.UUID
    farm_id: uuid.UUID
    crop_id: uuid.UUID
    growth_stage_id: Optional[uuid.UUID] = None
    risk_assessment_id: Optional[uuid.UUID] = None


class AdvisoryResponse(AdvisoryBase):
    id: uuid.UUID
    farmer_id: uuid.UUID
    farm_id: uuid.UUID
    crop_id: uuid.UUID
    growth_stage_id: Optional[uuid.UUID] = None
    risk_assessment_id: Optional[uuid.UUID] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdvisoryDetailResponse(AdvisoryResponse):
    delivery_logs: List[DeliveryLogResponse] = []
    crop_name: Optional[str] = None
    growth_stage_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdvisoryGenerateRequest(BaseModel):
    farm_id: Optional[uuid.UUID] = None
    crop_id: Optional[uuid.UUID] = None
    stage_id: Optional[uuid.UUID] = None
    language: Optional[str] = Field("mr", description="Target ISO code: 'mr', 'hi', 'te', 'en', 'sw'")
