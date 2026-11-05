import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_farmer
from app.models.farmer import Farmer
from app.services.farm_service import FarmService
from app.services.risk.risk_assessment_service import RiskAssessmentService
from app.schemas.risk import (
    DetailedRiskAssessmentResponse,
    DailyRiskTimelineItem,
    RiskEvaluationRequest,
    RiskAssessmentResponse,
)

router = APIRouter()


@router.get(
    "/{farm_id}/risk/latest",
    response_model=DetailedRiskAssessmentResponse,
    summary="Get latest crop-specific climate risk assessment for a farm",
    description=(
        "Retrieves the most recent agricultural risk evaluation, or computes a fresh one "
        "using current meteorological and forecast conditions against crop-stage thresholds. "
        "Enforces farm ownership."
    ),
)
async def get_latest_risk(
    farm_id: uuid.UUID,
    crop_id: Optional[uuid.UUID] = Query(None, description="Optional target crop ID to filter latest risk"),
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    # Enforce farm ownership and retrieve latest assessment
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await RiskAssessmentService.get_latest_for_farm(
        db=db,
        farmer_id=current_farmer.id,
        farm_id=farm_id,
        crop_id=crop_id,
    )


@router.post(
    "/{farm_id}/risk/evaluate",
    response_model=DetailedRiskAssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate crop risk on-demand with optional crop/stage override",
    description=(
        "Executes a fresh multi-criteria risk evaluation across all 7 agronomic risk categories: "
        "rainfall/waterlogging, heat stress, cold stress, soil moisture deficit/excess (marked unavailable without sensors), "
        "humidity/disease, and high wind. Saves the assessment in the database."
    ),
)
async def evaluate_risk(
    farm_id: uuid.UUID,
    body: Optional[RiskEvaluationRequest] = None,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    crop_id = body.crop_id if body else None
    stage_id = body.stage_id if body else None

    return await RiskAssessmentService.evaluate_farm_risk(
        db=db,
        farmer_id=current_farmer.id,
        farm_id=farm_id,
        crop_id=crop_id,
        stage_id=stage_id,
    )


@router.get(
    "/{farm_id}/risk/timeline",
    response_model=List[DailyRiskTimelineItem],
    summary="Get 7-day projected crop risk timeline",
    description=(
        "Returns the 7-day daily risk curve projecting future environmental stress factors "
        "derived from NWP forecast data."
    ),
)
async def get_risk_timeline(
    farm_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await RiskAssessmentService.get_timeline(
        db=db,
        farmer_id=current_farmer.id,
        farm_id=farm_id,
    )


@router.get(
    "/{farm_id}/risk/history",
    summary="Get historical risk assessments for a farm",
    description="Returns previous risk evaluations recorded for this farm.",
)
async def get_risk_history(
    farm_id: uuid.UUID,
    limit: int = Query(default=10, ge=1, le=50),
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await RiskAssessmentService.get_history(
        db=db,
        farmer_id=current_farmer.id,
        farm_id=farm_id,
        limit=limit,
    )

