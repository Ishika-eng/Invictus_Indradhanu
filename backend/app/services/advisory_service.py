import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.advisory import Advisory
from app.models.delivery import DeliveryLog
from app.schemas.advisory import AdvisoryCreate
from app.schemas.delivery import DeliveryLogCreate
from app.core.exceptions import EntityNotFoundException


class AdvisoryService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        farmer_id: Optional[uuid.UUID] = None,
        farm_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Advisory]:
        query = select(Advisory).options(selectinload(Advisory.delivery_logs))
        if farmer_id:
            query = query.where(Advisory.farmer_id == farmer_id)
        if farm_id:
            query = query.where(Advisory.farm_id == farm_id)

        result = await db.execute(query.order_by(Advisory.created_at.desc()).offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, advisory_id: uuid.UUID) -> Optional[Advisory]:
        result = await db.execute(
            select(Advisory)
            .options(selectinload(Advisory.delivery_logs))
            .where(Advisory.id == advisory_id)
        )
        advisory = result.scalar_one_or_none()
        if not advisory:
            raise EntityNotFoundException(f"Advisory with id '{advisory_id}' not found")
        return advisory

    @staticmethod
    async def create(db: AsyncSession, data: AdvisoryCreate) -> Advisory:
        advisory = Advisory(**data.model_dump())
        db.add(advisory)
        await db.commit()
        await db.refresh(advisory)
        return advisory

    @staticmethod
    async def log_delivery(db: AsyncSession, data: DeliveryLogCreate) -> DeliveryLog:
        await AdvisoryService.get_by_id(db, data.advisory_id)
        delivery = DeliveryLog(**data.model_dump())
        db.add(delivery)
        await db.commit()
        await db.refresh(delivery)
        return delivery

