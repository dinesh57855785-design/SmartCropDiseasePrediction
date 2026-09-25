"""
iot/sensor_scripts/sensor_reader.py
Sensor data reader for SmartCropDiseasePrediction IoT module.

Reads from DHT22 (temperature/humidity) and soil moisture sensors.
Falls back to simulated data if running without hardware (development mode).

Hardware: Raspberry Pi + DHT22 + Soil Moisture Sensor
Usage:
    python sensor_reader.py
"""

import time
import random
from datetime import datetime
from typing import Dict, Any


def read_dht22(gpio_pin: int = 4) -> Dict[str, float]:
    """
    Read temperature and humidity from a DHT22 sensor via GPIO.
    Falls back to simulated values if `adafruit_dht` is unavailable.

    Args:
        gpio_pin: GPIO pin number the DHT22 data line is connected to.

    Returns:
        dict with 'temperature_c' and 'humidity_percent' keys.
    """
    try:
        import adafruit_dht
        import board

        pin = getattr(board, f'D{gpio_pin}')
        dht_device = adafruit_dht.DHT22(pin)
        temperature = dht_device.temperature
        humidity = dht_device.humidity
        dht_device.exit()
        return {
            'temperature_c': round(temperature, 1),
            'humidity_percent': round(humidity, 1),
        }
    except (ImportError, Exception):
        # Simulate realistic field sensor values for development
        return {
            'temperature_c': round(random.uniform(22.0, 38.0), 1),
            'humidity_percent': round(random.uniform(40.0, 95.0), 1),
        }


def read_soil_moisture(adc_channel: int = 0) -> Dict[str, Any]:
    """
    Read soil moisture from an analog sensor via MCP3008 ADC.
    Falls back to simulated values if `spidev` is unavailable.

    Args:
        adc_channel: ADC channel (0–7) connected to the soil sensor.

    Returns:
        dict with 'raw_value' (0–1023) and 'moisture_percent' (0–100).
    """
    try:
        import spidev
        spi = spidev.SpiDev()
        spi.open(0, 0)
        spi.max_speed_hz = 1350000
        adc = spi.xfer2([1, (8 + adc_channel) << 4, 0])
        raw = ((adc[1] & 3) << 8) + adc[2]
        spi.close()
        moisture_percent = round((1 - raw / 1023) * 100, 1)
        return {'raw_value': raw, 'moisture_percent': moisture_percent}
    except (ImportError, Exception):
        raw = random.randint(200, 900)
        return {
            'raw_value': raw,
            'moisture_percent': round((1 - raw / 1023) * 100, 1),
        }


def read_all_sensors() -> Dict[str, Any]:
    """
    Read all sensors and return a combined reading payload.

    Returns:
        dict with all sensor readings and a UTC timestamp.
    """
    dht_data = read_dht22()
    soil_data = read_soil_moisture()

    return {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'temperature_c': dht_data['temperature_c'],
        'humidity_percent': dht_data['humidity_percent'],
        'soil_moisture_raw': soil_data['raw_value'],
        'soil_moisture_percent': soil_data['moisture_percent'],
        'heat_index': _calculate_heat_index(
            dht_data['temperature_c'], dht_data['humidity_percent']
        ),
    }


def _calculate_heat_index(temp_c: float, humidity: float) -> float:
    """Simplified heat index calculation using Steadman's formula."""
    t = temp_c * 9 / 5 + 32  # Convert to Fahrenheit
    hi = -42.379 + 2.04901523 * t + 10.14333127 * humidity \
         - 0.22475541 * t * humidity - 6.83783e-3 * t ** 2 \
         - 5.481717e-2 * humidity ** 2 + 1.22874e-3 * t ** 2 * humidity \
         + 8.5282e-4 * t * humidity ** 2 - 1.99e-6 * t ** 2 * humidity ** 2
    return round((hi - 32) * 5 / 9, 1)  # Back to Celsius


if __name__ == '__main__':
    print("[sensor_reader] Starting sensor readings every 5 seconds. Press Ctrl+C to stop.\n")
    while True:
        reading = read_all_sensors()
        print(
            f"[{reading['timestamp']}] "
            f"Temp: {reading['temperature_c']}°C | "
            f"Humidity: {reading['humidity_percent']}% | "
            f"Soil: {reading['soil_moisture_percent']}%"
        )
        time.sleep(5)
