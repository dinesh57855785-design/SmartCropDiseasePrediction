from django.db import models
from django.conf import settings


# ─── Severity Choices ────────────────────────────────────────────────────────
SEVERITY_CHOICES = [
    ('Low', 'Low'),
    ('Medium', 'Medium'),
    ('High', 'High'),
    ('Critical', 'Critical'),
]

CONFIDENCE_BANDS = [
    (0,   20,  'very_low',  'Very Low Confidence',
     'The result is very uncertain. Please take a clearer, well-lit photo of the affected leaf and try again.'),
    (20,  40,  'low',       'Low Confidence',
     'The result is uncertain. Consider taking another photo and comparing the visible symptoms before any treatment.'),
    (40,  60,  'moderate',  'Moderate Confidence',
     'The result is possible but not confirmed. Inspect the plant carefully and consult an agricultural expert if unsure.'),
    (60,  80,  'high',      'High Confidence',
     'The disease is likely present. Review the symptoms and apply the recommended treatment if they match.'),
    (80,  100, 'very_high', 'Very High Confidence',
     'The detected disease is highly likely. The following treatment recommendations are provided for this disease.'),
]


def get_confidence_info(confidence_0_to_1: float) -> dict:
    """Return confidence band label and farmer-friendly explanation."""
    pct = confidence_0_to_1 * 100
    for low, high, key, label, explanation in CONFIDENCE_BANDS:
        if low <= pct < high or (high == 100 and pct >= 80):
            return {'key': key, 'label': label, 'explanation': explanation, 'percent': round(pct, 1)}
    return {'key': 'very_low', 'label': 'Very Low Confidence',
            'explanation': 'Confidence is too low to make a reliable recommendation.', 'percent': round(pct, 1)}


class DiseaseInfo(models.Model):
    """
    Admin-managed disease information database.
    Linked to AI predictions via disease_key (matches DISEASE_CLASSES labels).
    """
    # Link to AI model class name, e.g. "Tomato___Early_blight"
    disease_key = models.CharField(
        max_length=200, unique=True,
        help_text='Must match the AI model class name exactly, e.g. Tomato___Early_blight'
    )
    crop_name = models.CharField(max_length=100)
    disease_name = models.CharField(max_length=200)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Medium')

    # Disease details
    symptoms = models.TextField(help_text='Visible symptoms on the plant')
    description = models.TextField(help_text='Description of the disease and how it spreads')

    # Organic treatment
    organic_treatment = models.CharField(max_length=300, blank=True)
    organic_dosage = models.CharField(max_length=200, blank=True)
    organic_instructions = models.TextField(blank=True)

    # Chemical treatment
    chemical_treatment = models.CharField(max_length=300, blank=True)
    chemical_dosage = models.CharField(max_length=200, blank=True)
    chemical_instructions = models.TextField(blank=True)

    # Prevention and tips
    prevention = models.TextField(blank=True)
    farming_tips = models.TextField(blank=True)

    is_healthy = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['crop_name', 'disease_name']
        verbose_name = 'Disease Information'
        verbose_name_plural = 'Disease Information'

    def __str__(self):
        return f"{self.crop_name} — {self.disease_name} ({self.severity})"


class DiseasePrediction(models.Model):
    """Stores the result of an AI disease prediction for a crop image."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    image = models.ImageField(upload_to='predictions/%Y/%m/%d/')
    crop_name = models.CharField(max_length=100, blank=True)
    predicted_disease = models.CharField(max_length=200)
    disease_key = models.CharField(max_length=200, blank=True,
                                   help_text='Raw AI class key for DB lookup')
    confidence = models.FloatField(help_text='Confidence score between 0 and 1')
    treatment_advice = models.TextField(blank=True)
    is_healthy = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} – {self.predicted_disease} ({self.confidence:.1%})"
