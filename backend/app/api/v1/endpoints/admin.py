import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin_or_operator
from app.services.admin_service import AdminService
from app.services.audit_service import AuditService
from app.schemas.admin import (
    OverviewMetricsResponse,
    AdminFarmersListResponse,
    AdminFarmerDetailResponse,
    AdminAdvisoriesListResponse,
    AdvisoryReassessResponse,
    AdvisoryResendRequest,
    AdvisoryFeedbackRequest,
    AuditLogsListResponse,
    AuditLogResponse,
    ImpactMeasurementResponse,
)

router = APIRouter()


@router.get(
    "/overview",
    response_model=OverviewMetricsResponse,
    summary="Admin Overview Metrics Dashboard",
    description="Returns real-time database-backed aggregate metrics across farmers, farms, risks, advisories, and carrier delivery statistics.",
)
async def get_overview_dashboard(
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    metrics = await AdminService.get_overview_metrics(db)
    return metrics


@router.get(
    "/farmers",
    response_model=AdminFarmersListResponse,
    summary="Search & Filter Farmer Directory",
    description="Allows administrators to search and filter registered farmers across names, phones, locations, languages, and crops.",
)
async def list_admin_farmers(
    q: Optional[str] = Query(None, description="Search query across name, phone, or village"),
    district: Optional[str] = Query(None, description="Filter by district"),
    state: Optional[str] = Query(None, description="Filter by state"),
    crop: Optional[str] = Query(None, description="Filter by cultivated crop name"),
    language: Optional[str] = Query(None, description="Filter by preferred dialect"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(15, ge=1, le=100, description="Items per page"),
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    items, total = await AdminService.list_farmers(
        db=db,
        q=q,
        district=district,
        state=state,
        language=language,
        crop=crop,
        page=page,
        page_size=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get(
    "/farmers/{farmer_id}",
    response_model=AdminFarmerDetailResponse,
    summary="Get Farmer Detail & Advisory History",
    description="Returns detailed farm plots, registered crops, growth stages, advisory history, and delivery logs for a specific farmer.",
)
async def get_farmer_detail(
    farmer_id: uuid.UUID,
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    detail = await AdminService.get_farmer_detail(db, farmer_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer {farmer_id} not found",
        )
    return detail


@router.get(
    "/advisories",
    response_model=AdminAdvisoriesListResponse,
    summary="List Generated Advisories with Climate & Risk Context",
    description="Returns paginated advisories with full climate conditions, risk level, recommendation status, and delivery logs.",
)
async def list_admin_advisories(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by advisory status"),
    risk_level: Optional[str] = Query(None, description="Filter by risk category: LOW, MODERATE, HIGH, CRITICAL"),
    farm_id: Optional[uuid.UUID] = Query(None, description="Filter by specific farm ID"),
    crop_id: Optional[uuid.UUID] = Query(None, description="Filter by crop ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(15, ge=1, le=100, description="Items per page"),
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    items, total = await AdminService.list_advisories(
        db=db,
        status=status_filter,
        risk_level=risk_level,
        farm_id=farm_id,
        crop_id=crop_id,
        page=page,
        page_size=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post(
    "/advisories/{advisory_id}/reassess",
    response_model=AdvisoryReassessResponse,
    summary="Trigger Reassessment for Advisory",
    description="Triggers live climate and risk recalculation for an existing advisory plot, generating an updated advisory and immutable audit log.",
)
async def trigger_advisory_reassessment(
    advisory_id: uuid.UUID,
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    try:
        operator_id = admin_context.get("operator_id")
        result = await AdminService.reassess_advisory(db, advisory_id, operator_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Reassessment failed: {str(e)}")


@router.post(
    "/advisories/{advisory_id}/resend",
    summary="Resend Failed Notification with Duplicate Protection",
    description="Resends an advisory notification across chosen or failed channels while enforcing rate-limits and duplicate prevention.",
)
async def resend_advisory_notification(
    advisory_id: uuid.UUID,
    payload: AdvisoryResendRequest = AdvisoryResendRequest(),
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    try:
        operator_id = admin_context.get("operator_id")
        result = await AdminService.resend_advisory(db, advisory_id, payload, operator_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Resend failed: {str(e)}")


@router.post(
    "/advisories/{advisory_id}/feedback",
    summary="Record Farmer Feedback & Action Outcome",
    description="Records field action outcome (APPLIED, IGNORED) and reported water/crop savings, recording an immutable audit entry.",
)
async def record_farmer_feedback(
    advisory_id: uuid.UUID,
    payload: AdvisoryFeedbackRequest,
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    try:
        operator_id = admin_context.get("operator_id")
        result = await AdminService.record_feedback(db, advisory_id, payload, operator_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Feedback recording failed: {str(e)}")


@router.get(
    "/audit-logs",
    response_model=AuditLogsListResponse,
    summary="Immutable Advisory Audit Log System",
    description="Returns the tamper-evident audit trail capturing complete climate inputs, scoring models, prompt versions, and delivery outcomes.",
)
async def list_audit_trail(
    advisory_id: Optional[uuid.UUID] = Query(None, description="Filter by advisory ID"),
    farmer_id: Optional[uuid.UUID] = Query(None, description="Filter by farmer ID"),
    farm_id: Optional[uuid.UUID] = Query(None, description="Filter by farm ID"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    logs, total = await AuditService.list_audit_logs(
        db=db,
        advisory_id=advisory_id,
        farmer_id=farmer_id,
        farm_id=farm_id,
        event_type=event_type,
        page=page,
        page_size=page_size,
    )
    items = []
    for log in logs:
        items.append(
            AuditLogResponse(
                id=log.id,
                advisory_id=log.advisory_id,
                farm_id=log.farm_id,
                farmer_id=log.farmer_id,
                farmer_name=log.farmer.full_name if log.farmer else None,
                event_type=log.event_type,
                climate_snapshot=log.climate_snapshot,
                risk_snapshot=log.risk_snapshot,
                advisory_snapshot=log.advisory_snapshot,
                delivery_snapshot=log.delivery_snapshot,
                farmer_action=log.farmer_action,
                farmer_feedback=log.farmer_feedback,
                impact_data=log.impact_data,
                scoring_methodology=log.scoring_methodology,
                model_version=log.model_version,
                operator_id=log.operator_id,
                notes=log.notes,
                created_at=log.created_at,
                is_immutable=log.is_immutable,
            )
        )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get(
    "/impact",
    response_model=ImpactMeasurementResponse,
    summary="Impact Measurement Engine",
    description="Returns verified impact metrics strictly partitioned into Measured, Farmer-Reported, and Model-Estimated indicators.",
)
async def get_impact_measurement(
    admin_context: dict = Depends(require_admin_or_operator),
    db: AsyncSession = Depends(get_db),
):
    impact = await AdminService.get_impact_metrics(db)
    return impact
