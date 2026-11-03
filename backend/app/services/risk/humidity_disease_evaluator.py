from typing import Any, Dict, List, Optional
from app.services.risk.risk_types import CategoryRiskAssessment, RiskLevel, score_to_level


class HumidityDiseaseRiskEvaluator:
    """Evaluates relative humidity and thermal indices conducive to foliar and fungal disease outbreak."""

    @classmethod
    def evaluate(
        cls,
        relative_humidity_pct: float,
        temperature_c: float,
        precipitation_mm: float,
        crop_name: str,
        stage_name: str,
    ) -> CategoryRiskAssessment:
        drivers: List[str] = []
        base_score = 0.0

        # Fungal sporulation accelerates above 75% RH, especially with free moisture (rain)
        if relative_humidity_pct >= 85.0:
            base_score += 45.0
            drivers.append(f"Very high relative humidity ({relative_humidity_pct:.0f}%) promotes prolonged leaf wetness")
        elif relative_humidity_pct >= 70.0:
            base_score += 25.0
            drivers.append(f"Elevated relative humidity ({relative_humidity_pct:.0f}%)")
        elif relative_humidity_pct <= 40.0:
            base_score += 5.0
            drivers.append(f"Dry atmospheric humidity ({relative_humidity_pct:.0f}%) suppresses fungal spore germination")
        else:
            base_score += 15.0

        # Thermal comfort zone for major agricultural pathogens: 18°C to 28°C
        if 18.0 <= temperature_c <= 28.0:
            base_score += 25.0
            drivers.append(f"Ambient temperature ({temperature_c:.1f}°C) lies directly within optimal pathogen incubation range (18-28°C)")
        elif temperature_c > 35.0 or temperature_c < 12.0:
            base_score = max(0.0, base_score - 15.0)
            drivers.append(f"Temperature extremes ({temperature_c:.1f}°C) inhibit standard fungal proliferation")

        # Moisture presence
        if precipitation_mm > 5.0:
            base_score += 15.0
            drivers.append("Surface precipitation creates free water film on leaf canopy")

        # Crop-specific disease sensitivity
        crop_lower = crop_name.lower()
        if "tomato" in crop_lower:
            base_score += 10.0
            drivers.append("Tomato foliage is susceptible to Early/Late Blight (Phytophthora) and Septoria leaf spot")
        elif "rice" in crop_lower:
            if relative_humidity_pct > 80.0 and 20.0 <= temperature_c <= 28.0:
                base_score += 10.0
                drivers.append("High humidity coupled with moderate warmth creates favorable microclimate for Rice Blast")

        final_score = min(100.0, max(0.0, round(base_score, 1)))
        level = score_to_level(final_score)

        if final_score < 30.0:
            explanation = f"Fungal and foliar disease risk for {crop_name} is LOW ({final_score}/100). Micro-climate discourages pathogen spread."
        elif final_score < 60.0:
            explanation = f"Disease-conducive risk for {crop_name} is MODERATE ({final_score}/100). Monitor canopy for early fungal lesions."
        elif final_score < 80.0:
            explanation = f"Disease-conducive conditions for {crop_name} are HIGH ({final_score}/100). High humidity and leaf wetness favor pathogen outbreak."
        else:
            explanation = f"Disease risk for {crop_name} is CRITICAL ({final_score}/100). Microclimate is primed for rapid fungal/bacterial epidemic."

        return CategoryRiskAssessment(
            category_name="High Humidity & Disease Conditions",
            score=final_score,
            level=level,
            is_available=True,
            driver_factors=drivers,
            explanation=explanation,
            recommendation_hint="Avoid overhead irrigation; ensure canopy aeration; consider prophylactic bio-fungicide or copper spray.",
        )

