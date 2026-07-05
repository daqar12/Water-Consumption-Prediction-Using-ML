from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
from pathlib import Path

from utils import prepare_features_from_row

server = Flask(__name__)
CORS(server)

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

# =====================================================
# LOAD MODEL INFO
# =====================================================
with open(MODELS_DIR / "model_info.json", "r") as f:
    model_info = json.load(f)

FINAL_MODEL_NAME = model_info["final_model"]

# =====================================================
# LOAD ALL MODELS
# =====================================================
MODELS = {
    "linear_regression": joblib.load(MODELS_DIR / "linear_regression.joblib"),
    "decision_tree": joblib.load(MODELS_DIR / "decision_tree.joblib"),
    "random_forest": joblib.load(MODELS_DIR / "random_forest.joblib"),
    "gradient_boosting": joblib.load(MODELS_DIR / "gradient_boosting.joblib"),
    "xgboost": joblib.load(MODELS_DIR / "xgboost.joblib"),
    "tuned_random_forest": joblib.load(MODELS_DIR / "tuned_random_forest.joblib"),
    "tuned_xgboost": joblib.load(MODELS_DIR / "tuned_xgboost.joblib"),
    "final_model": joblib.load(MODELS_DIR / "final_model.joblib")
}

# =====================================================
# HOME
# =====================================================


@server.route("/", methods=["GET"])
def home():
    return jsonify({
        "project": "Water Consumption Prediction API",
        "target": "November Consumption",
        "best_model": FINAL_MODEL_NAME,
        "available_models": list(MODELS.keys()),
        "prediction_endpoint": "/predict?model=final_model",
        "required_fields": {
            "September": "number",
            "October": "number",
            "Branch": "string",
            "Zone": "string"
        }
    })

# =====================================================
# PREDICT USING ONE MODEL
# =====================================================


@server.route("/predict", methods=["POST"])
def predict():

    model_name = request.args.get(
        "model",
        "final_model"
    ).lower()

    if model_name not in MODELS:
        return jsonify({
            "error": f"Invalid model name. Available models: {list(MODELS.keys())}"
        }), 400

    input_data = request.get_json(silent=True) or {}

    required_fields = [
        "September",
        "October",
        "Branch",
        "Zone"
    ]

    missing = [
        field for field in required_fields
        if field not in input_data
    ]

    if missing:
        return jsonify({
            "error": f"Missing required fields: {missing}"
        }), 400

    try:

        features_df = prepare_features_from_row(input_data)

        prediction = float(
            MODELS[model_name].predict(features_df)[0]
        )

        return jsonify({
            "model": model_name,
            "best_model": FINAL_MODEL_NAME,
            "input": input_data,
            "predicted_november_consumption": round(prediction, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# COMPARE ALL MODELS
# =====================================================
@server.route("/predict-all", methods=["POST"])
def predict_all():

    input_data = request.get_json(silent=True) or {}

    required_fields = [
        "September",
        "October",
        "Branch",
        "Zone"
    ]

    missing = [
        field for field in required_fields
        if field not in input_data
    ]

    if missing:
        return jsonify({
            "error": f"Missing required fields: {missing}"
        }), 400

    try:

        features_df = prepare_features_from_row(input_data)

        predictions = {}

        for name, model in MODELS.items():
            predictions[name] = round(
                float(model.predict(features_df)[0]),
                2
            )

        return jsonify({
            "best_model": FINAL_MODEL_NAME,
            "input": input_data,
            "predictions": predictions
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# RUN
# =====================================================
if __name__ == "__main__":
    server.run(
        host="0.0.0.0",
        port=4050,
        debug=False
    )
