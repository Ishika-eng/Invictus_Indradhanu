import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class OverviewMetricsResponse(BaseModel):
    total_farmers: int
    active_farms: int
    active_crop_cycles: int
    active_risks_count: int
    risks_by_level: Dict[str, int]
    advisories_generated_count: int
    delivery_statistics: Dict[str, Any]
    geographic_distribution: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]


class AdminFarmerItem(BaseModel):
    id: uuid.UUID
    full_name: str
    phone_number: str
    village: str
    district: str
    state: str
    country: str
    preferred_language: str
    preferred_channel: str
    is_opted_in: bool
    role: str
    trust_score: float
    farms_count: int
    total_acreage: float
    crops: List[str]
    advisories_count: int
    last_advisory_date: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminFarmersListResponse(BaseModel):
    items: List[AdminFarmerItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminFarmerDetailResponse(BaseModel):
    farmer: AdminFarmerItem
    farms: List[Dict[str, Any]]
    advisories: List[Dict[str, Any]]
    delivery_logs: List[Dict[str, Any]]


class AdminAdvisoryItem(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    farmer_name: str
    farmer_phone: str
    farm_id: uuid.UUID
    farm_name: str
    crop_name: str
    growth_stage_name: Optional[str] = None
    immediate_action: str
    why_it_matters: str
    recommended_timing: str
    risk_if_ignored: str
    language: str
    status: str
    confidence_pct: float
    action_status: str
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    climate_summary: Optional[Dict[str, Any]] = None
    delivery_summary: Dict[str, Any]
    farmer_feedback: Optional[Dict[str, Any]] = None
    operator_notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminAdvisoriesListResponse(BaseModel):
    items: List[AdminAdvisoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdvisoryReassessResponse(BaseModel):
    old_advisory_id: str
    new_advisory_id: str
    action_taken: str
    risk_level: str
    risk_score: float
    immediate_action: str
    audit_log_id: str
    reassessed_at: str


class AdvisoryResendRequest(BaseModel):
    channels: Optional[List[str]] = Field(None, description="Optional override channels: ['SMS', 'VOICE_IVR', 'WHATSAPP']")
    force_resend: bool = Field(False, description="Bypass recent duplicate check if true")
    simulate: Optional[bool] = Field(None, description="Force simulation mode if true")


class AdvisoryFeedbackRequest(BaseModel):
    action_taken: str = Field(..., example="APPLIED", description="APPLIED, PARTIALLY_APPLIED, IGNORED, POSTPONED")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Farmer satisfaction rating 1 to 5")
    reported_water_savings_liters: Optional[float] = Field(None, ge=0.0)
    reported_losses_avoided_inr: Optional[float] = Field(None, ge=0.0)
    feedback_text: Optional[str] = None
    operator_notes: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    advisory_id: uuid.UUID
    farm_id: uuid.UUID
    farmer_id: uuid.UUID
    farmer_name: Optional[str] = None
    event_type: str
    climate_snapshot: Optional[Dict[str, Any]] = None
    risk_snapshot: Optional[Dict[str, Any]] = None
    advisory_snapshot: Optional[Dict[str, Any]] = None
    delivery_snapshot: Optional[Dict[str, Any]] = None
    farmer_action: Optional[str] = None
    farmer_feedback: Optional[Dict[str, Any]] = None
    impact_data: Optional[Dict[str, Any]] = None
    scoring_methodology: str
    model_version: str
    operator_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    is_immutable: bool = True

    model_config = ConfigDict(from_attributes=True)


class AuditLogsListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ImpactMeasurementResponse(BaseModel):
    measured: Dict[str, Any] = Field(..., description="Fact-checked from real carrier delivery receipts and sensor data")
    farmer_reported: Dict[str, Any] = Field(..., description="From verified feedback submitted by farmers/operators")
    model_estimated: Dict[str, Any] = Field(..., description="Agronomic projections based on evapotranspiration & loss models")
    measurement_transparency_note: str
