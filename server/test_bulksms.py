import requests
import json

def test_bulksms_nigeria(api_token, phone_number, message):
    """
    Test sending an SMS using BulkSMS Nigeria API.
    
    1. Create an account at https://www.bulksmsnigeria.com/
    2. Get your API Token from the dashboard.
    3. Replace 'api_token' below with your actual token.
    """
    
    url = "https://www.bulksmsnigeria.com/api/v2/sms"
    
    # Payload for the POST request
    payload = {
        "from": "MedVault",  # Sender ID (max 11 characters)
        "to": phone_number,
        "body": message,
        "gateway": "direct-corporate"  # Good for bypassing DND
    }
    
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    print(f"Sending test SMS to {phone_number}...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get('data', {}).get('status') == 'success':
            print("✅ SUCCESS! SMS sent.")
            print("Response:", json.dumps(response_data, indent=2))
        else:
            print("❌ FAILED to send SMS.")
            print("Response:", json.dumps(response_data, indent=2))
            
    except Exception as e:
        print("❌ Error connecting to BulkSMS API:", str(e))

if __name__ == "__main__":
    # TODO: Replace these with your actual details when you create your account tomorrow!
    MY_API_TOKEN = "YOUR_API_TOKEN_HERE"
    TEST_PHONE_NUMBER = "08123456789" # Replace with your real phone number
    TEST_MESSAGE = "🚨 EMERGENCY: This is a test alert from MedVault. My location: https://maps.google.com/?q=6.5244,3.3792"
    
    if MY_API_TOKEN == "YOUR_API_TOKEN_HERE":
        print("Please replace YOUR_API_TOKEN_HERE with your real BulkSMS Nigeria API token before running.")
    else:
        test_bulksms_nigeria(MY_API_TOKEN, TEST_PHONE_NUMBER, TEST_MESSAGE)
