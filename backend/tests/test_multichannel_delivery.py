import time
import uuid
from unittest.mock import AsyncMock, patch
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.seed_crops import seed_crop_database
from app.services.communication.sms_provider import MSG91SmsProvider
from app.services.communication.voice_provider import ExotelVoiceProvider
from app.services.communication.whatsapp_provider import MetaWhatsAppProvider
from app.services.communication.delivery_dispatcher import DeliveryDispatcher
from app.services.advisory.advisory_generation_service import AdvisoryGenerationService
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
        "full_name": "Tukaram Jadhav",
        "phone_number": phone,
        "preferred_language": lang,
        "village": "Shirur",
        "district": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Jadhav Farm Plot 2",
        "latitude": 18.8200,
        "longitude": 74.3700,
        "farm_acreage": 5.0,
        "soil_type": "Black Clay Soil (Vertisol)",
        "irrigation_source": "Drip Irrigation",
    }
    res = await client.post("/api/v1/auth/register-farmer", json=payload, headers=headers)
    assert res.status_code == 201
    return res.json(), token


# Mock Open-Meteo for advisory setup
MOCK_METEO = {
    "latitude": 18.82,
    "longitude": 74.37,
    "elevation": 560.0,
    "timezone": "Asia/Kolkata",
    "current": {
        "time": "2026-11-04T12:00",
        "temperature_2m": 31.0,
        "apparent_temperature": 33.0,
        "relative_humidity_2m": 72,
        "precipitation": 5.0,
        "rain": 5.0,
        "weather_code": 61,
        "wind_speed_10m": 12.0,
        "wind_direction_10m": 200,
    },
    "daily": {
        "time": ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"],
        "weather_code": [61, 3, 2, 0, 0, 1, 2],
        "temperature_2m_max": [32.0, 31.0, 30.0, 29.0, 30.0, 31.0, 32.0],
        "temperature_2m_min": [21.0, 20.0, 19.0, 18.0, 19.0, 20.0, 20.0],
        "precipitation_sum": [12.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "precipitation_probability_max": [80, 30, 10, 0, 0, 5, 10],
        "wind_speed_10m_max": [16.0, 12.0, 10.0, 10.0, 8.0, 10.0, 12.0],
    },
    "hourly": {
        "time": ["2026-11-04T00:00", "2026-11-04T06:00", "2026-11-04T12:00", "2026-11-04T18:00"],
        "temperature_2m": [22.0, 25.0, 31.0, 28.0],
        "relative_humidity_2m": [85, 75, 72, 78],
        "precipitation": [0.0, 2.0, 5.0, 1.0],
        "precipitation_probability": [20, 50, 80, 40],
        "wind_speed_10m": [10.0, 10.0, 12.0, 10.0],
    },
}


# ==============================================================================
# 1. PROVIDER UNIT TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_msg91_sms_provider_formatting_and_simulation():
    """Verify phone formatting, simulation output, and DLR processing."""
    provider = MSG91SmsProvider()
    assert provider.format_phone_number("9876543210") == "919876543210"
    assert provider.format_phone_number("+91 98765 43210") == "919876543210"

    # Simulation mode
    res = await provider.send(
        recipient_phone="9876543210",
        message_text="पुढील २४ तास सिंचन पुढे ढकला.",
        language="mr",
        simulate=True,
    )
    assert res.success is True
    assert res.status == "SIMULATED"
    assert res.is_simulation is True
    assert "sim_sms_" in res.carrier_message_id

    # Webhook parsing
    dlr = await provider.process_webhook({"requestId": "msg_999", "status": "DELIVERED"})
    assert dlr["status"] == "DELIVERED"
    assert dlr["carrier_message_id"] == "msg_999"


@pytest.mark.asyncio
async def test_exotel_voice_provider_tts_and_simulation():
    """Verify regional TTS voice scripts, keypad DTMF menu, and webhook parsing."""
    provider = ExotelVoiceProvider()
    
    # Test multilingual script generation with DTMF options
    mr_script = provider.build_voice_script("सिंचन थांबवा", "mr", "टोमॅटो")
    assert "१ दाबा" in mr_script
    assert "३ दाबा" in mr_script

    hi_script = provider.build_voice_script("सिंचाई रोकें", "hi", "टमाटर")
    assert "१ दबाएं" in hi_script
    assert "३ दबाएं" in hi_script

    # Simulation call
    res = await provider.send(
        recipient_phone="+919876543210",
        message_text="पुढील २४ तास सिंचन थांबवा",
        language="mr",
        simulate=True,
    )
    assert res.success is True
    assert res.status == "SIMULATED"
    assert res.duration_seconds == 48

    # Webhook callback parsing
    call_log = await provider.process_webhook({"CallSid": "call_123", "DialCallStatus": "completed", "CallDuration": "52"})
    assert call_log["status"] == "ANSWERED"
    assert call_log["duration_seconds"] == 52


@pytest.mark.asyncio
async def test_meta_whatsapp_provider_and_optout_webhook():
    """Verify WhatsApp cloud sending and inbound opt-out message detection."""
    provider = MetaWhatsAppProvider()
    
    # Simulation
    res = await provider.send(
        recipient_phone="+919876543210",
        message_text="इंद्रधनु कृषी हवामान सल्ला: सिंचन थांबवा.",
        language="mr",
        simulate=True,
    )
    assert res.success is True
    assert res.status == "SIMULATED"
    assert "wamid.sim." in res.carrier_message_id

    # Webhook: status update
    status_wh = {
        "entry": [{
            "changes": [{
                "value": {
                    "statuses": [{"id": "wam_001", "status": "delivered", "timestamp": "1730000000"}]
                }
            }]
        }]
    }
    parsed_status = await provider.process_webhook(status_wh)
    assert parsed_status["status"] == "DELIVERED"
    assert parsed_status["carrier_message_id"] == "wam_001"

    # Webhook: inbound "STOP" opt-out message
    inbound_wh = {
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{"from": "919876543210", "text": {"body": "STOP"}}]
                }
            }]
        }]
    }
    parsed_inbound = await provider.process_webhook(inbound_wh)
    assert parsed_inbound["is_opt_out"] is True
    assert parsed_inbound["sender_phone"] == "919876543210"


