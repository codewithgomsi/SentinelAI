"""
SentinelAI - /api/model-evaluation
=====================================
Exposes the trained model's evaluation metrics, confusion matrix,
and feature importance information for the Model Evaluation tab.
"""
 
import logging
from datetime import datetime
from flask import Blueprint, jsonify
 
from ml.train import train_model, load_model_meta
 
logger = logging.getLogger("SentinelAI.routes.model_eval")
 
model_eval_bp = Blueprint("model_eval", __name__)
 
 
@model_eval_bp.route("/model-evaluation", methods=["GET"])
def get_model_evaluation():
    """
    GET /api/model-evaluation
 
    Returns:
        {
          success, model_info, metrics, confusion_matrix,
          distribution, feature_names
        }
    """
    try:
        # ── Load or train model ────────────────────────────────────────────────
        meta = load_model_meta()
        if not meta:
            logger.info("No model found — triggering training...")
            meta = train_model()
 
        metrics = meta.get("metrics", {})
 
        # ── Confusion matrix in a frontend-friendly format ─────────────────────
        cm_raw = metrics.get("confusion_matrix", {})
        confusion_matrix_data = {
            "labels" : cm_raw.get("labels", ["Normal", "Anomaly"]),
            "matrix" : cm_raw.get("matrix", [[0, 0], [0, 0]]),
            "stats"  : {
                "true_positives"  : metrics.get("true_positives",  0),
                "true_negatives"  : metrics.get("true_negatives",  0),
                "false_positives" : metrics.get("false_positives", 0),
                "false_negatives" : metrics.get("false_negatives", 0),
            },
        }
 
        # ── Class distribution ─────────────────────────────────────────────────
        total   = meta.get("n_samples",     0)
        anomaly = meta.get("anomaly_count", 0)
        normal  = meta.get("normal_count",  total - anomaly)
 
        distribution = {
            "total"          : total,
            "normal"         : normal,
            "anomaly"        : anomaly,
            "normal_pct"     : round(normal  / total * 100, 2) if total else 0,
            "anomaly_pct"    : round(anomaly / total * 100, 2) if total else 0,
        }
 
        return jsonify({
            "success"          : True,
            "generated_at"     : datetime.utcnow().isoformat() + "Z",
            "model_info"       : {
                "algorithm"    : "Isolation Forest",
                "n_estimators" : meta.get("n_estimators",  200),
                "contamination": meta.get("contamination", 0.05),
                "n_features"   : meta.get("n_features",    11),
                "n_samples"    : meta.get("n_samples",     0),
                "status"       : "trained",
            },
            "metrics"          : {
                "accuracy"     : metrics.get("accuracy",  0),
                "precision"    : metrics.get("precision", 0),
                "recall"       : metrics.get("recall",    0),
                "f1_score"     : metrics.get("f1_score",  0),
                "roc_auc"      : metrics.get("roc_auc",   None),
            },
            "confusion_matrix" : confusion_matrix_data,
            "distribution"     : distribution,
            "feature_names"    : meta.get("feature_names", []),
        })
 
    except Exception as e:
        logger.exception(f"Model evaluation error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 
 
@model_eval_bp.route("/model-evaluation/retrain", methods=["POST"])
def retrain_model():
    """
    POST /api/model-evaluation/retrain
 
    Forces a full model retrain. Returns updated metrics.
    """
    try:
        logger.info("Retraining model via API request...")
        meta = train_model(force_retrain=True)
        return jsonify({
            "success"    : True,
            "message"    : "Model retrained successfully.",
            "metrics"    : meta.get("metrics", {}),
            "retrained_at": datetime.utcnow().isoformat() + "Z",
        })
 
    except Exception as e:
        logger.exception(f"Retrain error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
 