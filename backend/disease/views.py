import os
import sys
from pathlib import Path
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import DiseasePrediction, DiseaseInfo
from .serializers import (
    PredictionSerializer, PredictionUploadSerializer,
    DiseaseInfoSerializer
)

# Add AI model to path
AI_MODEL_DIR = Path(settings.BASE_DIR).parent / 'ai_model'
sys.path.insert(0, str(AI_MODEL_DIR))


def run_prediction(image_path, crop_name=''):
    """
    Run the AI prediction on an image.
    Falls back to deterministic mock data if the model is not yet trained.
    """
    try:
        from prediction.predict import predict_disease
        result = predict_disease(str(image_path), crop_name=crop_name)
        return result
    except Exception:
        # Deterministic mock prediction for development when model is not trained yet
        import hashlib

        # All mock disease entries grouped by crop
        MOCK_DISEASES = {
            'Tomato': [
                ('Tomato___Early_blight',   'Tomato – Early Blight',     False),
                ('Tomato___Late_blight',    'Tomato – Late Blight',      False),
                ('Tomato___Bacterial_spot',  'Tomato – Bacterial Spot',   False),
                ('Tomato___Leaf_Mold',       'Tomato – Leaf Mold',        False),
                ('Tomato___Septoria_leaf_spot', 'Tomato – Septoria Leaf Spot', False),
                ('Tomato___healthy',        'Tomato – Healthy',          True),
            ],
            'Potato': [
                ('Potato___Early_blight',   'Potato – Early Blight',     False),
                ('Potato___Late_blight',    'Potato – Late Blight',      False),
                ('Potato___healthy',        'Potato – Healthy',          True),
            ],
            'Corn': [
                ('Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn – Gray Leaf Spot', False),
                ('Corn_(maize)___Common_rust_', 'Corn – Common Rust', False),
                ('Corn_(maize)___Northern_Leaf_Blight', 'Corn – Northern Leaf Blight', False),
                ('Corn_(maize)___healthy', 'Corn – Healthy', True),
            ],
            'Apple': [
                ('Apple___Apple_scab', 'Apple – Apple Scab', False),
                ('Apple___Black_rot', 'Apple – Black Rot', False),
                ('Apple___Cedar_apple_rust', 'Apple – Cedar Apple Rust', False),
                ('Apple___healthy', 'Apple – Healthy', True),
            ],
            'Grape': [
                ('Grape___Black_rot', 'Grape – Black Rot', False),
                ('Grape___Esca_(Black_Measles)', 'Grape – Black Measles', False),
                ('Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape – Leaf Blight', False),
                ('Grape___healthy', 'Grape – Healthy', True),
            ],
            'Pepper': [
                ('Pepper,_bell___Bacterial_spot', 'Bell Pepper – Bacterial Spot', False),
                ('Pepper,_bell___healthy', 'Bell Pepper – Healthy', True),
            ],
            'Rice': [
                ('Rice___healthy', 'Rice – Healthy', True),
            ],
            'Cotton': [
                ('Cotton___healthy', 'Cotton – Healthy', True),
            ],
            'Groundnut': [
                ('Groundnut___healthy', 'Groundnut – Healthy', True),
            ],
            'Sugarcane': [
                ('Sugarcane___healthy', 'Sugarcane – Healthy', True),
            ],
            'Wheat': [
                ('Wheat___healthy', 'Wheat – Healthy', True),
            ],
            'Other': [
                ('Other___healthy', 'Other – Healthy', True),
            ],
        }

        # Use image file hash for deterministic results
        try:
            with open(image_path, 'rb') as f:
                file_hash = hashlib.md5(f.read()).hexdigest()
            hash_int = int(file_hash, 16)
        except Exception:
            hash_int = hash(str(image_path))

        # Select disease pool based on crop_name
        crop_key = crop_name.strip().capitalize() if crop_name else ''
        if crop_key in MOCK_DISEASES:
            pool = MOCK_DISEASES[crop_key]
        else:
            # Flatten all diseases when no crop specified
            pool = []
            for diseases in MOCK_DISEASES.values():
                pool.extend(diseases)

        # Deterministic selection based on image hash
        idx = hash_int % len(pool)
        disease_key, disease_name, is_healthy = pool[idx]

        # Deterministic confidence based on different bits of the hash
        confidence = 0.55 + (((hash_int >> 8) % 42) / 100.0)
        confidence = round(min(confidence, 0.97), 4)

        treatment = 'Consult a local agricultural extension office for specific treatment recommendations.'
        if is_healthy:
            treatment = 'No treatment needed. Continue regular crop monitoring and care practices.'

        return {
            'disease': disease_name,
            'disease_key': disease_key,
            'confidence': confidence,
            'treatment': treatment,
            'is_healthy': is_healthy,
        }


class PredictDiseaseView(APIView):
    """
    POST /api/disease/predict/
    Accepts a crop image and returns a disease prediction with full disease info.
    Supports authenticated users as well as guest tablet devices.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = PredictionUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image = serializer.validated_data['image']
        crop_name = serializer.validated_data.get('crop_name', '')

        # Validate file type
        if not image.content_type.startswith('image/'):
            return Response(
                {'error': 'Please upload a valid image file (JPG, PNG, WEBP).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save image temporarily for inference
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            for chunk in image.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            result = run_prediction(tmp_path, crop_name)
        except Exception as e:
            return Response(
                {'error': f'Prediction failed: {str(e)}. Please try again with a clearer image.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        # Resolve user for database record
        user = request.user if (request.user and request.user.is_authenticated) else None
        if not user:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.first()
            if not user:
                user, _ = User.objects.get_or_create(
                    username='tablet_farmer',
                    defaults={'first_name': 'Tablet', 'last_name': 'Farmer', 'role': 'Farmer'}
                )

        # Save prediction to database
        image.seek(0)
        prediction = DiseasePrediction.objects.create(
            user=user,
            image=image,
            crop_name=crop_name or result.get('disease', '').split('–')[0].strip(),
            predicted_disease=result['disease'],
            disease_key=result.get('disease_key', ''),
            confidence=result['confidence'],
            treatment_advice=result.get('treatment', ''),
            is_healthy=result.get('is_healthy', False),
        )

        return Response(
            PredictionSerializer(prediction, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class PredictionHistoryView(generics.ListAPIView):
    """
    GET /api/disease/history/
    Returns the authenticated farmer's prediction history.
    """
    serializer_class = PredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DiseasePrediction.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class DiseaseInfoListView(generics.ListAPIView):
    """
    GET /api/disease/info/
    Returns all disease information entries.
    Optional query param: ?crop=Tomato
    """
    serializer_class = DiseaseInfoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = DiseaseInfo.objects.all()
        crop = self.request.query_params.get('crop')
        if crop:
            qs = qs.filter(crop_name__icontains=crop)
        return qs


class DiseaseInfoDetailView(generics.RetrieveAPIView):
    """
    GET /api/disease/info/<disease_key>/
    Returns full info for a specific disease by its AI class key.
    """
    serializer_class = DiseaseInfoSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'disease_key'
    queryset = DiseaseInfo.objects.all()
