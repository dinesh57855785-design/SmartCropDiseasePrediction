"""
models/cnn_transfer_learning/model.py
MobileNetV2 transfer learning model for crop disease classification.
Targets the PlantVillage dataset with 38 disease/healthy classes.
"""

# ── PlantVillage 38-class label mapping ────────────────────────────────────
DISEASE_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy',
]

NUM_CLASSES = len(DISEASE_CLASSES)  # 38
IMG_SIZE = (224, 224, 3)

HEALTHY_CLASSES = {cls for cls in DISEASE_CLASSES if cls.endswith('_healthy') or cls.endswith('___healthy')}

# Treatment advice mapping (abbreviated; expand for production)
TREATMENT_MAP = {
    'Apple___Apple_scab': 'Apply captan or sulfur-based fungicide at bud-break. Remove infected leaves.',
    'Apple___Black_rot': 'Prune and destroy infected wood. Apply fungicide (myclobutanil or captan).',
    'Apple___Cedar_apple_rust': 'Apply fungicide from pink through cover sprays. Remove nearby junipers if possible.',
    'Corn_(maize)___Northern_Leaf_Blight': 'Plant resistant varieties. Apply fungicide at early tassel (VT) stage.',
    'Corn_(maize)___Common_rust_': 'Apply fungicide (propiconazole) if rust is detected early. Plant resistant hybrids.',
    'Potato___Early_blight': 'Apply chlorothalonil or mancozeb. Rotate crops and remove infected debris.',
    'Potato___Late_blight': 'Remove and destroy infected plants immediately. Apply metalaxyl or cymoxanil fungicide.',
    'Tomato___Early_blight': 'Apply copper-based fungicide. Ensure good air circulation and remove affected leaves.',
    'Tomato___Late_blight': 'Apply chlorothalonil preventively. Destroy infected plants. Avoid overhead watering.',
    'Tomato___Bacterial_spot': 'Use copper bactericide. Remove infected plants. Practice crop rotation.',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': 'Control whitefly vector with insecticide. Use virus-resistant varieties.',
    'Grape___Black_rot': 'Apply mancozeb or myclobutanil. Remove mummified fruit. Prune for air circulation.',
}
DEFAULT_TREATMENT = 'Consult a local agricultural extension office for specific treatment recommendations.'
HEALTHY_TREATMENT = 'No treatment needed. Continue regular crop monitoring and care practices.'


def build_model(num_classes: int = NUM_CLASSES, trainable_base_layers: int = 30):
    """
    Build the MobileNetV2 transfer learning model.

    Args:
        num_classes: Number of output classes (default: 38 for PlantVillage).
        trainable_base_layers: Number of final base layers to unfreeze for fine-tuning.

    Returns:
        Compiled Keras model ready for training.
    """
    import tensorflow as tf
    from tensorflow.keras import layers, Model
    from tensorflow.keras.applications import MobileNetV2

    # Load pre-trained MobileNetV2 backbone (ImageNet weights)
    base_model = MobileNetV2(
        input_shape=IMG_SIZE,
        include_top=False,
        weights='imagenet'
    )

    # Freeze all but the last `trainable_base_layers` for initial training
    base_model.trainable = True
    for layer in base_model.layers[:-trainable_base_layers]:
        layer.trainable = False

    # Build classification head
    inputs = tf.keras.Input(shape=IMG_SIZE, name='image_input')
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name='gap')(x)
    x = layers.BatchNormalization(name='bn')(x)
    x = layers.Dense(512, activation='relu', name='fc1')(x)
    x = layers.Dropout(0.4, name='dropout1')(x)
    x = layers.Dense(256, activation='relu', name='fc2')(x)
    x = layers.Dropout(0.3, name='dropout2')(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='predictions')(x)

    model = Model(inputs, outputs, name='SmartCropDisease_MobileNetV2')

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    return model


def get_class_name(idx: int) -> str:
    """Convert class index to human-readable disease name."""
    raw = DISEASE_CLASSES[idx]
    parts = raw.split('___')
    crop = parts[0].replace('_', ' ').replace('(', '').replace(')', '').strip()
    disease = parts[1].replace('_', ' ').strip() if len(parts) > 1 else 'Unknown'
    if disease.lower() == 'healthy':
        return f"{crop} – Healthy"
    return f"{crop} – {disease}"


def get_treatment(class_name_raw: str) -> str:
    """Get treatment advice for a disease class."""
    if any(class_name_raw.endswith(h) for h in ['___healthy', '_healthy']):
        return HEALTHY_TREATMENT
    return TREATMENT_MAP.get(class_name_raw, DEFAULT_TREATMENT)


def is_healthy_class(class_name_raw: str) -> bool:
    """Check if a class represents a healthy plant."""
    return class_name_raw in HEALTHY_CLASSES
