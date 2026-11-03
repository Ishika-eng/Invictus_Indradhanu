from typing import Any, Dict, List, Optional
from app.services.risk.risk_types import CategoryRiskAssessment, RiskLevel, score_to_level


class RainfallRiskEvaluator:
    """Evaluates precipitation intensity, flooding, and waterlogging risks against crop phenology."""

    @classmethod
    def evaluate(
        cls,
        precip_24h_mm: float,
        precip_7d_sum_mm: float,
        rain_probability_pct: float,
        crop_name: str,
        water_demand: str,
        stage_name: str,
        water_sensitivity: str,
        soil_type: str = "Black Clay Soil",
    ) -> CategoryRiskAssessment:
        drivers: List[str] = []
        base_score = 0.0

        # 1. Immediate 24h rainfall volume
        if precip_24h_mm >= 50.0:
            base_score += 55.0
            drivers.append(f"Heavy 24h rainfall volume ({precip_24h_mm:.1f} mm)")
        elif precip_24h_mm >= 25.0:
            base_score += 35.0
            drivers.append(f"Moderate to heavy 24h rainfall ({precip_24h_mm:.1f} mm)")
        elif precip_24h_mm >= 10.0:
            base_score += 20.0
            drivers.append(f"Light to moderate rainfall ({precip_24h_mm:.1f} mm)")
        elif precip_24h_mm > 0.0:
            base_score += 5.0

        # 2. 7-Day Cumulative Rainfall Load
        if precip_7d_sum_mm >= 120.0:
            base_score += 25.0
            drivers.append(f"Severe 7-day cumulative rainfall load ({precip_7d_sum_mm:.1f} mm)")
        elif precip_7d_sum_mm >= 60.0:
            base_score += 15.0
            drivers.append(f"Elevated 7-day cumulative rainfall ({precip_7d_sum_mm:.1f} mm)")

        # 3. Probability factor
        if rain_probability_pct >= 80.0:
            base_score += 10.0
            drivers.append(f"High precipitation probability ({rain_probability_pct:.0f}%)")
        elif rain_probability_pct >= 50.0:
            base_score += 5.0

        # 4. Crop & Stage Phenology Sensitivity Adjustments
        sensitivity_lower = water_sensitivity.lower()
        crop_lower = crop_name.lower()

        # Rice tolerates standing water during vegetative stages
        if "rice" in crop_lower or "paddy" in crop_lower:
            if "harvest" in stage_name.lower():
                base_score += 25.0
                drivers.append("Rice at harvesting is highly vulnerable to grain discoloration and lodging from rainfall")
            else:
                base_score *= 0.5  # Rice welcomes substantial rainfall during tillering/vegetative
                drivers.append("Rice crop profile has high water tolerance during vegetative phases")
        else:
            # Sensitive crops like Tomato, Cotton, Maize cannot tolerate waterlogging
            if "critical" in sensitivity_lower:
                base_score *= 1.35
                drivers.append(f"Stage '{stage_name}' has critical water sensitivity: waterlogging triggers root asphyxiation")
            elif "high" in sensitivity_lower:
                base_score *= 1.2

        # 5. Soil Type Drainage characteristics
        if "clay" in soil_type.lower() or "vertisol" in soil_type.lower():
            if precip_24h_mm >= 15.0 or precip_7d_sum_mm >= 40.0:
                base_score += 10.0
                drivers.append(f"Slow-draining {soil_type} exacerbates root-zone waterlogging")

        final_score = min(100.0, max(0.0, round(base_score, 1)))
        level = score_to_level(final_score)

        if final_score < 30.0:
            explanation = (
                f"Rainfall risk for {crop_name} is LOW ({final_score}/100). "
                f"Forecast indicates negligible or manageable precipitation ({precip_24h_mm:.1f} mm in 24h)."
            )
        elif final_score < 60.0:
            explanation = (
                f"Rainfall risk for {crop_name} is MODERATE ({final_score}/100). "
                f"Expected rainfall ({precip_24h_mm:.1f} mm) may require monitoring drainage furrows."
            )
        elif final_score < 80.0:
            explanation = (
                f"Rainfall risk for {crop_name} is HIGH ({final_score}/100). "
                f"Precipitation ({precip_24h_mm:.1f} mm / 24h, {precip_7d_sum_mm:.1f} mm / 7d) threatens field operations and root health."
            )
        else:
            explanation = (
                f"Rainfall and waterlogging risk for {crop_name} is CRITICAL ({final_score}/100). "
                f"Severe precipitation event ({precip_24h_mm:.1f} mm) poses immediate threat of waterlogging and crop damage."
            )

        return CategoryRiskAssessment(
            category_name="Rainfall & Waterlogging Risk",
            score=final_score,
            level=level,
            is_available=True,
            driver_factors=drivers,
            explanation=explanation,
            recommendation_hint="Ensure field drainage trenches are clear; pause fertilizer application if heavy rain is imminent.",
        )

