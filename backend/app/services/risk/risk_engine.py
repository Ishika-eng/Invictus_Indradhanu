from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.services.risk.risk_types import (
    CategoryRiskAssessment,
    DailyRiskProjection,
    RiskLevel,
    score_to_level,
)
from app.services.risk.rainfall_risk_evaluator import RainfallRiskEvaluator
from app.services.risk.temperature_risk_evaluator import TemperatureRiskEvaluator
from app.services.risk.humidity_disease_evaluator import HumidityDiseaseRiskEvaluator
from app.services.risk.wind_risk_evaluator import WindRiskEvaluator
from app.services.risk.soil_moisture_evaluator import SoilMoistureRiskEvaluator


class CropRiskEngine:
    """Master Multi-Criteria Agronomic Risk Evaluation Engine for Indradhanu."""

    METHODOLOGY = "ICAR_FAO_MULTI_CRITERIA_RISK_V1"

    @classmethod
    def evaluate_farm_crop_risk(
        cls,
        crop_name: str,
        stage_name: str,
        current_weather: Dict[str, Any],
        daily_forecast: List[Dict[str, Any]],
        crop_profile: Optional[Dict[str, Any]] = None,
        stage_profile: Optional[Dict[str, Any]] = None,
        soil_type: str = "Black Clay Soil (Vertisol)",
        in_situ_moisture_pct: Optional[float] = None,
        is_in_situ_sensor: bool = False,
    ) -> Dict[str, Any]:
        """Evaluates all 7 risk categories and compiles overall composite risk with 7-day timeline."""
        crop_prof = crop_profile or {}
        stage_prof = stage_profile or {}

        # Agronomic thresholds
        water_demand = crop_prof.get("water_demand", "Moderate")
        water_sensitivity = stage_prof.get("water_sensitivity", "Moderate")
        temp_optimal_max = crop_prof.get("temp_optimal_max_c", 30.0)
        temp_critical_max = stage_prof.get("temp_critical_max_c") or crop_prof.get("temp_max_c", 35.0)
        temp_optimal_min = crop_prof.get("temp_optimal_min_c", 15.0)
        temp_critical_min = stage_prof.get("temp_critical_min_c") or crop_prof.get("temp_min_c", 10.0)

        # Weather observation values
        t_current = float(current_weather.get("temperature_c", 25.0))
        t_feels = float(current_weather.get("feels_like_c", t_current))
        humidity = float(current_weather.get("relative_humidity_pct", 60.0))
        rain_24h = float(current_weather.get("precipitation_mm", 0.0))
        rain_prob = float(current_weather.get("rain_probability_pct", 0.0))
        wind_kmh = float(current_weather.get("wind_speed_kmh", 10.0))

        # 7-day cumulative rainfall from forecast
        precip_7d_sum = sum(float(day.get("precipitation_mm", 0.0)) for day in daily_forecast)

        # Day 1 peak temperatures for current stress assessment
        day1 = daily_forecast[0] if daily_forecast else {}
        t_max_eval = float(day1.get("temp_max_c", t_current))
        t_min_eval = float(day1.get("temp_min_c", t_current - 8.0))

        # 1. Evaluate Individual Risk Categories
        rainfall_eval = RainfallRiskEvaluator.evaluate(
            precip_24h_mm=rain_24h,
            precip_7d_sum_mm=precip_7d_sum,
            rain_probability_pct=rain_prob,
            crop_name=crop_name,
            water_demand=water_demand,
            stage_name=stage_name,
            water_sensitivity=water_sensitivity,
            soil_type=soil_type,
        )

        heat_eval = TemperatureRiskEvaluator.evaluate_heat_stress(
            temp_max_c=t_max_eval,
            crop_name=crop_name,
            stage_name=stage_name,
            temp_optimal_max_c=temp_optimal_max,
            temp_critical_max_c=temp_critical_max,
        )

        cold_eval = TemperatureRiskEvaluator.evaluate_cold_stress(
            temp_min_c=t_min_eval,
            crop_name=crop_name,
            stage_name=stage_name,
            temp_optimal_min_c=temp_optimal_min,
            temp_critical_min_c=temp_critical_min,
        )

        disease_eval = HumidityDiseaseRiskEvaluator.evaluate(
            relative_humidity_pct=humidity,
            temperature_c=t_current,
            precipitation_mm=rain_24h,
            crop_name=crop_name,
            stage_name=stage_name,
        )

        wind_eval = WindRiskEvaluator.evaluate(
            wind_speed_kmh=wind_kmh,
            crop_name=crop_name,
            stage_name=stage_name,
        )

        soil_eval = SoilMoistureRiskEvaluator.evaluate(
            in_situ_moisture_pct=in_situ_moisture_pct,
            crop_name=crop_name,
            stage_name=stage_name,
            water_sensitivity=water_sensitivity,
            is_in_situ_sensor=is_in_situ_sensor,
        )

        # 2. Dynamic Composite Risk Calculation
        # Reallocate weights if soil moisture sensor is unavailable
        if soil_eval.is_available and soil_eval.score is not None:
            # Physical sensor present
            composite_score = (
                (rainfall_eval.score * 0.25)
                + (soil_eval.score * 0.20)
                + (heat_eval.score * 0.20)
                + (cold_eval.score * 0.10)
                + (disease_eval.score * 0.15)
                + (wind_eval.score * 0.10)
            )
        else:
            # Sensor absent: reallocate soil moisture weight into atmospheric precipitation & heat
            composite_score = (
                (rainfall_eval.score * 0.35)
                + (heat_eval.score * 0.25)
                + (cold_eval.score * 0.15)
                + (disease_eval.score * 0.15)
                + (wind_eval.score * 0.10)
            )

        composite_score = min(100.0, max(0.0, round(composite_score, 1)))
        composite_level = score_to_level(composite_score)

        # 3. 7-Day Daily Risk Projection Timeline
        daily_timeline: List[Dict[str, Any]] = []
        for day in daily_forecast:
            d_tmax = float(day.get("temp_max_c", 30.0))
            d_tmin = float(day.get("temp_min_c", 20.0))
            d_rain = float(day.get("precipitation_mm", 0.0))
            d_prob = float(day.get("precipitation_probability_pct", 0.0))
            d_wind = float(day.get("wind_speed_max_kmh", 12.0))

            d_rain_eval = RainfallRiskEvaluator.evaluate(
                precip_24h_mm=d_rain,
                precip_7d_sum_mm=d_rain,
                rain_probability_pct=d_prob,
                crop_name=crop_name,
                water_demand=water_demand,
                stage_name=stage_name,
                water_sensitivity=water_sensitivity,
                soil_type=soil_type,
            )
            d_heat_eval = TemperatureRiskEvaluator.evaluate_heat_stress(
                temp_max_c=d_tmax,
                crop_name=crop_name,
                stage_name=stage_name,
                temp_optimal_max_c=temp_optimal_max,
                temp_critical_max_c=temp_critical_max,
            )
            d_cold_eval = TemperatureRiskEvaluator.evaluate_cold_stress(
                temp_min_c=d_tmin,
                crop_name=crop_name,
                stage_name=stage_name,
                temp_optimal_min_c=temp_optimal_min,
                temp_critical_min_c=temp_critical_min,
            )
            d_wind_eval = WindRiskEvaluator.evaluate(
                wind_speed_kmh=d_wind,
                crop_name=crop_name,
                stage_name=stage_name,
            )

            # Daily composite without soil moisture
            d_score = min(
                100.0,
                max(
                    0.0,
                    round(
                        (d_rain_eval.score * 0.40)
                        + (d_heat_eval.score * 0.30)
                        + (d_cold_eval.score * 0.15)
                        + (d_wind_eval.score * 0.15),
                        1,
                    ),
                ),
            )

            # Determine dominant stress for the day
            scores_map = {
                "Rainfall & Flooding": d_rain_eval.score,
                "Heat Stress": d_heat_eval.score,
                "Cold Stress": d_cold_eval.score,
                "High Wind": d_wind_eval.score,
            }
            primary_factor = max(scores_map.items(), key=lambda x: x[1])[0]

            daily_timeline.append({
                "day_number": day.get("day_number", 1),
                "date": day.get("date", ""),
                "overall_score": d_score,
                "overall_level": score_to_level(d_score).value,
                "primary_risk_category": primary_factor,
                "rainfall_risk_score": d_rain_eval.score,
                "heat_risk_score": d_heat_eval.score,
                "cold_risk_score": d_cold_eval.score,
                "wind_risk_score": d_wind_eval.score,
                "weather_condition": day.get("weather_condition", "Partly Cloudy"),
                "weather_icon": day.get("weather_icon", "⛅"),
            })

        # 4. Compile High-Priority Environmental Contributing Drivers
        contributing_drivers = []
        for cat in [rainfall_eval, heat_eval, cold_eval, disease_eval, wind_eval, soil_eval]:
            if cat.is_available and (cat.score or 0) >= 30.0:
                for d in cat.driver_factors:
                    contributing_drivers.append(f"[{cat.category_name}] {d}")

        if not contributing_drivers:
            contributing_drivers.append("Environmental metrics are currently within safe agronomic parameters.")

        confidence = "HIGH" if (current_weather and daily_forecast and crop_profile) else "MEDIUM"

        return {
            "overall_risk_score": composite_score,
            "overall_risk_level": composite_level.value,
            "confidence_level": confidence,
            "scoring_methodology": cls.METHODOLOGY,
            "crop_evaluated": crop_name,
            "growth_stage_evaluated": stage_name,
            "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
            "categories": {
                "rainfall_waterlogging": rainfall_eval.model_dump(),
                "heat_stress": heat_eval.model_dump(),
                "cold_stress": cold_eval.model_dump(),
                "humidity_disease": disease_eval.model_dump(),
                "high_wind": wind_eval.model_dump(),
                "soil_moisture": soil_eval.model_dump(),
            },
            "category_scores": {
                "rainfall": rainfall_eval.score,
                "heat": heat_eval.score,
                "cold": cold_eval.score,
                "disease": disease_eval.score,
                "wind": wind_eval.score,
                "soil_moisture": soil_eval.score,
            },
            "contributing_factors": contributing_drivers,
            "daily_timeline": daily_timeline,
            "input_snapshot": {
                "temp_current_c": t_current,
                "temp_max_24h_c": t_max_eval,
                "temp_min_24h_c": t_min_eval,
                "precip_24h_mm": rain_24h,
                "precip_7d_sum_mm": precip_7d_sum,
                "humidity_pct": humidity,
                "wind_kmh": wind_kmh,
                "crop_water_demand": water_demand,
                "stage_water_sensitivity": water_sensitivity,
                "soil_sensor_active": is_in_situ_sensor,
            },
        }
