from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AdvisoryCategory(str, Enum):
    IRRIGATION = "IRRIGATION"
    PLANT_PROTECTION = "PLANT_PROTECTION"
    DRAINAGE_AND_SOIL = "DRAINAGE_AND_SOIL"
    HARVEST_AND_CARE = "HARVEST_AND_CARE"
    GENERAL_MANAGEMENT = "GENERAL_MANAGEMENT"


class ActionUrgency(str, Enum):
    IMMEDIATE = "IMMEDIATE"            # Next 0 - 6 hours
    WITHIN_24H = "WITHIN_24H"          # Next 12 - 24 hours
    WITHIN_48H = "WITHIN_48H"          # Next 24 - 48 hours
    NEXT_FEW_DAYS = "NEXT_FEW_DAYS"    # Over the 7-day forecast


class AgronomicDirective(BaseModel):
    """Deterministic agricultural action derived from biophysical rules."""
    category: AdvisoryCategory
    urgency: ActionUrgency
    priority: int = 1  # 1 (Critical) to 5 (Routine)
    immediate_action: str
    why_it_matters: str
    recommended_timing: str
    risk_if_ignored: str
    projected_impact: Optional[str] = None
    action_steps: List[str] = []
    supporting_evidence: List[str] = []
    data_limitations: Optional[str] = None
    confidence_pct: float = 92.0
    needs_expert_review: bool = False


class FarmerAdvisoryOutput(BaseModel):
    """Pydantic schema for the farmer-facing advisory in target language."""
    immediate_action: str = Field(..., description="Clear directive of what the farmer should do")
    why_it_matters: str = Field(..., description="Scientific yet simple reason for the action")
    recommended_timing: str = Field(..., description="Precise window when the action should be performed")
    risk_if_ignored: str = Field(..., description="Consequences to yield, crop health, or expenditure if ignored")
    projected_impact: Optional[str] = Field(None, description="Quantified or qualitative benefit of following advice")
    action_steps: List[str] = Field(default_factory=list, description="Step-by-step practical implementation instructions")
    scientific_reasoning: List[str] = Field(default_factory=list, description="Agronomic principles and environmental evidence")
    supporting_evidence: List[str] = Field(default_factory=list, description="Weather metrics, forecast readings, and risk scores")
    data_limitations: Optional[str] = Field(None, description="Notice of unavailable telemetry like in-situ soil moisture")
    confidence_pct: float = Field(default=92.0, ge=0.0, le=100.0)
    needs_expert_review: bool = False
    disclaimer: str = Field(
        default=(
            "This advisory is an AI-assisted decision support recommendation based on meteorological models "
            "and agronomic principles. It is not a substitute for local agricultural extension consultation. "
            "Never apply chemical pesticides without consulting your local Krishi Vigyan Kendra (KVK) or extension officer."
        )
    )
    language: str = "en"
    model_version: str = "rules_v1+gemini-1.5-flash"
    translations: Optional[Dict[str, Any]] = None

