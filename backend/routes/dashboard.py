"""
SentinelAI - /api/dashboard
============================
Returns high-level KPI summary cards and trend data for the
main monitoring dashboard.
"""
 
import logging
import random
from datetime import datetime, timedelta
from flask import Blueprint, jsonify
 
from utils.log_simulator import generate_log_batch
 
logger = logging.getLogger("SentinelAI.routes.dashboard")
 
dashboard_bp = Blueprint("dashboard", __name__)
 
 
@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    """
    GET /api/dashboard
 
    Returns:
        {
          success: bool,
          kpis: { total_requests, anomalies_detected, error_rate, avg_latency_ms, uptime_pct },
          status_distribution: [ { code, count, label } ],
          hourly_trend: [ { hour, requests, anomalies } ],
          top_endpoints: [ { endpoint, requests, error_rate } ],
          recent_logs: [ ... 10 log entries ... ]
        }
    """
    try:
        # ── Generate a fresh batch of simulated logs ───────────────────────────
        logs = generate_log_batch(n=200, spread_minutes=60)
 
        total_requests   = len(logs)
        anomaly_count    = sum(l["anomaly_flag"] for l in logs)
        error_count      = sum(1 for l in logs if l["status_code"] >= 500)
        avg_latency      = round(sum(l["latency_ms"] for l in logs) / total_requests, 1)
        error_rate       = round(error_count / total_requests * 100, 2)
        uptime_pct       = round(100 - error_rate * 0.3, 2)  # heuristic uptime
 
        # ── Status code distribution ───────────────────────────────────────────
        code_buckets = {}
        for log in logs:
            code = str(log["status_code"])
            code_buckets[code] = code_buckets.get(code, 0) + 1
 
        status_dist = [
            {"code": code, "count": cnt, "label": _status_label(int(code))}
            for code, cnt in sorted(code_buckets.items())
        ]
 
        # ── Hourly trend (last 12 hours, aggregated from logs) ─────────────────
        hourly_trend = _build_hourly_trend(logs, hours=12)
 
        # ── Top endpoints by request volume ───────────────────────────────────
        top_endpoints = _build_top_endpoints(logs)
 
        return jsonify({
            "success"            : True,
            "generated_at"       : datetime.utcnow().isoformat() + "Z",
            "kpis"               : {
                "total_requests"    : total_requests,
                "anomalies_detected": anomaly_count,
                "error_rate_pct"    : error_rate,
                "avg_latency_ms"    : avg_latency,
                "uptime_pct"        : uptime_pct,
            },
            "status_distribution": status_dist,
            "hourly_trend"       : hourly_trend,
            "top_endpoints"      : top_endpoints,
            "recent_logs"        : logs[:10],   # Latest 10 only
        })
 
    except Exception as e:
        logger.exception(f"Dashboard error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 
 
# ── Helpers ────────────────────────────────────────────────────────────────────
 
def _status_label(code: int) -> str:
    if code < 300:   return "Success"
    if code < 400:   return "Redirect"
    if code < 500:   return "Client Error"
    return "Server Error"
 
 
def _build_hourly_trend(logs: list, hours: int = 12) -> list:
    now = datetime.utcnow()
    buckets = {}
    for h in range(hours):
        key = (now - timedelta(hours=h)).strftime("%H:00")
        buckets[key] = {"hour": key, "requests": 0, "anomalies": 0, "errors": 0}
 
    for log in logs:
        try:
            ts  = datetime.fromisoformat(log["timestamp"].replace("Z", ""))
            key = ts.strftime("%H:00")
            if key in buckets:
                buckets[key]["requests"]  += 1
                buckets[key]["anomalies"] += log.get("anomaly_flag", 0)
                buckets[key]["errors"]    += int(log["status_code"] >= 500)
        except Exception:
            continue
 
    return list(reversed(list(buckets.values())))
 
 
def _build_top_endpoints(logs: list) -> list:
    ep_stats = {}
    for log in logs:
        ep = log["endpoint"]
        if ep not in ep_stats:
            ep_stats[ep] = {"requests": 0, "errors": 0}
        ep_stats[ep]["requests"] += 1
        if log["status_code"] >= 400:
            ep_stats[ep]["errors"] += 1
 
    results = []
    for ep, stats in ep_stats.items():
        error_rate = round(stats["errors"] / stats["requests"] * 100, 1)
        results.append({
            "endpoint"   : ep,
            "requests"   : stats["requests"],
            "errors"     : stats["errors"],
            "error_rate" : error_rate,
        })
 
    return sorted(results, key=lambda x: x["requests"], reverse=True)[:8]