# ==============================================================================
# 2. DISPATCHER & GOVERNANCE TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_dispatcher_opt_out_enforcement(client: AsyncClient, db_session: AsyncSession):
    """Dispatcher must block delivery when farmer has opted out (DND active)."""
    await seed_crop_database(db_session)
    user_id = str(uuid.uuid4())
    farmer_data, token = await register_test_farmer(client, user_id, phone="+919876543001")
    farm_id = uuid.UUID(farmer_data["farms"][0]["id"])
    farmer_id = uuid.UUID(farmer_data["id"])

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=farmer_id, farm_id=farm_id, language="mr"
        )

        dispatcher = DeliveryDispatcher()

        # Step 1: Farmer opts out
        opt_res = await dispatcher.handle_opt_out(db_session, "+919876543001", reason="DO_NOT_DISTURB")
        assert opt_res["status"] == "success"

        # Step 2: Attempt dispatch to opted-out farmer
        dispatch_res = await dispatcher.dispatch_advisory(
            db=db_session,
            advisory_id=advisory.id,
            channels=["SMS"],
            simulate=True,
        )
        assert "opted out" in dispatch_res.summary.lower()
        assert dispatch_res.channel_outcomes[0].status == "FAILED"
        assert "opted out" in dispatch_res.channel_outcomes[0].error_message.lower()


