"""
Dynamic Risk Scoring Engine — Combines multiple data sources into a 0-100 risk score.
Inputs: weather, geo-fence zones, terrain remoteness, time of day, historical incidents.

Uses free Open-Meteo API (no key needed) for weather data.
"""

import math
import datetime
import json
import os

try:
    import requests
except ImportError:
    import urllib.request
    import urllib.parse

    class _FallbackRequests:
        """Minimal requests replacement using urllib."""
        class Response:
            def __init__(self, data, code):
                self._data = data
                self.status_code = code
                self.ok = 200 <= code < 300
            def json(self):
                return json.loads(self._data)

        @staticmethod
        def get(url, params=None, timeout=10):
            if params:
                url += "?" + urllib.parse.urlencode(params)
            try:
                with urllib.request.urlopen(url, timeout=timeout) as resp:
                    data = resp.read().decode()
                    return _FallbackRequests.Response(data, resp.status)
            except Exception:
                return _FallbackRequests.Response("{}", 500)

    requests = _FallbackRequests()

from geofence_engine import check_geofence, get_nearby_danger_zones, RISK_LEVELS


def get_weather_risk(lat: float, lon: float) -> dict:
    """
    Fetch current weather and calculate risk contribution (0-25 points).
    Uses Open-Meteo API — completely free, no API key needed.
    """
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,wind_speed_10m,precipitation,weather_code",
                "timezone": "auto",
            },
            timeout=10,
        )

        if not resp.ok:
            return {"score": 5, "label": "Unknown", "details": "Weather data unavailable"}

        data = resp.json().get("current", {})
        temp = data.get("temperature_2m", 25)
        wind = data.get("wind_speed_10m", 0)
        precip = data.get("precipitation", 0)
        weather_code = data.get("weather_code", 0)

        score = 0
        warnings = []

        # Temperature extremes
        if temp > 42:
            score += 10
            warnings.append(f"Extreme heat: {temp}C - heat stroke risk")
        elif temp > 38:
            score += 6
            warnings.append(f"Very hot: {temp}C - stay hydrated")
        elif temp < 0:
            score += 6
            warnings.append(f"Freezing: {temp}C - hypothermia risk")

        # Heavy rain / storm
        if precip > 10:
            score += 8
            warnings.append(f"Heavy rainfall: {precip}mm - flooding risk")
        elif precip > 3:
            score += 4
            warnings.append(f"Moderate rain: {precip}mm")

        # High winds
        if wind > 60:
            score += 7
            warnings.append(f"Dangerous winds: {wind} km/h")
        elif wind > 40:
            score += 4
            warnings.append(f"Strong winds: {wind} km/h")

        # Severe weather codes (thunderstorm, fog, snow)
        if weather_code >= 95:
            score += 8
            warnings.append("Thunderstorm activity")
        elif weather_code >= 71:
            score += 5
            warnings.append("Snow or freezing conditions")
        elif weather_code >= 45:
            score += 3
            warnings.append("Fog - reduced visibility")

        score = min(score, 25)  # Cap at 25

        return {
            "score": score,
            "temperature": temp,
            "wind_speed": wind,
            "precipitation": precip,
            "weather_code": weather_code,
            "warnings": warnings,
        }

    except Exception as e:
        return {"score": 5, "warnings": [f"Weather check failed: {e}"]}


def get_geofence_risk(lat: float, lon: float) -> dict:
    """
    Calculate risk from nearby danger zones (0-30 points).
    """
    inside_zones = check_geofence(lat, lon)
    nearby_zones = get_nearby_danger_zones(lat, lon, 5000)

    score = 0
    alerts = []

    # Inside a zone = heavy penalty
    for zone in inside_zones:
        level = RISK_LEVELS.get(zone["risk_level"], 1)
        zone_score = level * 8  # critical=32, high=24, medium=16, low=8
        score += zone_score
        alerts.append(zone["alert_message"])

    # Nearby zones = lighter warning
    for zone in nearby_zones:
        if not zone["is_inside"] and zone["distance_to_edge_m"] < 1000:
            score += 3
            alerts.append(f"Approaching: {zone['name']} ({zone['distance_to_edge_m']}m away)")

    score = min(score, 30)  # Cap at 30

    return {
        "score": score,
        "zones_inside": len(inside_zones),
        "zones_nearby": len(nearby_zones),
        "alerts": alerts[:5],  # Max 5 alerts
    }


