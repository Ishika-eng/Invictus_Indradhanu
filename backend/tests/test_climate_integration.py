import time
import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.climate.open_meteo_service import OpenMeteoService
from app.services.climate.nasa_power_service import NASAPowerService
from app.services.climate.gdd_service import GDDService
from app.database.seed_crops import seed_crop_database


def create_test_token(user_id: str, phone: str = "+919876543210") -> str:
    payload = {
        "sub": user_id,
        "phone": phone,
        "role": "authenticated",
        "aud": "authenticated",
        "exp": time.time() + 3600,
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


async def register_test_farmer(client: AsyncClient, user_id: str, phone: str = "+919876543210") -> tuple[dict, str]:
    token = create_test_token(user_id, phone=phone)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "full_name": "Ramesh Patil",
        "phone_number": phone,
        "preferred_language": "mr",
        "village": "Baramati",
        "district": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Main Plot",
        "latitude": 18.1500,
        "longitude": 74.5800,
        "farm_acreage": 5.0,
        "soil_type": "Black Clay Soil (Vertisol)",
        "irrigation_source": "Drip Irrigation",
    }
    res = await client.post("/api/v1/auth/register-farmer", json=payload, headers=headers)
    assert res.status_code == 201
    return res.json(), token


# Mock Open-Meteo response
MOCK_OPEN_METEO_PAYLOAD = {
    "latitude": 18.15,
    "longitude": 74.58,
    "elevation": 550.0,
    "timezone": "Asia/Kolkata",
    "current": {
        "time": "2026-11-04T12:00",
        "temperature_2m": 29.5,
        "apparent_temperature": 31.0,
        "relative_humidity_2m": 65.0,
        "precipitation": 1.5,
        "rain": 1.5,
        "weather_code": 61,
        "wind_speed_10m": 12.4,
        "wind_direction_10m": 240.0,
    },
    "daily": {
        "time": ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"],
        "temperature_2m_max": [31.0, 32.5, 30.0, 29.0, 31.5, 33.0, 32.0],
        "temperature_2m_min": [19.0, 20.0, 18.5, 17.0, 18.0, 19.5, 20.0],
        "precipitation_sum": [2.5, 0.0, 0.0, 5.2, 12.0, 0.0, 0.0],
        "precipitation_probability_max": [65.0, 20.0, 10.0, 75.0, 90.0, 15.0, 10.0],
        "wind_speed_10m_max": [14.0, 11.0, 16.0, 22.0, 25.0, 12.0, 10.0],
        "weather_code": [61, 1, 0, 63, 65, 2, 0],
    },
    "hourly": {
        "time": [f"2026-11-04T{h:02d}:00" for h in range(24)],
        "temperature_2m": [22.0 + (h % 10) for h in range(24)],
        "relative_humidity_2m": [70.0 - (h % 20) for h in range(24)],
        "precipitation_probability": [20.0 if h < 12 else 60.0 for h in range(24)],
        "precipitation": [0.0 if h < 14 else 0.5 for h in range(24)],
        "weather_code": [1 for _ in range(24)],
        "wind_speed_10m": [10.0 for _ in range(24)],
        "direct_normal_irradiance": [300.0 if 6 <= h <= 18 else 0.0 for h in range(24)],
    },
}

# Mock NASA POWER response
MOCK_NASA_POWER_PAYLOAD = {
    "properties": {
        "parameter": {
            "T2M": {"20261025": 26.5, "20261026": 27.0, "20261027": 25.8},
            "T2M_MAX": {"20261025": 32.0, "20261026": 33.0, "20261027": 31.5},
            "T2M_MIN": {"20261025": 19.0, "20261026": 20.0, "20261027": 18.0},
            "PRECTOTCORR": {"20261025": 0.0, "20261026": 4.5, "20261027": 0.0},
            "RH2M": {"20261025": 60.0, "20261026": 72.0, "20261027": 58.0},
            "ALLSKY_SFC_SW_DWN": {"20261025": 19.2, "20261026": 14.8, "20261027": 21.0},
        }
    }
}


def test_gdd_calculation_logic():
    """Verify single day and accumulated GDD calculation with cutoffs and thresholds."""
    # Tomato (T_base = 10.0°C)
    # Day with T_max = 30, T_min = 20 -> Mean = 25 -> GDD = 25 - 10 = 15.0
    gdd_tomato = GDDService.calculate_single_day_gdd(t_max=30.0, t_min=20.0, t_base=10.0)
    assert gdd_tomato == 15.0

    # Wheat (T_base = 5.0°C)
    # Day with T_max = 20, T_min = 10 -> Mean = 15 -> GDD = 15 - 5 = 10.0
    gdd_wheat = GDDService.calculate_single_day_gdd(t_max=20.0, t_min=10.0, t_base=5.0)
    assert gdd_wheat == 10.0

    # Below base temperature -> GDD should be 0.0, never negative
    gdd_cold = GDDService.calculate_single_day_gdd(t_max=8.0, t_min=4.0, t_base=10.0)
    assert gdd_cold == 0.0

    # Accumulated GDD across days
    daily_obs = [
        {"date": "2026-10-01", "temperature_max_c": 30.0, "temperature_min_c": 20.0},  # GDD = 15.0
        {"date": "2026-10-02", "temperature_max_c": 32.0, "temperature_min_c": 18.0},  # Mean=25, GDD = 15.0
        {"date": "2026-10-03", "temperature_max_c": 28.0, "temperature_min_c": 16.0},  # Mean=22, GDD = 12.0
    ]
    accum = GDDService.calculate_accumulated_gdd("Tomato", daily_obs)
    assert accum["supported"] is True
    assert accum["accumulated_gdd"] == 42.0  # 15 + 15 + 12 = 42.0
    assert accum["days_evaluated"] == 3


