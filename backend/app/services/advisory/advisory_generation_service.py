from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop import Crop, CropGrowthStage
from app.models.farm_crop import FarmCrop
from app.models.risk import RiskAssessment
from app.models.advisory import Advisory
from app.core.exceptions import EntityNotFoundException
from app.core.logging import logger
from app.services.farm_service import FarmService
from app.services.climate.climate_aggregation_service import ClimateAggregationService
from app.services.risk.risk_assessment_service import RiskAssessmentService
from app.services.advisory.advisory_types import (
    AdvisoryCategory,
    ActionUrgency,
    AgronomicDirective,
    FarmerAdvisoryOutput,
)
from app.services.advisory.rules_engine import AdvisoryRulesEngine
from app.services.advisory.gemini_service import GeminiAdvisoryService


class AdvisoryGenerationService:
    """End-to-end service for AI-powered agricultural advisory formulation and persistence."""

    @classmethod
    async def generate_advisory(
        cls,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        language: Optional[str] = None,
        crop_id: Optional[uuid.UUID] = None,
        stage_id: Optional[uuid.UUID] = None,
    ) -> Advisory:
        """Evaluates live risks, runs rules engine, generates multilingual explanation, and stores advisory."""
        # 1. Enforce farm ownership & fetch farmer
        farm = await FarmService.get_by_farmer_and_id(db, farmer_id, farm_id)
        farmer_res = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
        farmer = farmer_res.scalar_one_or_none()
        if not farmer:
            raise EntityNotFoundException("Farmer record not found")

        target_lang = (language or farmer.preferred_language or "en").lower()

        # 2. Resolve target crop and stage
        target_crop: Optional[Crop] = None
        target_stage: Optional[CropGrowthStage] = None

        if crop_id:
            crop_res = await db.execute(
                select(Crop).options(selectinload(Crop.growth_stages)).where(Crop.id == crop_id)
            )
            target_crop = crop_res.scalar_one_or_none()

        if not target_crop and farm.active_crop_id:
            crop_res = await db.execute(
                select(Crop).options(selectinload(Crop.growth_stages)).where(Crop.id == farm.active_crop_id)
            )
            target_crop = crop_res.scalar_one_or_none()

        if not target_crop:
            farm_crop_res = await db.execute(
                select(FarmCrop)
                .options(selectinload(FarmCrop.crop).selectinload(Crop.growth_stages))
                .where(FarmCrop.farm_id == farm_id, FarmCrop.status == "active")
            )
            active_fc = farm_crop_res.scalars().first()
            if active_fc:
                target_crop = active_fc.crop

        if not target_crop:
            # Fallback to Tomato or first crop in catalog
            catalog_crop = await db.execute(
                select(Crop).options(selectinload(Crop.growth_stages)).order_by(Crop.name)
            )
            target_crop = catalog_crop.scalars().first()

        crop_name = target_crop.name if target_crop else "Tomato"

        # Resolve Stage
        if stage_id and target_crop:
            target_stage = next((s for s in target_crop.growth_stages if s.id == stage_id), None)

        if not target_stage and farm.active_stage_id and target_crop:
            target_stage = next((s for s in target_crop.growth_stages if s.id == farm.active_stage_id), None)

        if not target_stage and target_crop and target_crop.growth_stages:
            target_stage = (
                next((s for s in target_crop.growth_stages if s.stage_order == 3), None)
                or target_crop.growth_stages[0]
            )

        stage_name = target_stage.stage_name if target_stage else "Vegetative Growth"

        # 3. Retrieve Live Environmental Telemetry & Risk Assessment
        current_data = await ClimateAggregationService.get_current_weather(db, farm_id)
        forecast_data = await ClimateAggregationService.get_forecast(db, farm_id)

        current_weather = current_data.get("current", {})
        daily_forecast = forecast_data.get("daily_forecast", [])
        sensor_info = current_data.get("soil_sensor", {})
        has_sensor = bool(sensor_info.get("installed", False))

        # Run or retrieve latest risk assessment
        risk_result = await RiskAssessmentService.evaluate_farm_risk(
            db=db,
            farmer_id=farmer_id,
            farm_id=farm_id,
            crop_id=target_crop.id if target_crop else None,
            stage_id=target_stage.id if target_stage else None,
        )

        risk_assessment_id = None
        if risk_result.get("assessment_id"):
            try:
                risk_assessment_id = uuid.UUID(risk_result["assessment_id"])
            except ValueError:
                pass

        risk_scores = risk_result.get("category_scores", {})

        # 4. Execute Deterministic Agronomic Rules Engine
        directives = AdvisoryRulesEngine.evaluate_directives(
            crop_name=crop_name,
            stage_name=stage_name,
            risk_scores=risk_scores,
            current_weather=current_weather,
            daily_forecast=daily_forecast,
            soil_type=farm.soil_type,
            soil_sensor_available=has_sensor,
        )

        if not directives:
            # Baseline directive if conditions are completely neutral
            directives = [
                AgronomicDirective(
                    category=AdvisoryCategory.GENERAL_MANAGEMENT,
                    urgency=ActionUrgency.NEXT_FEW_DAYS,
                    immediate_action=f"Continue routine field monitoring for {crop_name}.",
                    why_it_matters="Environmental indicators are within safe ranges for current growth.",
                    recommended_timing="Next 24 to 48 hours",
                    risk_if_ignored="Neglect of routine pest checks may delay early detection.",
                    action_steps=["Scout field boundaries", "Maintain planned cultural practices"],
                    supporting_evidence=["All risk indices below 30.0 (LOW)"],
                    confidence_pct=95.0,
                )
            ]

        primary_directive = directives[0]
        secondary_directives = directives[1:]

        # 5. Multilingual AI Explanation Layer (Gemini + Deterministic Fallback)
        advisory_output: FarmerAdvisoryOutput = await GeminiAdvisoryService.generate_advisory_explanation(
            primary_directive=primary_directive,
            secondary_directives=secondary_directives,
            target_lang=target_lang,
            crop_name=crop_name,
            stage_name=stage_name,
            farmer_name=farmer.full_name,
            location_str=f"{farm.name}, {farmer.village}, {farmer.district}",
        )

        # Flag low-confidence advisories for human agricultural expert review
        needs_review = (advisory_output.confidence_pct < 80.0) or primary_directive.needs_expert_review

        # 6. Persist Advisory Entity in PostgreSQL
        advisory = Advisory(
            farmer_id=farmer.id,
            farm_id=farm.id,
            crop_id=target_crop.id if target_crop else uuid.uuid4(),
            growth_stage_id=target_stage.id if target_stage else None,
            risk_assessment_id=risk_assessment_id,
            status="GENERATED",
            language=target_lang,
            confidence_pct=advisory_output.confidence_pct,
            immediate_action=advisory_output.immediate_action,
            why_it_matters=advisory_output.why_it_matters,
            recommended_timing=advisory_output.recommended_timing,
            risk_if_ignored=advisory_output.risk_if_ignored,
            projected_impact=advisory_output.projected_impact,
            action_steps=advisory_output.action_steps,
            scientific_reasoning=advisory_output.scientific_reasoning,
            supporting_evidence=advisory_output.supporting_evidence,
            data_limitations=advisory_output.data_limitations,
            model_version=advisory_output.model_version,
            disclaimer=advisory_output.disclaimer,
            needs_expert_review=needs_review,
            translations={
                target_lang: {
                    "immediate_action": advisory_output.immediate_action,
                    "why_it_matters": advisory_output.why_it_matters,
                    "recommended_timing": advisory_output.recommended_timing,
                    "risk_if_ignored": advisory_output.risk_if_ignored,
                }
            },
        )

        db.add(advisory)
        await db.commit()
        await db.refresh(advisory)

        return advisory

    @classmethod
    async def get_latest_for_farm(
        cls,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        language: Optional[str] = None,
    ) -> Advisory:
        """Retrieves most recent advisory or generates a fresh one."""
        await FarmService.get_by_farmer_and_id(db, farmer_id, farm_id)

        result = await db.execute(
            select(Advisory)
            .options(
                selectinload(Advisory.crop),
                selectinload(Advisory.growth_stage),
                selectinload(Advisory.risk_assessment),
                selectinload(Advisory.delivery_logs),
            )
            .where(Advisory.farm_id == farm_id)
            .order_by(Advisory.created_at.desc())
        )
        latest = result.scalars().first()

        if not latest or (language and latest.language != language.lower()):
            return await cls.generate_advisory(
                db=db,
                farmer_id=farmer_id,
                farm_id=farm_id,
                language=language,
            )

        return latest
