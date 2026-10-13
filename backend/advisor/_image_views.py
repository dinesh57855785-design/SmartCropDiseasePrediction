"""
advisor/_image_views.py
Visual image-based analysis views for Soil and Water.

Changes:
- Added MultiPartParser/FormParser so Render correctly parses multipart uploads.
- Added full Python logging so every step is visible in Render logs.
- Added proper image validation (type, size) with clear user-facing error messages.
- Normalized response keys: 'water_status' always present for water; 'soil_type_prediction' always present for soil.
- SoilImageAnalyzerView (V2 MobileNetV2 model) kept intact with better error reporting.
"""
import logging
import sys
from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings

logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png',
    'image/webp', 'image/bmp', 'image/gif',
    'application/octet-stream',
}
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}


def _validate_image(image_file):
    """Returns (True, None) on success or (False, error_message) on failure."""
    if not image_file:
        return False, "No image file was received by the server. Please re-select and re-upload the image."
    content_type = (getattr(image_file, 'content_type', '') or '').lower()
    name = getattr(image_file, 'name', '') or ''
    ext = Path(name).suffix.lower() if name else ''
    is_valid_type = (content_type in ALLOWED_CONTENT_TYPES) or (ext in ALLOWED_EXTENSIONS)
    if not is_valid_type:
        logger.warning("[ImageValidation] Rejected upload - content_type=%s name=%s", content_type, name)
        return False, (
            f"Invalid file type: '{content_type}' (file: '{name}'). "
            "Please upload a JPG, PNG, or WEBP image."
        )
    size = getattr(image_file, 'size', None)
    if size is not None and size > MAX_IMAGE_BYTES:
        size_mb = size / (1024 * 1024)
        logger.warning("[ImageValidation] Image too large: %.2f MB", size_mb)
        return False, f"Image is too large ({size_mb:.1f} MB). Maximum allowed is 10 MB."
    return True, None


