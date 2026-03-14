"""
Blockchain-Backed Incident Logger — Tamper-proof evidence trails.
Uses SHA-256 hash-chain to ensure integrity of all logged incidents.

No external dependencies — pure Python cryptographic hashing.
"""

import hashlib
import json
import os
import datetime

CHAIN_FILE = os.path.join(os.path.dirname(__file__), "incident_chain.json")

INCIDENT_TYPES = ["SOS", "ALERT", "GEOFENCE", "BEHAVIOR", "WEATHER", "MANUAL"]


def _compute_hash(block: dict) -> str:
    """Compute SHA-256 hash of a block."""
    block_string = json.dumps(
        {k: v for k, v in block.items() if k != "hash"},
        sort_keys=True,
        default=str,
    )
    return hashlib.sha256(block_string.encode()).hexdigest()


def _load_chain() -> list[dict]:
    """Load the blockchain from disk."""
    if os.path.exists(CHAIN_FILE):
        with open(CHAIN_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_chain(chain: list[dict]):
    """Persist the blockchain to disk."""
    with open(CHAIN_FILE, "w", encoding="utf-8") as f:
        json.dump(chain, f, indent=2, default=str)


def _create_genesis_block() -> dict:
    """Create the first block in the chain."""
    block = {
        "index": 0,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "incident_type": "GENESIS",
        "data": {"message": "Smart Tourism Safety Chain Initialized"},
        "previous_hash": "0" * 64,
    }
    block["hash"] = _compute_hash(block)
    return block


def log_incident(
    incident_type: str,
    data: dict,
) -> dict:
    """
    Log a tamper-proof incident to the blockchain.

    Args:
        incident_type: One of: SOS, ALERT, GEOFENCE, BEHAVIOR, WEATHER, MANUAL
        data: Incident data dict. Should include:
            - lat, lon (GPS coordinates)
            - user_id (tourist identifier)
            - details (description)

    Returns:
        The newly created block.

    Raises:
        ValueError: If incident_type is invalid.
    """
    if incident_type not in INCIDENT_TYPES:
        raise ValueError(f"Invalid incident type '{incident_type}'. Valid: {INCIDENT_TYPES}")

    chain = _load_chain()

    # Create genesis block if chain is empty
    if not chain:
        genesis = _create_genesis_block()
        chain.append(genesis)

    # Build new block
    last_block = chain[-1]
    block = {
        "index": last_block["index"] + 1,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "incident_type": incident_type,
        "data": data,
        "previous_hash": last_block["hash"],
    }
    block["hash"] = _compute_hash(block)

    chain.append(block)
    _save_chain(chain)

    return block


def verify_chain() -> dict:
    """
    Verify the integrity of the entire blockchain.

    Returns:
        {
            "valid": True/False,
            "total_blocks": int,
            "tampered_blocks": [indices],
            "message": str
        }
    """
    chain = _load_chain()

    if not chain:
        return {"valid": True, "total_blocks": 0, "tampered_blocks": [], "message": "Empty chain"}

    tampered = []

    for i, block in enumerate(chain):
        # Verify hash
        computed = _compute_hash(block)
        if computed != block["hash"]:
            tampered.append(i)
            continue

        # Verify chain linkage (skip genesis)
        if i > 0:
            if block["previous_hash"] != chain[i - 1]["hash"]:
                tampered.append(i)

    return {
        "valid": len(tampered) == 0,
        "total_blocks": len(chain),
        "tampered_blocks": tampered,
        "message": "Chain integrity verified" if not tampered else f"TAMPERING DETECTED in blocks: {tampered}",
    }


def get_incidents(
    incident_type: str | None = None,
    limit: int = 100,
) -> list[dict]:
    """
    Query logged incidents with optional filtering.

    Args:
        incident_type: Filter by type (SOS, ALERT, etc.) or None for all.
        limit: Maximum number of results.

    Returns:
        List of incident blocks (newest first).
    """
    chain = _load_chain()

    # Filter out genesis
    incidents = [b for b in chain if b["incident_type"] != "GENESIS"]

    # Filter by type
    if incident_type:
        incidents = [b for b in incidents if b["incident_type"] == incident_type]

    # Newest first, limited
    incidents.reverse()
    return incidents[:limit]


def get_chain_stats() -> dict:
    """Get blockchain statistics."""
    chain = _load_chain()
    incidents = [b for b in chain if b["incident_type"] != "GENESIS"]

    by_type = {}
    for b in incidents:
        t = b["incident_type"]
        by_type[t] = by_type.get(t, 0) + 1

    return {
        "total_blocks": len(chain),
        "total_incidents": len(incidents),
        "by_type": by_type,
        "chain_valid": verify_chain()["valid"],
    }


def clear_chain():
    """Reset the blockchain (for testing only)."""
    if os.path.exists(CHAIN_FILE):
        os.remove(CHAIN_FILE)


# ─── Demo ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Blockchain Incident Logger Demo")
    print("=" * 60)

    # Reset for clean demo
    clear_chain()

    # Log sample incidents
    print("\nLogging incidents...")

    b1 = log_incident("SOS", {
        "lat": 28.6510, "lon": 77.2315,
        "user_id": "tourist_001",
        "details": "Panic button pressed near Chandni Chowk",
    })
    print(f"  Block #{b1['index']}: SOS (hash: {b1['hash'][:16]}...)")

    b2 = log_incident("GEOFENCE", {
        "lat": 28.6380, "lon": 77.2495,
        "user_id": "tourist_002",
        "details": "Entered isolated riverbank zone",
    })
    print(f"  Block #{b2['index']}: GEOFENCE (hash: {b2['hash'][:16]}...)")

    b3 = log_incident("BEHAVIOR", {
        "lat": 27.1751, "lon": 78.0421,
        "user_id": "tourist_003",
        "details": "No movement detected for 45 minutes near Taj Mahal",
    })
    print(f"  Block #{b3['index']}: BEHAVIOR (hash: {b3['hash'][:16]}...)")

    b4 = log_incident("ALERT", {
        "lat": 28.6448, "lon": 77.2135,
        "user_id": "tourist_001",
        "details": "Weather alert: Heavy rain warning",
    })
    print(f"  Block #{b4['index']}: ALERT (hash: {b4['hash'][:16]}...)")

    b5 = log_incident("SOS", {
        "lat": 15.4989, "lon": 73.8278,
        "user_id": "tourist_004",
        "details": "Emergency at Goa beach - possible drink spiking",
    })
    print(f"  Block #{b5['index']}: SOS (hash: {b5['hash'][:16]}...)")

    # Verify chain
    print("\nVerifying blockchain integrity...")
    result = verify_chain()
    print(f"  Valid: {result['valid']}")
    print(f"  Total blocks: {result['total_blocks']}")
    print(f"  Message: {result['message']}")

    # Query incidents
    print("\nQuerying SOS incidents...")
    sos = get_incidents("SOS")
    for inc in sos:
        print(f"  #{inc['index']}: {inc['data']['details']}")

    # Stats
    print(f"\nChain stats: {get_chain_stats()}")

    # Tamper test
    print("\nTamper detection test...")
    chain = _load_chain()
    chain[2]["data"]["details"] = "TAMPERED DATA"
    _save_chain(chain)
    result = verify_chain()
    print(f"  Valid after tampering: {result['valid']}")
    print(f"  Tampered blocks: {result['tampered_blocks']}")
    print(f"  Message: {result['message']}")

    # Clean up
    clear_chain()
    print("\nDone!")
