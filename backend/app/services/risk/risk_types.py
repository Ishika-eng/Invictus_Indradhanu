from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    UNAVAILABLE = "UNAVAILABLE"


def score_to_level(score: Optional[float]) -> RiskLevel:
    if score is None:
        return RiskLevel.UNAVAILABLE
    if score < 30.0:
        return RiskLevel.LOW
    elif score < 60.0:
        return RiskLevel.MODERATE
    elif score < 80.0:
        return RiskLevel.HIGH
    return RiskLevel.CRITICAL


class CategoryRiskAssessment(BaseModel):
    category_name: str
    score: Optional[float] = None
    level: RiskLevel
    is_available: bool = True
    driver_factors: List[str] = []
    explanation: str
    recommendation_hint: Optional[str] = None


class DailyRiskProjection(BaseModel):
    day_number: int
    date: str
    overall_score: float
    overall_level: RiskLevel
    primary_risk_category: str
    rainfall_risk_score: float
    heat_risk_score: float
    cold_risk_score: float
    wind_risk_score: float
    weather_condition: str
    weather_icon: str
