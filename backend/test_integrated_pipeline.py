"""
Comprehensive Integrated Pipeline Test for SmartCrop Disease Prediction + IoT System.
Validates:
1. Django REST API health and IoT sensor ingestion.
2. Field Water Availability and Soil Status calculation.
3. Unified Smart Crop Recommendation Engine (Disease + Soil + Field Water).
4. MobileNetV2 AI Disease Prediction and Smart Crop Analysis serialization.
"""
import os
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import django
from PIL import Image

# Configure Django settings
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from iot_sensor.models import SensorReading
from advisor.views import generate_smart_crop_recommendation

def run_tests():
    print("=" * 70)
    print("🌱 SMARTCROP INTEGRATED AI + IOT PIPELINE VERIFICATION")
    print("=" * 70)

    client = APIClient()

    # TEST 1: Post Live Sensor Telemetry (ESP32 Live Hardware)
    print("\n[TEST 1] Testing ESP32 Sensor Telemetry Ingestion...")
    sensor_payload = {
        "soil_moisture": 24.5,
        "water_level": 68.0,
        "temperature": 29.5,
        "humidity": 62.0,
        "device_id": "ESP32_WOKWI_DEMO",
        "pump_mode": "AUTO"
    }
    res = client.post('/api/sensor-data/', sensor_payload, format='json')
    assert res.status_code == 201, f"Expected 201 Created, got {res.status_code}: {res.data}"
    data = res.data['data']
    print(f"  ✓ Telemetry created: ID {data.get('id')}")
    print(f"  ✓ Soil Status: {data.get('soil_status')} (Advice: {data.get('soil_advice')})")
    print(f"  ✓ Field Water Availability: {data.get('field_water_availability')}")
    print(f"  ✓ Sensor Connection Status: {data.get('sensor_status')}")
    print(f"  ✓ Simulation Flag: {data.get('is_simulation')}")
    assert data.get('soil_status') == 'Dry', f"Expected Dry, got {data.get('soil_status')}"
    assert 'Sufficient Water' in data.get('field_water_availability'), f"Expected Sufficient Water, got {data.get('field_water_availability')}"

    # TEST 2: Retrieve Latest Telemetry
    print("\n[TEST 2] Testing Latest Telemetry Endpoint...")
    res_latest = client.get('/api/sensor-data/latest/')
    assert res_latest.status_code == 200, f"Expected 200 OK, got {res_latest.status_code}"
    latest_data = res_latest.data['data']
    print(f"  ✓ Latest Soil Moisture: {latest_data.get('soil_moisture')}%")
    print(f"  ✓ Latest Field Water: {latest_data.get('field_water_availability')}")
    print(f"  ✓ Pump Status: {latest_data.get('pump_status')}")
    print(f"  ✓ Automated Pump Decision: {res_latest.data.get('pump_decision', {}).get('reason')}")

    # TEST 3: Unified Smart Crop Recommendation Engine
    print("\n[TEST 3] Testing 3-Input Unified Recommendation Engine...")
    rec_result = generate_smart_crop_recommendation(
        crop="Tomato",
        disease="Tomato___Early_blight",
        confidence=0.92,
        is_healthy=False,
        treatment="Apply copper-based fungicide and remove infected lower leaves.",
        soil_moisture=24.5,
        water_level=68.0,
        lang="en"
    )
    print(f"  ✓ Diagnosed Disease: {rec_result['disease_analysis']['predicted_disease']} ({rec_result['disease_analysis']['confidence_pct']}%)")
    print(f"  ✓ Soil Evaluation: {rec_result['soil_analysis']['soil_status']} (Moisture: {rec_result['soil_analysis']['soil_moisture']}%)")
    print(f"  ✓ Field Water: {rec_result['water_analysis']['field_water_availability']}")
    print(f"  ✓ COMBINED PRACTICAL RECOMMENDATION:\n    \"{rec_result['combined_recommendation']}\"")
    assert "Early_blight" in rec_result['combined_recommendation'] or "copper-based" in rec_result['combined_recommendation']
    assert "soil" in rec_result['combined_recommendation'].lower() or "irrigation" in rec_result['combined_recommendation'].lower()

    # TEST 4: Unified Advisor API Endpoint (POST /api/advisor/recommend/)
    print("\n[TEST 4] Testing POST /api/advisor/recommend/ API Endpoint...")
    adv_payload = {
        "crop": "Tomato",
        "disease": "Tomato___healthy",
        "confidence": 0.95,
        "is_healthy": True,
        "soil_moisture": 45.0,
        "field_water_availability": "Sufficient Water"
    }
    adv_res = client.post('/api/advisor/recommend/', adv_payload, format='json')
    assert adv_res.status_code == 200, f"Expected 200 OK, got {adv_res.status_code}: {adv_res.data}"
    print(f"  ✓ API Combined Advice: \"{adv_res.data.get('combined_recommendation')}\"")

    # TEST 5: Full Leaf Disease AI Model Prediction + Serializer Smart Analysis
    print("\n[TEST 5] Testing Disease Prediction with MobileNetV2 Model...")
    img = Image.new('RGB', (224, 224), color=(34, 139, 34))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    img_file = io.BytesIO(img_byte_arr.read())
    img_file.name = 'test_leaf.jpg'

    predict_res = client.post('/api/disease/predict/', {'image': img_file, 'crop_name': 'Tomato'}, format='multipart')
    assert predict_res.status_code == 201, f"Expected 201 Created, got {predict_res.status_code}: {predict_res.data}"
    pred_data = predict_res.data
    print(f"  ✓ Predicted Disease: {pred_data.get('predicted_disease')}")
    print(f"  ✓ Confidence: {round(pred_data.get('confidence', 0) * 100, 2)}%")
    print(f"  ✓ Is Healthy: {pred_data.get('is_healthy')}")
    print(f"  ✓ Smart Crop Analysis included: {'smart_crop_analysis' in pred_data}")
    if 'smart_crop_analysis' in pred_data:
        print(f"  ✓ Embedded Recommendation: \"{pred_data['smart_crop_analysis'].get('combined_recommendation')}\"")

    # TEST 6: Field Water Image Assessment (POST /api/advisor/water-image/)
    print("\n[TEST 6] Testing Field Water Image Assessment...")
    water_img = Image.new('RGB', (100, 100), color=(50, 80, 200)) # blueish/water reflection
    water_img_bytes = io.BytesIO()
    water_img.save(water_img_bytes, format='JPEG')
    water_img_bytes.seek(0)
    water_img_file = io.BytesIO(water_img_bytes.read())
    water_img_file.name = 'water_test.jpg'

    water_res = client.post('/api/advisor/water-image/', {'image': water_img_file}, format='multipart')
    assert water_res.status_code == 200, f"Expected 200 OK, got {water_res.status_code}: {water_res.data}"
    print(f"  ✓ Field Water Availability (Image): {water_res.data.get('field_water_availability')}")
    print(f"  ✓ Visual Condition: {water_res.data.get('water_condition')}")

    print("\n" + "=" * 70)
    print("🎉 ALL 6 INTEGRATED PIPELINE TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()
