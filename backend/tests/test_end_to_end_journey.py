import time
import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.seed_crops import seed_crop_database
from app.services.communication.delivery_dispatcher import DeliveryDispatcher
from app.services.advisory.advisory_types import AdvisoryCategory, ActionUrgency, AgronomicDirective
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


@pytest.mark.asyncio
async def test_complete_12_step_farmer_journey(client: AsyncClient, db_session: AsyncSession):
    """
    End-to-End Integration Test executing the complete 12-Step Farmer Journey:
    1. Farmer registers using phone OTP / JWT token
    2. Farmer completes profile (Name, Village, District, Marathi language)
    3. Farmer registers farm with GPS coordinates (Baramati: 18.1500, 74.5800)
    4. Farmer selects crop (Tomato) and growth stage (Vegetative Growth)
    5. System fetches climate data (Open-Meteo & NASA POWER)
    6. System calculates 7-factor crop climate risk
    7. AI & agronomic rules engine generates advisory
    8. Advisory is generated in farmer's preferred language (Marathi 'mr')
    9. Advisory dispatched through multichannel delivery (SMS, Voice IVR, WhatsApp)
    10. Delivery status recorded in DB
    11. Farmer views advisory history and submits feedback (APPLIED)
    12. Administrator audits the entire lifecycle in Admin Dashboard
    """
    # Seed crops catalog (Tomato, Rice, Wheat, Cotton, Maize, Sugarcane)
    await seed_crop_database(db_session)

    # ---------------------------------------------------------
    # STEP 1, 2, 3: Farmer Registration + GPS Farm Location in Baramati
    # ---------------------------------------------------------
    user_id = str(uuid.uuid4())
    farmer_phone = f"+9198{uuid.uuid4().int % 100000000:08d}"
    token = create_test_token(user_id, phone=farmer_phone)
    headers = {"Authorization": f"Bearer {token}"}

    reg_payload = {
        "full_name": "Tukaram Vitthal Shinde",
        "phone_number": farmer_phone,
        "preferred_language": "mr",
        "village": "Baramati",
        "district": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Baramati South Plot",
        "latitude": 18.1500,
        "longitude": 74.5800,
        "farm_acreage": 4.5,
        "soil_type": "Black Clay Soil (Vertisol)",
        "irrigation_source": "Drip Irrigation",
    }
    reg_resp = await client.post("/api/v1/auth/register-farmer", json=reg_payload, headers=headers)
    assert reg_resp.status_code == 201, reg_resp.text
    farmer_data = reg_resp.json()
    farmer_id = farmer_data["id"]
    farm_id = farmer_data["farms"][0]["id"]

    assert farmer_data["preferred_language"] == "mr"
    assert farmer_data["village"] == "Baramati"
    assert farmer_data["farms"][0]["latitude"] == 18.1500

    # ---------------------------------------------------------
    # STEP 4: Crop Selection & Growth-Stage Assignment
    # ---------------------------------------------------------
    crops_catalog_resp = await client.get("/api/v1/crops/")
    assert crops_catalog_resp.status_code == 200
    crops = crops_catalog_resp.json()
    tomato = next(c for c in crops if c["name"] == "Tomato")
    veg_stage = next(s for s in tomato["growth_stages"] if s["stage_name"] == "Vegetative Growth")

    add_crop_resp = await client.post(
        f"/api/v1/farms/{farm_id}/crops",
        json={
            "crop_id": tomato["id"],
            "variety": "Abhinav F1",
            "cultivated_acreage": 2.5,
            "sowing_date": (date.today() - timedelta(days=35)).isoformat(),
            "current_stage_id": veg_stage["id"],
            "status": "active",
            "notes": "Baramati drip fed tomato",
        },
        headers=headers,
    )
    assert add_crop_resp.status_code == 201, add_crop_resp.text
    farm_crop = add_crop_resp.json()
    assert farm_crop["current_stage_name"] == "Vegetative Growth"
    assert farm_crop["cultivated_acreage"] == 2.5

    # ---------------------------------------------------------
    # STEP 5: Fetch Climate Observations & Forecast
    # ---------------------------------------------------------
    climate_resp = await client.get(
        f"/api/v1/farms/{farm_id}/climate/current",
        headers=headers,
    )
    assert climate_resp.status_code == 200, climate_resp.text
    climate_data = climate_resp.json()
    assert "current" in climate_data
    assert "temperature_c" in climate_data["current"]
    assert "relative_humidity_pct" in climate_data["current"]
    assert "soil_sensor" in climate_data
    assert climate_data["data_source"] is not None

    forecast_resp = await client.get(
        f"/api/v1/farms/{farm_id}/climate/forecast",
        headers=headers,
    )
    assert forecast_resp.status_code == 200, forecast_resp.text
    forecast_data = forecast_resp.json()
    assert "daily_forecast" in forecast_data
    assert len(forecast_data["daily_forecast"]) >= 1

    # ---------------------------------------------------------
    # STEP 6: Crop-Specific Climate Risk Assessment (7 Factors)
    # ---------------------------------------------------------
    risk_resp = await client.get(
        f"/api/v1/farms/{farm_id}/risk/latest",
        headers=headers,
    )
    assert risk_resp.status_code == 200, risk_resp.text
    risk_data = risk_resp.json()
    assert "overall_risk_score" in risk_data
    assert "overall_risk_level" in risk_data
    assert risk_data["overall_risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "category_scores" in risk_data
    assert len(risk_data["daily_timeline"]) >= 1

    # ---------------------------------------------------------
    # STEP 7 & 8: AI Agricultural Advisory Generation in Marathi ('mr')
    # ---------------------------------------------------------
    gen_adv_resp = await client.post(
        "/api/v1/advisories/generate",
        json={"farm_id": farm_id, "language": "mr"},
        headers=headers,
    )
    assert gen_adv_resp.status_code == 201, gen_adv_resp.text
    advisory = gen_adv_resp.json()
    advisory_id = advisory["id"]

    assert advisory["language"] == "mr"
    assert len(advisory["immediate_action"]) > 0
    assert len(advisory["why_it_matters"]) > 0
    assert len(advisory["recommended_timing"]) > 0
    assert len(advisory["risk_if_ignored"]) > 0
    assert advisory["confidence_pct"] >= 70.0

    # ---------------------------------------------------------
    # STEP 9 & 10: Multichannel Delivery Dispatch & Database Logging
    # ---------------------------------------------------------
    dispatch_resp = await client.post(
        "/api/v1/deliveries/dispatch",
        json={
            "advisory_id": advisory_id,
            "channels": ["SMS"],
            "simulate": True,
        },
        headers=headers,
    )
    assert dispatch_resp.status_code == 201, dispatch_resp.text
    dispatch_data = dispatch_resp.json()
    assert len(dispatch_data["channel_outcomes"]) >= 1
    assert dispatch_data["channel_outcomes"][0]["status"] in ["SENT", "SIMULATED", "QUEUED", "DELIVERED"]

    # Verify delivery logs through API
    delivery_history_resp = await client.get(
        "/api/v1/deliveries/history",
        headers=headers,
    )
    assert delivery_history_resp.status_code == 200
    delivery_logs = delivery_history_resp.json()
    assert len(delivery_logs) >= 1
    assert delivery_logs[0]["advisory_id"] == advisory_id

    # ---------------------------------------------------------
    # STEP 11: Farmer Views History & Submits Verified Feedback
    # ---------------------------------------------------------
    history_resp = await client.get(
        f"/api/v1/advisories/?farm_id={farm_id}",
        headers=headers,
    )
    assert history_resp.status_code == 200
    farmer_history = history_resp.json()
    assert len(farmer_history) >= 1

    feedback_payload = {
        "action_taken": "APPLIED",
        "rating": 5,
        "reported_water_savings_liters": 4200.0,
        "reported_losses_avoided_inr": 750.0,
        "feedback_text": "Implemented spray pause; saved flowers from wash-off.",
    }
    feedback_resp = await client.post(
        f"/api/v1/admin/advisories/{advisory_id}/feedback",
        json=feedback_payload,
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert feedback_resp.status_code == 200, feedback_resp.text
    feedback_data = feedback_resp.json()
    assert feedback_data["action_status"] == "APPLIED"

    # ---------------------------------------------------------
    # STEP 12: Admin Dashboard Real-Time Audit & Metric Verification
    # ---------------------------------------------------------
    admin_overview_resp = await client.get(
        "/api/v1/admin/overview",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert admin_overview_resp.status_code == 200
    admin_data = admin_overview_resp.json()
    assert admin_data["total_farmers"] >= 1
    assert admin_data["active_farms"] >= 1
    assert admin_data["active_crop_cycles"] >= 1
    assert admin_data["advisories_generated_count"] >= 1

    # Verify impact measurements
    impact_resp = await client.get(
        "/api/v1/admin/impact",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert impact_resp.status_code == 200
    impact_data = impact_resp.json()
    assert "farmer_reported" in impact_data
    assert impact_data["farmer_reported"]["total_reported_water_saved_liters"] >= 4200.0


@pytest.mark.asyncio
async def test_security_cross_farmer_isolation(client: AsyncClient, db_session: AsyncSession):
    """
    Security Verification:
    Ensures Farmer B cannot read or modify Farmer A's farm plots or crops.
    """
    await seed_crop_database(db_session)

    user_a = str(uuid.uuid4())
    user_b = str(uuid.uuid4())

    token_a = create_test_token(user_a, phone="+919876500001")
    token_b = create_test_token(user_b, phone="+919876500002")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Register Farmer A
    reg_a = await client.post(
        "/api/v1/auth/register-farmer",
        json={
            "full_name": "Farmer A",
            "phone_number": "+919876500001",
            "preferred_language": "mr",
            "village": "Pune",
            "district": "Pune",
            "state": "Maharashtra",
            "farm_name": "Farmer A Plot",
            "latitude": 18.52,
            "longitude": 73.85,
            "farm_acreage": 3.0,
        },
        headers=headers_a,
    )
    assert reg_a.status_code == 201
    farm_a_id = reg_a.json()["farms"][0]["id"]

    # Register Farmer B
    reg_b = await client.post(
        "/api/v1/auth/register-farmer",
        json={
            "full_name": "Farmer B",
            "phone_number": "+919876500002",
            "preferred_language": "hi",
            "village": "Nagpur",
            "district": "Nagpur",
            "state": "Maharashtra",
            "farm_name": "Farmer B Plot",
            "latitude": 21.14,
            "longitude": 79.08,
            "farm_acreage": 2.0,
        },
        headers=headers_b,
    )
    assert reg_b.status_code == 201

    # Farmer B attempts to get climate of Farm A -> Forbidden / 404
    res_b = await client.get(
        f"/api/v1/farms/{farm_a_id}/climate/current",
        headers=headers_b,
    )
    assert res_b.status_code in [403, 404]

    # Farmer B attempts to get risk of Farm A -> Forbidden / 404
    res_risk_b = await client.get(
        f"/api/v1/farms/{farm_a_id}/risk/latest",
        headers=headers_b,
    )
    assert res_risk_b.status_code in [403, 404]


@pytest.mark.asyncio
async def test_security_role_based_admin_protection(client: AsyncClient):
    """
    Security Verification:
    Ensures unauthenticated or non-admin requests to /admin/ routes are rejected with HTTP 403 Forbidden.
    """
    resp = await client.get("/api/v1/admin/overview")
    assert resp.status_code == 403

    resp_fake_role = await client.get(
        "/api/v1/admin/overview",
        headers={"X-Admin-Role": "FARMER"},
    )
    assert resp_fake_role.status_code == 403


@pytest.mark.asyncio
async def test_reliability_llm_failure_graceful_fallback():
    """
    Reliability Verification:
    When Gemini API key is missing or unconfigured, the system falls back
    to deterministic agricultural rules without throwing an unhandled exception.
    """
    directive = AgronomicDirective(
        category=AdvisoryCategory.IRRIGATION,
        urgency=ActionUrgency.WITHIN_24H,
        immediate_action="Hold irrigation for 24 hours.",
        why_it_matters="Upcoming rainfall will replenish root zone.",
        recommended_timing="Next 24 to 48 hours",
        risk_if_ignored="Root waterlogging and nutrient leaching",
        action_steps=["Switch off drip system"],
        supporting_evidence=["Precipitation forecast 28mm"],
        confidence_pct=90.0,
    )

    with patch.object(settings, "GEMINI_API_KEY", ""):
        result = await GeminiAdvisoryService.generate_advisory_explanation(
            primary_directive=directive,
            secondary_directives=[],
            target_lang="mr",
            crop_name="Tomato",
            stage_name="Flowering",
        )
        assert result is not None
        assert result.language == "mr"
        assert result.immediate_action != ""
        assert result.why_it_matters != ""
        assert "rule_engine_deterministic_fallback" in result.model_version
