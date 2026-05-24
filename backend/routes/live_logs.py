"""
SentinelAI - /api/live-logs
============================
Returns a simulated stream of live API log entries,
each enriched with ML-based anomaly detection results.
"""
 
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
 
from utils.log_simulator import generate_log_batch
from ml.detector import detect_anomalies_batch
 
logger = logging.getLogger("SentinelAI.routes.live_logs")
 
live_logs_bp = Blueprint("live_logs", __name__)
 
 
@live_logs_bp.route("/live-logs", methods=["GET"])
def get_live_logs():
    """
    GET /api/live-logs?count=<int>&filter=<all|anomaly|error>
 
    Query params:
        count  : Number of log entries to return (default: 30, max: 100)
        filter : One of 'all', 'anomaly', 'error' (default: 'all')
 
    Returns:
        {
          success: bool,
          count: int,
          logs: [ enriched log entries ],
          summary: { total, anomalies, errors, avg_latency }
        }
    """
    try:
        # ── Parse & validate query parameters ─────────────────────────────────
        count = request.args.get("count", 30, type=int)
        count = max(1, min(count, 100))  # Clamp between 1 and 100
 
        log_filter = request.args.get("filter", "all").lower()
        if log_filter not in ("all", "anomaly", "error"):
            return jsonify({
                "success" : False,
                "error"   : "Invalid filter. Use: all | anomaly | error",
            }), 400
 
        # ── Generate & enrich logs ─────────────────────────────────────────────
        raw_logs = generate_log_batch(n=count * 3, spread_minutes=10)
        enriched = detect_anomalies_batch(raw_logs)
 
        # ── Apply filter ───────────────────────────────────────────────────────
        if log_filter == "anomaly":
            enriched = [l for l in enriched if l.get("is_anomaly") == 1]
        elif log_filter == "error":
            enriched = [l for l in enriched if l.get("status_code", 0) >= 500]
 
        # Limit to requested count
        enriched = enriched[:count]
 
        # ── Build summary ──────────────────────────────────────────────────────
        total     = len(enriched)
        anomalies = sum(1 for l in enriched if l.get("is_anomaly") == 1)
        errors    = sum(1 for l in enriched if l.get("status_code", 0) >= 500)
        avg_lat   = (
            round(sum(l.get("latency_ms", 0) for l in enriched) / total, 1)
            if total > 0 else 0
        )
 
        return jsonify({
            "success"   : True,
            "fetched_at": datetime.utcnow().isoformat() + "Z",
            "count"     : total,
            "filter"    : log_filter,
            "summary"   : {
                "total"       : total,
                "anomalies"   : anomalies,
                "errors"      : errors,
                "avg_latency" : avg_lat,
            },
            "logs"      : enriched,
        })
 
    except Exception as e:
        logger.exception(f"Live-logs error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500