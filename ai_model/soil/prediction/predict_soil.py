import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "saved_model", "soil_model.joblib")

# Default agronomic advice based on predicted soil fertility status
SOIL_ADVICE = {
    "Less Fertile": {
        "condition": "Low fertility / Nutrient Deficient Soil",
        "problem": "Deficiency in essential nutrients (N/P/K or micronutrients) and organic carbon.",
        "crop_suitability": "Suitable for hardy crops (millets, pulses, legumes) after soil amendment.",
        "recommendations": [
            "Incorporate heavy applications of well-rotted compost or farmyard manure (10-15 tons/ha).",
            "Apply balanced NPK chemical fertilizer per soil test target levels.",
            "Sow green manure crops (e.g., Sesbania, Sunn hemp) and plow in before planting main crop."
        ],
        "organic_methods": [
            "Apply 2-3 tons/ha of vermicompost near plant root zone.",
            "Use Azotobacter and PSB bio-fertilizers during seed treatment.",
            "Mulch with crop residues to conserve soil organic matter and moisture."
        ]
    },
    "Fertile": {
        "condition": "Optimal / Fertile Soil",
        "problem": "No major fertility deficiency detected. Requires maintenance.",
        "crop_suitability": "Highly suitable for most cereal, vegetable, and commercial crops (Tomato, Potato, Wheat, Maize).",
        "recommendations": [
            "Maintain standard maintenance doses of organic compost and recommended NPK.",
            "Practice crop rotation with legumes to preserve soil nitrogen.",
            "Monitor soil pH periodically to prevent acidification or alkalization."
        ],
        "organic_methods": [
            "Regular top-dressing with vermicompost or neem cake.",
            "Foliar spray of Jeevamrut / Panchagavya during active vegetative growth."
        ]
    },
    "Highly Fertile": {
        "condition": "High Fertility / Nutrient Rich Soil",
        "problem": "Excellent nutrient balance. Avoid over-fertilization.",
        "crop_suitability": "Optimal for high-yielding crops, fruits, and intensive vegetable farming.",
        "recommendations": [
            "Avoid excessive chemical nitrogen application to prevent luxury consumption and lodging.",
            "Maintain balanced irrigation and organic cover.",
            "Conduct routine soil health checks every 2 seasons."
        ],
        "organic_methods": [
            "Maintain soil organic carbon with light organic mulching.",
            "Encourage earthworm activity by minimizing synthetic chemical sprays."
        ]
    }
}

_soil_artifacts = None

def load_soil_model():
    global _soil_artifacts
    if _soil_artifacts is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Soil model artifact not found at: {MODEL_PATH}")
        _soil_artifacts = joblib.load(MODEL_PATH)
    return _soil_artifacts

def predict_soil_fertility(params_dict):
    """
    params_dict expects keys: N, P, K, ph, ec, oc, S, zn, fe, cu, Mn, B
    Returns dict with model prediction, confidence, condition, recommendations.
    """
    artifacts = load_soil_model()
    model = artifacts['model']
    scaler = artifacts['scaler']
    feature_cols = artifacts['feature_columns']
    class_map = artifacts['class_map']

    # Extract feature values in exact required order, default to mean values if missing
    input_vector = []
    for col in feature_cols:
        val = params_dict.get(col, params_dict.get(col.lower(), params_dict.get(col.upper())))
        if val is None or val == "":
            raise ValueError(f"Missing required parameter: {col}")
        input_vector.append(float(val))

    import pandas as pd
    X_input = pd.DataFrame([input_vector], columns=feature_cols)
    X_scaled = scaler.transform(X_input)

    pred_class_idx = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    confidence = float(np.max(probabilities))

    predicted_label = class_map.get(pred_class_idx, str(pred_class_idx))
    advice = SOIL_ADVICE.get(predicted_label, SOIL_ADVICE["Fertile"])

    return {
        "predicted_class": predicted_label,
        "confidence": confidence,
        "analysis_type": "AI Soil Fertility Model Prediction",
        "soil_condition": advice["condition"],
        "possible_problem": advice["problem"],
        "crop_suitability": advice["crop_suitability"],
        "recommendations": advice["recommendations"],
        "organic_methods": advice["organic_methods"],
        "input_parameters": {col: float(val) for col, val in zip(feature_cols, input_vector)}
    }
