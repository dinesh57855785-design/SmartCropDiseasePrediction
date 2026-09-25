from django.urls import path
from .views import (
    CropGrowthView, GenerateReportView, SoilAnalysisView,
    WaterAnalysisView, UnifiedRecommendationView,
    NeedToDoView, SeasonalSuggestionsView,
)
from ._image_views import SoilImageAnalysisView, WaterImageAnalysisView, SoilImageAnalyzerView

urlpatterns = [
    path('crop-growth/', CropGrowthView.as_view(), name='crop-growth'),
    path('report/', GenerateReportView.as_view(), name='generate-report'),
    path('soil/', SoilAnalysisView.as_view(), name='soil-analysis'),
    path('water/', WaterAnalysisView.as_view(), name='water-analysis'),
    path('recommend/', UnifiedRecommendationView.as_view(), name='unified-recommendation'),
    path('need-to-do/', NeedToDoView.as_view(), name='need-to-do'),
    path('seasonal/', SeasonalSuggestionsView.as_view(), name='seasonal-suggestions'),
    # AI Image Analysis
    path('soil-image/', SoilImageAnalysisView.as_view(), name='soil-image-analysis'),
    path('water-image/', WaterImageAnalysisView.as_view(), name='water-image-analysis'),
    # Soil_Data_V3 Image-Based Classifier
    path('soil-image-v2/', SoilImageAnalyzerView.as_view(), name='soil-image-v2'),
]

