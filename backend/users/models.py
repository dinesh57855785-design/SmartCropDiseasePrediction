from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string


class User(AbstractUser):
    """Custom User model extending AbstractUser with role and phone fields."""

    ROLE_CHOICES = [
        ('Farmer', 'Farmer'),
        ('Admin', 'Admin'),
    ]

    phone = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Farmer')

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_admin_role(self):
        return self.role == 'Admin'


class OTPRecord(models.Model):
    """Stores OTP codes for Email (Gmail) and Phone verification."""

    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        target = self.email or self.phone or 'unknown'
        return f"OTP for {target} — {self.otp_code}"

    @staticmethod
    def generate_otp():
        """Generate a 6-digit numeric OTP."""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def create_otp_for_email(email):
        """Invalidate old OTPs for this email and create a new one (valid 10 min)."""
        clean_email = str(email).strip().lower()
        OTPRecord.objects.filter(email=clean_email, is_used=False).update(is_used=True)
        otp_code = OTPRecord.generate_otp()
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        record = OTPRecord.objects.create(
            email=clean_email,
            otp_code=otp_code,
            expires_at=expires_at,
        )
        return record

    @staticmethod
    def create_otp(phone):
        """Legacy helper for phone OTPs."""
        clean_phone = str(phone).strip()
        OTPRecord.objects.filter(phone=clean_phone, is_used=False).update(is_used=True)
        otp_code = OTPRecord.generate_otp()
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        return OTPRecord.objects.create(
            phone=clean_phone,
            otp_code=otp_code,
            expires_at=expires_at,
        )

    def is_valid(self):
        """Returns True if OTP is still within 10-minute window and not used."""
        return not self.is_used and timezone.now() <= self.expires_at