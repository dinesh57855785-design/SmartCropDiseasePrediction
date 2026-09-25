"""
test_crop_health_analysis.py
Unit & Integration Test for 3-Pillar Crop Health Analysis System.
"""
import os
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from rest_framework.test import APIClient
from advisor.views import generate_smart_crop_recommendation

def run_tests():
    print("=" * 70, flush=True)
    print("🌱 CROP HEALTH ANALYSIS SYSTEM - VERIFICATION TESTS", flush=True)
    print("=" * 70, flush=True)

    client = APIClient()

    # TEST 1: Available Leaf + Soil + Water (Disease + Unsuitable Dry Soil)
    print("\n[TEST 1] Testing 3-Pillar Analysis with Disease & Low Soil Moisture...", flush=True)
    res1 = generate_smart_crop_recommendation(
        crop="Tomato",
        disease="Early Blight",
        confidence=0.98,
        is_healthy=False,
        soil_moisture=25.0,
        water_level=60.0,
        lang="en"
    )
    print(f"  ✓ Crop: {res1['disease_analysis']['crop']}")
    print(f"  ✓ Soil Status: {res1['soil_analysis']['soil_status']}")
    print(f"  ✓ Soil Advice: {res1['soil_analysis']['soil_advice']}")
    print(f"  ✓ Water Availability: {res1['water_analysis']['field_water_availability']}")
    print(f"  ✓ Level 2 Overall Recommendation:\n    \"{res1['combined_recommendation']}\"")
    assert res1['soil_analysis']['available'] is True
    assert res1['water_analysis']['available'] is True
    assert "may contribute to" in res1['combined_recommendation'] or "Early Blight" in res1['combined_recommendation']

    # TEST 2: Crop-Specific Moisture Threshold (Rice requires 60%-85%)
    print("\n[TEST 2] Testing Crop-Specific Thresholds (Rice with 45% moisture)...", flush=True)
    res2 = generate_smart_crop_recommendation(
        crop="Rice",
        disease="Healthy",
        confidence=0.99,
        is_healthy=True,
        soil_moisture=45.0,
        water_level=70.0,
        lang="en"
    )
    print(f"  ✓ Rice Soil Status: {res2['soil_analysis']['soil_status']}")
    print(f"  ✓ Rice Soil Advice: {res2['soil_analysis']['soil_advice']}")
    assert "low for Rice" in res2['soil_analysis']['soil_advice']

    # TEST 3: Missing Sensor Telemetry Handling (No Fake Data)
    print("\n[TEST 3] Testing Missing Telemetry Data Handling...", flush=True)
    from iot_sensor.models import SensorReading
    SensorReading.objects.all().delete()
    res3 = generate_smart_crop_recommendation(
        crop="Apple",
        disease="Apple Scab",
        confidence=0.95,
        is_healthy=False,
        soil_moisture=None,
        water_level=None,
        lang="en"
    )
    print(f"  ✓ Soil Available: {res3['soil_analysis']['available']}")
    print(f"  ✓ Soil Status: {res3['soil_analysis']['soil_status']}")
    print(f"  ✓ Water Status: {res3['water_analysis']['field_water_availability']}")
    assert res3['soil_analysis']['available'] is False
    assert res3['soil_analysis']['soil_status'] == "SOIL DATA UNAVAILABLE"
    assert res3['water_analysis']['field_water_availability'] == "WATER DATA UNAVAILABLE"

    # TEST 4: API Endpoint POST /api/advisor/recommend/
    print("\n[TEST 4] Testing POST /api/advisor/recommend/ Endpoint...", flush=True)
    payload = {
        "crop": "Potato",
        "disease": "Late Blight",
        "confidence": 0.94,
        "is_healthy": False,
        "soil_moisture": 80.0,
        "water_level": 80.0,
        "lang": "en"
    }
    api_res = client.post('/api/advisor/recommend/', payload, format='json')
    assert api_res.status_code == 200, f"Expected 200, got {api_res.status_code}"
    print(f"  ✓ Combined Advice: \"{api_res.data.get('combined_recommendation')}\"")
    assert "Late Blight" in api_res.data.get('combined_recommendation')

    print("\n" + "=" * 70, flush=True)
    print("🎉 ALL CROP HEALTH ANALYSIS TESTS PASSED SUCCESSFULLY!", flush=True)
    print("=" * 70, flush=True)

if __name__ == '__main__':
    run_tests()
