"""
Soil Image Classification Model Training
Dataset: Soil_Data_V3
Classes: Alluvial soil, Black, Chalky, Clay soil, Mary, Red soil, Sand, Silt
Architecture: MobileNetV2 Transfer Learning
"""
import os
import sys
import json
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Paths
DATASET_TRAINS = r"D:\Soil_Data_V3\Trains"
DATASET_TESTS  = r"D:\Soil_Data_V3\Tests"
SAVE_DIR = r"d:\SmartCropDiseasePrediction_FolderStructure\SmartCropDiseasePrediction\ai_model\soil_image"
os.makedirs(SAVE_DIR, exist_ok=True)

IMG_SIZE   = (224, 224)
BATCH_SIZE = 32
EPOCHS     = 25
VAL_SPLIT  = 0.2
SEED       = 42

print("=" * 60)
print("SOIL IMAGE MODEL TRAINING — Soil_Data_V3")
print("=" * 60)

# Try TensorFlow first
try:
    import tensorflow as tf
    from tensorflow import keras
    print(f"TensorFlow version: {tf.__version__}")
    USE_TF = True
except ImportError:
    USE_TF = False
    print("TensorFlow not found, will try PyTorch or sklearn fallback.")

if not USE_TF:
    # Fallback: try to install tensorflow
    print("Attempting to install tensorflow...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflow", "--quiet"])
    import tensorflow as tf
    from tensorflow import keras
    USE_TF = True
    print(f"TensorFlow installed: {tf.__version__}")

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight

# ── Step 1: Dataset inspection ──────────────────────────────
print("\n[STEP 1] Dataset Inspection")
class_names = sorted(os.listdir(DATASET_TRAINS))
print(f"Classes ({len(class_names)}): {class_names}")

total_train = 0
total_test  = 0
class_counts = {}
for cls in class_names:
    train_count = len(list(Path(DATASET_TRAINS, cls).glob("*.jpg"))) + \
                  len(list(Path(DATASET_TRAINS, cls).glob("*.jpeg"))) + \
                  len(list(Path(DATASET_TRAINS, cls).glob("*.png")))
    test_count  = len(list(Path(DATASET_TESTS, cls).glob("*.jpg"))) + \
                  len(list(Path(DATASET_TESTS, cls).glob("*.jpeg"))) + \
                  len(list(Path(DATASET_TESTS, cls).glob("*.png")))
    class_counts[cls] = {'train': train_count, 'test': test_count}
    total_train += train_count
    total_test  += test_count
    print(f"  {cls:20s}: Train={train_count}, Test={test_count}")

print(f"\nTotal Train: {total_train}, Total Test: {total_test}, Grand Total: {total_train+total_test}")

# ── Step 2: Data Generators ──────────────────────────────────
print("\n[STEP 2] Setting up Data Generators")

# MobileNetV2 preprocessing: scale to [-1, 1]
train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
    validation_split=VAL_SPLIT,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.15,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
    validation_split=VAL_SPLIT,
)

test_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
)

train_gen = train_datagen.flow_from_directory(
    DATASET_TRAINS,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    seed=SEED,
    shuffle=True,
)

val_gen = val_datagen.flow_from_directory(
    DATASET_TRAINS,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    seed=SEED,
    shuffle=False,
)

test_gen = test_datagen.flow_from_directory(
    DATASET_TESTS,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False,
)

print(f"Train samples: {train_gen.samples}")
print(f"Validation samples: {val_gen.samples}")
print(f"Test samples: {test_gen.samples}")
print(f"Class index map: {train_gen.class_indices}")

# Save class names
class_idx = train_gen.class_indices
idx_to_class = {v: k for k, v in class_idx.items()}
with open(os.path.join(SAVE_DIR, "soil_class_names.json"), "w") as f:
    json.dump(idx_to_class, f, indent=2)
print("Class names saved.")

