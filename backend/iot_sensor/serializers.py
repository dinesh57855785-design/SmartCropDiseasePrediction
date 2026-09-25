from rest_framework import serializers
from .models import SensorReading, PumpThresholdConfig


class SensorReadingSerializer(serializers.ModelSerializer):
    soil_moisture = serializers.FloatField(min_value=0.0, max_value=100.0)
    water_level = serializers.FloatField(min_value=0.0, max_value=100.0)
    temperature = serializers.FloatField(min_value=-40.0, max_value=85.0)
    humidity = serializers.FloatField(min_value=0.0, max_value=100.0)
    pump_status = serializers.BooleanField(required=False, default=False)
    pump_mode = serializers.CharField(required=False, default="AUTO")
    device_id = serializers.CharField(required=False, default="ESP32_WOKWI_01")
    timestamp = serializers.DateTimeField(read_only=True, format="%Y-%m-%d %H:%M:%S")

    # Enriched computed fields for frontend display & Planner
    soil_status = serializers.SerializerMethodField()
    soil_advice = serializers.SerializerMethodField()
    field_water_availability = serializers.SerializerMethodField()
    water_status = serializers.SerializerMethodField()
    sensor_status = serializers.SerializerMethodField()
    is_simulation = serializers.SerializerMethodField()
    nutrient_status_note = serializers.SerializerMethodField()

    class Meta:
        model = SensorReading
        fields = [
            'id',
            'soil_moisture',
            'soil_status',
            'soil_advice',
            'water_level',
            'field_water_availability',
            'water_status',
            'temperature',
            'humidity',
            'pump_status',
            'pump_mode',
            'device_id',
            'sensor_status',
            'is_simulation',
            'nutrient_status_note',
            'timestamp',
        ]

    def get_soil_status(self, obj):
        return obj.get_soil_status()

    def get_soil_advice(self, obj):
        return obj.get_soil_advice()

    def get_field_water_availability(self, obj):
        return obj.get_field_water_availability()

    def get_water_status(self, obj):
        return obj.get_field_water_availability()

    def get_sensor_status(self, obj):
        return obj.get_connection_status()

    def get_is_simulation(self, obj):
        return obj.get_is_simulation()

    def get_nutrient_status_note(self, obj):
        return "Additional soil sensor data is required to determine nutrient/pH condition."


class PumpThresholdConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PumpThresholdConfig
        fields = [
            'soil_moisture_min',
            'soil_moisture_optimal_max',
            'water_level_min',
            'water_level_excess',
            'auto_control_enabled',
            'updated_at',
        ]

