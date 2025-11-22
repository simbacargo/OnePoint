# views.py (using Django Rest Framework)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .mpesa_service import initiate_ussd_push
import json

# --- 1. Endpoint to Initiate Payment (Called by React Native) ---

class InitiateMpesaPaymentView(APIView):
    """
    Receives payment request from React Native, calls M-Pesa API to initiate USSD Push.
    """
    def post(self, request):
        phone_number = request.data.get('phone_number')
        amount = request.data.get('amount')
        order_id = request.data.get('order_id') # Your unique system ID
        
        # Basic validation
        if not all([phone_number, amount, order_id]):
            return Response({"error": "Missing phone_number, amount, or order_id."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Format phone number to M-Pesa's required format (e.g., 2557XXXXXXXX)
        # Add your actual formatting logic here
        formatted_phone = phone_number 

        # Call the M-Pesa service function
        success, message = initiate_ussd_push(formatted_phone, amount, str(order_id))
        
        if success:
            # Payment push request was ACCEPTED by M-Pesa
            return Response({"status": "PENDING", "message": "USSD Push sent. Waiting for PIN confirmation."}, 
                            status=status.HTTP_202_ACCEPTED)
        else:
            # M-Pesa API returned an error upon initiation
            return Response({"status": "FAILED", "error": message}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- 2. Endpoint for M-Pesa Callback (Webhook) ---

class MpesaCallbackView(APIView):
    """
    Receives final transaction status from Vodacom M-Pesa API (The Webhook).
    """
    def post(self, request):
        # M-Pesa typically sends a JSON payload. The structure varies.
        try:
            callback_data = request.data 
            
            # ** Important: Log the incoming data for debugging **
            # print(json.dumps(callback_data, indent=4)) 
            
            # --- Extract Key Data (Adapt to Vodacom Tanzania's response structure) ---
            transaction_status = callback_data.get('TransactionStatus')
            reference_id = callback_data.get('BillRefNumber')
            mpesa_receipt = callback_data.get('MPesaReceiptNumber')
            
            if transaction_status == 'Completed':
                # Update your database: Mark Order as Paid
                # E.g., Order.objects.filter(id=reference_id).update(status='COMPLETED', receipt=mpesa_receipt)
                
                # You might also send a real-time notification (WebSocket/FCM) to the React Native app
                pass

            else:
                # Payment failed or was canceled
                # E.g., Order.objects.filter(id=reference_id).update(status='FAILED')
                pass
                
            # M-Pesa requires a specific, immediate acknowledgment response.
            return Response({"ResultCode": 0, "ResultDesc": "C2B Payment Received"}, 
                            status=status.HTTP_200_OK)

        except Exception as e:
            # Log the error but still return 200 OK to M-Pesa to prevent retries
            print(f"Error processing M-Pesa callback: {e}")
            return Response({"ResultCode": 0, "ResultDesc": "C2B Payment Received (Processed with local error)"}, 
                            status=status.HTTP_200_OK)