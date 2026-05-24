"""
SentinelAI - Incident Analyzer (War Room Engine)
=================================================
Generates intelligent incident summaries including:
  - probable root cause
  - severity classification
  - affected endpoint
  - suggested remediation
  - estimated business impact
  - incident timeline
"""
 
import random
import logging
from datetime import datetime, timedelta
 
logger = logging.getLogger("SentinelAI.incident_analyzer")
 
# ── Root Cause Templates ───────────────────────────────────────────────────────
ROOT_CAUSE_TEMPLATES = {
    "500": [
        "Unhandled exception in application layer due to null-pointer dereference.",
        "Database connection pool exhausted — too many concurrent requests.",
        "Upstream microservice timeout exceeded configured threshold (30s).",
        "Memory leak causing OOM (Out-of-Memory) on application pod.",
        "Misconfigured environment variable causing runtime crash on startup.",
    ],
    "403": [
        "JWT token expiry not refreshed — sessions terminated en masse.",
        "RBAC policy update accidentally revoked access for user group.",
        "IP allowlist updated incorrectly — legitimate IPs blocked.",
        "API rate limiter overly aggressive after config push.",
        "CORS policy mismatch between CDN and origin server.",
    ],
    "404": [
        "Deployment removed endpoint without backward-compatible redirect.",
        "Slug-based routing change not communicated to API consumers.",
        "Feature flag disabled endpoint for 100% of traffic by mistake.",
        "Database migration deleted referenced resource IDs.",
    ],
    "429": [
        "Sudden traffic spike from marketing campaign exceeded rate limits.",
        "Bot activity from scrapers consuming API quota.",
        "Retry storm — clients retrying failures without exponential backoff.",
    ],
    "latency": [
        "N+1 query problem introduced in ORM layer causing database overload.",
        "Cold-start latency spike on serverless functions after scale-to-zero.",
        "CDN cache invalidation causing origin server overload.",
        "Slow third-party payment gateway API degrading checkout performance.",
        "Missing database index on high-traffic query introduced in migration.",
    ],
}
 
SUGGESTED_FIXES = {
    "500": [
        "Roll back the last deployment (git revert + redeploy).",
        "Scale up database connection pool and add connection retry logic.",
        "Increase upstream timeout or implement circuit breaker pattern.",
        "Add memory profiling; restart affected pods; file OOM budget alert.",
        "Audit environment variables against `.env.example`; redeploy.",
    ],
    "403": [
        "Force refresh all active JWT tokens via /api/auth/refresh.",
        "Revert RBAC policy change; audit permissions matrix.",
        "Restore previous IP allowlist from version control.",
        "Tune rate-limiter thresholds; implement tiered limits.",
        "Align CORS headers between CDN config and application.",
    ],
    "404": [
        "Add 301 redirect from old endpoint to new path.",
        "Coordinate API versioning strategy; communicate changes to consumers.",
        "Restore feature flag to previous state; run staged rollout.",
        "Restore deleted records from backup; run integrity checks.",
    ],
    "429": [
        "Increase rate limit tier for affected user segment.",
        "Enable Cloudflare Bot Management to block scraper IPs.",
        "Implement exponential backoff in client SDKs.",
    ],
    "latency": [
        "Add eager loading (JOIN) to replace N+1 queries; add DB indexes.",
        "Implement keep-alive to reduce serverless cold-starts.",
        "Warm CDN cache pre-deployment; stagger cache expiry.",
        "Add circuit breaker + fallback for third-party dependencies.",
        "Run EXPLAIN ANALYZE on slow queries; add composite index.",
    ],
}
 
BUSINESS_IMPACTS = {
    "critical": "Severe revenue loss estimated at $10K-$50K/hr. SLA breach imminent. Customer-facing checkout/auth fully unavailable.",
    "high":     "Significant degradation affecting ~30-60% of users. Support tickets spiking. NPS impact expected.",
    "medium":   "Partial disruption. Non-critical workflows affected. Some users experiencing errors or slowness.",
    "low":      "Minor anomaly with negligible end-user impact. Internal monitoring flagged; no customer reports yet.",
}
 
SEVERITY_COLORS = {
    "critical": "#FF3B30",
    "high":     "#FF9500",
    "medium":   "#FFCC00",
    "low":      "#34C759",
}
 
ENDPOINTS = [
    "/api/auth/login", "/api/payments/checkout", "/api/orders",
    "/api/users/profile", "/api/products", "/api/webhooks/stripe",
]
 
 
def _classify_severity(anomaly_rate: float, status_code: int) -> str:
    """Derive severity from anomaly rate and dominant status code."""
    if status_code in [500, 502, 503] and anomaly_rate > 0.3:
        return "critical"
    elif status_code in [500, 502, 503] or anomaly_rate > 0.2:
        return "high"
    elif status_code in [403, 429] or anomaly_rate > 0.1:
        return "medium"
    else:
        return "low"
 
 
