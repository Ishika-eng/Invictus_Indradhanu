from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.core.security import SupabaseUser, get_current_user
from app.models.farmer import Farmer


async def get_current_farmer(
    user: SupabaseUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Farmer:
    """Dependency that resolves the authenticated Farmer entity linked to the Supabase user ID."""
    result = await db.execute(
        select(Farmer)
        .options(selectinload(Farmer.farms))
        .where(Farmer.supabase_user_id == user.user_id)
    )
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found for this authenticated user. Please register your profile.",
        )
    return farmer


__all__ = ["get_db", "AsyncGenerator", "AsyncSession", "SupabaseUser", "get_current_user", "get_current_farmer"]