class SoilImageAnalysisView(APIView):
    """POST /api/advisor/soil-image/ - Visual Soil Surface Assessment."""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info("[SoilImageAnalysis] Request received from %s", request.META.get('REMOTE_ADDR', 'unknown'))
        image_file = request.FILES.get('image')
        ok, err = _validate_image(image_file)
        if not ok:
            logger.error("[SoilImageAnalysis] Validation failed: %s", err)
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from PIL import Image as PILImage
            logger.info("[SoilImageAnalysis] Opening image: name=%s size=%s content_type=%s",
                        getattr(image_file, 'name', '?'), getattr(image_file, 'size', '?'),
                        getattr(image_file, 'content_type', '?'))
            img = PILImage.open(image_file).convert('RGB').resize((100, 100))
            pixels = list(img.getdata())
            n = len(pixels)
            avg_r = sum(p[0] for p in pixels) / n
            avg_g = sum(p[1] for p in pixels) / n
            avg_b = sum(p[2] for p in pixels) / n
            logger.info("[SoilImageAnalysis] RGB averages: R=%.1f G=%.1f B=%.1f", avg_r, avg_g, avg_b)
            if avg_r < 70 and avg_g < 70 and avg_b < 70:
                soil_type = "Dark / Organic-Rich Topsoil"
                chars = "High organic content, dark colour, good water retention."
                suitable = ["Vegetables", "Rice", "Wheat", "Maize", "Cotton"]
                unsuitable = ["Cactus", "Succulents"]
                recs = ["Maintain current organic mulching practices.", "Ensure adequate drainage during heavy rainfall."]
            elif avg_r > 130 and avg_g < 100 and avg_b < 90:
                soil_type = "Red / Laterite Soil"
                chars = "Iron oxide rich, porous structure, prone to acidity and low phosphorus."
                suitable = ["Groundnut", "Potato", "Rice", "Sugarcane", "Cashew"]
                unsuitable = ["Crops sensitive to acidic soil"]
                recs = ["Apply agricultural lime or wood ash if soil tests show high acidity.", "Incorporate phosphorus fertilisers near root zone."]
            elif avg_r > 140 and avg_g > 130 and avg_b > 100:
                soil_type = "Light / Sandy Soil"
                chars = "Coarse texture, high aeration, fast drainage, low organic retention."
                suitable = ["Millets", "Pulses", "Groundnut", "Watermelon", "Root crops"]
                unsuitable = ["Paddy Rice (requires standing water)"]
                recs = ["Add vermicompost or farmyard manure (FYM) to increase organic matter.", "Use drip irrigation with frequent light watering cycles."]
            else:
                soil_type = "Loamy / Mixed Agricultural Soil"
                chars = "Balanced silt, sand, and clay composition with good tilth."
                suitable = ["Tomato", "Potato", "Chilli", "Wheat", "Vegetables"]
                unsuitable = []
                recs = ["Maintain regular crop rotation and seasonal soil testing.", "Apply balanced organic compost between growing seasons."]
            logger.info("[SoilImageAnalysis] Result: soil_type=%s", soil_type)
            return Response({
                'analysis_type': "AI Visual Surface Estimate",
                'soil_type_prediction': soil_type,
                'soil_condition': soil_type,
                'soil_characteristics': chars,
                'suitable_crops': suitable,
                'unsuitable_crops': unsuitable,
                'recommendations': recs,
                'chemical_parameters': "Data unavailable (Requires lab test)",
                'disclaimer': (
                    'This is an AI-based visual surface assessment using image colour analysis. '
                    'Photographs cannot measure laboratory soil parameters (pH, NPK, EC). '
                    'Enter physical measurements into the Soil Parameter tab for full AI fertility model prediction.'
                ),
            })
        except Exception as exc:
            logger.exception("[SoilImageAnalysis] Unexpected error: %s", exc)
            return Response({'error': f'Soil image analysis failed: {str(exc)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WaterImageAnalysisView(APIView):
    """POST /api/advisor/water-image/ - Visual Field Water Assessment."""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info("[WaterImageAnalysis] Request received from %s", request.META.get('REMOTE_ADDR', 'unknown'))
        image_file = request.FILES.get('image')
        ok, err = _validate_image(image_file)
        if not ok:
            logger.error("[WaterImageAnalysis] Validation failed: %s", err)
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from PIL import Image as PILImage
            logger.info("[WaterImageAnalysis] Opening image: name=%s size=%s content_type=%s",
                        getattr(image_file, 'name', '?'), getattr(image_file, 'size', '?'),
                        getattr(image_file, 'content_type', '?'))
            img = PILImage.open(image_file).convert('RGB').resize((100, 100))
            pixels = list(img.getdata())
            n = len(pixels)
            avg_r = sum(p[0] for p in pixels) / n
            avg_g = sum(p[1] for p in pixels) / n
            avg_b = sum(p[2] for p in pixels) / n
            logger.info("[WaterImageAnalysis] RGB averages: R=%.1f G=%.1f B=%.1f", avg_r, avg_g, avg_b)
            if avg_b > 120 and avg_b > avg_r and avg_b > avg_g:
                water_status = "Excess Water / Waterlogging Risk"
                irrigation_required = False
                condition = "Standing Water / Waterlogged Field"
                color_obs = "bluish/reflective surface"
                suit = "Excess Water - Drainage Recommended"
                obs = ["High surface reflection / standing water detected in field area", "Risk of root suffocation and anaerobic soil conditions", "Excessive wetness can trigger fungal spore proliferation"]
                recs = ["Hold off all irrigation until surface water drains", "Clear drainage channels and ditches around crop beds", "Monitor for damping-off and root rot symptoms"]
                risks = ["Root rot diseases", "Nutrient leaching", "Soil compaction"]
            elif avg_r > avg_b + 25 and avg_g > avg_b:
                water_status = "Sufficient Water"
                irrigation_required = False
                condition = "Moist Field / Muddy Soil"
                color_obs = "brownish / saturated soil"
                suit = "Sufficient Water - No Immediate Irrigation Needed"
                obs = ["Field soil appears saturated with visible moisture", "Sediment and moisture are well distributed"]
                recs = ["Maintain current irrigation interval", "Allow top 2-3 cm of soil to aerate before next watering cycle"]
                risks = ["Potential for drip emitter clogging if using turbid runoff"]
            elif avg_g > avg_r + 15 and avg_g > avg_b + 15:
                water_status = "Moderate Water"
                irrigation_required = False
                condition = "Moderate Field Moisture / Vegetated"
                color_obs = "greenish / vegetated moist area"
                suit = "Moderate Water Availability"
                obs = ["Vegetation cover with moderate soil moisture retention", "No severe standing water or extreme drought cracking observed"]
                recs = ["Irrigate moderately according to crop growth stage", "Use drip irrigation for optimal water efficiency"]
                risks = ["Monitor weeds competing for available field moisture"]
            elif avg_r > 150 and avg_g > 130 and avg_b > 100:
                water_status = "Low Water / Irrigation Required"
                irrigation_required = True
                condition = "Dry / Moisture Deficient Field"
                color_obs = "pale / dry surface"
                suit = "Low Water - Irrigation Required"
                obs = ["Pale dry surface with low visible moisture", "Crop may experience moisture stress if not watered"]
                recs = ["Schedule field irrigation promptly during cool morning or evening hours", "Apply organic mulch around plant base to reduce evaporation"]
                risks = ["Moisture stress causing blossom drop and reduced yields"]
            else:
                water_status = "Sufficient Water"
                irrigation_required = False
                condition = "Clear / Optimal Field Water Condition"
                color_obs = "balanced / normal field moisture"
                suit = "Sufficient Water - Field Condition Optimal"
                obs = ["Field surface shows balanced moisture without waterlogging", "No visible signs of severe drought or standing water puddles"]
                recs = ["Continue standard irrigation management according to crop plan", "Monitor soil moisture sensors for optimal scheduling"]
                risks = ["None observed visually"]
            logger.info("[WaterImageAnalysis] Result: water_status=%s", water_status)
            return Response({
                'analysis_type': "AI Visual Surface Estimate",
                'water_status': water_status,
                'field_water_availability': water_status,
                'irrigation_required': irrigation_required,
                'source': "Image Analysis",
                'water_condition': condition,
                'color_observed': color_obs,
                'suitability': suit,
                'observations': obs,
                'recommendations': recs,
                'risks': risks,
                'chemical_parameters': "Data unavailable (Requires lab test)",
                'disclaimer': (
                    'This is an AI-based visual assessment of field water condition and surface wetness. '
                    'Images cannot measure exact chemical water quality (pH, TDS, EC, Nitrates). '
                    'Enter water test values in the Manual Water Quality tab for full AI Groundwater Quality classification.'
                ),
            })
        except Exception as exc:
            logger.exception("[WaterImageAnalysis] Unexpected error: %s", exc)
            return Response({'error': f'Water image analysis failed: {str(exc)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SoilImageAnalyzerView(APIView):
    """
    POST /api/advisor/soil-image-v2/
    Soil image classification using Soil_Data_V3 MobileNetV2 model.
    Falls back with honest 503 if model is unavailable.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info("[SoilImageAnalyzerV2] Request received from %s", request.META.get('REMOTE_ADDR', 'unknown'))
        image_file = request.FILES.get('image')
        ok, err = _validate_image(image_file)
        if not ok:
            logger.error("[SoilImageAnalyzerV2] Validation failed: %s", err)
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        lang = request.data.get('lang', 'en')
        soil_img_pred_path = str(Path(settings.BASE_DIR).parent / 'ai_model' / 'soil_image')
        if soil_img_pred_path not in sys.path:
            sys.path.insert(0, soil_img_pred_path)
        model_result = None
        model_error = None
        try:
            from predict_soil_image import predict_soil_image  # noqa: F401
            image_bytes = image_file.read()
            if not image_bytes:
                logger.error("[SoilImageAnalyzerV2] Empty image bytes after read.")
                return Response({'error': 'Image file appears empty. Please re-upload.'}, status=status.HTTP_400_BAD_REQUEST)
            model_result = predict_soil_image(image_bytes, lang=lang)
            logger.info("[SoilImageAnalyzerV2] Model available=%s", model_result.get('available'))
        except ImportError:
            model_error = "Soil AI model (predict_soil_image) not deployed on this server."
            logger.warning("[SoilImageAnalyzerV2] %s", model_error)
        except Exception as exc:
            model_error = f"Soil model inference error: {str(exc)}"
            logger.exception("[SoilImageAnalyzerV2] %s", model_error)
        if model_result is None or not model_result.get("available", False):
            final_error = model_error or (model_result.get("error", "Soil AI model not yet ready.") if model_result else "Soil AI model not yet ready.")
            logger.warning("[SoilImageAnalyzerV2] Model not available: %s", final_error)
            return Response({
                "model_ready": False,
                "message": final_error,
                "message_ta": (model_result.get("error_ta", "மண் AI மாதிரி தயாரில்லை.") if model_result else "மண் AI மாதிரி தயாரில்லை."),
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        logger.info("[SoilImageAnalyzerV2] Prediction: class=%s conf=%s", model_result.get('predicted_class'), model_result.get('confidence'))
        return Response({
            "model_ready": True,
            "ai_soil_class": model_result["predicted_class"],
            "confidence": model_result["confidence"],
            "confidence_percent": model_result["confidence_percent"],
            "analysis_type": model_result["analysis_type"],
            "soil_condition": model_result["soil_condition"],
            "possible_problem": model_result["possible_problem"],
            "improvement": model_result["improvement"],
            "organic_methods": model_result["organic_methods"],
            "recommended_crops": model_result["recommended_crops"],
            "top_predictions": model_result.get("top_predictions", []),
            "note_en": model_result.get("note_en", ""),
            "note_ta": model_result.get("note_ta", ""),
            "ph": None,
            "npk": None,
            "ec": None,
            "tds": None,
            "lab_note": "pH, NPK, EC, TDS require laboratory soil testing. Not available from image.",
        })
