"""WMO (World Meteorological Organization) Weather Code Mappings."""

from typing import Tuple

WMO_CODE_MAP = {
    0: ("Clear Sky", "Sunny", "☀️"),
    1: ("Mainly Clear", "Mainly Sunny", "🌤️"),
    2: ("Partly Cloudy", "Partly Cloudy", "⛅"),
    3: ("Overcast", "Cloudy", "☁️"),
    45: ("Fog", "Foggy", "🌫️"),
    48: ("Depositing Rime Fog", "Dense Fog", "🌫️"),
    51: ("Light Drizzle", "Light Rain", "🌦️"),
    53: ("Moderate Drizzle", "Drizzle", "🌦️"),
    55: ("Dense Drizzle", "Heavy Drizzle", "🌧️"),
    56: ("Light Freezing Drizzle", "Freezing Drizzle", "🌨️"),
    57: ("Dense Freezing Drizzle", "Freezing Drizzle", "🌨️"),
    61: ("Slight Rain", "Light Showers", "🌦️"),
    63: ("Moderate Rain", "Rainy", "🌧️"),
    65: ("Heavy Rain", "Heavy Downpour", "🌧️"),
    66: ("Light Freezing Rain", "Freezing Rain", "🌨️"),
    67: ("Heavy Freezing Rain", "Freezing Rain", "🌨️"),
    71: ("Slight Snow Fall", "Light Snow", "🌨️"),
    73: ("Moderate Snow Fall", "Snowy", "❄️"),
    75: ("Heavy Snow Fall", "Blizzard", "❄️"),
    77: ("Snow Grains", "Snow Grains", "❄️"),
    80: ("Slight Rain Showers", "Passing Showers", "🌦️"),
    81: ("Moderate Rain Showers", "Showers", "🌧️"),
    82: ("Violent Rain Showers", "Torrential Rain", "⛈️"),
    85: ("Slight Snow Showers", "Snow Showers", "🌨️"),
    86: ("Heavy Snow Showers", "Heavy Snow", "❄️"),
    95: ("Thunderstorm", "Thunderstorm", "⛈️"),
    96: ("Thunderstorm with Slight Hail", "Severe Storm & Hail", "⛈️"),
    99: ("Thunderstorm with Heavy Hail", "Severe Hailstorm", "⛈️"),
}


def decode_wmo_code(code: int) -> Tuple[str, str, str]:
    """Returns (formal_description, short_condition, icon_emoji)."""
    return WMO_CODE_MAP.get(code, ("Variable Conditions", "Partly Cloudy", "⛅"))

