import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_farmer
from app.models.farmer import Farmer
from app.schemas.farm_crop import (
    FarmCropCreate,
    FarmCropUpdate,
    FarmCropResponse,
)
from app.schemas.common import StatusMessage
from app.services.farm_crop_service import FarmCropService

router = APIRouter()


@router.get(
    "/{farm_id}/crops",
    response_model=List[FarmCropResponse],
    summary="List crops cultivated on a farm plot",
    description="Returns all active and historical crops registered for the specified farm plot. Enforces farmer ownership.",
)
async def list_farm_crops(
    farm_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmCropService.list_for_farm(db, current_farmer.id, farm_id)


@router.post(
    "/{farm_id}/crops",
    response_model=FarmCropResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a cultivated crop to a farm plot",
    description="Registers a crop with variety, cultivated acreage, sowing date, and growth stage. Enforces plot acreage capacity.",
)
async def add_crop_to_farm(
    farm_id: uuid.UUID,
    data: FarmCropCreate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmCropService.add_crop_to_farm(db, current_farmer.id, farm_id, data)


@router.get(
    "/{farm_id}/crops/{farm_crop_id}",
    response_model=FarmCropResponse,
    summary="Get single cultivated crop details",
    description="Retrieves a specific cultivated crop record with its growth stage and crop details.",
)
async def get_farm_crop(
    farm_id: uuid.UUID,
    farm_crop_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmCropService.get_by_id(db, current_farmer.id, farm_id, farm_crop_id)


@router.put(
    "/{farm_id}/crops/{farm_crop_id}",
    response_model=FarmCropResponse,
    summary="Update cultivated crop details or growth stage",
    description="Updates crop variety, cultivated acreage, stage, or harvest status. Enforces plot acreage capacity.",
)
async def update_farm_crop(
    farm_id: uuid.UUID,
    farm_crop_id: uuid.UUID,
    data: FarmCropUpdate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    return await FarmCropService.update_farm_crop(db, current_farmer.id, farm_id, farm_crop_id, data)


@router.delete(
    "/{farm_id}/crops/{farm_crop_id}",
    response_model=StatusMessage,
    summary="Remove a cultivated crop record from a farm plot",
    description="Removes a crop cycle from the farm plot. Enforces farmer ownership.",
)
async def delete_farm_crop(
    farm_id: uuid.UUID,
    farm_crop_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmCropService.delete_farm_crop(db, current_farmer.id, farm_id, farm_crop_id)
    return StatusMessage(
        success=True,
        message=f"Crop record '{farm_crop_id}' successfully removed from farm.",
    )

