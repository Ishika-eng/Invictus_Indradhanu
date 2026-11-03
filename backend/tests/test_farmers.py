import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_get_farmer(client: AsyncClient):
    payload = {
        "full_name": "Ramesh Patil",
        "phone_number": "+919876543210",
        "preferred_language": "mr",
        "village": "Baramati",
        "district": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "trust_score": 96.0,
        "is_active": True,
    }

    # Create farmer
    res = await client.post("/api/v1/farmers/", json=payload)
    assert res.status_code == 201
    farmer_data = res.json()
    assert farmer_data["full_name"] == "Ramesh Patil"
    assert farmer_data["phone_number"] == "+919876543210"
    farmer_id = farmer_data["id"]

    # Duplicate phone should return 409 Conflict
    res_dup = await client.post("/api/v1/farmers/", json=payload)
    assert res_dup.status_code == 409

    # Retrieve by ID
    res_get = await client.get(f"/api/v1/farmers/{farmer_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == farmer_id
    assert res_get.json()["farms"] == []

    # List farmers
    res_list = await client.get("/api/v1/farmers/")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

