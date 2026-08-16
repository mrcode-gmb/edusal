import logging
import secrets
import string
from typing import Optional
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction

from edusal.institutions.models import StudentProfile

logger = logging.getLogger(__name__)


class StudentCredentialService:
    """Service for generating student access credentials and dispatching welcome emails via SMTP / Mailpit."""

    @classmethod
    def generate_random_password(cls, length: int = 10) -> str:
        """Generates a secure, readable temporary password."""
        chars = string.ascii_letters + string.digits + "!@#$"
        # Ensure at least one uppercase, lowercase, digit, and special char
        pwd = [
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.digits),
            secrets.choice("!@#$"),
        ]
        pwd += [secrets.choice(chars) for _ in range(length - 4)]
        secrets.SystemRandom().shuffle(pwd)
        return "EduSal-" + "".join(pwd)

    @classmethod
    def generate_and_dispatch_credentials(
        cls,
        student_profile_id: str,
        custom_password: Optional[str] = None,
        login_url: Optional[str] = "http://localhost:5173",
    ) -> dict:
        """
        Sets a new password on the student's User account and sends a formatted
        HTML & plain-text email with login credentials via SMTP / Mailpit.
        """
        with transaction.atomic():
            student = (
                StudentProfile.objects.select_related("user", "institution", "program", "program__department")
                .get(id=student_profile_id)
            )
            user = student.user

            plain_password = custom_password.strip() if custom_password and custom_password.strip() else cls.generate_random_password()

            user.set_password(plain_password)
            user.save(update_fields=["password"])

            student_name = user.name or user.email
            email = user.email
            matric = student.matric_number
            prog_name = student.program.name
            inst_name = student.institution.name
            level_label = student.get_level_display()

            # Construct Email Content
            subject = f"Your Student Portal Login Credentials — {inst_name}"
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", f"no-reply@{student.institution.slug}.edusal.ng")

            text_content = f"""
Welcome to EduSal Institutional Portal, {student_name}!

Your student account for {inst_name} has been activated.

--- ACCOUNT CREDENTIALS ---
Institution: {inst_name}
Programme: {prog_name} ({level_label})
Matriculation No: {matric}
Portal Username: {email}
Temporary Password: {plain_password}
Portal Login URL: {login_url}

--- NEXT STEPS ---
1. Log in to your student dashboard at: {login_url}
2. Review your progressive Career Pathway milestones (100L through final year).
3. Submit repository URLs, live project links, and SIWES clearance evidence to accumulate accredited Employability Points.

If you have questions, please contact your Departmental Counsellor or HOD.
            """.strip()

            html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }}
    .email-container {{ max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }}
    .email-header {{ background-color: #0284c7; padding: 24px 32px; color: #ffffff; }}
    .email-header h1 {{ margin: 0; font-size: 20px; font-weight: 800; }}
    .email-header p {{ margin: 4px 0 0 0; font-size: 13px; color: #e0f2fe; }}
    .email-body {{ padding: 32px; }}
    .cred-box {{ background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 18px 20px; margin: 20px 0; }}
    .cred-row {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; }}
    .cred-row:last-child {{ margin-bottom: 0; }}
    .cred-label {{ color: #64748b; font-weight: 600; }}
    .cred-val {{ color: #0f172a; font-weight: 700; font-family: monospace; }}
    .pwd-val {{ color: #0284c7; font-size: 15px; font-weight: 800; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px dashed #0284c7; }}
    .btn-login {{ display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; margin: 16px 0; }}
    .email-footer {{ background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #64748b; text-align: center; }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>EduSal Student Portal</h1>
      <p>{inst_name}</p>
    </div>
    <div class="email-body">
      <h2 style="margin-top:0; font-size:18px; color:#0f172a;">Welcome, {student_name}</h2>
      <p style="font-size:14px; line-height:1.5; color:#334155;">
        Your student portal account has been configured by the Directorate of Academic Planning & Career Services. You may now log in to track your career pathway milestones, submit technical evidence, and accumulate accredited employability points.
      </p>

      <div class="cred-box">
        <div class="cred-row"><span class="cred-label">Matriculation No:</span> <span class="cred-val">{matric}</span></div>
        <div class="cred-row"><span class="cred-label">Degree Programme:</span> <span class="cred-val">{prog_name}</span></div>
        <div class="cred-row"><span class="cred-label">Academic Level:</span> <span class="cred-val">{level_label}</span></div>
        <div class="cred-row"><span class="cred-label">Login Email:</span> <span class="cred-val">{email}</span></div>
        <div class="cred-row"><span class="cred-label">Temporary Password:</span> <span class="pwd-val">{plain_password}</span></div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="{login_url}" class="btn-login">Log In to Student Portal</a>
      </div>

      <p style="font-size:12.5px; color:#64748b; line-height:1.5;">
        Please change your password upon your initial sign-in. For technical assistance or milestone rubric inquiries, consult your assigned departmental adviser or HOD.
      </p>
    </div>
    <div class="email-footer">
      EduSal Tertiary Career Governance Platform · {inst_name}
    </div>
  </div>
</body>
</html>
            """.strip()

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[email],
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)

            logger.info(f"Successfully generated credentials and dispatched welcome email to {email} ({matric}).")

            return {
                "student_id": str(student.id),
                "matric_number": matric,
                "email": email,
                "plain_password": plain_password,
                "email_sent": True,
                "recipient": email,
            }
