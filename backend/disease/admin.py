from django.contrib import admin
from .models import DiseasePrediction, DiseaseInfo


@admin.register(DiseaseInfo)
class DiseaseInfoAdmin(admin.ModelAdmin):
    list_display = [
        'crop_name', 'disease_name', 'disease_key', 'severity', 'is_healthy', 'updated_at'
    ]
    list_filter = ['crop_name', 'severity', 'is_healthy']
    search_fields = ['crop_name', 'disease_name', 'disease_key']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Identification', {
            'fields': ('disease_key', 'crop_name', 'disease_name', 'severity', 'is_healthy')
        }),
        ('Disease Details', {
            'fields': ('symptoms', 'description')
        }),
        ('Organic Treatment', {
            'fields': ('organic_treatment', 'organic_dosage', 'organic_instructions'),
            'classes': ('collapse',),
        }),
        ('Chemical Treatment', {
            'fields': ('chemical_treatment', 'chemical_dosage', 'chemical_instructions'),
            'classes': ('collapse',),
        }),
        ('Prevention & Tips', {
            'fields': ('prevention', 'farming_tips')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    ordering = ['crop_name', 'disease_name']


@admin.register(DiseasePrediction)
class DiseasePredictionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'predicted_disease', 'disease_key', 'confidence',
        'crop_name', 'is_healthy', 'created_at'
    ]
    list_filter = ['is_healthy', 'created_at', 'crop_name']
    search_fields = ['user__username', 'predicted_disease', 'crop_name', 'disease_key']
    readonly_fields = ['created_at', 'disease_key']
