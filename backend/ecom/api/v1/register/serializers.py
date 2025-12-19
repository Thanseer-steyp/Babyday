# from rest_framework import serializers
# from django.contrib.auth.models import User


# class SignupSerializer(serializers.ModelSerializer):
#     email = serializers.EmailField(required=True)

#     class Meta:
#         model = User
#         fields = ['username', 'first_name', 'email', 'password']
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         return User.objects.create_user(**validated_data)
    

# class SignupOTPVerificationSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     otp = serializers.CharField(max_length=6)


# class LoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField()


# class OTPRequestSerializer(serializers.Serializer):
#     email = serializers.EmailField()


# class OTPVerifySerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     otp = serializers.CharField(max_length=6)


# class PasswordResetRequestSerializer(serializers.Serializer):
#     email = serializers.EmailField()


# class PasswordResetConfirmSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     otp = serializers.CharField(max_length=6)
#     new_password = serializers.CharField(write_only=True, min_length=6)



from rest_framework import serializers
from django.contrib.auth.models import User

class EmailAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
