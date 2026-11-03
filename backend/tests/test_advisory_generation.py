import time
import uuid
from unittest.mock import AsyncMock, patch
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.seed_crops import seed_crop_database
from app.services.advisory.advisory_types import AdvisoryCategory, ActionUrgency, AgronomicDirective
from app.services.advisory.rules_engine import AdvisoryRulesEngine
from app.services.advisory.multilingual_template_engine import MultilingualTemplateEngine
from app.services.advisory.gemini_service import GeminiAdvisoryService
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


async def register_test_farmer(
    client: AsyncClient, user_id: str, phone: str = "+919876543210", lang: str = "mr"
) -> tuple[dict, str]:
    token = create_test_token(user_id, phone=phone)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "full_name": "Balasaheb Shinde",
        "phone_number": phone,
        "preferred_language": lang,
        "village": "Manchar",
        "district": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Shinde Mala Plot 1",
        "latitude": 19.0100,
        "longitude": 73.9400,
        "farm_acreage": 3.5,
        "soil_type": "Black Clay Soil (Vertisol)",
        "irrigation_source": "Drip Irrigation",
    }
    res = await client.post("/api/v1/auth/register-farmer", json=payload, headers=headers)
    assert res.status_code == 201
    return res.json(), token


MOCK_METEO_RAINY = {
    "latitude": 19.01,
    "longitude": 73.94,
    "elevation": 600.0,
    "timezone": "Asia/Kolkata",
    "current": {
        "time": "2026-11-04T12:00",
        "temperature_2m": 27.5,
        "apparent_temperature": 29.0,
        "relative_humidity_2m": 82,
        "precipitation": 18.0,
        "rain": 18.0,
        "weather_code": 63,
        "wind_speed_10m": 14.0,
        "wind_direction_10m": 220,
    },
    "daily": {
        "time": ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"],
        "weather_code": [63, 61, 3, 2, 0, 1, 2],
        "temperature_2m_max": [29.0, 30.0, 31.0, 32.0, 31.0, 32.0, 33.0],
        "temperature_2m_min": [21.0, 20.0, 20.0, 19.0, 18.0, 19.0, 20.0],
        "precipitation_sum": [28.0, 12.0, 2.0, 0.0, 0.0, 0.0, 0.0],
        "precipitation_probability_max": [90, 70, 30, 10, 0, 10, 15],
        "wind_speed_10m_max": [16.0, 15.0, 12.0, 10.0, 8.0, 10.0, 12.0],
    },
    "hourly": {
        "time": ["2026-11-04T00:00", "2026-11-04T06:00", "2026-11-04T12:00", "2026-11-04T18:00"],
        "temperature_2m": [22.0, 24.0, 27.5, 25.0],
        "relative_humidity_2m": [88, 85, 82, 86],
        "precipitation": [0.0, 5.0, 12.0, 1.0],
        "precipitation_probability": [30, 80, 90, 60],
        "wind_speed_10m": [8.0, 10.0, 14.0, 12.0],
    },
}


# ==============================================================================
# 1. RULES ENGINE TESTS
# ==============================================================================

def test_rules_engine_irrigation_hold_on_heavy_rain():
    """Verify that heavy rainfall forecast produces an irrigation pause and suppresses irrigation application."""
    risk_scores = {"rainfall": 75.0, "heat": 20.0, "cold": 5.0, "disease": 60.0, "wind": 15.0}
    current_weather = {"temperature_c": 26.0, "relative_humidity_pct": 80.0, "precipitation_mm": 10.0, "wind_speed_kmh": 12.0}
    daily_forecast = [
        {"precipitation_mm": 25.0, "precipitation_probability_pct": 85.0, "wind_speed_max_kmh": 14.0, "temp_max_c": 28.0}
    ]

    directives = AdvisoryRulesEngine.evaluate_directives(
        crop_name="Tomato",
        stage_name="Flowering",
        risk_scores=risk_scores,
        current_weather=current_weather,
        daily_forecast=daily_forecast,
        soil_type="Black Clay Soil (Vertisol)",
        soil_sensor_available=False,
    )

    assert len(directives) >= 1
    primary = directives[0]
    assert primary.category in [AdvisoryCategory.IRRIGATION, AdvisoryCategory.DRAINAGE_AND_SOIL]
    # Check irrigation hold exists
    irrigation_dirs = [d for d in directives if d.category == AdvisoryCategory.IRRIGATION]
    assert len(irrigation_dirs) == 1
    assert "pause" in irrigation_dirs[0].immediate_action.lower() or "hold" in irrigation_dirs[0].immediate_action.lower()
    # Check conflict resolution: no directive instructs to apply irrigation
    assert not any("apply light" in d.immediate_action.lower() for d in directives)


