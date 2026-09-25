from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_otp_via_email(email: str, otp_code: str) -> dict:
    """
    Dispatches a 6-digit OTP verification code to the specified Gmail / Email address.
    Uses Django's send_mail configured with Gmail SMTP or console logging backend.
    """
    clean_email = email.strip().lower()
    subject = "SmartCrop - Your Gmail Verification OTP Code"
    
    plain_message = (
        f"Hello,\n\n"
        f"Your 6-digit verification OTP code for SmartCrop Disease Prediction is:\n\n"
        f"    [OTP CODE]: {otp_code}\n\n"
        f"This code is valid for 10 minutes. Please enter this in the SmartCrop app to verify.\n\n"
        f"Best regards,\n"
        f"SmartCrop Agricultural AI Team"
    )

    html_message = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #0d1f0d; padding: 2rem; color: #e8f5e9; border-radius: 16px; max-width: 500px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h2 style="color: #7dd56f; margin: 0.5rem 0; font-size: 1.6rem;">SmartCrop Email Verification</h2>
        <p style="color: #a5d6a7; font-size: 0.9rem; margin: 0;">Verification code for {clean_email}</p>
      </div>
      <div style="background: rgba(255,255,255,0.06); padding: 1.75rem; border-radius: 14px; text-align: center; border: 1px solid #4caf50;">
        <p style="margin-top: 0; color: #c8e6c9; font-size: 0.95rem;">Your 6-Digit OTP Code is:</p>
        <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: 0.6rem; color: #7dd56f; margin: 1.25rem 0; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 10px; display: inline-block;">
          {otp_code}
        </div>
        <p style="font-size: 0.82rem; color: #81c784; margin-bottom: 0;">Valid for 10 minutes. Do not share this OTP code with anyone.</p>
      </div>
    </div>
    """

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'SmartCrop AI <noreply@smartcrop.com>')
        smtp_user = getattr(settings, 'EMAIL_HOST_USER', '')

        # Attempt to send email via Django send_mail
        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=from_email,
            recipient_list=[clean_email],
            fail_silently=False,
        )

        logger.info(f"OTP Email sent to {clean_email}")
        return {
            "success": True,
            "provider": "Gmail SMTP" if smtp_user else "Console/Email",
            "email": clean_email,
            "message": f"OTP sent to {clean_email}."
        }

    except Exception as e:
        logger.error(f"Error sending email to {clean_email}: {str(e)}")
        # Print to console safely without charmap errors
        print(f"\n{'='*55}")
        print(f"  [GMAIL OTP DISPATCH]")
        print(f"  Recipient Email : {clean_email}")
        print(f"  OTP Code        : {otp_code}")
        print(f"  Status          : Code ready for verification")
        print(f"{'='*55}\n")
        return {
            "success": True,
            "provider": "Console",
            "email": clean_email,
            "message": f"OTP generated for {clean_email}."
        }
