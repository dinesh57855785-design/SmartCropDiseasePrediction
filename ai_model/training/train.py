"""
training/train.py
Training script for Smart Crop Disease Prediction model.
Uses MobileNetV2 transfer learning on the PlantVillage dataset.

Usage:
    python train.py --data_dir /path/to/PlantVillage --epochs 30 --batch_size 32
"""

import sys
import argparse
from pathlib import Path

# Add AI model root to path
_AI_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_AI_ROOT))


def train(data_dir: str, epochs: int = 30, batch_size: int = 32, img_size: int = 224):
    """
    Train the crop disease prediction model.

    Args:
        data_dir: Path to PlantVillage dataset directory.
                  Should contain subdirectories for each class.
        epochs: Number of training epochs.
        batch_size: Batch size for training.
        img_size: Input image size (square).
    """
    import tensorflow as tf
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.callbacks import (
        EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard
    )
    from augmentation.augment import get_augmentation_layer
    from models.cnn_transfer_learning.model import build_model, NUM_CLASSES

    data_path = Path(data_dir)
    if not data_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at: {data_path}\n"
            "Download PlantVillage from: https://www.kaggle.com/datasets/emmarex/plantdisease"
        )

    save_path = _AI_ROOT / 'saved_model' / 'model.h5'
    save_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[train] Dataset: {data_path}")
    print(f"[train] Epochs: {epochs}, Batch size: {batch_size}")

    # Data generators with built-in augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.15,
        brightness_range=[0.8, 1.2],
        fill_mode='reflect',
    )

    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2,
    )

    train_gen = train_datagen.flow_from_directory(
        data_path,
        target_size=(img_size, img_size),
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True,
    )

    val_gen = val_datagen.flow_from_directory(
        data_path,
        target_size=(img_size, img_size),
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False,
    )

    print(f"[train] Found {train_gen.samples} training samples across {train_gen.num_classes} classes")
    print(f"[train] Found {val_gen.samples} validation samples")

    # Build model
    model = build_model(num_classes=train_gen.num_classes)
    model.summary()

    # Callbacks
    callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=7, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=3, min_lr=1e-7, verbose=1),
        ModelCheckpoint(
            filepath=str(save_path),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
        ),
        TensorBoard(log_dir=str(_AI_ROOT / 'logs'), histogram_freq=1),
    ]

    # Train
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        callbacks=callbacks,
    )

    print(f"\n[train] Training complete. Best model saved to: {save_path}")

    # Save final class indices
    import json
    class_indices_path = _AI_ROOT / 'saved_model' / 'class_indices.json'
    with open(class_indices_path, 'w') as f:
        json.dump(train_gen.class_indices, f, indent=2)
    print(f"[train] Class indices saved to: {class_indices_path}")

    return history


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train SmartCropDisease model')
    parser.add_argument('--data_dir', type=str, required=True, help='Path to PlantVillage dataset')
    parser.add_argument('--epochs', type=int, default=30, help='Number of epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--img_size', type=int, default=224, help='Image size')
    args = parser.parse_args()

    train(args.data_dir, args.epochs, args.batch_size, args.img_size)
