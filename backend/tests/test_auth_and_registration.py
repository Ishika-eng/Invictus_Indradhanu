import time
import uuid
import pytest
import jwt
from httpx import AsyncClient

from app.core.config import settings


def create_test_token(user_id: str, phone: str = "+919876543210", email: str = None, expired: bool = False) -> str:
    exp = time.time() - 3600 if expired else time.time() + 3600
    payload = {
        "sub": user_id,
        "role": "authenticated",
        "aud": "authenticated",
        "exp": exp,
    }
    if phone is not None:
        payload["phone"] = phone
    if email is not None:
        payload["email"] = email
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


@pytest.mark.asyncio
async def test_farmer_registration_and_state_with_email_auth(client: AsyncClient):
    """Tests email-based Supabase Auth flow: token contains email without phone claim."""
    user_id = str(uuid.uuid4())
    test_email = f"kisan_{user_id[:8]}@example.com"
    # Token has email and NO phone claim (simulating Supabase email sign up)
    token = create_test_token(user_id, phone=None, email=test_email)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Unregistered state
    res_me = await client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    data_me = res_me.json()
    assert data_me["authenticated"] is True
    assert data_me["is_registered"] is False
    assert data_me["email"] == test_email
    assert data_me["phone_number"] is None

    # 2. Register farmer providing phone_number in the request body
    reg_payload = {
        "full_name": "Ramesh Kisan",
        "phone_number": "+919811223344",
        "preferred_language": "hi",
        "village": "Shirdi",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Sai Organic Farm",
        "farm_acreage": 3.0,
        "soil_type": "Loam",
        "irrigation_source": "Well",
        "latitude": 19.7667,
        "longitude": 74.4764,
        "elevation_meters": 510.0,
    }
    res_reg = await client.post(
        "/api/v1/auth/register-farmer",
        json=reg_payload,
        headers=headers,
    )
    assert res_reg.status_code == 201
    farmer_data = res_reg.json()
    assert farmer_data["full_name"] == "Ramesh Kisan"
    assert farmer_data["email"] == test_email
    assert farmer_data["phone_number"] == "+919811223344"
    assert len(farmer_data["farms"]) == 1

    # 3. Post-registration state in /auth/me
    res_me_after = await client.get("/api/v1/auth/me", headers=headers)
    assert res_me_after.status_code == 200
    data_after = res_me_after.json()
    assert data_after["is_registered"] is True
    assert data_after["email"] == test_email
    assert data_after["phone_number"] == "+919811223344"
    assert data_after["farmer"]["email"] == test_email

    # 4. Profile retrieval via /farmers/me
    res_profile = await client.get("/api/v1/farmers/me", headers=headers)
    assert res_profile.status_code == 200
    assert res_profile.json()["email"] == test_email
    assert res_profile.json()["phone_number"] == "+919811223344"


@pytest.mark.asyncio
async def test_registration_retry_duplicate_conflict_and_farm_idempotency(client: AsyncClient):
    """Enforces duplicate prevention on retries for both farmers and farm plots."""
    user_id = str(uuid.uuid4())
    test_email = f"farmer_dup_{user_id[:8]}@example.com"
    token = create_test_token(user_id, phone=None, email=test_email)
    headers = {"Authorization": f"Bearer {token}"}

    reg_payload = {
        "full_name": "Suresh Patil",
        "phone_number": "+919822334455",
        "email": test_email,
        "preferred_language": "mr",
        "village": "Karad",
        "district": "Satara",
        "state": "Maharashtra",
        "country": "India",
        "farm_name": "Krishna River Plot",
        "farm_acreage": 4.0,
        "soil_type": "Alluvial Loam",
        "irrigation_source": "River Lift",
        "latitude": 17.2885,
        "longitude": 74.1837,
    }

    # 1. First registration succeeds
    res_first = await client.post("/api/v1/auth/register-farmer", json=reg_payload, headers=headers)
    assert res_first.status_code == 201
    farmer_data = res_first.json()
    assert len(farmer_data["farms"]) == 1

    # 2. Retry / duplicate attempt on /register-farmer returns 409 Conflict
    res_retry = await client.post("/api/v1/auth/register-farmer", json=reg_payload, headers=headers)
    assert res_retry.status_code == 409
    assert "already registered" in str(res_retry.json()).lower()

    # 3. Adding the exact same farm plot (same name, lat, lng) via /farms/me is idempotent and returns existing plot
    add_plot_payload = {
        "name": "Krishna River Plot",
        "latitude": 17.2885,
        "longitude": 74.1837,
        "acreage": 4.0,
        "soil_type": "Alluvial Loam",
        "irrigation_source": "River Lift",
    }
    res_farm_retry = await client.post("/api/v1/farms/me", json=add_plot_payload, headers=headers)
    assert res_farm_retry.status_code == 201 or res_farm_retry.status_code == 200

    # Ensure farmer still has only 1 plot, not a duplicate
    res_all_plots = await client.get("/api/v1/farms/me", headers=headers)
    assert res_all_plots.status_code == 200
    assert len(res_all_plots.json()) == 1

    # 4. Another user attempting to claim the same phone returns 409
    other_user = str(uuid.uuid4())
    other_token = create_test_token(other_user, phone=None, email=f"other_{other_user[:8]}@example.com")
    other_headers = {"Authorization": f"Bearer {other_token}"}
    res_phone_conflict = await client.post(
        "/api/v1/auth/register-farmer",
        json={**reg_payload, "email": f"other_{other_user[:8]}@example.com"},
        headers=other_headers,
    )
    assert res_phone_conflict.status_code == 409
    assert "phone" in str(res_phone_conflict.json()).lower()

    # 5. Another user attempting to claim the same email returns 409
    res_email_conflict = await client.post(
        "/api/v1/auth/register-farmer",
        json={**reg_payload, "phone_number": "+919999988888", "email": test_email},
        headers=other_headers,
    )
    assert res_email_conflict.status_code == 409
    assert "email" in str(res_email_conflict.json()).lower()