@pytest.mark.asyncio
async def test_dispatcher_idempotency_guard(client: AsyncClient, db_session: AsyncSession):
    """Dispatcher must prevent duplicate sends for the same advisory on the same channel."""
    await seed_crop_database(db_session)
    user_id = str(uuid.uuid4())
    farmer_data, token = await register_test_farmer(client, user_id, phone="+919876543002")
    farm_id = uuid.UUID(farmer_data["farms"][0]["id"])
    farmer_id = uuid.UUID(farmer_data["id"])

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=farmer_id, farm_id=farm_id, language="mr"
        )

        dispatcher = DeliveryDispatcher()

        # First dispatch
        res1 = await dispatcher.dispatch_advisory(
            db=db_session,
            advisory_id=advisory.id,
            channels=["SMS"],
            simulate=False,  # Live / normal evaluation
        )
        assert len(res1.channel_outcomes) == 1
        first_id = res1.channel_outcomes[0].id

        # Second immediate dispatch with same advisory & channel
        res2 = await dispatcher.dispatch_advisory(
            db=db_session,
            advisory_id=advisory.id,
            channels=["SMS"],
            simulate=False,
        )
        # Returns existing log without creating duplicate carrier dispatch
        assert res2.channel_outcomes[0].id == first_id


# ==============================================================================
# 3. API ENDPOINTS TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_api_delivery_dispatch_and_history(client: AsyncClient, db_session: AsyncSession):
    """Test POST /api/v1/deliveries/dispatch and GET /api/v1/deliveries/history."""
    await seed_crop_database(db_session)
    user_id = str(uuid.uuid4())
    farmer_data, token = await register_test_farmer(client, user_id, phone="+919876543003", lang="mr")
    farm_id = uuid.UUID(farmer_data["farms"][0]["id"])
    farmer_id = uuid.UUID(farmer_data["id"])
    headers = {"Authorization": f"Bearer {token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=farmer_id, farm_id=farm_id, language="mr"
        )

        # 1. Dispatch across all 3 channels in simulation mode
        dispatch_payload = {
            "advisory_id": str(advisory.id),
            "channels": ["SMS", "VOICE_IVR", "WHATSAPP"],
            "simulate": True,
        }
        res = await client.post("/api/v1/deliveries/dispatch", json=dispatch_payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["mode"] == "SIMULATION"
        assert len(data["channel_outcomes"]) == 3
        statuses = [o["status"] for o in data["channel_outcomes"]]
        assert all(s == "SIMULATED" for s in statuses)

        # 2. Query delivery history
        res_hist = await client.get("/api/v1/deliveries/history", headers=headers)
        assert res_hist.status_code == 200
        history = res_hist.json()
        assert len(history) >= 3

        # 3. Verify WhatsApp webhook verification endpoint (GET challenge)
        res_wh_ver = await client.get(
            f"/api/v1/deliveries/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test_challenge_123&hub.verify_token={settings.META_WHATSAPP_VERIFY_TOKEN}"
        )
        assert res_wh_ver.status_code == 200
        assert res_wh_ver.text == "test_challenge_123"

        # 4. Update channel preference
        res_pref = await client.put(
            "/api/v1/deliveries/preferences",
            json={"preferred_channel": "VOICE_IVR", "is_opted_in": True},
            headers=headers,
        )
        assert res_pref.status_code == 200
        assert res_pref.json()["preferred_channel"] == "VOICE_IVR"


@pytest.mark.asyncio
async def test_dispatch_ownership_check_prevents_cross_farmer_dispatch(
    client: AsyncClient, db_session: AsyncSession
):
    """Dispatch endpoint must reject attempts to dispatch an advisory belonging to another farmer."""
    await seed_crop_database(db_session)
    
    # Register Farmer 1 (Owner)
    f1_data, f1_token = await register_test_farmer(
        client, str(uuid.uuid4()), phone="+919811110001", lang="hi"
    )
    f1_id = uuid.UUID(f1_data["id"])
    f1_farm_id = uuid.UUID(f1_data["farms"][0]["id"])

    # Register Farmer 2 (Attacker)
    f2_data, f2_token = await register_test_farmer(
        client, str(uuid.uuid4()), phone="+919822220002", lang="te"
    )

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        # Farmer 1 generates advisory
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=f1_id, farm_id=f1_farm_id, language="hi"
        )

        # Farmer 2 tries to dispatch Farmer 1's advisory
        h2 = {"Authorization": f"Bearer {f2_token}"}
        res = await client.post(
            "/api/v1/deliveries/dispatch",
            json={"advisory_id": str(advisory.id), "channels": ["SMS"], "simulate": True},
            headers=h2,
        )
        assert res.status_code == 403
        assert "access denied" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_dispatch_rejects_missing_or_invalid_phone_number(
    client: AsyncClient, db_session: AsyncSession
):
    """Dispatch must return 422 if the target phone number is missing or invalid."""
    await seed_crop_database(db_session)
    farmer_data, token = await register_test_farmer(
        client, str(uuid.uuid4()), phone="+919833330003", lang="en"
    )
    farmer_id = uuid.UUID(farmer_data["id"])
    farm_id = uuid.UUID(farmer_data["farms"][0]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=farmer_id, farm_id=farm_id, language="en"
        )

        # Attempt dispatch with invalid phone (<10 digits)
        res = await client.post(
            "/api/v1/deliveries/dispatch",
            json={
                "advisory_id": str(advisory.id),
                "channels": ["SMS"],
                "simulate": True,
                "custom_phone": "12345",
            },
            headers=headers,
        )
        assert res.status_code == 422
        assert "invalid" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_dispatch_prevents_cross_farmer_phone_spoofing(
    client: AsyncClient, db_session: AsyncSession
):
    """Farmer cannot override dispatch phone to target another registered farmer's phone number."""
    await seed_crop_database(db_session)
    
    # Farmer 1 with phone A
    f1_data, f1_token = await register_test_farmer(
        client, str(uuid.uuid4()), phone="+919844440001", lang="mr"
    )
    # Farmer 2 with phone B
    f2_data, f2_token = await register_test_farmer(
        client, str(uuid.uuid4()), phone="+919844440002", lang="hi"
    )
    f1_id = uuid.UUID(f1_data["id"])
    f1_farm_id = uuid.UUID(f1_data["farms"][0]["id"])
    headers1 = {"Authorization": f"Bearer {f1_token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=f1_id, farm_id=f1_farm_id, language="mr"
        )

        # Farmer 1 attempts to pass Farmer 2's registered phone as custom_phone
        res = await client.post(
            "/api/v1/deliveries/dispatch",
            json={
                "advisory_id": str(advisory.id),
                "channels": ["SMS"],
                "simulate": True,
                "custom_phone": "+919844440002",
            },
            headers=headers1,
        )
        assert res.status_code == 403
        assert "security violation" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_dispatch_uses_authenticated_farmer_phone_and_language(
    client: AsyncClient, db_session: AsyncSession
):
    """Verify that dispatch dynamically populates recipient phone and language from authenticated profile."""
    await seed_crop_database(db_session)
    
    unique_phone = "+919855550005"
    f_data, token = await register_test_farmer(
        client, str(uuid.uuid4()), phone=unique_phone, lang="te"
    )
    f_id = uuid.UUID(f_data["id"])
    farm_id = uuid.UUID(f_data["farms"][0]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=f_id, farm_id=farm_id, language="te"
        )

        # Dispatch across SMS, Voice, WhatsApp without custom_phone override
        res = await client.post(
            "/api/v1/deliveries/dispatch",
            json={
                "advisory_id": str(advisory.id),
                "channels": ["SMS", "VOICE_IVR", "WHATSAPP"],
                "simulate": True,
            },
            headers=headers,
        )
        assert res.status_code == 201
        data = res.json()
        assert data["farmer_id"] == str(f_id)
        
        # Verify all 3 channels dispatched strictly to the authenticated farmer's verified phone
        for outcome in data["channel_outcomes"]:
            assert outcome["recipient_phone"] == unique_phone
            assert outcome["language"] == "te"


