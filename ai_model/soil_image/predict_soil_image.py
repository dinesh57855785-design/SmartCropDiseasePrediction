"""
Soil Image Inference Module
Uses MobileNetV2 model trained on Soil_Data_V3 (8 classes)
"""

import os
import json
import sys
import numpy as np


# ============================================================
# MODEL STATE
# ============================================================

_model = None
_class_names = None
_config = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ============================================================
# LOAD MODEL
# ============================================================

def _load_model():
    global _model, _class_names, _config

    if _model is not None:
        return True

    config_path = os.path.join(BASE_DIR, "soil_model_config.json")
    class_names_path = os.path.join(BASE_DIR, "soil_class_names.json")
    model_path = os.path.join(BASE_DIR, "soil_image_model.keras")

    if not os.path.exists(model_path):
        print("[SoilImageModel] Model file not found:")
        print(model_path)
        return False

    if not os.path.exists(class_names_path):
        print("[SoilImageModel] Class names file not found:")
        print(class_names_path)
        return False

    if not os.path.exists(config_path):
        print("[SoilImageModel] Config file not found:")
        print(config_path)
        return False

    try:
        import tensorflow as tf

        _model = tf.keras.models.load_model(model_path)

        with open(class_names_path, "r", encoding="utf-8") as f:
            _class_names = json.load(f)

        with open(config_path, "r", encoding="utf-8") as f:
            _config = json.load(f)

        return True

    except Exception as e:
        print(f"[SoilImageModel] Load error: {e}")
        return False


# ============================================================
# SOIL KNOWLEDGE BASE
# ============================================================

