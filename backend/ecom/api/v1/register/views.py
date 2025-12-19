# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# import razorpay
# from django.conf import settings
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.permissions import IsAuthenticated,AllowAny
# from django.utils import timezone
# from datetime import timedelta
# from django.contrib.auth.models import User
# from django.core.mail import send_mail
# from django.conf import settings
# from register.models import EmailOTP
# from .serializers import SignupSerializer, LoginSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer,SignupOTPVerificationSerializer


# class SignupRequestView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         serializer = SignupSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             otp_obj, _ = EmailOTP.objects.get_or_create(email=email)
#             otp = otp_obj.generate_otp()

#             # Save pending signup data
#             otp_obj.username = serializer.validated_data['username']
#             otp_obj.name = serializer.validated_data['first_name']
#             otp_obj.password = serializer.validated_data['password']
#             otp_obj.save()

#             try:
#                 send_mail(
#                     subject="Signup OTP",
#                     message=f"Your Signup OTP is {otp}",
#                     from_email=settings.DEFAULT_FROM_EMAIL,
#                     recipient_list=[email],
#                     fail_silently=False,
#                 )
#             except Exception as e:
#                 return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

#             return Response({"message": "OTP sent. Please verify to complete signup."}, status=200)

#         return Response(serializer.errors, status=400)



# class SignupView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         serializer = SignupOTPVerificationSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             otp = serializer.validated_data['otp']

#             try:
#                 otp_obj = EmailOTP.objects.get(email=email)
#             except EmailOTP.DoesNotExist:
#                 return Response({"error": "OTP not requested for this email"}, status=400)

#             if otp_obj.otp != otp:
#                 return Response({"error": "Invalid OTP"}, status=400)

#             if User.objects.filter(email=email).exists():
#                 return Response({"error": "User already exists"}, status=400)

#             # Use old SignupSerializer to create user
#             user_serializer = SignupSerializer(data={
#                 'username': otp_obj.username,
#                 'first_name': otp_obj.name,
#                 'email': email,
#                 'password': otp_obj.password
#             })
#             if user_serializer.is_valid():
#                 user_serializer.save()
#                 otp_obj.delete()
#                 refresh = RefreshToken.for_user(User.objects.get(email=email))
#                 return Response({
#                     "message": "Signup successful! Please login.",
#                     "data": {
#                         "username": otp_obj.username,
#                         "email": email,
#                         "access": str(refresh.access_token),
#                         "refresh": str(refresh),
#                     }
#                 }, status=201)
#             return Response(user_serializer.errors, status=400)

#         return Response(serializer.errors, status=400)

    

# class SignupOTPResendView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         email = request.data.get("email")
#         if not email:
#             return Response({"error": "Email is required"}, status=400)

#         try:
#             otp_obj = EmailOTP.objects.get(email=email)
#         except EmailOTP.DoesNotExist:
#             return Response({"error": "No pending signup for this email"}, status=404)

#         # Optional: enforce cooldown
#         if otp_obj.last_sent and timezone.now() - otp_obj.last_sent < timedelta(seconds=30):
#             remaining = 30 - (timezone.now() - otp_obj.last_sent).seconds
#             return Response({"error": f"Please wait {remaining}s before resending OTP"}, status=400)

#         otp = otp_obj.generate_otp()
#         try:
#             send_mail(
#                 subject="Resended Signup OTP",
#                 message=f"Your Signup OTP is {otp}",
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[email],
#                 fail_silently=False,
#             )
#         except Exception as e:
#             return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

#         return Response({"message": "OTP resent successfully"}, status=200)



# class LoginView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             password = serializer.validated_data['password']
#             try:
#                 user = User.objects.get(email=email)
#                 if user.check_password(password):
#                     refresh = RefreshToken.for_user(user)
#                     return Response({
#                         "status_code": 6000,
#                         "message": "Login successful",
#                         "data": {
#                             "user_id": user.id,
#                             "username": user.username,
#                             "email": user.email,
#                             "access": str(refresh.access_token),
#                             "refresh": str(refresh)
#                         }
#                     })
#                 else:
#                     raise Exception()
#             except:
#                 return Response({"status_code": 6001, "error": "Invalid credentials"},
#                                 status=status.HTTP_401_UNAUTHORIZED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# class LoginOTPRequestView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         email = request.data.get("email")
#         if not email:
#             return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

