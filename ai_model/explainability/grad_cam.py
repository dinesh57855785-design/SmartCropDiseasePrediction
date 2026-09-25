"""
explainability/grad_cam.py
Grad-CAM visualization for Smart Crop Disease Prediction.
Generates heatmaps to explain which regions of the leaf triggered the model's decision.

Usage:
    python grad_cam.py <image_path>
"""

import sys
import numpy as np
from pathlib import Path

_AI_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_AI_ROOT))


def generate_gradcam(image_path: str, layer_name: str = 'out_relu', class_idx: int = None) -> np.ndarray:
    """
    Generate a Grad-CAM heatmap for a given image.

    Args:
        image_path: Path to the input image.
        layer_name: Name of the target convolutional layer (default: last conv layer of MobileNetV2).
        class_idx: Class index to explain. If None, uses the predicted class.

    Returns:
        heatmap: Normalized Grad-CAM heatmap as float32 numpy array in [0, 1].
    """
    import tensorflow as tf
    from preprocessing.preprocess import preprocess_image

    # Load model
    model_path = _AI_ROOT / 'saved_model' / 'model.h5'
    model = tf.keras.models.load_model(str(model_path))

    # Preprocess image
    img_array = preprocess_image(image_path)  # (1, 224, 224, 3)

    # Build gradient model up to the target layer
    grad_model = tf.keras.Model(
        inputs=model.input,
        outputs=[model.get_layer(layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        inputs = tf.cast(img_array, tf.float32)
        conv_outputs, predictions = grad_model(inputs)
        if class_idx is None:
            class_idx = tf.argmax(predictions[0])
        class_score = predictions[:, class_idx]

    # Compute gradients
    grads = tape.gradient(class_score, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight the feature maps
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Normalize heatmap to [0, 1]
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def overlay_heatmap(image_path: str, heatmap: np.ndarray, alpha: float = 0.5, output_path: str = None) -> np.ndarray:
    """
    Overlay a Grad-CAM heatmap onto the original image.

    Args:
        image_path: Path to original image.
        heatmap: Grad-CAM heatmap array.
        alpha: Blend factor for the heatmap overlay.
        output_path: If provided, save the overlaid image to this path.

    Returns:
        Overlaid image as uint8 numpy array.
    """
    import cv2

    img = cv2.imread(image_path)
    h, w = img.shape[:2]

    # Resize heatmap to match image size
    heatmap_resized = cv2.resize(heatmap, (w, h))
    heatmap_colored = cv2.applyColorMap(
        np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET
    )

    # Blend
    overlaid = cv2.addWeighted(img, 1 - alpha, heatmap_colored, alpha, 0)

    if output_path:
        cv2.imwrite(output_path, overlaid)
        print(f"[grad_cam] Saved overlaid image to: {output_path}")

    return overlaid


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python grad_cam.py <image_path> [output_path]")
        sys.exit(1)

    img_path = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else 'gradcam_output.jpg'

    print(f"[grad_cam] Generating Grad-CAM for: {img_path}")
    heatmap = generate_gradcam(img_path)
    overlay_heatmap(img_path, heatmap, output_path=out_path)