@pytest.mark.asyncio
async def test_voice_ivr_sandbox_simulation_latency_and_isolation(
    client: AsyncClient, db_session: AsyncSession
):
    """Voice Call (IVR) sandbox simulation must return promptly (< 1s) and remain isolated from live carriers."""
    await seed_crop_database(db_session)
    user_id = str(uuid.uuid4())
    farmer_data, token = await register_test_farmer(
        client, user_id, phone="+919866660006", lang="mr"
    )
    farm_id = uuid.UUID(farmer_data["farms"][0]["id"])
    farmer_id = uuid.UUID(farmer_data["id"])
    headers = {"Authorization": f"Bearer {token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=farmer_id, farm_id=farm_id, language="mr"
        )

        start_time = time.perf_counter()
        res = await client.post(
            "/api/v1/deliveries/dispatch",
            json={
                "advisory_id": str(advisory.id),
                "channels": ["VOICE_IVR"],
                "simulate": True,
            },
            headers=headers,
        )
        duration_ms = (time.perf_counter() - start_time) * 1000

        assert res.status_code == 201
        data = res.json()
        assert data["mode"] == "SIMULATION"
        assert len(data["channel_outcomes"]) == 1

        voice_outcome = data["channel_outcomes"][0]
        assert voice_outcome["channel"] == "VOICE_IVR"
        assert voice_outcome["status"] == "SIMULATED"
        assert voice_outcome["is_simulation"] is True
        assert voice_outcome["provider"] == "EXOTEL_SIMULATOR"
        assert voice_outcome["duration_seconds"] == 48

        # Sandbox dispatch must complete promptly in well under 1.5 seconds (measured in ms)
        assert duration_ms < 1500, f"Voice IVR sandbox dispatch was too slow: {duration_ms:.2f}ms"


