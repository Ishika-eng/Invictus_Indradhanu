import time
import uuid
from datetime import date, timedelta
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
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


@pytest.mark.asyncio
async def test_list_crops_and_catalog(client: AsyncClient, db_session: AsyncSession):
    """Seed crops and verify listing returns initial supported crops with growth stages."""
    await seed_crop_database(db_session)

    res = await client.get("/api/v1/crops/")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 6

    crop_names = [c["name"] for c in crops]
    for required in ["Tomato", "Rice (Paddy)", "Wheat", "Cotton", "Maize (Corn)", "Sugarcane"]:
        assert required in crop_names

    # Check Tomato structure
    tomato = next(c for c in crops if c["name"] == "Tomato")
    assert tomato["scientific_name"] == "Solanum lycopersicum"
    assert tomato["category"] == "Vegetable / Solanaceous"
    assert tomato["water_demand"] == "Sensitive"
    assert tomato["temp_optimal_min_c"] == 18.0
    assert len(tomato["growth_stages"]) == 6

    # Verify stages order
    stage_orders = [s["stage_order"] for s in tomato["growth_stages"]]
    assert stage_orders == [1, 2, 3, 4, 5, 6]


@pytest.mark.asyncio
async def test_get_single_crop_and_stages(client: AsyncClient, db_session: AsyncSession):
    """Test retrieving details and growth stages for a specific crop."""
    await seed_crop_database(db_session)

    list_res = await client.get("/api/v1/crops/")
    crops = list_res.json()
    wheat = next(c for c in crops if c["name"] == "Wheat")

    res = await client.get(f"/api/v1/crops/{wheat['id']}")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Wheat"
    assert data["scientific_name"] == "Triticum aestivum"
    assert data["growing_season"] == "Rabi (Winter season)"
    assert len(data["growth_stages"]) == 7


@pytest.mark.asyncio
async def test_estimate_growth_stage(client: AsyncClient, db_session: AsyncSession):
    """Test agronomic stage estimation based on sowing date."""
    await seed_crop_database(db_session)

    list_res = await client.get("/api/v1/crops/")
    tomato = next(c for c in list_res.json() if c["name"] == "Tomato")

    # Tomato Flowering stage is cumulative days 60 to 80
    sowing_date_flowering = (date.today() - timedelta(days=70)).isoformat()
    res = await client.get(
        f"/api/v1/crops/{tomato['id']}/estimate-stage?sowing_date={sowing_date_flowering}"
    )
    assert res.status_code == 200
    est = res.json()
    assert est["days_since_sowing"] == 70
    assert est["suggested_stage_name"] == "Flowering"
    assert est["water_sensitivity"] == "Critical"

    # Tomato Nursery stage is 10 days ago
    sowing_date_nursery = (date.today() - timedelta(days=10)).isoformat()
    res2 = await client.get(
        f"/api/v1/crops/{tomato['id']}/estimate-stage?sowing_date={sowing_date_nursery}"
    )
    assert res2.status_code == 200
    assert res2.json()["suggested_stage_name"] == "Nursery / Seedling"

    # Future date should fail validation
    future_date = (date.today() + timedelta(days=5)).isoformat()
    res_err = await client.get(
        f"/api/v1/crops/{tomato['id']}/estimate-stage?sowing_date={future_date}"
    )
    assert res_err.status_code == 400


@pytest.mark.asyncio
async def test_add_crop_to_farm_and_listing(client: AsyncClient, db_session: AsyncSession):
    """Test adding a cultivated crop to a farmer's plot and retrieving it."""
    await seed_crop_database(db_session)

    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch Tomato crop and stage
    crops_res = await client.get("/api/v1/crops/")
    tomato = next(c for c in crops_res.json() if c["name"] == "Tomato")
    veg_stage = next(s for s in tomato["growth_stages"] if s["stage_name"] == "Vegetative Growth")

    # Add Tomato to the farm
    crop_payload = {
        "crop_id": tomato["id"],
        "variety": "Abhinav F1",
        "cultivated_acreage": 2.0,
        "sowing_date": (date.today() - timedelta(days=40)).isoformat(),
        "current_stage_id": veg_stage["id"],
        "status": "active",
        "notes": "Drip fertigation every 4 days",
    }

    add_res = await client.post(
        f"/api/v1/farms/{farm['id']}/crops", json=crop_payload, headers=headers
    )
    assert add_res.status_code == 201
    created = add_res.json()
    assert created["variety"] == "Abhinav F1"
    assert created["cultivated_acreage"] == 2.0
    assert created["current_stage_name"] == "Vegetative Growth"
    assert created["crop"]["name"] == "Tomato"

    # List crops for this farm
    list_res = await client.get(f"/api/v1/farms/{farm['id']}/crops", headers=headers)
    assert list_res.status_code == 200
    farm_crops = list_res.json()
    assert len(farm_crops) == 1
    assert farm_crops[0]["id"] == created["id"]


