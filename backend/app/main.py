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
        try:
            from app.database.session import AsyncSessionLocal
            from app.database.seed_crops import seed_crop_database
            async with AsyncSessionLocal() as session:
                seeded = await seed_crop_database(session)
                logger.info(f"Crop knowledge base initialized: {seeded} new crop(s) seeded.")
        except Exception as seed_err:
            logger.warning(f"Crop database seeding noticed: {seed_err}")
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

# CORS Middleware Configuration
# Guarantees http://localhost:3000 and all development & production origins are explicitly allowed
cors_origins: list[str] = (
    list(settings.CORS_ORIGINS)
    if isinstance(settings.CORS_ORIGINS, list)
    else [str(settings.CORS_ORIGINS)]
)
# Ensure http://localhost:3000 is always present and clean
clean_origins: list[str] = []
for orig in cors_origins:
    norm = str(orig).strip().strip("'\"").rstrip("/")
    if norm and norm not in clean_origins and norm != "*":  # Never use wildcard with credentials=True
        clean_origins.append(norm)

if "http://localhost:3000" not in clean_origins:
    clean_origins.insert(0, "http://localhost:3000")

ALLOWED_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
]

ALLOWED_HEADERS = [
    "Authorization",
    "Content-Type",
    "Accept",
    "Origin",
    "User-Agent",
    "DNT",
    "Cache-Control",
    "X-Mx-ReqToken",
    "Keep-Alive",
    "X-Requested-With",
    "If-Modified-Since",
    "X-Admin-Role",
    "X-Admin-Key",
    "*",
]

EXPOSED_HEADERS = [
    "Content-Length",
    "Content-Range",
    "Authorization",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=clean_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
    expose_headers=EXPOSED_HEADERS,
    max_age=86400,
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
    db_alive = await check_db_connectivity(db)
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

