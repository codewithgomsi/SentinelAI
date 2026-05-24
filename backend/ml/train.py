"""
SentinelAI - Model Training Script
====================================
Trains an Isolation Forest anomaly-detection model on the
preprocessed cybersecurity dataset and persists it to disk.
 
Run directly:
    cd backend
    python ml/train.py
"""
 
import os
import sys
import logging
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
 
# Allow imports from parent directory when run directly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
 
from ml.preprocessing import get_preprocessed_data
from ml.evaluation import evaluate_model
 
logger = logging.getLogger("SentinelAI.train")
 
# ── Paths ──────────────────────────────────────────────────────────────────────
MODEL_DIR   = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "model"))
MODEL_PATH  = os.path.join(MODEL_DIR, "isolation_forest.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
META_PATH   = os.path.join(MODEL_DIR, "model_meta.pkl")
 
# ── Hyperparameters ────────────────────────────────────────────────────────────
CONTAMINATION = 0.05   # Expected proportion of anomalies (~5 %)
N_ESTIMATORS  = 200    # Number of trees in the forest
MAX_SAMPLES   = "auto" # Samples used per tree
RANDOM_STATE  = 42     # Reproducibility seed
 
 
def train_model(force_retrain: bool = False) -> dict:
    """
    Full training pipeline:
      1. Preprocess data
      2. Train Isolation Forest
      3. Evaluate against ground-truth labels
      4. Persist model artifacts
      5. Return evaluation metrics dict
 
    Args:
        force_retrain: If False and model already exists, skip training.
 
    Returns:
        dict with metrics and paths.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
 
    # ── Skip if model already trained ─────────────────────────────────────────
    if not force_retrain and os.path.exists(MODEL_PATH):
        logger.info("Model already exists. Loading existing model.")
        return load_model_meta()
 
    # ── Step 1: Preprocess ─────────────────────────────────────────────────────
    logger.info("Starting preprocessing pipeline...")
    X, y, feature_names, encoders, scaler, df_clean = get_preprocessed_data()
 
    # ── Step 2: Train Isolation Forest ────────────────────────────────────────
    logger.info(
        f"Training Isolation Forest: n_estimators={N_ESTIMATORS}, "
        f"contamination={CONTAMINATION}, random_state={RANDOM_STATE}"
    )
    model = IsolationForest(
        n_estimators=N_ESTIMATORS,
        contamination=CONTAMINATION,
        max_samples=MAX_SAMPLES,
        random_state=RANDOM_STATE,
        n_jobs=-1,   # Use all available CPU cores
    )
    model.fit(X)
    logger.info("Model training complete.")
 
    # ── Step 3: Generate Predictions ──────────────────────────────────────────
    # Isolation Forest returns: +1 = normal, -1 = anomaly
    raw_preds  = model.predict(X)
    y_pred     = np.where(raw_preds == -1, 1, 0)  # Convert to 0/1 labels
    scores     = model.decision_function(X)        # Anomaly scores
 
    # ── Step 4: Evaluate ───────────────────────────────────────────────────────
    metrics = evaluate_model(y, y_pred, scores)
    logger.info(f"Evaluation metrics: {metrics}")
 
    # ── Step 5: Persist Artifacts ──────────────────────────────────────────────
    meta = {
        "feature_names" : feature_names,
        "metrics"       : metrics,
        "contamination" : CONTAMINATION,
        "n_estimators"  : N_ESTIMATORS,
        "n_samples"     : int(X.shape[0]),
        "n_features"    : int(X.shape[1]),
        "anomaly_count" : int(y_pred.sum()),
        "normal_count"  : int((y_pred == 0).sum()),
        "model_path"    : MODEL_PATH,
        "scaler_path"   : SCALER_PATH,
    }
 
    joblib.dump(model,  MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(meta,   META_PATH)
 
    logger.info(f"Model artifacts saved to: {MODEL_DIR}")
    return meta
 
 
def load_model():
    """
    Load the persisted Isolation Forest model and scaler from disk.
 
    Returns:
        (model, scaler, meta) tuple
    Raises:
        FileNotFoundError if model files are missing.
    """
    for path in [MODEL_PATH, SCALER_PATH, META_PATH]:
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Model artifact not found: {path}. "
                "Run `python ml/train.py` first."
            )
 
    model  = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    meta   = joblib.load(META_PATH)
 
    logger.info("Model loaded successfully from disk.")
    return model, scaler, meta
 
 
def load_model_meta() -> dict:
    """Load only metadata (no model object). Useful for quick status checks."""
    if not os.path.exists(META_PATH):
        return {}
    return joblib.load(META_PATH)
 
 
# ── Run directly ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    )
    logger.info("=== SentinelAI Model Training ===")
    meta = train_model()
    logger.info("Training finished.")
    logger.info(f"Accuracy  : {meta['metrics'].get('accuracy', 'N/A'):.4f}")
    logger.info(f"Precision : {meta['metrics'].get('precision', 'N/A'):.4f}")
    logger.info(f"Recall    : {meta['metrics'].get('recall', 'N/A'):.4f}")
    logger.info(f"F1-Score  : {meta['metrics'].get('f1_score', 'N/A'):.4f}")
 