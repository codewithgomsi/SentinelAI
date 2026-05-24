"""
SentinelAI - /api/analytics
============================
Provides aggregated analytics data derived from the dataset
and simulated traffic — suitable for charting on the frontend.
"""
 
import logging
import random
from collections import Counter
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
 
from ml.preprocessing import get_preprocessed_data
 
logger = logging.getLogger("SentinelAI.routes.analytics")
 
analytics_bp = Blueprint("analytics", __name__)
 
# Module-level cache so we don't reload the dataset on every request
_cached_df = None
 
 
def _get_df():
    """Lazy-load and cache the cleaned dataset."""
    global _cached_df
    if _cached_df is None:
        _, _, _, _, _, df = get_preprocessed_data()
        _cached_df = df
    return _cached_df
 
 
@analytics_bp.route("/analytics", methods=["GET"])
def get_analytics():
    """
    GET /api/analytics?period=<24h|7d|30d>
 
    Returns rich analytics computed from the real dataset:
      - request method distribution
      - status code distribution
      - location heatmap
      - user-agent breakdown
      - hourly traffic pattern
      - anomaly trend by day
    """
    try:
        period = request.args.get("period", "7d").lower()
        if period not in ("24h", "7d", "30d"):
            return jsonify({
                "success": False,
                "error"  : "Invalid period. Use: 24h | 7d | 30d",
            }), 400
 
        df = _get_df()
 
        # ── Method distribution ────────────────────────────────────────────────
        method_counts = df["Request_Type"].value_counts().to_dict()
 
        # ── Status code distribution ───────────────────────────────────────────
        status_counts = df["Status_Code"].value_counts().to_dict()
        status_dist = [
            {"code": str(k), "count": int(v), "label": _code_label(k)}
            for k, v in sorted(status_counts.items())
        ]
 
        # ── Location breakdown ─────────────────────────────────────────────────
        location_counts = df["Location"].value_counts().head(10).to_dict()
        location_data = [
            {"location": loc, "requests": int(cnt)}
            for loc, cnt in location_counts.items()
        ]
 
        # ── User-Agent distribution ────────────────────────────────────────────
        ua_counts = df["User_Agent"].value_counts().to_dict()
 
        # ── Hourly traffic pattern (average requests per hour of day) ──────────
        if "Timestamp" in df.columns:
            hourly = df.groupby(df["Timestamp"].dt.hour).size().to_dict()
        else:
            hourly = {h: random.randint(50, 200) for h in range(24)}
 
        hourly_pattern = [
            {"hour": f"{h:02d}:00", "requests": int(hourly.get(h, 0))}
            for h in range(24)
        ]
 
        # ── Anomaly trend (simulated daily counts for requested period) ────────
        anomaly_trend = _build_anomaly_trend(df, period)
 
        # ── Summary KPIs ──────────────────────────────────────────────────────
        total         = len(df)
        anomaly_total = int(df["Anomaly_Flag"].sum())
        error_total   = int((df["Status_Code"] >= 500).sum())
 
        return jsonify({
            "success"          : True,
            "period"           : period,
            "generated_at"     : datetime.utcnow().isoformat() + "Z",
            "summary"          : {
                "total_requests": total,
                "total_anomalies": anomaly_total,
                "total_errors"  : error_total,
                "anomaly_rate"  : round(anomaly_total / total * 100, 2),
                "error_rate"    : round(error_total   / total * 100, 2),
            },
            "method_distribution"  : method_counts,
            "status_distribution"  : status_dist,
            "location_heatmap"     : location_data,
            "user_agent_breakdown" : ua_counts,
            "hourly_traffic_pattern": hourly_pattern,
            "anomaly_trend"        : anomaly_trend,
        })
 
    except Exception as e:
        logger.exception(f"Analytics error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 
 
# ── Helpers ────────────────────────────────────────────────────────────────────
 
def _code_label(code: int) -> str:
    if code < 300:   return "Success"
    if code < 400:   return "Redirect"
    if code < 500:   return "Client Error"
    return "Server Error"
 
 
def _build_anomaly_trend(df, period: str) -> list:
    """
    Build day-by-day anomaly counts.
    Uses real dataset dates if available, otherwise simulates.
    """
    days = {"24h": 1, "7d": 7, "30d": 30}[period]
    now  = datetime.utcnow()
    trend = []
 
    if "Timestamp" in df.columns:
        daily = df.groupby(df["Timestamp"].dt.date)["Anomaly_Flag"].agg(
            ["sum", "count"]
        )
        for i in range(days):
            date = (now - timedelta(days=i)).date()
            row  = daily.loc[date] if date in daily.index else None
            trend.append({
                "date"     : str(date),
                "anomalies": int(row["sum"])   if row is not None else random.randint(5, 40),
                "requests" : int(row["count"]) if row is not None else random.randint(100, 500),
            })
    else:
        for i in range(days):
            date = (now - timedelta(days=i)).date()
            trend.append({
                "date"     : str(date),
                "anomalies": random.randint(5, 40),
                "requests" : random.randint(100, 500),
            })
 
    return list(reversed(trend))