from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farm import Farm
from app.models.crop import Crop, CropGrowthStage
from app.models.farm_crop import FarmCrop
from app.models.risk import RiskAssessment
from app.core.exceptions import EntityNotFoundException
from app.core.logging import logger
from app.services.farm_service import FarmService
from app.services.climate.climate_aggregation_service import ClimateAggregationService
from app.services.risk.risk_engine import CropRiskEngine


class RiskAssessmentService:
    """Manages agricultural risk evaluations, storage, and retrieval."""

    @classmethod
    async def evaluate_farm_risk(
        cls,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        crop_id: Optional[uuid.UUID] = None,
        stage_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """Runs the CropRiskEngine on live climate inputs and stores the assessment in PostgreSQL."""
        # 1. Enforce farm ownership and retrieve farm with relationships
        farm = await FarmService.get_by_farmer_and_id(db, farmer_id, farm_id)

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
            # Check farm_crops
            farm_crop_res = await db.execute(
                select(FarmCrop).options(selectinload(FarmCrop.crop).selectinload(Crop.growth_stages)).where(FarmCrop.farm_id == farm_id, FarmCrop.status == "active")
            )
            active_fc = farm_crop_res.scalars().first()
            if active_fc:
                target_crop = active_fc.crop

        if not target_crop:
            # Fallback to default crop (e.g. Tomato) from catalog
            first_crop_res = await db.execute(
                select(Crop).options(selectinload(Crop.growth_stages)).order_by(Crop.name)
            )
            target_crop = first_crop_res.scalars().first()

        crop_name = target_crop.name if target_crop else "Tomato"

        # Resolve Stage
        if stage_id and target_crop:
            target_stage = next((s for s in target_crop.growth_stages if s.id == stage_id), None)

        if not target_stage and farm.active_stage_id and target_crop:
            target_stage = next((s for s in target_crop.growth_stages if s.id == farm.active_stage_id), None)

        if not target_stage and target_crop and target_crop.growth_stages:
            # Default to vegetative or mid-phase
            target_stage = (
                next((s for s in target_crop.growth_stages if s.stage_order == 3), None)
                or target_crop.growth_stages[0]
            )

        stage_name = target_stage.stage_name if target_stage else "Vegetative Growth"

        # 3. Retrieve Live Environmental Data
        current_data = await ClimateAggregationService.get_current_weather(db, farm_id)
        forecast_data = await ClimateAggregationService.get_forecast(db, farm_id)

        current_weather = current_data.get("current", {})
        daily_forecast = forecast_data.get("daily_forecast", [])

        crop_dict = {
            "water_demand": target_crop.water_demand if target_crop else "Moderate",
            "temp_optimal_max_c": target_crop.temp_optimal_max_c if target_crop else 30.0,
            "temp_max_c": target_crop.temp_max_c if target_crop else 35.0,
            "temp_optimal_min_c": target_crop.temp_optimal_min_c if target_crop else 15.0,
            "temp_min_c": target_crop.temp_min_c if target_crop else 10.0,
        }

        stage_dict = {
            "water_sensitivity": target_stage.water_sensitivity if target_stage else "Moderate",
            "temp_critical_max_c": target_stage.temp_critical_max_c if target_stage else None,
            "temp_critical_min_c": target_stage.temp_critical_min_c if target_stage else None,
        }

        # 4. Execute Algorithmic Risk Evaluation
        eval_result = CropRiskEngine.evaluate_farm_crop_risk(
            crop_name=crop_name,
            stage_name=stage_name,
            current_weather=current_weather,
            daily_forecast=daily_forecast,
            crop_profile=crop_dict,
            stage_profile=stage_dict,
            soil_type=farm.soil_type,
            in_situ_moisture_pct=None,  # No physical probe installed
            is_in_situ_sensor=False,
        )

        # 5. Persist Assessment in PostgreSQL
        farm_id_str = str(farm.id)
        farm_name_str = farm.name
        farm_id_uuid = farm.id
        crop_id_uuid = target_crop.id if target_crop else None
        stage_id_uuid = target_stage.id if target_stage else None

        cat_scores = eval_result["category_scores"]
        snapshot = dict(eval_result["input_snapshot"])
        snapshot["categories_cache"] = eval_result["categories"]

        assessment = RiskAssessment(
            farm_id=farm_id_uuid,
            crop_id=crop_id_uuid,
            growth_stage_id=stage_id_uuid,
            assessment_time=datetime.now(timezone.utc),
            overall_risk_score=eval_result["overall_risk_score"],
            overall_risk_level=eval_result["overall_risk_level"],
            rainfall_risk_score=cat_scores["rainfall"] or 0.0,
            waterlogging_risk_score=cat_scores["rainfall"] or 0.0,
            heat_risk_score=cat_scores["heat"] or 0.0,
            cold_risk_score=cat_scores["cold"] or 0.0,
            temperature_risk_score=max(cat_scores["heat"] or 0.0, cat_scores["cold"] or 0.0),
            humidity_disease_risk_score=cat_scores["disease"] or 0.0,
            wind_risk_score=cat_scores["wind"] or 0.0,
            soil_moisture_risk_score=None,  # Not fabricated
            confidence_level=eval_result["confidence_level"],
            scoring_methodology=eval_result["scoring_methodology"],
            risk_factors=eval_result["contributing_factors"],
            daily_timeline=eval_result["daily_timeline"],
            input_snapshot=snapshot,
        )
        db.add(assessment)
        await db.commit()
        await db.refresh(assessment)

        eval_result["assessment_id"] = str(assessment.id)
        eval_result["farm_id"] = farm_id_str
        eval_result["farm_name"] = farm_name_str
        return eval_result

    @classmethod
    async def get_latest_for_farm(
        cls,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """Retrieves the most recent risk assessment or evaluates a fresh one."""
        farm = await FarmService.get_by_farmer_and_id(db, farmer_id, farm_id)
        farm_name_str = farm.name

        result = await db.execute(
            select(RiskAssessment)
            .options(selectinload(RiskAssessment.crop), selectinload(RiskAssessment.growth_stage))
            .where(RiskAssessment.farm_id == farm_id)
            .order_by(RiskAssessment.assessment_time.desc())
        )
        latest = result.scalars().first()

        # If no assessment exists yet, run an immediate evaluation
        if not latest:
            return await cls.evaluate_farm_risk(db, farmer_id, farm_id)

        categories = None
        if latest.input_snapshot and isinstance(latest.input_snapshot, dict):
            categories = latest.input_snapshot.get("categories_cache")

        return {
            "assessment_id": str(latest.id),
            "farm_id": str(latest.farm_id),
            "farm_name": farm_name_str,
            "overall_risk_score": latest.overall_risk_score,
            "overall_risk_level": latest.overall_risk_level,
            "confidence_level": latest.confidence_level,
            "scoring_methodology": latest.scoring_methodology,
            "crop_evaluated": latest.crop.name if latest.crop else "General Crop",
            "growth_stage_evaluated": latest.growth_stage.stage_name if latest.growth_stage else "Active Phase",
            "assessment_timestamp": latest.assessment_time.isoformat(),
            "category_scores": {
                "rainfall": latest.rainfall_risk_score,
                "heat": latest.heat_risk_score,
                "cold": latest.cold_risk_score,
                "disease": latest.humidity_disease_risk_score,
                "wind": latest.wind_risk_score,
                "soil_moisture": latest.soil_moisture_risk_score,
            },
            "categories": categories,
            "contributing_factors": latest.risk_factors or [],
            "daily_timeline": latest.daily_timeline or [],
            "input_snapshot": latest.input_snapshot or {},
        }

    @classmethod
    async def get_timeline(
        cls,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
    ) -> List[Dict[str, Any]]:
        """Retrieves the 7-day risk projection timeline for a farm."""
        latest = await cls.get_latest_for_farm(db, farmer_id, farm_id)
        return latest.get("daily_timeline", [])

    @classmethod
    async def get_history(
        cls,
        db: AsyncSession,
        farmer_id: uuid.UUID,
        farm_id: uuid.UUID,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Retrieves historical risk assessments for a farm."""
        await FarmService.get_by_farmer_and_id(db, farmer_id, farm_id)

        result = await db.execute(
            select(RiskAssessment)
            .options(selectinload(RiskAssessment.crop), selectinload(RiskAssessment.growth_stage))
            .where(RiskAssessment.farm_id == farm_id)
            .order_by(RiskAssessment.assessment_time.desc())
            .limit(limit)
        )
        assessments = result.scalars().all()

        return [
            {
                "assessment_id": str(a.id),
                "farm_id": str(a.farm_id),
                "overall_risk_score": a.overall_risk_score,
                "overall_risk_level": a.overall_risk_level,
                "confidence_level": a.confidence_level,
                "scoring_methodology": a.scoring_methodology,
                "crop_evaluated": a.crop.name if a.crop else "General Crop",
                "growth_stage_evaluated": a.growth_stage.stage_name if a.growth_stage else "Active Phase",
                "assessment_timestamp": a.assessment_time.isoformat(),
                "category_scores": {
                    "rainfall": a.rainfall_risk_score,
                    "heat": a.heat_risk_score,
                    "cold": a.cold_risk_score,
                    "disease": a.humidity_disease_risk_score,
                    "wind": a.wind_risk_score,
                    "soil_moisture": a.soil_moisture_risk_score,
                },
                "contributing_factors": a.risk_factors or [],
            }
            for a in assessments
        ]
