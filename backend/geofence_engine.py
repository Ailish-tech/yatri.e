"""
Geo-Fencing Engine — Danger zone detection for tourists.
Checks if a tourist's GPS coordinates fall within predefined risk zones.

No API key needed — uses local danger_zones.json config.
"""

import json
import math
import os

# Load danger zones from JSON config
ZONES_FILE = os.path.join(os.path.dirname(__file__), "danger_zones.json")

RISK_LEVELS = {"low": 1, "medium": 2, "high": 3, "critical": 4}


def _load_zones() -> list[dict]:
    """Load danger zones from the JSON config file."""
    if not os.path.exists(ZONES_FILE):
        print(f"[GeoFence] Warning: {ZONES_FILE} not found. No zones loaded.")
        return []
    with open(ZONES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in meters."""
    R = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def check_geofence(lat: float, lon: float) -> list[dict]:
    """
    Check if a GPS position is inside any danger zones.

    Args:
        lat: User's latitude.
        lon: User's longitude.

    Returns:
        List of danger zones the user is currently inside, sorted by severity.
        Each dict: { id, name, risk_level, risk_type, alert_message, distance_m }
    """
    zones = _load_zones()
    inside = []

    for zone in zones:
        dist = _haversine(lat, lon, zone["latitude"], zone["longitude"])
        if dist <= zone["radius_m"]:
            inside.append({
                "id": zone["id"],
                "name": zone["name"],
                "risk_level": zone["risk_level"],
                "risk_type": zone["risk_type"],
                "alert_message": zone["alert_message"],
                "distance_to_center_m": round(dist),
                "zone_radius_m": zone["radius_m"],
            })

    # Sort by severity (critical first)
    inside.sort(key=lambda z: RISK_LEVELS.get(z["risk_level"], 0), reverse=True)
    return inside


def get_nearby_danger_zones(lat: float, lon: float, radius_m: int = 10000) -> list[dict]:
    """
    Find all danger zones within a given radius.

    Args:
        lat: User's latitude.
        lon: User's longitude.
        radius_m: Search radius in meters (default 10km).

    Returns:
        List of nearby zones with distance, sorted closest first.
    """
    zones = _load_zones()
    nearby = []

    for zone in zones:
        dist = _haversine(lat, lon, zone["latitude"], zone["longitude"])
        edge_dist = max(0, dist - zone["radius_m"])  # distance to zone edge

        if dist <= radius_m + zone["radius_m"]:
            is_inside = dist <= zone["radius_m"]
            nearby.append({
                "id": zone["id"],
                "name": zone["name"],
                "description": zone["description"],
                "risk_level": zone["risk_level"],
                "risk_type": zone["risk_type"],
                "alert_message": zone["alert_message"],
                "distance_m": round(dist),
                "distance_to_edge_m": round(edge_dist),
                "is_inside": is_inside,
                "latitude": zone["latitude"],
                "longitude": zone["longitude"],
                "radius_m": zone["radius_m"],
            })

    nearby.sort(key=lambda z: z["distance_m"])
    return nearby


def get_zone_stats() -> dict:
    """Get summary statistics for all danger zones."""
    zones = _load_zones()
    by_level = {}
    by_type = {}
    for z in zones:
        by_level[z["risk_level"]] = by_level.get(z["risk_level"], 0) + 1
        by_type[z["risk_type"]] = by_type.get(z["risk_type"], 0) + 1

    return {
        "total_zones": len(zones),
        "by_risk_level": by_level,
        "by_risk_type": by_type,
    }


# ─── Demo ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Geo-Fencing Engine Demo")
    print("=" * 60)

    # Test 1: Tourist at Chandni Chowk (inside zone_001)
    print("\nTest 1: Tourist at Chandni Chowk market")
    alerts = check_geofence(28.6510, 77.2315)
    if alerts:
        for a in alerts:
            print(f"  [{a['risk_level'].upper()}] {a['name']}")
            print(f"    {a['alert_message']}")
    else:
        print("  No danger zones detected.")

    # Test 2: Tourist in safe area
    print("\nTest 2: Tourist at India Gate (safe area)")
    alerts = check_geofence(28.6129, 77.2295)
    print(f"  Danger zones: {len(alerts)} (expected 0)")

    # Test 3: Nearby zones from Delhi center
    print("\nTest 3: Danger zones within 10km of Delhi center")
    nearby = get_nearby_danger_zones(28.6350, 77.2250, 10000)
    for z in nearby:
        status = "INSIDE" if z["is_inside"] else f"{z['distance_to_edge_m']}m away"
        print(f"  [{z['risk_level'].upper()}] {z['name']} — {status}")

    # Stats
    print(f"\nZone stats: {get_zone_stats()}")
    print("\nDone!")
