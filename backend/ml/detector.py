"""
SentinelAI - Anomaly Detection Inference Engine
================================================
Applies the trained Isolation Forest model to new log records
and returns enriched anomaly-detection results.
"""
 
import logging
import numpy as np
import pandas as pd
from datetime import datetime
 
from ml.train import load_model, train_model
from ml.evaluation import score_to_severity
 
logger = logging.getLogger("SentinelAI.detector")
 
# ── Module-level cache: load model once, reuse across requests ─────────────────
_model  = None
_scaler = None
_meta   = None
 
 
def _get_model():
    """Lazy-load the trained model; train if not yet available."""
    global _model, _scaler, _meta
    if _model is None:
        try:
            _model, _scaler, _meta = load_model()
        except FileNotFoundError:
            logger.warning("Model not found — triggering auto-training...")
            train_model()
            _model, _scaler, _meta = load_model()
    return _model, _scaler, _meta
 
 
def detect_anomalies_batch(logs: list[dict]) -> list[dict]:
    """
    Run anomaly detection on a batch of log records.
 
    Args:
        logs: List of log dicts with keys:
              status_code, hour, day_of_week, is_night, is_error,
              is_4xx, is_redirect, session_norm,
              request_type_enc, user_agent_enc, location_enc
 
    Returns:
        List of enriched log dicts with 'is_anomaly', 'score', 'severity' added.
    """
    if not logs:
        return []
 
    model, scaler, meta = _get_model()
    feature_names = meta.get("feature_names", [])
 
    # Build feature matrix in the same column order used during training
    FEATURE_ORDER = [
        "Status_Code", "hour", "day_of_week", "is_night",
        "is_error", "is_4xx", "is_redirect", "session_norm",
        "Request_Type_enc", "User_Agent_enc", "Location_enc",
    ]
 
    rows = []
    for log in logs:
        row = [
            log.get("status_code",      200),
            log.get("hour",             12),
            log.get("day_of_week",      0),
            log.get("is_night",         0),
            log.get("is_error",         0),
            log.get("is_4xx",           0),
            log.get("is_redirect",      0),
            log.get("session_norm",     0.5),
            log.get("request_type_enc", 0),
            log.get("user_agent_enc",   0),
            log.get("location_enc",     0),
        ]
        rows.append(row)
 
    X = np.array(rows, dtype=np.float64)
    X_scaled = scaler.transform(X)
 
    raw_preds = model.predict(X_scaled)          # +1 normal, -1 anomaly
    scores    = model.decision_function(X_scaled) # continuous scores
 
    enriched = []
    for i, log in enumerate(logs):
        is_anomaly = int(raw_preds[i] == -1)
        score      = float(scores[i])
        severity   = score_to_severity(score) if is_anomaly else "none"
 
        enriched.append({
            **log,
            "is_anomaly" : is_anomaly,
            "score"      : round(score, 4),
            "severity"   : severity,
        })
 
    return enriched
 
 
def detect_single_log(log: dict) -> dict:
    """Convenience wrapper to detect anomalies on a single log record."""
    results = detect_anomalies_batch([log])
    return results[0] if results else {}
 
 
def encode_request_features(
    request_type: str,
    user_agent: str,
    location: str,
    status_code: int,
    session_id: int,
    timestamp: datetime | None = None,
) -> dict:
    """
    Convert raw log fields to numeric features expected by the model.
    Uses simple hash-based encoding (no fitted LabelEncoder needed at inference).
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
 
    hour        = timestamp.hour
    day_of_week = timestamp.weekday()
    is_night    = int(hour >= 22 or hour <= 5)
    is_error    = int(status_code in [500, 502, 503])
    is_4xx      = int(status_code in [400, 401, 403, 404, 429])
    is_redirect = int(status_code in [301, 302, 307, 308])
 
    # Simple ordinal encoding via hash (keeps values deterministic)
    request_type_enc = abs(hash(request_type.upper())) % 10
    user_agent_enc   = abs(hash(user_agent))            % 10
    location_enc     = abs(hash(location))              % 20
    session_norm     = (session_id % 5000) / 5000.0
 
    return {
        "status_code"      : status_code,
        "hour"             : hour,
        "day_of_week"      : day_of_week,
        "is_night"         : is_night,
        "is_error"         : is_error,
        "is_4xx"           : is_4xx,
        "is_redirect"      : is_redirect,
        "session_norm"     : session_norm,
        "Request_Type_enc" : request_type_enc,
        "User_Agent_enc"   : user_agent_enc,
        "Location_enc"     : location_enc,
    }
