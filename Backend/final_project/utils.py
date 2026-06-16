import pandas as pd
import joblib
import json

# =====================================================
# LOAD TRAINING ARTIFACTS
# =====================================================
TRAIN_COLS = json.load(open("models/water_consumption_train_cols.json"))
SCALER = joblib.load("models/water_consumption_scaler.pkl")

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
        (october - september) / (september + 1)
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
    # ONE-HOT ENCODE BRANCH
    # =================================================
    branch_col = f"Branch_{branch}"
    if branch_col in row:
        row[branch_col] = 1

    # =================================================
    # ONE-HOT ENCODE ZONE
    # =================================================
    zone_col = f"Zone_{zone}"
    if zone_col in row:
        row[zone_col] = 1

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
