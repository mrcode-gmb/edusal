"""Secure email one-time-password (OTP) flow for staff/admin sign-in."""

import secrets

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from nexus.institutions.models import LoginOTP

OTP_LIFETIME_SECONDS = 300
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN_SECONDS = 30


def _generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    if not local:
        return email
    if len(local) <= 2:
        visible = local[:1]
    else:
        visible = f"{local[:2]}"
    masked_local = visible + "*" * max(len(local) - len(visible), 0)
    return f"{masked_local}@{domain}"


def send_otp_email(user, code: str) -> bool:
    subject = "Your secure sign-in code"
    recipient = user.email
    from_email = settings.DEFAULT_FROM_EMAIL
    minutes = OTP_LIFETIME_SECONDS // 60
    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#F4F7F5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7F5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background-color:#146B4A;padding:22px 32px;">
            <span style="color:#ffffff;font-size:18px;font-weight:bold;">Nexus Edutech Consult Ltd</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#10251C;font-size:20px;">Your secure sign-in code</h2>
            <p style="margin:0 0 20px;color:#5B6B64;font-size:14px;line-height:1.6;">
              Hello {user.name or user.email},<br/>
              Use the code below to finish signing in to your account. It expires in
              <strong>{minutes} minutes</strong>.
            </p>
            <div style="background:#F4F7F5;border:1px solid #E6EBE8;border-radius:12px;padding:18px;text-align:center;">
              <span style="font-size:34px;font-weight:bold;letter-spacing:10px;color:#146B4A;">{code}</span>
            </div>
            <p style="margin:20px 0 0;color:#5B6B64;font-size:12px;line-height:1.6;">
              If you didn't try to sign in, you can safely ignore this email. Never share this code
              with anyone, even if they say they work for Nexus.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#E6F2EC;padding:14px 32px;color:#146B4A;font-size:11px;">
            &copy; {timezone.now().year} Nexus Edutech Consult Ltd. Secure access.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""
    try:
        send_mail(
            subject=subject,
            message=(
                f"Your Nexus secure sign-in code is {code}. "
                f"It expires in {minutes} minutes. If you didn't try to sign in, "
                "you can safely ignore this email."
            ),
            html_message=html,
            from_email=from_email,
            recipient_list=[recipient],
            fail_silently=False,
        )
        return True
    except Exception:
        return False


def invalidate_previous_otps(user) -> None:
    LoginOTP.objects.filter(user=user, used=False).update(used=True)


def create_otp(user) -> LoginOTP:
    invalidate_previous_otps(user)
    otp = LoginOTP.objects.create(
        user=user,
        code=_generate_code(),
        expires_at=timezone.now() + timezone.timedelta(seconds=OTP_LIFETIME_SECONDS),
    )
    return otp


def issue_login_otp(user) -> LoginOTP | None:
    """Create an OTP, email it, and return the record (None if email failed)."""
    otp = create_otp(user)
    if not send_otp_email(user, otp.code):
        return None
    return otp


def verify_login_otp(email: str, code: str):
    """Validate a submitted code.

    Returns a tuple (otp, error) where otp is the verified record on success.
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()
    try:
        user = User.objects.get(email__iexact=email.strip())
    except User.DoesNotExist:
        return None, "We couldn't verify that code. Please try again."

    otp = LoginOTP.objects.filter(user=user, used=False).order_by("-created_at").first()
    if not otp:
        return None, "No sign-in code was requested for this account."

    if otp.attempts >= OTP_MAX_ATTEMPTS:
        otp.used = True
        otp.save(update_fields=["used"])
        return None, "Too many wrong attempts. Please request a new code."

    if otp.is_expired:
        otp.used = True
        otp.save(update_fields=["used"])
        return None, "That code has expired. Please request a new one."

    if not secrets.compare_digest(otp.code, code.strip()):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        remaining = OTP_MAX_ATTEMPTS - otp.attempts
        if remaining <= 0:
            otp.used = True
            otp.save(update_fields=["used"])
            return None, "Too many wrong attempts. Please request a new code."
        return None, f"That code isn't right. You have {remaining} attempt(s) left."

    otp.used = True
    otp.save(update_fields=["used"])
    return otp, None


def resend_login_otp(email: str):
    """Resend a code respecting a short cooldown.

    Returns (otp, error, resend_after).
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()
    try:
        user = User.objects.get(email__iexact=email.strip())
    except User.DoesNotExist:
        return None, "We couldn't find an account with that email.", OTP_RESEND_COOLDOWN_SECONDS

    latest = LoginOTP.objects.filter(user=user, used=False).order_by("-created_at").first()
    if latest:
        elapsed = (timezone.now() - latest.created_at).total_seconds()
        if elapsed < OTP_RESEND_COOLDOWN_SECONDS:
            wait = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed) + 1
            return None, f"Please wait a moment before requesting another code.", wait

    otp = issue_login_otp(user)
    if otp is None:
        return None, "We couldn't send the code right now. Please try again in a moment.", OTP_RESEND_COOLDOWN_SECONDS
    return otp, None, OTP_RESEND_COOLDOWN_SECONDS