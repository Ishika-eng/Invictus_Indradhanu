from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
)
from app.database.session import check_db_connectivity
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} [Environment: {settings.ENVIRONMENT}]")
    db_alive = await check_db_connectivity()
    if db_alive:
        logger.info("Database connectivity verified.")
    else:
        logger.warning("Database connectivity check failed or initial tables missing.")
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=(
        "Indradhanu Backend API: Hyperlocal AI-Powered Climate & Agricultural Advisory Platform. "
        "Transforms environmental data from Open-Meteo & NASA POWER into actionable farming recommendations "
        "delivered across Voice IVR, SMS, and WhatsApp."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


# Root Health Check Endpoint
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Root Service Health Status",
)
async def root_health(db: AsyncSession = Depends(get_db)):
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


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
    }


# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

