import time
from typing import Any, Dict, Optional, Tuple


class ClimateCacheService:
    """Thread-safe in-memory cache with TTL expiration for external climate API responses."""

    def __init__(self):
        # Dict mapping key -> (value, expiry_timestamp)
        self._cache: Dict[str, Tuple[Any, float]] = {}

    def _make_geo_key(self, prefix: str, lat: float, lon: float, extra: str = "") -> str:
        # Round coordinates to 3 decimal places (~110m precision)
        return f"{prefix}:{round(lat, 3)}:{round(lon, 3)}:{extra}"

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
        val, expiry = entry
        if time.time() > expiry:
            del self._cache[key]
            return None
        return val

    def set(self, key: str, value: Any, ttl_seconds: int = 1800) -> None:
        self._cache[key] = (value, time.time() + ttl_seconds)

    def invalidate(self, key_prefix: str) -> None:
        to_delete = [k for k in self._cache.keys() if k.startswith(key_prefix)]
        for k in to_delete:
            del self._cache[k]

    def clear(self) -> None:
        self._cache.clear()


# Global singleton instance
climate_cache = ClimateCacheService()