@pytest.mark.asyncio
async def test_all_channels_parallel_sandbox_simulation_latency(
    client: AsyncClient, db_session: AsyncSession
):
    """All 3 channels (SMS, Voice IVR, WhatsApp) must execute concurrently via asyncio.gather within < 1.5s."""
    await seed_crop_database(db_session)
    user_id = str(uuid.uuid4())
    farmer_data, token = await register_test_farmer(
        client, user_id, phone="+919877770007", lang="hi"
    )
    farm_id = uuid.UUID(farmer_data["farms"][0]["id"])
    farmer_id = uuid.UUID(farmer_data["id"])
    headers = {"Authorization": f"Bearer {token}"}

    norm_meteo = OpenMeteoService._normalize_payload(MOCK_METEO, 18.82, 74.37)
    with patch.object(OpenMeteoService, "fetch_weather", AsyncMock(return_value=norm_meteo)):
        advisory = await AdvisoryGenerationService.generate_advisory(
            db=db_session, farmer_id=farmer_id, farm_id=farm_id, language="hi"
        )

        start_time = time.perf_counter()
        res = await client.post(
            "/api/v1/deliveries/dispatch",
            json={
                "advisory_id": str(advisory.id),
                "channels": ["ALL"],
                "simulate": True,
            },
            headers=headers,
        )
        duration_ms = (time.perf_counter() - start_time) * 1000

        assert res.status_code == 201
        data = res.json()
        assert data["mode"] == "SIMULATION"
        assert len(data["channel_outcomes"]) == 3

        channels_dispatched = [o["channel"] for o in data["channel_outcomes"]]
        assert "SMS" in channels_dispatched
        assert "VOICE_IVR" in channels_dispatched
        assert "WHATSAPP" in channels_dispatched

        for outcome in data["channel_outcomes"]:
            assert outcome["status"] == "SIMULATED"
            assert outcome["is_simulation"] is True

        # Parallel dispatch across all 3 channels should complete in under 1.5 seconds
        assert duration_ms < 1500, f"Parallel sandbox dispatch took too long: {duration_ms:.2f}ms"


