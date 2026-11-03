from typing import Any, Dict, List, Optional
from app.services.risk.risk_types import CategoryRiskAssessment, RiskLevel, score_to_level


class SoilMoistureRiskEvaluator:
    """Evaluates root-zone soil moisture deficit and excess saturation.
    
    CRITICAL COMPLIANCE:
    If no physical IoT sensor probe is installed on the farm plot, soil moisture risk
    MUST be marked as unavailable (is_available=False, score=None). It must NEVER
    invent fictitious numbers or represent modelled reanalysis as ground truth sensor data.
    """

    @classmethod
    def evaluate(
        cls,
        in_situ_moisture_pct: Optional[float],
        crop_name: str,
        stage_name: str,
        water_sensitivity: str = "Moderate",
        is_in_situ_sensor: bool = False,
    ) -> CategoryRiskAssessment:
        # Case 1: No physical in-situ sensor deployed on the plot
        if in_situ_moisture_pct is None or not is_in_situ_sensor:
            return CategoryRiskAssessment(
                category_name="Soil Moisture Deficit & Excess",
                score=None,
                level=RiskLevel.UNAVAILABLE,
                is_available=False,
                driver_factors=["No physical IoT soil probe registered on this plot"],
                explanation=(
                    "In-situ soil moisture risk assessment is marked as UNAVAILABLE because no physical "
                    "capacitive or FDR soil probe is deployed on this farm plot. To maintain scientific integrity, "
                    "soil moisture risk is excluded from composite weighting."
                ),
                recommendation_hint="Deploy IoT soil moisture hardware probe to enable live root-zone telemetry.",
            )

        # Case 2: Physical ground truth sensor is actively streaming
        drivers: List[str] = [f"In-situ ground probe reading: {in_situ_moisture_pct:.1f}% volumetric moisture"]
        score = 0.0

        if in_situ_moisture_pct < 25.0:
            score = 75.0 + min(25.0, (25.0 - in_situ_moisture_pct) * 2.5)
            drivers.append(f"Severe soil moisture deficit ({in_situ_moisture_pct:.1f}%): approaching permanent wilting point")
        elif in_situ_moisture_pct < 40.0:
            score = 45.0 + ((40.0 - in_situ_moisture_pct) * 2.0)
            drivers.append(f"Depleted soil moisture ({in_situ_moisture_pct:.1f}%): irrigation advised")
        elif in_situ_moisture_pct > 85.0:
            score = 70.0 + min(30.0, (in_situ_moisture_pct - 85.0) * 2.0)
            drivers.append(f"Excessive root-zone saturation ({in_situ_moisture_pct:.1f}%): root asphyxiation risk")
        elif in_situ_moisture_pct > 75.0:
            score = 35.0
            drivers.append(f"Elevated moisture ({in_situ_moisture_pct:.1f}%): near field capacity")
        else:
            score = 10.0
            drivers.append(f"Optimal available water capacity ({in_situ_moisture_pct:.1f}%)")

        final_score = min(100.0, max(0.0, round(score, 1)))
        level = score_to_level(final_score)

        return CategoryRiskAssessment(
            category_name="Soil Moisture Deficit & Excess",
            score=final_score,
            level=level,
            is_available=True,
            driver_factors=drivers,
            explanation=f"Physical ground probe indicates {in_situ_moisture_pct:.1f}% soil moisture for {crop_name}.",
            recommendation_hint="Irrigate if deficit; check drainage if saturated.",
        )
