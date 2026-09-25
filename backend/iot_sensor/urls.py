from django.urls import path
from .views import (
    SensorDataView,
    LatestSensorDataView,
    SensorDataHistoryView,
    PumpConfigView,
)

urlpatterns = [
    path('', SensorDataView.as_view(), name='sensor-data'),
    path('latest/', LatestSensorDataView.as_view(), name='sensor-data-latest'),
    path('history/', SensorDataHistoryView.as_view(), name='sensor-data-history'),
    path('pump-config/', PumpConfigView.as_view(), name='sensor-pump-config'),
]