@pytest.mark.asyncio
async def test_supabase_es256_asymmetric_token_verification(client: AsyncClient):
    """Verifies that modern Supabase ES256 asymmetric ECDSA JWT tokens are correctly verified via JWKS/EC keys."""
    import base64
    from cryptography.hazmat.primitives.asymmetric import ec
    from app.core.security import verify_supabase_jwt, KNOWN_JWKS, get_current_user

    # 1. Generate an ECDSA P-256 test key pair
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    pub_numbers = public_key.public_numbers()

    # Convert coordinates to base64url format
    x_bytes = pub_numbers.x.to_bytes(32, byteorder="big")
    y_bytes = pub_numbers.y.to_bytes(32, byteorder="big")
    x_b64 = base64.urlsafe_b64encode(x_bytes).rstrip(b"=").decode("ascii")
    y_b64 = base64.urlsafe_b64encode(y_bytes).rstrip(b"=").decode("ascii")

    test_kid = f"test-key-{uuid.uuid4()}"
    KNOWN_JWKS[test_kid] = {
        "alg": "ES256",
        "crv": "P-256",
        "ext": True,
        "key_ops": ["verify"],
        "kid": test_kid,
        "kty": "EC",
        "use": "sig",
        "x": x_b64,
        "y": y_b64,
    }

    try:
        user_id = str(uuid.uuid4())
        payload = {
            "sub": user_id,
            "role": "authenticated",
            "aud": "authenticated",
            "email": "farmer_es256@example.com",
            "phone": "+919876500000",
            "user_metadata": {
                "full_name": "Ramesh Patil",
            },
            "exp": time.time() + 3600,
        }

        # Sign with private key using ES256
        token = jwt.encode(
            payload,
            private_key,
            algorithm="ES256",
            headers={"kid": test_kid, "alg": "ES256"},
        )

        # Verify decoding through verify_supabase_jwt
        supabase_user = verify_supabase_jwt(token)
        assert supabase_user.user_id == user_id
        assert supabase_user.email == "farmer_es256@example.com"
        assert supabase_user.phone == "+919876500000"
        assert supabase_user.role == "authenticated"

        # Test through FastAPI HTTP endpoint
        headers = {"Authorization": f"Bearer {token}"}
        res_me = await client.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        data_me = res_me.json()
        assert data_me["authenticated"] is True
        assert data_me["supabase_user_id"] == user_id
        assert data_me["email"] == "farmer_es256@example.com"
        assert data_me["phone_number"] == "+919876500000"

        # Register farmer with ES256 token via /api/v1/auth/register-farmer
        reg_payload = {
            "full_name": "Ramesh Patil",
            "preferred_language": "mr",
            "village": "Sangli",
            "district": "Sangli",
            "state": "Maharashtra",
            "country": "India",
            "farm_name": "Turmeric Estate",
            "farm_acreage": 3.5,
            "soil_type": "Medium Black Soil",
            "irrigation_source": "Drip Irrigation",
            "latitude": 16.8524,
            "longitude": 74.5815,
        }
        res_reg = await client.post(
            "/api/v1/auth/register-farmer",
            json=reg_payload,
            headers=headers,
        )
        assert res_reg.status_code == 201
        farmer_data = res_reg.json()
        assert farmer_data["full_name"] == "Ramesh Patil"
        assert farmer_data["email"] == "farmer_es256@example.com"
        assert len(farmer_data["farms"]) == 1
        assert farmer_data["farms"][0]["name"] == "Turmeric Estate"

        # Tampered ES256 token must fail verification
        tampered_token = token[:-5] + "AAAAA"
        with pytest.raises(Exception) as exc_info:
            verify_supabase_jwt(tampered_token)
        assert "401" in str(exc_info.value) or "invalid" in str(exc_info.value).lower()

        # Expired ES256 token must fail verification
        expired_payload = {**payload, "exp": time.time() - 3600}
        expired_token = jwt.encode(
            expired_payload,
            private_key,
            algorithm="ES256",
            headers={"kid": test_kid, "alg": "ES256"},
        )
        with pytest.raises(Exception) as exp_exc:
            verify_supabase_jwt(expired_token)
        assert "expired" in str(exp_exc.value).lower()

    finally:
        KNOWN_JWKS.pop(test_kid, None)




