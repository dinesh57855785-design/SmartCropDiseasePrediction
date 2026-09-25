from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .serializers import UserRegisterSerializer, UserProfileSerializer
from .models import User, OTPRecord
from .email_otp_service import send_otp_via_email
from .otp_service import send_otp_via_gateway, OTPServiceError
import logging

logger = logging.getLogger(__name__)


# ── OTP: Send ─────────────────────────────────────────────────────────────────
class SendOTPView(APIView):
    """
    POST /api/users/otp/send/
    Body: { email: "farmer@gmail.com" } OR { phone: "9876543210" }
    Generates a 6-digit OTP and dispatches it via Gmail / Email or SMS.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()

        if email:
            if '@' not in email or '.' not in email:
                return Response(
                    {'error': 'Please enter a valid Gmail / Email address.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create Email OTP record (10-minute expiry)
            record = OTPRecord.create_otp_for_email(email)

            try:
                res = send_otp_via_email(email, record.otp_code)
                return Response({
                    'message': f'OTP sent successfully to {email}. Check your inbox/spam.',
                    'email': email,
                    'provider': res.get('provider', 'Gmail'),
                    'expires_in_minutes': 10,
                    'otp_code': record.otp_code if (settings.DEBUG or res.get('provider') == 'Console') else None
                }, status=status.HTTP_200_OK)

            except Exception as e:
                logger.error(f"Email OTP Failure for {email}: {str(e)}")
                return Response(
                    {'error': f"Failed to send email OTP: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif phone:
            clean_phone = ''.join(filter(str.isdigit, str(phone)))
            if not clean_phone or len(clean_phone) < 10:
                return Response(
                    {'error': 'Please provide a valid 10-digit mobile number.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            record = OTPRecord.create_otp(clean_phone)
            try:
                gateway_res = send_otp_via_gateway(clean_phone, record.otp_code)
                show_otp = settings.DEBUG or gateway_res.get('provider') == 'Console'

                return Response({
                    'message': f'OTP sent successfully to {clean_phone}.',
                    'phone': clean_phone,
                    'provider': gateway_res.get('provider', 'SMS Gateway'),
                    'expires_in_minutes': 10,
                    'otp_code': record.otp_code if show_otp else None
                }, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({'error': f"OTP Failure: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'Email or phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)


# ── OTP: Verify ───────────────────────────────────────────────────────────────
class VerifyOTPView(APIView):
    """
    POST /api/users/otp/verify/
    Body: { email: "farmer@gmail.com", otp_code: "123456" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()
        otp_code = request.data.get('otp_code', '').strip()

        if not otp_code:
            return Response({'error': 'OTP code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Development Mode default OTP bypass
        if settings.DEBUG and otp_code == '123456':
            logger.info("Demo OTP '123456' used for verification.")
            return Response({'message': 'OTP verified successfully (Development Mode).', 'verified': True})

        if email:
            records = OTPRecord.objects.filter(email=email, otp_code=otp_code, is_used=False)
        elif phone:
            clean_phone = ''.join(filter(str.isdigit, str(phone)))
            records = OTPRecord.objects.filter(phone__icontains=clean_phone[-10:], otp_code=otp_code, is_used=False)
        else:
            return Response({'error': 'Email or phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not records.exists():
            return Response(
                {'error': 'Invalid OTP code. Please check your email and try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record = records.latest('created_at')

        if not record.is_valid():
            return Response(
                {'error': 'OTP has expired. Please request a new OTP code.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as used
        record.is_used = True
        record.save()

        return Response({'message': 'OTP verified successfully.', 'verified': True})


# ── OTP: Login ────────────────────────────────────────────────────────────────
class OTPLoginView(APIView):
    """
    POST /api/users/otp/login/
    Body: { email: "farmer@gmail.com", otp_code: "123456" }
    Verifies OTP and logs in existing user via Gmail / Email address.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()
        otp_code = request.data.get('otp_code', '').strip()

        if not otp_code:
            return Response({'error': 'OTP code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Development Mode default OTP bypass
        if settings.DEBUG and otp_code == '123456':
            logger.info("Demo OTP '123456' used for login.")
            if email:
                user = User.objects.filter(email__iexact=email).first()
            elif phone:
                clean_phone = ''.join(filter(str.isdigit, str(phone)))
                user = User.objects.filter(phone__icontains=clean_phone[-10:]).first()
            else:
                return Response({'error': 'Email or phone is required.'}, status=status.HTTP_400_BAD_REQUEST)

            if not user:
                return Response(
                    {'error': f'No account registered with {email or phone}. Please register first.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Generate SimpleJWT Tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful (Development Mode).',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)

        # 1. Verify OTP
        if email:
            records = OTPRecord.objects.filter(email=email, otp_code=otp_code, is_used=False)
            user = User.objects.filter(email__iexact=email).first()
        elif phone:
            clean_phone = ''.join(filter(str.isdigit, str(phone)))
            records = OTPRecord.objects.filter(phone__icontains=clean_phone[-10:], otp_code=otp_code, is_used=False)
            user = User.objects.filter(phone__icontains=clean_phone[-10:]).first()
        else:
            return Response({'error': 'Email or phone is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not records.exists():
            return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

        record = records.latest('created_at')
        if not record.is_valid():
            return Response({'error': 'OTP code has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark as used
        record.is_used = True
        record.save()

        if not user:
            return Response(
                {'error': f'No account registered with email {email or phone}. Please register first.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate SimpleJWT Tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)


# ── Registration ───────────────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """POST /api/users/register/ – Register a new user (no auth required)."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Registration successful.',
                'username': user.username,
                'role': user.role,
            },
            status=status.HTTP_201_CREATED
        )


# ── Profile ────────────────────────────────────────────────────────────────────
class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/profile/ – View or update own profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
