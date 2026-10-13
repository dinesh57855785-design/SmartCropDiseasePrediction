"""
prediction/predict.py
Inference module for Smart Crop Disease Prediction.
Loads the saved Keras model and runs predictions on crop images.
"""

import os
import sys
import numpy as np
from pathlib import Path

# Configure environment for low-memory CPU inference before TF imports
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Allow importing sibling packages
_AI_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_AI_ROOT))

from preprocessing.preprocess import preprocess_image
from models.cnn_transfer_learning.model import (
    DISEASE_CLASSES, get_class_name, get_treatment, is_healthy_class
)

# Singleton model cache
_model = None
_MODEL_PATH = _AI_ROOT / 'saved_model' / 'model.h5'


def _load_model():
    """Load the trained Keras model (cached singleton after first load)."""
    global _model
    if _model is None:
        if not _MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Trained model not found at {_MODEL_PATH}. "
                "Run ai_model/training/train.py first."
            )
        import tensorflow as tf
        try:
            tf.config.threading.set_inter_op_parallelism_threads(1)
            tf.config.threading.set_intra_op_parallelism_threads(1)
        except Exception:
            pass
        # compile=False avoids loading optimizer state, saving 50%+ RAM
        _model = tf.keras.models.load_model(str(_MODEL_PATH), compile=False)
        print(f"[predict] Model loaded from {_MODEL_PATH}")
    return _model


def predict_disease(image_path: str, top_k: int = 1, crop_name: str = '') -> dict:
    """
    Run disease prediction on a crop image.

    Args:
        image_path: Absolute or relative path to the image file.
        top_k: Return top-k predictions (default: 1).
        crop_name: Optional crop name filter to prevent cross-crop disease mismatching.

    Returns:
        dict with keys: disease, confidence, treatment, is_healthy, top_predictions, disease_key
    """
    model = _load_model()

    # Preprocess: load → resize → normalize → add batch dim
    img_array = preprocess_image(str(image_path))

    # Run inference
    predictions = model.predict(img_array, verbose=0)[0]  # shape: (38,)

    # If crop_name is provided and not an auto-detect variant, filter class indices
    valid_indices = list(range(len(DISEASE_CLASSES)))
    c_clean = crop_name.strip().lower()
    AUTO_DETECT_VARIANTS = {
        '', 'auto', 'auto detect', '(auto detect)', 'auto detect (recommended)',
        'autodetect', 'all', 'none'
    }

    if c_clean and c_clean not in AUTO_DETECT_VARIANTS:
        # Map common frontend names to class substrings
        crop_map = {
            'corn': 'corn_(maize)',
            'maize': 'corn_(maize)',
            'pepper': 'pepper,_bell',
            'bell pepper': 'pepper,_bell',
        }
        target_substring = crop_map.get(c_clean, c_clean)
        
        filtered = [
            i for i, cls in enumerate(DISEASE_CLASSES)
            if target_substring in cls.lower() or target_substring in get_class_name(i).lower()
        ]
        if filtered:
            valid_indices = filtered
        else:
            supported_list = "Apple, Blueberry, Cherry, Corn (Maize), Grape, Orange, Peach, Pepper (Bell), Potato, Raspberry, Soybean, Squash, Strawberry, Tomato"
            raise ValueError(
                f"Crop '{crop_name}' is not currently supported by the 38-class leaf disease model. "
                f"Supported crops are: {supported_list}. Select '(Auto Detect)' for automatic crop scanning."
            )

    # Get top-k results within valid indices
    sorted_valid = sorted(valid_indices, key=lambda i: predictions[i], reverse=True)
    top_indices = sorted_valid[:top_k]

    top_results = [
        {
            'class': DISEASE_CLASSES[i],
            'disease': get_class_name(i),
            'confidence': float(predictions[i]),
        }
        for i in top_indices
    ]

    best = top_results[0]
    raw_class = best['class']

    return {
        'disease': best['disease'],
        'disease_key': raw_class,
        'confidence': best['confidence'],
        'treatment': get_treatment(raw_class),
        'is_healthy': is_healthy_class(raw_class),
        'top_predictions': top_results,
    }


if __name__ == '__main__':
    # CLI usage: python predict.py <image_path>
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)

    result = predict_disease(sys.argv[1])
    print("\n=== Smart Crop Disease Prediction ===")
    print(f"Disease : {result['disease']}")
    print(f"Confidence: {result['confidence'] * 100:.1f}%")
    print(f"Healthy : {result['is_healthy']}")
    print(f"Treatment : {result['treatment']}")
