import time
import uuid
from unittest.mock import AsyncMock, patch
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.seed_crops import seed_crop_database
from app.services.risk.rainfall_risk_evaluator import RainfallRiskEvaluator
from app.services.risk.temperature_risk_evaluator import TemperatureRiskEvaluator
from app.services.risk.humidity_disease_evaluator import HumidityDiseaseRiskEvaluator
from app.services.risk.wind_risk_evaluator import WindRiskEvaluator
from app.services.risk.soil_moisture_evaluator import SoilMoistureRiskEvaluator
from app.services.risk.risk_engine import CropRiskEngine
from app.services.climate.open_meteo_service import OpenMeteoService


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
        "full_name": "Suresh Kale",
        "phone_number": phone,
        "preferred_language": "mr",
        "village": "Rahuri",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Krishi Plot A",
        "latitude": 19.3900,
        "longitude": 74.6500,
        "farm_acreage": 4.5,
        "soil_type": "Black Clay Soil (Vertisol)",
        "irrigation_source": "Canal",
    }
    res = await client.post("/api/v1/auth/register-farmer", json=payload, headers=headers)
    assert res.status_code == 201
    return res.json(), token


# Mock Open-Meteo responses for API tests
MOCK_METEO_CURRENT = {
    "latitude": 19.39,
    "longitude": 74.65,
    "elevation": 510.0,
    "timezone": "Asia/Kolkata",
    "current": {
        "time": "2026-11-04T12:00",
        "temperature_2m": 33.5,
        "apparent_temperature": 36.0,
        "relative_humidity_2m": 78,
        "precipitation": 12.5,
        "rain": 12.5,
        "weather_code": 61,
        "wind_speed_10m": 18.0,
        "wind_direction_10m": 240,
        "wind_gusts_10m": 25.0,
        "surface_pressure": 1010.5,
    },
    "daily": {
        "time": ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"],
        "weather_code": [61, 3, 2, 0, 0, 1, 2],
        "temperature_2m_max": [35.0, 34.0, 33.0, 32.0, 31.0, 32.0, 33.0],
        "temperature_2m_min": [22.0, 21.0, 20.0, 19.0, 18.0, 19.0, 20.0],
        "precipitation_sum": [15.0, 5.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "precipitation_probability_max": [85, 45, 10, 5, 0, 10, 15],
        "wind_speed_10m_max": [22.0, 18.0, 15.0, 12.0, 10.0, 12.0, 14.0],
    },
    "hourly": {
        "time": ["2026-11-04T00:00", "2026-11-04T06:00", "2026-11-04T12:00", "2026-11-04T18:00"],
        "temperature_2m": [22.0, 25.0, 33.5, 28.0],
        "relative_humidity_2m": [85, 75, 78, 80],
        "precipitation": [0.0, 2.0, 8.5, 2.0],
        "precipitation_probability": [20, 50, 85, 60],
        "wind_speed_10m": [10.0, 12.0, 18.0, 15.0],
    },
}


# ==============================================================================
# 1. EVALUATOR UNIT TESTS
# ==============================================================================

def test_rainfall_risk_evaluator_dry_vs_extreme():
    """Verify safe vs flood conditions evaluated accurately."""
    safe_eval = RainfallRiskEvaluator.evaluate(
        precip_24h_mm=0.0,
        precip_7d_sum_mm=2.0,
        rain_probability_pct=5.0,
        crop_name="Tomato",
        water_demand="Moderate",
        stage_name="Vegetative Growth",
        water_sensitivity="Moderate",
        soil_type="Loam Soil",
    )
    assert safe_eval.score < 25.0
    assert safe_eval.level == "LOW"

    extreme_eval = RainfallRiskEvaluator.evaluate(
        precip_24h_mm=120.0,
        precip_7d_sum_mm=250.0,
        rain_probability_pct=95.0,
        crop_name="Tomato",
        water_demand="Moderate",
        stage_name="Flowering",
        water_sensitivity="Critical",
        soil_type="Clay Soil",
    )
    assert extreme_eval.score >= 80.0
    assert extreme_eval.level == "CRITICAL"
    assert any("drainage" in d.lower() or "flood" in d.lower() or "waterlogging" in d.lower() for d in extreme_eval.driver_factors)


def test_rice_waterlogging_tolerance():
    """Rice in vegetative/transplanting phase welcomes water, scoring much lower than tomato."""
    tomato_eval = RainfallRiskEvaluator.evaluate(
        precip_24h_mm=45.0,
        precip_7d_sum_mm=80.0,
        rain_probability_pct=80.0,
        crop_name="Tomato",
        water_demand="Moderate",
        stage_name="Vegetative Growth",
        water_sensitivity="Moderate",
    )

    rice_eval = RainfallRiskEvaluator.evaluate(
        precip_24h_mm=45.0,
        precip_7d_sum_mm=80.0,
        rain_probability_pct=80.0,
        crop_name="Rice",
        water_demand="Very High",
        stage_name="Vegetative Growth",
        water_sensitivity="Low",
    )

    assert rice_eval.score < tomato_eval.score
    assert any("tolerance" in d.lower() or "tolerant" in d.lower() or "rice" in d.lower() for d in rice_eval.driver_factors)


def test_temperature_risk_evaluator():
    """Test heat stress and cold stress thresholds."""
    # Tomato at 38°C during Flowering (critical max 35°C) -> CRITICAL
    heat_crit = TemperatureRiskEvaluator.evaluate_heat_stress(
        temp_max_c=38.5,
        crop_name="Tomato",
        stage_name="Flowering",
        temp_optimal_max_c=30.0,
        temp_critical_max_c=35.0,
    )
    assert heat_crit.score >= 80.0
    assert heat_crit.level == "CRITICAL"
    assert any("blossom" in d.lower() or "abscission" in d.lower() for d in heat_crit.driver_factors)

    # Optimal temperature (25°C) -> LOW
    heat_safe = TemperatureRiskEvaluator.evaluate_heat_stress(
        temp_max_c=25.0,
        crop_name="Tomato",
        stage_name="Flowering",
        temp_optimal_max_c=30.0,
        temp_critical_max_c=35.0,
    )
    assert heat_safe.score < 25.0
    assert heat_safe.level == "LOW"

    # Frost condition (-2°C for wheat) -> CRITICAL
    frost_eval = TemperatureRiskEvaluator.evaluate_cold_stress(
        temp_min_c=-2.0,
        crop_name="Wheat",
        stage_name="Heading & Flowering",
        temp_optimal_min_c=10.0,
        temp_critical_min_c=2.0,
    )
    assert frost_eval.score >= 80.0
    assert frost_eval.level == "CRITICAL"


def test_humidity_disease_evaluator():
    """Test disease favorable conditions (warm + high RH + leaf wetness)."""
    # High fungal risk
    disease_high = HumidityDiseaseRiskEvaluator.evaluate(
        relative_humidity_pct=92.0,
        temperature_c=24.0,
        precipitation_mm=10.0,
        crop_name="Tomato",
        stage_name="Fruiting",
    )
    assert disease_high.score >= 70.0
    assert disease_high.level in ["HIGH", "CRITICAL"]
    assert any("blight" in d.lower() or "fungal" in d.lower() or "humidity" in d.lower() for d in disease_high.driver_factors)

    # Dry & hot -> LOW fungal risk
    disease_low = HumidityDiseaseRiskEvaluator.evaluate(
        relative_humidity_pct=30.0,
        temperature_c=35.0,
        precipitation_mm=0.0,
        crop_name="Tomato",
        stage_name="Fruiting",
    )
    assert disease_low.score < 30.0
    assert disease_low.level == "LOW"


def test_wind_risk_evaluator():
    """Test wind lodging and drift risk."""
    high_wind = WindRiskEvaluator.evaluate(
        wind_speed_kmh=42.0,
        crop_name="Maize",
        stage_name="Cob Formation & Grain Filling",
    )
    assert high_wind.score >= 60.0
    assert high_wind.level in ["HIGH", "CRITICAL"]
    assert any("lodging" in d.lower() or "drift" in d.lower() for d in high_wind.driver_factors)

    calm_wind = WindRiskEvaluator.evaluate(
        wind_speed_kmh=8.0,
        crop_name="Maize",
        stage_name="Cob Formation & Grain Filling",
    )
    assert calm_wind.score < 25.0
    assert calm_wind.level == "LOW"


def test_soil_moisture_evaluator_unavailability():
    """Strict adherence: without physical IoT probes, soil moisture is marked unavailable and score is None."""
    no_probe = SoilMoistureRiskEvaluator.evaluate(
        in_situ_moisture_pct=None,
        crop_name="Tomato",
        stage_name="Flowering",
        is_in_situ_sensor=False,
    )
    assert no_probe.is_available is False
    assert no_probe.score is None
    assert no_probe.level == "UNAVAILABLE"
    assert "unavailable" in no_probe.explanation.lower()


def test_crop_risk_engine_weight_redistribution():
    """Test dynamic reallocation of soil moisture weight to atmospheric rainfall and heat."""
    current_weather = {
        "temperature_2m": 34.0,
        "relative_humidity_2m": 80.0,
        "precipitation": 25.0,
        "wind_speed_10m": 15.0,
    }
    daily_forecast = [
        {
            "day_number": 1,
            "date": "2026-11-04",
            "temp_max_c": 35.0,
            "temp_min_c": 22.0,
            "precipitation_mm": 20.0,
            "precipitation_probability_pct": 80.0,
            "wind_speed_max_kmh": 18.0,
            "weather_condition": "Showers",
            "weather_icon": "🌧️",
        }
    ]

    result = CropRiskEngine.evaluate_farm_crop_risk(
        crop_name="Tomato",
        stage_name="Flowering",
        current_weather=current_weather,
        daily_forecast=daily_forecast,
        crop_profile={"water_demand": "Moderate", "temp_optimal_max_c": 30.0, "temp_max_c": 35.0},
        stage_profile={"water_sensitivity": "Critical", "temp_critical_max_c": 35.0},
        soil_type="Clay Soil",
        in_situ_moisture_pct=None,
        is_in_situ_sensor=False,
    )

    assert 0.0 <= result["overall_risk_score"] <= 100.0
    assert result["overall_risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert result["scoring_methodology"] == "ICAR_FAO_MULTI_CRITERIA_RISK_V1"
    assert len(result["daily_timeline"]) == 1
    assert result["category_scores"]["soil_moisture"] is None
    assert len(result["contributing_factors"]) > 0


# ==============================================================================
# 2. API INTEGRATION TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_api_risk_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """Test complete API risk evaluation cycle: latest, on-demand evaluation, timeline, and cross-farmer isolation."""
    # Ensure crops catalog seeded
    await seed_crop_database(db_session)

    # 1. Register Farmer A
    user_a = str(uuid.uuid4())
    farmer_a_data, token_a = await register_test_farmer(client, user_a, phone="+919876543201")
    farm_id_a = farmer_a_data["farms"][0]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Farmer B
    user_b = str(uuid.uuid4())
    farmer_b_data, token_b = await register_test_farmer(client, user_b, phone="+919876543202")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO_CURRENT, 19.39, 74.65)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):

        # 2. GET /farms/{farm_id}/risk/latest (Farmer A)
        res_latest = await client.get(f"/api/v1/farms/{farm_id_a}/risk/latest", headers=headers_a)
        assert res_latest.status_code == 200
        latest_data = res_latest.json()
        assert latest_data["farm_id"] == farm_id_a
        assert "overall_risk_score" in latest_data
        assert latest_data["overall_risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
        assert latest_data["category_scores"]["soil_moisture"] is None  # Strict soil sensor check
        assert len(latest_data["daily_timeline"]) >= 1

        # 3. POST /farms/{farm_id}/risk/evaluate (On-demand evaluation)
        res_eval = await client.post(
            f"/api/v1/farms/{farm_id_a}/risk/evaluate",
            json={},
            headers=headers_a,
        )
        assert res_eval.status_code == 201
        eval_data = res_eval.json()
        assert eval_data["farm_id"] == farm_id_a
        assert eval_data["overall_risk_score"] >= 0.0

        # 4. GET /farms/{farm_id}/risk/timeline
        res_timeline = await client.get(f"/api/v1/farms/{farm_id_a}/risk/timeline", headers=headers_a)
        assert res_timeline.status_code == 200
        timeline_data = res_timeline.json()
        assert isinstance(timeline_data, list)
        assert len(timeline_data) >= 1
        assert "overall_score" in timeline_data[0]
        assert "primary_risk_category" in timeline_data[0]

        # 5. GET /farms/{farm_id}/risk/history
        res_history = await client.get(f"/api/v1/farms/{farm_id_a}/risk/history", headers=headers_a)
        assert res_history.status_code == 200
        history_data = res_history.json()
        assert isinstance(history_data, list)
        assert len(history_data) >= 2  # generated at least two

        # 6. Cross-farmer Isolation: Farmer B tries to access Farmer A's risk
        res_forbidden = await client.get(f"/api/v1/farms/{farm_id_a}/risk/latest", headers=headers_b)
        assert res_forbidden.status_code == 404
