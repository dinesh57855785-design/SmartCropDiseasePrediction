import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score

DATASET_PATH = r"D:\deep-learning-for-groundwater-quality-assessment-main\data\water_quality.csv"
SAVED_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "saved_model")
os.makedirs(SAVED_MODEL_DIR, exist_ok=True)
MODEL_SAVE_PATH = os.path.join(SAVED_MODEL_DIR, "water_model.joblib")

FEATURE_COLUMNS = ['pH', 'EC', 'CO3', 'HCO3', 'Cl', 'SO4', 'NO3', 'TH', 'Ca', 'Mg', 'Na', 'K', 'F', 'TDS']
TARGET_COLUMN = 'Water Quality Classification'

def train():
    print(f"Loading water dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)

    # Clean numerical columns
    for col in FEATURE_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    df = df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])

    X = df[FEATURE_COLUMNS]
    y_raw = df[TARGET_COLUMN]

    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted')
    rec = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')

    print("\n--- WATER MODEL EVALUATION ---")
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))

    artifacts = {
        'model': clf,
        'scaler': scaler,
        'label_encoder': le,
        'feature_columns': FEATURE_COLUMNS,
        'classes': list(le.classes_),
        'metrics': {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1)
        }
    }

    joblib.dump(artifacts, MODEL_SAVE_PATH)
    print(f"Water model successfully saved to: {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train()
