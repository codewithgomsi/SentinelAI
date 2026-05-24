"""
SentinelAI - Model Evaluation Module
======================================
Computes classification metrics and confusion-matrix data
for the Isolation Forest anomaly detector.
"""
 
import logging
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
)
 
logger = logging.getLogger("SentinelAI.evaluation")
 
 
def evaluate_model(y_true: np.ndarray, y_pred: np.ndarray, scores: np.ndarray = None) -> dict:
    """
    Calculate full classification evaluation metrics.
 
    Args:
        y_true  : Ground-truth binary labels (0=normal, 1=anomaly).
        y_pred  : Predicted binary labels (0=normal, 1=anomaly).
        scores  : Continuous anomaly scores from decision_function (optional).
 
    Returns:
        dict containing all evaluation metrics + confusion-matrix breakdown.
    """
    # ── Core metrics ───────────────────────────────────────────────────────────
    accuracy  = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall    = recall_score(y_true, y_pred, zero_division=0)
    f1        = f1_score(y_true, y_pred, zero_division=0)
 
    # ── Confusion matrix ───────────────────────────────────────────────────────
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
 
    # ── ROC-AUC (only if scores available and both classes present) ────────────
    roc_auc = None
    if scores is not None and len(np.unique(y_true)) > 1:
        try:
            # Invert scores: more negative = more anomalous → flip sign
            roc_auc = round(float(roc_auc_score(y_true, -scores)), 4)
        except Exception as e:
            logger.warning(f"Could not compute ROC-AUC: {e}")
 
    metrics = {
        "accuracy"         : round(float(accuracy),  4),
        "precision"        : round(float(precision), 4),
        "recall"           : round(float(recall),    4),
        "f1_score"         : round(float(f1),        4),
        "roc_auc"          : roc_auc,
        "true_positives"   : int(tp),
        "true_negatives"   : int(tn),
        "false_positives"  : int(fp),
        "false_negatives"  : int(fn),
        "total_samples"    : int(len(y_true)),
        "anomaly_count"    : int(y_pred.sum()),
        "normal_count"     : int((y_pred == 0).sum()),
        "ground_truth_anomalies" : int(y_true.sum()),
        # Confusion matrix in list format for easy frontend consumption
        "confusion_matrix" : {
            "labels": ["Normal", "Anomaly"],
            "matrix": [[int(tn), int(fp)], [int(fn), int(tp)]],
        },
    }
 
    logger.info(
        f"Evaluation — Accuracy: {accuracy:.4f} | Precision: {precision:.4f} | "
        f"Recall: {recall:.4f} | F1: {f1:.4f}"
    )
    return metrics
 
 
def score_to_severity(score: float) -> str:
    """
    Convert a raw Isolation Forest anomaly score to a human-readable severity.
 
    Isolation Forest decision_function returns values roughly in [-0.5, 0.5].
    Negative values = more anomalous.
    """
    if score < -0.3:
        return "critical"
    elif score < -0.1:
        return "high"
    elif score < 0.0:
        return "medium"
    else:
        return "low"
 