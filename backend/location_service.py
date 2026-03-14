"""
Location & POI Service — Free alternative to Google Places API.
Uses OpenStreetMap Overpass API via the `overpy` library.

Install:
    pip install overpy

Usage:
    from location_service import get_nearby_pois
    results = get_nearby_pois(28.6139, 77.2090, 2000, "hospital")
"""

import math
import time
import overpy


# ─────────────────────────────────────────────────────────────
# POI Type Mapping: friendly name → OSM tag key/value
# ─────────────────────────────────────────────────────────────
POI_TYPE_MAP: dict[str, dict[str, str]] = {
    # Emergency & Safety
    "police":       {"key": "amenity",  "value": "police"},
    "hospital":     {"key": "amenity",  "value": "hospital"},
    "pharmacy":     {"key": "amenity",  "value": "pharmacy"},
    "fire_station": {"key": "amenity",  "value": "fire_station"},
    "clinic":       {"key": "amenity",  "value": "clinic"},

    # Transport
    "taxi":         {"key": "amenity",  "value": "taxi"},
    "bus_station":  {"key": "amenity",  "value": "bus_station"},
    "fuel":         {"key": "amenity",  "value": "fuel"},

    # Accommodation
    "hotel":        {"key": "tourism",  "value": "hotel"},
    "hostel":       {"key": "tourism",  "value": "hostel"},
    "guest_house":  {"key": "tourism",  "value": "guest_house"},
    "motel":        {"key": "tourism",  "value": "motel"},

    # Food & Drink
    "restaurant":   {"key": "amenity",  "value": "restaurant"},
    "cafe":         {"key": "amenity",  "value": "cafe"},
    "fast_food":    {"key": "amenity",  "value": "fast_food"},
    "bar":          {"key": "amenity",  "value": "bar"},

    # Tourism & Culture
    "museum":       {"key": "tourism",  "value": "museum"},
    "attraction":   {"key": "tourism",  "value": "attraction"},
    "viewpoint":    {"key": "tourism",  "value": "viewpoint"},
    "artwork":      {"key": "tourism",  "value": "artwork"},

    # Shopping / Local Vendors
    "marketplace":  {"key": "amenity",  "value": "marketplace"},
    "souvenir":     {"key": "shop",     "value": "gift"},

    # Finance
    "atm":          {"key": "amenity",  "value": "atm"},
    "bank":         {"key": "amenity",  "value": "bank"},
}

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # seconds


# ─────────────────────────────────────────────────────────────
# Core Function
# ─────────────────────────────────────────────────────────────
def get_nearby_pois(
    lat: float,
    lon: float,
    radius_meters: int = 3000,
    poi_type: str = "restaurant",
) -> list[dict]:
    """
    Find Points of Interest near a GPS coordinate using OpenStreetMap.

    Args:
        lat:            Latitude of the search center.
        lon:            Longitude of the search center.
        radius_meters:  Search radius in meters (default 3000m / 3km).
        poi_type:       Type of POI to find. Supported types:
                        'police', 'hospital', 'pharmacy', 'taxi', 'hotel',
                        'restaurant', 'cafe', 'museum', 'marketplace', etc.

    Returns:
        Sorted list (closest first) of dicts:
        [
            {
                "name":      "City Hospital",
                "latitude":  28.6145,
                "longitude": 77.2080,
                "type":      "hospital",
                "distance":  "450m",
                "address":   "123 Main St, Delhi",
                "phone":     "+91-11-12345678",
            },
            ...
        ]

    Raises:
        ValueError:      If poi_type is not in the supported list.
        ConnectionError: If Overpass API is unreachable after retries.
    """

    # ── 1. Validate POI type ──────────────────────────────────
    poi_info = POI_TYPE_MAP.get(poi_type.lower())
    if not poi_info:
        valid_types = ", ".join(sorted(POI_TYPE_MAP.keys()))
        raise ValueError(
            f"Unknown poi_type '{poi_type}'. "
            f"Supported types: {valid_types}"
        )

    tag_key = poi_info["key"]
    tag_value = poi_info["value"]

    # ── 2. Build Overpass QL query ────────────────────────────
    tag_filter = f'["{tag_key}"="{tag_value}"]'

    query = f"""
    [out:json][timeout:25];
    (
      node{tag_filter}(around:{radius_meters},{lat},{lon});
      way{tag_filter}(around:{radius_meters},{lat},{lon});
    );
    out center body;
    """

    # ── 3. Execute query with retry logic ─────────────────────
    api = overpy.Overpass()
    result = _execute_with_retries(api, query)

    if result is None:
        return []

    # ── 4. Parse and structure results ────────────────────────
    pois: list[dict] = []

    # Process nodes (point features)
    for node in result.nodes:
        poi = _parse_element(node.tags, float(node.lat), float(node.lon), poi_type)
        if poi:
            poi["distance_m"] = _haversine(lat, lon, poi["latitude"], poi["longitude"])
            pois.append(poi)

    # Process ways (buildings/areas — use center point)
    for way in result.ways:
        if way.center_lat and way.center_lon:
            poi = _parse_element(
                way.tags, float(way.center_lat), float(way.center_lon), poi_type
            )
            if poi:
                poi["distance_m"] = _haversine(lat, lon, poi["latitude"], poi["longitude"])
                pois.append(poi)

    # ── 5. Sort by distance and format ────────────────────────
    pois.sort(key=lambda p: p["distance_m"])

    for poi in pois:
        d = poi.pop("distance_m")  # remove raw meters, add human string
        poi["distance"] = f"{d:.0f}m" if d < 1000 else f"{d / 1000:.1f}km"

    return pois


