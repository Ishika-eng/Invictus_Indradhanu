from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import settings
from app.database.session import check_db_connectivity
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Comprehensive API and database health check",
    description="Returns service availability, version, environment, and verifies live database connectivity.",
)
async def check_health(db: AsyncSession = Depends(get_db)):
    db_alive = await check_db_connectivity()
    if not db_alive:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connectivity check failed",
        )

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database="connected",
    )

