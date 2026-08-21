import africastalking

def test_africastalking_sms(api_key, phone_number, message):
    """
    Test sending an SMS using Africa's Talking Sandbox Python SDK.
    """
    
    # Initialize the SDK
    username = "sandbox" 
    africastalking.initialize(username, api_key)
    
    # Get the SMS service
    sms = africastalking.SMS
    
    print(f"Sending test SMS via Africa's Talking Sandbox to {phone_number}...")
    
    try:
        # Send message synchronously
        response = sms.send(message, [phone_number])
        print("SUCCESS! API Response:")
        print(response)
    except Exception as e:
        print("FAILED. Error connecting to Africa's Talking API:", str(e))

if __name__ == "__main__":
    MY_API_KEY = "atsk_840f46a0a830e59239528ab97901586d7d7fa57ddc09dad06037f84809987f93563b9a2d"
    
    # Phone number MUST be in full international format WITH the '+' sign (e.g., +2348012345678)
    TEST_PHONE_NUMBER = "+2349060912363" 
    
    TEST_MESSAGE = "EMERGENCY: This is a test alert from MedVault. My location: https://maps.google.com/?q=6.5244,3.3792"
    
    test_africastalking_sms(MY_API_KEY, TEST_PHONE_NUMBER, TEST_MESSAGE)
