from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import SensorReading, PumpThresholdConfig
from .serializers import SensorReadingSerializer, PumpThresholdConfigSerializer


class SensorDataView(APIView):
    """
    POST /api/sensor-data/
    Endpoint for IoT ESP32 / Wokwi simulations to ingest sensor readings.
    Evaluates automated pump control logic based on configurable thresholds.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SensorReadingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"status": "error", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        soil_moisture = validated_data['soil_moisture']
        water_level = validated_data['water_level']

        # Evaluate threshold logic
        config = PumpThresholdConfig.get_config()
        recommended_pump_state, reason = config.evaluate_pump_status(soil_moisture, water_level)

        # If incoming request provided pump_status, we respect or calibrate it
        if 'pump_status' not in request.data:
            validated_data['pump_status'] = recommended_pump_state

        instance = serializer.save()

        return Response({
            "status": "success",
            "message": "Sensor reading recorded successfully.",
            "data": SensorReadingSerializer(instance).data,
            "pump_decision": {
                "pump_status": instance.pump_status,
                "recommended_state": recommended_pump_state,
                "reason": reason,
                "thresholds": {
                    "soil_moisture_min": config.soil_moisture_min,
                    "water_level_min": config.water_level_min,
                }
            }
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Fallback to latest reading when GET /api/sensor-data/ is requested."""
        latest = SensorReading.objects.first()
        if not latest:
            return Response({
                "status": "empty",
                "message": "No sensor readings available yet.",
                "data": None
            }, status=status.HTTP_200_OK)

        config = PumpThresholdConfig.get_config()
        _, reason = config.evaluate_pump_status(latest.soil_moisture, latest.water_level)

        return Response({
            "status": "success",
            "data": SensorReadingSerializer(latest).data,
            "pump_decision": {
                "pump_status": latest.pump_status,
                "reason": reason,
            }
        }, status=status.HTTP_200_OK)


class LatestSensorDataView(APIView):
    """
    GET /api/sensor-data/latest/
    Returns the most recent sensor reading from the IoT device.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest = SensorReading.objects.first()
        config = PumpThresholdConfig.get_config()

        if not latest:
            # Return demo placeholder if database has no records yet
            return Response({
                "status": "empty",
                "message": "No sensor readings recorded yet. Awaiting ESP32 connection.",
                "data": None,
                "thresholds": PumpThresholdConfigSerializer(config).data
            }, status=status.HTTP_200_OK)

        _, reason = config.evaluate_pump_status(latest.soil_moisture, latest.water_level)

        return Response({
            "status": "success",
            "data": SensorReadingSerializer(latest).data,
            "pump_decision": {
                "pump_status": latest.pump_status,
                "reason": reason,
                "thresholds": {
                    "soil_moisture_min": config.soil_moisture_min,
                    "water_level_min": config.water_level_min,
                    "auto_control_enabled": config.auto_control_enabled,
                }
            }
        }, status=status.HTTP_200_OK)


class SensorDataHistoryView(APIView):
    """
    GET /api/sensor-data/history/?limit=20
    Returns recent historical sensor readings.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 20))
            limit = max(1, min(limit, 100))
        except ValueError:
            limit = 20

        readings = SensorReading.objects.all()[:limit]
        serializer = SensorReadingSerializer(readings, many=True)
        return Response({
            "status": "success",
            "count": len(serializer.data),
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class PumpConfigView(APIView):
    """
    GET /api/sensor-data/pump-config/
    POST /api/sensor-data/pump-config/
    Retrieve or update irrigation threshold parameters.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        config = PumpThresholdConfig.get_config()
        return Response({
            "status": "success",
            "config": PumpThresholdConfigSerializer(config).data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        config = PumpThresholdConfig.get_config()
        serializer = PumpThresholdConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Pump thresholds updated successfully.",
                "config": serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
