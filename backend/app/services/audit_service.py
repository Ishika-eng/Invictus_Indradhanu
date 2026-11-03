import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.audit import AdvisoryAuditLog
from app.models.farmer import Farmer


class AuditService:
    """Manages immutable audit logging for advisory and risk lifecycle traceability."""

    @staticmethod
    async def record_event(
        db: AsyncSession,
        advisory_id: uuid.UUID,
        farm_id: uuid.UUID,
        farmer_id: uuid.UUID,
        event_type: str,
        climate_snapshot: Optional[Dict[str, Any]] = None,
        risk_snapshot: Optional[Dict[str, Any]] = None,
        advisory_snapshot: Optional[Dict[str, Any]] = None,
        delivery_snapshot: Optional[Dict[str, Any]] = None,
        farmer_action: Optional[str] = None,
        farmer_feedback: Optional[Dict[str, Any]] = None,
        impact_data: Optional[Dict[str, Any]] = None,
        scoring_methodology: str = "AGRONOMIC_MULTI_CRITERIA_V1",
        model_version: str = "rules_engine_v1+gemini-1.5-flash",
        operator_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> AdvisoryAuditLog:
        """
        Creates an immutable, tamper-evident audit record capturing complete environmental,
        risk, LLM, and carrier delivery snapshots.
        """
        log_entry = AdvisoryAuditLog(
            id=uuid.uuid4(),
            advisory_id=advisory_id,
            farm_id=farm_id,
            farmer_id=farmer_id,
            event_type=event_type,
            climate_snapshot=climate_snapshot,
            risk_snapshot=risk_snapshot,
            advisory_snapshot=advisory_snapshot,
            delivery_snapshot=delivery_snapshot,
            farmer_action=farmer_action,
            farmer_feedback=farmer_feedback,
            impact_data=impact_data,
            scoring_methodology=scoring_methodology,
            model_version=model_version,
            operator_id=operator_id,
            notes=notes,
            created_at=datetime.now(timezone.utc),
            is_immutable=True,
        )
        db.add(log_entry)
        await db.commit()
        await db.refresh(log_entry)
        return log_entry

    @staticmethod
    async def list_audit_logs(
        db: AsyncSession,
        advisory_id: Optional[uuid.UUID] = None,
        farmer_id: Optional[uuid.UUID] = None,
        farm_id: Optional[uuid.UUID] = None,
        event_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[AdvisoryAuditLog], int]:
        """Returns paginated immutable audit logs with optional filters."""
        query = select(AdvisoryAuditLog).options(selectinload(AdvisoryAuditLog.farmer))

        if advisory_id:
            query = query.where(AdvisoryAuditLog.advisory_id == advisory_id)
        if farmer_id:
            query = query.where(AdvisoryAuditLog.farmer_id == farmer_id)
        if farm_id:
            query = query.where(AdvisoryAuditLog.farm_id == farm_id)
        if event_type:
            query = query.where(AdvisoryAuditLog.event_type == event_type)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Paginate ordered by newest first
        query = (
            query.order_by(desc(AdvisoryAuditLog.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await db.execute(query)
        logs = list(result.scalars().all())
        return logs, total
