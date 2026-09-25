from django.urls import path
from .views import (
    PredictDiseaseView, PredictionHistoryView,
    DiseaseInfoListView, DiseaseInfoDetailView,
)

urlpatterns = [
    path('predict/', PredictDiseaseView.as_view(), name='disease-predict'),
    path('history/', PredictionHistoryView.as_view(), name='disease-history'),
    path('info/', DiseaseInfoListView.as_view(), name='disease-info-list'),
    path('info/<str:disease_key>/', DiseaseInfoDetailView.as_view(), name='disease-info-detail'),
]
