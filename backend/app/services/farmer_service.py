import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farmer import Farmer
from app.schemas.farmer import FarmerCreate, FarmerUpdate
from app.core.exceptions import EntityNotFoundException, DuplicateEntityException


class FarmerService:
    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Farmer]:
        result = await db.execute(
            select(Farmer).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, farmer_id: uuid.UUID) -> Optional[Farmer]:
        result = await db.execute(
            select(Farmer)
            .options(selectinload(Farmer.farms))
            .where(Farmer.id == farmer_id)
        )
        farmer = result.scalar_one_or_none()
        if not farmer:
            raise EntityNotFoundException(f"Farmer with id '{farmer_id}' not found")
        return farmer

    @staticmethod
    async def get_by_phone(db: AsyncSession, phone: str) -> Optional[Farmer]:
        result = await db.execute(select(Farmer).where(Farmer.phone_number == phone))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: FarmerCreate) -> Farmer:
        existing = await FarmerService.get_by_phone(db, data.phone_number)
        if existing:
            raise DuplicateEntityException(
                f"Farmer with phone '{data.phone_number}' already registered"
            )

        farmer = Farmer(**data.model_dump())
        db.add(farmer)
        await db.commit()
        await db.refresh(farmer)
        return farmer

    @staticmethod
    async def update(
        db: AsyncSession, farmer_id: uuid.UUID, data: FarmerUpdate
    ) -> Farmer:
        farmer = await FarmerService.get_by_id(db, farmer_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(farmer, key, value)
        await db.commit()
        await db.refresh(farmer)
        return farmer

    @staticmethod
    async def delete(db: AsyncSession, farmer_id: uuid.UUID) -> None:
        farmer = await FarmerService.get_by_id(db, farmer_id)
        await db.delete(farmer)
        await db.commit()