@pytest.mark.asyncio
async def test_multiple_crops_and_acreage_limit_enforcement(client: AsyncClient, db_session: AsyncSession):
    """Test multiple crops per plot and enforce that total active acreage cannot exceed farm capacity."""
    await seed_crop_database(db_session)

    # Register farmer with 4.0 acres farm
    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]  # Registered with 5.0 acres in helper
    headers = {"Authorization": f"Bearer {token}"}

    crops_res = await client.get("/api/v1/crops/")
    crops = crops_res.json()
    tomato = next(c for c in crops if c["name"] == "Tomato")
    maize = next(c for c in crops if c["name"] == "Maize (Corn)")

    # 1. Add first crop (3.0 acres out of 5.0) -> Allowed
    crop1_payload = {
        "crop_id": tomato["id"],
        "variety": "Arka Rakshak",
        "cultivated_acreage": 3.0,
        "sowing_date": (date.today() - timedelta(days=20)).isoformat(),
        "status": "active",
    }
    res1 = await client.post(f"/api/v1/farms/{farm['id']}/crops", json=crop1_payload, headers=headers)
    assert res1.status_code == 201

    # 2. Add second crop (1.5 acres -> total 4.5 out of 5.0) -> Allowed
    crop2_payload = {
        "crop_id": maize["id"],
        "variety": "Pioneer 3396",
        "cultivated_acreage": 1.5,
        "sowing_date": (date.today() - timedelta(days=15)).isoformat(),
        "status": "active",
    }
    res2 = await client.post(f"/api/v1/farms/{farm['id']}/crops", json=crop2_payload, headers=headers)
    assert res2.status_code == 201

    # 3. Add third crop (1.0 acre -> total 5.5 exceeds 5.0) -> Must return 400 Bad Request
    crop3_payload = {
        "crop_id": maize["id"],
        "variety": "African Tall",
        "cultivated_acreage": 1.0,
        "sowing_date": date.today().isoformat(),
        "status": "active",
    }
    res3 = await client.post(f"/api/v1/farms/{farm['id']}/crops", json=crop3_payload, headers=headers)
    assert res3.status_code == 400
    err_body = res3.json()
    err_msg = err_body.get("error", {}).get("message") or err_body.get("detail", "")
    assert "exceeds available plot capacity" in err_msg


@pytest.mark.asyncio
async def test_update_crop_stage_and_removal(client: AsyncClient, db_session: AsyncSession):
    """Test updating growth stage on cultivated crop and removing crop record."""
    await seed_crop_database(db_session)

    farmer_data, token = await register_test_farmer(client, str(uuid.uuid4()))
    farm = farmer_data["farms"][0]
    headers = {"Authorization": f"Bearer {token}"}

    crops_res = await client.get("/api/v1/crops/")
    tomato = next(c for c in crops_res.json() if c["name"] == "Tomato")
    nursery_stage = next(s for s in tomato["growth_stages"] if s["stage_name"] == "Nursery / Seedling")
    flowering_stage = next(s for s in tomato["growth_stages"] if s["stage_name"] == "Flowering")

    # Add crop
    add_res = await client.post(
        f"/api/v1/farms/{farm['id']}/crops",
        json={
            "crop_id": tomato["id"],
            "variety": "Shivaji",
            "cultivated_acreage": 1.0,
            "sowing_date": (date.today() - timedelta(days=65)).isoformat(),
            "current_stage_id": nursery_stage["id"],
            "status": "active",
        },
        headers=headers,
    )
    farm_crop = add_res.json()

    # Update stage to Flowering manually
    update_res = await client.put(
        f"/api/v1/farms/{farm['id']}/crops/{farm_crop['id']}",
        json={"current_stage_id": flowering_stage["id"], "variety": "Shivaji Improved"},
        headers=headers,
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["current_stage_name"] == "Flowering"
    assert updated["variety"] == "Shivaji Improved"

    # Delete the crop
    del_res = await client.delete(
        f"/api/v1/farms/{farm['id']}/crops/{farm_crop['id']}",
        headers=headers,
    )
    assert del_res.status_code == 200

    # Verify empty listing
    list_res = await client.get(f"/api/v1/farms/{farm['id']}/crops", headers=headers)
    assert len(list_res.json()) == 0


@pytest.mark.asyncio
async def test_cross_farmer_crop_protection(client: AsyncClient, db_session: AsyncSession):
    """Verifies that Farmer A cannot access, add, or alter crops on Farmer B's farm plot."""
    await seed_crop_database(db_session)

    # Farmer A
    farmer_a, token_a = await register_test_farmer(client, str(uuid.uuid4()), phone="+919111111111")
    farm_a = farmer_a["farms"][0]

    # Farmer B
    farmer_b, token_b = await register_test_farmer(client, str(uuid.uuid4()), phone="+919222222222")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    crops_res = await client.get("/api/v1/crops/")
    tomato = next(c for c in crops_res.json() if c["name"] == "Tomato")

    # Farmer B attempts to add crop to Farmer A's farm -> 404 (EntityNotFound or not owned)
    res = await client.post(
        f"/api/v1/farms/{farm_a['id']}/crops",
        json={
            "crop_id": tomato["id"],
            "cultivated_acreage": 1.0,
            "sowing_date": date.today().isoformat(),
        },
        headers=headers_b,
    )
    assert res.status_code == 404

    # Farmer B attempts to list crops on Farmer A's farm -> 404
    list_res = await client.get(f"/api/v1/farms/{farm_a['id']}/crops", headers=headers_b)
    assert list_res.status_code == 404