# ─────────────────────────────────────────────────────────────
# Internal Helpers
# ─────────────────────────────────────────────────────────────
def _execute_with_retries(api: overpy.Overpass, query: str) -> overpy.Result | None:
    """Execute an Overpass query with exponential back-off on rate limits."""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return api.query(query)

        except overpy.exception.OverpassTooManyRequests:
            # HTTP 429 — rate limited
            wait = RETRY_BASE_DELAY * attempt
            print(f"[POI] Rate limited (429). Retry {attempt}/{MAX_RETRIES} in {wait}s...")
            if attempt == MAX_RETRIES:
                raise ConnectionError(
                    "Overpass API rate limit exceeded after "
                    f"{MAX_RETRIES} retries. Please wait and try again."
                )
            time.sleep(wait)

        except overpy.exception.OverpassGatewayTimeout:
            # HTTP 504 — server overloaded
            wait = RETRY_BASE_DELAY * attempt
            print(f"[POI] Gateway timeout (504). Retry {attempt}/{MAX_RETRIES} in {wait}s...")
            if attempt == MAX_RETRIES:
                raise ConnectionError(
                    "Overpass API timed out. Try a smaller radius."
                )
            time.sleep(wait)

        except ConnectionError:
            raise ConnectionError(
                "Cannot reach the Overpass API. Check your internet connection."
            )

        except Exception as e:
            raise ConnectionError(f"Overpass API error: {e}")

    return None


def _parse_element(tags: dict, lat: float, lon: float, poi_type: str) -> dict | None:
    """Convert raw OSM tags into a clean dictionary. Skips unnamed POIs."""

    name = tags.get("name") or tags.get("name:en") or ""
    if not name:
        return None  # skip unnamed entries for cleaner output

    return {
        "name":      name,
        "latitude":  round(lat, 6),
        "longitude": round(lon, 6),
        "type":      poi_type,
        "address":   _build_address(tags),
        "phone":     tags.get("phone", tags.get("contact:phone", "")),
    }


def _build_address(tags: dict) -> str:
    """Combine OSM addr:* tags into a readable address string."""
    parts = []
    for key in ("addr:housenumber", "addr:street", "addr:city", "addr:state"):
        val = tags.get(key)
        if val:
            parts.append(val)
    return ", ".join(parts) if parts else tags.get("addr:full", "")


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS points, in meters."""
    R = 6_371_000  # Earth radius in meters
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─────────────────────────────────────────────────────────────
# Demo / Self-test
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("📍  Location & POI Service (OpenStreetMap / Overpass API)")
    print("=" * 60)

    # ── Test 1: Hospitals near India Gate, New Delhi ──────────
    print("\n🏥 Hospitals near India Gate, New Delhi (2km radius):\n")
    try:
        hospitals = get_nearby_pois(28.6129, 77.2295, 2000, "hospital")
        for h in hospitals[:5]:
            print(f"  • {h['name']}  —  {h['distance']}")
            if h["address"]:
                print(f"    📌 {h['address']}")
            if h["phone"]:
                print(f"    📞 {h['phone']}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # ── Test 2: Cafes near Connaught Place ────────────────────
    print("\n☕ Cafes near Connaught Place, Delhi (1km radius):\n")
    try:
        cafes = get_nearby_pois(28.6315, 77.2167, 1000, "cafe")
        for c in cafes[:5]:
            print(f"  • {c['name']}  —  {c['distance']}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # ── Test 3: Police stations near Taj Mahal ────────────────
    print("\n🚔 Police stations near Taj Mahal, Agra (3km radius):\n")
    try:
        police = get_nearby_pois(27.1751, 78.0421, 3000, "police")
        for p in police[:5]:
            print(f"  • {p['name']}  —  {p['distance']}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # ── Test 4: Invalid type ──────────────────────────────────
    print("\n⚠️  Testing invalid POI type:\n")
    try:
        get_nearby_pois(28.6, 77.2, 1000, "spaceship_dock")
    except ValueError as e:
        print(f"  ✅ Caught expected error: {e}")

    print("\n" + "=" * 60)
    print("✅ All tests complete!")
