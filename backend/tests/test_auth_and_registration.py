import time
import uuid
import pytest
import jwt
from httpx import AsyncClient

from app.core.config import settings


def create_test_token(user_id: str, phone: str = "+919876543210", expired: bool = False) -> str:
    exp = time.time() - 3600 if expired else time.time() + 3600
    payload = {
        "sub": user_id,
        "phone": phone,
        "role": "authenticated",
        "aud": "authenticated",
        "exp": exp,
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


@pytest.mark.asyncio
async def test_auth_me_unauthorized(client: AsyncClient):
    """Accessing /auth/me without an Authorization header returns 401."""
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_invalid_token(client: AsyncClient):
    """Accessing /auth/me with an invalid JWT string returns 401."""
    res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.signature"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_expired_token(client: AsyncClient):
    """Accessing /auth/me with an expired JWT returns 401."""
    expired_token = create_test_token(str(uuid.uuid4()), expired=True)
    res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert res.status_code == 401
    assert "expired" in res.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_farmer_registration_and_state(client: AsyncClient):
    """Tests the full flow: new user -> unregistered state -> registration -> registered state."""
    user_id = str(uuid.uuid4())
    token = create_test_token(user_id, phone="+919922334455")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check auth state before registration -> is_registered should be False
    res_me = await client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    data_me = res_me.json()
    assert data_me["authenticated"] is True
    assert data_me["is_registered"] is False
    assert data_me["phone_number"] == "+919922334455"

    # 2. Register farmer and initial farm plot
    reg_payload = {
        "full_name": "Balaji Rao",
        "preferred_language": "mr",
        "village": "Baramati",
        "district": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Main Sugar Cane Plot",
        "farm_acreage": 4.5,
        "soil_type": "Black Clay Soil",
        "irrigation_source": "Drip Irrigation",
        "latitude": 18.1528,
        "longitude": 74.5768,
        "elevation_meters": 548.0,
    }
    res_reg = await client.post(
        "/api/v1/auth/register-farmer",
        json=reg_payload,
        headers=headers,
    )
    assert res_reg.status_code == 201
    farmer_data = res_reg.json()
    assert farmer_data["full_name"] == "Balaji Rao"
    assert farmer_data["phone_number"] == "+919922334455"
    assert len(farmer_data["farms"]) == 1
    assert farmer_data["farms"][0]["name"] == "Main Sugar Cane Plot"
    assert farmer_data["farms"][0]["latitude"] == 18.1528

    # 3. Check auth state after registration -> is_registered should be True
    res_me_after = await client.get("/api/v1/auth/me", headers=headers)
    assert res_me_after.status_code == 200
    assert res_me_after.json()["is_registered"] is True
    assert res_me_after.json()["farmer"]["full_name"] == "Balaji Rao"

    # 4. Duplicate registration attempt should return 409 Conflict
    res_dup = await client.post(
        "/api/v1/auth/register-farmer",
        json=reg_payload,
        headers=headers,
    )
    assert res_dup.status_code == 409

    # 5. Retrieve authenticated farmer via /farmers/me
    res_my_profile = await client.get("/api/v1/farmers/me", headers=headers)
    assert res_my_profile.status_code == 200
    assert res_my_profile.json()["full_name"] == "Balaji Rao"

    # 6. Update farmer profile via /farmers/me
    res_update = await client.put(
        "/api/v1/farmers/me",
        json={"preferred_language": "hi", "village": "New Baramati"},
        headers=headers,
    )
    assert res_update.status_code == 200
    assert res_update.json()["preferred_language"] == "hi"
    assert res_update.json()["village"] == "New Baramati"


@pytest.mark.asyncio
async def test_farm_multi_plot_and_ownership_enforcement(client: AsyncClient):
    """Enforces that farmers can add and manage multiple plots, but cannot touch another farmer's plot."""
    # Farmer A
    user_a = str(uuid.uuid4())
    token_a = create_test_token(user_a, phone="+919000000001")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    reg_a = await client.post(
        "/api/v1/auth/register-farmer",
        json={
            "full_name": "Farmer Alpha",
            "preferred_language": "mr",
            "village": "Village A",
            "district": "Pune",
            "state": "Maharashtra",
            "farm_name": "Alpha Plot 1",
            "farm_acreage": 2.0,
            "soil_type": "Black Cotton Soil",
            "irrigation_source": "Canal",
            "latitude": 18.52,
            "longitude": 73.85,
        },
        headers=headers_a,
    )
    assert reg_a.status_code == 201
    farm_a_id = reg_a.json()["farms"][0]["id"]

    # Farmer B
    user_b = str(uuid.uuid4())
    token_b = create_test_token(user_b, phone="+919000000002")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    reg_b = await client.post(
        "/api/v1/auth/register-farmer",
        json={
            "full_name": "Farmer Beta",
            "preferred_language": "en",
            "village": "Village B",
            "district": "Nashik",
            "state": "Maharashtra",
            "farm_name": "Beta Plot 1",
            "farm_acreage": 5.0,
            "soil_type": "Red Loam",
            "irrigation_source": "Drip",
            "latitude": 19.99,
            "longitude": 73.78,
        },
        headers=headers_b,
    )
    assert reg_b.status_code == 201

    # Farmer A adds a second farm plot (multi-farm support)
    add_res = await client.post(
        "/api/v1/farms/me",
        json={
            "name": "Alpha Plot 2 (Orchard)",
            "latitude": 18.55,
            "longitude": 73.88,
            "acreage": 3.5,
            "soil_type": "Loamy Sand",
            "irrigation_source": "Borewell",
        },
        headers=headers_a,
    )
    assert add_res.status_code == 201
    assert add_res.json()["name"] == "Alpha Plot 2 (Orchard)"

    # Farmer A lists all their own plots -> should have 2 plots
    my_farms_res = await client.get("/api/v1/farms/me", headers=headers_a)
    assert my_farms_res.status_code == 200
    my_farms = my_farms_res.json()
    assert len(my_farms) == 2

    # SECURITY CHECK: Farmer B attempts to modify Farmer A's plot -> Must fail with 404 (Not found for Farmer B)
    res_hijack = await client.put(
        f"/api/v1/farms/me/{farm_a_id}",
        json={"name": "Hacked Plot Name"},
        headers=headers_b,
    )
    assert res_hijack.status_code == 404

    # SECURITY CHECK: Farmer B attempts to delete Farmer A's plot -> Must fail with 404
    res_delete_hijack = await client.delete(
        f"/api/v1/farms/me/{farm_a_id}",
        headers=headers_b,
    )
    assert res_delete_hijack.status_code == 404

    # Farmer A updates their own plot successfully
    res_legit_update = await client.put(
        f"/api/v1/farms/me/{farm_a_id}",
        json={"name": "Alpha Plot 1 (Updated)"},
        headers=headers_a,
    )
    assert res_legit_update.status_code == 200
    assert res_legit_update.json()["name"] == "Alpha Plot 1 (Updated)"

