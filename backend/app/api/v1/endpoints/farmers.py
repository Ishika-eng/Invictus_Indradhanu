import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.farmer import (
    FarmerCreate,
    FarmerUpdate,
    FarmerResponse,
    FarmerDetailResponse,
)
from app.schemas.common import StatusMessage
from app.services.farmer_service import FarmerService

router = APIRouter()


@router.get(
    "/",
    response_model=List[FarmerResponse],
    summary="List farmers",
    description="Retrieve smallholder farmers with pagination.",
)
async def list_farmers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await FarmerService.get_all(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=FarmerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create farmer profile",
    description="Register a new smallholder farmer.",
)
async def create_farmer(
    data: FarmerCreate,
    db: AsyncSession = Depends(get_db),
):
    return await FarmerService.create(db, data)


@router.get(
    "/{farmer_id}",
    response_model=FarmerDetailResponse,
    summary="Get farmer details",
    description="Retrieve farmer profile by UUID including associated farms.",
)
async def get_farmer(
    farmer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await FarmerService.get_by_id(db, farmer_id)


@router.put(
    "/{farmer_id}",
    response_model=FarmerResponse,
    summary="Update farmer profile",
)
async def update_farmer(
    farmer_id: uuid.UUID,
    data: FarmerUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await FarmerService.update(db, farmer_id, data)


@router.delete(
    "/{farmer_id}",
    response_model=StatusMessage,
    summary="Delete farmer profile",
)
async def delete_farmer(
    farmer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    await FarmerService.delete(db, farmer_id)
    return StatusMessage(success=True, message=f"Farmer {farmer_id} deleted successfully")

