import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "saved_model", "water_model.joblib")

WATER_ADVICE = {
    "Excellent": {
        "status": "Optimal Irrigation Quality",
        "irrigation_required": False,
        "suitability": "Suitable for all crops including high-sensitivity horticultural crops.",
        "observations": [
            "Balanced chemical ionic composition",
            "Low salinity hazard and low sodium risk",
            "Safe for long-term continuous drip and sprinkler irrigation"
        ],
        "recommendations": [
            "Use freely across all crop growth stages.",
            "Maintain clean storage tanks to prevent algal growth."
        ],
        "risks": ["Minimal water quality risks observed."]
    },
    "Good": {
        "status": "Good Quality Water",
        "irrigation_required": False,
        "suitability": "Suitable for almost all field crops, fruits, and vegetables.",
        "observations": [
            "Normal TDS and electrical conductivity range",
            "Acceptable mineral content for agricultural use"
        ],
        "recommendations": [
            "Ideal for regular drip and surface irrigation cycles.",
            "Monitor soil salinity annually if irrigating in arid climates."
        ],
        "risks": ["Minor scaling risk in high-temperature drip lines."]
    },
    "Poor": {
        "status": "Moderate / Poor Quality Water",
        "irrigation_required": False,
        "suitability": "Suitable for salt-tolerant crops (Barley, Wheat, Cotton, Mustard). Use with caution for sensitive crops (Beans, Citrus).",
        "observations": [
            "Elevated dissolved salts (TDS/EC)",
            "Moderate risk of soil salinity accumulation over repeated applications"
        ],
        "recommendations": [
            "Apply 10-15% leaching fraction to flush accumulated salts below root zone.",
            "Blend with rain harvest or surface water when possible.",
            "Avoid leaf wetting during hot afternoon hours."
        ],
        "risks": ["Soil salinization", "Foliar burn on sensitive fruit foliage"]
    },
    "Very Poor yet Drinkable": {
        "status": "High Salinity / Marginal Irrigation Quality",
        "irrigation_required": False,
        "suitability": "Restricted suitability. Requires good soil drainage and salt-tolerant crop selection.",
        "observations": [
            "High electrical conductivity and total dissolved solids",
            "Potential chloride or sodium toxicity symptoms under high evaporation"
        ],
        "recommendations": [
            "Use sub-surface drip irrigation to minimize surface salt crusting.",
            "Incorporate gypsum or organic amendments to counteract excess sodium.",
            "Provide adequate soil drainage ditches."
        ],
        "risks": ["Severe salt stress", "Drip emitter clogging", "Reduced crop yield potential"]
    },
    "Unsuitable for Drinking": {
        "status": "Severe Water Quality Hazard / Unsuitable for Direct Use",
        "irrigation_required": False,
        "suitability": "Unsuitable for direct crop irrigation without prior dilution or chemical treatment.",
        "observations": [
            "Extreme TDS/EC levels or high nitrate concentration",
            "Severe risk of toxic ion accumulation and soil toxicity"
        ],
        "recommendations": [
            "Treat water via reverse osmosis or desalination before crop application.",
            "Mix with fresh rainwater or surface canal water at a 1:3 ratio.",
            "Perform comprehensive laboratory heavy metal test before farm deployment."
        ],
        "risks": ["Complete crop yield loss", "Soil sterilization", "Groundwater contamination spread"]
    }
}

_water_artifacts = None

def load_water_model():
    global _water_artifacts
    if _water_artifacts is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Water model artifact not found at: {MODEL_PATH}")
        _water_artifacts = joblib.load(MODEL_PATH)
    return _water_artifacts

def predict_water_quality(params_dict):
    """
    params_dict expects keys: pH, EC, CO3, HCO3, Cl, SO4, NO3, TH, Ca, Mg, Na, K, F, TDS
    Returns dict with model classification, confidence, suitability, recommendations.
    """
    artifacts = load_water_model()
    model = artifacts['model']
    scaler = artifacts['scaler']
    le = artifacts['label_encoder']
    feature_cols = artifacts['feature_columns']

    input_vector = []
    for col in feature_cols:
        val = params_dict.get(col, params_dict.get(col.lower(), params_dict.get(col.upper())))
        if val is None or val == "":
            # Set default median parameter if missing
            val = 7.5 if col == 'pH' else 500.0
        input_vector.append(float(val))

    import pandas as pd
    X_input = pd.DataFrame([input_vector], columns=feature_cols)
    X_scaled = scaler.transform(X_input)

    pred_class_idx = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    confidence = float(np.max(probabilities))

    predicted_label = str(le.inverse_transform([pred_class_idx])[0])
    advice = WATER_ADVICE.get(predicted_label, WATER_ADVICE["Good"])

    return {
        "predicted_class": predicted_label,
        "confidence": confidence,
        "analysis_type": "AI Water Quality Model Classification",
        "water_status": advice["status"],
        "suitability": advice["suitability"],
        "observations": advice["observations"],
        "recommendations": advice["recommendations"],
        "risks": advice["risks"],
        "input_parameters": {col: float(val) for col, val in zip(feature_cols, input_vector)}
    }
