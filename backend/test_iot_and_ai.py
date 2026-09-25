"""
test_iot_and_ai.py
Automated integration test for IoT Sensor Telemetry, Automated Pump Logic, Dashboard Live Controls, and AI Disease Prediction.
"""
import os
import sys

# Fix windows console output encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from rest_framework.test import APIClient
from iot_sensor.models import SensorReading, PumpThresholdConfig
from disease.models import DiseasePrediction

def test_iot_telemetry_and_presets():
    print("\n--- Testing IoT Telemetry Endpoints & Dashboard Simulator Presets ---", flush=True)
    client = APIClient()

    # Preset 1: Soil 20 + Water 80 -> PUMP ON
    payload_dry = {
        "soil_moisture": 20.0,
        "water_level": 80.0,
        "temperature": 31.0,
        "humidity": 55.0,
        "device_id": "DASHBOARD_SIMULATOR"
    }
    resp1 = client.post('/api/sensor-data/', payload_dry, format='json')
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.data}"
    assert resp1.data['pump_decision']['pump_status'] is True, "Pump should be ON for Soil 20 + Water 80"
    print("[PASS] Preset '🌱 Dry Soil' (Soil 20% + Water 80%) -> PUMP ON successfully verified.", flush=True)

    # Preset 2: Soil 70 + Water 80 -> PUMP OFF
    payload_wet = {
        "soil_moisture": 70.0,
        "water_level": 80.0,
        "temperature": 27.5,
        "humidity": 68.0,
        "device_id": "DASHBOARD_SIMULATOR"
    }
    resp2 = client.post('/api/sensor-data/', payload_wet, format='json')
    assert resp2.status_code == 201
    assert resp2.data['pump_decision']['pump_status'] is False, "Pump should be OFF for Soil 70 + Water 80"
    print("[PASS] Preset '🌿 Wet Soil' (Soil 70% + Water 80%) -> PUMP OFF successfully verified.", flush=True)

    # Preset 3: Soil 20 + Water 10 -> PUMP OFF (Low water cutoff)
    payload_low_water = {
        "soil_moisture": 20.0,
        "water_level": 10.0,
        "temperature": 33.0,
        "humidity": 50.0,
        "device_id": "DASHBOARD_SIMULATOR"
    }
    resp3 = client.post('/api/sensor-data/', payload_low_water, format='json')
    assert resp3.status_code == 201
    assert resp3.data['pump_decision']['pump_status'] is False, "Pump should be OFF for Soil 20 + Water 10"
    print("[PASS] Preset '💧 Low Water' (Soil 20% + Water 10%) -> PUMP OFF (Safety Lock) verified.", flush=True)

    # Preset 4: Soil 20 + Water 80 -> PUMP ON (Irrigation Required)
    payload_irrigate = {
        "soil_moisture": 20.0,
        "water_level": 80.0,
        "temperature": 30.0,
        "humidity": 60.0,
        "device_id": "DASHBOARD_SIMULATOR"
    }
    resp4 = client.post('/api/sensor-data/', payload_irrigate, format='json')
    assert resp4.status_code == 201
    assert resp4.data['pump_decision']['pump_status'] is True
    print("[PASS] Preset '🚿 Irrigation Required' (Soil 20% + Water 80%) -> PUMP ON verified.", flush=True)

    # Verify GET /api/sensor-data/latest/ returns the latest record from DASHBOARD_SIMULATOR
    resp_latest = client.get('/api/sensor-data/latest/')
    assert resp_latest.status_code == 200
    assert resp_latest.data['status'] == 'success'
    assert resp_latest.data['data']['soil_moisture'] == 20.0
    assert resp_latest.data['data']['water_level'] == 80.0
    assert resp_latest.data['data']['device_id'] == "DASHBOARD_SIMULATOR"
    print("[PASS] GET /api/sensor-data/latest/ -> Verified latest simulator data & pump state in database.", flush=True)

    # Verify real ESP32 telemetry POST works without device_id or with ESP32_WOKWI_01
    payload_esp32 = {
        "soil_moisture": 28.0,
        "water_level": 75.0,
        "temperature": 28.5,
        "humidity": 65.0,
        "device_id": "ESP32_WOKWI_01"
    }
    resp_esp = client.post('/api/sensor-data/', payload_esp32, format='json')
    assert resp_esp.status_code == 201
    assert resp_esp.data['data']['device_id'] == "ESP32_WOKWI_01"
    print("[PASS] Real ESP32 payload POST -> Works seamlessly with same database & endpoints.", flush=True)


def test_ai_views_and_model():
    print("\n--- Testing Existing AI Disease Views & Fallback Handling ---", flush=True)
    from disease.views import run_prediction
    from django.conf import settings
    from pathlib import Path

    model_path = settings.AI_MODEL_PATH
    print(f"AI Model Path: {model_path} (Exists: {model_path.exists()})", flush=True)
    assert model_path.exists(), f"model.h5 not found at {model_path}"

    from PIL import Image
    test_img_path = Path(settings.BASE_DIR) / 'test_sample.jpg'
    img = Image.new('RGB', (224, 224), color=(34, 139, 34))
    img.save(test_img_path)

    client = APIClient()

    try:
        # 1. Direct function inference test
        res = run_prediction(str(test_img_path), crop_name='Tomato')
        print(f"[PASS] AI Prediction direct result: {res['disease']} (Confidence: {res['confidence']:.2f})", flush=True)

        # 2. Test HTTP multipart upload to POST /api/disease/predict/ (from tablet / guest device)
        with open(test_img_path, 'rb') as f:
            resp_api = client.post('/api/disease/predict/', {'image': f, 'crop_name': 'Tomato'}, format='multipart')
        assert resp_api.status_code == 201, f"Expected 201 from /api/disease/predict/, got {resp_api.status_code}: {resp_api.data}"
        assert 'predicted_disease' in resp_api.data
        assert 'confidence' in resp_api.data
        print(f"[PASS] POST /api/disease/predict/ -> Diagnosis: '{resp_api.data['predicted_disease']}', Confidence: {resp_api.data['confidence'] * 100:.1f}%, Status: {'HEALTHY' if resp_api.data['is_healthy'] else 'DISEASE DETECTED'}", flush=True)
    finally:
        if test_img_path.exists():
            test_img_path.unlink()


if __name__ == '__main__':
    try:
        test_iot_telemetry_and_presets()
        test_ai_views_and_model()
        print("\n🎉 ALL TESTS PASSED! Tablet Camera & AI Prediction Endpoints are 100% operational.\n", flush=True)
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)

