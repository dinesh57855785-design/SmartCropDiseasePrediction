"""
iot/mqtt/mqtt_publisher.py
MQTT publisher for SmartCropDiseasePrediction IoT module.

Reads sensor data and publishes to an MQTT broker for real-time
monitoring integration with the Django backend via Channels/WebSocket.

Requirements: pip install paho-mqtt
Usage:
    python mqtt_publisher.py --broker localhost --port 1883
"""

import sys
import json
import time
import argparse
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# Add sensor scripts to path
_IOT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_IOT_ROOT / 'sensor_scripts'))

from sensor_reader import read_all_sensors

# MQTT Topics
TOPIC_SENSORS = 'smartcrop/sensors'
TOPIC_ALERTS = 'smartcrop/alerts'

# Thresholds for automatic alerts
THRESHOLDS = {
    'temperature_c_max': 40.0,
    'humidity_percent_min': 30.0,
    'humidity_percent_max': 95.0,
    'soil_moisture_percent_min': 20.0,
}


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT broker")
    else:
        logger.error(f"Failed to connect to MQTT broker (code {rc})")


def on_publish(client, userdata, mid):
    logger.debug(f"Message published (mid={mid})")


def check_alerts(reading: dict) -> list:
    """Check sensor readings against thresholds and generate alert messages."""
    alerts = []
    if reading['temperature_c'] > THRESHOLDS['temperature_c_max']:
        alerts.append(f"⚠️ High temperature: {reading['temperature_c']}°C")
    if reading['humidity_percent'] < THRESHOLDS['humidity_percent_min']:
        alerts.append(f"⚠️ Low humidity: {reading['humidity_percent']}%")
    if reading['soil_moisture_percent'] < THRESHOLDS['soil_moisture_percent_min']:
        alerts.append(f"⚠️ Low soil moisture: {reading['soil_moisture_percent']}%")
    return alerts


def publish_loop(broker: str, port: int, interval: int, device_id: str):
    """
    Main publishing loop: read sensors and publish to MQTT every `interval` seconds.

    Args:
        broker: MQTT broker hostname or IP.
        port: MQTT broker port.
        interval: Publishing interval in seconds.
        device_id: Unique identifier for this IoT device.
    """
    try:
        import paho.mqtt.client as mqtt
    except ImportError:
        logger.error("paho-mqtt not installed. Run: pip install paho-mqtt")
        sys.exit(1)

    client = mqtt.Client(client_id=f"smartcrop_{device_id}")
    client.on_connect = on_connect
    client.on_publish = on_publish

    logger.info(f"Connecting to MQTT broker at {broker}:{port}")
    client.connect(broker, port, keepalive=60)
    client.loop_start()

    logger.info(f"Publishing sensor data every {interval}s to topic: {TOPIC_SENSORS}")

    try:
        while True:
            reading = read_all_sensors()
            reading['device_id'] = device_id

            # Publish sensor data
            payload = json.dumps(reading)
            client.publish(TOPIC_SENSORS, payload, qos=1)
            logger.info(f"Published: Temp={reading['temperature_c']}°C | Humidity={reading['humidity_percent']}% | Soil={reading['soil_moisture_percent']}%")

            # Check for alerts
            alerts = check_alerts(reading)
            for alert in alerts:
                alert_payload = json.dumps({
                    'device_id': device_id,
                    'timestamp': reading['timestamp'],
                    'alert': alert,
                })
                client.publish(TOPIC_ALERTS, alert_payload, qos=2)
                logger.warning(alert)

            time.sleep(interval)

    except KeyboardInterrupt:
        logger.info("Shutting down MQTT publisher...")
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='SmartCropDiseasePrediction MQTT Publisher')
    parser.add_argument('--broker', type=str, default='localhost', help='MQTT broker address')
    parser.add_argument('--port', type=int, default=1883, help='MQTT broker port')
    parser.add_argument('--interval', type=int, default=30, help='Publishing interval (seconds)')
    parser.add_argument('--device_id', type=str, default='iot_device_001', help='Device ID')
    args = parser.parse_args()

    publish_loop(args.broker, args.port, args.interval, args.device_id)
