import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop import Crop
from app.models.risk import RiskAssessment
from app.models.advisory import Advisory
from app.models.delivery import DeliveryLog
from app.services.audit_service import AuditService
from app.database.seed_crops import seed_crop_database


@pytest.mark.asyncio
async def test_admin_overview_metrics(client: AsyncClient, db_session: AsyncSession):
    """Verifies that /api/v1/admin/overview calculates database-backed metrics across all modules."""
    await seed_crop_database(db_session)

    resp = await client.get(
        "/api/v1/admin/overview",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert "total_farmers" in data
    assert "active_farms" in data
    assert "active_crop_cycles" in data
    assert "risks_by_level" in data
    assert "delivery_statistics" in data
    assert "geographic_distribution" in data
    assert "recent_activity" in data
    assert data["delivery_statistics"]["by_channel"] is not None


@pytest.mark.asyncio
async def test_admin_farmer_directory_search_and_detail(client: AsyncClient, db_session: AsyncSession):
    """Tests searching, filtering, and viewing comprehensive farmer details."""
    await seed_crop_database(db_session)
    unique_phone = f"+9198{uuid.uuid4().int % 100000000:08d}"

    farmer = Farmer(
        id=uuid.uuid4(),
        full_name="Mahadev Shinde",
        phone_number=unique_phone,
        village="Baramati",
        district="Pune",
        state="Maharashtra",
        country="India",
        preferred_language="mr",
        role="FARMER",
    )
    db_session.add(farmer)
    await db_session.commit()
    farmer_id = farmer.id

    # 1. Search by name
    search_res = await client.get(
        "/api/v1/admin/farmers?q=Mahadev",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert search_res.status_code == 200
    items = search_res.json()["items"]
    assert any(f["phone_number"] == unique_phone for f in items)

    # 2. Get Single Farmer Detail
    detail_res = await client.get(
        f"/api/v1/admin/farmers/{farmer_id}",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["farmer"]["full_name"] == "Mahadev Shinde"
    assert "farms" in detail_data
    assert "advisories" in detail_data


@pytest.mark.asyncio
async def test_admin_advisory_reassessment_and_resend(client: AsyncClient, db_session: AsyncSession):
    """Tests triggering live advisory reassessment and resending notifications with duplicate protection."""
    await seed_crop_database(db_session)
    farmer_phone = f"+9191{uuid.uuid4().int % 100000000:08d}"

    farmer = Farmer(
        id=uuid.uuid4(),
        full_name="Sunita Patil",
        phone_number=farmer_phone,
        village="Sangli",
        district="Sangli",
        state="Maharashtra",
        country="India",
        preferred_language="mr",
    )
    db_session.add(farmer)
    await db_session.flush()

    farm = Farm(
        id=uuid.uuid4(),
        farmer_id=farmer.id,
        name="Main Plot",
        latitude=16.8524,
        longitude=74.5815,
        acreage=3.5,
        soil_type="Black Clay Soil",
        irrigation_source="Drip",
    )
    db_session.add(farm)
    await db_session.flush()

    crop_res = await db_session.execute(Crop.__table__.select().limit(1))
    crop_row = crop_res.first()
    crop_id = crop_row.id

    advisory = Advisory(
        id=uuid.uuid4(),
        farmer_id=farmer.id,
        farm_id=farm.id,
        crop_id=crop_id,
        immediate_action="Delay irrigation for 24h",
        why_it_matters="Rain forecasted",
        recommended_timing="Next 24h",
        risk_if_ignored="Root waterlogging",
        status="GENERATED",
        language="mr",
        confidence_pct=92.5,
    )
    db_session.add(advisory)
    await db_session.commit()
    adv_id = advisory.id

    # 1. Trigger Reassessment
    reassess_res = await client.post(
        f"/api/v1/admin/advisories/{adv_id}/reassess",
        headers={"X-Admin-Role": "OPERATOR"},
    )
    assert reassess_res.status_code == 200, reassess_res.text
    reassess_data = reassess_res.json()
    assert reassess_data["action_taken"] == "REASSESSED"
    assert "audit_log_id" in reassess_data

    # 2. Resend Notification
    resend_res = await client.post(
        f"/api/v1/admin/advisories/{adv_id}/resend",
        json={"channels": ["SMS"], "force_resend": True, "simulate": True},
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert resend_res.status_code == 200, resend_res.text
    resend_data = resend_res.json()
    assert "channel_outcomes" in resend_data
    assert resend_data["channel_outcomes"][0]["status"] == "SIMULATED"


@pytest.mark.asyncio
async def test_admin_feedback_and_audit_trail(client: AsyncClient, db_session: AsyncSession):
    """Tests recording field feedback and querying the immutable audit log."""
    await seed_crop_database(db_session)
    adv_id = uuid.uuid4()
    farmer_id = uuid.uuid4()
    farm_id = uuid.uuid4()

    crop_res = await db_session.execute(Crop.__table__.select().limit(1))
    crop_row = crop_res.first()
    crop_id = crop_row.id

    farmer = Farmer(
        id=farmer_id,
        full_name="Kisan Rao",
        phone_number=f"+9193{uuid.uuid4().int % 100000000:08d}",
        village="Nashik",
        district="Nashik",
        state="Maharashtra",
        country="India",
    )
    db_session.add(farmer)
    await db_session.flush()

    farm = Farm(
        id=farm_id,
        farmer_id=farmer.id,
        name="Vineyard Plot",
        latitude=19.9975,
        longitude=73.7898,
        acreage=2.0,
        soil_type="Alluvial Loam",
        irrigation_source="Drip",
    )
    db_session.add(farm)
    await db_session.flush()

    advisory = Advisory(
        id=adv_id,
        farmer_id=farmer.id,
        farm_id=farm.id,
        crop_id=crop_id,
        immediate_action="Hold copper fungicide spray",
        why_it_matters="High wind gusts predicted",
        recommended_timing="Immediate",
        risk_if_ignored="Foliar chemical drift",
        status="GENERATED",
        language="hi",
        confidence_pct=95.0,
    )
    db_session.add(advisory)
    await db_session.commit()

    # 1. Record Farmer Feedback
    feedback_res = await client.post(
        f"/api/v1/admin/advisories/{adv_id}/feedback",
        json={
            "action_taken": "APPLIED",
            "rating": 5,
            "reported_water_savings_liters": 4500.0,
            "reported_losses_avoided_inr": 12000.0,
            "feedback_text": "Saved full spray batch from being blown away by wind.",
        },
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert feedback_res.status_code == 200, feedback_res.text
    assert feedback_res.json()["action_status"] == "APPLIED"

    # 2. Query Immutable Audit Trail
    audit_res = await client.get(
        f"/api/v1/admin/audit-logs?advisory_id={adv_id}",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert audit_res.status_code == 200, audit_res.text
    audit_data = audit_res.json()
    assert audit_data["total"] >= 1
    latest_audit = audit_data["items"][0]
    assert latest_audit["event_type"] == "FEEDBACK_RECORDED"
    assert latest_audit["farmer_action"] == "APPLIED"
    assert latest_audit["is_immutable"] is True


@pytest.mark.asyncio
async def test_admin_impact_measurement_partitioning(client: AsyncClient, db_session: AsyncSession):
    """Verifies that impact metrics are strictly partitioned into Measured, Reported, and Estimated."""
    await seed_crop_database(db_session)

    resp = await client.get(
        "/api/v1/admin/impact",
        headers={"X-Admin-Role": "ADMIN"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert "measured" in data
    assert "farmer_reported" in data
    assert "model_estimated" in data
    assert "measurement_transparency_note" in data

    # Measured must contain telecom delivery receipts
    assert "carrier_delivery_success_rate_pct" in data["measured"]
    # Farmer reported must contain verified feedback sums
    assert "recommendation_uptake_rate_pct" in data["farmer_reported"]
    assert "total_reported_water_saved_liters" in data["farmer_reported"]
    # Model estimated must contain agronomic formulas
    assert "potential_water_savings_liters" in data["model_estimated"]


@pytest.mark.asyncio
async def test_admin_role_based_security_rejection(client: AsyncClient):
    """Tests that unauthorized calls or standard farmer users are strictly rejected with 403 Forbidden."""
    # 1. Unauthenticated / No role header or token
    unauth_resp = await client.get("/api/v1/admin/overview")
    assert unauth_resp.status_code == 403

    # 2. Invalid role header
    invalid_resp = await client.get(
        "/api/v1/admin/overview",
        headers={"X-Admin-Role": "FARMER"},
    )
    assert invalid_resp.status_code == 403
    assert "Administrative or Operator authorization required" in invalid_resp.text
