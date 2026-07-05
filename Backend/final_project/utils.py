import pandas as pd
import joblib
import json
from pathlib import Path

# =====================================================
# LOAD TRAINING ARTIFACTS
# =====================================================
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

with open(MODELS_DIR / "water_consumption_train_cols.json", "r") as f:
    TRAIN_COLS = json.load(f)

SCALER = joblib.load(MODELS_DIR / "water_consumption_scaler.pkl")

# =====================================================
# PREPARE FEATURES
# =====================================================


def prepare_features_from_row(record: dict) -> pd.DataFrame:

    # Numerical Inputs
    september = float(record.get("September", 0))
    october = float(record.get("October", 0))

    # Categorical Inputs
    branch = str(record.get("Branch", "Hodan")).strip()
    zone = str(record.get("Zone", "Seebiyaano")).strip()

    # =================================================
    # FEATURE ENGINEERING
    # =================================================
    avg_consumption = (september + october) / 2

    consumption_diff = october - september

    growth_rate = (
        (october - september) / (september + 0.1)
    )

    # =================================================
    # CREATE EMPTY ROW
    # =================================================
    row = {col: 0.0 for col in TRAIN_COLS}

    # Numerical Features
    feature_values = {
        "September": september,
        "October": october,
        "Average_Consumption": avg_consumption,
        "Consumption_Difference": consumption_diff,
        "Consumption_Growth_Rate": growth_rate
    }

    for col, value in feature_values.items():
        if col in row:
            row[col] = value

    # =================================================
    # ONE-HOT ENCODE CATEGORICAL FEATURES
    # =================================================
    def set_one_hot(prefix: str, value: str) -> None:
        direct_col = f"{prefix}_{value}"
        if direct_col in row:
            row[direct_col] = 1
            return

        normalized_value = value.strip().lower()
        for col in row:
            if col.startswith(f"{prefix}_"):
                trained_value = col.split("_", 1)[1]
                if trained_value.strip().lower() == normalized_value:
                    row[col] = 1
                    return

    set_one_hot("Branch", branch)
    set_one_hot("Zone", zone)

    # =================================================
    # CREATE DATAFRAME
    # =================================================
    df = pd.DataFrame([row])

    # =================================================
    # SCALE NUMERIC FEATURES
    # =================================================
    numeric_features = [
        "September",
        "October",
        "Average_Consumption",
        "Consumption_Difference",
        "Consumption_Growth_Rate"
    ]

    scale_cols = [
        col for col in numeric_features
        if col in df.columns
    ]

    df[scale_cols] = SCALER.transform(df[scale_cols])

    return df
