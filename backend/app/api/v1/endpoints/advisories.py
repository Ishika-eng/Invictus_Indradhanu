import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_farmer
from app.models.farmer import Farmer
from app.core.exceptions import EntityNotFoundException
from app.schemas.advisory import (
    AdvisoryCreate,
    AdvisoryResponse,
    AdvisoryDetailResponse,
    AdvisoryGenerateRequest,
)
from app.schemas.delivery import DeliveryLogCreate, DeliveryLogResponse
from app.services.advisory_service import AdvisoryService
from app.services.advisory.advisory_generation_service import AdvisoryGenerationService

router = APIRouter()


@router.post(
    "/generate",
    response_model=AdvisoryDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI-powered agricultural advisory",
    description=(
        "Synthesizes verified crop-specific climate risks, phenological stage thresholds, "
        "and meteorological forecasts into deterministic agronomic directives. "
        "Explains the recommendation in simple, respectful, farmer-friendly language via Gemini API "
        "(or zero-latency multilingual template engine) in Marathi, Hindi, Telugu, English, or Kiswahili."
    ),
)
async def generate_advisory(
    data: Optional[AdvisoryGenerateRequest] = None,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    target_farm_id = data.farm_id if (data and data.farm_id) else None
    if not target_farm_id:
        if not current_farmer.farms:
            raise EntityNotFoundException("No registered farm plot found for this farmer.")
        target_farm_id = current_farmer.farms[0].id

    language = data.language if data else None
    crop_id = data.crop_id if data else None
    stage_id = data.stage_id if data else None

    advisory = await AdvisoryGenerationService.generate_advisory(
        db=db,
        farmer_id=current_farmer.id,
        farm_id=target_farm_id,
        language=language,
        crop_id=crop_id,
        stage_id=stage_id,
    )

    crop_name = advisory.crop.name if advisory.crop else None
    growth_stage_name = advisory.growth_stage.stage_name if advisory.growth_stage else None

    resp = AdvisoryDetailResponse.model_validate(advisory)
    resp.crop_name = crop_name
    resp.growth_stage_name = growth_stage_name
    return resp


@router.get(
    "/farms/{farm_id}/latest",
    response_model=AdvisoryDetailResponse,
    summary="Get latest agricultural advisory for a farm plot",
    description=(
        "Retrieves the most recent advisory recorded for this farm, or evaluates real-time "
        "weather risks and generates a fresh advisory in the farmer's preferred language."
    ),
)
async def get_latest_farm_advisory(
    farm_id: uuid.UUID,
    language: Optional[str] = Query(None, description="ISO language code ('mr', 'hi', 'te', 'en', 'sw')"),
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    advisory = await AdvisoryGenerationService.get_latest_for_farm(
        db=db,
        farmer_id=current_farmer.id,
        farm_id=farm_id,
        language=language,
    )

    crop_name = advisory.crop.name if advisory.crop else None
    growth_stage_name = advisory.growth_stage.stage_name if advisory.growth_stage else None

    resp = AdvisoryDetailResponse.model_validate(advisory)
    resp.crop_name = crop_name
    resp.growth_stage_name = growth_stage_name
    return resp


@router.get(
    "/",
    response_model=List[AdvisoryResponse],
    summary="List generated advisories",
    description="Retrieve historical advisories filtered by farmer or farm.",
)
async def list_advisories(
    farmer_id: Optional[uuid.UUID] = Query(None, description="Filter by farmer ID"),
    farm_id: Optional[uuid.UUID] = Query(None, description="Filter by farm ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await AdvisoryService.get_all(
        db, farmer_id=farmer_id, farm_id=farm_id, skip=skip, limit=limit
    )


@router.post(
    "/",
    response_model=AdvisoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create crop advisory manually",
)
async def create_advisory(
    data: AdvisoryCreate,
    db: AsyncSession = Depends(get_db),
):
    return await AdvisoryService.create(db, data)


@router.get(
    "/{advisory_id}",
    response_model=AdvisoryDetailResponse,
    summary="Get advisory by ID",
    description="Retrieve detailed advisory including transmission delivery logs.",
)
async def get_advisory(
    advisory_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    advisory = await AdvisoryService.get_by_id(db, advisory_id)
    resp = AdvisoryDetailResponse.model_validate(advisory)
    resp.crop_name = advisory.crop.name if advisory.crop else None
    resp.growth_stage_name = advisory.growth_stage.stage_name if advisory.growth_stage else None
    return resp


@router.post(
    "/{advisory_id}/deliveries",
    response_model=DeliveryLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record advisory delivery log",
    description="Record an outbound SMS, WhatsApp, or Voice IVR transmission.",
)
async def record_delivery(
    advisory_id: uuid.UUID,
    data: DeliveryLogCreate,
    db: AsyncSession = Depends(get_db),
):
    data.advisory_id = advisory_id
    return await AdvisoryService.log_delivery(db, data)
