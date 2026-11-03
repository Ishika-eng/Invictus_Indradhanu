import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_farmer
from app.models.farmer import Farmer
from app.schemas.farm import FarmBase, FarmCreate, FarmUpdate, FarmResponse
from app.schemas.common import StatusMessage
from app.services.farm_service import FarmService

router = APIRouter()


# Authenticated Farmer Plot Operations (Protected)
@router.get(
    "/me",
    response_model=List[FarmResponse],
    summary="List authenticated farmer's plots",
    description="Retrieve all farm plots registered by the authenticated farmer.",
)
async def list_my_farms(
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.get_all(db, farmer_id=current_farmer.id)


@router.post(
    "/me",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add farm plot for authenticated farmer",
    description="Registers an additional farm plot with GPS location bound to the authenticated farmer.",
)
async def add_my_farm(
    data: FarmBase,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.create_for_farmer(db, current_farmer.id, data)


@router.put(
    "/me/{farm_id}",
    response_model=FarmResponse,
    summary="Update authenticated farmer's plot",
    description="Updates coordinates, acreage, or soil details for a plot owned by the authenticated farmer.",
)
async def update_my_farm(
    farm_id: uuid.UUID,
    data: FarmUpdate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmService.update_for_farmer(db, current_farmer.id, farm_id, data)


@router.delete(
    "/me/{farm_id}",
    response_model=StatusMessage,
    summary="Delete authenticated farmer's plot",
    description="Removes a plot owned by the authenticated farmer.",
)
async def delete_my_farm(
    farm_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.delete_for_farmer(db, current_farmer.id, farm_id)
    return StatusMessage(success=True, message=f"Farm {farm_id} deleted successfully")


# General / Administrative Plot Endpoints
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
