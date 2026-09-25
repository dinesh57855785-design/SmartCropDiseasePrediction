"""
edge/tflite_export.py
Converts the trained Keras model to TensorFlow Lite format for edge deployment.
Supports INT8 quantization for low-power devices (ESP32-CAM, Raspberry Pi).

Usage:
    python tflite_export.py [--quantize]
"""

import sys
import argparse
from pathlib import Path

_AI_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_AI_ROOT))


def export_tflite(quantize: bool = False, quantize_int8: bool = False):
    """
    Convert the trained Keras H5 model to TFLite format.

    Args:
        quantize: Apply float16 quantization (smaller file, marginal accuracy loss).
        quantize_int8: Apply full INT8 quantization (smallest file, requires representative dataset).
    """
    import tensorflow as tf

    model_path = _AI_ROOT / 'saved_model' / 'model.h5'
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found at {model_path}. Run training/train.py first."
        )

    print(f"[tflite_export] Loading model from: {model_path}")
    model = tf.keras.models.load_model(str(model_path))

    converter = tf.lite.TFLiteConverter.from_keras_model(model)

    if quantize_int8:
        print("[tflite_export] Applying INT8 quantization...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.int8]

        # Representative dataset for calibration
        import numpy as np
        def representative_dataset():
            for _ in range(100):
                yield [np.random.rand(1, 224, 224, 3).astype(np.float32)]

        converter.representative_dataset = representative_dataset
        converter.inference_input_type = tf.int8
        converter.inference_output_type = tf.int8
        out_path = _AI_ROOT / 'saved_model' / 'model_int8.tflite'

    elif quantize:
        print("[tflite_export] Applying float16 quantization...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
        out_path = _AI_ROOT / 'saved_model' / 'model_float16.tflite'

    else:
        out_path = _AI_ROOT / 'saved_model' / 'model.tflite'

    tflite_model = converter.convert()

    with open(out_path, 'wb') as f:
        f.write(tflite_model)

    size_mb = out_path.stat().st_size / (1024 * 1024)
    print(f"[tflite_export] TFLite model saved to: {out_path} ({size_mb:.2f} MB)")
    return str(out_path)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Export model to TFLite for edge deployment')
    parser.add_argument('--quantize', action='store_true', help='Apply float16 quantization')
    parser.add_argument('--quantize_int8', action='store_true', help='Apply INT8 quantization (smallest)')
    args = parser.parse_args()

    export_tflite(quantize=args.quantize, quantize_int8=args.quantize_int8)
