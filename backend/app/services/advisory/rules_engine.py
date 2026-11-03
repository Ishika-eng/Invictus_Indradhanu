from typing import Any, Dict, List, Optional
from app.services.advisory.advisory_types import (
    AdvisoryCategory,
    ActionUrgency,
    AgronomicDirective,
)


class AdvisoryRulesEngine:
    """Deterministic agricultural rules engine.
    
    Serves as the decision foundation. Converts verified crop-specific climate risks,
    meteorological telemetry, and phenological thresholds into approved agronomic directives.
    
    SAFETY COMPLIANCE:
    - Never recommends chemical pesticide dosages. Recommends bio-agents or refers to KVK/extension.
    - Never diagnoses crop disease from weather alone (frames as environmental favorability).
    - If in-situ soil moisture is unavailable, notes this limitation explicitly.
    - Resolves conflicting rules (e.g. holds spray if rain is coming, holds irrigation if rain is forecast).
    """

    DEFAULT_DISCLAIMER = (
        "Notice: This recommendation is an automated decision-support advisory grounded in biophysical models "
        "and meteorological forecasts. It does not replace on-ground agricultural inspection. For exact chemical dosages, "
        "always consult your local Krishi Vigyan Kendra (KVK) or government agricultural extension officer."
    )

    @classmethod
    def evaluate_directives(
        cls,
        crop_name: str,
        stage_name: str,
        risk_scores: Dict[str, Optional[float]],
        current_weather: Dict[str, Any],
        daily_forecast: List[Dict[str, Any]],
        soil_type: str = "Loam",
        soil_sensor_available: bool = False,
        crop_profile: Optional[Dict[str, Any]] = None,
        stage_profile: Optional[Dict[str, Any]] = None,
    ) -> List[AgronomicDirective]:
        directives: List[AgronomicDirective] = []

        # Extract telemetry
        t_current = float(current_weather.get("temperature_c", 28.0))
        humidity = float(current_weather.get("relative_humidity_pct", 65.0))
        precip_curr = float(current_weather.get("precipitation_mm", 0.0))
        wind_curr = float(current_weather.get("wind_speed_kmh", 12.0))

        # Forecast aggregates
        next_24h_rain = 0.0
        next_24h_prob = 0.0
        max_forecast_wind = 0.0
        max_forecast_temp = t_current

        if daily_forecast and len(daily_forecast) > 0:
            day1 = daily_forecast[0]
            next_24h_rain = float(day1.get("precipitation_mm", 0.0))
            next_24h_prob = float(day1.get("precipitation_probability_pct", 0.0))
            max_forecast_wind = max(float(d.get("wind_speed_max_kmh", 0.0)) for d in daily_forecast[:3])
            max_forecast_temp = max(float(d.get("temp_max_c", 30.0)) for d in daily_forecast[:3])

        # Category risk scores
        rain_risk = risk_scores.get("rainfall") or 0.0
        heat_risk = risk_scores.get("heat") or 0.0
        cold_risk = risk_scores.get("cold") or 0.0
        disease_risk = risk_scores.get("disease") or 0.0
        wind_risk = risk_scores.get("wind") or 0.0
        soil_risk = risk_scores.get("soil_moisture")

        soil_limitation = (
            None if soil_sensor_available
            else "In-situ capacitive soil sensor telemetry is unavailable on this plot. "
                 "Moisture recommendations are derived from atmospheric NWP precipitation forecasts; "
                 "confirm topsoil condition manually before pump operation."
        )

        crop_lower = crop_name.lower()
        stage_lower = stage_name.lower()

        # ==============================================================================
        # 1. WATER & IRRIGATION DIRECTIVES
        # ==============================================================================
        # Case 1A: Impending heavy rainfall or high waterlogging risk -> HOLD IRRIGATION
        if rain_risk >= 60.0 or next_24h_rain >= 15.0 or (next_24h_prob >= 65.0 and next_24h_rain >= 5.0):
            timing = "Next 24 to 48 hours"
            urgency = ActionUrgency.IMMEDIATE if next_24h_rain >= 25.0 else ActionUrgency.WITHIN_24H
            
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.IRRIGATION,
                urgency=urgency,
                priority=1,
                immediate_action=f"Pause and hold scheduled irrigation on {crop_name}.",
                why_it_matters=(
                    f"Substantial rainfall ({next_24h_rain:.1f}mm expected, {next_24h_prob:.0f}% probability) "
                    f"is forecast over the plot within 24 hours. Applying additional irrigation now would saturate "
                    f"the root zone, inducing root hypoxia and wasting energy."
                ),
                recommended_timing=timing,
                risk_if_ignored=(
                    f"Root-zone waterlogging, blossom drop in {stage_name}, increased fungal rot, and unnecessary electricity/water cost."
                ),
                projected_impact="Conserves ~3,500 to 5,000 liters of irrigation water per acre and preserves root aeration.",
                action_steps=[
                    "Turn off automatic drip pumps and canal sluice gates.",
                    "Verify field drainage outlets are unobstructed so storm runoff drains freely.",
                    "Re-evaluate soil moisture 24 hours after rainfall before restarting pumps."
                ],
                supporting_evidence=[
                    f"Forecast 24h precipitation: {next_24h_rain:.1f} mm ({next_24h_prob:.0f}% chance)",
                    f"Rainfall & waterlogging risk score: {rain_risk:.1f}/100",
                    f"Crop growth stage: '{stage_name}' with water demand sensitivity",
                ],
                data_limitations=soil_limitation,
                confidence_pct=94.0,
            ))

        # Case 1B: Heat Stress + Atmospheric Dryness -> LIGHT EARLY-MORNING IRRIGATION
        elif heat_risk >= 60.0 or (max_forecast_temp >= 35.0 and next_24h_rain < 2.0):
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.IRRIGATION,
                urgency=ActionUrgency.WITHIN_24H,
                priority=2,
                immediate_action=f"Apply light, cooling drip irrigation during early morning hours.",
                why_it_matters=(
                    f"Ambient temperatures are forecast to reach {max_forecast_temp:.1f}°C, exceeding optimal limits for {crop_name}. "
                    f"Early morning irrigation cools the root zone and prevents flower abortion or terminal heat stress."
                ),
                recommended_timing="Tomorrow morning between 5:30 AM and 8:30 AM (before sun peaks)",
                risk_if_ignored=f"Canopy wilting, flower desiccation in {stage_name}, and stunted development.",
                projected_impact="Maintains crop turgor pressure and prevents temperature-induced yield losses.",
                action_steps=[
                    "Schedule light irrigation for early morning (5:30 AM – 8:30 AM) to minimize midday evaporative loss.",
                    "Avoid flood irrigation during peak noon heat to prevent soil baking and root boiling.",
                    "If mulching is present, check that moisture penetrates through to the root zone."
                ],
                supporting_evidence=[
                    f"Peak forecast temperature: {max_forecast_temp:.1f}°C",
                    f"Heat stress index: {heat_risk:.1f}/100",
                    f"Zero significant rainfall forecast ({next_24h_rain:.1f} mm)",
                ],
                data_limitations=soil_limitation,
                confidence_pct=90.0,
            ))

        # Case 1C: Normal routine irrigation window
        else:
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.IRRIGATION,
                urgency=ActionUrgency.NEXT_FEW_DAYS,
                priority=4,
                immediate_action=f"Maintain standard scheduled irrigation regime for {crop_name}.",
                why_it_matters="Weather parameters remain moderate with no severe precipitation or heat shock anticipated.",
                recommended_timing="During calm morning or late afternoon hours",
                risk_if_ignored="Under-irrigation may delay vegetative canopy growth.",
                projected_impact="Ensures steady phenological progression toward maturity.",
                action_steps=[
                    "Maintain standard drip cycle according to soil type.",
                    "Check soil moisture by hand at 10cm depth before initiating pumping."
                ],
                supporting_evidence=[
                    f"Current temperature: {t_current:.1f}°C (Optimal)",
                    f"Rainfall forecast: {next_24h_rain:.1f} mm",
                ],
                data_limitations=soil_limitation,
                confidence_pct=88.0,
            ))

        # ==============================================================================
        # 2. PLANT PROTECTION & FOLIAR SPRAY DIRECTIVES
        # ==============================================================================
        # Case 2A: High Wind or Impending Rain -> HOLD FOLIAR SPRAY
        if wind_risk >= 50.0 or max_forecast_wind >= 22.0 or next_24h_rain >= 5.0 or next_24h_prob >= 45.0:
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.PLANT_PROTECTION,
                urgency=ActionUrgency.IMMEDIATE,
                priority=1,
                immediate_action="Hold and postpone all foliar spray and chemical application operations.",
                why_it_matters=(
                    f"Adverse atmospheric conditions (wind gusts up to {max_forecast_wind:.1f} km/h and {next_24h_prob:.0f}% rain chance) "
                    "cause severe chemical spray drift to non-target areas and immediate rain wash-off."
                ),
                recommended_timing="Postpone until winds subside below 15 km/h and rain passes",
                risk_if_ignored="Total loss of expensive chemical inputs, chemical drift hazard to neighboring crops, and zero efficacy.",
                projected_impact="Saves 100% of spraying operational costs and protects field workers from spray blowback.",
                action_steps=[
                    "Do not mix foliar spray solutions today.",
                    "Wait for calm morning weather (< 12 km/h wind) with clear skies.",
                    "Inspect crops for physical wind damage or lodging after gusts subside."
                ],
                supporting_evidence=[
                    f"Max wind velocity: {max_forecast_wind:.1f} km/h",
                    f"Precipitation probability: {next_24h_prob:.0f}%",
                    f"Wind risk index: {wind_risk:.1f}/100",
                ],
                data_limitations=None,
                confidence_pct=95.0,
            ))

        # Case 2B: High Humidity Fungal Window + Calm Conditions -> PREVENTIVE BIO-SPRAY
        elif disease_risk >= 60.0 or (humidity >= 75.0 and 18.0 <= t_current <= 28.0):
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.PLANT_PROTECTION,
                urgency=ActionUrgency.WITHIN_24H,
                priority=2,
                immediate_action="Inspect crop canopy for fungal symptoms and prepare preventive biological spray.",
                why_it_matters=(
                    f"Prolonged high humidity ({humidity:.0f}%) and moderate temperature ({t_current:.1f}°C) create an ideal microclimate "
                    f"for fungal spore germination and foliar blight in {crop_name}."
                ),
                recommended_timing="Tomorrow morning between 6:30 AM and 9:00 AM (under calm wind)",
                risk_if_ignored="Rapid spread of foliar fungal pathogens leading to leaf spot, blight, and reduced photosynthesis.",
                projected_impact="Halts pathogen colonization before symptoms visibly degrade crop yield.",
                action_steps=[
                    "Scout lower leaves for early water-soaked spots, white powdery coating, or yellow halos.",
                    "Apply approved biological agent (e.g. Trichoderma harzianum or 5% Neem Seed Kernel Extract).",
                    "Do not apply synthetic chemical fungicides without certified diagnosis.",
                    "Consult your local Krishi Vigyan Kendra (KVK) or extension officer for approved regional formulations."
                ],
                supporting_evidence=[
                    f"Relative humidity: {humidity:.1f}%",
                    f"Pathogen incubation temperature: {t_current:.1f}°C",
                    f"Disease vulnerability score: {disease_risk:.1f}/100",
                ],
                data_limitations=None,
                confidence_pct=91.0,
            ))

        # ==============================================================================
        # 3. DRAINAGE & FIELD MANAGEMENT DIRECTIVES
        # ==============================================================================
        if rain_risk >= 70.0 and ("clay" in soil_type.lower() or "vertisol" in soil_type.lower()):
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.DRAINAGE_AND_SOIL,
                urgency=ActionUrgency.IMMEDIATE,
                priority=1,
                immediate_action=f"Clear field bund trenches and drainage furrows across {crop_name} plot.",
                why_it_matters=(
                    f"{soil_type} has slow internal drainage. Heavy precipitation forecast will cause standing water, "
                    f"depriving root hairs of oxygen within 24 hours."
                ),
                recommended_timing="Immediately, before onset of rainfall",
                risk_if_ignored="Prolonged water stagnation resulting in root asphyxiation, collar rot, and chlorosis.",
                projected_impact="Facilitates rapid surface runoff evacuation and preserves aerated root zone.",
                action_steps=[
                    "Dig or clear shallow drainage channels leading from low-lying plot sections to field boundaries.",
                    "Remove weeds and soil clods blocking furrow ends.",
                    "Ensure bund spillways allow excess water release without structural soil erosion."
                ],
                supporting_evidence=[
                    f"Soil classification: {soil_type}",
                    f"Heavy rainfall risk index: {rain_risk:.1f}/100",
                ],
                data_limitations=None,
                confidence_pct=93.0,
            ))

        # ==============================================================================
        # 4. HARVEST & CANOPY CARE DIRECTIVES
        # ==============================================================================
        if any(h in stage_lower for h in ["harvest", "ripening", "maturity"]) and next_24h_rain >= 10.0:
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.HARVEST_AND_CARE,
                urgency=ActionUrgency.IMMEDIATE,
                priority=1,
                immediate_action=f"Expedite harvesting of mature {crop_name} produce and shift to sheltered dry storage.",
                why_it_matters=(
                    f"Rain on mature {crop_name} causes fruit splitting, fungal mold, grain discoloration, and spoilage."
                ),
                recommended_timing="Immediately during dry hours today",
                risk_if_ignored="Severe post-harvest quality degradation, rotting in field, and drastically reduced market value.",
                projected_impact="Protects harvested crop market value and prevents direct harvest losses.",
                action_steps=[
                    "Harvest all physiologically mature fruits/pods today.",
                    "Do not leave harvested produce in open field piles.",
                    "Transfer harvest to a raised, well-ventilated, waterproof shed."
                ],
                supporting_evidence=[
                    f"Stage: '{stage_name}' (Harvest / Ripening)",
                    f"Forecast rainfall: {next_24h_rain:.1f} mm",
                ],
                data_limitations=None,
                confidence_pct=95.0,
            ))

        # Tall canopy earthing up for wind
        if any(c in crop_lower for c in ["maize", "sugarcane"]) and wind_risk >= 60.0:
            directives.append(AgronomicDirective(
                category=AdvisoryCategory.HARVEST_AND_CARE,
                urgency=ActionUrgency.WITHIN_24H,
                priority=2,
                immediate_action=f"Perform earthen mounding (earthing up) around base of {crop_name} stalks.",
                why_it_matters="High winds threaten to lodge and snap tall, top-heavy stalks, destroying root anchorage.",
                recommended_timing="Before forecasted gust front arrives",
                risk_if_ignored="Permanent stalk lodging, stem breakage, and harvest difficulty.",
                projected_impact="Strengthens root anchorage and reduces lodging risk by up to 40%.",
                action_steps=[
                    "Draw soil toward plant base to support prop roots.",
                    "Tie perimeter rows together if lodging winds are severe."
                ],
                supporting_evidence=[
                    f"Wind risk index: {wind_risk:.1f}/100",
                    f"Tall canopy crop: {crop_name}",
                ],
                data_limitations=None,
                confidence_pct=89.0,
            ))

        # ==============================================================================
        # 5. CONFLICT RESOLUTION & DEDUPLICATION
        # ==============================================================================
        resolved = cls._resolve_conflicts_and_deduplicate(directives)
        return resolved

    @classmethod
    def _resolve_conflicts_and_deduplicate(
        cls, directives: List[AgronomicDirective]
    ) -> List[AgronomicDirective]:
        """Resolves contradictory rules and removes redundant directives."""
        if not directives:
            return []

        # Conflict 1: Cannot both HOLD and APPLY irrigation
        has_hold_irrigation = any(
            d.category == AdvisoryCategory.IRRIGATION and "pause" in d.immediate_action.lower()
            for d in directives
        )
        if has_hold_irrigation:
            # Suppress any routine or light irrigation directives
            directives = [
                d for d in directives
                if not (d.category == AdvisoryCategory.IRRIGATION and "apply" in d.immediate_action.lower())
            ]

        # Conflict 2: Cannot both HOLD and APPLY foliar spray
        has_hold_spray = any(
            d.category == AdvisoryCategory.PLANT_PROTECTION and "hold" in d.immediate_action.lower()
            for d in directives
        )
        if has_hold_spray:
            # Suppress spray application directives
            directives = [
                d for d in directives
                if not (d.category == AdvisoryCategory.PLANT_PROTECTION and "apply" in d.immediate_action.lower())
            ]

        # Sort directives by priority (1 = highest urgency/critical, 5 = routine)
        directives.sort(key=lambda d: (d.priority, d.urgency.value))

        return directives
