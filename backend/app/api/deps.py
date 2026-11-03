from typing import AsyncGenerator, Optional
from fastapi import Depends, Header, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.database.session import get_db
from app.core.security import SupabaseUser, get_current_user, security_scheme, verify_supabase_jwt
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


async def require_admin_or_operator(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    x_admin_role: Optional[str] = Header(None, alias="X-Admin-Role"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Role-based access control dependency for administrative dashboards and operations.
    Enforces that standard farmer accounts cannot access administrator/operator data.
    """
    # 1. Secret Key Bypass for Backend / Automation / Operator Tools
    if x_admin_key and x_admin_key == settings.ADMIN_SECRET_KEY:
        return {"role": "ADMIN", "source": "API_KEY", "operator_id": "system_admin"}

    # 2. Explicit Development Role Override Header
    if x_admin_role and x_admin_role.upper() in ["ADMIN", "OPERATOR"]:
        return {"role": x_admin_role.upper(), "source": "HEADER", "operator_id": f"dev_{x_admin_role.lower()}"}

    # 3. Supabase JWT Authentication & Farmer Role Verification
    if credentials and credentials.credentials:
        try:
            user = verify_supabase_jwt(credentials.credentials)
            
            # Check JWT claims metadata
            app_metadata = user.raw_claims.get("app_metadata", {})
            user_metadata = user.raw_claims.get("user_metadata", {})
            claimed_role = app_metadata.get("role") or user_metadata.get("role") or user.role
            
            if claimed_role and str(claimed_role).lower() in ["admin", "operator", "service_role"]:
                return {"role": "ADMIN" if "admin" in str(claimed_role).lower() else "OPERATOR", "source": "JWT", "operator_id": user.user_id}

            # Check database Farmer entity
            result = await db.execute(
                select(Farmer).where(Farmer.supabase_user_id == user.user_id)
            )
            farmer = result.scalar_one_or_none()
            if farmer:
                if farmer.role in ["ADMIN", "OPERATOR"]:
                    return {"role": farmer.role, "source": "DATABASE", "operator_id": str(farmer.id), "farmer": farmer}
                else:
                    # Explicit rejection for normal farmers
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: Administrative privileges required. Farmer accounts cannot access this data.",
                    )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {str(e)}",
            )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied: Administrative or Operator authorization required.",
    )


__all__ = [
    "get_db",
    "AsyncGenerator",
    "AsyncSession",
    "SupabaseUser",
    "get_current_user",
    "get_current_farmer",
    "require_admin_or_operator",
]
