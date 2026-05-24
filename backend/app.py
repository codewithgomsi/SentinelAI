"""
SentinelAI - AI-Powered API Failure Detection & Debugging Platform
==================================================================
Main Flask application entry point.
Registers all route blueprints and initializes the server.
"""

import os
import logging
from flask import Flask, jsonify

# Load environment variables from .env file (gracefully skip if not installed)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Logging Configuration ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("SentinelAI")

# ── Import Route Blueprints ────────────────────────────────────────────────────
from routes.dashboard      import dashboard_bp
from routes.live_logs      import live_logs_bp
from routes.anomaly        import anomaly_bp
from routes.analytics      import analytics_bp
from routes.incidents      import incidents_bp
from routes.model_eval     import model_eval_bp
from routes.war_room       import war_room_bp
from routes.health         import health_bp


def create_app() -> Flask:
    """
    Application factory — creates and configures the Flask app.
    Returns the fully configured Flask instance.
    """
    app = Flask(__name__)

    # ── CORS — manual headers (no flask-cors dependency needed) ───────────────
    @app.after_request
    def add_cors_headers(response):
        allowed_origins = os.getenv("CORS_ORIGINS", "*")
        response.headers["Access-Control-Allow-Origin"]  = allowed_origins
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    @app.before_request
    def handle_preflight():
        from flask import request
        if request.method == "OPTIONS":
            return jsonify({}), 200

    # ── Register Blueprints (all prefixed with /api) ───────────────────────────
    app.register_blueprint(dashboard_bp,   url_prefix="/api")
    app.register_blueprint(live_logs_bp,   url_prefix="/api")
    app.register_blueprint(anomaly_bp,     url_prefix="/api")
    app.register_blueprint(analytics_bp,   url_prefix="/api")
    app.register_blueprint(incidents_bp,   url_prefix="/api")
    app.register_blueprint(model_eval_bp,  url_prefix="/api")
    app.register_blueprint(war_room_bp,    url_prefix="/api")
    app.register_blueprint(health_bp,      url_prefix="/api")

    # ── Global Error Handlers ──────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found", "code": 404}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "error": "Method not allowed", "code": 405}), 405

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"success": False, "error": "Internal server error", "code": 500}), 500

    logger.info("SentinelAI Flask application initialized successfully.")
    return app


# ── Entry Point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app()
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"

    logger.info(f"Starting SentinelAI on {host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)