# ── Step 3: Class Weights ────────────────────────────────────
print("\n[STEP 3] Computing Class Weights")
train_labels = train_gen.classes
class_weights_arr = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_labels),
    y=train_labels
)
class_weight_dict = dict(enumerate(class_weights_arr))
print("Class weights:", {idx_to_class[k]: round(v, 3) for k, v in class_weight_dict.items()})

# ── Step 4: Build Model ──────────────────────────────────────
print("\n[STEP 4] Building MobileNetV2 Model")
NUM_CLASSES = len(class_names)

base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
)
# Freeze base initially
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.4)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)
predictions = Dense(NUM_CLASSES, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
print(f"Model built. Parameters: {model.count_params():,}")

# ── Step 5: Train Phase 1 (frozen base) ─────────────────────
print("\n[STEP 5] Training Phase 1 — Frozen base (10 epochs max)")
callbacks_p1 = [
    EarlyStopping(patience=4, restore_best_weights=True, monitor='val_accuracy'),
    ReduceLROnPlateau(factor=0.5, patience=2, monitor='val_loss', min_lr=1e-6),
]

history1 = model.fit(
    train_gen,
    epochs=10,
    validation_data=val_gen,
    class_weight=class_weight_dict,
    callbacks=callbacks_p1,
    verbose=1,
)

# ── Step 6: Fine-tune Phase 2 (unfreeze top layers) ─────────
print("\n[STEP 6] Training Phase 2 — Fine-tuning top 30 layers")
base_model.trainable = True
# Freeze all except last 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model_path = os.path.join(SAVE_DIR, "soil_image_model.keras")
callbacks_p2 = [
    EarlyStopping(patience=5, restore_best_weights=True, monitor='val_accuracy'),
    ModelCheckpoint(model_path, save_best_only=True, monitor='val_accuracy', verbose=1),
    ReduceLROnPlateau(factor=0.3, patience=3, monitor='val_loss', min_lr=1e-7),
]

history2 = model.fit(
    train_gen,
    epochs=EPOCHS,
    validation_data=val_gen,
    class_weight=class_weight_dict,
    callbacks=callbacks_p2,
    verbose=1,
)

# ── Step 7: Evaluate on Test Set ────────────────────────────
print("\n[STEP 7] Evaluating on Test Set")
# Reload best model
model = tf.keras.models.load_model(model_path)
test_loss, test_acc = model.evaluate(test_gen, verbose=1)
print(f"\nTest Accuracy: {test_acc*100:.2f}%")
print(f"Test Loss:     {test_loss:.4f}")

# Per-class evaluation
from sklearn.metrics import classification_report, confusion_matrix
test_gen.reset()
y_pred_probs = model.predict(test_gen, verbose=0)
y_pred = np.argmax(y_pred_probs, axis=1)
y_true = test_gen.classes

print("\nClassification Report:")
report = classification_report(y_true, y_pred, target_names=class_names, digits=3)
print(report)

print("\nConfusion Matrix:")
cm = confusion_matrix(y_true, y_pred)
print(cm)

# ── Step 8: Save Config ──────────────────────────────────────
print("\n[STEP 8] Saving Model Config")
config = {
    "model_path": model_path,
    "image_size": list(IMG_SIZE),
    "preprocessing": "mobilenet_v2",  # scale to [-1, 1]
    "num_classes": NUM_CLASSES,
    "class_names": idx_to_class,
    "train_samples": train_gen.samples,
    "val_samples": val_gen.samples,
    "test_samples": test_gen.samples,
    "test_accuracy": round(float(test_acc), 4),
    "test_loss": round(float(test_loss), 4),
    "framework": "tensorflow",
    "base_model": "MobileNetV2",
    "note": "Image-based soil type classification. Does NOT provide pH, NPK, EC, TDS values."
}

config_path = os.path.join(SAVE_DIR, "soil_model_config.json")
with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print(f"\nModel saved: {model_path}")
print(f"Config saved: {config_path}")
print("\n✅ Training complete!")
print(f"Final Test Accuracy: {test_acc*100:.2f}%")
