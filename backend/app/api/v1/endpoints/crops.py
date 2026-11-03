import uuid
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.crop import (
    CropCreate,
    CropResponse,
    CropGrowthStageBase,
    CropGrowthStageResponse,
    StageEstimationResponse,
)
from app.services.crop_service import CropService

router = APIRouter()


@router.get(
    "/",
    response_model=List[CropResponse],
    summary="List supported crops",
    description="Retrieve list of agronomic crop definitions including phenological growth stages and environmental thresholds.",
)
async def list_crops(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await CropService.get_all(db, skip=skip, limit=limit)


@router.get(
    "/{crop_id}",
    response_model=CropResponse,
    summary="Get crop details",
    description="Retrieve full agronomic requirements, temperature ranges, and phenology stages for a specific crop.",
)
async def get_crop(
    crop_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await CropService.get_by_id(db, crop_id)


@router.get(
    "/{crop_id}/estimate-stage",
    response_model=StageEstimationResponse,
    summary="Estimate growth stage from sowing date",
    description="Calculates days since sowing and suggests the current phenological growth stage based on scientific crop cycle timelines.",
)
async def estimate_growth_stage(
    crop_id: uuid.UUID,
    sowing_date: date = Query(..., description="Sowing or transplanting date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
):
    return await CropService.estimate_growth_stage(db, crop_id, sowing_date)


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
