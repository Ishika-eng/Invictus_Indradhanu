from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.core.security import SupabaseUser
from app.schemas.farmer import AuthMeResponse, FarmerDetailResponse, FarmerRegistrationRequest
from app.services.farmer_service import FarmerService

router = APIRouter()


@router.get(
    "/me",
    response_model=AuthMeResponse,
    summary="Get current authenticated user & farmer profile state",
    description="Validates Supabase Auth token, returns user ID, verified phone, and farmer profile if registered.",
)
async def get_my_auth_state(
    user: SupabaseUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    farmer = await FarmerService.get_by_supabase_id(db, user.user_id)
    return AuthMeResponse(
        authenticated=True,
        supabase_user_id=user.user_id,
        phone_number=user.phone or (farmer.phone_number if farmer else None),
        email=user.email or (farmer.email if farmer else None),
        is_registered=farmer is not None,
        farmer=farmer,
    )


@router.post(
    "/register-farmer",
    response_model=FarmerDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register farmer profile and initial farm with PostGIS coordinates",
    description="Called after successful Supabase phone OTP verification. Binds verified phone & user ID to farmer profile.",
)
async def register_farmer(
    data: FarmerRegistrationRequest,
    user: SupabaseUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await FarmerService.register_farmer_with_farm(db, user, data)

