import base64
import time
from typing import Optional, Dict, Any
from pydantic import BaseModel
import jwt
from jwt import PyJWKClient, PyJWK
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)

_jwks_client: Optional[PyJWKClient] = None

# Fallback project JWKs for resilient offline / air-gapped cryptographic validation
KNOWN_JWKS: Dict[str, Dict[str, Any]] = {
    "5440ca68-072b-4e6f-b475-9e1276b0a310": {
        "alg": "ES256",
        "crv": "P-256",
        "ext": True,
        "key_ops": ["verify"],
        "kid": "5440ca68-072b-4e6f-b475-9e1276b0a310",
        "kty": "EC",
        "use": "sig",
        "x": "_S3IGA-z7CEyiHeHdZUxA4hEBaHv-8XNA7pxpJk_jzI",
        "y": "JhDo_qcvQGtR7Ekq5_kabD3Fl7jwxHmExiz3PNSY7iQ",
    }
}


def get_jwks_client() -> Optional[PyJWKClient]:
    """Retrieves or creates a cached PyJWKClient for live Supabase JWKS verification."""
    global _jwks_client
    if _jwks_client is None:
        supabase_url = getattr(settings, "SUPABASE_URL", "").strip()
        if supabase_url and "supabase.co" in supabase_url:
            jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
            try:
                _jwks_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=86400)
            except Exception as e:
                logger.warning(f"Could not initialize PyJWKClient for {jwks_url}: {e}")
    return _jwks_client


class SupabaseUser(BaseModel):
    """Authenticated user extracted from verified Supabase Auth JWT token."""
    user_id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str = "authenticated"
    raw_claims: Dict[str, Any] = {}


def verify_supabase_jwt(token: str) -> SupabaseUser:
    """Decodes and validates a Supabase JWT token.
    
    Supports:
    1. Modern Supabase ES256/RS256 asymmetric cryptographic signatures using JWKS public keys.
    2. Legacy / test HS256 HMAC signatures using SUPABASE_JWT_SECRET.
    3. Strict token expiration enforcement and subject validation.
    """
    if not token or not isinstance(token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is empty or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Parse unverified JWT header to determine algorithm and key ID
    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception as e:
        logger.warning(f"Malformed JWT header: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: malformed header ({str(e)})",
            headers={"WWW-Authenticate": "Bearer"},
        )

    alg = unverified_header.get("alg", "HS256")
    kid = unverified_header.get("kid")

    payload: Dict[str, Any] = {}

    try:
        # PATH A: Asymmetric Elliptic-Curve (ES256) or RSA (RS256) signature (Supabase GoTrue)
        if alg in ["ES256", "RS256"]:
            key = None

            # 1. Look up signing key from dynamic JWKS client
            jwks_client = get_jwks_client()
            if jwks_client:
                try:
                    signing_key = jwks_client.get_signing_key_from_jwt(token)
                    key = signing_key.key
                except Exception as jwks_err:
                    logger.debug(f"JWKS live lookup failed: {jwks_err}")

            # 2. Fallback to pre-cached known JWK if network lookup was unavailable
            if key is None and kid and kid in KNOWN_JWKS:
                try:
                    pyjwk = PyJWK.from_dict(KNOWN_JWKS[kid])
                    key = pyjwk.key
                except Exception as jwk_dict_err:
                    logger.debug(f"Cached JWK initialization failed: {jwk_dict_err}")

            if key is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Unable to resolve cryptographic verification key for algorithm '{alg}' (kid: {kid}).",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            payload = jwt.decode(
                token,
                key,
                algorithms=[alg],
                options={"verify_exp": True, "verify_aud": False},
            )

        # PATH B: Symmetric HMAC-SHA256 signature (Unit tests & local dev fallback)
        elif alg == "HS256":
            secret = settings.SUPABASE_JWT_SECRET
            verify_signature = bool(secret and "YOUR_JWT_SECRET" not in secret)

            if verify_signature:
                try:
                    payload = jwt.decode(
                        token,
                        secret,
                        algorithms=["HS256"],
                        options={"verify_exp": True, "verify_aud": False},
                    )
                except jwt.InvalidSignatureError:
                    # If secret is base64-encoded with padding, attempt decoded bytes
                    if "=" in secret:
                        try:
                            secret_bytes = base64.b64decode(secret)
                            payload = jwt.decode(
                                token,
                                secret_bytes,
                                algorithms=["HS256"],
                                options={"verify_exp": True, "verify_aud": False},
                            )
                        except Exception:
                            raise
                    else:
                        raise
            else:
                # Unconfigured dev fallback (testing only)
                payload = jwt.decode(
                    token,
                    options={"verify_signature": False, "verify_exp": True, "verify_aud": False},
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unsupported JWT signing algorithm: '{alg}'",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except jwt.ExpiredSignatureError:
        logger.warning("Supabase JWT has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid Supabase JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error validating Supabase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication token verification error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Extract and validate subject
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject (sub) claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Extract phone (root claim or user_metadata)
    phone = payload.get("phone")
    if not phone and "user_metadata" in payload and isinstance(payload["user_metadata"], dict):
        phone = payload["user_metadata"].get("phone_number") or payload["user_metadata"].get("phone")

    # 4. Extract email (root claim or user_metadata)
    email = payload.get("email")
    if not email and "user_metadata" in payload and isinstance(payload["user_metadata"], dict):
        email = payload["user_metadata"].get("email")

    role = payload.get("role", "authenticated")

    return SupabaseUser(
        user_id=sub,
        phone=phone,
        email=email,
        role=role,
        raw_claims=payload,
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
