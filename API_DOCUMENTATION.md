# 📡 Smart Crop Disease Prediction — IoT & Sensor API Documentation

This document describes all API endpoints for sensor telemetry ingestion, status retrieval, historical analytics, and automated irrigation configuration.

---

## Base URLs
* **Local Development**: `http://127.0.0.1:8000/api`
* **Local Network**: `http://<YOUR_LOCAL_IP>:8000/api`
* **Cloud / Tunnel (e.g., Ngrok)**: `https://<YOUR_NGROK_DOMAIN>/api`

---

## 1. Sensor Telemetry Ingestion (ESP32 Endpoint)

### `POST /api/sensor-data/`
Used by the ESP32 (or simulation scripts) to transmit live sensor telemetry readings.

* **Authentication**: None required (`AllowAny`)
* **Content-Type**: `application/json`

#### Request Body
```json
{
  "soil_moisture": 25.4,
  "water_level": 78.0,
  "temperature": 29.2,
  "humidity": 64.5,
  "pump_status": true,
  "pump_mode": "AUTO",
  "device_id": "ESP32_WOKWI_01"
}
```

#### Field Specifications
| Field | Type | Required | Constraints / Description |
| :--- | :--- | :--- | :--- |
| `soil_moisture` | Float | Yes | 0.0 to 100.0 (Soil moisture percentage) |
| `water_level` | Float | Yes | 0.0 to 100.0 (Water tank level percentage) |
| `temperature` | Float | Yes | -40.0 to 85.0 (Ambient temperature in °C) |
| `humidity` | Float | Yes | 0.0 to 100.0 (Relative air humidity in %) |
| `pump_status` | Boolean | Optional | `true` if pump is ON, `false` if OFF |
| `pump_mode` | String | Optional | `"AUTO"` or `"MANUAL"` (Default: `"AUTO"`) |
| `device_id` | String | Optional | Unique hardware device identifier |

#### Example Response (`201 Created`)
```json
{
  "status": "success",
  "message": "Sensor reading recorded successfully.",
  "data": {
    "id": 1,
    "soil_moisture": 25.4,
    "water_level": 78.0,
    "temperature": 29.2,
    "humidity": 64.5,
    "pump_status": true,
    "pump_mode": "AUTO",
    "device_id": "ESP32_WOKWI_01",
    "timestamp": "2026-08-22 10:45:00"
  },
  "pump_decision": {
    "pump_status": true,
    "recommended_state": true,
    "reason": "Soil moisture dry (25.4% < 30.0% threshold) and sufficient water in tank (78.0%)",
    "thresholds": {
      "soil_moisture_min": 30.0,
      "water_level_min": 20.0
    }
  }
}
```

#### Example cURL Request
```bash
curl -X POST http://127.0.0.1:8000/api/sensor-data/ \
  -H "Content-Type: application/json" \
  -d "{\"soil_moisture\": 25.4, \"water_level\": 78.0, \"temperature\": 29.2, \"humidity\": 64.5}"
```

---

## 2. Retrieve Latest Sensor Telemetry

### `GET /api/sensor-data/latest/`
Returns the most recent sensor reading recorded in the database along with the evaluated irrigation decision.

* **Authentication**: None required (`AllowAny`)

#### Example Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 12,
    "soil_moisture": 28.5,
    "water_level": 82.0,
    "temperature": 29.0,
    "humidity": 65.0,
    "pump_status": true,
    "pump_mode": "AUTO",
    "device_id": "ESP32_WOKWI_01",
    "timestamp": "2026-08-22 10:45:15"
  },
  "pump_decision": {
    "pump_status": true,
    "reason": "Soil moisture dry (28.5% < 30.0% threshold) and sufficient water in tank (82.0%)",
    "thresholds": {
      "soil_moisture_min": 30.0,
      "water_level_min": 20.0,
      "auto_control_enabled": true
    }
  }
}
```

#### Example cURL Request
```bash
curl -X GET http://127.0.0.1:8000/api/sensor-data/latest/
```

---

## 3. Retrieve Historical Sensor Readings

### `GET /api/sensor-data/history/?limit=20`
Returns a list of recent sensor readings sorted in reverse chronological order.

* **Query Parameters**:
  * `limit` (Optional, integer, default: `20`, max: `100`)

#### Example Response (`200 OK`)
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": 2,
      "soil_moisture": 28.5,
      "water_level": 82.0,
      "temperature": 29.0,
      "humidity": 65.0,
      "pump_status": true,
      "pump_mode": "AUTO",
      "device_id": "ESP32_WOKWI_01",
      "timestamp": "2026-08-22 10:45:15"
    },
    {
      "id": 1,
      "soil_moisture": 62.0,
      "water_level": 80.0,
      "temperature": 27.5,
      "humidity": 70.0,
      "pump_status": false,
      "pump_mode": "AUTO",
      "device_id": "ESP32_WOKWI_01",
      "timestamp": "2026-08-22 10:40:00"
    }
  ]
}
```

#### Example cURL Request
```bash
curl -X GET "http://127.0.0.1:8000/api/sensor-data/history/?limit=10"
```

---

## 4. Get or Update Pump Threshold Configuration

### `GET /api/sensor-data/pump-config/`
Returns current threshold settings.

#### Example Response (`200 OK`)
```json
{
  "status": "success",
  "config": {
    "soil_moisture_min": 30.0,
    "water_level_min": 20.0,
    "auto_control_enabled": true,
    "updated_at": "2026-08-22T10:38:00.000Z"
  }
}
```

### `POST /api/sensor-data/pump-config/`
Updates irrigation threshold settings.

#### Request Body
```json
{
  "soil_moisture_min": 35.0,
  "water_level_min": 25.0,
  "auto_control_enabled": true
}
```

#### Example Response (`200 OK`)
```json
{
  "status": "success",
  "message": "Pump thresholds updated successfully.",
  "config": {
    "soil_moisture_min": 35.0,
    "water_level_min": 25.0,
    "auto_control_enabled": true,
    "updated_at": "2026-08-22T10:46:00.000Z"
  }
}
```
