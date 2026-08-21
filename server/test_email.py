import os
import django
from django.core.mail import send_mail

# Set up Django environment manually
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medvault.settings")
django.setup()

from django.conf import settings

def test_email():
    print("Attempting to send test email...")
    try:
        send_mail(
            subject="MedVault Email Test",
            message="This is a test email to verify SMTP configuration.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=["ojugbelelateef2006@gmail.com"],
            fail_silently=False,
        )
        print("SUCCESS! Email sent.")
    except Exception as e:
        print("FAILED to send email. Error:", str(e))

if __name__ == "__main__":
    test_email()
