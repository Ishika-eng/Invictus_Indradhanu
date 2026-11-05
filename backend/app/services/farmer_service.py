import uuid
from typing import List, Optional
from sqlalchemy import select, or_
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
    async def get_by_phone(db: AsyncSession, phone: str, load_farms: bool = True) -> Optional[Farmer]:
        stmt = select(Farmer).where(Farmer.phone_number == phone)
        if load_farms:
            stmt = stmt.options(selectinload(Farmer.farms))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str, load_farms: bool = True) -> Optional[Farmer]:
        stmt = select(Farmer).where(Farmer.email == email.strip().lower())
        if load_farms:
            stmt = stmt.options(selectinload(Farmer.farms))
        result = await db.execute(stmt)
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
        existing = await FarmerService.get_by_phone(db, data.phone_number, load_farms=False)
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
        """Atomically registers or updates a farmer linked to a Supabase user and provisions their initial farm.
        
        Idempotent: If the farmer is already registered with the same Supabase account, returns and updates
        the profile rather than failing with 409 Conflict.
        """
        # Phone priority: verified phone from Supabase JWT auth token, otherwise registration payload
        phone = supabase_user.phone or (data.phone_number.strip() if getattr(data, "phone_number", None) else None)
        if not phone:
            raise DuplicateEntityException(
                "A contact phone number is required to register your profile for advisory delivery."
            )

        # Format phone consistently
        phone = phone.strip()
        if not phone.startswith("+"):
            phone = f"+{phone}"

        # Email resolution: prioritize Supabase token, then request payload
        email = supabase_user.email or (data.email.strip() if getattr(data, "email", None) else None)
        if email:
            email = email.strip().lower()

        # 1. Check if this Supabase user already has a farmer registered (Idempotent update flow)
        existing_by_sub = await FarmerService.get_by_supabase_id(db, supabase_user.user_id)
        if existing_by_sub:
            # If phone is changing, ensure new phone does not belong to another account
            if phone != existing_by_sub.phone_number:
                other_phone = await FarmerService.get_by_phone(db, phone, load_farms=False)
                if other_phone and other_phone.id != existing_by_sub.id:
                    raise DuplicateEntityException(
                        f"Farmer with phone '{phone}' is already registered with another account. Please use a different contact phone number."
                    )
                existing_by_sub.phone_number = phone

            # If email is changing, ensure new email does not belong to another account
            if email and email != existing_by_sub.email:
                other_email = await FarmerService.get_by_email(db, email, load_farms=False)
                if other_email and other_email.id != existing_by_sub.id:
                    raise DuplicateEntityException(
                        f"Farmer with email '{email}' is already registered with another account. Please use a different email address."
                    )
                existing_by_sub.email = email

            existing_by_sub.full_name = data.full_name
            existing_by_sub.preferred_language = data.preferred_language
            existing_by_sub.village = data.village
            existing_by_sub.district = data.district
            existing_by_sub.state = data.state
            existing_by_sub.country = data.country

            # Prevent duplicate initial farm plot if one already exists
            if not existing_by_sub.farms:
                farm = Farm(
                    farmer_id=existing_by_sub.id,
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
            else:
                main_farm = existing_by_sub.farms[0]
                main_farm.name = data.farm_name
                main_farm.latitude = data.latitude
                main_farm.longitude = data.longitude
                main_farm.location_geom = f"SRID=4326;POINT({data.longitude} {data.latitude})"
                main_farm.acreage = data.farm_acreage
                main_farm.soil_type = data.soil_type
                main_farm.irrigation_source = data.irrigation_source
                main_farm.elevation_meters = data.elevation_meters
                main_farm.micro_zone_name = f"{data.village} Zone ({round(data.latitude, 2)}N, {round(data.longitude, 2)}E)"

            await db.commit()
            await db.refresh(existing_by_sub)
            return existing_by_sub

        # 2. Check for conflicts by phone or email in a single optimized query
        emails_to_check = set()
        if supabase_user.email:
            emails_to_check.add(supabase_user.email.strip().lower())
        if getattr(data, "email", None) and data.email.strip():
            emails_to_check.add(data.email.strip().lower())

        conditions = [Farmer.phone_number == phone]
        for e in emails_to_check:
            conditions.append(Farmer.email == e)

        conflict_query = await db.execute(
            select(Farmer).options(selectinload(Farmer.farms)).where(or_(*conditions))
        )
        existing_matches = conflict_query.scalars().all()

        # Check for ownership conflicts against other accounts
        for match in existing_matches:
            if match.supabase_user_id and match.supabase_user_id != supabase_user.user_id:
                if match.phone_number == phone:
                    raise DuplicateEntityException(
                        f"Farmer with phone '{phone}' is already registered with another account. Please sign in with that account or use a different contact phone number."
                    )
                if match.email in emails_to_check:
                    raise DuplicateEntityException(
                        f"Farmer with email '{match.email}' is already registered with another account. Please sign in with that account."
                    )

        # Check if an unlinked legacy record matches phone or email
        unlinked_match = next((m for m in existing_matches if not m.supabase_user_id), None)
        if unlinked_match:
            unlinked_match.supabase_user_id = supabase_user.user_id
            unlinked_match.phone_number = phone
            if email:
                unlinked_match.email = email
            unlinked_match.full_name = data.full_name
            unlinked_match.preferred_language = data.preferred_language
            unlinked_match.village = data.village
            unlinked_match.district = data.district
            unlinked_match.state = data.state
            unlinked_match.country = data.country

            if not unlinked_match.farms:
                farm = Farm(
                    farmer_id=unlinked_match.id,
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
            await db.refresh(unlinked_match)
            return unlinked_match

        # 3. Create new farmer entity
        farmer = Farmer(
            supabase_user_id=supabase_user.user_id,
            full_name=data.full_name,
            phone_number=phone,
            email=email,
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
