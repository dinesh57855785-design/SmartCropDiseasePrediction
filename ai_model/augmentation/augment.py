"""
augmentation/augment.py
Data augmentation pipeline for SmartCropDiseasePrediction training.
"""

import numpy as np


def get_augmentation_layer():
    """
    Returns a Keras Sequential augmentation model.
    Applied only during training.
    """
    try:
        import tensorflow as tf
        from tensorflow.keras import layers

        augment = tf.keras.Sequential([
            layers.RandomFlip("horizontal_and_vertical"),
            layers.RandomRotation(0.2),
            layers.RandomZoom(0.15),
            layers.RandomBrightness(0.2),
            layers.RandomContrast(0.2),
        ], name="augmentation")
        return augment
    except ImportError:
        raise ImportError("TensorFlow is required for augmentation. Install with: pip install tensorflow")


def augment_image_numpy(img: np.ndarray, seed: int = None) -> np.ndarray:
    """
    Apply augmentation to a single numpy image array (H, W, 3).
    Useful for offline augmentation without TensorFlow.
    """
    import random
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)

    # Random horizontal flip
    if random.random() > 0.5:
        img = np.fliplr(img)

    # Random vertical flip
    if random.random() > 0.5:
        img = np.flipud(img)

    # Random brightness
    brightness_factor = random.uniform(0.8, 1.2)
    img = np.clip(img * brightness_factor, 0, 255)

    return img.astype(np.float32)
