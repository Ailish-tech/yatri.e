"""
Abnormal Behavior Monitor — Detects route deviation, inactivity, and unusual movement.
Analyzes GPS location history to identify potential safety incidents.

No API needed — pure algorithmic analysis.
"""

import math
import datetime


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in meters."""
    R = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _parse_timestamp(ts) -> datetime.datetime:
    """Parse timestamp from string or return as-is if already datetime."""
    if isinstance(ts, datetime.datetime):
        return ts
    if isinstance(ts, str):
        for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.datetime.strptime(ts, fmt)
            except ValueError:
                continue
    return datetime.datetime.now()


def analyze_movement(
    location_history: list[dict],
    planned_route: list[dict] | None = None,
    inactivity_threshold_min: int = 30,
    deviation_threshold_m: float = 500,
) -> list[dict]:
    """
    Analyze GPS movement history for abnormal behavior.

    Args:
        location_history: List of GPS readings, each:
            { "lat": float, "lon": float, "timestamp": str/datetime }
            Must be sorted chronologically (oldest first).
        planned_route: Optional list of { "lat", "lon" } waypoints.
        inactivity_threshold_min: Minutes of no movement to trigger alert.
        deviation_threshold_m: Meters off-route to trigger deviation alert.

    Returns:
        List of detected anomalies:
        [
            {
                "type": "inactivity" | "route_deviation" | "unusual_speed" | "zone_entry",
                "severity": "low" | "medium" | "high" | "critical",
                "title": "...",
                "message": "...",
                "action": "...",
                "timestamp": "...",
                "location": { "lat": float, "lon": float }
            }
        ]
    """
    alerts = []

    if len(location_history) < 2:
        return alerts

    # ── Check 1: Prolonged Inactivity ─────────────────────────
    inactivity_alert = _check_inactivity(location_history, inactivity_threshold_min)
    if inactivity_alert:
        alerts.append(inactivity_alert)

    # ── Check 2: Unusual Speed ────────────────────────────────
    speed_alerts = _check_speed(location_history)
    alerts.extend(speed_alerts)

    # ── Check 3: Route Deviation ──────────────────────────────
    if planned_route and len(planned_route) >= 2:
        deviation_alert = _check_route_deviation(
            location_history, planned_route, deviation_threshold_m
        )
        if deviation_alert:
            alerts.append(deviation_alert)

    # ── Check 4: Danger Zone Entry ────────────────────────────
    zone_alerts = _check_zone_entry(location_history)
    alerts.extend(zone_alerts)

    # Sort by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    alerts.sort(key=lambda a: severity_order.get(a["severity"], 5))

    return alerts


def _check_inactivity(history: list[dict], threshold_min: int) -> dict | None:
    """Detect if user hasn't moved significantly for too long."""
    latest = history[-1]
    latest_ts = _parse_timestamp(latest["timestamp"])

    # Walk backwards to find how long they've been stationary
    stationary_since = latest_ts
    for i in range(len(history) - 2, -1, -1):
        point = history[i]
        dist = _haversine(latest["lat"], latest["lon"], point["lat"], point["lon"])
        if dist > 30:  # 30m = actually moved
            break
        stationary_since = _parse_timestamp(point["timestamp"])

    duration_min = (latest_ts - stationary_since).total_seconds() / 60

    if duration_min >= threshold_min * 2:
        return {
            "type": "inactivity",
            "severity": "critical",
            "title": "Extended Inactivity Detected",
            "message": f"No movement for {int(duration_min)} minutes. Tourist may need help.",
            "action": "Trigger automatic SOS if no response within 10 minutes",
            "timestamp": latest_ts.isoformat(),
            "location": {"lat": latest["lat"], "lon": latest["lon"]},
            "duration_minutes": round(duration_min),
        }
    elif duration_min >= threshold_min:
        return {
            "type": "inactivity",
            "severity": "high",
            "title": "Prolonged Inactivity",
            "message": f"No movement for {int(duration_min)} minutes in current location.",
            "action": "Send wellness check notification to tourist",
            "timestamp": latest_ts.isoformat(),
            "location": {"lat": latest["lat"], "lon": latest["lon"]},
            "duration_minutes": round(duration_min),
        }
    return None


