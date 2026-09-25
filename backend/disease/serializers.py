from rest_framework import serializers
from .models import DiseasePrediction, DiseaseInfo, get_confidence_info


class DiseaseInfoSerializer(serializers.ModelSerializer):
    """Full disease information from admin-managed database."""
    class Meta:
        model = DiseaseInfo
        fields = [
            'id', 'disease_key', 'crop_name', 'disease_name', 'severity',
            'symptoms', 'description',
            'organic_treatment', 'organic_dosage', 'organic_instructions',
            'chemical_treatment', 'chemical_dosage', 'chemical_instructions',
            'prevention', 'farming_tips', 'is_healthy',
        ]


class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for disease prediction results — includes enriched disease info and smart crop analysis."""
    confidence_percent = serializers.SerializerMethodField()
    confidence_info = serializers.SerializerMethodField()
    disease_info = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    low_confidence_warning = serializers.SerializerMethodField()
    smart_crop_analysis = serializers.SerializerMethodField()

    class Meta:
        model = DiseasePrediction
        fields = [
            'id', 'image', 'image_url', 'crop_name', 'predicted_disease',
            'disease_key', 'confidence', 'confidence_percent', 'confidence_info',
            'treatment_advice', 'is_healthy', 'disease_info',
            'low_confidence_warning', 'smart_crop_analysis', 'created_at',
        ]
        read_only_fields = [
            'id', 'predicted_disease', 'disease_key', 'confidence',
            'confidence_percent', 'confidence_info', 'treatment_advice',
            'is_healthy', 'disease_info', 'low_confidence_warning',
            'smart_crop_analysis', 'created_at',
        ]

    def get_confidence_percent(self, obj):
        return f"{obj.confidence * 100:.1f}%"

    def get_confidence_info(self, obj):
        return get_confidence_info(obj.confidence)

    def get_low_confidence_warning(self, obj):
        if obj.confidence < 0.60:
            return "Prediction confidence is low. Please capture a clear leaf image and try again."
        return None

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_disease_info(self, obj):
        """Look up DiseaseInfo by disease_key."""
        if not obj.disease_key:
            return None
        try:
            info = DiseaseInfo.objects.get(disease_key=obj.disease_key)
            return DiseaseInfoSerializer(info).data
        except DiseaseInfo.DoesNotExist:
            return None

    def get_smart_crop_analysis(self, obj):
        """Generate integrated Disease + Live Soil + Field Water intelligence analysis."""
        try:
            from advisor.views import generate_smart_crop_recommendation
            crop = obj.crop_name or (obj.predicted_disease.split('–')[0].strip() if '–' in obj.predicted_disease else 'Crop')
            return generate_smart_crop_recommendation(
                crop=crop,
                disease=obj.predicted_disease,
                confidence=obj.confidence,
                is_healthy=obj.is_healthy,
                treatment=obj.treatment_advice,
            )
        except Exception as e:
            return None



class PredictionUploadSerializer(serializers.Serializer):
    """Serializer for the image upload request."""
    image = serializers.ImageField()
    crop_name = serializers.CharField(max_length=100, required=False, default='')


class DiseaseInfoLookupSerializer(serializers.Serializer):
    """Look up disease info by disease key."""
    disease_key = serializers.CharField(max_length=200)
