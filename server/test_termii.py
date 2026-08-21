import requests
import json

def test_termii_sms(api_key, phone_number, message):
    """
    Test sending an SMS using the Termii API.
    
    1. Create a free account at https://termii.com/
    2. Go to your Dashboard -> Settings -> API Token to get your API Key.
    3. Replace 'api_key' below with your actual key.
    """
    
    url = "https://v4.api.termii.com/api/sms/send"
    
    # Payload for the POST request
    payload = {
        "to": phone_number,
        "from": "Secure",  # 'Secure', 'N-Alert', or 'Termii'
        "sms": message,
        "type": "plain",
        "channel": "dnd",  # 'dnd' ensures the message bypasses Do-Not-Disturb restrictions in Nigeria
        "api_key": api_key
    }
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    print(f"Sending test SMS via Termii to {phone_number}...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        # Termii returns message_id on success
        if response.status_code == 200 and 'message_id' in response_data:
            print("SUCCESS! SMS sent.")
            print("Response:", json.dumps(response_data, indent=2))
        else:
            print("FAILED to send SMS.")
            print("Response:", json.dumps(response_data, indent=2))
            
    except Exception as e:
        print("Error connecting to Termii API:", str(e))

if __name__ == "__main__":
    MY_API_KEY = "tlv_Fd6ZavD4rjG8sP5owCzrPkyHHH_YC6Q_NSQ2QDlYNBk"
    
    # Phone number must be in international format without the '+' sign (e.g., 2348012345678)
    TEST_PHONE_NUMBER = "2349060912363" 
    
    TEST_MESSAGE = "EMERGENCY: This is a test alert from MedVault. My location: https://maps.google.com/?q=6.5244,3.3792"
    
    if MY_API_KEY == "YOUR_TERMII_API_KEY_HERE":
        print("Please replace YOUR_TERMII_API_KEY_HERE with your real Termii API key before running.")
    else:
        test_termii_sms(MY_API_KEY, TEST_PHONE_NUMBER, TEST_MESSAGE)
