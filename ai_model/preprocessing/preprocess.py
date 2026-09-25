"""
preprocessing/preprocess.py
Image preprocessing utilities for Smart Crop Disease Prediction.
"""

import numpy as np
from pathlib import Path

# Target size for MobileNetV2
IMG_SIZE = (224, 224)

# ImageNet normalization constants
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406])
IMAGENET_STD = np.array([0.229, 0.224, 0.225])


def load_image(image_path: str) -> np.ndarray:
    """
    Load an image from disk and return a raw numpy array (H, W, 3) in float32.
    Handles RGBA and grayscale by converting to RGB.
    """
    try:
        import cv2
        img = cv2.imread(str(image_path))
        if img is None:
            raise ValueError(f"Could not read image at: {image_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    except ImportError:
        from PIL import Image
        img = Image.open(image_path).convert('RGB')
        img = np.array(img)
    return img.astype(np.float32)


def resize_image(img: np.ndarray, size: tuple = IMG_SIZE) -> np.ndarray:
    """Resize image to target size (H, W)."""
    try:
        import cv2
        return cv2.resize(img, (size[1], size[0])).astype(np.float32)
    except ImportError:
        from PIL import Image
        pil_img = Image.fromarray(img.astype(np.uint8))
        pil_img = pil_img.resize((size[1], size[0]), Image.LANCZOS)
        return np.array(pil_img).astype(np.float32)


def normalize(img: np.ndarray) -> np.ndarray:
    """
    Normalize image exactly the same way as the training pipeline.
    Training uses ImageDataGenerator(rescale=1.0 / 255).
    """
    img = img / 255.0
    return img.astype(np.float32)

def preprocess_image(image_path: str) -> np.ndarray:
    """
    Full preprocessing pipeline: load → resize → normalize.
    Returns array of shape (1, 224, 224, 3) ready for model inference.
    """
    img = load_image(image_path)
    img = resize_image(img)
    img = normalize(img)
    return np.expand_dims(img, axis=0)  # Add batch dimension


def preprocess_from_array(img_array: np.ndarray) -> np.ndarray:
    """Preprocess a numpy array (from memory) instead of a file path."""
    img = img_array.astype(np.float32)
    img = resize_image(img)
    img = normalize(img)
    return np.expand_dims(img, axis=0)
