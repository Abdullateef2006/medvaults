from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from django.contrib.auth import get_user_model
from django.shortcuts import render, get_object_or_404
from .models import *
from drf_spectacular.utils import extend_schema
from django.views.decorators.csrf import csrf_exempt
import requests
import nyckel
import inflect
import nyckel
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse
# from django.contrib.gis.geos import Point
# from django.contrib.gis.db.models.functions import Distance


User = get_user_model()


def index(request):
    return render(request, 'medvaultapp/index.html')




class Home(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)
    



class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from .models import QRCode

def emergency_profile_view(request, token):
    qrcode = get_object_or_404(QRCode, qr_token=token)

    if qrcode.is_expired():
        return render(request, 'medvaultapp/inactive.html', status=403)  # 🚫 Inactive page

    profile = qrcode.profile

    context = {
        "profile" : profile
    }

    return render(request, 'medvaultapp/emergency_profile.html', context)


class EmergencyProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = EmergencyProfileSerializer


    def get(self, request):
        try:
            profile = request.user.emergencyprofile
            # userprofile = EmergencyProfile.objects.get(user = request.user)
            serializer = self.serializer_class(profile)
            return Response(serializer.data)
        except EmergencyProfile.DoesNotExist:
            return Response({"detail": "No profile found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            profile = request.user.emergencyprofile
            serializer = self.serializer_class(profile, data=request.data, partial=True)
        except EmergencyProfile.DoesNotExist:
            serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            profile = serializer.save(user=request.user)
            return Response(self.serializer_class(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# class QRCodeView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             profile = request.user.emergencyprofile
#             qrcode = profile.qrcode
#             if not qrcode.qr_image:
#                 qrcode.save()  # triggers `generate_qr()` in model

#             return Response({
#                 "qr_token": str(qrcode.qr_token),
#                 "qr_image_url": request.build_absolute_uri(qrcode.qr_image.url)
#             }, status=status.HTTP_200_OK)

#         except EmergencyProfile.DoesNotExist:
#             return Response({"detail": "No emergency profile found."}, status=status.HTTP_404_NOT_FOUND)
#         except QRCode.DoesNotExist:
#             return Response({"detail": "QR code not found."}, status=status.HTTP_404_NOT_FOUND)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from .models import QRCode

class QRCodeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.emergencyprofile
            qrcode = profile.qrcode
            if not qrcode.qr_image:
                qrcode.save()

            return Response({
                "qr_token": str(qrcode.qr_token),
                "qr_image_url": request.build_absolute_uri(qrcode.qr_image.url),
                "is_active": qrcode.is_active,
                "expires_in_minutes": (60 - int((timezone.now() - qrcode.activated_at).total_seconds() // 60)) if qrcode.is_active else None
            }, status=status.HTTP_200_OK)

        except EmergencyProfile.DoesNotExist:
            return Response({"detail": "No emergency profile found."}, status=status.HTTP_404_NOT_FOUND)

# # 🎯 This endpoint is accessed via the QR link itself
# class QRCodeStatusPublicView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request, token):
#         qrcode = get_object_or_404(QRCode, qr_token=token)
#         if qrcode.is_expired():
#             return Response({"detail": "QR code is inactive or expired."}, status=status.HTTP_403_FORBIDDEN)

#         return Response({
#             "status": "active",
#             "profile_id": qrcode.profile.id,
#             "message": "QR code is valid and active."
#         }, status=status.HTTP_200_OK)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import QRCode

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import QRCode

class QRCodeStatusPublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            qrcode = get_object_or_404(QRCode, qr_token=token)

            # ❗ Block access if expired or inactive
            if qrcode.is_expired():
                return Response({
                    "detail": "QR code is inactive or expired."
                }, status=status.HTTP_403_FORBIDDEN)

            # ✅ Only return a message if valid
            return Response({
                "status": "active",
                "message": "QR code is valid."
            }, status=status.HTTP_200_OK)

        except QRCode.DoesNotExist:
            return Response({
                "detail": "QR code not found."
            }, status=status.HTTP_404_NOT_FOUND)


# Endpoint to activate QR manually (e.g. in app)
class ActivateQRCodeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.emergencyprofile
            qrcode = profile.qrcode
            qrcode.activate()
            return Response({"detail": "QR code activated for 1 hour."}, status=status.HTTP_200_OK)
        except EmergencyProfile.DoesNotExist:
            return Response({"detail": "No emergency profile found."}, status=status.HTTP_404_NOT_FOUND)




p = inflect.engine()  # For plural/singular conversion

class FoodAllergyScanView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = FoodAllergyScanSerializer

    def post(self, request):
        serializer = FoodAllergyScanSerializer(data=request.data)
        if serializer.is_valid():
            scan = serializer.save(user=request.user)

            credentials = nyckel.Credentials(
                "83qxpxmije8qtyh44rdjz7u7wxutzau3",
                "9c7kedxfim5s366l87wpqb219j1s2ti9k4hhrxpquy0d214pq9krd4dx95avb4cp"
            )

            try:
                # Determine food name and allergen
                if scan.food_image:
                    image_url = scan.food_image.url
                    image_result = nyckel.invoke("meals-identifier", image_url, credentials)
                    food_name = image_result["labelName"]
                    
                    # Get allergen from Nyckel for image
                    result = nyckel.invoke("food-allergens", food_name, credentials)
                    detected_allergen = result["labelName"].strip().lower()
                    confidence = result["confidence"]
                elif scan.food_name:
                    food_name = scan.food_name
                    
                    # Get allergen from Gemini for text input
                    import requests
                    from django.conf import settings
                    gemini_api_key = settings.GEMINI_API_KEY
                    gemini_model = "gemini-3.5-flash-lite"
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_api_key}"
                    
                    prompt = f"Analyze the food item '{food_name}'. What is the primary allergen present? Respond with ONLY the single word for the allergen (e.g. 'peanut', 'dairy', 'gluten'). If there are no common allergens, respond with 'none'."
                    headers = {'Content-Type': 'application/json'}
                    data = {"contents": [{"parts": [{"text": prompt}]}]}
                    
                    resp = None
                    for attempt in range(3):
                        resp = requests.post(url, headers=headers, json=data)
                        if resp.status_code == 200:
                            break
                            
                    if not resp or resp.status_code != 200:
                        raise Exception(f"Gemini API error: {resp.text if resp else 'Unknown'}")
                        
                    resp_data = resp.json()
                    detected_allergen = resp_data['candidates'][0]['content']['parts'][0]['text'].strip().lower()
                    # Remove punctuation if Gemini included any
                    detected_allergen = ''.join(c for c in detected_allergen if c.isalpha())
                    
                    if "none" in detected_allergen:
                        detected_allergen = "none"
                        confidence = 1.0
                    else:
                        confidence = 0.95  # Gemini is generally highly confident; set a fixed confidence for text input

                else:
                    return Response({"error": "Provide either food_name or food_image."}, status=400)

                # Normalize allergen to singular
                singular_allergen = p.singular_noun(detected_allergen) or detected_allergen

                # Get user's known allergies
                try:
                    profile = EmergencyProfile.objects.get(user=request.user)
                    user_allergies = [a.strip().lower() for a in profile.allergies.split(",") if a.strip()]
                    normalized_allergies = [p.singular_noun(a) or a for a in user_allergies]
                except EmergencyProfile.DoesNotExist:
                    return Response({"error": "Emergency profile not found."}, status=404)

                # Match allergens
                if singular_allergen in normalized_allergies:
                    if confidence < 0.45:
                        risk = "low"
                    elif confidence > 0.45 and confidence < 0.7:
                        risk = "medium"
                    else:
                        risk = "high"
                else:
                    risk = f"there are no allergy in {food_name}" 

                # Save info
                scan.food_name = food_name
                scan.detected_allergen = detected_allergen
                scan.confidence = confidence
                scan.risk_level = risk
                scan.save()

                return Response(FoodAllergyScanSerializer(scan).data, status=status.HTTP_201_CREATED)

            except Exception as e:
                scan.delete()
                return Response({"error": str(e)}, status=500)

        return Response(serializer.errors, status=400)



class FoodAllergyScanListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        scans = FoodAllergyScan.objects.filter(user=request.user)
        serializer = FoodAllergyScanSerializer(scans, many=True)
        return Response(serializer.data)
    


# class CreateWalletView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]
#     serializer_class = WalletSerializer

#     def post(self, request):
#         user = request.user
#         if hasattr(user, 'wallet'):
#             return Response({"detail": "Wallet already exists."}, status=status.HTTP_400_BAD_REQUEST)
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             wallet = serializer.save(user=user)
#             return Response(self.serializer_class(wallet).data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CreateWalletView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = WalletSerializer

    def post(self, request):
        user = request.user
        if hasattr(user, 'wallet'):
            return Response({"detail": "Wallet already exists."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            wallet = serializer.save(user=user)
            return Response(self.serializer_class(wallet).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        user = request.user
        wallet = getattr(user, 'wallet', None)
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(wallet)
        return Response(serializer.data, status=status.HTTP_200_OK)


# class CreateTransactionView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]
#     serializer_class = TransactionSerializer

#     def post(self, request):
#         user = request.user
#         wallet = Wallet.objects.filter(user=user).first()
#         if not wallet:
#             return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

#         # Check last deposit (credit) transaction
#         last_deposit = Transaction.objects.filter(wallet=wallet, transaction_type='credit').order_by('-created_at').first()
#         if last_deposit and last_deposit.created_at > timezone.now() - timedelta(weeks=1):
#             return Response(
#                 {"detail": "You can only deposit once a week. Please try again later."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             amount = serializer.validated_data.get('amount', 0)
#             pin = request.data.get('pin', None)
#             if  pin is None:
#                 return Response({"detail": "pin not provided."}, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 if pin != wallet.pin:
#                     return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)
#             wallet.user_balance += amount
#             wallet.save()
#             serializer.save(wallet=wallet, transaction_type='credit')
#             return Response(
#                 {"details": f"You have successfully deposited {amount}. Your balance is {wallet.user_balance}", "transaction": serializer.data},
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_classes = TransactionSerializer

    def get(self, request):
        user = request.user
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

        transactions = Transaction.objects.filter(wallet=wallet)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class WithdrawMoneyView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = TransactionSerializer

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "pin": {"type": "integer", "example":  1234},
                    "amount": {"type": "integer", "example": 500},
                    "bank_name": {"type": "string", "example": "First Bank"},
                    "account_number": {"type": "string", "example": "0123456789"},
                    "account_name": {"type": "string", "example": "John Doe"},
                    "description": {"type": "string", "example": "to pay for medical fee"},

                },
                "required": ["pin", "amount", "bank_name", "account_number", "account_name", "description"]
            },

        }
    )

    def post(self, request):
        user = request.user
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data.get('amount', 0)
            description = serializer.validated_data.get('description', 0)

            pin = request.data.get('pin', None)
            bank_name = request.data.get('bank_name')
            account_number = request.data.get('account_number')
            account_name = request.data.get('account_name')

            # Validate required bank/account fields
            if not all([bank_name, account_number, account_name]):
                return Response(
                    {"detail": "bank_name, account_number, and account_name are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if pin is None or pin != wallet.pin:
                return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)
            if amount > wallet.user_balance:
                return Response({"detail": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

            wallet.user_balance -= amount
            wallet.save()
            serializer.save(
                wallet=wallet,
                transaction_type='debit',
                description = description
        
            )
            return Response({
                "detail": f"You have successfully withdrawn {amount}. Your balance is {wallet.user_balance}. Your transfer is being processed.",
                "transaction": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class GetUserBalance(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = WalletSerializer

    def get(self, request):
        wallet = Wallet.objects.filter(user=request.user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"user_balance": wallet.user_balance}, status=status.HTTP_200_OK)





class CreateTransactionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = TransactionSerializer


    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "pin": {"type": "integer", "example":  1234},
                    "amount": {"type": "integer", "example": 500},
 
                },
                "required": ["pin", "amount"]
            },
      
        }
    )

    def post(self, request):
        user = request.user
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Check weekly deposit limit
        last_deposit = Transaction.objects.filter(
            wallet=wallet, 
            transaction_type='credit',
            status='success'  # Only count successful deposits
        ).order_by('-created_at').first()
        
        if last_deposit and last_deposit.created_at > timezone.now() - timedelta(weeks=1):
            return Response(
                {"detail": "You can only deposit once a week. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        amount = serializer.validated_data.get('amount', 0)
        pin = request.data.get('pin')

        # Validate PIN


        if not pin:
            return Response({"detail": "PIN needed."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if pin != wallet.pin:
                return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize Paystack payment
        paystack_response = self.initialize_paystack_payment(
            email=user.email,
            amount=amount,
            user=user,
            wallet=wallet,
            request=request
        )

        if not paystack_response.get('status'):
            return Response(
                {"detail": "Payment initialization failed", "error": paystack_response.get('message')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save transaction as pending
        transaction = serializer.save(
            wallet=wallet,
            transaction_type='credit',
            status='pending',
            # payment_reference=paystack_response['data']['reference']
        )

        transaction.payment_reference = paystack_response['data']['reference']
        transaction.save()

        return Response({
            "message": "Payment initialized successfully",
            "authorization_url": paystack_response['data']['authorization_url'],
            "transaction": TransactionSerializer(transaction).data
        })

    def initialize_paystack_payment(self, email, amount, user, wallet, request=None):
        """Helper method to initialize Paystack payment"""
        url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        callback_url = request.build_absolute_uri('/verify-payment/') if request else f"{settings.BASE_FRONTEND_URL}verify-payment/"
        payload = {
            "email": email,
            "amount": int(amount * 100),  # Paystack uses kobo
            "reference": f"DEP_{user.id}_{int(timezone.now().timestamp())}",
            "callback_url": callback_url,
            "metadata": {
                "wallet_id": str(wallet.id),
                "user_id": str(user.id)
            }
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}
        


@csrf_exempt
def verify_payment(request):
    # Handle both GET (Paystack callback) and POST (manual verification)
    if request.method in ['GET', 'POST']:
        # Get reference from GET (Paystack) or POST (manual checks)
        reference = request.GET.get('reference') or request.POST.get('reference')
        
        if not reference:
            return JsonResponse(
                {"status": "failed", "message": "Reference missing"},
                status=400
            )
        
        try:
            # Verify with Paystack
            url = f"https://api.paystack.co/transaction/verify/{reference}"
            headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}
            response = requests.get(url, headers=headers)
            data = response.json()

            if data.get('status') and data['data']['status'] == 'success':
                transaction = Transaction.objects.filter(payment_reference=reference).first()
                if transaction:
                    if transaction.status != 'success':
                        transaction.status = 'success'
                        transaction.save()
                        
                        # Update wallet balance
                        wallet = transaction.wallet
                        wallet.user_balance += transaction.amount
                        wallet.save()
                    
                    if request.method == 'GET':
                        return render(request, 'medvaultapp/payment_success.html', {
                            'amount': transaction.amount,
                            'reference': reference
                        })
                    return JsonResponse({"status": "success"})
                else:
                    return JsonResponse(
                        {"status": "failed", "message": "Transaction not found"},
                        status=404
                    )
            else:
                return JsonResponse(
                    {"status": "failed", "message": "Payment verification failed on Paystack"},
                    status=400
                )
            
        except Exception as e:
            return JsonResponse(
                {"status": "failed", "message": str(e)},
                status=500
            )
    
    # If method is neither GET nor POST
    return JsonResponse(
        {"status": "failed", "message": "Method not allowed"},
        status=405
    )



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

from twilio.rest import Client
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from twilio.rest import Client


# from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from math import radians, sin, cos, sqrt, atan2
from twilio.rest import Client

class SendmessageToContact(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate the great-circle distance between two points 
        on the Earth's surface using the Haversine formula.
        Returns distance in kilometers.
        """
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return 6371 * c  # Earth's radius in km

    def format_nigerian_number(self, number):
        """Format Nigerian phone number to international format"""
        number = number.strip()
        if number.startswith("0"):
            return "+234" + number[1:]
        elif number.startswith("+234"):
            return number
        raise ValueError("Invalid Nigerian phone number format")

    def post(self, request):
        coords = request.data.get("location", {})
        lat = coords.get("latitude")
        lng = coords.get("longitude")

        if not lat or not lng:
            return Response({"error": "Location data missing."}, status=400)

        try:
            user_lat = float(lat)
            user_lng = float(lng)
        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates."}, status=400)

        profile = request.user.emergencyprofile
        raw_number = profile.emergency_contact_phone

        try:
            formatted_number = self.format_nigerian_number(raw_number)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        try:
            hospitals = Hospital.objects.filter(
                is_verified=True
            ).exclude(
                latitude__isnull=True
            ).exclude(
                longitude__isnull=True
            )
            hospital_distances = []
            for hospital in hospitals:
                try:
                    hospital_lat = float(hospital.latitude)
                    hospital_lng = float(hospital.longitude)
                    distance = self.haversine_distance(
                        user_lat, user_lng,
                        hospital_lat, hospital_lng
                    )
                    if distance <= 10:  # Only include hospitals within 10km
                        hospital_distances.append({
                            'hospital': hospital,
                            'distance_km': distance
                        })
                except (TypeError, ValueError):
                    continue

            nearest_hospitals = sorted(
                hospital_distances,
                key=lambda x: x['distance_km']
            )[:5]

            hospital_list = [{
                "name": h['hospital'].name,
                "address": h['hospital'].address,
                "phone_number": h['hospital'].phone_number,
                "distance_km": round(h['distance_km'], 2)
            } for h in nearest_hospitals]

        except Exception as e:
            hospital_list = []
            print("Error finding nearest hospitals:", str(e))

        user_name = request.user.first_name or request.user.username
        location_link = f"https://maps.google.com/?q={user_lat},{user_lng}"
        voice_message = (
            f"This is an emergency alert. {user_name} may be in danger. "
            f"The last known location is {location_link}."
        )

        if hospital_list:
            hospital_msg = "\nNearest Hospitals:\n" + "\n".join(
                [f"{i+1}. {h['name']} ({h['address']}) - {h['distance_km']} km {h['phone_number']}" 
                 for i, h in enumerate(hospital_list)]
            )
        else:
            hospital_msg = "\nNo nearby hospitals found within 10km."

        try:
            from django.conf import settings
            account_sid = settings.TWILIO_ACCOUNT_SID
            auth_token = settings.TWILIO_AUTH_TOKEN
            from_phone = settings.TWILIO_PHONE_NUMBER
            
            client = Client(account_sid, auth_token)

            # Send Email
            try:
                from django.core.mail import send_mail
                
                email_subject = f"EMERGENCY ALERT: Immediate Assistance Required for {user_name}"
                email_body = f"Emergency Alert Details:\n\n{voice_message}\n{hospital_msg}"
                
                recipient_list = []
                if request.user.email:
                    recipient_list.append(request.user.email)
                if hasattr(settings, 'ADMIN_EMAIL') and settings.ADMIN_EMAIL:
                    if settings.ADMIN_EMAIL not in recipient_list:
                        recipient_list.append(settings.ADMIN_EMAIL)
                
                if not recipient_list:
                    recipient_list = [settings.DEFAULT_FROM_EMAIL]
                
                send_mail(
                    subject=email_subject,
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_list,
                    fail_silently=False,
                )
                email_status = "Sent successfully"
            except Exception as email_error:
                print("Failed to send email:", email_error)
                email_status = "Failed"

            # Send SMS (wrapped in try/except because Twilio trial accounts often block custom SMS)
            try:
                sms = client.messages.create(
                    to=formatted_number,
                    from_=from_phone,
                    body="sms_appointment_reminders"  # Pre-approved template for Trial Accounts
                )
                sms_sid = sms.sid
            except Exception as sms_error:
                print("Failed to send SMS:", sms_error)
                sms_sid = "Failed (Trial Account Restriction)"

            # Initiate phone call (wrapped in try/except for Trial restrictions)
            try:
                call = client.calls.create(
                    to=formatted_number,
                    from_=from_phone,
                    url="http://demo.twilio.com/docs/voice.xml"  # Generic Twilio voice for trial accounts
                )
                call_sid = call.sid
            except Exception as call_error:
                print("Failed to make call:", call_error)
                call_sid = "Failed (Trial Account Restriction)"


            return Response({
                "message": "Emergency alert initiated. Call and email processed.",
                "sms_sid": sms_sid,
                "call_sid": call_sid,
                "email_status": email_status,
                "nearest_hospitals": hospital_list
            })

        except Exception as e:
            return Response({
                "error": "Failed to send emergency alert",
                "details": str(e)
            }, status=500)



# class SendmessageToContact(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def post(self, request):
#         coords = request.data.get("location", {})
#         lat = coords.get("latitude")
#         lng = coords.get("longitude")

#         if not lat or not lng:
#             return Response({"error": "Location data missing."}, status=400)

#         profile = request.user.emergencyprofile
#         raw_number = profile.emergency_contact_phone

#         def format_nigerian_number(number):
#             number = number.strip()
#             if number.startswith("0"):
#                 return "+234" + number[1:]
#             elif number.startswith("+234"):
#                 return number
#             raise ValueError("Invalid Nigerian phone number format")

#         try:
#             formatted_number = format_nigerian_number(raw_number)
#         except ValueError as e:
#             return Response({"error": str(e)}, status=400)
        




#         account_sid ="AC3cb1d2ef9d9d522a55dd45ca73c28e7a"
#         auth_token = "0a4df1b54a8334818bc79463ddb6031a"
#         client = Client(account_sid, auth_token)
#         print(account_sid)

#         user_name = request.user.first_name or request.user.username
#         location_link = f"https://maps.google.com/?q={lat},{lng}"
#         voice_message = f"This is an emergency alert. {user_name} may be in danger. The last known location is {location_link}."

#         try:
#             call = client.calls.create(
#                 to=formatted_number,
#                 from_='+18787289573',
#                 twiml=f"<Response><Say voice='alice'>{voice_message}</Say></Response>"
#             )

#             sms = client.messages.create(
#                 to=formatted_number,
#                 from_='+18787289573',
#                 body="Emergency Alert:\n" + voice_message
#             )

#             return Response({
#                 "message": "Emergency alert sent.",
#                 # "call_sid": call.sid,
#                 "sms_sid": sms.sid
#             })

#         except Exception as e:
#             return Response({"error": str(e)}, status=500)

class UserBasicInfo(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        data = {
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name
        }
        return Response(data, status=status.HTTP_200_OK)
    





# @csrf_exempt
# def verify_payment(request):
#     if request.method == 'POST':
#         reference = request.POST.get('reference')
        
#         # Verify payment with Paystack
#         url = f"https://api.paystack.co/transaction/verify/{reference}"
#         headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}
        
#         response = requests.get(url, headers=headers)
#         data = response.json()

#         if data['status'] and data['data']['status'] == 'success':
#             # Update transaction and wallet balance
#             transaction = Transaction.objects.get(
#                 payment_reference=reference,
#                 status='pending'
#             )
#             transaction.status = 'success'
#             transaction.save()
            
#             wallet = transaction.wallet
#             wallet.user_balance += transaction.amount
#             wallet.save()
            
#             return JsonResponse({"status": "success"})
        
#         return JsonResponse({"status": "failed"}, status=400)
from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse

class ChangeStatustoHospital(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = HospitalSerializer

    def post(self, request):
        user = request.user
        user.is_hospital = True
        user.save()

        # Prevent duplicate hospital profile for the same user
        if Hospital.objects.filter(user=user).exists():
            return Response(
                {"detail": "Hospital profile already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = HospitalSerializer(data=request.data)
        if serializer.is_valid():
            hospital = serializer.save(user=user)

            # Send email to admin for hospital verification
            admin_email = getattr(settings, 'ADMIN_EMAIL', None)
            if admin_email:
                verify_url = request.build_absolute_uri(
                    reverse('verify_hospital') + f"?hospital_id={hospital.id}"
                )
                subject = "New Hospital Verification Request"
                message = (
                    f"A new hospital has registered and requires verification.\n\n"
                    f"Hospital Name: {hospital.name}\n"
                    f"Registered by: {user.username} ({user.email})\n"
                    f"Please review and verify this hospital in the admin panel.\n\n"
                    f"To verify, click the link below or use hospital_id: {hospital.id}\n"
                    f"{verify_url}"
                )
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [admin_email],
                    fail_silently=True,
                )

            return Response(HospitalSerializer(hospital).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Verifyhospital(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        # Accept hospital_id from POST data or GET param
        hospital_id = request.data.get("hospital_id") or request.GET.get("hospital_id")
        if not hospital_id:
            return Response({"detail": "hospital_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            hospital = Hospital.objects.get(id=hospital_id)
        except Hospital.DoesNotExist:
            return Response({"detail": "Hospital not found."}, status=status.HTTP_404_NOT_FOUND)

        hospital.is_verified = True
        hospital.save()

        # Notify the hospital user via email
        user = hospital.user
        if hasattr(settings, "DEFAULT_FROM_EMAIL"):
            subject = "Hospital Account Verified"
            message = (
                f"Dear {user.username},\n\n"
                f"Your hospital account '{hospital.name}' has been verified by the admin. "
                f"You can now access all hospital features on MedVault+."
            )
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )

        # Notify admin that verification was completed
        admin_email = getattr(settings, 'ADMIN_EMAIL', None)
        if admin_email:
            subject = "Hospital Verification Completed"
            message = (
                f"The hospital '{hospital.name}' (ID: {hospital.id}) registered by {user.username} ({user.email}) "
                f"has been verified by the admin."
            )
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [admin_email],
                fail_silently=True,
            )

        return Response({"detail": "Hospital verified successfully."}, status=status.HTTP_200_OK)



class GetVerifiedHospitals(APIView):
    serializer_classses = HospitalSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]


    def get(self, request):
        hospitals = Hospital.objects.filter(is_verified=True)
        serializer = self.serializer_classses(hospitals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# views.py
import os
from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import EmergencyProfileSerializer

from django.conf import settings
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Initialize OpenAI client
class GenerateHealthTipsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = EmergencyProfileSerializer

    def post(self, request, *args, **kwargs):
        try:
            profile = request.user.emergencyprofile
        except AttributeError:
            return Response(
                {"error": "No emergency profile found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.serializer_class(profile)
        profile_data = "\n".join([f"{k}: {v}" for k, v in serializer.data.items()])

        prompt = f"""
        You are a medical assistant. Generate 3 short, safe, and general health tips 
        for a patient with the following profile:

        {profile_data}

        Make the tips simple, practical, and easy to follow. Return ONLY the tips separated by newlines, with no additional text or markdown formatting.
        """

        try:
            import requests
            gemini_api_key = settings.GEMINI_API_KEY
            gemini_model = "gemini-3.5-flash-lite"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_api_key}"
            
            headers = {'Content-Type': 'application/json'}
            data = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            resp = None
            for attempt in range(3):  # MAX_RETRIES = 2 (so 3 total attempts)
                resp = requests.post(url, headers=headers, json=data)
                if resp.status_code == 200:
                    break
            
            if not resp or resp.status_code != 200:
                raise Exception(f"Gemini API error: {resp.text if resp else 'Unknown'}")
                
            resp_data = resp.json()
            raw_text = resp_data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            tips = [tip.strip(" -•*") for tip in raw_text.split("\n") if tip.strip()]

            return Response(
                {"profile": serializer.data, "tips": tips},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .models import FoodAllergyScan, Transaction

class RecentActivitiesAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        activities = []
        user = request.user

        # Get recent food scans
        scans = FoodAllergyScan.objects.filter(user=user).order_by('-created_at')[:10]
        for scan in scans:
            title = f"Food Scan: {scan.food_name}" if scan.food_name else "Food Scan: Image"
            desc = f"Allergen: {scan.detected_allergen}" if scan.detected_allergen else "No allergens detected"
            color = "#ef4444" if scan.risk_level == "high" else ("#f59e0b" if scan.risk_level == "medium" else "#10b981")
            
            activities.append({
                "id": f"scan_{scan.id}",
                "type": "scan",
                "title": title,
                "description": desc,
                "timestamp": scan.created_at.isoformat(),
                "icon": "qr-code-scanner",
                "color": color
            })

        # Get recent transactions
        try:
            transactions = Transaction.objects.filter(wallet__user=user).order_by('-created_at')[:10]
            for txn in transactions:
                is_credit = txn.transaction_type.lower() == 'credit'
                symbol = "+" if is_credit else "-"
                color = "#10b981" if is_credit else "#ef4444"
                title = "Wallet Deposit" if is_credit else "Wallet Withdrawal"
                
                activities.append({
                    "id": f"txn_{txn.id}",
                    "type": "transaction",
                    "title": title,
                    "description": f"{symbol}₦{txn.amount} - {txn.status}",
                    "timestamp": txn.created_at.isoformat(),
                    "icon": "account-balance-wallet",
                    "color": color
                })
        except Exception:
            pass  # User might not have a wallet yet

        # Sort combined activities by timestamp descending
        activities.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response(activities[:10], status=status.HTTP_200_OK)