def _check_speed(history: list[dict]) -> list[dict]:
    """Detect unusual speed patterns."""
    alerts = []

    for i in range(1, len(history)):
        prev = history[i - 1]
        curr = history[i]

        dist = _haversine(prev["lat"], prev["lon"], curr["lat"], curr["lon"])
        time_diff = (_parse_timestamp(curr["timestamp"]) - _parse_timestamp(prev["timestamp"])).total_seconds()

        if time_diff <= 0:
            continue

        speed_kmh = (dist / time_diff) * 3.6

        # Unusually fast (possible abduction by vehicle)
        if speed_kmh > 120:
            alerts.append({
                "type": "unusual_speed",
                "severity": "critical",
                "title": "Abnormal High Speed Detected",
                "message": f"Moving at {speed_kmh:.0f} km/h — possible forced vehicle transport.",
                "action": "Alert authorities immediately. Share live location.",
                "timestamp": _parse_timestamp(curr["timestamp"]).isoformat(),
                "location": {"lat": curr["lat"], "lon": curr["lon"]},
                "speed_kmh": round(speed_kmh),
            })
        elif speed_kmh > 80:
            alerts.append({
                "type": "unusual_speed",
                "severity": "medium",
                "title": "Fast Movement Detected",
                "message": f"Moving at {speed_kmh:.0f} km/h — in a vehicle.",
                "action": "Verify this is expected travel",
                "timestamp": _parse_timestamp(curr["timestamp"]).isoformat(),
                "location": {"lat": curr["lat"], "lon": curr["lon"]},
                "speed_kmh": round(speed_kmh),
            })

    return alerts[:3]  # Max 3 speed alerts


def _check_route_deviation(
    history: list[dict], planned_route: list[dict], threshold_m: float
) -> dict | None:
    """Check if user has deviated significantly from planned route."""
    latest = history[-1]

    # Find minimum distance to any point on the planned route
    min_dist = float("inf")
    for waypoint in planned_route:
        dist = _haversine(latest["lat"], latest["lon"], waypoint["lat"], waypoint["lon"])
        min_dist = min(min_dist, dist)

    if min_dist > threshold_m * 2:
        return {
            "type": "route_deviation",
            "severity": "critical",
            "title": "Major Route Deviation",
            "message": f"Tourist is {min_dist:.0f}m away from planned route.",
            "action": "Contact tourist and share location with authorities",
            "timestamp": _parse_timestamp(latest["timestamp"]).isoformat(),
            "location": {"lat": latest["lat"], "lon": latest["lon"]},
            "deviation_m": round(min_dist),
        }
    elif min_dist > threshold_m:
        return {
            "type": "route_deviation",
            "severity": "high",
            "title": "Route Deviation Detected",
            "message": f"Tourist is {min_dist:.0f}m off planned route.",
            "action": "Send navigation correction notification",
            "timestamp": _parse_timestamp(latest["timestamp"]).isoformat(),
            "location": {"lat": latest["lat"], "lon": latest["lon"]},
            "deviation_m": round(min_dist),
        }
    return None


def _check_zone_entry(history: list[dict]) -> list[dict]:
    """Detect if user has entered a danger zone during their journey."""
    alerts = []

    if len(history) < 2:
        return alerts

    try:
        from geofence_engine import check_geofence

        prev = history[-2]
        curr = history[-1]

        prev_zones = {z["id"] for z in check_geofence(prev["lat"], prev["lon"])}
        curr_zones = check_geofence(curr["lat"], curr["lon"])

        # New zone entries
        for zone in curr_zones:
            if zone["id"] not in prev_zones:
                alerts.append({
                    "type": "zone_entry",
                    "severity": zone["risk_level"],
                    "title": f"Entered Danger Zone: {zone['name']}",
                    "message": zone["alert_message"],
                    "action": "Exercise extreme caution or leave the area",
                    "timestamp": _parse_timestamp(curr["timestamp"]).isoformat(),
                    "location": {"lat": curr["lat"], "lon": curr["lon"]},
                })

    except ImportError:
        pass

    return alerts


