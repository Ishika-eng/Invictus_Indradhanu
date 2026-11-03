import time
from typing import Optional, Dict, Any
from pydantic import BaseModel
import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


class SupabaseUser(BaseModel):
    """Authenticated user extracted from verified Supabase Auth JWT token."""
    user_id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str = "authenticated"
    raw_claims: Dict[str, Any] = {}


def verify_supabase_jwt(token: str) -> SupabaseUser:
    """Decodes and validates a Supabase JWT token.
    
    Verifies cryptographic signature using SUPABASE_JWT_SECRET when configured,
    checks expiration, and extracts claims.
    """
    try:
        # Check if JWT secret is available and not a placeholder for cryptographic HMAC-SHA256 verification
        secret = settings.SUPABASE_JWT_SECRET
        verify_signature = bool(secret and "YOUR_JWT_SECRET" not in secret)
        
        decode_kwargs: Dict[str, Any] = {
            "algorithms": ["HS256", "RS256", "ES256"],
            "options": {
                "verify_signature": verify_signature,
                "verify_exp": True,
                "verify_aud": False,
            },
        }
        
        if verify_signature:
            payload = jwt.decode(token, secret, **decode_kwargs)
        else:
            # Fallback for unconfigured dev environment
            payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": True, "verify_aud": False})

        sub = payload.get("sub")
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject (sub) claim.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Phone can be at root level or inside user_metadata
        phone = payload.get("phone")
        if not phone and "user_metadata" in payload:
            phone = payload["user_metadata"].get("phone")

        email = payload.get("email")
        role = payload.get("role", "authenticated")

        return SupabaseUser(
            user_id=sub,
            phone=phone,
            email=email,
            role=role,
            raw_claims=payload,
        )

    except jwt.ExpiredSignatureError:
        logger.warning("Supabase JWT has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please verify your phone number again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid Supabase JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error validating Supabase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> SupabaseUser:
    """Dependency for endpoints requiring an authenticated Supabase user."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided. Please provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_supabase_jwt(credentials.credentials)
