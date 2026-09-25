from django.urls import path
from .views import WeatherForecastView, FarmingPlannerView

urlpatterns = [
    path('forecast/', WeatherForecastView.as_view(), name='weather-forecast'),
    path('planner/', FarmingPlannerView.as_view(), name='weather-planner'),
]
