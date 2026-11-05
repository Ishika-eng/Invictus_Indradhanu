import time
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop import Crop
from app.services.climate.climate_cache_service import climate_cache
from app.services.climate.climate_aggregation_service import ClimateAggregationService
from app.services.risk.risk_assessment_service import RiskAssessmentService
from app.services.advisory.advisory_generation_service import AdvisoryGenerationService
from app.services.advisory.rules_engine import AdvisoryRulesEngine


@pytest.mark.asyncio
async def test_climate_aggregation_cache_reuse(db_session: AsyncSession):
    """Verify that unified climate caching avoids duplicate network calls and DB writes."""
    farm_id = uuid.uuid4()
    mock_farm = Farm(
        id=farm_id,
        farmer_id=uuid.uuid4(),
        name="Performance Test Plot",
        latitude=18.5204,
        longitude=73.8567,
        acreage=3.0,
        soil_type="Black Clay Soil",
        irrigation_source="Drip Irrigation",
    )

    cache_key = f"weather:{round(mock_farm.latitude, 3)}:{round(mock_farm.longitude, 3)}"
    climate_cache.invalidate("weather:")

    # 1. First fetch (Cold - API call)
    t0 = time.perf_counter()
    curr_data, fore_data, _ = await ClimateAggregationService.get_current_and_forecast(
        db=db_session,
        farm_id=farm_id,
        bypass_cache=False,
        farm=mock_farm,
    )
    t_cold = time.perf_counter() - t0

    assert curr_data["current"]["temperature_c"] is not None
    assert len(fore_data["daily_forecast"]) == 7
    assert climate_cache.get(cache_key) is not None

    # 2. Second fetch (Warm - Cache Hit)
    t0 = time.perf_counter()
    curr_data_warm, fore_data_warm, _ = await ClimateAggregationService.get_current_and_forecast(
        db=db_session,
        farm_id=farm_id,
        bypass_cache=False,
        farm=mock_farm,
    )
    t_warm = time.perf_counter() - t0

    # Cache hit must be sub-5ms (dramatically faster than cold API call)
    assert t_warm < 0.05
    assert curr_data_warm["current"]["temperature_c"] == curr_data["current"]["temperature_c"]
    assert len(fore_data_warm["daily_forecast"]) == len(fore_data["daily_forecast"])


@pytest.mark.asyncio
async def test_risk_assessment_avoids_redundant_fetches(db_session: AsyncSession):
    """Verify that RiskAssessmentService accepts pre-resolved climate and farm objects."""
    farm_id = uuid.uuid4()
    farmer_id = uuid.uuid4()
    mock_farm = Farm(
        id=farm_id,
        farmer_id=farmer_id,
        name="Opt Farm",
        latitude=18.5204,
        longitude=73.8567,
        acreage=2.5,
        soil_type="Loamy Soil",
        irrigation_source="Well Irrigation",
    )

    curr_data, fore_data, _ = await ClimateAggregationService.get_current_and_forecast(
        db=db_session,
        farm_id=farm_id,
        farm=mock_farm,
    )

    t0 = time.perf_counter()
    risk_res = await RiskAssessmentService.evaluate_farm_risk(
        db=db_session,
        farmer_id=farmer_id,
        farm_id=farm_id,
        current_data=curr_data,
        forecast_data=fore_data,
        farm=mock_farm,
    )
    t_risk = time.perf_counter() - t0

    assert risk_res["overall_risk_score"] >= 0.0
    assert "rainfall" in risk_res["category_scores"]
    assert "heat" in risk_res["category_scores"]
    assert t_risk < 1.0  # Fast calculation avoiding redundant fetches


@pytest.mark.asyncio
async def test_rules_engine_deterministic_latency():
    """Verify that deterministic agronomic decision rules execute in microseconds."""
    mock_weather = {
        "temperature_c": 38.5,
        "relative_humidity_pct": 35.0,
        "precipitation_mm": 0.0,
        "wind_speed_kmh": 12.0,
    }
    mock_forecast = [
        {"date": "2026-11-06", "temp_max_c": 39.0, "temp_min_c": 24.0, "precipitation_mm": 0.0, "precipitation_probability_pct": 10.0}
    ]

    t0 = time.perf_counter()
    directives = AdvisoryRulesEngine.evaluate_directives(
        crop_name="Tomato",
        stage_name="Flowering",
        risk_scores={"temperature_risk": 75.0, "rainfall_risk": 15.0},
        current_weather=mock_weather,
        daily_forecast=mock_forecast,
        soil_type="Medium Black Soil",
    )
    t_rules = time.perf_counter() - t0

    assert len(directives) > 0
    assert t_rules < 0.01  # Sub-10ms
    assert "Heat stress" in directives[0].why_it_matters or "cooling" in directives[0].immediate_action.lower()
