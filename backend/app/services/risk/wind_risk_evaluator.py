from typing import Any, Dict, List, Optional
from app.services.risk.risk_types import CategoryRiskAssessment, RiskLevel, score_to_level


class WindRiskEvaluator:
    """Evaluates wind velocity against crop canopy lodging, spray drift, and mechanical flower shedding."""

    @classmethod
    def evaluate(
        cls,
        wind_speed_kmh: float,
        crop_name: str,
        stage_name: str,
    ) -> CategoryRiskAssessment:
        drivers: List[str] = []
        base_score = 0.0

        if wind_speed_kmh >= 50.0:
            base_score = 85.0
            drivers.append(f"Gale or violent gusts ({wind_speed_kmh:.1f} km/h) risk physical stem snapping and lodging")
        elif wind_speed_kmh >= 35.0:
            base_score = 65.0
            drivers.append(f"Strong winds ({wind_speed_kmh:.1f} km/h) make foliar spraying unviable and cause mechanical flower drop")
        elif wind_speed_kmh >= 20.0:
            base_score = 35.0
            drivers.append(f"Moderate breeze ({wind_speed_kmh:.1f} km/h) causes noticeable spray drift")
        else:
            base_score = max(5.0, (wind_speed_kmh / 20.0) * 15.0)
            drivers.append(f"Gentle wind ({wind_speed_kmh:.1f} km/h) is favorable for field operations")

        # Crop & stage vulnerabilities to wind lodging
        crop_lower = crop_name.lower()
        stage_lower = stage_name.lower()

        if ("maize" in crop_lower or "sugarcane" in crop_lower or "wheat" in crop_lower) and wind_speed_kmh >= 30.0:
            if any(s in stage_lower for s in ["heading", "ripening", "grand growth", "cob", "grain", "tassel", "silking", "vegetative"]):
                base_score = min(100.0, base_score + 15.0)
                drivers.append(f"Tall canopy of {crop_name} during '{stage_name}' has elevated center of gravity and high lodging risk")
        elif "tomato" in crop_lower and ("flowering" in stage_lower or "fruiting" in stage_lower):
            if wind_speed_kmh >= 25.0:
                base_score = min(100.0, base_score + 10.0)
                drivers.append("Winds >25 km/h cause petal desiccation and fruit branch abrasion")

        final_score = min(100.0, max(0.0, round(base_score, 1)))
        level = score_to_level(final_score)

        if final_score < 30.0:
            explanation = f"Wind risk for {crop_name} is LOW ({final_score}/100). Wind velocity ({wind_speed_kmh:.1f} km/h) is safe for spraying."
        elif final_score < 60.0:
            explanation = f"Wind risk for {crop_name} is MODERATE ({final_score}/100). Breezy conditions ({wind_speed_kmh:.1f} km/h); spray drift watch."
        elif final_score < 80.0:
            explanation = f"Wind risk for {crop_name} is HIGH ({final_score}/100). Strong gusts ({wind_speed_kmh:.1f} km/h); halt all spraying."
        else:
            explanation = f"Wind risk for {crop_name} is CRITICAL ({final_score}/100). Extreme wind speeds threaten crop lodging and mechanical loss."

        return CategoryRiskAssessment(
            category_name="High Wind Risk",
            score=final_score,
            level=level,
            is_available=True,
            driver_factors=drivers,
            explanation=explanation,
            recommendation_hint="Postpone foliar pesticide/fungicide applications; verify plant support stakes or earthing up.",
        )
