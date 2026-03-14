"""
Authority Dashboard — Real-time incident monitoring and heat maps.
Flask web app for law enforcement and tourism safety authorities.

Install: pip install flask
Run: python dashboard_server.py
Open: http://localhost:5000
"""

import json
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))

# Set Groq API key from environment
if not os.environ.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = "YOUR_GROQ_API_KEY"

from flask import Flask, render_template, jsonify, request
from blockchain_logger import get_incidents, get_chain_stats, verify_chain, log_incident
from geofence_engine import get_zone_stats, get_nearby_danger_zones, _load_zones, check_geofence
from behavior_monitor import predict_search_zone, analyze_movement
from risk_scoring import calculate_risk_score, get_proactive_alerts

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), "templates"))


@app.route("/")
def demo_page():
    """Interactive demo page with buttons for every feature."""
    return render_template("demo.html")


@app.route("/authority")
def dashboard():
    """Authority dashboard page."""
    return render_template("dashboard.html")


# ─── API Endpoints ────────────────────────────────────────────

@app.route("/api/stats")
def api_stats():
    """Dashboard statistics."""
    chain_stats = get_chain_stats()
    zone_stats = get_zone_stats()
    chain_valid = verify_chain()

    return jsonify({
        "incidents": chain_stats,
        "zones": zone_stats,
        "chain_integrity": chain_valid,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


@app.route("/api/incidents")
def api_incidents():
    """Get incident feed with optional filters."""
    incident_type = request.args.get("type")
    limit = int(request.args.get("limit", 50))
    incidents = get_incidents(incident_type=incident_type, limit=limit)
    return jsonify(incidents)


@app.route("/api/zones")
def api_zones():
    """Get all danger zones for map display."""
    zones = _load_zones()
    return jsonify(zones)


@app.route("/api/heatmap")
def api_heatmap():
    """Get incident locations for heat map overlay."""
    incidents = get_incidents(limit=200)
    points = []
    for inc in incidents:
        data = inc.get("data", {})
        lat = data.get("lat")
        lon = data.get("lon")
        if lat and lon:
            severity = {"SOS": 1.0, "BEHAVIOR": 0.8, "GEOFENCE": 0.6, "ALERT": 0.4, "WEATHER": 0.3}.get(
                inc["incident_type"], 0.3
            )
            points.append([lat, lon, severity])
    return jsonify(points)


@app.route("/api/risk")
def api_risk():
    """Calculate risk score for a location."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    result = calculate_risk_score(lat, lon, skip_terrain=True)
    return jsonify(result)


@app.route("/api/search_prediction")
def api_search_prediction():
    """Predict search zones for a missing tourist."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    hours = float(request.args.get("hours", 1.0))
    result = predict_search_zone({"lat": lat, "lon": lon}, hours_missing=hours)
    return jsonify(result)


@app.route("/api/verify_chain")
def api_verify_chain():
    """Verify blockchain integrity."""
    result = verify_chain()
    return jsonify(result)


@app.route("/api/log_test_incident", methods=["POST"])
def api_log_test():
    """Log a test incident for demo purposes."""
    data = request.json or {}
    block = log_incident(
        data.get("type", "MANUAL"),
        {
            "lat": data.get("lat", 26.8482),
            "lon": data.get("lon", 75.8130),
            "user_id": data.get("user_id", "demo_user"),
            "details": data.get("details", "Test incident from dashboard"),
        },
    )
    return jsonify({"success": True, "block": block})


@app.route("/api/poi")
def api_poi():
    """Search nearby Points of Interest using OpenStreetMap."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    radius = int(request.args.get("radius", 2000))
    poi_type = request.args.get("type", "hospital")
    try:
        from location_service import get_nearby_pois
        results = get_nearby_pois(lat, lon, radius, poi_type)
        return jsonify({"success": True, "results": results, "count": len(results)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/guide", methods=["POST"])
def api_guide():
    """Chat with AI tourist guide using Groq LLaMA 3."""
    data = request.json or {}
    message = data.get("message", "Hello!")
    try:
        from virtual_guide import chat_with_virtual_guide
        response = chat_with_virtual_guide(message)
        return jsonify({"success": True, "response": response})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/safety_report")
def api_safety_report():
    """Generate AI safety assessment for a location."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    area_name = request.args.get("area", "")
    try:
        from virtual_guide import generate_safety_report
        report = generate_safety_report(lat, lon, area_name)
        return jsonify({"success": True, "report": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/crowd_estimate")
def api_crowd_estimate():
    """Estimate crowd level at a location."""
    place = request.args.get("place", "Hawa Mahal")
    day = request.args.get("day", "")
    time_str = request.args.get("time", "")
    try:
        from virtual_guide import estimate_crowd_level
        result = estimate_crowd_level(place, day, time_str)
        return jsonify({"success": True, "estimate": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/geofence")
def api_geofence():
    """Check if a location is inside any danger zones."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    inside = check_geofence(lat, lon)
    nearby = get_nearby_danger_zones(lat, lon, 5000)
    return jsonify({"inside": inside, "nearby": nearby, "is_safe": len(inside) == 0})


@app.route("/api/behavior", methods=["POST"])
def api_behavior():
    """Analyze movement history for anomalies. Auto-logs SOS to blockchain for critical/high alerts."""
    data = request.json or {}
    history = data.get("history", [])
    planned_route = data.get("planned_route")
    user_id = data.get("user_id", "tourist_unknown")
    try:
        alerts = analyze_movement(history, planned_route=planned_route)

        # Auto-SOS: log critical/high alerts to blockchain → appears on authority dashboard
        sos_sent = []
        for alert in alerts:
            if alert["severity"] in ("critical", "high"):
                loc = alert.get("location", {})
                incident_type = "SOS" if alert["severity"] == "critical" else "BEHAVIOR"
                block = log_incident(incident_type, {
                    "lat": loc.get("lat", 0),
                    "lon": loc.get("lon", 0),
                    "user_id": user_id,
                    "trigger": alert["type"],
                    "severity": alert["severity"],
                    "details": f"AUTO-SOS: {alert['title']} — {alert['message']}",
                    "action_required": alert.get("action", ""),
                })
                sos_sent.append({
                    "block_index": block["index"],
                    "incident_type": incident_type,
                    "reason": alert["title"],
                })

        return jsonify({
            "success": True,
            "alerts": alerts,
            "count": len(alerts),
            "sos_auto_triggered": len(sos_sent),
            "sos_details": sos_sent,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/hotels")
def api_hotels():
    """Search nearby hotels using MakCorps Hotel API with fallback dummy data."""
    city = request.args.get("city", "jaipur")
    try:
        import requests as req
        url = f"https://api.makcorps.com/free/{city}"
        headers = {
            "Authorization": os.environ.get("MAKCORPS_API_KEY", "YOUR_MAKCORPS_API_KEY")
        }
        resp = req.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return jsonify({"success": True, "source": "makcorps_api", "hotels": data, "count": len(data) if isinstance(data, list) else 1})
    except Exception:
        pass

    # Fallback: Jaipur dummy hotel data
    dummy_hotels = [
        {"name": "Hotel Rajputana Palace", "rating": 4.5, "price": "₹3,200/night", "distance": "450m",
         "lat": 26.8500, "lon": 75.8145, "amenities": ["WiFi", "AC", "Pool", "Restaurant"],
         "address": "Near Jagatpura Circle, Jaipur", "phone": "+91-141-2729191"},
        {"name": "The Jaipur Heritage Inn", "rating": 4.2, "price": "₹2,100/night", "distance": "800m",
         "lat": 26.8520, "lon": 75.8090, "amenities": ["WiFi", "AC", "Breakfast", "Parking"],
         "address": "Mahal Road, Jagatpura, Jaipur", "phone": "+91-141-2730456"},
        {"name": "OYO Rooms Jagatpura", "rating": 3.8, "price": "₹1,200/night", "distance": "1.2km",
         "lat": 26.8460, "lon": 75.8180, "amenities": ["WiFi", "AC", "TV"],
         "address": "Near SKIT College, Jagatpura", "phone": "+91-141-2735678"},
        {"name": "Radisson Jaipur City Center", "rating": 4.7, "price": "₹6,500/night", "distance": "3.5km",
         "lat": 26.8750, "lon": 75.7930, "amenities": ["WiFi", "AC", "Pool", "Spa", "Gym", "Restaurant"],
         "address": "Khasa Kothi Circle, MI Road, Jaipur", "phone": "+91-141-2361111"},
        {"name": "FabHotel Pink City View", "rating": 4.0, "price": "₹1,800/night", "distance": "2.1km",
         "lat": 26.8555, "lon": 75.8020, "amenities": ["WiFi", "AC", "Breakfast"],
         "address": "Near Malviya Nagar, Jaipur", "phone": "+91-141-2740089"},
        {"name": "Treebo Trend Royal Heritage", "rating": 4.3, "price": "₹2,500/night", "distance": "2.8km",
         "lat": 26.8610, "lon": 75.7985, "amenities": ["WiFi", "AC", "Restaurant", "Parking"],
         "address": "C-Scheme, Jaipur", "phone": "+91-141-2750123"},
    ]
    return jsonify({"success": True, "source": "curated_local_data", "hotels": dummy_hotels, "count": len(dummy_hotels), "city": city})


@app.route("/api/taxi")
def api_taxi():
    """Get nearby taxi/cab availability with realistic dummy data."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    dummy_taxis = [
        {"driver": "Ramesh Kumar", "vehicle": "Maruti Suzuki Dzire (White)", "plate": "RJ-14-CA-2847",
         "rating": 4.8, "trips": 1247, "eta_min": 3, "distance_km": 0.8,
         "fare_estimate": "₹80-120", "type": "Mini", "phone": "+91-98291-XXXXX",
         "lat": lat + 0.002, "lon": lon - 0.001},
        {"driver": "Suresh Sharma", "vehicle": "Toyota Etios (Silver)", "plate": "RJ-14-SB-9134",
         "rating": 4.6, "trips": 892, "eta_min": 5, "distance_km": 1.5,
         "fare_estimate": "₹90-140", "type": "Sedan", "phone": "+91-98292-XXXXX",
         "lat": lat - 0.003, "lon": lon + 0.002},
        {"driver": "Mohan Singh", "vehicle": "Mahindra Xylo (Black)", "plate": "RJ-14-UA-4521",
         "rating": 4.4, "trips": 563, "eta_min": 7, "distance_km": 2.3,
         "fare_estimate": "₹150-200", "type": "SUV", "phone": "+91-98293-XXXXX",
         "lat": lat + 0.005, "lon": lon + 0.004},
        {"driver": "Priya Meena", "vehicle": "Maruti Wagon-R (Blue)", "plate": "RJ-14-TA-7856",
         "rating": 4.9, "trips": 2100, "eta_min": 4, "distance_km": 1.1,
         "fare_estimate": "₹70-100", "type": "Mini", "phone": "+91-98294-XXXXX",
         "lat": lat - 0.001, "lon": lon - 0.003},
        {"driver": "Auto Stand Jagatpura", "vehicle": "Auto Rickshaw (Yellow-Green)", "plate": "RJ-14-AP-3312",
         "rating": 4.2, "trips": 3400, "eta_min": 2, "distance_km": 0.4,
         "fare_estimate": "₹40-60", "type": "Auto", "phone": "+91-98295-XXXXX",
         "lat": lat + 0.001, "lon": lon + 0.001},
    ]
    return jsonify({"success": True, "taxis": dummy_taxis, "count": len(dummy_taxis), "location": {"lat": lat, "lon": lon}})


@app.route("/api/alerts")
def api_proactive_alerts():
    """Get proactive safety alerts for a location."""
    lat = float(request.args.get("lat", 26.8482))
    lon = float(request.args.get("lon", 75.8130))
    alerts = get_proactive_alerts(lat, lon)
    return jsonify({"alerts": alerts, "count": len(alerts)})


# ─── Main ─────────────────────────────────────────────────────
if __name__ == "__main__":
    # Seed some demo data if chain is empty
    stats = get_chain_stats()
    if stats["total_incidents"] == 0:
        print("[Dashboard] Seeding demo incident data...")
        demo_incidents = [
            ("SOS", {"lat": 26.8482, "lon": 75.8130, "user_id": "T001", "details": "Panic button - Jagatpura Mahal Road traffic incident"}),
            ("GEOFENCE", {"lat": 26.9376, "lon": 75.8154, "user_id": "T002", "details": "Tourist entered Nahargarh Fort remote trail zone alone"}),
            ("BEHAVIOR", {"lat": 26.9855, "lon": 75.8513, "user_id": "T003", "details": "No movement for 45 min near Amer Fort steep steps"}),
            ("SOS", {"lat": 26.9239, "lon": 75.8267, "user_id": "T004", "details": "Tourist robbed in Old City narrow lanes"}),
            ("WEATHER", {"lat": 26.8800, "lon": 75.8100, "user_id": "SYSTEM", "details": "Heavy rain + flooding alert - Jaipur region"}),
            ("ALERT", {"lat": 26.9169, "lon": 75.7906, "user_id": "T005", "details": "Tourist overcharged by auto-rickshaw at Sindhi Camp"}),
            ("BEHAVIOR", {"lat": 26.8540, "lon": 75.8050, "user_id": "T006", "details": "Route deviation detected - 800m off planned path near SKIT"}),
            ("SOS", {"lat": 26.8390, "lon": 75.8280, "user_id": "T007", "details": "Lost passport and wallet near Jagatpura Railway Station"}),
            ("GEOFENCE", {"lat": 26.8450, "lon": 75.8200, "user_id": "T008", "details": "Tourist entered Akshaya Patra Temple during peak crowd hours"}),
            ("ALERT", {"lat": 26.8560, "lon": 75.8060, "user_id": "T009", "details": "Suspicious activity reported near Malviya Nagar at night"}),
        ]
        for t, d in demo_incidents:
            log_incident(t, d)
        print(f"  Seeded {len(demo_incidents)} demo incidents.")

    print("\n" + "=" * 60)
    print("  Smart Tourism Safety Platform")
    print("  Demo UI:   http://localhost:5000")
    print("  Dashboard: http://localhost:5000/authority")
    print("=" * 60 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=True)