@pytest.mark.asyncio
async def test_open_meteo_service_normalization():
    """Verify Open-Meteo service payload normalization."""
    normalized = OpenMeteoService._normalize_payload(MOCK_OPEN_METEO_PAYLOAD, 18.15, 74.58)

    assert normalized["source"] == "OPEN_METEO"
    assert normalized["current"]["temperature_c"] == 29.5
    assert normalized["current"]["weather_code"] == 61
    assert "Showers" in normalized["current"]["weather_condition"] or "Rain" in normalized["current"]["weather_description"]
    assert len(normalized["daily_forecast"]) == 7
    assert normalized["daily_forecast"][0]["precipitation_probability_pct"] == 65.0
    assert len(normalized["hourly_24h"]) == 24


@pytest.mark.asyncio
async def test_nasa_power_service_normalization():
    """Verify NASA POWER service payload parsing and missing value handling."""
    parsed = NASAPowerService._parse_nasa_payload(
        MOCK_NASA_POWER_PAYLOAD, 18.15, 74.58, date(2026, 10, 25), date(2026, 10, 27)
    )

    assert parsed["source"] == "NASA_POWER"
    assert parsed["status"] == "success"
    assert len(parsed["records"]) == 3
    assert parsed["summary"]["total_precipitation_mm"] == 4.5
    assert parsed["records"][0]["date"] == "2026-10-25"


@pytest.mark.asyncio
async def test_farm_climate_current_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Test GET /api/v1/farms/{farm_id}/climate/current returns real weather and notes unavailable sensor."""
    await seed_crop_database(db_session)
    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]
    headers = {"Authorization": f"Bearer {token}"}

    with patch.object(
        OpenMeteoService, "fetch_weather", AsyncMock(return_value=OpenMeteoService._normalize_payload(MOCK_OPEN_METEO_PAYLOAD, 18.15, 74.58))
    ):
        res = await client.get(f"/api/v1/farms/{farm['id']}/climate/current", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["farm_id"] == farm["id"]
        assert data["current"]["temperature_c"] == 29.5
        assert data["current"]["weather_code"] == 61
        assert data["soil_sensor"]["installed"] is False
        assert data["soil_sensor"]["status"] == "UNAVAILABLE"
        assert data["soil_sensor"]["in_situ_moisture_pct"] is None


@pytest.mark.asyncio
async def test_farm_climate_forecast_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Test GET /api/v1/farms/{farm_id}/climate/forecast returns 7-day daily forecast and 24h hourly trends."""
    await seed_crop_database(db_session)
    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]
    headers = {"Authorization": f"Bearer {token}"}

    with patch.object(
        OpenMeteoService, "fetch_weather", AsyncMock(return_value=OpenMeteoService._normalize_payload(MOCK_OPEN_METEO_PAYLOAD, 18.15, 74.58))
    ):
        res = await client.get(f"/api/v1/farms/{farm['id']}/climate/forecast", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert len(data["daily_forecast"]) == 7
        assert data["daily_forecast"][0]["day_number"] == 1
        assert len(data["hourly_24h"]) == 24


@pytest.mark.asyncio
async def test_farm_climate_history_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Test GET /api/v1/farms/{farm_id}/climate/history returns NASA POWER time series and GDD."""
    await seed_crop_database(db_session)
    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]
    headers = {"Authorization": f"Bearer {token}"}

    parsed_history = NASAPowerService._parse_nasa_payload(
        MOCK_NASA_POWER_PAYLOAD, 18.15, 74.58, date(2026, 10, 25), date(2026, 10, 27)
    )

    with patch.object(NASAPowerService, "fetch_historical", AsyncMock(return_value=parsed_history)):
        res = await client.get(f"/api/v1/farms/{farm['id']}/climate/history?days=30", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["data_source"].startswith("NASA POWER")
        assert len(data["daily_records"]) == 3
        assert data["summary"]["total_precipitation_mm"] == 4.5


@pytest.mark.asyncio
async def test_farm_climate_refresh_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Test POST /api/v1/farms/{farm_id}/climate/refresh forces cache bypass and returns fresh weather."""
    await seed_crop_database(db_session)
    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]
    headers = {"Authorization": f"Bearer {token}"}

    with patch.object(
        OpenMeteoService, "fetch_weather", AsyncMock(return_value=OpenMeteoService._normalize_payload(MOCK_OPEN_METEO_PAYLOAD, 18.15, 74.58))
    ):
        res = await client.post(f"/api/v1/farms/{farm['id']}/climate/refresh", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "refreshed"
        assert data["current"]["temperature_c"] == 29.5
        assert len(data["daily_forecast"]) == 7


@pytest.mark.asyncio
async def test_climate_cross_farmer_protection(client: AsyncClient, db_session: AsyncSession):
    """Verifies that Farmer B cannot access Farmer A's farm climate data."""
    await seed_crop_database(db_session)
    farmer_a, token_a = await register_test_farmer(client, str(uuid.uuid4()), phone="+919333333333")
    farm_a = farmer_a["farms"][0]

    farmer_b, token_b = await register_test_farmer(client, str(uuid.uuid4()), phone="+919444444444")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Farmer B attempts to get Farmer A's climate -> 404 (EntityNotFound because not owned)
    res = await client.get(f"/api/v1/farms/{farm_a['id']}/climate/current", headers=headers_b)
    assert res.status_code == 404
