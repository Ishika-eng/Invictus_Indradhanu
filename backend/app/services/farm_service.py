import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.elements import WKTElement

from app.models.farm import Farm
from app.models.farmer import Farmer
from app.schemas.farm import FarmCreate, FarmUpdate
from app.core.exceptions import EntityNotFoundException


class FarmService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        farmer_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Farm]:
        query = select(Farm)
        if farmer_id:
            query = query.where(Farm.farmer_id == farmer_id)
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, farm_id: uuid.UUID) -> Optional[Farm]:
        result = await db.execute(select(Farm).where(Farm.id == farm_id))
        farm = result.scalar_one_or_none()
        if not farm:
            raise EntityNotFoundException(f"Farm with id '{farm_id}' not found")
        return farm

    @staticmethod
    async def create(db: AsyncSession, data: FarmCreate) -> Farm:
        # Verify farmer exists
        farmer = await db.execute(select(Farmer).where(Farmer.id == data.farmer_id))
        if not farmer.scalar_one_or_none():
            raise EntityNotFoundException(f"Farmer with id '{data.farmer_id}' not found")

        farm_data = data.model_dump()
        # Create PostGIS point geometry
        farm = Farm(
            **farm_data,
            location_geom=f"SRID=4326;POINT({data.longitude} {data.latitude})"
        )
        db.add(farm)
        await db.commit()
        await db.refresh(farm)
        return farm

    @staticmethod
    async def update(
        db: AsyncSession, farm_id: uuid.UUID, data: FarmUpdate
    ) -> Farm:
        farm = await FarmService.get_by_id(db, farm_id)
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(farm, key, value)

        if "latitude" in update_data or "longitude" in update_data:
            farm.location_geom = f"SRID=4326;POINT({farm.longitude} {farm.latitude})"

        await db.commit()
        await db.refresh(farm)
        return farm

    @staticmethod
    async def delete(db: AsyncSession, farm_id: uuid.UUID) -> None:
        farm = await FarmService.get_by_id(db, farm_id)
        await db.delete(farm)
        await db.commit()