SOIL_KNOWLEDGE = {

    "Alluvial soil": {
        "condition_en":
            "Rich, fertile soil formed by river sediment deposits. Excellent for agriculture.",
        "condition_ta":
            "ஆற்று வண்டல் மண் — மிகவும் வளமான விவசாய மண்.",

        "problem_en":
            "May be prone to waterlogging in flood-prone areas. Low in nitrogen if not replenished.",
        "problem_ta":
            "வெள்ளப் பகுதிகளில் நீர் தேங்கும் அபாயம். தழைச்சத்து குறைவாக இருக்கலாம்.",

        "improvement_en":
            "Apply nitrogen-rich organic compost. Maintain proper drainage channels.",
        "improvement_ta":
            "தழைச்சத்து நிறைந்த கம்போஸ்ட் உரம் இடவும். வடிகால் வசதியை சீரமைக்கவும்.",

        "organic_en":
            "Use green manure (Dhaincha/Sesbania) and vermicompost.",
        "organic_ta":
            "பசுந்தழை உரம் மற்றும் மண்புழு உரம் பயன்படுத்தவும்.",

        "crops_en":
            "Rice, Wheat, Sugarcane, Maize, Vegetables (Tomato, Potato), Legumes",
        "crops_ta":
            "நெல், கோதுமை, கரும்பு, சோளம், காய்கறிகள் (தக்காளி, உருளைக்கிழங்கு), பயறுவகைகள்",
    },

    "Black": {
        "condition_en":
            "Black cotton soil (Vertisol). Rich in iron, lime, and calcium. Highly moisture-retentive.",
        "condition_ta":
            "கரிசல் மண் (கருப்பு மண்). இரும்பு, சுண்ணாம்பு நிறைந்தது. நீரை நீண்ட நேரம் தக்கவைக்கும்.",

        "problem_en":
            "Swells when wet and cracks when dry. Poor drainage. May need phosphorus supplementation.",
        "problem_ta":
            "ஈரமாகும்போது உப்பி, வறண்டால் வெடிக்கும். வடிகால் மோசமாக இருக்கும். மணிச்சத்து தேவைப்படலாம்.",

        "improvement_en":
            "Add organic matter to improve drainage. Subsoil plowing helps during dry season.",
        "improvement_ta":
            "வடிகால் மேம்படுத்த கரிமப் பொருள் சேர்க்கவும். ஆழ் உழவு செய்யவும்.",

        "organic_en":
            "Apply farmyard manure and compost before kharif season.",
        "organic_ta":
            "கரிசல் கோடைக்காலத்திற்கு முன் தொழு உரம் மற்றும் கம்போஸ்ட் இடவும்.",

        "crops_en":
            "Cotton, Sorghum, Groundnut, Sunflower, Linseed",
        "crops_ta":
            "பருத்தி, சோளம், வேர்க்கடலை, சூரியகாந்தி, ஆளி",
    },

    "Chalky": {
        "condition_en":
            "Chalky soil is alkaline with high calcium carbonate content. Shallow and fast-draining.",
        "condition_ta":
            "சுண்ணாம்பு மண் — காரத்தன்மை அதிகம், கால்சியம் கார்பனேட் நிறைந்தது. ஆழம் குறைவு.",

        "problem_en":
            "Alkaline pH limits nutrient availability (iron, manganese deficiency common). Very low water retention.",
        "problem_ta":
            "காரத்தன்மை அதிகமாக இருப்பதால் இரும்பு, மங்கனீஸ் சத்து பற்றாக்குறை ஏற்படலாம். நீர் தக்கவைக்கும் திறன் குறைவு.",

        "improvement_en":
            "Add sulfur to reduce pH. Incorporate heavy organic matter (compost/manure) to improve water retention.",
        "improvement_ta":
            "pH குறைக்க சல்பர் சேர்க்கவும். நீர் தக்கவைக்க அதிக கம்போஸ்ட் இடவும்.",

        "organic_en":
            "Peat moss, leaf mold, or well-rotted compost in large quantities.",
        "organic_ta":
            "கூழாம் பாசி, இலை கம்போஸ்ட் அல்லது நன்கு மக்கிய தொழு உரம் அதிக அளவில் சேர்க்கவும்.",

        "crops_en":
            "Brassicas (Cabbage, Cauliflower), Spinach, Beech trees. Avoid acid-loving plants.",
        "crops_ta":
            "முட்டைக்கோஸ், காலிஃபிளவர், கீரை வகைகள். அமிலத்தன்மை விரும்பும் செடிகளை தவிர்க்கவும்.",
    },

    "Clay soil": {
        "condition_en":
            "Heavy clay soil with small particles. Nutrient-rich but poor drainage and aeration.",
        "condition_ta":
            "களிமண் — மிகவும் நுண்ணிய துகள்கள். ஊட்டச்சத்து நிறைந்தது ஆனால் வடிகால் மற்றும் காற்றோட்டம் குறைவு.",

        "problem_en":
            "Compacts easily, poor aeration, waterlogging risk, slow to warm in spring.",
        "problem_ta":
            "எளிதில் நெரிசல் ஏற்படும், வேர் மண்டலத்தில் காற்று குறைவாக இருக்கும், நீர் தேங்கும்.",

        "improvement_en":
            "Add coarse sand and generous organic matter. Raised beds help. Avoid working when wet.",
        "improvement_ta":
            "கரடுமுரடான மணல் மற்றும் கம்போஸ்ட் சேர்க்கவும். உயர் பாத்திகளில் பயிரிடவும். ஈரத்தில் உழவு செய்ய வேண்டாம்.",

        "organic_en":
            "Gypsum, composted bark, and annual additions of compost significantly improve structure.",
        "organic_ta":
            "ஜிப்சம், மக்கிய மரப்பட்டை, ஆண்டுதோறும் கம்போஸ்ட் மண் அமைப்பை மேம்படுத்தும்.",

        "crops_en":
            "Broccoli, Brussels sprouts, Cabbage, Beans, Dahlias, Ornamental plants (with amendment)",
        "crops_ta":
            "ப்ராக்கோலி, பீன்ஸ், முட்டைக்கோஸ் வகைகள் (மண் திருத்தத்துடன்)",
    },

    "Mary": {
        "condition_en":
            "Marl-type soil — a mix of clay and calcium carbonate (limestone). Moderately fertile.",
        "condition_ta":
            "மார்ல் வகை மண் — களிமண் மற்றும் சுண்ணாம்பு கலவை. மிதமான வளம்.",

        "problem_en":
            "May be slightly alkaline. Can compact. Calcium content may lock out micronutrients.",
        "problem_ta":
            "சற்று காரத்தன்மை இருக்கலாம். அடர்த்தியாகும் வாய்ப்பு உள்ளது. நுண்ணூட்டச்சத்து பற்றாக்குறை ஏற்படலாம்.",

        "improvement_en":
            "Add sulfur for pH adjustment if needed. Incorporate organic matter for improved aeration.",
        "improvement_ta":
            "தேவையெனில் pH சீரமைக்க சல்பர் சேர்க்கவும். கரிமப்பொருள் சேர்த்து காற்றோட்டம் மேம்படுத்தவும்.",

        "organic_en":
            "Compost, animal manure, and cover crops help build organic matter.",
        "organic_ta":
            "கம்போஸ்ட், தொழு உரம், உழவு பயிர்கள் கரிமச்சத்தை அதிகரிக்கும்.",

        "crops_en":
            "Wheat, Barley, Sugar beet, Oilseed rape, Legumes",
        "crops_ta":
            "கோதுமை, பார்லி, சர்க்கரை வண்டல், எண்ணெய் வித்து பயிர்கள், பயறுவகைகள்",
    },

    "Red soil": {
        "condition_en":
            "Red laterite soil, formed by iron oxide weathering. Well-drained but low in nutrients and organic matter.",
        "condition_ta":
            "சிவப்பு/செம்மண் — இரும்பு ஆக்சைடு கொண்டது. நல்ல வடிகால், ஆனால் ஊட்டச்சத்து மற்றும் கரிமச்சத்து குறைவு.",

        "problem_en":
            "Low in nitrogen, phosphorus, and organic matter. Acidic in nature. Prone to erosion.",
        "problem_ta":
            "தழைச்சத்து, மணிச்சத்து மற்றும் கரிமச்சத்து குறைவு. அமிலத்தன்மை உடையது. அரிப்பு ஏற்படலாம்.",

        "improvement_en":
            "Apply lime to neutralize acidity. Add heavy doses of organic manure. Contour farming to prevent erosion.",
        "improvement_ta":
            "அமிலத்தன்மை குறைக்க சுண்ணாம்பு இடவும். அதிக அளவு கரிம உரம் சேர்க்கவும்.",

        "organic_en":
            "Green manure, compost, bone meal for phosphorus, and farmyard manure.",
        "organic_ta":
            "பசுந்தழை உரம், கம்போஸ்ட், எலும்பு மாவு, தொழு உரம் பயன்படுத்தவும்.",

        "crops_en":
            "Groundnut, Cotton, Millet, Tobacco, Ragi (Finger millet), Fruits (with amendment)",
        "crops_ta":
            "வேர்க்கடலை, பருத்தி, கம்பு, கேழ்வரகு, பழவகைகள் (உரம் சேர்த்து)",
    },

    "Sand": {
        "condition_en":
            "Sandy soil with large particles. Fast-draining, low in nutrients, poor water retention.",
        "condition_ta":
            "மணல் மண் — பெரிய துகள்கள். விரைவாக வடிகுழாய் ஆகும், ஊட்டச்சத்து குறைவு, நீர் தக்கவைக்கும் திறன் மிகவும் குறைவு.",

        "problem_en":
            "Very low water-holding capacity. Leaches nutrients quickly. Low organic matter.",
        "problem_ta":
            "நீர் தக்கவைக்கும் திறன் மிகவும் குறைவு. ஊட்டச்சத்துகள் விரைவாக கழுவப்படும். கரிமச்சத்து குறைவு.",

        "improvement_en":
            "Add heavy organic matter (compost, manure). Mulching is critical. Drip irrigation recommended.",
        "improvement_ta":
            "அதிக அளவு கம்போஸ்ட் மற்றும் தொழு உரம் சேர்க்கவும். மல்ச்சிங் அவசியம். சொட்டு நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.",

        "organic_en":
            "Peat, coir pith, compost, and biochar help retain moisture and nutrients.",
        "organic_ta":
            "தேங்காய் நார் (கோயர் பித்), கம்போஸ்ட், பயோசார் சேர்க்கவும்.",

        "crops_en":
            "Carrot, Radish, Peanut, Watermelon, Asparagus, Pine trees",
        "crops_ta":
            "கேரட், முள்ளங்கி, வேர்க்கடலை, தர்பூசணி, அஸ்பாரகஸ்",
    },

    "Silt": {
        "condition_en":
            "Silt soil has medium-fine particles. Fertile and moisture-retentive. Good for most crops.",
        "condition_ta":
            "வண்டல் மண் — நடுத்தர நுண்ணிய துகள்கள். வளமான, நீர் தக்கவைக்கும். பெரும்பாலான பயிர்களுக்கு ஏற்றது.",

        "problem_en":
            "Can compact and become waterlogged. Prone to surface crusting. Needs regular organic matter input.",
        "problem_ta":
            "நெரிசல் மற்றும் நீர் தேக்கம் ஏற்படலாம். மேற்பரப்பு கடினப்படலாம். கரிமச்சத்து தொடர்ந்து சேர்க்க வேண்டும்.",

        "improvement_en":
            "Add coarse material (grit or bark) to improve drainage. Regular composting maintains fertility.",
        "improvement_ta":
            "வடிகால் மேம்படுத்த கரடுமுரடான பொருள் (தரை மணல்) சேர்க்கவும். கம்போஸ்ட் வளத்தை பராமரிக்கும்.",

        "organic_en":
            "Compost and mulch to prevent surface crusting. Green manures help structure.",
        "organic_ta":
            "மேற்பரப்பு கடினப்படுவதை தவிர்க்க மல்ச்சிங் மற்றும் கம்போஸ்ட் பயன்படுத்தவும்.",

        "crops_en":
            "Most crops thrive: Wheat, Fruits, Vegetables. Excellent for market gardening.",
        "crops_ta":
            "பெரும்பாலான பயிர்கள் — கோதுமை, பழவகைகள், காய்கறிகள். சிறந்த விவசாய மண்.",
    },
}