def get_terrain_risk(lat: float, lon: float) -> dict:
    """
    Estimate terrain remoteness risk (0-20 points).
    Based on distance to nearest emergency services.
    """
    try:
        from location_service import get_nearby_pois

        # Check for hospitals within 5km
        hospitals = get_nearby_pois(lat, lon, 5000, "hospital")
        police = get_nearby_pois(lat, lon, 5000, "police")

        score = 0
        details = []

        if len(hospitals) == 0:
            score += 10
            details.append("No hospital within 5km - remote area")
        elif len(hospitals) == 1:
            score += 4
            details.append(f"Only 1 hospital nearby: {hospitals[0]['name']}")

        if len(police) == 0:
            score += 10
            details.append("No police station within 5km")
        elif len(police) == 1:
            score += 3
            details.append(f"Only 1 police station nearby: {police[0]['name']}")

        score = min(score, 20)

        return {
            "score": score,
            "hospitals_nearby": len(hospitals),
            "police_nearby": len(police),
            "details": details,
        }

    except Exception as e:
        return {"score": 10, "details": [f"Terrain check unavailable: {e}"]}


def get_time_risk() -> dict:
    """
    Calculate time-of-day risk (0-15 points).
    Night hours = higher risk.
    """
    hour = datetime.datetime.now().hour

    if 0 <= hour < 5:
        return {"score": 15, "period": "Late night", "warning": "Most dangerous hours. Avoid isolated areas."}
    elif 5 <= hour < 7:
        return {"score": 8, "period": "Early morning", "warning": "Low foot traffic. Stay on main roads."}
    elif 7 <= hour < 18:
        return {"score": 0, "period": "Daytime", "warning": None}
    elif 18 <= hour < 21:
        return {"score": 5, "period": "Evening", "warning": "Getting dark. Stay in well-lit areas."}
    else:
        return {"score": 12, "period": "Night", "warning": "Limited visibility. Avoid shortcuts."}


def get_incident_risk(lat: float, lon: float) -> dict:
    """
    Calculate risk from historical incidents (0-10 points).
    Reads from blockchain incident log if available.
    """
    try:
        from blockchain_logger import get_incidents

        # Get incidents within 2km in the last 30 days
        all_incidents = get_incidents()
        now = datetime.datetime.now(datetime.timezone.utc)
        recent = []

        for inc in all_incidents:
            inc_data = inc.get("data", {})
            inc_lat = inc_data.get("lat", 0)
            inc_lon = inc_data.get("lon", 0)

            # Distance check
            from location_service import _haversine
            dist = _haversine(lat, lon, inc_lat, inc_lon)
            if dist <= 2000:
                recent.append(inc)

        count = len(recent)
        score = min(count * 3, 10)

        return {
            "score": score,
            "incidents_nearby": count,
            "details": f"{count} incidents logged within 2km",
        }

    except Exception:
        return {"score": 0, "incidents_nearby": 0, "details": "No incident history available"}


# ─── Main Risk Score Calculator ───────────────────────────────

def calculate_risk_score(
    lat: float,
    lon: float,
    skip_terrain: bool = False,
) -> dict:
    """
    Calculate a comprehensive 0-100 dynamic risk score.

    Args:
        lat: User's latitude.
        lon: User's longitude.
        skip_terrain: If True, skip OSM terrain check (faster, avoids API calls).

    Returns:
        {
            "score": 72,
            "level": "High",
            "breakdown": { "weather": 15, "geofence": 30, ... },
            "alerts": [...],
            "recommendations": [...]
        }
    """
    # Collect all risk components
    weather = get_weather_risk(lat, lon)
    geofence = get_geofence_risk(lat, lon)
    terrain = get_terrain_risk(lat, lon) if not skip_terrain else {"score": 0, "details": []}
    time_risk = get_time_risk()
    incidents = get_incident_risk(lat, lon)

    # Sum scores
    total = (
        weather.get("score", 0)
        + geofence.get("score", 0)
        + terrain.get("score", 0)
        + time_risk.get("score", 0)
        + incidents.get("score", 0)
    )
    total = min(total, 100)

    # Determine level
    if total >= 70:
        level = "Critical"
    elif total >= 50:
        level = "High"
    elif total >= 30:
        level = "Medium"
    elif total >= 15:
        level = "Low"
    else:
        level = "Safe"

    # Collect all alerts
    alerts = []
    alerts.extend(weather.get("warnings", []))
    alerts.extend(geofence.get("alerts", []))
    alerts.extend(terrain.get("details", []))
    if time_risk.get("warning"):
        alerts.append(time_risk["warning"])

    # Generate recommendations based on risk
    recommendations = _get_recommendations(total, weather, geofence, time_risk)

    return {
        "score": total,
        "level": level,
        "breakdown": {
            "weather": weather.get("score", 0),
            "geofence": geofence.get("score", 0),
            "terrain": terrain.get("score", 0),
            "time_of_day": time_risk.get("score", 0),
            "incidents": incidents.get("score", 0),
        },
        "alerts": alerts[:10],
        "recommendations": recommendations,
        "weather_data": weather,
        "geofence_data": geofence,
    }


