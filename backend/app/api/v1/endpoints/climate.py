import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_farmer
from app.models.farmer import Farmer
from app.services.farm_service import FarmService
from app.services.climate.climate_aggregation_service import ClimateAggregationService
from app.schemas.climate import (
    CurrentClimateResponse,
    ClimateForecastResponse,
    HistoricalClimateResponse,
    ClimateRefreshResponse,
)

router = APIRouter()


@router.get(
    "/{farm_id}/climate/current",
    response_model=CurrentClimateResponse,
    summary="Get current weather & micro-climate for a farm plot",
    description=(
        "Retrieves real-time atmospheric readings from Open-Meteo for the farm's coordinates. "
        "Reports physical IoT soil sensor status if available or marks in-situ telemetry as unavailable. "
        "Enforces farm ownership."
    ),
)
async def get_current_climate(
    farm_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    # Enforce farm ownership
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await ClimateAggregationService.get_current_weather(db, farm_id)


@router.get(
    "/{farm_id}/climate/forecast",
    response_model=ClimateForecastResponse,
    summary="Get 7-day weather forecast and 24h hourly trends",
    description=(
        "Retrieves high-resolution 7-day weather forecast including daily min/max temperatures, "
        "precipitation probability, rainfall volume, and 24-hour hourly trend. Enforces farm ownership."
    ),
)
async def get_climate_forecast(
    farm_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await ClimateAggregationService.get_forecast(db, farm_id)


@router.get(
    "/{farm_id}/climate/history",
    response_model=HistoricalClimateResponse,
    summary="Get historical climate context from NASA POWER",
    description=(
        "Retrieves historical daily meteorological observations (temperature, precipitation, relative humidity, "
        "and solar irradiance) from NASA POWER for the farm coordinates. Calculates crop Growing Degree Days (GDD). "
        "Enforces farm ownership."
    ),
)
async def get_climate_history(
    farm_id: uuid.UUID,
    days: int = Query(30, ge=7, le=90, description="Number of past days to analyze (7 to 90)"),
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await ClimateAggregationService.get_historical_climate(db, farm_id, days=days)


@router.post(
    "/{farm_id}/climate/refresh",
    response_model=ClimateRefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="Force refresh climate data bypassing cache",
    description=(
        "Bypasses cache and triggers an immediate re-fetch from external meteorological APIs. "
        "Enforces farm ownership."
    ),
)
async def refresh_climate(
    farm_id: uuid.UUID,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    await FarmService.get_by_farmer_and_id(db, current_farmer.id, farm_id)
    return await ClimateAggregationService.refresh_climate_data(db, farm_id)

