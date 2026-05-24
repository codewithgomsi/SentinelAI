"""
SentinelAI - ML Preprocessing Pipeline
=======================================
Loads the raw CSV dataset, cleans it, engineers features,
and returns a ready-to-train numpy array + metadata.
 
Columns in dataset:
  Timestamp, IP_Address, Request_Type, Status_Code,
  Anomaly_Flag, User_Agent, Session_ID, Location
"""
 
import os
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
 
logger = logging.getLogger("SentinelAI.preprocessing")
 
# ── Constants ──────────────────────────────────────────────────────────────────
DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "dataset", "advanced_cybersecurity_data.csv"
)
 
REQUIRED_COLUMNS = [
    "Timestamp", "IP_Address", "Request_Type",
    "Status_Code", "Anomaly_Flag", "User_Agent",
    "Session_ID", "Location",
]
 
CATEGORICAL_COLUMNS = ["Request_Type", "User_Agent", "Location"]
 
 
def load_dataset(path: str = DATASET_PATH) -> pd.DataFrame:
    """
    Load the CSV dataset from disk.
    Raises FileNotFoundError or ValueError on bad input.
    """
    abs_path = os.path.abspath(path)
    logger.info(f"Loading dataset from: {abs_path}")
 
    if not os.path.exists(abs_path):
        raise FileNotFoundError(f"Dataset not found at: {abs_path}")
 
    try:
        df = pd.read_csv(abs_path)
    except Exception as e:
        raise ValueError(f"Failed to parse CSV: {e}")
 
    if df.empty:
        raise ValueError("Dataset is empty.")
 
    # Validate required columns
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
 
    logger.info(f"Dataset loaded: {len(df)} rows, {len(df.columns)} columns.")
    return df
 
 
def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Drop duplicates, handle missing values, parse timestamps.
    Returns a clean DataFrame.
    """
    original_len = len(df)
 
    # Drop fully duplicate rows
    df = df.drop_duplicates()
 
    # Fill missing numeric values with column median
    for col in df.select_dtypes(include=[np.number]).columns:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
            logger.debug(f"Filled NaN in numeric column '{col}' with median.")
 
    # Fill missing categorical values with mode
    for col in CATEGORICAL_COLUMNS:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0])
            logger.debug(f"Filled NaN in categorical column '{col}' with mode.")
 
    # Parse timestamp
    if "Timestamp" in df.columns:
        df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors="coerce")
        df = df.dropna(subset=["Timestamp"])  # Drop rows where timestamp is unparseable
 
    logger.info(
        f"Cleaning complete: {original_len} → {len(df)} rows "
        f"({original_len - len(df)} removed)."
    )
    return df.reset_index(drop=True)
 
 
def engineer_features(df: pd.DataFrame):
    """
    Extract numerical features from the dataset suitable for Isolation Forest.
 
    Returns:
        X          : np.ndarray  — feature matrix (n_samples, n_features)
        y          : np.ndarray  — ground-truth labels (0=normal, 1=anomaly)
        feature_names: list[str] — names of each feature column
        encoders   : dict        — fitted LabelEncoders (for reuse at inference)
        scaler     : StandardScaler — fitted scaler (for reuse at inference)
    """
    df = df.copy()
 
    # ── Time-based features ────────────────────────────────────────────────────
    df["hour"]        = df["Timestamp"].dt.hour
    df["day_of_week"] = df["Timestamp"].dt.dayofweek  # 0=Monday … 6=Sunday
    df["is_night"]    = ((df["hour"] >= 22) | (df["hour"] <= 5)).astype(int)
 
    # ── Status code category ───────────────────────────────────────────────────
    df["is_error"]    = df["Status_Code"].isin([500, 503, 502]).astype(int)
    df["is_4xx"]      = df["Status_Code"].isin([400, 401, 403, 404, 429]).astype(int)
    df["is_redirect"] = df["Status_Code"].isin([301, 302, 307, 308]).astype(int)
 
    # ── Session ID normalization (scale to 0-1 range) ─────────────────────────
    df["session_norm"] = (df["Session_ID"] - df["Session_ID"].min()) / (
        df["Session_ID"].max() - df["Session_ID"].min() + 1e-9
    )
 
    # ── Label-encode categorical columns ──────────────────────────────────────
    encoders = {}
    for col in CATEGORICAL_COLUMNS:
        le = LabelEncoder()
        df[f"{col}_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
 
    # ── Assemble feature matrix ────────────────────────────────────────────────
    feature_cols = [
        "Status_Code", "hour", "day_of_week", "is_night",
        "is_error", "is_4xx", "is_redirect", "session_norm",
        "Request_Type_enc", "User_Agent_enc", "Location_enc",
    ]
 
    X = df[feature_cols].values.astype(np.float64)
    y = df["Anomaly_Flag"].values.astype(int)
 
    # ── Standardize features ───────────────────────────────────────────────────
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
 
    logger.info(
        f"Feature engineering complete: X={X.shape}, "
        f"anomalies={y.sum()} ({100*y.mean():.2f}%)."
    )
    return X, y, feature_cols, encoders, scaler
 
 
def get_preprocessed_data(path: str = DATASET_PATH):
    """
    Convenience wrapper: load → clean → engineer.
    Returns (X, y, feature_names, encoders, scaler, raw_df).
    """
    df_raw   = load_dataset(path)
    df_clean = clean_dataset(df_raw)
    X, y, feature_names, encoders, scaler = engineer_features(df_clean)
    return X, y, feature_names, encoders, scaler, df_clean