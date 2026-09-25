from django.db import models
from django.utils import timezone
from datetime import timedelta


class SensorReading(models.Model):
    """
    Stores telemetry data received from IoT ESP32 devices / Wokwi simulations.
    Reflects soil moisture and field water availability / moisture conditions.
    """
    soil_moisture = models.FloatField(help_text="Soil moisture percentage (0-100%)")
    water_level = models.FloatField(help_text="Field water availability percentage (0-100%)")
    temperature = models.FloatField(help_text="Ambient temperature in Celsius (°C)")
    humidity = models.FloatField(help_text="Relative humidity percentage (0-100%)")
    pump_status = models.BooleanField(default=False, help_text="Current pump state (True=ON, False=OFF)")
    pump_mode = models.CharField(max_length=20, default="AUTO", help_text="Pump operation mode (AUTO/MANUAL)")
    device_id = models.CharField(max_length=100, default="ESP32_WOKWI_01", blank=True, help_text="Device identifier")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Sensor Reading'
        verbose_name_plural = 'Sensor Readings'

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] Soil: {self.soil_moisture}% ({self.get_soil_status()}) | Field Water: {self.water_level}% ({self.get_field_water_availability()}) | Temp: {self.temperature}°C"

    def get_soil_status(self) -> str:
        """Categorize soil condition based on agricultural thresholds."""
        if self.soil_moisture < 30.0:
            return "Dry"
        elif self.soil_moisture <= 70.0:
            return "Optimal"
        else:
            return "Wet"

    def get_soil_advice(self) -> str:
        """Practical farmer advice based on soil moisture condition."""
        status = self.get_soil_status()
        if status == "Dry":
            return "Dry soil — irrigation may be required."
        elif status == "Optimal":
            return "Soil moisture is suitable."
        else:
            return "Soil is too wet — avoid unnecessary irrigation."

    def get_field_water_availability(self) -> str:
        """Categorize field water condition / availability in the crop-growing area."""
        if self.water_level < 25.0:
            return "Low Water / Irrigation Required"
        elif self.water_level < 50.0:
            return "Moderate Water"
        elif self.water_level <= 75.0:
            return "Sufficient Water"
        else:
            return "Excess Water / Waterlogging Risk"

    def get_connection_status(self) -> str:
        """Determine whether sensor device is actively sending live data (within last 60 seconds)."""
        if timezone.now() - self.timestamp <= timedelta(seconds=60):
            return "Online"
        return "Offline"

    def get_is_simulation(self) -> bool:
        """Check if reading was generated via simulator."""
        dev = (self.device_id or "").upper()
        return "SIMULATOR" in dev or "DASHBOARD" in dev


class PumpThresholdConfig(models.Model):
    """
    Configurable threshold rules for automatic irrigation pump control.
    Default:
      - Soil Moisture < 30.0%
      - Field Water Availability > 20.0%
      => Pump turns ON
    """
    soil_moisture_min = models.FloatField(
        default=30.0,
        help_text="Soil moisture percentage below which irrigation should trigger (%)"
    )
    soil_moisture_optimal_max = models.FloatField(
        default=70.0,
        help_text="Soil moisture percentage above which soil is considered wet (%)"
    )
    water_level_min = models.FloatField(
        default=20.0,
        help_text="Minimum field water availability percentage required to safely operate the pump (%)"
    )
    water_level_excess = models.FloatField(
        default=75.0,
        help_text="Field water availability percentage above which waterlogging risk occurs (%)"
    )
    auto_control_enabled = models.BooleanField(
        default=True,
        help_text="Whether automatic pump decision is enabled"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pump Threshold Config'
        verbose_name_plural = 'Pump Threshold Config'

    @classmethod
    def get_config(cls):
        config, _ = cls.objects.get_or_create(id=1)
        return config

    def evaluate_pump_status(self, soil_moisture: float, water_level: float) -> tuple[bool, str]:
        """
        Evaluate if pump should be ON or OFF based on sensor readings and configured thresholds.
        Returns: (pump_status: bool, reason: str)
        """
        if not self.auto_control_enabled:
            return False, "Auto control disabled"

        if water_level <= self.water_level_min:
            return False, f"Field water availability too low ({water_level:.1f}% <= {self.water_level_min:.1f}% min required) - irrigation locked"

        if soil_moisture < self.soil_moisture_min:
            return True, f"Soil moisture dry ({soil_moisture:.1f}% < {self.soil_moisture_min:.1f}% threshold) and sufficient field water available ({water_level:.1f}%)"

        return False, f"Soil moisture adequate ({soil_moisture:.1f}% >= {self.soil_moisture_min:.1f}% threshold)"

