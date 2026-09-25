/*
 * ==============================================================================
 * Smart Crop Disease Prediction - ESP32 IoT Simulation (Wokwi)
 * ==============================================================================
 * Hardware Pinout:
 *   - DHT22 (Temp/Humidity) : GPIO 15
 *   - Soil Moisture (Pot 1) : GPIO 34 (ADC1_CH6)
 *   - Water Level (Pot 2)   : GPIO 35 (ADC1_CH7)
 *   - Relay Module (Pump)   : GPIO 19
 *   - Status LED (Pump ON)  : GPIO 18 (via 220 Ohm resistor)
 * 
 * Features:
 *   - Connects to Wokwi Wi-Fi ("Wokwi-GUEST")
 *   - Reads Soil Moisture & Water Tank Level as 0-100% percentage
 *   - Reads DHT22 Ambient Temperature and Humidity
 *   - Configurable Automated Irrigation Logic:
 *       IF Soil Moisture < 30.0% AND Water Level > 20.0% -> PUMP ON
 *       ELSE -> PUMP OFF
 *   - Transmits live JSON telemetry to Django REST API via HTTP POST
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// --- Wi-Fi Credentials for Wokwi Simulation ---
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// --- Django REST API Server Configuration ---
// For Local Wokwi Gateway: "http://host.wokwi.internal:8000/api/sensor-data/"
// For Local PC via Gateway / LAN: "http://10.0.2.2:8000/api/sensor-data/"
// For Public/Ngrok/Deployed API: "https://your-domain.ngrok-free.app/api/sensor-data/"
const char* SERVER_URL = "http://host.wokwi.internal:8000/api/sensor-data/";

// --- GPIO Pin Definitions ---
#define DHT_PIN         15
#define DHT_TYPE        DHT22
#define SOIL_PIN        34   // ADC1 Channel 6
#define WATER_PIN       35   // ADC1 Channel 7
#define RELAY_PIN       19   // Relay Control
#define PUMP_LED_PIN    18   // LED Indicator

// --- Irrigation Thresholds ---
float SOIL_MOISTURE_MIN_THRESHOLD = 30.0; // Trigger irrigation when soil < 30%
float WATER_LEVEL_MIN_THRESHOLD   = 20.0; // Safety cutoff if water tank < 20%

// --- Timing Configuration ---
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // Send telemetry every 5 seconds
unsigned long lastTelemetryTime = 0;

DHT dht(DHT_PIN, DHT_TYPE);

void setupWiFi() {
  Serial.println("\n[WiFi] Connecting to network...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection timeout. Operating in offline simulation mode.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("==================================================");
  Serial.println("🌱 Smart Crop Disease Prediction - ESP32 IoT Node");
  Serial.println("==================================================");

  // Initialize GPIO pins
  pinMode(SOIL_PIN, INPUT);
  pinMode(WATER_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(PUMP_LED_PIN, OUTPUT);

  // Set initial actuator states (OFF)
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(PUMP_LED_PIN, LOW);

  // Initialize DHT22 Sensor
  dht.begin();
  Serial.println("[Sensors] DHT22 initialized.");

  // Connect to Wi-Fi
  setupWiFi();

  Serial.println("[System] Initialization complete. Telemetry loop started.");
  Serial.println("==================================================");
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;

    // 1. Read Analog Sensors (ESP32 12-bit ADC: 0 - 4095)
    int soilRaw = analogRead(SOIL_PIN);
    int waterRaw = analogRead(WATER_PIN);

    // Convert raw ADC values to readable percentages (0.0 - 100.0%)
    float soilMoisturePct = (float)soilRaw / 4095.0 * 100.0;
    float waterLevelPct   = (float)waterRaw / 4095.0 * 100.0;

    // 2. Read DHT22 Temperature & Humidity
    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();

    // Fallback simulation in case of sensor read error
    if (isnan(temperature)) {
      temperature = 28.5;
    }
    if (isnan(humidity)) {
      humidity = 65.0;
    }

    // 3. Automated Irrigation Pump Control Decision
    bool pumpState = false;
    String pumpReason = "";

    if (waterLevelPct <= WATER_LEVEL_MIN_THRESHOLD) {
      pumpState = false;
      pumpReason = "LOW WATER LEVEL WARNING (< " + String(WATER_LEVEL_MIN_THRESHOLD, 0) + "%) - PUMP LOCKED";
    } else if (soilMoisturePct < SOIL_MOISTURE_MIN_THRESHOLD) {
      pumpState = true;
      pumpReason = "SOIL DRY (< " + String(SOIL_MOISTURE_MIN_THRESHOLD, 0) + "%) - IRRIGATING";
    } else {
      pumpState = false;
      pumpReason = "SOIL OPTIMAL - PUMP IDLE";
    }

    // Drive Actuators
    digitalWrite(RELAY_PIN, pumpState ? HIGH : LOW);
    digitalWrite(PUMP_LED_PIN, pumpState ? HIGH : LOW);

    // 4. Print Telemetry & Status to Serial Monitor
    Serial.println("\n--------------------------------------------------");
    Serial.print("🕒 Time (s)      : "); Serial.println(currentMillis / 1000);
    Serial.print("🌱 Soil Moisture : "); Serial.print(soilMoisturePct, 1); Serial.println("%");
    Serial.print("💧 Water Level   : "); Serial.print(waterLevelPct, 1); Serial.println("%");
    Serial.print("🌡️ Temperature   : "); Serial.print(temperature, 1); Serial.println(" °C");
    Serial.print("💨 Humidity      : "); Serial.print(humidity, 1); Serial.println(" %");
    Serial.print("⚡ Pump Status   : "); Serial.println(pumpState ? "🟢 ON (RUNNING)" : "🔴 OFF (IDLE)");
    Serial.print("📋 Decision Logic: "); Serial.println(pumpReason);
    Serial.println("--------------------------------------------------");

    // 5. Send JSON Telemetry to Django REST API
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");

      // Construct JSON payload
      String jsonPayload = "{";
      jsonPayload += "\"soil_moisture\":" + String(soilMoisturePct, 1) + ",";
      jsonPayload += "\"water_level\":" + String(waterLevelPct, 1) + ",";
      jsonPayload += "\"temperature\":" + String(temperature, 1) + ",";
      jsonPayload += "\"humidity\":" + String(humidity, 1) + ",";
      jsonPayload += "\"pump_status\":" + String(pumpState ? "true" : "false") + ",";
      jsonPayload += "\"pump_mode\":\"AUTO\",";
      jsonPayload += "\"device_id\":\"ESP32_WOKWI_01\"";
      jsonPayload += "}";

      Serial.print("[HTTP] POST payload -> ");
      Serial.println(jsonPayload);

      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        Serial.print("[HTTP] Response Code: ");
        Serial.println(httpResponseCode);
        String responseStr = http.getString();
        Serial.print("[HTTP] Server Response: ");
        Serial.println(responseStr);
      } else {
        Serial.print("[HTTP] POST failed, error code: ");
        Serial.println(httpResponseCode);
        Serial.print("[HTTP] Error detail: ");
        Serial.println(http.errorToString(httpResponseCode));
        Serial.println("[NOTE] Ensure Django backend is running and SERVER_URL is reachable.");
      }

      http.end();
    } else {
      Serial.println("[WiFi] Not connected. Attempting reconnection...");
      WiFi.reconnect();
    }
  }
}