def test_rules_engine_heat_stress_cooling():
    """Verify heat stress with zero rain recommends early morning cooling irrigation."""
    risk_scores = {"rainfall": 5.0, "heat": 75.0, "cold": 5.0, "disease": 10.0, "wind": 10.0}
    current_weather = {"temperature_c": 36.5, "relative_humidity_pct": 35.0, "precipitation_mm": 0.0, "wind_speed_kmh": 8.0}
    daily_forecast = [
        {"precipitation_mm": 0.0, "precipitation_probability_pct": 5.0, "wind_speed_max_kmh": 10.0, "temp_max_c": 38.0}
    ]

    directives = AdvisoryRulesEngine.evaluate_directives(
        crop_name="Tomato",
        stage_name="Flowering",
        risk_scores=risk_scores,
        current_weather=current_weather,
        daily_forecast=daily_forecast,
        soil_type="Loam",
        soil_sensor_available=False,
    )

    irrigation_dirs = [d for d in directives if d.category == AdvisoryCategory.IRRIGATION]
    assert len(irrigation_dirs) >= 1
    assert "early morning" in irrigation_dirs[0].immediate_action.lower() or "cooling" in irrigation_dirs[0].why_it_matters.lower()


def test_rules_engine_foliar_spray_hold_on_high_wind():
    """High winds must postpone all foliar spray operations to prevent drift."""
    risk_scores = {"rainfall": 10.0, "heat": 25.0, "cold": 5.0, "disease": 40.0, "wind": 75.0}
    current_weather = {"temperature_c": 28.0, "relative_humidity_pct": 50.0, "precipitation_mm": 0.0, "wind_speed_kmh": 26.0}
    daily_forecast = [
        {"precipitation_mm": 0.0, "precipitation_probability_pct": 10.0, "wind_speed_max_kmh": 32.0, "temp_max_c": 30.0}
    ]

    directives = AdvisoryRulesEngine.evaluate_directives(
        crop_name="Cotton",
        stage_name="Boll Formation",
        risk_scores=risk_scores,
        current_weather=current_weather,
        daily_forecast=daily_forecast,
    )

    spray_dirs = [d for d in directives if d.category == AdvisoryCategory.PLANT_PROTECTION]
    assert len(spray_dirs) >= 1
    assert "postpone" in spray_dirs[0].immediate_action.lower() or "hold" in spray_dirs[0].immediate_action.lower()


def test_rules_engine_disease_spore_window_safety():
    """High humidity with calm conditions recommends bio-agents and includes KVK dosage disclaimer."""
    risk_scores = {"rainfall": 15.0, "heat": 20.0, "cold": 5.0, "disease": 80.0, "wind": 10.0}
    current_weather = {"temperature_c": 23.5, "relative_humidity_pct": 88.0, "precipitation_mm": 1.0, "wind_speed_kmh": 6.0}
    daily_forecast = [
        {"precipitation_mm": 1.0, "precipitation_probability_pct": 15.0, "wind_speed_max_kmh": 8.0, "temp_max_c": 26.0}
    ]

    directives = AdvisoryRulesEngine.evaluate_directives(
        crop_name="Tomato",
        stage_name="Fruiting",
        risk_scores=risk_scores,
        current_weather=current_weather,
        daily_forecast=daily_forecast,
    )

    spray_dirs = [d for d in directives if d.category == AdvisoryCategory.PLANT_PROTECTION]
    assert len(spray_dirs) >= 1
    # Safety: action steps must advise biological agent and KVK consultation
    all_steps = " ".join(spray_dirs[0].action_steps)
    assert "kvk" in all_steps.lower() or "krishi vigyan kendra" in all_steps.lower()
    assert "trichoderma" in all_steps.lower() or "neem" in all_steps.lower()


# ==============================================================================
# 2. MULTILINGUAL TEMPLATE & FALLBACK TESTS
# ==============================================================================

