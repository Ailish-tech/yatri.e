"""
Face Finder — Real face recognition for the Authority Dashboard.

Uses the `face_recognition` library (deep learning, 128-dim face embeddings)
for accurate person identification. Haar Cascade is used for fast face
detection in the MJPEG overlay, while face_recognition handles matching.

When a match is found, an SOS incident is auto-logged to the blockchain.

Dependencies: face_recognition, opencv-python
"""

import cv2
import numpy as np
import face_recognition
import threading
import time
from datetime import datetime, timezone

# ─── Global State ──────────────────────────────────────────────
_lock = threading.Lock()
_active = False
_found = False
_found_at = None
_found_location = None
_camera = None
_thread = None
_current_frame = None
_reference_encoding = None  # 128-dim face embedding
_sos_triggered = False

# Default camera location (authority station / Jaipur HQ)
CAMERA_LAT = 26.8482
CAMERA_LON = 75.8130

# Face distance threshold — lower = stricter (0.0 = perfect match, 0.6 = default)
# Using 0.5 for a good balance of accuracy vs. tolerance
MATCH_TOLERANCE = 0.5


def _extract_encoding(image_bytes):
    """Extract 128-dim face encoding from uploaded image bytes."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Could not decode image")

    # face_recognition needs RGB
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # Detect face locations
    face_locations = face_recognition.face_locations(img_rgb, model="hog")
    if len(face_locations) == 0:
        raise ValueError(
            "No face detected in the reference image. "
            "Please upload a clear frontal photo with good lighting."
        )

    # Get 128-dim encoding of the largest face
    # face_locations are (top, right, bottom, left)
    largest = max(face_locations, key=lambda loc: (loc[2] - loc[0]) * (loc[1] - loc[3]))
    encodings = face_recognition.face_encodings(img_rgb, [largest])
    if len(encodings) == 0:
        raise ValueError("Could not compute face encoding. Try a different photo.")

    return encodings[0]


def _webcam_loop():
    """Background thread: capture webcam frames, detect & recognize faces."""
    global _active, _found, _found_at, _found_location, _camera, _current_frame, _sos_triggered

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[FaceFinder] ERROR: Could not open webcam")
        with _lock:
            _active = False
        return

    with _lock:
        _camera = cap

    print("[FaceFinder] Webcam started — scanning with deep learning face recognition...")
    frame_count = 0

    # Haar cascade for fast bounding box overlay (visual only)
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)

    while True:
        with _lock:
            if not _active:
                break

        ret, frame = cap.read()
        if not ret:
            time.sleep(0.05)
            continue

        frame_count += 1
        display_frame = frame.copy()

        # ── Run face_recognition every 5th frame (it's slower but accurate) ──
        if frame_count % 5 == 0:
            # Downscale for speed
            small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            # Find all faces and their encodings
            face_locations = face_recognition.face_locations(rgb_small, model="hog")
            face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

            with _lock:
                ref_encoding = _reference_encoding

            for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
                # Scale back up (we downscaled by 0.5)
                top *= 2
                right *= 2
                bottom *= 2
                left *= 2

                if ref_encoding is not None:
                    # Compute face distance (lower = more similar)
                    distance = face_recognition.face_distance([ref_encoding], encoding)[0]
                    is_match = distance < MATCH_TOLERANCE
                    confidence_pct = int((1.0 - distance) * 100)

                    if is_match:
                        # ══════ MATCH FOUND ══════
                        # Thick RED bounding box
                        cv2.rectangle(display_frame, (left, top), (right, bottom), (0, 0, 255), 3)

                        # Red label background + "FOUND" text
                        label_text = f"FOUND ({confidence_pct}%)"
                        font = cv2.FONT_HERSHEY_SIMPLEX
                        (tw, th), _ = cv2.getTextSize(label_text, font, 0.8, 2)
                        cv2.rectangle(
                            display_frame,
                            (left, top - th - 14),
                            (left + tw + 8, top - 4),
                            (0, 0, 255),
                            -1,
                        )
                        cv2.putText(
                            display_frame, label_text,
                            (left + 4, top - 10), font, 0.8, (255, 255, 255), 2,
                        )

                        with _lock:
                            if not _found:
                                _found = True
                                _found_at = datetime.now(timezone.utc).isoformat()
                                _found_location = {"lat": CAMERA_LAT, "lon": CAMERA_LON}
                                if not _sos_triggered:
                                    _sos_triggered = True
                                    try:
                                        from blockchain_logger import log_incident
                                        log_incident(
                                            "SOS",
                                            {
                                                "lat": CAMERA_LAT,
                                                "lon": CAMERA_LON,
                                                "user_id": "face_finder",
                                                "details": (
                                                    f"🚨 FACE MATCH — Target person detected on "
                                                    f"surveillance camera at ({CAMERA_LAT}, {CAMERA_LON}). "
                                                    f"Match confidence: {confidence_pct}%"
                                                ),
                                            },
                                        )
                                        print(f"[FaceFinder] ✅ SOS TRIGGERED — match {confidence_pct}%")
                                    except Exception as e:
                                        print(f"[FaceFinder] SOS log error: {e}")
                    else:
                        # NOT a match — thin GREEN bounding box
                        cv2.rectangle(display_frame, (left, top), (right, bottom), (0, 200, 0), 2)
                        cv2.putText(
                            display_frame,
                            f"Not target ({confidence_pct}%)",
                            (left, top - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 200, 0), 1,
                        )

        # ── Overlay status text ──
        with _lock:
            is_found = _found
        if is_found:
            # Red banner
            cv2.rectangle(display_frame, (0, 0), (380, 40), (0, 0, 180), -1)
            cv2.putText(
                display_frame, "STATUS: TARGET FOUND",
                (10, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2,
            )
        else:
            cv2.rectangle(display_frame, (0, 0), (200, 35), (0, 0, 0), -1)
            cv2.putText(
                display_frame, "SCANNING...",
                (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2,
            )

        # Encode frame as JPEG
        _, buffer = cv2.imencode(".jpg", display_frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        with _lock:
            _current_frame = buffer.tobytes()

        time.sleep(0.03)

    cap.release()
    with _lock:
        _camera = None
    print("[FaceFinder] Webcam released.")


# ─── Public API ────────────────────────────────────────────────

def start_detection(reference_image_bytes):
    """Start face recognition with a reference photo."""
    global _active, _found, _found_at, _found_location
    global _thread, _reference_encoding, _current_frame, _sos_triggered

    stop_detection()
    time.sleep(0.5)

    # Extract 128-dim face encoding from reference
    encoding = _extract_encoding(reference_image_bytes)

    with _lock:
        _reference_encoding = encoding
        _active = True
        _found = False
        _found_at = None
        _found_location = None
        _current_frame = None
        _sos_triggered = False

    _thread = threading.Thread(target=_webcam_loop, daemon=True)
    _thread.start()

    return {"status": "started", "message": "Face recognition active — scanning webcam feed."}


def stop_detection():
    """Stop face detection and release the webcam."""
    global _active, _thread, _reference_encoding

    with _lock:
        _active = False
        _reference_encoding = None

    if _thread and _thread.is_alive():
        _thread.join(timeout=3)
    _thread = None


def generate_frames():
    """Generator that yields MJPEG frames for Flask streaming."""
    while True:
        with _lock:
            active = _active
            frame = _current_frame

        if not active:
            blank = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(
                blank, "Camera Inactive",
                (160, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (100, 100, 100), 2,
            )
            _, buffer = cv2.imencode(".jpg", blank)
            frame = buffer.tobytes()

        if frame:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )
        time.sleep(0.03)


def get_status():
    """Return current detection status."""
    with _lock:
        return {
            "active": _active,
            "found": _found,
            "found_at": _found_at,
            "location": _found_location,
        }
