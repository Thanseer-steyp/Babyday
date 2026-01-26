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

