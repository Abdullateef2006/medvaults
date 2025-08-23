from django.urls import path
from .views  import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('', index, name='index'),
    path('home/', Home.as_view()),
    path('authentication/register/', RegisterView.as_view(), name='register'),
    path('authentication/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('emergency/<uuid:token>/', emergency_profile_view, name='emergency-profile'),
    path('api/emergency-profile/', EmergencyProfileView.as_view(), name='emergency-profile-api'),
    path('api/get-qrcode/', QRCodeView.as_view(), name='get-qrcode'),
    path('scan-food/', FoodAllergyScanView.as_view(), name='scan-food'),
    path("wallet/wallet/", CreateWalletView.as_view(), name="create_wallet" ),
    path("wallet/deposit_money/", CreateTransactionView.as_view(), name="deposit_money"),
    path("wallet/transactions_list/", TransactionListView.as_view(), name="transaction_list"),
    path("wallet/withdraw_money/", WithdrawMoneyView.as_view(), name="witdraw_money"),
    path("wallet/your_balance/", GetUserBalance.as_view(), name="get_balance"),
    path("your_scan_history/", FoodAllergyScanListView.as_view(), name="scan_history"),
    path('verify-payment/', verify_payment, name='verify_payment'),  # Add this line
    # path("your_scan_history/", FoodAllergyScanListView.as_view(), name="scan_history"),
    path("send_message/", SendmessageToContact.as_view(), name="send_message"),
    path("get_user_info/", UserBasicInfo.as_view(), name="get_user_info"),
    path("hospital/change_status_to_hospital/", ChangeStatustoHospital.as_view(), name="change_status_to_hospital"),
    path("hospital/verify_hospital/", Verifyhospital.as_view(), name="verify_hospital"),
    path("hospital/verified_hospitals/", GetVerifiedHospitals.as_view(), name="verified_hospitals"),
    path('qr/activate/', ActivateQRCodeView.as_view()),
    path('emergency/<uuid:token>/', QRCodeStatusPublicView.as_view()),  
    path("generate_health_tip", GenerateHealthTipsAPIView.as_view() )



    




]


