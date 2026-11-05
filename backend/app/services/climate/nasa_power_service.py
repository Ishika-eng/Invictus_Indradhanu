import asyncio
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger


class NASAPowerService:
    """Fetches historical agroclimatology observations from NASA POWER Daily API."""

    BASE_URL = getattr(
        settings,
        "NASA_POWER_BASE_URL",
        "https://power.larc.nasa.gov/api/temporal/daily/point",
    )

    @classmethod
    async def fetch_historical(
        cls,
        latitude: float,
        longitude: float,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        retries: int = 1,
        timeout_seconds: float = 6.0,
    ) -> Dict[str, Any]:
        """Fetches historical daily climate time series for coordinates."""
        if not end_date:
            end_date = date.today() - timedelta(days=2)  # NASA POWER data typically has 2-3 days lag
        if not start_date:
            start_date = end_date - timedelta(days=30)

        # NASA POWER requires YYYYMMDD format
        str_start = start_date.strftime("%Y%m%d")
        str_end = end_date.strftime("%Y%m%d")

        endpoint = cls.BASE_URL
        if not endpoint.endswith("/daily/point"):
            endpoint = f"{endpoint.rstrip('/')}/daily/point"

        params = {
            "parameters": "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN",
            "community": "AG",
            "longitude": round(longitude, 4),
            "latitude": round(latitude, 4),
            "start": str_start,
            "end": str_end,
            "format": "JSON",
        }

        last_err: Optional[Exception] = None
        for attempt in range(1, retries + 2):
            try:
                async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                    resp = await client.get(endpoint, params=params)
                    if resp.status_code == 200:
                        return cls._parse_nasa_payload(resp.json(), latitude, longitude, start_date, end_date)
                    elif resp.status_code == 429:
                        await asyncio.sleep(1.5 * attempt)
                    else:
                        resp.raise_for_status()
            except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                last_err = e
                logger.warning(f"NASA POWER attempt {attempt} failed: {e}")
                if attempt <= retries:
                    await asyncio.sleep(1.0)

        logger.warning(f"NASA POWER historical lookup failed: {last_err}. Returning empty history.")
        return {
            "source": "NASA_POWER",
            "status": "unavailable",
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "records": [],
            "summary": {
                "avg_temp_c": None,
                "total_precipitation_mm": 0.0,
                "avg_relative_humidity_pct": None,
                "avg_solar_radiation_mj_m2": None,
            },
        }

    @classmethod
    def _parse_nasa_payload(
        cls,
        raw: Dict[str, Any],
        lat: float,
        lon: float,
        start_date: date,
        end_date: date,
    ) -> Dict[str, Any]:
        """Parses NASA POWER parameters, filtering invalid (-999) values."""
        params = raw.get("properties", {}).get("parameter", {})

        t2m = params.get("T2M", {})
        t2m_max = params.get("T2M_MAX", {})
        t2m_min = params.get("T2M_MIN", {})
        precip = params.get("PRECTOTCORR", {})
        rh = params.get("RH2M", {})
        solar = params.get("ALLSKY_SFC_SW_DWN", {})

        # Extract sorted date keys
        all_dates = sorted(t2m.keys())
        records: List[Dict[str, Any]] = []

        valid_temps: List[float] = []
        total_precip = 0.0
        valid_rhs: List[float] = []
        valid_solars: List[float] = []

        for date_key in all_dates:
            # Parse YYYYMMDD to YYYY-MM-DD
            formatted_date = f"{date_key[:4]}-{date_key[4:6]}-{date_key[6:]}"

            temp = t2m.get(date_key)
            t_val = float(temp) if temp is not None and temp > -900 else None
            if t_val is not None:
                valid_temps.append(t_val)

            t_max = t2m_max.get(date_key)
            t_max_val = float(t_max) if t_max is not None and t_max > -900 else None

            t_min = t2m_min.get(date_key)
            t_min_val = float(t_min) if t_min is not None and t_min > -900 else None

            p = precip.get(date_key)
            p_val = max(0.0, float(p)) if p is not None and p > -900 else 0.0
            total_precip += p_val

            r = rh.get(date_key)
            rh_val = float(r) if r is not None and r > -900 else None
            if rh_val is not None:
                valid_rhs.append(rh_val)

            s = solar.get(date_key)
            s_val = float(s) if s is not None and s > -900 else None
            if s_val is not None:
                valid_solars.append(s_val)

            records.append({
                "date": formatted_date,
                "temperature_avg_c": t_val,
                "temperature_max_c": t_max_val,
                "temperature_min_c": t_min_val,
                "precipitation_mm": p_val,
                "relative_humidity_pct": rh_val,
                "solar_radiation_mj_m2": s_val,
            })

        avg_temp = round(sum(valid_temps) / len(valid_temps), 1) if valid_temps else None
        avg_rh = round(sum(valid_rhs) / len(valid_rhs), 1) if valid_rhs else None
        avg_solar = round(sum(valid_solars) / len(valid_solars), 1) if valid_solars else None

        return {
            "source": "NASA_POWER",
            "status": "success",
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "records": records,
            "summary": {
                "avg_temp_c": avg_temp,
                "total_precipitation_mm": round(total_precip, 1),
                "avg_relative_humidity_pct": avg_rh,
                "avg_solar_radiation_mj_m2": avg_solar,
            },
            "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
        }

