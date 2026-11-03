import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.crop import (
    CropCreate,
    CropResponse,
    CropGrowthStageBase,
    CropGrowthStageResponse,
)
from app.services.crop_service import CropService

router = APIRouter()


@router.get(
    "/",
    response_model=List[CropResponse],
    summary="List supported crops",
    description="Retrieve list of agronomic crop definitions including growth stages.",
)
async def list_crops(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await CropService.get_all(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=CropResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create crop definition",
)
async def create_crop(
    data: CropCreate,
    db: AsyncSession = Depends(get_db),
):
    return await CropService.create(db, data)


@router.get(
    "/{crop_id}",
    response_model=CropResponse,
    summary="Get crop details",
)
async def get_crop(
    crop_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await CropService.get_by_id(db, crop_id)


@router.post(
    "/{crop_id}/stages",
    response_model=CropGrowthStageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add phenological growth stage to crop",
)
async def add_crop_stage(
    crop_id: uuid.UUID,
    data: CropGrowthStageBase,
    db: AsyncSession = Depends(get_db),
):
    return await CropService.add_stage(db, crop_id, data)