# ============================================================
# PREDICT SOIL IMAGE
# ============================================================

def predict_soil_image(image_source, lang="en"):
    """
    Predict soil type from an image.

    image_source:
        - file path
        - bytes
        - PIL Image

    lang:
        - en
        - ta
    """

    if not _load_model():
        return {
            "available": False,
            "error": "Soil image model not yet trained. Please train the model first.",
            "error_ta": "மண் படம் கணிப்பு மாதிரி இன்னும் பயிற்சி பெறவில்லை."
        }

    try:
        import tensorflow as tf
        from PIL import Image
        import io

        img_size = tuple(
            _config.get("image_size", [224, 224])
        )

        # ----------------------------------------------------
        # Load image
        # ----------------------------------------------------

        if isinstance(image_source, (str, os.PathLike)):
            img = Image.open(image_source).convert("RGB")

        elif isinstance(image_source, bytes):
            img = Image.open(
                io.BytesIO(image_source)
            ).convert("RGB")

        else:
            img = (
                image_source.convert("RGB")
                if hasattr(image_source, "convert")
                else image_source
            )

        # ----------------------------------------------------
        # Resize
        # ----------------------------------------------------

        img = img.resize(img_size)

        img_array = np.array(
            img,
            dtype=np.float32
        )

        img_array = np.expand_dims(
            img_array,
            axis=0
        )

        # ----------------------------------------------------
        # MobileNetV2 preprocessing
        # ----------------------------------------------------

        img_array = (
            tf.keras.applications.mobilenet_v2.preprocess_input(
                img_array
            )
        )

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        predictions = _model.predict(
            img_array,
            verbose=0
        )

        pred_idx = int(
            np.argmax(predictions[0])
        )

        confidence = float(
            predictions[0][pred_idx]
        )

        # ----------------------------------------------------
        # Class
        # ----------------------------------------------------

        pred_class = _class_names.get(
            str(pred_idx),
            f"Class_{pred_idx}"
        )

        # ----------------------------------------------------
        # Knowledge base
        # ----------------------------------------------------

        kb = SOIL_KNOWLEDGE.get(
            pred_class,
            {}
        )

        suffix = "_ta" if lang == "ta" else "_en"

        # ----------------------------------------------------
        # Top 3 predictions
        # ----------------------------------------------------

        top_predictions = []

        for i in np.argsort(
            predictions[0]
        )[::-1][:3]:

            top_predictions.append({
                "class": _class_names.get(
                    str(i),
                    f"Class_{i}"
                ),
                "confidence": round(
                    float(predictions[0][i]) * 100,
                    1
                )
            })

        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        return {
            "available": True,

            "predicted_class": pred_class,

            "confidence": round(
                confidence,
                4
            ),

            "confidence_percent": round(
                confidence * 100,
                1
            ),

            "analysis_type":
                "AI Soil Image Classification (Soil_Data_V3)"
                if lang == "en"
                else "AI மண் படம் வகைப்பாடு",

            "soil_condition":
                kb.get(
                    f"condition{suffix}",
                    ""
                ),

            "possible_problem":
                kb.get(
                    f"problem{suffix}",
                    ""
                ),

            "improvement":
                kb.get(
                    f"improvement{suffix}",
                    ""
                ),

            "organic_methods":
                kb.get(
                    f"organic{suffix}",
                    ""
                ),

            "recommended_crops":
                kb.get(
                    f"crops{suffix}",
                    ""
                ),

            "note_en":
                "This is a visual soil classification only. "
                "pH, NPK, EC, TDS values require laboratory soil testing.",

            "note_ta":
                "இது காட்சி மண் வகைப்பாடு மட்டுமே. "
                "pH, NPK, EC, TDS மதிப்புகளுக்கு ஆய்வக மண் பரிசோதனை தேவை.",

            "top_predictions":
                top_predictions
        }

    except Exception as e:

        return {
            "available": False,
            "error": f"Prediction error: {str(e)}",
            "error_ta": f"கணிப்பு பிழை: {str(e)}"
        }


