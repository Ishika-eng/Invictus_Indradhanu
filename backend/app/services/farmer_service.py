import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farmer import Farmer
from app.models.farm import Farm
from app.schemas.farmer import FarmerCreate, FarmerUpdate, FarmerRegistrationRequest
from app.core.security import SupabaseUser
from app.core.exceptions import EntityNotFoundException, DuplicateEntityException


class FarmerService:
    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Farmer]:
        result = await db.execute(
            select(Farmer).options(selectinload(Farmer.farms)).offset(skip).limit(limit)
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
        result = await db.execute(
            select(Farmer)
            .options(selectinload(Farmer.farms))
            .where(Farmer.phone_number == phone)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_supabase_id(
        db: AsyncSession, supabase_user_id: str
    ) -> Optional[Farmer]:
        result = await db.execute(
            select(Farmer)
            .options(selectinload(Farmer.farms))
            .where(Farmer.supabase_user_id == supabase_user_id)
        )
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
    async def register_farmer_with_farm(
        db: AsyncSession,
        supabase_user: SupabaseUser,
        data: FarmerRegistrationRequest,
    ) -> Farmer:
        """Atomically registers a farmer linked to a Supabase user and provisions their first farm."""
        # Check if this Supabase user already has a farmer registered
        existing_by_sub = await FarmerService.get_by_supabase_id(db, supabase_user.user_id)
        if existing_by_sub:
            raise DuplicateEntityException(
                f"Account is already registered as farmer '{existing_by_sub.full_name}'"
            )

        # Phone priority: verified phone from Supabase JWT auth token, otherwise request fallback
        phone = supabase_user.phone
        if not phone:
            raise DuplicateEntityException(
                "A verified phone number is required in authentication token to register"
            )

        # Format phone consistently
        phone = phone.strip()
        if not phone.startswith("+"):
            phone = f"+{phone}"

        # Check if phone already registered by another account
        existing_phone = await FarmerService.get_by_phone(db, phone)
        if existing_phone:
            if existing_phone.supabase_user_id and existing_phone.supabase_user_id != supabase_user.user_id:
                raise DuplicateEntityException(
                    f"Farmer with phone '{phone}' is already registered with another account"
                )
            # Re-link legacy or unlinked phone to this Supabase user
            existing_phone.supabase_user_id = supabase_user.user_id
            existing_phone.full_name = data.full_name
            existing_phone.preferred_language = data.preferred_language
            existing_phone.village = data.village
            existing_phone.district = data.district
            existing_phone.state = data.state
            existing_phone.country = data.country
            await db.commit()
            await db.refresh(existing_phone)
            return existing_phone

        # Create new farmer entity
        farmer = Farmer(
            supabase_user_id=supabase_user.user_id,
            full_name=data.full_name,
            phone_number=phone,
            preferred_language=data.preferred_language,
            village=data.village,
            district=data.district,
            state=data.state,
            country=data.country,
            trust_score=95.0,
            is_active=True,
        )
        db.add(farmer)
        await db.flush()  # Populates farmer.id for foreign key

        # Provision initial farm plot
        farm = Farm(
            farmer_id=farmer.id,
            name=data.farm_name,
            latitude=data.latitude,
            longitude=data.longitude,
            location_geom=f"SRID=4326;POINT({data.longitude} {data.latitude})",
            acreage=data.farm_acreage,
            soil_type=data.soil_type,
            irrigation_source=data.irrigation_source,
            elevation_meters=data.elevation_meters,
            micro_zone_name=f"{data.village} Zone ({round(data.latitude, 2)}N, {round(data.longitude, 2)}E)",
        )
        db.add(farm)
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