#         if not User.objects.filter(email=email).exists():
#             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         otp_obj, created = EmailOTP.objects.get_or_create(email=email)

#         # ✅ check cooldown
#         if not created and otp_obj.last_sent and timezone.now() - otp_obj.last_sent < timedelta(seconds=30):
#             remaining = 30 - (timezone.now() - otp_obj.last_sent).seconds
#             return Response({"error": f"Please wait {remaining} seconds before resending OTP"}, status=400)

#         otp = otp_obj.generate_otp()

#         try:
#             send_mail(
#                 subject="Login OTP",
#                 message=f"Your Login OTP is {otp}",
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[email],
#                 fail_silently=False,
#             )
#         except Exception as e:
#             return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

#         return Response({"message": "OTP sent successfully"}, status=200)


# class LoginOTPVerificationView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         email = request.data.get("email")
#         entered_otp = request.data.get("otp")
#         if not email or not entered_otp:
#             return Response({"error": "Email and OTP are required"}, status=400)

#         try:
#             otp_obj = EmailOTP.objects.get(email=email)
#         except EmailOTP.DoesNotExist:
#             return Response({"error": "OTP not requested for this email"}, status=400)

#         if otp_obj.otp == entered_otp:
#             otp_obj.validated = True
#             otp_obj.save()
#             try:
#                 user = User.objects.get(email=email)
#             except User.DoesNotExist:
#                 return Response({"error": "User not found"}, status=404)
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 "message": "OTP verified successfully",
#                 "data": {
#                     "access": str(refresh.access_token),
#                     "refresh": str(refresh),
#                 }
#             })
#         return Response({"error": "Invalid OTP"}, status=400)



# class PasswordResetOTPRequestView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         serializer = PasswordResetRequestSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             try:
#                 user = User.objects.get(email=email)
#             except User.DoesNotExist:
#                 return Response({"error": "User not found"}, status=404)

#             otp_obj, _ = EmailOTP.objects.get_or_create(email=email)
#             otp = otp_obj.generate_otp()

#             try:
#                 send_mail(
#                     subject="Password Reset OTP",
#                     message=f"Your password reset OTP is {otp}",
#                     from_email=settings.DEFAULT_FROM_EMAIL,
#                     recipient_list=[email],
#                     fail_silently=False,
#                 )
#             except Exception as e:
#                 return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

#             return Response({"message": "Password reset OTP sent to email"})
#         return Response(serializer.errors, status=400)


# class PasswordResetConfirmView(APIView):
#     permission_classes =[AllowAny]
#     authentication_classes= []
#     def post(self, request):
#         serializer = PasswordResetConfirmSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             otp = serializer.validated_data['otp']
#             new_password = serializer.validated_data['new_password']

#             try:
#                 otp_obj = EmailOTP.objects.get(email=email)
#             except EmailOTP.DoesNotExist:
#                 return Response({"error": "OTP not requested for this email"}, status=400)

#             # Validate OTP
#             if otp_obj.otp != otp:
#                 return Response({"error": "Invalid OTP"}, status=400)

#             try:
#                 user = User.objects.get(email=email)
#             except User.DoesNotExist:
#                 return Response({"error": "User not found"}, status=404)

#             # Reset password
#             user.set_password(new_password)
#             user.save()

#             # Invalidate OTP after success
#             otp_obj.delete()

#             return Response({"message": "Password reset successful"})
#         return Response(serializer.errors, status=400)
    



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from .serializers import EmailAuthSerializer


class EmailAuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = EmailAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        base_username = email.split("@")[0]
        username = base_username

        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1


        try:
            user = User.objects.get(email=email)

            # 🔐 Login flow
            if not user.check_password(password):
                return Response(
                    {"error": "Invalid password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            is_new_user = False

        except User.DoesNotExist:
            # 🆕 Signup flow
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            is_new_user = True

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Signup successful" if is_new_user else "Login successful",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        }, status=status.HTTP_200_OK)

