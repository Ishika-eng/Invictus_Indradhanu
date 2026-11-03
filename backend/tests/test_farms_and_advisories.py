import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_farm_and_advisory_lifecycle(client: AsyncClient):
    # 1. Create Farmer
    farmer_res = await client.post(
        "/api/v1/farmers/",
        json={
            "full_name": "Sita Bai",
            "phone_number": "+919811122233",
            "preferred_language": "hi",
            "village": "Shirur",
            "district": "Pune",
            "state": "Maharashtra",
            "country": "India",
        },
    )
    assert farmer_res.status_code == 201
    farmer_id = farmer_res.json()["id"]

    # 2. Create Crop
    crop_res = await client.post(
        "/api/v1/crops/",
        json={
            "name": "Tomato",
            "scientific_name": "Solanum lycopersicum",
            "category": "Horticulture",
            "water_demand": "Moderate",
            "ideal_soil": "Loamy / Well-drained",
        },
    )
    assert crop_res.status_code == 201
    crop_id = crop_res.json()["id"]

    # 3. Create Farm
    farm_res = await client.post(
        "/api/v1/farms/",
        json={
            "farmer_id": farmer_id,
            "name": "East Tomato Acre",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "acreage": 3.2,
            "soil_type": "Black Cotton Soil",
            "irrigation_source": "Drip Irrigation",
            "active_crop_id": crop_id,
        },
    )
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]
    assert farm_res.json()["latitude"] == 18.5204

    # 4. Create Advisory
    advisory_res = await client.post(
        "/api/v1/advisories/",
        json={
            "farmer_id": farmer_id,
            "farm_id": farm_id,
            "crop_id": crop_id,
            "immediate_action": "Delay irrigation by 24 hours.",
            "why_it_matters": "Rain expected tomorrow (84% chance, 25mm).",
            "recommended_timing": "Next 24 to 48 hours",
            "risk_if_ignored": "Waterlogging and root rot.",
            "confidence_pct": 95.0,
            "language": "hi",
            "status": "GENERATED",
            "action_steps": ["Inspect drainage trenches", "Turn off drip valves"],
        },
    )
    assert advisory_res.status_code == 201
    advisory_id = advisory_res.json()["id"]

    # 5. Log Outbound Delivery
    delivery_res = await client.post(
        f"/api/v1/advisories/{advisory_id}/deliveries",
        json={
            "advisory_id": advisory_id,
            "farmer_id": farmer_id,
            "channel": "VOICE_IVR",
            "status": "DELIVERED",
            "recipient_phone": "+919811122233",
            "language": "hi",
            "content_snippet": "सिंचाई 24 घंटे टालें। कल बारिश की संभावना है।",
            "duration_seconds": 42,
        },
    )
    assert delivery_res.status_code == 201
    assert delivery_res.json()["channel"] == "VOICE_IVR"
    assert delivery_res.json()["duration_seconds"] == 42

    # 6. Verify Advisory Details include delivery logs
    detail_res = await client.get(f"/api/v1/advisories/{advisory_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["delivery_logs"]) == 1
    assert detail_data["delivery_logs"][0]["status"] == "DELIVERED"
