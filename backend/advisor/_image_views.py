from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from pathlib import Path

class SoilImageAnalysisView(APIView):
    """POST /api/advisor/soil-image/ - Visual Soil Surface Assessment."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        if not image_file.content_type.startswith('image/'):
            return Response({'error': 'Invalid file type. Upload JPG, PNG, or WEBP.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from PIL import Image
            img = Image.open(image_file).convert('RGB').resize((100, 100))
            pixels = list(img.getdata())
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)

            # Evaluate visual soil surface characteristics
            if avg_r < 70 and avg_g < 70 and avg_b < 70:
                soil_type = "Dark / Organic-Rich Topsoil"
                chars = "High organic content, dark color, good water retention."
                suitable = ["Vegetables", "Rice", "Wheat", "Maize", "Cotton"]
                unsuitable = ["Cactus", "Succulents"]
                recs = [
                    "Maintain current organic mulching practices.",
                    "Ensure adequate drainage during heavy rainfall."
                ]
            elif avg_r > 130 and avg_g < 100 and avg_b < 90:
                soil_type = "Red / Laterite Soil"
                chars = "Iron oxide rich, porous structure, prone to acidity and low phosphorus."
                suitable = ["Groundnut", "Potato", "Rice", "Sugarcane", "Cashew"]
                unsuitable = ["Crops sensitive to acidic soil"]
                recs = [
                    "Apply agricultural lime or wood ash if soil tests show high acidity.",
                    "Incorporate phosphorus fertilizers near root zone."
                ]
            elif avg_r > 140 and avg_g > 130 and avg_b > 100:
                soil_type = "Light / Sandy Soil"
                chars = "Coarse texture, high aeration, fast drainage, low organic retention."
                suitable = ["Millets", "Pulses", "Groundnut", "Watermelon", "Root crops"]
                unsuitable = ["Paddy Rice (requires standing water)"]
                recs = [
                    "Add vermicompost or farmyard manure (FYM) to increase organic matter.",
                    "Use drip irrigation with frequent light watering cycles."
                ]
            else:
                soil_type = "Loamy / Mixed Agricultural Soil"
                chars = "Balanced silt, sand, and clay composition with good tilth."
                suitable = ["Tomato", "Potato", "Chilli", "Wheat", "Vegetables"]
                unsuitable = []
                recs = [
                    "Maintain regular crop rotation and seasonal soil testing.",
                    "Apply balanced organic compost between growing seasons."
                ]

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
                    'This is an AI-based visual surface assessment using image color analysis. '
                    'Photographs cannot measure laboratory soil parameters (pH, NPK, EC). '
                    'Enter physical measurements into the Soil Parameter tab for full AI fertility model prediction.'
                ),
            })
        except Exception as e:
            return Response({'error': f'Analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WaterImageAnalysisView(APIView):
    """POST /api/advisor/water-image/ - Visual Field Water Assessment."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        if not image_file.content_type.startswith('image/'):
            return Response({'error': 'Invalid file type. Upload JPG, PNG, or WEBP.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from PIL import Image
            img = Image.open(image_file).convert('RGB').resize((100, 100))
            pixels = list(img.getdata())
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)

            # Evaluate field water availability and surface condition
            if avg_b > 120 and avg_b > avg_r and avg_b > avg_g:
                water_status = "Excess Water / Waterlogging Risk"
                irrigation_required = False
                condition = "Standing Water / Waterlogged Field"
                color_obs = "bluish/reflective surface"
                suit = "Excess Water - Drainage Recommended"
                obs = [
                    "High surface reflection / standing water detected in field area",
                    "Risk of root suffocation and anaerobic soil conditions",
                    "Excessive wetness can trigger fungal spore proliferation"
                ]
                recs = [
                    "Hold off all irrigation until surface water drains",
                    "Clear drainage channels and ditches around crop beds",
                    "Monitor for damping-off and root rot symptoms"
                ]
                risks = ["Root rot diseases", "Nutrient leaching", "Soil compaction"]
            elif avg_r > avg_b + 25 and avg_g > avg_b:
                water_status = "Sufficient Water"
                irrigation_required = False
                condition = "Moist Field / Muddy Soil"
                color_obs = "brownish / saturated soil"
                suit = "Sufficient Water - No Immediate Irrigation Needed"
                obs = [
                    "Field soil appears saturated with visible moisture",
                    "Sediment and moisture are well distributed"
                ]
                recs = [
                    "Maintain current irrigation interval",
                    "Allow top 2-3 cm of soil to aerate before next watering cycle"
                ]
                risks = ["Potential for drip emitter clogging if using turbid runoff"]
            elif avg_g > avg_r + 15 and avg_g > avg_b + 15:
                water_status = "Moderate Water"
                irrigation_required = False
                condition = "Moderate Field Moisture / Vegetated"
                color_obs = "greenish / vegetated moist area"
                suit = "Moderate Water Availability"
                obs = [
                    "Vegetation cover with moderate soil moisture retention",
                    "No severe standing water or extreme drought cracking observed"
                ]
                recs = [
                    "Irrigate moderately according to crop growth stage",
                    "Use drip irrigation for optimal water efficiency"
                ]
                risks = ["Monitor weeds competing for available field moisture"]
            elif avg_r > 150 and avg_g > 130 and avg_b > 100:
                water_status = "Low Water / Irrigation Required"
                irrigation_required = True
                condition = "Dry / Moisture Deficient Field"
                color_obs = "pale / dry surface"
                suit = "Low Water - Irrigation Required"
                obs = [
                    "Pale dry surface with low visible moisture",
                    "Crop may experience moisture stress if not watered"
                ]
                recs = [
                    "Schedule field irrigation promptly during cool morning or evening hours",
                    "Apply organic mulch around plant base to reduce evaporation"
                ]
                risks = ["Moisture stress causing blossom drop and reduced yields"]
            else:
                water_status = "Sufficient Water"
                irrigation_required = False
                condition = "Clear / Optimal Field Water Condition"
                color_obs = "balanced / normal field moisture"
                suit = "Sufficient Water - Field Condition Optimal"
                obs = [
                    "Field surface shows balanced moisture without waterlogging",
                    "No visible signs of severe drought or standing water puddles"
                ]
                recs = [
                    "Continue standard irrigation management according to crop plan",
                    "Monitor soil moisture sensors for optimal scheduling"
                ]
                risks = ["None observed visually"]

            return Response({
                'analysis_type': "AI Visual Surface Estimate",
                'field_water_availability': water_status,
                'water_status': water_status,
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
        except Exception as e:
            return Response({'error': f'Analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SoilImageAnalyzerView(APIView):
    """
    POST /api/advisor/soil-image-v2/
    Soil image classification using Soil_Data_V3 trained MobileNetV2 model.
    Returns actual AI model predictions — never fabricates pH/NPK/EC/TDS.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        if not image_file.content_type.startswith('image/'):
            return Response({'error': 'Invalid file type. Upload JPG, PNG, or WEBP.'}, status=status.HTTP_400_BAD_REQUEST)

        lang = request.data.get('lang', 'en')

        # Import inference module
        import sys as _sys
        soil_img_pred_path = str(Path(settings.BASE_DIR).parent / 'ai_model' / 'soil_image')
        if soil_img_pred_path not in _sys.path:
            _sys.path.insert(0, soil_img_pred_path)

        try:
            from predict_soil_image import predict_soil_image
            image_bytes = image_file.read()
            result = predict_soil_image(image_bytes, lang=lang)
        except Exception as e:
            result = {
                "available": False,
                "error": f"Soil model error: {str(e)}"
            }

        if not result.get("available", False):
            # Model not yet trained — return honest status
            return Response({
                "model_ready": False,
                "message": result.get("error", "Soil AI model not yet ready."),
                "message_ta": result.get("error_ta", "மண் AI மாதிரி தயாரில்லை."),
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({
            "model_ready": True,
            "ai_soil_class": result["predicted_class"],
            "confidence": result["confidence"],
            "confidence_percent": result["confidence_percent"],
            "analysis_type": result["analysis_type"],
            "soil_condition": result["soil_condition"],
            "possible_problem": result["possible_problem"],
            "improvement": result["improvement"],
            "organic_methods": result["organic_methods"],
            "recommended_crops": result["recommended_crops"],
            "top_predictions": result.get("top_predictions", []),
            "note_en": result.get("note_en", ""),
            "note_ta": result.get("note_ta", ""),
            # Explicitly mark unavailable lab parameters
            "ph": None,
            "npk": None,
            "ec": None,
            "tds": None,
            "lab_note": "pH, NPK, EC, TDS require laboratory soil testing. Not available from image.",
        })
