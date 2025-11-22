import base64
import requests
import json
from django.conf import settings
from datetime import datetime

# --- Helper Functions ---

def get_access_token():
    """Generates the OAuth Access Token for M-Pesa API authentication."""
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    auth_string = f"{consumer_key}:{consumer_secret}"
    
    # Base64 encode the credentials
    encoded_auth = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
    
    headers = {
        'Authorization': f'Basic {encoded_auth}',
        'Content-Type': 'application/json'
    }

    try:
        # Use the specific Vodacom Token URL
        response = requests.get(
            settings.MPESA_API_TOKEN_URL, 
            headers=headers, 
            params={'grant_type': 'client_credentials'}
        )
        response.raise_for_status()
        return response.json().get('access_token')
    except requests.exceptions.RequestException as e:
        print(f"Error getting M-Pesa Access Token: {e}")
        return None

# --- Main Push Function ---

def initiate_ussd_push(phone_number=255746297197, amount=1000, reference_id=''):
    """
    Sends the request to the M-Pesa C2B Push endpoint.
    phone_number should be in format 2557XXXXXXXX.
    """
    token = get_access_token()
    if not token:
        return False, "Failed to get API access token."

    # M-Pesa C2B Push API requires specific formatting/parameters.
    # The parameters below are typical for M-Pesa STK/C2B push.
    # *** YOU MUST VERIFY THESE AGAINST VODACOM TANZANIA'S OFFICIAL DOCS ***
    
    payload = {
        "ShortCode": settings.MPESA_SHORTCODE,
        "CommandID": "CustomerPayBillOnline", # Example command
        "Amount": amount,
        "Msisdn": phone_number,
        "BillRefNumber": reference_id,  # A unique reference for your system
        "CallbackURL": settings.CALLBACK_URL,
        "TransactionDesc": "Payment for order " + reference_id
    }

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(
            settings.MPESA_API_INITIATE_URL, 
            headers=headers, 
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        # Check the response for successful push initiation (not payment success)
        result = response.json()
        if result.get('ResponseCode') == '000000': 
            return True, "USSD Push initiated successfully."
        else:
            return False, f"M-Pesa API error: {result.get('ResponseDescription', 'Unknown error')}"

    except requests.exceptions.RequestException as e:
        return False, f"Network/Request error: {e}"
    except json.JSONDecodeError:
        return False, "Invalid response from M-Pesa API."
