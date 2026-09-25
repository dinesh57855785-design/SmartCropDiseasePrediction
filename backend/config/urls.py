from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health import health_check

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    # Authentication (JWT)
    path('api/auth/', include('accounts.urls')),
    # App APIs
    path('api/users/', include('users.urls')),
    path('api/disease/', include('disease.urls')),
    path('api/crop/', include('crop.urls')),
    path('api/dashboard/', include('user_dashboard.urls')),
    # New AI modules
    path('api/weather/', include('weather.urls')),
    path('api/advisor/', include('advisor.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    # IoT Telemetry API
    path('api/sensor-data/', include('iot_sensor.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)