"""
SentinelAI - /api/health
==========================
Simple health check endpoint used by load balancers,
orchestrators (Kubernetes), and monitoring tools.
"""
 
import logging
import os
from datetime import datetime
from flask import Blueprint, jsonify
 
from ml.train import load_model_meta
 
logger = logging.getLogger("SentinelAI.routes.health")
 
health_bp = Blueprint("health", __name__)
 
_start_time = datetime.utcnow()
 
 
@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    GET /api/health
 
    Returns basic liveness/readiness information.
    HTTP 200 = healthy, HTTP 503 = unhealthy.
    """
    try:
        uptime_seconds = int((datetime.utcnow() - _start_time).total_seconds())
 
        # Check model availability
        meta = load_model_meta()
        model_ready = bool(meta)
 
        payload = {
            "success"       : True,
            "status"        : "healthy",
            "service"       : "SentinelAI Backend",
            "version"       : os.getenv("APP_VERSION", "1.0.0"),
            "timestamp"     : datetime.utcnow().isoformat() + "Z",
            "uptime_seconds": uptime_seconds,
            "model_ready"   : model_ready,
            "environment"   : os.getenv("FLASK_ENV", "development"),
        }
 
        return jsonify(payload), 200
 
    except Exception as e:
        logger.exception(f"Health check error: {e}")
        return jsonify({
            "success": False,
            "status" : "unhealthy",
            "error"  : str(e),
        }), 503