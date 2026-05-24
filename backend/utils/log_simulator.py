"""
SentinelAI - Realistic API Log Simulator
==========================================
Generates synthetic but realistic API log entries that mirror
the structure of the cybersecurity dataset.
 
Used by:
  - /api/live-logs  (streaming simulation)
  - /api/anomaly-detection (batch demo)
"""
 
import random
import logging
from datetime import datetime, timedelta
 
logger = logging.getLogger("SentinelAI.log_simulator")
 
# ── Simulation Constants ───────────────────────────────────────────────────────
ENDPOINTS = [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/users",
    "/api/users/{id}",
    "/api/payments",
    "/api/payments/{id}",
    "/api/products",
    "/api/products/{id}",
    "/api/orders",
    "/api/orders/{id}",
    "/api/health",
    "/api/analytics",
    "/api/reports",
    "/api/admin/settings",
    "/api/webhooks",
]
 
REQUEST_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"]
 
STATUS_CODES = [
    200, 200, 200, 200,   # Most common: success
    201, 204,             # Create / no-content
    301, 302,             # Redirects
    400, 401, 403, 404,   # Client errors
    429,                  # Rate-limited
    500, 502, 503,        # Server errors
]
 
USER_AGENTS = [
    "Chrome/114.0 (Windows)",
    "Firefox/115.0 (Linux)",
    "Safari/16.5 (macOS)",
    "Edge/114.0 (Windows)",
    "Boto3/1.26 (Python)",
    "curl/7.88.1",
    "PostmanRuntime/7.32",
    "Apache-HttpClient/4.5",
    "Googlebot/2.1",
    "Unknown Bot",
]
 
LOCATIONS = [
    "USA", "India", "Germany", "France", "Brazil",
    "China", "Canada", "UK", "Australia", "Japan",
]
 
IP_RANGES = [
    "192.168.{}.{}",
    "10.0.{}.{}",
    "172.{}.{}.{}",
    "{}.{}.{}.{}",
]
 
# Status codes that are classified as errors / anomaly-prone
ERROR_CODES    = {500, 502, 503}
WARN_CODES     = {400, 401, 403, 404, 429}
REDIRECT_CODES = {301, 302, 307, 308}
 
 
def _random_ip() -> str:
    return f"{random.randint(1,254)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
 
 
def _random_latency(status_code: int) -> int:
    """
    Generate realistic latency (ms) correlated with status code.
    Error responses tend to have higher latency.
    """
    if status_code in ERROR_CODES:
        return random.randint(800, 5000)
    elif status_code in WARN_CODES:
        return random.randint(200, 1200)
    elif status_code in REDIRECT_CODES:
        return random.randint(50, 300)
    else:
        return random.randint(20, 400)
 
 
def _anomaly_flag(status_code: int, latency: int, hour: int) -> int:
    """
    Heuristic anomaly labelling for simulated logs.
    Mirrors the ground-truth labelling in the real dataset (~5 % anomaly rate).
    """
    score = 0
    if status_code in ERROR_CODES:    score += 3
    if status_code in WARN_CODES:     score += 1
    if latency > 2000:                score += 2
    if hour < 5 or hour > 22:         score += 1  # Late-night activity
    return int(score >= 4)
 
 
def generate_log_entry(timestamp: datetime | None = None) -> dict:
    """
    Generate a single realistic API log entry.
 
    Returns a dict with all fields needed by the dashboard and ML model.
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
 
    status_code = random.choice(STATUS_CODES)
    latency     = _random_latency(status_code)
    hour        = timestamp.hour
    day_of_week = timestamp.weekday()
    is_night    = int(hour >= 22 or hour <= 5)
    is_error    = int(status_code in ERROR_CODES)
    is_4xx      = int(status_code in WARN_CODES)
    is_redirect = int(status_code in REDIRECT_CODES)
    session_id  = random.randint(1000, 5000)
    session_norm = (session_id - 1000) / 4000.0
 
    method      = random.choice(REQUEST_METHODS)
    endpoint    = random.choice(ENDPOINTS)
    user_agent  = random.choice(USER_AGENTS)
    location    = random.choice(LOCATIONS)
    ip_address  = _random_ip()
 
    anomaly_flag = _anomaly_flag(status_code, latency, hour)
 
    return {
        # Raw log fields
        "timestamp"    : timestamp.isoformat() + "Z",
        "ip_address"   : ip_address,
        "method"       : method,
        "endpoint"     : endpoint,
        "status_code"  : status_code,
        "latency_ms"   : latency,
        "user_agent"   : user_agent,
        "location"     : location,
        "session_id"   : session_id,
 
        # Pre-computed feature flags (used by ML model)
        "hour"             : hour,
        "day_of_week"      : day_of_week,
        "is_night"         : is_night,
        "is_error"         : is_error,
        "is_4xx"           : is_4xx,
        "is_redirect"      : is_redirect,
        "session_norm"     : round(session_norm, 4),
        "request_type_enc" : abs(hash(method))      % 5,
        "user_agent_enc"   : abs(hash(user_agent))  % 10,
        "location_enc"     : abs(hash(location))    % 20,
 
        # Ground-truth anomaly label (for simulation purposes)
        "anomaly_flag" : anomaly_flag,
    }
 
 
def generate_log_batch(n: int = 20, spread_minutes: int = 5) -> list[dict]:
    """
    Generate a batch of n log entries with timestamps spread over
    the past `spread_minutes` minutes.
    """
    now  = datetime.utcnow()
    logs = []
    for i in range(n):
        ts  = now - timedelta(seconds=random.randint(0, spread_minutes * 60))
        log = generate_log_entry(timestamp=ts)
        logs.append(log)
 
    # Sort newest → oldest
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs
 
 
def generate_historical_logs(hours: int = 24, per_hour: int = 60) -> list[dict]:
    """
    Generate historical logs for analytics charts.
    Returns logs spanning the past `hours` hours, `per_hour` entries each.
    """
    now  = datetime.utcnow()
    logs = []
    for h in range(hours):
        base_ts = now - timedelta(hours=h)
        for _ in range(per_hour):
            offset = random.randint(0, 3599)
            ts     = base_ts - timedelta(seconds=offset)
            logs.append(generate_log_entry(timestamp=ts))
 
    logs.sort(key=lambda x: x["timestamp"])
    return logs