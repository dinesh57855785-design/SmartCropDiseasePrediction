import os
import sys
import logging

logger = logging.getLogger(__name__)
from pathlib import Path
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import DiseasePrediction, DiseaseInfo, get_confidence_info
from .serializers import (
    PredictionSerializer, PredictionUploadSerializer,
    DiseaseInfoSerializer
)

# Add AI model to path
AI_MODEL_DIR = Path(settings.BASE_DIR).parent / 'ai_model'
sys.path.insert(0, str(AI_MODEL_DIR))


def run_prediction(image_path, crop_name=''):
    """
    Run the AI prediction on an image using the trained model.
    Logs all exceptions so they appear in Render server logs.
    """
    try:
        from prediction.predict import predict_disease
        logger.info("[LeafAnalysis] Running AI prediction: path=%s crop=%s", image_path, crop_name)
        result = predict_disease(str(image_path), crop_name=crop_name)
        logger.info("[LeafAnalysis] AI prediction result: %s", result)
        return result
    except ValueError as ve:
        logger.warning("[LeafAnalysis] Unsupported crop error: %s", ve)
        raise
    except Exception as model_exc:
        logger.error("[LeafAnalysis] AI model prediction failed: %s", model_exc)
        raise


class PredictDiseaseView(APIView):
    """
    POST /api/disease/predict/
    Accepts a crop image and returns a disease prediction with full disease info.
    Supports authenticated users as well as guest tablet devices.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        try:
            serializer = PredictionUploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            image = serializer.validated_data['image']
            crop_name = serializer.validated_data.get('crop_name', '')

            # Validate file type (flexible for mobile and camera uploads)
            content_type = getattr(image, 'content_type', '') or ''
            image_name = getattr(image, 'name', '') or ''
            is_image_content = content_type.startswith('image/') or content_type == 'application/octet-stream'
            is_image_ext = any(image_name.lower().endswith(ext) for ext in ('.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'))
            if not (is_image_content or is_image_ext):
                return Response(
                    {'error': 'Please upload a valid image file (JPG, PNG, WEBP).'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save image temporarily for inference
            import tempfile
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    for chunk in image.chunks():
                        tmp.write(chunk)
                    tmp_path = tmp.name

                try:
                    logger.info("[LeafAnalysis] Saved upload to tmp: %s", tmp_path)
                    result = run_prediction(tmp_path, crop_name)
                    if not result:
                        raise RuntimeError("AI model returned empty result.")
                except Exception as pred_exc:
                    logger.exception("[LeafAnalysis] Prediction failed for %s: %s", tmp_path, pred_exc)
                    # Re-raise so the outer handler can return a proper error
                    raise
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.unlink(tmp_path)
                    except Exception:
                        pass

            # Resolve user for database record
            user = request.user if (request.user and request.user.is_authenticated) else None
            if not user:
                try:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    user = User.objects.first()
                    if not user:
                        user, _ = User.objects.get_or_create(
                            username='tablet_farmer',
                            defaults={'first_name': 'Tablet', 'last_name': 'Farmer', 'role': 'Farmer'}
                        )
                except Exception:
                    user = None

            # Save prediction to database safely
            prediction = None
            try:
                try:
                    image.seek(0)
                except Exception:
                    pass
                if user is not None:
                    prediction = DiseasePrediction.objects.create(
                        user=user,
                        image=image,
                        crop_name=crop_name or (result.get('disease', '').split('–')[0].split('-')[0].strip()),
                        predicted_disease=result['disease'],
                        disease_key=result.get('disease_key', ''),
                        confidence=result['confidence'],
                        treatment_advice=result.get('treatment', ''),
                        is_healthy=result.get('is_healthy', False),
                    )
            except Exception:
                prediction = None

            if prediction is not None:
                try:
                    serialized_data = PredictionSerializer(prediction, context={'request': request}).data
                    return Response(serialized_data, status=status.HTTP_201_CREATED)
                except Exception:
                    pass

            # Direct response construction if DB record creation or serialization fails
            crop_resolved = crop_name or (result.get('disease', '').split('–')[0].split('-')[0].strip())
            conf = float(result.get('confidence', 0.90))
            is_healthy = bool(result.get('is_healthy', False))
            disease_name = result.get('disease', 'Healthy Crop')
            disease_key = result.get('disease_key', '')
            treatment = result.get('treatment', '')

            disease_info_data = None
            if disease_key:
                try:
                    d_info = DiseaseInfo.objects.filter(disease_key=disease_key).first()
                    if d_info:
                        disease_info_data = DiseaseInfoSerializer(d_info).data
                except Exception:
                    disease_info_data = None

            smart_analysis = None
            try:
                from advisor.views import generate_smart_crop_recommendation
                smart_analysis = generate_smart_crop_recommendation(
                    crop=crop_resolved,
                    disease=disease_name,
                    confidence=conf,
                    is_healthy=is_healthy,
                    treatment=treatment,
                )
            except Exception:
                smart_analysis = None

            fallback_data = {
                'id': 0,
                'crop_name': crop_resolved,
                'predicted_disease': disease_name,
                'disease_key': disease_key,
                'confidence': conf,
                'confidence_percent': f"{conf * 100:.1f}%",
                'confidence_info': get_confidence_info(conf),
                'treatment_advice': treatment,
                'is_healthy': is_healthy,
                'disease_info': disease_info_data,
                'smart_crop_analysis': smart_analysis,
                'low_confidence_warning': "Prediction confidence is low. Please capture a clear leaf image and try again." if conf < 0.60 else None,
            }
            return Response(fallback_data, status=status.HTTP_200_OK)

        except Exception as main_exc:
            import traceback
            tb = traceback.format_exc()
            logger.error("[LeafAnalysis] POST failed with exception: %s\n%s", main_exc, tb)
            status_code = status.HTTP_400_BAD_REQUEST if isinstance(main_exc, ValueError) else status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response(
                {
                    'error': str(main_exc),
                    'error_detail': tb if (hasattr(__import__('django.conf', fromlist=['settings']), 'settings') and
                                          __import__('django.conf', fromlist=['settings']).settings.DEBUG) else None,
                },
                status=status_code,
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
