"""
SentinelAI - /api/anomaly-detection
=====================================
Runs the Isolation Forest model on a batch of logs
(either simulated or user-supplied) and returns enriched results.
"""
 
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
 
from utils.log_simulator import generate_log_batch
from ml.detector import detect_anomalies_batch, encode_request_features
from ml.evaluation import score_to_severity
 
logger = logging.getLogger("SentinelAI.routes.anomaly")
 
anomaly_bp = Blueprint("anomaly", __name__)
 
 
@anomaly_bp.route("/anomaly-detection", methods=["GET"])
def anomaly_detection_demo():
    """
    GET /api/anomaly-detection?count=<int>
 
    Generates a fresh simulated batch and runs the ML model on it.
    Perfect for demonstrating the model in real time.
 
    Returns:
        {
          success, total, anomaly_count, anomaly_pct,
          severity_breakdown: { critical, high, medium, low, none },
          logs: [ enriched log with is_anomaly, score, severity ]
        }
    """
    try:
        count = request.args.get("count", 50, type=int)
        count = max(1, min(count, 200))
 
        # Generate simulated logs and run model
        raw_logs = generate_log_batch(n=count, spread_minutes=15)
        enriched = detect_anomalies_batch(raw_logs)
 
        # Build severity breakdown
        sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "none": 0}
        for log in enriched:
            sev = log.get("severity", "none")
            sev_counts[sev] = sev_counts.get(sev, 0) + 1
 
        anomaly_count = sum(1 for l in enriched if l.get("is_anomaly") == 1)
        anomaly_pct   = round(anomaly_count / len(enriched) * 100, 2) if enriched else 0
 
        return jsonify({
            "success"           : True,
            "generated_at"      : datetime.utcnow().isoformat() + "Z",
            "total"             : len(enriched),
            "anomaly_count"     : anomaly_count,
            "anomaly_pct"       : anomaly_pct,
            "severity_breakdown": sev_counts,
            "logs"              : enriched,
        })
 
    except Exception as e:
        logger.exception(f"Anomaly detection error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 
 
@anomaly_bp.route("/anomaly-detection", methods=["POST"])
def anomaly_detection_custom():
    """
    POST /api/anomaly-detection
 
    Accepts a JSON body with a list of log entries to analyse.
 
    Body:
        {
          "logs": [
            {
              "status_code": 500,
              "method": "POST",
              "user_agent": "Chrome",
              "location": "India",
              "session_id": 1234,
              "timestamp": "2024-01-01T12:00:00Z"   // optional
            },
            ...
          ]
        }
 
    Returns enriched log list with ML predictions.
    """
    try:
        body = request.get_json(silent=True)
 
        if not body:
            return jsonify({
                "success": False,
                "error"  : "Request body must be valid JSON.",
            }), 400
 
        raw_logs = body.get("logs", [])
        if not isinstance(raw_logs, list) or len(raw_logs) == 0:
            return jsonify({
                "success": False,
                "error"  : "Provide a non-empty 'logs' array in the request body.",
            }), 400
 
        if len(raw_logs) > 500:
            return jsonify({
                "success": False,
                "error"  : "Batch size exceeds limit of 500 entries.",
            }), 400
 
        # ── Encode raw fields to feature dict ──────────────────────────────────
        encoded_logs = []
        for i, entry in enumerate(raw_logs):
            if not isinstance(entry, dict):
                return jsonify({
                    "success": False,
                    "error"  : f"Log entry at index {i} must be a JSON object.",
                }), 400
 
            status_code = entry.get("status_code", 200)
            if not isinstance(status_code, int):
                return jsonify({
                    "success": False,
                    "error"  : f"'status_code' at index {i} must be an integer.",
                }), 400
 
            encoded = encode_request_features(
                request_type = entry.get("method", "GET"),
                user_agent   = entry.get("user_agent", "Unknown"),
                location     = entry.get("location", "Unknown"),
                status_code  = status_code,
                session_id   = entry.get("session_id", 1000),
            )
            # Preserve original fields in output
            encoded["original"] = entry
            encoded_logs.append(encoded)
 
        enriched = detect_anomalies_batch(encoded_logs)
        anomaly_count = sum(1 for l in enriched if l.get("is_anomaly") == 1)
 
        return jsonify({
            "success"      : True,
            "total"        : len(enriched),
            "anomaly_count": anomaly_count,
            "anomaly_pct"  : round(anomaly_count / len(enriched) * 100, 2),
            "results"      : enriched,
        })
 
    except Exception as e:
        logger.exception(f"Custom anomaly detection error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500