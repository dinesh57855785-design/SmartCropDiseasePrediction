from django.db import models
from django.conf import settings

class SoilAnalysisRecord(models.Model):
    """Stores AI Soil Fertility Analysis history."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='soil_records',
        null=True, blank=True
    )
    analysis_type = models.CharField(max_length=100, default='AI Soil Fertility Model Prediction')
    predicted_class = models.CharField(max_length=100) # e.g. Less Fertile, Fertile, Highly Fertile
    confidence = models.FloatField(default=0.0)
    soil_condition = models.CharField(max_length=255, blank=True)
    possible_problem = models.TextField(blank=True)
    crop_suitability = models.TextField(blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    organic_methods = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Soil: {self.predicted_class} ({self.confidence:.1%}) - {self.created_at.strftime('%Y-%m-%d')}"


class WaterAnalysisRecord(models.Model):
    """Stores AI Water Quality Analysis history."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='water_records',
        null=True, blank=True
    )
    analysis_type = models.CharField(max_length=100, default='AI Water Quality Model Classification')
    predicted_class = models.CharField(max_length=100) # e.g. Excellent, Good, Poor, Very Poor, Unsuitable
    confidence = models.FloatField(default=0.0)
    water_status = models.CharField(max_length=255, blank=True)
    suitability = models.TextField(blank=True)
    observations = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    risks = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Water: {self.predicted_class} ({self.confidence:.1%}) - {self.created_at.strftime('%Y-%m-%d')}"
