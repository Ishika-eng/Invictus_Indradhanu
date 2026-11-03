from typing import Any, Dict, List, Optional, Tuple
from app.services.risk.risk_types import CategoryRiskAssessment, RiskLevel, score_to_level


class TemperatureRiskEvaluator:
    """Evaluates crop thermal stresses: heat stress and low-temperature/chilling injury."""

    @classmethod
    def evaluate_heat_stress(
        cls,
        temp_max_c: float,
        crop_name: str,
        stage_name: str,
        temp_optimal_max_c: Optional[float] = 30.0,
        temp_critical_max_c: Optional[float] = 35.0,
    ) -> CategoryRiskAssessment:
        optimal_max = temp_optimal_max_c or 30.0
        critical_max = temp_critical_max_c or 35.0

        drivers: List[str] = []
        base_score = 0.0

        if temp_max_c <= optimal_max:
            base_score = max(0.0, (temp_max_c / optimal_max) * 20.0)
            drivers.append(f"Maximum temperature ({temp_max_c:.1f}°C) is within optimal range (<= {optimal_max}°C)")
        elif temp_max_c < critical_max:
            # Linear scaling between 30 and 65
            ratio = (temp_max_c - optimal_max) / max(1.0, (critical_max - optimal_max))
            base_score = 30.0 + (ratio * 35.0)
            drivers.append(f"Maximum temperature ({temp_max_c:.1f}°C) exceeds optimal threshold ({optimal_max}°C)")
        else:
            # Critical heat threshold exceeded
            excess = temp_max_c - critical_max
            base_score = min(100.0, 70.0 + (excess * 8.0))
            drivers.append(f"Maximum temperature ({temp_max_c:.1f}°C) exceeds agronomic critical limit ({critical_max}°C)")

        # Stage specific modifiers
        stage_lower = stage_name.lower()
        if "flowering" in stage_lower or "anthesis" in stage_lower:
            if temp_max_c >= critical_max:
                base_score = min(100.0, base_score + 15.0)
                drivers.append(f"Flowering phase is acutely vulnerable to heat-induced pollen desiccation and blossom drop")
        elif "grain filling" in stage_lower or "dough" in stage_lower:
            if temp_max_c >= 32.0 and "wheat" in crop_name.lower():
                base_score = min(100.0, base_score + 20.0)
                drivers.append("Wheat grain-filling phase under >32°C induces severe terminal heat and forced maturity")

        final_score = min(100.0, max(0.0, round(base_score, 1)))
        level = score_to_level(final_score)

        if final_score < 30.0:
            explanation = f"Heat stress for {crop_name} is LOW ({final_score}/100). Peak temperature ({temp_max_c:.1f}°C) is favorable."
        elif final_score < 60.0:
            explanation = f"Heat stress for {crop_name} is MODERATE ({final_score}/100). Temperatures are elevated above optimal range."
        elif final_score < 80.0:
            explanation = f"Heat stress for {crop_name} is HIGH ({final_score}/100). Peak temperature ({temp_max_c:.1f}°C) approaches critical limits."
        else:
            explanation = f"Heat stress for {crop_name} is CRITICAL ({final_score}/100). Extreme heat ({temp_max_c:.1f}°C) triggers physiological damage."

        return CategoryRiskAssessment(
            category_name="Heat Stress",
            score=final_score,
            level=level,
            is_available=True,
            driver_factors=drivers,
            explanation=explanation,
            recommendation_hint="Maintain light root-zone irrigation to buffer soil temperature; apply mulch if possible.",
        )

    @classmethod
    def evaluate_cold_stress(
        cls,
        temp_min_c: float,
        crop_name: str,
        stage_name: str,
        temp_optimal_min_c: Optional[float] = 15.0,
        temp_critical_min_c: Optional[float] = 10.0,
    ) -> CategoryRiskAssessment:
        optimal_min = temp_optimal_min_c or 15.0
        critical_min = temp_critical_min_c or 10.0

        drivers: List[str] = []
        base_score = 0.0

        if temp_min_c >= optimal_min:
            base_score = 5.0
            drivers.append(f"Minimum temperature ({temp_min_c:.1f}°C) is above optimal minimum ({optimal_min}°C)")
        elif temp_min_c > critical_min:
            deficit = optimal_min - temp_min_c
            span = max(1.0, optimal_min - critical_min)
            base_score = 25.0 + ((deficit / span) * 35.0)
            drivers.append(f"Minimum temperature ({temp_min_c:.1f}°C) is cool, below optimal ({optimal_min}°C)")
        else:
            deficit = critical_min - temp_min_c
            base_score = min(100.0, 65.0 + (deficit * 8.0))
            drivers.append(f"Minimum temperature ({temp_min_c:.1f}°C) falls below critical lower threshold ({critical_min}°C)")

        # Warm-season crops like Cotton, Tomato, Sugarcane suffer cold shock
        crop_lower = crop_name.lower()
        if ("cotton" in crop_lower or "tomato" in crop_lower or "sugarcane" in crop_lower) and temp_min_c < 12.0:
            base_score = min(100.0, base_score + 15.0)
            drivers.append(f"Tropical/warm-season crop {crop_name} experiences severe metabolic inhibition below 12°C")

        final_score = min(100.0, max(0.0, round(base_score, 1)))
        level = score_to_level(final_score)

        if final_score < 30.0:
            explanation = f"Cold stress for {crop_name} is LOW ({final_score}/100). Minimum temperature ({temp_min_c:.1f}°C) is safe."
        elif final_score < 60.0:
            explanation = f"Cold stress for {crop_name} is MODERATE ({final_score}/100). Cool night temperatures may slow vegetative vigor."
        elif final_score < 80.0:
            explanation = f"Cold stress for {crop_name} is HIGH ({final_score}/100). Temperatures ({temp_min_c:.1f}°C) risk chilling damage."
        else:
            explanation = f"Cold stress for {crop_name} is CRITICAL ({final_score}/100). Severe cold/frost hazard ({temp_min_c:.1f}°C)."

        return CategoryRiskAssessment(
            category_name="Low-Temperature Stress",
            score=final_score,
            level=level,
            is_available=True,
            driver_factors=drivers,
            explanation=explanation,
            recommendation_hint="Ensure evening soil moisture retention to insulate root crown from cold night air.",
        )

