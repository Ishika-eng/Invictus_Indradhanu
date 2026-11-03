import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse
from app.schemas.common import StatusMessage
from app.services.farm_service import FarmService

router = APIRouter()


@router.get(
    "/",
    response_model=List[FarmResponse],
    summary="List farm plots",
    description="Retrieve farms optionally filtered by farmer ID.",
)
async def list_farms(
    farmer_id: Optional[uuid.UUID] = Query(None, description="Filter by farmer ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.get_all(db, farmer_id=farmer_id, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create farm plot",
    description="Register a new plot with GPS coordinates and soil details.",
)
async def create_farm(
    data: FarmCreate,
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.create(db, data)


@router.get(
    "/{farm_id}",
    response_model=FarmResponse,
    summary="Get farm details",
)
async def get_farm(
    farm_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.get_by_id(db, farm_id)


@router.put(
    "/{farm_id}",
    response_model=FarmResponse,
    summary="Update farm details",
)
async def update_farm(
    farm_id: uuid.UUID,
    data: FarmUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.update(db, farm_id, data)


@router.delete(
    "/{farm_id}",
    response_model=StatusMessage,
    summary="Delete farm plot",
)
async def delete_farm(
    farm_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    await FarmService.delete(db, farm_id)
    return StatusMessage(success=True, message=f"Farm {farm_id} deleted successfully")

