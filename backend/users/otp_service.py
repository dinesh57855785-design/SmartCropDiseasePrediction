import os
import logging
import requests
import json

logger = logging.getLogger(__name__)


class OTPServiceError(Exception):
    """Custom exception raised when OTP Gateway communication fails."""
    pass


def send_otp_via_gateway(phone: str, otp_code: str) -> dict:
    """
    Sends an OTP code via configured SMS Gateway (Fast2SMS, Twilio, 2Factor, MSG91, Generic HTTP REST)
    or falls back to console logger if provider is 'console' or unset.

    Environment variables configured in .env:
    - SMS_GATEWAY_PROVIDER: 'fast2sms' | 'twilio' | '2factor' | 'msg91' | 'generic' | 'console'
    - SMS_API_KEY: API Key / Auth Token for SMS gateway
    - SMS_SENDER_ID: Sender ID (default: FSTSMS)
    - SMS_GATEWAY_URL: Endpoint URL for generic HTTP POST/GET
    - TWILIO_ACCOUNT_SID: Twilio Account SID (if using Twilio)
    - TWILIO_AUTH_TOKEN: Twilio Auth Token (if using Twilio)
    - TWILIO_PHONE_NUMBER: Twilio Sender Number (if using Twilio)
    """
    provider = os.environ.get('SMS_GATEWAY_PROVIDER', '').lower().strip()
    api_key = os.environ.get('SMS_API_KEY', '').strip()
    sender_id = os.environ.get('SMS_SENDER_ID', 'FSTSMS').strip()
    gateway_url = os.environ.get('SMS_GATEWAY_URL', '').strip()

    # Clean phone number (keep digits only)
    clean_phone = ''.join(filter(str.isdigit, str(phone)))
    if len(clean_phone) > 10 and clean_phone.startswith('91'):
        phone_10dig = clean_phone[-10:]
    else:
        phone_10dig = clean_phone

    # 1. Fast2SMS Provider
    if provider == 'fast2sms' or (api_key and not provider):
        if not api_key:
            raise OTPServiceError("Fast2SMS API Key (SMS_API_KEY) is missing in environment variables.")

        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {
            "authorization": api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "variables_values": otp_code,
            "route": "otp",
            "numbers": phone_10dig,
        }

        try:
            res = requests.post(url, headers=headers, json=payload, timeout=10)
            data = res.json()
            if res.status_code == 200 and data.get("return") is True:
                logger.info(f"Fast2SMS OTP sent successfully to {phone_10dig}")
                return {"success": True, "provider": "Fast2SMS", "response": data}
            else:
                err_msg = data.get("message") or data.get("detail") or res.text
                logger.error(f"Fast2SMS error: {err_msg}")
                raise OTPServiceError(f"Fast2SMS Gateway Error: {err_msg}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Fast2SMS request failed: {str(e)}")
            raise OTPServiceError(f"Failed to communicate with Fast2SMS gateway: {str(e)}")

    # 2. Twilio Provider
    elif provider == 'twilio':
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '').strip()
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN', '').strip() or api_key
        from_number = os.environ.get('TWILIO_PHONE_NUMBER', '').strip()

        if not account_sid or not auth_token or not from_number:
            raise OTPServiceError("Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) missing in .env.")

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        to_number = f"+91{phone_10dig}" if not phone.startswith('+') else phone
        payload = {
            "From": from_number,
            "To": to_number,
            "Body": f"Your SmartCrop verification OTP code is {otp_code}. Valid for 10 minutes."
        }

        try:
            res = requests.post(url, data=payload, auth=(account_sid, auth_token), timeout=10)
            data = res.json()
            if res.status_code in (200, 201):
                logger.info(f"Twilio OTP sent successfully to {to_number}")
                return {"success": True, "provider": "Twilio", "response": data}
            else:
                err_msg = data.get("message") or res.text
                logger.error(f"Twilio error: {err_msg}")
                raise OTPServiceError(f"Twilio Gateway Error: {err_msg}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Twilio request failed: {str(e)}")
            raise OTPServiceError(f"Failed to communicate with Twilio gateway: {str(e)}")

    # 3. 2Factor Provider
    elif provider == '2factor':
        if not api_key:
            raise OTPServiceError("2Factor API Key (SMS_API_KEY) missing in .env.")
        url = f"https://2factor.in/API/V1/{api_key}/SMS/{phone_10dig}/{otp_code}/AUTOGEN"
        try:
            res = requests.get(url, timeout=10)
            data = res.json()
            if res.status_code == 200 and data.get("Status") == "Success":
                return {"success": True, "provider": "2Factor", "response": data}
            else:
                err_msg = data.get("Details") or res.text
                raise OTPServiceError(f"2Factor Gateway Error: {err_msg}")
        except requests.exceptions.RequestException as e:
            raise OTPServiceError(f"Failed to communicate with 2Factor gateway: {str(e)}")

    # 4. MSG91 Provider
    elif provider == 'msg91':
        if not api_key:
            raise OTPServiceError("MSG91 Auth Key (SMS_API_KEY) missing in .env.")
        url = "https://api.msg91.com/api/v5/otp"
        headers = {"authkey": api_key, "Content-Type": "application/json"}
        payload = {"mobile": f"91{phone_10dig}", "otp": otp_code}
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=10)
            data = res.json()
            if res.status_code == 200 and data.get("type") == "success":
                return {"success": True, "provider": "MSG91", "response": data}
            else:
                err_msg = data.get("message") or res.text
                raise OTPServiceError(f"MSG91 Gateway Error: {err_msg}")
        except requests.exceptions.RequestException as e:
            raise OTPServiceError(f"Failed to communicate with MSG91 gateway: {str(e)}")

    # 5. Generic HTTP REST Gateway Provider
    elif provider == 'generic':
        if not gateway_url:
            raise OTPServiceError("Generic SMS Gateway URL (SMS_GATEWAY_URL) missing in .env.")

        # Replace placeholders in URL
        formatted_url = gateway_url.format(phone=phone_10dig, otp=otp_code, api_key=api_key)
        try:
            res = requests.get(formatted_url, timeout=10)
            if res.status_code == 200:
                return {"success": True, "provider": "GenericSMS", "response": res.text}
            else:
                raise OTPServiceError(f"Generic Gateway returned status {res.status_code}: {res.text}")
        except requests.exceptions.RequestException as e:
            raise OTPServiceError(f"Failed to communicate with SMS gateway: {str(e)}")

    # 6. Console / Dev Mode (Default when no provider API key set)
    else:
        print(f"\n{'='*55}")
        print(f"  📱 [OTP SERVICE - DEV CONSOLE]")
        print(f"  Phone Number : {phone_10dig}")
        print(f"  OTP Code     : {otp_code}")
        print(f"  Status       : Ready for verification (valid for 10 min)")
        print(f"  Note         : Configure SMS_GATEWAY_PROVIDER & SMS_API_KEY in .env for SMS gateway delivery.")
        print(f"{'='*55}\n")
        logger.info(f"[Console OTP] Sent OTP {otp_code} to {phone_10dig}")
        return {
            "success": True,
            "provider": "Console",
            "message": f"OTP generated and logged to console for testing."
        }