def test_multilingual_template_engine_all_5_languages():
    """Verify high-quality farmer-friendly outputs across Marathi, Hindi, Telugu, Kiswahili, and English."""
    directive = AgronomicDirective(
        category=AdvisoryCategory.IRRIGATION,
        urgency=ActionUrgency.WITHIN_24H,
        immediate_action="Pause and hold scheduled irrigation on Tomato.",
        why_it_matters="Heavy rain expected tomorrow. Soil root zone will be saturated.",
        recommended_timing="Next 24 to 48 hours",
        risk_if_ignored="Root rot and waterlogging.",
        projected_impact="Saves 4,000L water per acre.",
        action_steps=["Turn off drip pumps", "Clear drainage channels"],
        supporting_evidence=["24h rain: 25mm"],
        data_limitations="In-situ soil probe unavailable",
        confidence_pct=94.0,
    )

    # 1. Marathi (mr)
    mr_out = MultilingualTemplateEngine.translate_directive(directive, "mr", "टोमॅटो", "फुलोरा")
    assert "सिंचन" in mr_out.immediate_action
    assert "पावसाची" in mr_out.why_it_matters
    assert "केन्द्र" in mr_out.disclaimer or "KVK" in mr_out.disclaimer or "कृषी" in mr_out.disclaimer
    assert "मातीतील ओलावा" in mr_out.data_limitations

    # 2. Hindi (hi)
    hi_out = MultilingualTemplateEngine.translate_directive(directive, "hi", "टमाटर", "फूल आने की अवस्था")
    assert "सिंचाई" in hi_out.immediate_action
    assert "वर्षा" in hi_out.why_it_matters or "बारिश" in hi_out.why_it_matters
    assert "KVK" in hi_out.disclaimer or "कृषि विज्ञान केंद्र" in hi_out.disclaimer

    # 3. Telugu (te)
    te_out = MultilingualTemplateEngine.translate_directive(directive, "te", "టమోటా", "పూత దశ")
    assert "నీటిపారుదల" in te_out.immediate_action
    assert "KVK" in te_out.disclaimer or "కృషి విజ్ఞాన కేంద్రం" in te_out.disclaimer

    # 4. Kiswahili (sw)
    sw_out = MultilingualTemplateEngine.translate_directive(directive, "sw", "Nyanya", "Utoaji Maua")
    assert "umwagiliaji" in sw_out.immediate_action
    assert "Mvua" in sw_out.why_it_matters

    # 5. English (en)
    en_out = MultilingualTemplateEngine.translate_directive(directive, "en", "Tomato", "Flowering")
    assert "irrigation" in en_out.immediate_action.lower()
    assert en_out.language == "en"


@pytest.mark.asyncio
async def test_gemini_service_fallback_on_unconfigured_api_key():
    """When GEMINI_API_KEY is placeholder or empty, Gemini service cleanly falls back to template without error."""
    directive = AgronomicDirective(
        category=AdvisoryCategory.IRRIGATION,
        urgency=ActionUrgency.WITHIN_24H,
        immediate_action="Pause irrigation.",
        why_it_matters="Rain is coming.",
        recommended_timing="Next 24h",
        risk_if_ignored="Root hypoxia",
        action_steps=["Turn off pumps"],
        supporting_evidence=["Rain 20mm"],
        confidence_pct=92.0,
    )

    with patch.object(settings, "GEMINI_API_KEY", ""):
        result = await GeminiAdvisoryService.generate_advisory_explanation(
            primary_directive=directive,
            secondary_directives=[],
            target_lang="mr",
            crop_name="टोमॅटो",
            stage_name="फुलोरा",
        )
        assert result is not None
        assert result.language == "mr"
        assert "सिंचन" in result.immediate_action
        assert "rule_engine_deterministic_fallback" in result.model_version


# ==============================================================================
# 3. API INTEGRATION TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_api_generate_and_get_latest_advisory(client: AsyncClient, db_session: AsyncSession):
    """Test POST /advisories/generate and GET /advisories/farms/{farm_id}/latest end-to-end."""
    await seed_crop_database(db_session)

    # Register Farmer in Marathi (mr)
    user_id = str(uuid.uuid4())
    farmer_data, token = await register_test_farmer(client, user_id, phone="+919876543111", lang="mr")
    farm_id = farmer_data["farms"][0]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO_RAINY, 19.01, 73.94)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        # 1. Generate Advisory in Marathi
        res_gen = await client.post(
            "/api/v1/advisories/generate",
            json={"farm_id": farm_id, "language": "mr"},
            headers=headers,
        )
        assert res_gen.status_code == 201
        advisory = res_gen.json()
        assert advisory["farm_id"] == farm_id
        assert advisory["language"] == "mr"
        assert len(advisory["immediate_action"]) > 5
        assert len(advisory["why_it_matters"]) > 5
        assert len(advisory["recommended_timing"]) > 3
        assert len(advisory["risk_if_ignored"]) > 5
        assert len(advisory["action_steps"]) >= 1
        assert advisory["disclaimer"] is not None
        assert advisory["confidence_pct"] >= 80.0

        # 2. Retrieve Latest Advisory for Farm
        res_latest = await client.get(
            f"/api/v1/advisories/farms/{farm_id}/latest?language=mr",
            headers=headers,
        )
        assert res_latest.status_code == 200
        latest = res_latest.json()
        assert latest["id"] == advisory["id"]
        assert latest["language"] == "mr"
        assert latest["farm_id"] == farm_id

        # 3. Switch Language on-the-fly to English
        res_en = await client.get(
            f"/api/v1/advisories/farms/{farm_id}/latest?language=en",
            headers=headers,
        )
        assert res_en.status_code == 200
        advisory_en = res_en.json()
        assert advisory_en["language"] == "en"
        assert "irrigation" in advisory_en["immediate_action"].lower()

