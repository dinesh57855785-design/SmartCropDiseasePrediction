# 🌿 IoT Setup & Wokwi Simulation Guide

This guide describes how to configure, wire, run, and test the **ESP32 IoT simulation in Wokwi** connected to the **SmartCropDiseasePrediction** Django REST API and Dashboard.

---

## 1. System Architecture Overview

```
+------------------------+
|      Wokwi ESP32       |
|  - DHT22 (Temp/Hum)    |
|  - Potentiometer Soil  |
|  - Potentiometer Water |
|  - Relay (Pump) & LED  |
+-----------+------------+
            | (Wi-Fi: Wokwi-GUEST)
            v (HTTP POST JSON)
+------------------------+
|   Django REST API      |
|  /api/sensor-data/     |
+-----------+------------+
            |
            v (ORM / SQLite)
+------------------------+
|      Database          |
|  (SensorReading Table) |
+-----------+------------+
            |
            v (GET /api/sensor-data/latest/)
+------------------------+
|  React Web Dashboard   |
|  (Live Telemetry Card) |
+------------------------+
```

---

## 2. Hardware & Components in Wokwi Simulation

* **Microcontroller**: ESP32 DevKit v1 (`board-esp32-devkit-c-v4`)
* **DHT22 Sensor**: Ambient Temperature & Relative Humidity (`wokwi-dht22`)
* **Soil Moisture Sensor**: Analog Potentiometer (`wokwi-potentiometer` labeled "Soil Moisture (%)")
* **Water Tank Level Sensor**: Analog Potentiometer (`wokwi-potentiometer` labeled "Water Tank Level (%)")
* **Relay Module**: 5V/3.3V Relay (`wokwi-relay-module`) representing the Irrigation Pump switch
* **Pump Active LED**: Green indicator LED (`wokwi-led`) with 220Ω current-limiting resistor

---

## 3. GPIO Pin Assignments & Wiring

| Component | Component Pin | ESP32 Pin | Wire Color | Function |
| :--- | :--- | :--- | :--- | :--- |
| **DHT22** | VCC | `3V3` | Red | 3.3V Power |
| **DHT22** | GND | `GND` | Black | Ground |
| **DHT22** | SDA / DATA | `GPIO 15` | Gold | Digital Temp/Humidity Data |
| **Soil Moisture Pot** | VCC | `3V3` | Red | 3.3V Reference |
| **Soil Moisture Pot** | GND | `GND` | Black | Ground |
| **Soil Moisture Pot** | SIG (Wiper) | `GPIO 34` | Orange | ADC1_CH6 (0–4095 &rarr; 0–100%) |
| **Water Level Pot** | VCC | `3V3` | Red | 3.3V Reference |
| **Water Level Pot** | GND | `GND` | Black | Ground |
| **Water Level Pot** | SIG (Wiper) | `GPIO 35` | Blue | ADC1_CH7 (0–4095 &rarr; 0–100%) |
| **Relay Module** | VCC | `5V` / `3V3` | Red | Power |
| **Relay Module** | GND | `GND` | Black | Ground |
| **Relay Module** | IN | `GPIO 19` | Purple | Relay Control Signal |
| **Pump Status LED** | Anode (A) | `GPIO 18` via 220Ω | Green | Pump Active Indicator |
| **Pump Status LED** | Cathode (C) | `GND` | Black | Ground |

---

## 4. Wokwi Wi-Fi & Network Configuration

* **SSID**: `Wokwi-GUEST`
* **Password**: `""` (Empty string)

### Connecting Wokwi to Django (Local vs Deployment)

#### Option A: Wokwi with Wokwi IoT Gateway (Local Development)
When running Wokwi inside the browser with the [Wokwi IoT Gateway](https://docs.wokwi.com/guides/esp32-wifi#the-private-gateway) installed, your simulation can connect directly to your local PC:
```cpp
const char* SERVER_URL = "http://host.wokwi.internal:8000/api/sensor-data/";
```

#### Option B: Public / Cloud Tunnel (Ngrok or Cloudflared) — Recommended for Instant Setup
Since public Wokwi runs in a cloud sandbox and cannot reach `localhost` directly without the private gateway, use a free tunnel (e.g. ngrok):
1. Start your local Django server:
   ```bash
   python manage.py runserver 8000
   ```
2. Start ngrok:
   ```bash
   ngrok http 8000
   ```
3. Update `SERVER_URL` in `wokwi/sketch.ino`:
   ```cpp
   const char* SERVER_URL = "https://your-subdomain.ngrok-free.app/api/sensor-data/";
   ```

---

## 5. Automated Irrigation Pump Control Logic

The ESP32 and Django backend both enforce configurable irrigation rules:

```
IF (Soil Moisture < 30.0%) AND (Water Tank Level > 20.0%):
    Pump State = ON  (Relay energized, Green LED illuminated)
ELSE:
    Pump State = OFF (Relay deactivated, Green LED dark)
```

### Safety Features:
1. **Low Water Cutoff**: If water tank level is $\le 20\%$, the pump is locked OFF to protect the physical pump motor from dry running.
2. **Threshold Override**: Thresholds can be dynamically configured via `POST /api/sensor-data/pump-config/`.

---

## 6. How to Run the Complete Stack

### Step 1: Start Django Backend
```bash
cd backend
venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```
Backend API will be accessible at `http://127.0.0.1:8000/`.

### Step 2: Start Frontend Dashboard
```bash
cd frontend
npm run dev
```
Open browser at `http://localhost:5173/`.

### Step 3: Run Wokwi Simulation
1. Navigate to [wokwi.com](https://wokwi.com/projects/new/esp32).
2. Copy the contents of `wokwi/diagram.json` into the `diagram.json` tab.
3. Copy the contents of `wokwi/sketch.ino` into the `sketch.ino` tab.
4. Add `DHT sensor library` in the `Library Manager` tab.
5. Click **Play (Start Simulation)**.

---

## 7. Verifying Sensor Data & Pump Control

1. **Test Soil Moisture**: Rotate the Soil Moisture potentiometer in Wokwi.
   * Turn below 30% &rarr; Pump turns ON (Green LED lights up, Serial logs `SOIL DRY - IRRIGATING`).
   * Turn above 30% &rarr; Pump turns OFF.
2. **Test Water Level Safety Cutoff**: Turn Soil Moisture below 30% and rotate Water Level pot below 20%.
   * Pump immediately turns OFF with warning `LOW WATER LEVEL WARNING - PUMP LOCKED`.
3. **Verify Database Insertion**:
   * Open Django REST API in browser: `http://127.0.0.1:8000/api/sensor-data/latest/`
   * Open historical logs: `http://127.0.0.1:8000/api/sensor-data/history/`
4. **Verify Dashboard Real-Time View**:
   * Open `http://localhost:5173/dashboard`
   * Watch the live metrics update every 5 seconds.
   * You can also use the interactive **🧪 Simulate** buttons on the dashboard to test without active hardware.

---

## 8. AI Disease Prediction + IoT Synergy

* **AI Diagnosis Module**: Analyzes leaf images using the 38-class MobileNetV2 model (`model.h5`) to diagnose blight, spots, rust, or healthy states.
* **IoT Telemetry Module**: Continuously monitors soil moisture, ambient humidity, temperature, and water tank levels.
* **Unified Dashboard**: Correlates AI disease diagnoses with live field conditions (e.g. alerts when high humidity increases fungal disease risks).
