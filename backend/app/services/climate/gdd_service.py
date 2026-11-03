from datetime import date
from typing import Dict, List, Optional, Tuple, Any

CROP_BASE_TEMPERATURES: Dict[str, Dict[str, float]] = {
    "Tomato": {"t_base": 10.0, "t_cutoff": 35.0, "mature_gdd": 1400.0},
    "Rice (Paddy)": {"t_base": 10.0, "t_cutoff": 35.0, "mature_gdd": 2000.0},
    "Wheat": {"t_base": 5.0, "t_cutoff": 30.0, "mature_gdd": 1800.0},
    "Cotton": {"t_base": 15.5, "t_cutoff": 38.0, "mature_gdd": 2200.0},
    "Maize (Corn)": {"t_base": 10.0, "t_cutoff": 35.0, "mature_gdd": 1600.0},
    "Sugarcane": {"t_base": 18.0, "t_cutoff": 40.0, "mature_gdd": 3500.0},
}


class GDDService:
    """Reusable Growing Degree Days (GDD) and thermal heat accumulation service."""

    @staticmethod
    def get_crop_thermal_parameters(crop_name: str) -> Optional[Dict[str, float]]:
        for key, params in CROP_BASE_TEMPERATURES.items():
            if key.lower() in crop_name.lower():
                return params
        return None

    @staticmethod
    def calculate_single_day_gdd(
        t_max: float,
        t_min: float,
        t_base: float,
        t_cutoff: Optional[float] = None,
    ) -> float:
        """Calculates standard agricultural GDD for a single 24-hour cycle."""
        # Adjust with upper cutoff if specified
        if t_cutoff is not None and t_max > t_cutoff:
            t_max = t_cutoff

        # If t_min drops below base, set to base for equation
        if t_min < t_base:
            t_min = t_base

        mean_temp = (t_max + t_min) / 2.0
        gdd = mean_temp - t_base
        return max(0.0, round(gdd, 2))

    @classmethod
    def calculate_accumulated_gdd(
        cls,
        crop_name: str,
        daily_observations: List[Dict[str, Any]],
        sowing_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """Calculates accumulated GDD across daily temperature series for a specific crop."""
        params = cls.get_crop_thermal_parameters(crop_name)
        if not params:
            return {
                "crop_name": crop_name,
                "supported": False,
                "reason": f"No thermal base temperature defined for crop '{crop_name}'",
                "accumulated_gdd": None,
                "daily_gdd_series": [],
            }

        t_base = params["t_base"]
        t_cutoff = params.get("t_cutoff")
        mature_target = params.get("mature_gdd", 1500.0)

        accumulated = 0.0
        daily_series: List[Dict[str, Any]] = []

        for obs in daily_observations:
            obs_date_str = obs.get("date")
            t_max = obs.get("temperature_max_c") or obs.get("temp_max_c")
            t_min = obs.get("temperature_min_c") or obs.get("temp_min_c")

            if t_max is None or t_min is None:
                continue

            day_gdd = cls.calculate_single_day_gdd(float(t_max), float(t_min), t_base, t_cutoff)
            accumulated += day_gdd

            daily_series.append({
                "date": obs_date_str,
                "t_max": float(t_max),
                "t_min": float(t_min),
                "daily_gdd": day_gdd,
                "cumulative_gdd": round(accumulated, 2),
            })

        progress_pct = min(100.0, round((accumulated / mature_target) * 100.0, 1))

        return {
            "crop_name": crop_name,
            "supported": True,
            "t_base_c": t_base,
            "t_cutoff_c": t_cutoff,
            "accumulated_gdd": round(accumulated, 1),
            "target_maturity_gdd": mature_target,
            "thermal_maturity_pct": progress_pct,
            "days_evaluated": len(daily_series),
            "daily_gdd_series": daily_series[-14:],  # return latest 14 days for trends
            "summary_note": (
                f"Accumulated {round(accumulated, 1)} GDD units (Base: {t_base}°C). "
                f"Represents ~{progress_pct}% of crop thermal cycle."
            ),
        }

