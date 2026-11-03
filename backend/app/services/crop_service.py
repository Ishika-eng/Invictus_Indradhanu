import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.crop import Crop, CropGrowthStage
from app.schemas.crop import CropCreate, CropGrowthStageBase
from app.core.exceptions import EntityNotFoundException


class CropService:
    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Crop]:
        result = await db.execute(
            select(Crop)
            .options(selectinload(Crop.growth_stages))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, crop_id: uuid.UUID) -> Optional[Crop]:
        result = await db.execute(
            select(Crop)
            .options(selectinload(Crop.growth_stages))
            .where(Crop.id == crop_id)
        )
        crop = result.scalar_one_or_none()
        if not crop:
            raise EntityNotFoundException(f"Crop with id '{crop_id}' not found")
        return crop

    @staticmethod
    async def create(db: AsyncSession, data: CropCreate) -> Crop:
        crop = Crop(**data.model_dump())
        db.add(crop)
        await db.commit()
        await db.refresh(crop)
        return crop

    @staticmethod
    async def add_stage(
        db: AsyncSession, crop_id: uuid.UUID, data: CropGrowthStageBase
    ) -> CropGrowthStage:
        await CropService.get_by_id(db, crop_id)
        stage = CropGrowthStage(crop_id=crop_id, **data.model_dump())
        db.add(stage)
        await db.commit()
        await db.refresh(stage)
        return stage