def predict_search_zone(
    last_known_location: dict,
    movement_history: list[dict] | None = None,
    hours_missing: float = 1.0,
) -> dict:
    """
    Predict likely search zones for a missing tourist.

    Args:
        last_known_location: { "lat": float, "lon": float }
        movement_history: Previous GPS readings.
        hours_missing: Hours since last contact.

    Returns:
        Predicted search zones with probabilities.
    """
    lat = last_known_location["lat"]
    lon = last_known_location["lon"]

    # Average walking speed: 5 km/h → radius expands with time
    walk_radius_m = int(hours_missing * 5000)
    # Vehicle speed: 40 km/h
    vehicle_radius_m = int(hours_missing * 40000)

    # Determine likely direction from movement history
    heading = None
    if movement_history and len(movement_history) >= 2:
        p1 = movement_history[-2]
        p2 = movement_history[-1]
        heading = math.degrees(
            math.atan2(p2["lon"] - p1["lon"], p2["lat"] - p1["lat"])
        )

    return {
        "last_known": {"lat": lat, "lon": lon},
        "hours_missing": hours_missing,
        "primary_search_zone": {
            "center": {"lat": lat, "lon": lon},
            "radius_m": walk_radius_m,
            "description": f"Walking range: {walk_radius_m/1000:.1f}km radius",
            "probability": "60%",
        },
        "extended_search_zone": {
            "center": {"lat": lat, "lon": lon},
            "radius_m": vehicle_radius_m,
            "description": f"Vehicle range: {vehicle_radius_m/1000:.0f}km radius",
            "probability": "30%",
        },
        "heading_degrees": heading,
        "heading_description": f"Last heading: {heading:.0f} degrees" if heading else "No heading data",
        "recommendations": [
            f"Focus search within {walk_radius_m/1000:.1f}km radius first",
            "Check nearby hospitals and police stations",
            "Review cell tower pings if available",
            "Contact hotels and transport services in area",
        ],
    }


# ─── Demo ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Abnormal Behavior Monitor Demo")
    print("=" * 60)
    now = datetime.datetime.now()

    # Test 1: Inactivity detection
    print("\nTest 1: Prolonged Inactivity")
    history = [
        {"lat": 28.6510, "lon": 77.2315, "timestamp": (now - datetime.timedelta(minutes=45)).isoformat()},
        {"lat": 28.6510, "lon": 77.2316, "timestamp": (now - datetime.timedelta(minutes=30)).isoformat()},
        {"lat": 28.6510, "lon": 77.2315, "timestamp": (now - datetime.timedelta(minutes=15)).isoformat()},
        {"lat": 28.6511, "lon": 77.2315, "timestamp": now.isoformat()},
    ]
    alerts = analyze_movement(history)
    for a in alerts:
        print(f"  [{a['severity'].upper()}] {a['title']}: {a['message']}")
    if not alerts:
        print("  No anomalies (user was stationary but under threshold)")

    # Test 2: High speed detection
    print("\nTest 2: Unusual Speed")
    history = [
        {"lat": 28.6510, "lon": 77.2315, "timestamp": (now - datetime.timedelta(minutes=5)).isoformat()},
        {"lat": 28.7200, "lon": 77.3000, "timestamp": now.isoformat()},
    ]
    alerts = analyze_movement(history)
    for a in alerts:
        print(f"  [{a['severity'].upper()}] {a['title']}: {a['message']}")

    # Test 3: Route deviation
    print("\nTest 3: Route Deviation")
    planned = [
        {"lat": 28.6129, "lon": 77.2295},
        {"lat": 28.6200, "lon": 77.2300},
        {"lat": 28.6300, "lon": 77.2350},
    ]
    history = [
        {"lat": 28.6129, "lon": 77.2295, "timestamp": (now - datetime.timedelta(minutes=30)).isoformat()},
        {"lat": 28.6800, "lon": 77.1500, "timestamp": now.isoformat()},  # Far off route
    ]
    alerts = analyze_movement(history, planned_route=planned)
    for a in alerts:
        print(f"  [{a['severity'].upper()}] {a['title']}: {a['message']}")

    # Test 4: Search prediction
    print("\nTest 4: Search Zone Prediction")
    prediction = predict_search_zone(
        {"lat": 28.6510, "lon": 77.2315},
        hours_missing=2.0,
    )
    print(f"  Primary zone: {prediction['primary_search_zone']['description']}")
    print(f"  Extended zone: {prediction['extended_search_zone']['description']}")

    print("\nDone!")
