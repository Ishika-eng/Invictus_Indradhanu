import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.advisory import (
    AdvisoryCreate,
    AdvisoryResponse,
    AdvisoryDetailResponse,
)
from app.schemas.delivery import DeliveryLogCreate, DeliveryLogResponse
from app.services.advisory_service import AdvisoryService

router = APIRouter()


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
    summary="Create crop advisory",
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
    return await AdvisoryService.get_by_id(db, advisory_id)


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
    # Ensure URL id matches payload
    data.advisory_id = advisory_id
    return await AdvisoryService.log_delivery(db, data)

