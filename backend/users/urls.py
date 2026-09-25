from django.urls import path
from .views import RegisterView, ProfileView, SendOTPView, VerifyOTPView, OTPLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('otp/send/', SendOTPView.as_view(), name='otp-send'),
    path('otp/verify/', VerifyOTPView.as_view(), name='otp-verify'),
    path('otp/login/', OTPLoginView.as_view(), name='otp-login'),
]