# ============================================================
# COMMAND LINE TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("========================================")
    print("       SOIL IMAGE AI")
    print("========================================")
    print()

    print("Loading soil image model...")

    if not _load_model():

        print()
        print("ERROR: Soil model could not be loaded.")
        print()
        sys.exit(1)

    print(
        f"Model loaded. Classes: {list(_class_names.values())}"
    )

    # --------------------------------------------------------
    # Check image argument
    # --------------------------------------------------------

    if len(sys.argv) < 2:

        print()
        print("Usage:")
        print(
            'python predict_soil_image.py "IMAGE_PATH" [en|ta]'
        )
        print()

        sys.exit(1)

    image_path = sys.argv[1]

    # Default language = English
    lang = (
        sys.argv[2].lower()
        if len(sys.argv) >= 3
        else "en"
    )

    if lang not in ("en", "ta"):
        print(
            "Invalid language. Use 'en' or 'ta'."
        )
        sys.exit(1)

    # --------------------------------------------------------
    # Check image
    # --------------------------------------------------------

    if not os.path.isfile(image_path):

        print()
        print("ERROR: Image not found:")
        print(image_path)
        print()

        sys.exit(1)

    # --------------------------------------------------------
    # Run prediction
    # --------------------------------------------------------

    print()
    print("Analyzing image...")
    print(image_path)
    print()

    result = predict_soil_image(
        image_path,
        lang
    )

    # --------------------------------------------------------
    # Prediction failed
    # --------------------------------------------------------

    if not result.get("available"):

        error_message = (
            result.get("error_ta")
            if lang == "ta"
            else result.get("error")
        )

        print()
        print("PREDICTION FAILED")
        print(error_message)
        print()

        sys.exit(1)

    # --------------------------------------------------------
    # Display result
    # --------------------------------------------------------

    print("========================================")
    print("           SOIL AI RESULT")
    print("========================================")

    print(
        f"Prediction       : "
        f"{result['predicted_class']}"
    )

    print(
        f"Confidence       : "
        f"{result['confidence_percent']}%"
    )

    print(
        f"Condition        : "
        f"{result['soil_condition']}"
    )

    print(
        f"Possible problem : "
        f"{result['possible_problem']}"
    )

    print(
        f"Improvement      : "
        f"{result['improvement']}"
    )

    print(
        f"Organic methods  : "
        f"{result['organic_methods']}"
    )

    print(
        f"Recommended crops: "
        f"{result['recommended_crops']}"
    )

    print()
    print("Top 3 predictions:")

    for item in result["top_predictions"]:

        print(
            f"  {item['class']}: "
            f"{item['confidence']}%"
        )

    print()
    print(
        result["note_ta"]
        if lang == "ta"
        else result["note_en"]
    )

    print("========================================")
    print()