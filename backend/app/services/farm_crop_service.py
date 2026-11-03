import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farm import Farm
from app.models.crop import Crop, CropGrowthStage
from app.models.farm_crop import FarmCrop
from app.schemas.farm_crop import FarmCropCreate, FarmCropUpdate
from app.core.exceptions import EntityNotFoundException, AppException
from app.core.logging import logger


class FarmCropService:
    @staticmethod
    async def get_farm_with_ownership_check(
        db: AsyncSession, farmer_id: uuid.UUID, farm_id: uuid.UUID
    ) -> Farm:
        """Verifies that the farm exists and belongs to the specified farmer."""
        result = await db.execute(
            select(Farm).where(Farm.id == farm_id, Farm.farmer_id == farmer_id)
        )
        farm = result.scalar_one_or_none()
        if not farm:
            raise EntityNotFoundException(
                f"Farm with id '{farm_id}' does not exist or does not belong to this farmer"
            )
        return farm

    @staticmethod
    async def list_for_farm(
        db: AsyncSession, farmer_id: uuid.UUID, farm_id: uuid.UUID
    ) -> List[FarmCrop]:
        """Lists all crop records on a farmer's plot."""
        await FarmCropService.get_farm_with_ownership_check(db, farmer_id, farm_id)

        result = await db.execute(
            select(FarmCrop)
            .options(
                selectinload(FarmCrop.crop).selectinload(Crop.growth_stages),
                selectinload(FarmCrop.current_stage),
            )
            .where(FarmCrop.farm_id == farm_id)
            .order_by(FarmCrop.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(
        db: AsyncSession, farmer_id: uuid.UUID, farm_id: uuid.UUID, farm_crop_id: uuid.UUID
    ) -> FarmCrop:
        """Retrieves a single farm crop record with farmer ownership check."""
        await FarmCropService.get_farm_with_ownership_check(db, farmer_id, farm_id)

        result = await db.execute(
            select(FarmCrop)
            .options(
                selectinload(FarmCrop.crop).selectinload(Crop.growth_stages),
                selectinload(FarmCrop.current_stage),
            )
            .where(FarmCrop.id == farm_crop_id, FarmCrop.farm_id == farm_id)
        )
        farm_crop = result.scalar_one_or_none()
        if not farm_crop:
            raise EntityNotFoundException(
                f"Crop record with id '{farm_crop_id}' not found on this farm"
            )
        return farm_crop

    @staticmethod
    async def add_crop_to_farm(
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        data: FarmCropCreate,
    ) -> FarmCrop:
        """Adds a crop to a farm plot with strict acreage validation and ownership checks."""
        farm = await FarmCropService.get_farm_with_ownership_check(db, farmer_id, farm_id)

        # 1. Validate Crop Exists
        crop_res = await db.execute(select(Crop).where(Crop.id == data.crop_id))
        crop = crop_res.scalar_one_or_none()
        if not crop:
            raise EntityNotFoundException(f"Crop with id '{data.crop_id}' not found in catalog")

        # 2. Validate Cultivated Acreage against Farm Capacity
        if data.cultivated_acreage <= 0:
            raise AppException(status_code=400, message="Cultivated acreage must be greater than zero.")

        # Calculate currently allocated active acreage
        active_acreage_res = await db.execute(
            select(func.coalesce(func.sum(FarmCrop.cultivated_acreage), 0.0))
            .where(FarmCrop.farm_id == farm_id, FarmCrop.status == "active")
        )
        current_active_acreage = float(active_acreage_res.scalar() or 0.0)
        available_acreage = round(farm.acreage - current_active_acreage, 2)

        if data.status == "active" and (current_active_acreage + data.cultivated_acreage) > (farm.acreage + 0.01):
            raise AppException(
                status_code=400,
                message=(
                    f"Cultivated acreage ({data.cultivated_acreage} acres) exceeds available plot capacity. "
                    f"Farm '{farm.name}' has {available_acreage} acres available out of {farm.acreage} total acres."
                ),
            )

        # 3. Validate Sowing Date
        today = date.today()
        if (data.sowing_date - today).days > 60:
            raise AppException(
                status_code=400,
                message=f"Sowing date cannot be more than 60 days in the future (provided: {data.sowing_date}).",
            )

        # 4. Validate and resolve Growth Stage
        stage_name: Optional[str] = None
        resolved_stage_id: Optional[uuid.UUID] = data.current_stage_id

        if resolved_stage_id:
            stage_res = await db.execute(
                select(CropGrowthStage).where(
                    CropGrowthStage.id == resolved_stage_id,
                    CropGrowthStage.crop_id == crop.id,
                )
            )
            stage = stage_res.scalar_one_or_none()
            if not stage:
                raise AppException(
                    status_code=400,
                    message=f"Growth stage '{resolved_stage_id}' is not valid for crop '{crop.name}'.",
                )
            stage_name = stage.stage_name
        else:
            # If farmer didn't explicitly select stage, infer default initial stage for the crop
            first_stage_res = await db.execute(
                select(CropGrowthStage)
                .where(CropGrowthStage.crop_id == crop.id)
                .order_by(CropGrowthStage.stage_order.asc())
            )
            first_stage = first_stage_res.scalars().first()
            if first_stage:
                resolved_stage_id = first_stage.id
                stage_name = first_stage.stage_name

        # 5. Create FarmCrop record
        farm_crop = FarmCrop(
            farm_id=farm_id,
            crop_id=data.crop_id,
            variety=data.variety,
            cultivated_acreage=data.cultivated_acreage,
            sowing_date=data.sowing_date,
            expected_harvest_date=data.expected_harvest_date,
            current_stage_id=resolved_stage_id,
            current_stage_name=stage_name,
            status=data.status,
            notes=data.notes,
        )
        db.add(farm_crop)

        # 6. Synchronize active crop context on Farm plot
        if data.status == "active":
            farm.active_crop_id = data.crop_id
            farm.active_stage_id = resolved_stage_id

        await db.commit()

        # Reload with relationships
        return await FarmCropService.get_by_id(db, farmer_id, farm_id, farm_crop.id)

    @staticmethod
    async def update_farm_crop(
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        farm_crop_id: uuid.UUID,
        data: FarmCropUpdate,
    ) -> FarmCrop:
        """Updates cultivated crop attributes, stage, or status."""
        farm = await FarmCropService.get_farm_with_ownership_check(db, farmer_id, farm_id)
        farm_crop = await FarmCropService.get_by_id(db, farmer_id, farm_id, farm_crop_id)

        update_dict = data.model_dump(exclude_unset=True)

        # Acreage check if acreage or status changed
        new_acreage = update_dict.get("cultivated_acreage", farm_crop.cultivated_acreage)
        new_status = update_dict.get("status", farm_crop.status)

        if new_status == "active" and (new_acreage != farm_crop.cultivated_acreage or farm_crop.status != "active"):
            active_acreage_res = await db.execute(
                select(func.coalesce(func.sum(FarmCrop.cultivated_acreage), 0.0))
                .where(
                    FarmCrop.farm_id == farm_id,
                    FarmCrop.status == "active",
                    FarmCrop.id != farm_crop_id,
                )
            )
            other_active_acreage = float(active_acreage_res.scalar() or 0.0)
            if (other_active_acreage + new_acreage) > (farm.acreage + 0.01):
                available = round(farm.acreage - other_active_acreage, 2)
                raise AppException(
                    status_code=400,
                    message=(
                        f"Updated acreage ({new_acreage} acres) exceeds available plot capacity. "
                        f"Farm '{farm.name}' has {available} acres available."
                    ),
                )

        # Stage validation if stage updated
        if "current_stage_id" in update_dict and update_dict["current_stage_id"]:
            stage_res = await db.execute(
                select(CropGrowthStage).where(
                    CropGrowthStage.id == update_dict["current_stage_id"],
                    CropGrowthStage.crop_id == farm_crop.crop_id,
                )
            )
            stage = stage_res.scalar_one_or_none()
            if not stage:
                raise AppException(
                    status_code=400,
                    message=f"Growth stage '{update_dict['current_stage_id']}' is not valid for this crop.",
                )
            farm_crop.current_stage_name = stage.stage_name
            farm_crop.current_stage_id = stage.id
            if farm_crop.status == "active":
                farm.active_stage_id = stage.id

        for k, v in update_dict.items():
            if k != "current_stage_id":
                setattr(farm_crop, k, v)

        if farm_crop.status == "active":
            farm.active_crop_id = farm_crop.crop_id

        await db.commit()
        return await FarmCropService.get_by_id(db, farmer_id, farm_id, farm_crop.id)

    @staticmethod
    async def delete_farm_crop(
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        farm_crop_id: uuid.UUID,
    ) -> None:
        """Removes a crop record from the farm."""
        farm = await FarmCropService.get_farm_with_ownership_check(db, farmer_id, farm_id)
        farm_crop = await FarmCropService.get_by_id(db, farmer_id, farm_id, farm_crop_id)

        await db.delete(farm_crop)

        # If this was active on the farm, reset active_crop_id
        if farm.active_crop_id == farm_crop.crop_id:
            other_active_res = await db.execute(
                select(FarmCrop).where(
                    FarmCrop.farm_id == farm_id,
                    FarmCrop.id != farm_crop_id,
                    FarmCrop.status == "active",
                )
            )
            other_active = other_active_res.scalars().first()
            if other_active:
                farm.active_crop_id = other_active.crop_id
                farm.active_stage_id = other_active.current_stage_id
            else:
                farm.active_crop_id = None
                farm.active_stage_id = None

        await db.commit()

