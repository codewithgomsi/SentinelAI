"""
SentinelAI - /api/war-room
============================
The AI War Room — generates an intelligent situational summary
for the on-call team during active incidents.
 
Provides:
  - Active critical/high incidents
  - Aggregated system health score
  - SRE action checklist
  - AI-generated executive summary (rule-based placeholder)
  - Affected services map
"""
 
import logging
import random
from datetime import datetime, timedelta
from flask import Blueprint, jsonify
 
from utils.incident_analyzer import generate_incidents_list
 
logger = logging.getLogger("SentinelAI.routes.war_room")
 
war_room_bp = Blueprint("war_room", __name__)
 
SERVICES = [
    "auth-service", "payment-gateway", "user-api",
    "order-service", "notification-service", "analytics-engine",
    "cdn-edge", "database-cluster", "cache-layer", "api-gateway",
]
 
STATUS_OPTIONS = ["healthy", "degraded", "critical", "unknown"]
 
 
@war_room_bp.route("/war-room", methods=["GET"])
def get_war_room():
    """
    GET /api/war-room
 
    Returns a comprehensive war room situational summary:
      - system_health_score (0-100)
      - active_incidents (critical + high only)
      - service_health_map
      - sre_checklist
      - executive_summary
      - recent_deployments
      - recommended_actions
    """
    try:
        # ── Active incidents (critical + high) ─────────────────────────────────
        all_incidents = generate_incidents_list(count=20)
        active = [
            i for i in all_incidents
            if i["severity"] in ("critical", "high") and i["status"] == "active"
        ]
 
        # ── System health score ────────────────────────────────────────────────
        critical_count = sum(1 for i in all_incidents if i["severity"] == "critical")
        high_count     = sum(1 for i in all_incidents if i["severity"] == "high")
        health_score   = max(0, 100 - (critical_count * 15) - (high_count * 5))
 
        # ── Service health map ─────────────────────────────────────────────────
        service_health = []
        for svc in SERVICES:
            if critical_count > 2:
                weights = [0.2, 0.3, 0.4, 0.1]
            elif critical_count > 0:
                weights = [0.5, 0.3, 0.15, 0.05]
            else:
                weights = [0.75, 0.2, 0.03, 0.02]
 
            status   = random.choices(STATUS_OPTIONS, weights=weights)[0]
            latency  = random.randint(20, 3000) if status != "healthy" else random.randint(10, 150)
            error_rt = round(random.uniform(0.01, 0.45) if status != "healthy" else random.uniform(0, 0.05), 3)
 
            service_health.append({
                "service"   : svc,
                "status"    : status,
                "latency_ms": latency,
                "error_rate": error_rt,
                "uptime_pct": round(random.uniform(95, 100) if status == "healthy" else random.uniform(60, 95), 2),
            })
 
        # ── SRE Checklist ──────────────────────────────────────────────────────
        sre_checklist = _build_checklist(active)
 
        # ── Executive Summary ──────────────────────────────────────────────────
        exec_summary = _build_executive_summary(health_score, active, critical_count)
 
        # ── Recent deployments (simulated) ────────────────────────────────────
        recent_deployments = _build_deployments()
 
        # ── Recommended actions ────────────────────────────────────────────────
        recommended_actions = _build_recommended_actions(active)
 
        return jsonify({
            "success"             : True,
            "generated_at"        : datetime.utcnow().isoformat() + "Z",
            "system_health_score" : health_score,
            "system_status"       : _health_label(health_score),
            "active_incident_count": len(active),
            "active_incidents"    : active[:5],  # Top 5 only
            "service_health_map"  : service_health,
            "sre_checklist"       : sre_checklist,
            "executive_summary"   : exec_summary,
            "recent_deployments"  : recent_deployments,
            "recommended_actions" : recommended_actions,
        })
 
    except Exception as e:
        logger.exception(f"War room error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 
 
# ── Helpers ────────────────────────────────────────────────────────────────────
 
def _health_label(score: int) -> str:
    if score >= 90: return "healthy"
    if score >= 70: return "degraded"
    if score >= 50: return "critical"
    return "outage"
 
 
def _build_checklist(active_incidents: list) -> list:
    base_checklist = [
        {"task": "Verify on-call SRE is paged and acknowledged",    "priority": "P0", "done": True},
        {"task": "Check recent deployments in the last 2 hours",    "priority": "P0", "done": False},
        {"task": "Inspect error logs on affected services",          "priority": "P0", "done": False},
        {"task": "Review database connection pool metrics",          "priority": "P1", "done": False},
        {"task": "Validate upstream dependencies are healthy",       "priority": "P1", "done": False},
        {"task": "Check CDN / load balancer health",                 "priority": "P1", "done": False},
        {"task": "Notify stakeholders via incident Slack channel",   "priority": "P1", "done": random.choice([True, False])},
        {"task": "Prepare rollback plan if fix takes > 30 minutes",  "priority": "P2", "done": False},
        {"task": "Update status page for external customers",        "priority": "P2", "done": False},
        {"task": "Schedule post-mortem within 48 hours of resolution","priority": "P3", "done": False},
    ]
    return base_checklist
 
 
def _build_executive_summary(health_score: int, active: list, critical_count: int) -> str:
    if health_score >= 90:
        return (
            "All systems are operating normally. No active incidents. "
            "Anomaly detection is running and monitoring all endpoints. "
            "System health is excellent at 90%+. No action required."
        )
    elif health_score >= 70:
        endpoints = list({i["affected_endpoint"] for i in active[:2]})
        return (
            f"System is experiencing degraded performance. "
            f"{len(active)} high-priority incident(s) are currently active, "
            f"primarily affecting {', '.join(endpoints)}. "
            "Engineering team is actively investigating. "
            "No customer-facing outage has been confirmed. "
            "Estimated resolution: 15-30 minutes."
        )
    else:
        endpoints = list({i["affected_endpoint"] for i in active[:3]})
        return (
            f"CRITICAL SITUATION: {critical_count} critical incident(s) detected. "
            f"Multiple services degraded, including: {', '.join(endpoints)}. "
            "Immediate escalation to engineering leadership recommended. "
            "Customer impact is confirmed. Status page should be updated. "
            "All hands on deck. Estimated resolution: 45-90 minutes."
        )
 
 
def _build_deployments() -> list:
    services = random.sample(SERVICES, 4)
    deploys  = []
    for i, svc in enumerate(services):
        ts = datetime.utcnow() - timedelta(hours=i * 2 + random.randint(0, 1))
        deploys.append({
            "service"   : svc,
            "version"   : f"v{random.randint(1,5)}.{random.randint(0,20)}.{random.randint(0,9)}",
            "deployed_at": ts.isoformat() + "Z",
            "deployed_by": random.choice(["alice@co.com", "bob@co.com", "ci-cd-pipeline"]),
            "status"    : random.choice(["success", "success", "success", "failed"]),
        })
    return deploys
 
 
def _build_recommended_actions(active: list) -> list:
    actions = [
        {
            "priority": "immediate",
            "action"  : "Roll back most recent deployment if anomalies started post-deploy.",
            "owner"   : "On-Call SRE",
        },
        {
            "priority": "immediate",
            "action"  : "Scale up affected service pods by 2x to handle traffic surge.",
            "owner"   : "Platform Team",
        },
        {
            "priority": "short-term",
            "action"  : "Add circuit breaker around slow third-party dependencies.",
            "owner"   : "Backend Team",
        },
        {
            "priority": "short-term",
            "action"  : "Tune anomaly detection threshold based on recent false-positive rate.",
            "owner"   : "ML Team",
        },
        {
            "priority": "long-term",
            "action"  : "Implement chaos engineering tests to validate recovery playbooks.",
            "owner"   : "SRE / Infra",
        },
    ]
    return actions
 