def _get_recommendations(score: int, weather: dict, geofence: dict, time_risk: dict) -> list[str]:
    """Generate contextual safety recommendations."""
    recs = []

    if score >= 70:
        recs.append("Consider leaving this area immediately")
        recs.append("Share your live location with emergency contacts")

    if geofence.get("zones_inside", 0) > 0:
        recs.append("Move to a well-populated, well-lit area")
        recs.append("Keep your phone charged and accessible")

    if weather.get("score", 0) > 10:
        recs.append("Seek shelter and wait for weather to improve")

    if time_risk.get("score", 0) > 8:
        recs.append("Return to your hotel or a safe location")
        recs.append("Use only registered taxis or ride-share apps")

    if score < 20:
        recs.append("Area is generally safe — enjoy your visit!")
        recs.append("Stay aware of your surroundings as always")

    return recs[:5]


def get_proactive_alerts(
    lat: float,
    lon: float,
    movement_history: list[dict] | None = None,
) -> list[dict]:
    """
    Generate proactive alerts combining all risk factors.
    Called periodically by the mobile app for push notifications.
    """
    alerts = []

    # Geo-fence alerts
    inside = check_geofence(lat, lon)
    for zone in inside:
        alerts.append({
            "type": "geofence",
            "severity": zone["risk_level"],
            "title": f"Danger Zone: {zone['name']}",
            "message": zone["alert_message"],
            "action": "Leave area or stay alert",
        })

    # Weather alerts
    weather = get_weather_risk(lat, lon)
    for warning in weather.get("warnings", []):
        alerts.append({
            "type": "weather",
            "severity": "high" if weather["score"] > 10 else "medium",
            "title": "Weather Alert",
            "message": warning,
            "action": "Seek shelter if conditions worsen",
        })

    # Time alerts
    time_risk = get_time_risk()
    if time_risk["score"] > 8:
        alerts.append({
            "type": "time",
            "severity": "high" if time_risk["score"] > 12 else "medium",
            "title": "Night Safety Alert",
            "message": time_risk["warning"],
            "action": "Return to safe location",
        })

    # Behavior alerts (if movement history provided)
    if movement_history:
        try:
            from behavior_monitor import analyze_movement
            behavior_alerts = analyze_movement(movement_history)
            for ba in behavior_alerts:
                alerts.append({
                    "type": "behavior",
                    "severity": ba["severity"],
                    "title": ba["title"],
                    "message": ba["message"],
                    "action": ba.get("action", ""),
                })
        except Exception:
            pass

    # Sort by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    alerts.sort(key=lambda a: severity_order.get(a["severity"], 5))

    return alerts


# ─── Demo ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Dynamic Risk Scoring Engine Demo")
    print("=" * 60)

    # Test 1: Chandni Chowk (inside danger zone)
    print("\nTest 1: Chandni Chowk (high-crime zone)")
    result = calculate_risk_score(28.6510, 77.2315, skip_terrain=True)
    print(f"  Score: {result['score']}/100 ({result['level']})")
    print(f"  Breakdown: {result['breakdown']}")
    for a in result["alerts"][:3]:
        print(f"  Alert: {a}")
    for r in result["recommendations"][:2]:
        print(f"  Tip: {r}")

    # Test 2: India Gate (safe area)
    print("\nTest 2: India Gate (safe area)")
    result = calculate_risk_score(28.6129, 77.2295, skip_terrain=True)
    print(f"  Score: {result['score']}/100 ({result['level']})")
    print(f"  Breakdown: {result['breakdown']}")

    # Test 3: Proactive alerts
    print("\nTest 3: Proactive alerts at Chandni Chowk")
    alerts = get_proactive_alerts(28.6510, 77.2315)
    for a in alerts[:3]:
        print(f"  [{a['severity'].upper()}] {a['title']}: {a['message']}")

    print("\nDone!")
