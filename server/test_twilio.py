import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Load environment variables from .env
load_dotenv()

account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
from_phone = os.getenv('TWILIO_PHONE_NUMBER')

# Number to send to (must be verified on Twilio if using a trial account)
to_phone = "+2349060912363" 

print(f"Testing Twilio credentials:")
print(f"SID: {account_sid}")
print(f"From: {from_phone}")
print(f"To: {to_phone}")
print("-" * 30)

try:
    client = Client(account_sid, auth_token)

    # 1. Test SMS
    print("Attempting to send SMS...")
    sms = client.messages.create(
        to=to_phone,
        from_=from_phone,
        body="This is a test message from MedVault Backend."
    )
    print(f"✅ SMS sent successfully! SID: {sms.sid}")

    # 2. Test Call
    print("\nAttempting to make a call...")
    call = client.calls.create(
        to=to_phone,
        from_=from_phone,
        twiml="<Response><Say voice='alice'>This is a test call from MedVault.</Say></Response>"
    )
    print(f"✅ Call initiated successfully! SID: {call.sid}")

except TwilioRestException as e:
    print(f"\n❌ Twilio API Error:")
    print(f"Status HTTP: {e.status}")
    print(f"Error Code: {e.code}")
    print(f"Message: {e.msg}")
except Exception as e:
    print(f"\n❌ Unknown Error:")
    print(str(e))
