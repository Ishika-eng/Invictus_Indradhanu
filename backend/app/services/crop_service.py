import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.crop import Crop, CropGrowthStage
from app.schemas.crop import CropCreate, CropGrowthStageBase, StageEstimationResponse
from app.core.exceptions import EntityNotFoundException, AppException


class CropService:
    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Crop]:
        result = await db.execute(
            select(Crop)
            .options(selectinload(Crop.growth_stages))
            .order_by(Crop.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, crop_id: uuid.UUID) -> Crop:
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
    async def get_by_name(db: AsyncSession, name: str) -> Optional[Crop]:
        result = await db.execute(
            select(Crop)
            .options(selectinload(Crop.growth_stages))
            .where(Crop.name.ilike(f"%{name}%"))
        )
        return result.scalars().first()

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

    @staticmethod
    async def estimate_growth_stage(
        db: AsyncSession, crop_id: uuid.UUID, sowing_date: date
    ) -> StageEstimationResponse:
        """Estimates phenological stage based on days since sowing date without overwriting farmer confirmation."""
        today = date.today()
        days_since_sowing = (today - sowing_date).days

        if days_since_sowing < 0:
            raise AppException(
                status_code=400,
                message=f"Sowing date cannot be in the future (provided: {sowing_date}, today: {today}).",
            )

        crop = await CropService.get_by_id(db, crop_id)
        stages = sorted(crop.growth_stages, key=lambda s: s.stage_order)

        if not stages:
            return StageEstimationResponse(
                crop_id=crop.id,
                crop_name=crop.name,
                sowing_date=sowing_date.isoformat(),
                days_since_sowing=days_since_sowing,
                advice=f"No phenological stages defined yet for {crop.name}.",
            )

        # Match stage based on cumulative day brackets
        matched_stage: Optional[CropGrowthStage] = None
        for stage in stages:
            if stage.cumulative_start_day <= days_since_sowing <= stage.cumulative_end_day:
                matched_stage = stage
                break

        # If days exceed all stages, suggest the final stage (e.g. harvesting)
        if not matched_stage and days_since_sowing > stages[-1].cumulative_end_day:
            matched_stage = stages[-1]

        if not matched_stage:
            matched_stage = stages[0]

        advice = (
            f"Planted {days_since_sowing} days ago on {sowing_date.strftime('%d %b %Y')}. "
            f"Based on agronomic timeline for {crop.name}, suggested stage is '{matched_stage.stage_name}'."
        )

        return StageEstimationResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            sowing_date=sowing_date.isoformat(),
            days_since_sowing=days_since_sowing,
            suggested_stage_id=matched_stage.id,
            suggested_stage_name=matched_stage.stage_name,
            suggested_stage_order=matched_stage.stage_order,
            water_sensitivity=matched_stage.water_sensitivity,
            vulnerability_notes=matched_stage.vulnerability_notes,
            advice=advice,
        )
