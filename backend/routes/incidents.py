"""
SentinelAI - /api/incidents
============================
Returns a list of generated incident summaries with root-cause
analysis, severity, and business-impact information.
"""
 
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
 
from utils.incident_analyzer import generate_incidents_list, generate_incident
 
logger = logging.getLogger("SentinelAI.routes.incidents")
 
incidents_bp = Blueprint("incidents", __name__)
 
 
@incidents_bp.route("/incidents", methods=["GET"])
def get_incidents():
    """
    GET /api/incidents?count=<int>&severity=<all|critical|high|medium|low>
 
    Returns:
        {
          success, total, incidents: [ ... ],
          severity_summary: { critical, high, medium, low }
        }
    """
    try:
        count    = request.args.get("count", 10, type=int)
        count    = max(1, min(count, 50))
        severity = request.args.get("severity", "all").lower()
 
        if severity not in ("all", "critical", "high", "medium", "low"):
            return jsonify({
                "success": False,
                "error"  : "Invalid severity. Use: all | critical | high | medium | low",
            }), 400
 
        incidents = generate_incidents_list(count=count * 2)  # Generate more, then filter
 
        if severity != "all":
            incidents = [i for i in incidents if i["severity"] == severity]
 
        incidents = incidents[:count]
 
        sev_summary = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for inc in incidents:
            sev = inc.get("severity", "low")
            sev_summary[sev] = sev_summary.get(sev, 0) + 1
 
        return jsonify({
            "success"        : True,
            "generated_at"   : datetime.utcnow().isoformat() + "Z",
            "total"          : len(incidents),
            "severity_summary": sev_summary,
            "incidents"      : incidents,
        })
 
    except Exception as e:
        logger.exception(f"Incidents error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 
 
@incidents_bp.route("/incidents/<incident_id>", methods=["GET"])
def get_incident_detail(incident_id: str):
    """
    GET /api/incidents/<incident_id>
 
    Returns a single detailed incident report.
    For demo purposes this generates a consistent-looking report
    based on the incident_id string.
    """
    try:
        # Derive a seed from the incident ID for reproducibility
        seed = abs(hash(incident_id)) % 100000
        incident = generate_incident(incident_id=seed)
        incident["incident_id"] = incident_id  # Override with requested ID
 
        return jsonify({
            "success" : True,
            "incident": incident,
        })
 
    except Exception as e:
        logger.exception(f"Incident detail error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500