def _pick_root_cause(status_code: int, latency_ms: int) -> str:
    if latency_ms > 2000:
        causes = ROOT_CAUSE_TEMPLATES["latency"]
    elif status_code >= 500:
        causes = ROOT_CAUSE_TEMPLATES.get("500", [])
    elif status_code == 403:
        causes = ROOT_CAUSE_TEMPLATES.get("403", [])
    elif status_code == 404:
        causes = ROOT_CAUSE_TEMPLATES.get("404", [])
    elif status_code == 429:
        causes = ROOT_CAUSE_TEMPLATES.get("429", [])
    else:
        causes = ROOT_CAUSE_TEMPLATES["latency"]
    return random.choice(causes)
 
 
def _pick_fix(status_code: int, latency_ms: int) -> str:
    if latency_ms > 2000:
        fixes = SUGGESTED_FIXES["latency"]
    elif status_code >= 500:
        fixes = SUGGESTED_FIXES.get("500", [])
    elif status_code == 403:
        fixes = SUGGESTED_FIXES.get("403", [])
    elif status_code == 404:
        fixes = SUGGESTED_FIXES.get("404", [])
    elif status_code == 429:
        fixes = SUGGESTED_FIXES.get("429", [])
    else:
        fixes = SUGGESTED_FIXES["latency"]
    return random.choice(fixes)
 
 
def generate_incident(
    incident_id: int | None = None,
    status_code: int | None = None,
    anomaly_rate: float | None = None,
    latency_ms: int | None = None,
) -> dict:
    """
    Generate a single enriched incident summary dict.
    All parameters are optional — random values used if omitted.
    """
    now = datetime.utcnow()
 
    # Randomize missing parameters
    if status_code  is None: status_code  = random.choice([500, 403, 404, 429, 502])
    if anomaly_rate is None: anomaly_rate = round(random.uniform(0.05, 0.45), 3)
    if latency_ms   is None: latency_ms   = random.randint(100, 4000)
    if incident_id  is None: incident_id  = random.randint(10000, 99999)
 
    severity         = _classify_severity(anomaly_rate, status_code)
    root_cause       = _pick_root_cause(status_code, latency_ms)
    suggested_fix    = _pick_fix(status_code, latency_ms)
    affected_endpoint= random.choice(ENDPOINTS)
    business_impact  = BUSINESS_IMPACTS[severity]
 
    # ── Incident timeline ──────────────────────────────────────────────────────
    detected_at   = now - timedelta(minutes=random.randint(5, 60))
    escalated_at  = detected_at + timedelta(minutes=random.randint(2, 10))
    resolved_at   = (
        escalated_at + timedelta(minutes=random.randint(10, 90))
        if severity in ["low", "medium"]
        else None
    )
 
    timeline = [
        {
            "time"  : detected_at.isoformat() + "Z",
            "event" : f"Anomaly detected — {anomaly_rate*100:.1f}% error rate on {affected_endpoint}",
            "type"  : "detection",
        },
        {
            "time"  : escalated_at.isoformat() + "Z",
            "event" : f"Alert escalated to on-call SRE team. Severity: {severity.upper()}",
            "type"  : "escalation",
        },
    ]
    if resolved_at:
        timeline.append({
            "time"  : resolved_at.isoformat() + "Z",
            "event" : "Incident resolved — error rate returned to baseline.",
            "type"  : "resolution",
        })
 
    return {
        "incident_id"       : f"INC-{incident_id}",
        "severity"          : severity,
        "severity_color"    : SEVERITY_COLORS[severity],
        "status"            : "resolved" if resolved_at else "active",
        "affected_endpoint" : affected_endpoint,
        "status_code"       : status_code,
        "anomaly_rate"      : anomaly_rate,
        "avg_latency_ms"    : latency_ms,
        "probable_root_cause": root_cause,
        "suggested_fix"     : suggested_fix,
        "business_impact"   : business_impact,
        "detected_at"       : detected_at.isoformat() + "Z",
        "escalated_at"      : escalated_at.isoformat() + "Z",
        "resolved_at"       : resolved_at.isoformat() + "Z" if resolved_at else None,
        "timeline"          : timeline,
        "generated_at"      : now.isoformat() + "Z",
    }
 
 
def generate_incidents_list(count: int = 10) -> list[dict]:
    """Generate a list of incident summaries for the incidents dashboard."""
    incidents = []
    for i in range(count):
        incident = generate_incident(incident_id=10000 + i)
        incidents.append(incident)
 
    # Sort by severity: critical → high → medium → low
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    incidents.sort(key=lambda x: order.get(x["severity"], 4))
    return incidents